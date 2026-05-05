"use client";

import { useEffect, useMemo, useState } from "react";
import type { ProductPageModel, ProductVariant } from "../ProductClient";

type Currency = "RUB" | "UZS";

type ProductVariantWithRegion = ProductVariant & {
  isActive?: boolean | null;
  isActiveUZ?: boolean | null;
  isActiveRU?: boolean | null;
  isDealerActive?: boolean | null;
  dealerPriceRUB?: number | null;
  dealerPriceUZS?: number | null;
};

function groupKey(v: ProductVariant) {
  return (v.group || v.kind || "option").toString();
}

function getPositiveNumber(v: unknown) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function getVariantPublicPrice(
  v: ProductVariantWithRegion,
  currency: Currency,
) {
  return currency === "RUB"
    ? getPositiveNumber(v.priceDeltaRUB)
    : getPositiveNumber(v.priceDeltaUZS);
}

function variantHasAnyPublicPrice(v: ProductVariantWithRegion) {
  return v.priceDeltaUZS !== undefined || v.priceDeltaRUB !== undefined;
}

function isVariantAvailableForRegion(
  variant: ProductVariantWithRegion,
  currency: Currency,
) {
  if (variant.disabled) return false;
  if (variant.isActive === false) return false;

  const hasPublicPrice = variantHasAnyPublicPrice(variant);

  if (currency === "UZS") {
    if (variant.isActiveUZ === false) return false;

    if (hasPublicPrice && getVariantPublicPrice(variant, "UZS") <= 0) {
      return false;
    }

    return true;
  }

  /**
   * RU:
   * если явно false — скрываем.
   * если поле пустое/undefined — НЕ скрываем автоматически,
   * иначе можно случайно убрать кнопки цвета.
   */
  if (variant.isActiveRU === false) return false;

  if (hasPublicPrice && getVariantPublicPrice(variant, "RUB") <= 0) {
    return false;
  }

  return true;
}

export function buildVariantKey(selected: Record<string, string>) {
  const keys = Object.keys(selected).sort();

  if (!keys.length) return "base";

  return keys
    .map((k) => {
      const value = String(selected[k] ?? "").trim();
      return value ? `${k}:${value}` : "";
    })
    .filter(Boolean)
    .join("|");
}

function makeSelectedSignature(selected: Record<string, string>) {
  return Object.keys(selected)
    .sort()
    .map((key) => `${key}:${selected[key]}`)
    .join("|");
}

export function useProductVariants(
  product: ProductPageModel,
  currency: Currency,
) {
  const variants = useMemo<ProductVariantWithRegion[]>(() => {
    const raw = Array.isArray(product.variants) ? product.variants : [];

    return raw
      .map((variant) => variant as ProductVariantWithRegion)
      .filter((variant) => isVariantAvailableForRegion(variant, currency));
  }, [product.variants, currency]);

  const groups = useMemo(() => {
    const m = new Map<string, ProductVariantWithRegion[]>();

    for (const v of variants) {
      const g = groupKey(v);

      if (!m.has(g)) m.set(g, []);
      m.get(g)!.push(v);
    }

    return m;
  }, [variants]);

  const defaultSelectedByGroup = useMemo(() => {
    const obj: Record<string, string> = {};

    for (const [g, arr] of groups.entries()) {
      const first = arr.find((x) => !x.disabled) ?? arr[0];

      if (first) {
        obj[g] = String(first.id);
      }
    }

    return obj;
  }, [groups]);

  const defaultSelectedSignature = useMemo(
    () => makeSelectedSignature(defaultSelectedByGroup),
    [defaultSelectedByGroup],
  );

  const [selectedByGroup, setSelectedByGroup] = useState<Record<string, string>>(
    defaultSelectedByGroup,
  );

  useEffect(() => {
    setSelectedByGroup(defaultSelectedByGroup);
  }, [product.id, currency, defaultSelectedSignature, defaultSelectedByGroup]);

  useEffect(() => {
    setSelectedByGroup((current) => {
      const next: Record<string, string> = {};

      for (const [group, items] of groups.entries()) {
        const currentId = current[group];

        const stillExists = items.some(
          (item) => String(item.id) === String(currentId),
        );

        if (currentId && stillExists) {
          next[group] = currentId;
          continue;
        }

        const first = items.find((item) => !item.disabled) ?? items[0];

        if (first) {
          next[group] = String(first.id);
        }
      }

      return next;
    });
  }, [groups]);

  const selectedVariantKey = useMemo(
    () => buildVariantKey(selectedByGroup),
    [selectedByGroup],
  );

  const selectedVariants = useMemo(() => {
    const out: ProductVariant[] = [];

    for (const [g, arr] of groups.entries()) {
      const id = selectedByGroup[g];
      const v = arr.find((x) => String(x.id) === String(id)) ?? arr[0];

      if (v) {
        out.push(v);
      }
    }

    return out;
  }, [groups, selectedByGroup]);

  const variantDelta = useMemo(() => {
    let sum = 0;

    for (const v of selectedVariants) {
      sum +=
        currency === "RUB"
          ? getPositiveNumber(v.priceDeltaRUB)
          : getPositiveNumber(v.priceDeltaUZS);
    }

    return sum;
  }, [selectedVariants, currency]);

  const groupsForUI = useMemo(() => {
    const arr = Array.from(groups.entries()).map(([group, items]) => ({
      group,
      items: items as ProductVariant[],
    }));

    /**
     * MIN-base: скрываем механизм полностью.
     */
    const isMinBase = product.id.includes("min-base");

    if (isMinBase) {
      return arr.filter((g) => g.group !== "mechanism");
    }

    return arr;
  }, [groups, product.id]);

  return {
    variants: variants as ProductVariant[],
    groups,
    defaultSelectedByGroup,
    selectedByGroup,
    setSelectedByGroup,
    selectedVariantKey,
    selectedVariants,
    variantDelta,
    groupsForUI,
  };
}