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

  cardImage?: any;
};

function num(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

export async function fetchPricesMap(): Promise<Map<string, PriceEntry>> {
  const res = await fetch("/api/prices", { cache: "no-store" });
  if (!res.ok) throw new Error("Failed to fetch /api/prices");

  const json = await res.json();

  // может быть: {data:[...]} или [...]
  const rawRows: any[] = Array.isArray(json)
    ? json
    : Array.isArray(json?.data)
      ? json.data
      : [];

  const map = new Map<string, PriceEntry>();

  for (const r of rawRows) {
    // ✅ поддержка Strapi { attributes: {...} } и плоского объекта
    const src = r?.attributes ? { ...r.attributes, id: r.id, documentId: r.documentId } : r;

    const productId = String(src?.productId ?? "").trim();
    if (!productId) continue;

    const entry: PriceEntry = {
      productId,
      title: src?.title ?? null,

      // ✅ camelCase
      priceUZS: src?.priceUZS ?? null,
      priceRUB: src?.priceRUB ?? null,
      oldPriceUZS: src?.oldPriceUZS ?? null,
      oldPriceRUB: src?.oldPriceRUB ?? null,

      // ✅ snake_case fallback (если вдруг)
      // (не мешает даже если не используется)
      ...(src?.price_uzs != null ? { priceUZS: num(src.price_uzs) } : null),
      ...(src?.price_rub != null ? { priceRUB: num(src.price_rub) } : null),
      ...(src?.old_price_uzs != null ? { oldPriceUZS: num(src.old_price_uzs) } : null),
      ...(src?.old_price_rub != null ? { oldPriceRUB: num(src.old_price_rub) } : null),

      hasDiscount: src?.hasDiscount ?? null,
      collectionBadge: src?.collectionBadge ?? null,
      isActive: src?.isActive ?? null,

      // ✅ cardImage может быть плоский объект (как у тебя) или {data:{attributes}}
      cardImage:
        src?.cardImage?.data?.attributes
          ? { ...src.cardImage.data.attributes, id: src.cardImage.data.id }
          : src?.cardImage ?? null,
    };

    map.set(productId, entry);
  }

  return map;
}
