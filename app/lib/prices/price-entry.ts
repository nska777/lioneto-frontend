export type PriceEntry = {
  productId: string;
  price_uzs: number;
  price_rub: number;
  old_price_uzs: number | null;
  old_price_rub: number | null;
};

export type PricesMap = Record<string, PriceEntry>;

function strapiBase() {
  // локально можно держать NEXT_PUBLIC_STRAPI_URL=http://localhost:1337
  // на проде лучше проксировать через /api (потом сделаем)
  return process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
}

export async function fetchPricesMap(): Promise<PricesMap> {
  const url = `${strapiBase()}/api/price-entries?pagination[pageSize]=10000`;
  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return {};

  const json = await res.json();

  const map: PricesMap = {};
  for (const it of json?.data ?? []) {
    // ⚠️ у тебя сейчас API отдаёт плоский формат без attributes — ок
    const productId = String(it?.productId || "").trim();
    if (!productId) continue;

    map[productId] = {
      productId,
      price_uzs: Number(it.price_uzs ?? 0),
      price_rub: Number(it.price_rub ?? 0),
      old_price_uzs:
        it.old_price_uzs === null || it.old_price_uzs === undefined
          ? null
          : Number(it.old_price_uzs),
      old_price_rub:
        it.old_price_rub === null || it.old_price_rub === undefined
          ? null
          : Number(it.old_price_rub),
    };
  }

  return map;
}

export function calcDiscountPct(price: number, oldPrice?: number | null) {
  if (!oldPrice || oldPrice <= 0) return 0;
  if (oldPrice <= price) return 0;
  return Math.round(((oldPrice - price) / oldPrice) * 100);
}
