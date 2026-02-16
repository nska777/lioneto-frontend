// app/lib/strapi/prices.ts

type AnyObj = Record<string, any>;

export type PriceEntry = {
  productId: string;
  variantKey?: string | null; // null/base или "white" или "color:white" или composite
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

function unwrapItem(item: AnyObj): AnyObj {
  return item?.attributes ?? item ?? {};
}

function getStrapiBase() {
  return (
    process.env.NEXT_PUBLIC_STRAPI_URL ||
    process.env.STRAPI_URL ||
    "http://localhost:1337"
  ).replace(/\/$/, "");
}

/**
 * Возвращает map:
 *   key = `${productId}::${variantKeyOrBase}`
 * где variantKeyOrBase = "base" если variantKey пустой/null.
 */
export async function fetchPriceEntriesMapBySlugs(
  productIds: string[],
): Promise<Record<string, PriceEntry>> {
  const ids = Array.from(
    new Set(productIds.map((s) => String(s || "").trim()).filter(Boolean)),
  );
  if (!ids.length) return {};

  const base = getStrapiBase();

  const params = new URLSearchParams();
  ids.forEach((id, i) => params.set(`filters[productId][$in][${i}]`, id));
  params.set("pagination[pageSize]", String(Math.min(100, ids.length)));

  const url = `${base}/api/price-entries?${params.toString()}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return {};

  const json = await res.json();
  const data: any[] = Array.isArray(json?.data) ? json.data : [];

  const map: Record<string, PriceEntry> = {};

  for (const item of data) {
    const a = unwrapItem(item);

    const pid = String(a?.productId ?? "").trim();
    if (!pid) continue;

    const vk =
      a?.variantKey !== undefined &&
      a?.variantKey !== null &&
      String(a.variantKey).trim()
        ? String(a.variantKey).trim()
        : "base";

    const key = `${pid}::${vk}`;

    map[key] = {
      productId: pid,
      variantKey: vk === "base" ? null : vk,
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

/**
 * ✅ ВАЖНО:
 * Твой Product Page импортирует `getPriceEntriesMap`.
 * Раньше в проекте называли по-разному, поэтому делаем безопасный алиас.
 */
export async function getPriceEntriesMap(productIds: string[]) {
  return fetchPriceEntriesMapBySlugs(productIds);
}
