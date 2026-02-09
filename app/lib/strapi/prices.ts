// app/lib/strapi/prices.ts
export type PriceEntry = {
  productId: string;
  title?: string | null;
  priceUZS?: number | null;
  priceRUB?: number | null;
  oldPriceUZS?: number | null;
  oldPriceRUB?: number | null;
  hasDiscount?: boolean | null;
  collectionBadge?: string | null;
  isActive?: boolean | null;
};

const toNum = (v: any) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

export async function getPriceEntriesMap(
  productIds: string[],
): Promise<Record<string, PriceEntry>> {
  const ids = Array.from(new Set(productIds.filter(Boolean)));
  if (!ids.length) return {};

  const base =
    process.env.NEXT_PUBLIC_STRAPI_URL ||
    process.env.STRAPI_URL ||
    "http://localhost:1337";

  // ✅ Strapi REST: filters[productId][$in][0]=...&filters[productId][$in][1]=...
  const params = new URLSearchParams();
  ids.forEach((id, i) => params.set(`filters[productId][$in][${i}]`, id));
  params.set("pagination[pageSize]", String(Math.min(100, ids.length)));

  const url = `${base.replace(/\/$/, "")}/api/price-entries?${params.toString()}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return {};

  const json = await res.json();
  const data: any[] = Array.isArray(json?.data) ? json.data : [];

  const map: Record<string, PriceEntry> = {};
  for (const item of data) {
    // у тебя поля прямо в item
    const a = item;
    const pid = String(a?.productId ?? "");
    if (!pid) continue;

    map[pid] = {
      productId: pid,
      title: a?.title ?? null,
      priceUZS: a?.priceUZS !== undefined ? toNum(a.priceUZS) : null,
      priceRUB: a?.priceRUB !== undefined ? toNum(a.priceRUB) : null,
      oldPriceUZS: a?.oldPriceUZS !== undefined ? toNum(a.oldPriceUZS) : null,
      oldPriceRUB: a?.oldPriceRUB !== undefined ? toNum(a.oldPriceRUB) : null,
      hasDiscount: typeof a?.hasDiscount === "boolean" ? a.hasDiscount : null,
      collectionBadge:
        a?.collectionBadge !== undefined ? String(a.collectionBadge) : null,
      isActive: typeof a?.isActive === "boolean" ? a.isActive : null,
    };
  }

  return map;
}
