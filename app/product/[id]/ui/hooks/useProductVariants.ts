"use client";

import { useMemo, useState, useEffect } from "react";
import type { ProductVariant, ProductPageModel } from "../ProductClient";

function groupKey(v: ProductVariant) {
  return (v.group || v.kind || "option").toString();
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
  const variants = useMemo<ProductVariant[]>(
    () => (Array.isArray(product.variants) ? product.variants : []),
    [product.variants],
  );

  const groups = useMemo(() => {
    const m = new Map<string, ProductVariant[]>();
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
      if (first) obj[g] = String(first.id);
    }
    return obj;
  }, [groups]);

  const [selectedByGroup, setSelectedByGroup] = useState<Record<string, string>>(
    defaultSelectedByGroup,
  );

  useEffect(() => {
    setSelectedByGroup(defaultSelectedByGroup);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [product.id]);

  const selectedVariantKey = useMemo(
    () => buildVariantKey(selectedByGroup),
    [selectedByGroup],
  );

  const selectedVariants = useMemo(() => {
    const out: ProductVariant[] = [];
    for (const [g, arr] of groups.entries()) {
      const id = selectedByGroup[g];
      const v = arr.find((x) => String(x.id) === String(id)) ?? arr[0];
      if (v) out.push(v);
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
      items,
    }));

    // MIN-base: скрываем механизм полностью
    const isMinBase = product.id.includes("min-base");
    if (isMinBase) return arr.filter((g) => g.group !== "mechanism");

    return arr;
  }, [groups, product.id]);

  return {
    variants,
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
