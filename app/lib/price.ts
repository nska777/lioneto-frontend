// app/lib/prices.ts

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

  // Strapi media object (cardImage)
  cardImage?: any;
};

// ⚠️ Важно: no-store чтобы обновления тянулись сразу без перезапуска
export async function fetchPricesMap(): Promise<Map<string, PriceEntry>> {
  const res = await fetch("/api/prices", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch /api/prices");

  const json = await res.json();

  // ожидаем { data: [...] } или просто [...]
  const rows: any[] = Array.isArray(json) ? json : Array.isArray(json?.data) ? json.data : [];

  const map = new Map<string, PriceEntry>();

  for (const r of rows) {
    const productId = String(r?.productId ?? "").trim();
    if (!productId) continue;

    map.set(productId, {
      productId,
      title: r?.title ?? null,

      priceUZS: r?.priceUZS ?? null,
      priceRUB: r?.priceRUB ?? null,

      oldPriceUZS: r?.oldPriceUZS ?? null,
      oldPriceRUB: r?.oldPriceRUB ?? null,

      hasDiscount: r?.hasDiscount ?? null,
      collectionBadge: r?.collectionBadge ?? null,
      isActive: r?.isActive ?? null,

      cardImage: r?.cardImage ?? null,
    });
  }

  return map;
}
