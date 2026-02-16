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

  // Strapi media object (cardImage) или строка url
  cardImage?: any;
};

function joinUrl(base: string, path: string) {
  const b = String(base || "").replace(/\/+$/, "");
  const p = String(path || "").trim();
  if (!p) return b;
  if (/^https?:\/\//i.test(p)) return p;
  return `${b}${p.startsWith("/") ? "" : "/"}${p}`;
}

function pickStrapi(item: any) {
  return item?.attributes ?? item ?? {};
}

function parseNum(v: any): number | null {
  if (v === null || v === undefined || v === "") return null;
  if (typeof v === "number" && Number.isFinite(v)) return v;

  const s = String(v)
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, "")
    .replace(/,/g, ".")
    .trim();

  const n = Number(s);
  return Number.isFinite(n) ? n : null;
}

function pickMediaUrl(src: any): string | null {
  const u =
    src?.media?.url ??
    src?.media?.data?.attributes?.url ??
    src?.media?.data?.url ??
    null;
  return u ? String(u) : null;
}

/**
 * ✅ Теперь pricesMap строится ИЗ /api/products (Strapi product)
 * ⚠️ Никаких price-entries и /api/prices
 *
 * Возвращает Map с ключами:
 * - productId/slug (как есть)
 * - lowercased productId/slug
 * - numeric id (если есть)
 */
export async function fetchPricesMap(): Promise<Map<string, PriceEntry>> {
  const STRAPI_URL = String(process.env.NEXT_PUBLIC_STRAPI_URL || "").trim();
  if (!STRAPI_URL) return new Map();

  // берём только нужные поля, чтобы не тянуть тяжёлый populate
  const url = joinUrl(
    STRAPI_URL,
    "/api/products?pagination[pageSize]=250&filters[isActive][$eq]=true&fields[0]=slug&fields[1]=productId&fields[2]=title&fields[3]=priceUZS&fields[4]=priceRUB&fields[5]=oldPriceUZS&fields[6]=oldPriceRUB&fields[7]=hasDiscount&fields[8]=collectionBadge&fields[9]=isActive&populate[media]=*",
  );

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return new Map();

  const json = await res.json();
  const rows: any[] = Array.isArray(json?.data) ? json.data : [];

  const map = new Map<string, PriceEntry>();

  for (const it of rows) {
    const src = pickStrapi(it);

    const idRaw = src?.id ?? it?.id ?? src?.documentId ?? null;
    const slug = String(src?.slug ?? "").trim();
    const pid = String(src?.productId ?? src?.slug ?? slug ?? idRaw ?? "").trim();

    if (!pid) continue;

    const entry: PriceEntry = {
      productId: pid,
      title: src?.title ?? null,

      priceUZS: parseNum(src?.priceUZS),
      priceRUB: parseNum(src?.priceRUB),

      oldPriceUZS: parseNum(src?.oldPriceUZS),
      oldPriceRUB: parseNum(src?.oldPriceRUB),

      hasDiscount: src?.hasDiscount ?? null,
      collectionBadge: src?.collectionBadge ?? null,
      isActive: src?.isActive ?? null,

      cardImage: pickMediaUrl(src) ?? src?.media ?? null,
    };

    const keys = new Set<string>();

    // основной ключ
    keys.add(pid);
    keys.add(pid.toLowerCase());

    // slug как отдельный ключ (если отличается)
    if (slug) {
      keys.add(slug);
      keys.add(slug.toLowerCase());
    }

    // numeric id как ключ тоже (на всякий случай)
    if (idRaw !== null && idRaw !== undefined) {
      const k = String(idRaw).trim();
      if (k) {
        keys.add(k);
        if (/^\d+$/.test(k)) keys.add(String(Number(k)));
      }
    }

    for (const k of keys) map.set(k, entry);
  }

  return map;
}
