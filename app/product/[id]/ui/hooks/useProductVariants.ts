"use client";

import { useMemo, useState, useEffect } from "react";
import type { ProductVariant, ProductPageModel } from "../ProductClient";

type ProductVariantWithRegion = ProductVariant & {
  isActive?: boolean | null;
  isActiveUZ?: boolean | null;
  isActiveRU?: boolean | null;
};

function groupKey(v: ProductVariant) {
  return (v.group || v.kind || "option").toString();
}

function getVariantPrice(v: ProductVariantWithRegion, currency: "RUB" | "UZS") {
  const raw = currency === "RUB" ? v.priceDeltaRUB : v.priceDeltaUZS;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

function isVariantAvailableForRegion(
  variant: ProductVariantWithRegion,
  currency: "RUB" | "UZS",
) {
  if (variant.isActive === false) return false;

  /**
   * UZ — мягкая логика:
   * старые варианты без isActiveUZ не скрываем,
   * но если явно false — скрываем.
   */
  if (currency === "UZS") {
    if (variant.isActiveUZ === false) return false;

    /**
     * Если у варианта вообще нет цены, не режем его.
     * Это важно для обычных option-вариантов без цены.
     */
    const hasAnyRegionPrice =
      variant.priceDeltaUZS !== undefined ||
      variant.priceDeltaRUB !== undefined;

    if (hasAnyRegionPrice && getVariantPrice(variant, "UZS") <= 0) {
      return false;
    }

    return true;
  }

  /**
   * RU — строгая логика:
   * вариант должен быть явно включен для России.
   */
  if (variant.isActiveRU !== true) return false;

  const hasAnyRegionPrice =
    variant.priceDeltaUZS !== undefined || variant.priceDeltaRUB !== undefined;

  if (hasAnyRegionPrice && getVariantPrice(variant, "RUB") <= 0) {
    return false;
  }

  return true;
}

export function buildVariantKey(selected: Record<string, string>) {
  const keys = Object.keys(selected).sort();

  if (!keys.length) return "base";
  if (keys.length === 1) return selected[keys[0]];

  return keys.map((k) => `${k}:${selected[k]}`).join("__");
}

export function useProductVariants(
  product: ProductPageModel,
  currency: "RUB" | "UZS",
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

  const [selectedByGroup, setSelectedByGroup] = useState<Record<string, string>>(
    defaultSelectedByGroup,
  );

  useEffect(() => {
    setSelectedByGroup(defaultSelectedByGroup);
  }, [product.id, defaultSelectedByGroup]);

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
          ? Number(v.priceDeltaRUB ?? 0) || 0
          : Number(v.priceDeltaUZS ?? 0) || 0;
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