export type PriceRow = {
  productId: string;
  price_uzs?: number | null;
  old_price_uzs?: number | null;
  price_rub?: number | null;
  old_price_rub?: number | null;
};

function discountPct(oldP: number, newP: number) {
  if (!oldP || !newP) return 0;
  if (oldP <= newP) return 0;
  return Math.round((1 - newP / oldP) * 100);
}

export function applyPrices<T extends Record<string, any>>(
  items: T[],
  rows: PriceRow[],
) {
  const map = new Map<string, PriceRow>();
  for (const r of rows) {
    const key = String(r.productId || "").trim();
    if (key) map.set(key, r);
  }

  return items.map((p) => {
    const r = map.get(String(p.id));
    if (!r) return p;

    const next: T = {
      ...p,
      // карточка уже читает snake_case:
      price_uzs: r.price_uzs ?? p.price_uzs ?? p.priceUZS ?? 0,
      price_rub: r.price_rub ?? p.price_rub ?? p.priceRUB ?? 0,
      old_price_uzs: r.old_price_uzs ?? (p as any).old_price_uzs ?? null,
      old_price_rub: r.old_price_rub ?? (p as any).old_price_rub ?? null,
    };

    const cur =
      Number(next.price_rub ?? 0) || Number(next.price_uzs ?? 0) || 0;
    const old =
      Number(next.old_price_rub ?? 0) || Number(next.old_price_uzs ?? 0) || 0;

    (next as any).discountPct = discountPct(old, cur);

    return next;
  });
}
