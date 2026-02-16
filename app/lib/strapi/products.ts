// app/lib/strapi/products.ts
import { resolveStrapiImage } from "@/app/lib/strapi/resolveImage";

type AnyObj = Record<string, any>;

export type StrapiVariant = {
  id: string; // "white" (а не "color:white")
  title?: string;
  group?: string; // "color"
  priceDeltaRUB?: number;
  priceDeltaUZS?: number;
  image?: string;
  gallery?: string[];
};

export type StrapiProductLite = {
  id: string; // slug
  slug: string;
  title: string;

  brand?: string | null;
  cat?: string | null;
  module?: string | null;
  collection?: string | null;

  // ✅ БАЗОВЫЕ ЦЕНЫ (ключевое!)
  priceUZS?: number | null;
  priceRUB?: number | null;

  image?: string;
  gallery?: string[];
  variants?: StrapiVariant[];
};

export type LiteProduct = StrapiProductLite;

function unwrapItem(item: AnyObj): AnyObj {
  return item?.attributes ?? item ?? {};
}

function toNum(v: any): number | null {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function pickMediaUrl(m: any): string | undefined {
  if (!m) return undefined;
  const a = m?.data?.attributes ?? m?.attributes ?? m;
  const url =
    a?.formats?.large?.url ||
    a?.formats?.medium?.url ||
    a?.formats?.small?.url ||
    a?.url;
  return url ? resolveStrapiImage(String(url)) : undefined;
}

function pickGalleryUrls(g: any): string[] {
  if (!g) return [];
  const arr = Array.isArray(g?.data) ? g.data : Array.isArray(g) ? g : [];
  const out: string[] = [];

  for (const item of arr) {
    const a = item?.attributes ?? item;
    const url =
      a?.formats?.large?.url ||
      a?.formats?.medium?.url ||
      a?.formats?.small?.url ||
      a?.url;
    if (url) out.push(resolveStrapiImage(String(url))!);
  }

  return out.filter(Boolean);
}

function pickVariantImageUrl(v: any): string | undefined {
  const a =
    v?.image?.data?.attributes ?? v?.image?.attributes ?? v?.image ?? null;
  if (!a) return undefined;

  const url =
    a?.formats?.large?.url ||
    a?.formats?.medium?.url ||
    a?.formats?.small?.url ||
    a?.url;

  return url ? resolveStrapiImage(String(url)) : undefined;
}

/**
 * variantKey может быть "white" или "color:white".
 * Нам нужен id="white", group="color".
 */
function normalizeVariantKey(raw: any) {
  const s = String(raw ?? "").trim();
  if (!s) return { id: "", groupFromKey: undefined as string | undefined };
  if (s.includes(":")) {
    const [g, id] = s.split(":");
    return { id: String(id ?? "").trim(), groupFromKey: String(g ?? "").trim() };
  }
  return { id: s, groupFromKey: undefined };
}

function getStrapiBase() {
  return (
    process.env.NEXT_PUBLIC_STRAPI_URL ||
    process.env.STRAPI_URL ||
    "http://localhost:1337"
  ).replace(/\/$/, "");
}

/**
 * Fetch many products by slugs (ids in your cart/favorites)
 */
export async function fetchStrapiProductsMapBySlugs(
  slugs: string[],
): Promise<Record<string, StrapiProductLite>> {
  const ids = Array.from(
    new Set(slugs.map((s) => String(s || "").trim()).filter(Boolean)),
  );
  if (!ids.length) return {};

  const base = getStrapiBase();
  const params = new URLSearchParams();

  ids.forEach((id, i) => params.set(`filters[slug][$in][${i}]`, id));

  // populate
  params.set("populate[0]", "media");
  params.set("populate[1]", "gallery");
  params.set("populate[2]", "variants");
  params.set("populate[3]", "variants.image");
  params.set("pagination[pageSize]", String(Math.min(100, ids.length)));

  const url = `${base}/api/products?${params.toString()}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return {};

  const json = await res.json();
  const data: any[] = Array.isArray(json?.data) ? json.data : [];

  const out: Record<string, StrapiProductLite> = {};

  for (const item of data) {
    const src = unwrapItem(item);
    const slug = String(src?.slug ?? "").trim();
    if (!slug) continue;

    const image = pickMediaUrl(src?.media);
    const gallery = pickGalleryUrls(src?.gallery);
    const galleryFinal = gallery.length ? gallery : image ? [image] : [];

    const variantsRaw: any[] = Array.isArray(src?.variants) ? src.variants : [];

    const variants: StrapiVariant[] = variantsRaw
      .map((v) => {
        const { id, groupFromKey } = normalizeVariantKey(v?.variantKey || v?.id);
        const group = String(v?.group ?? groupFromKey ?? "").trim() || undefined;

        const img = pickVariantImageUrl(v);

        return {
          id: String(id || "").trim(),
          title: v?.title ? String(v.title) : undefined,
          group,
          priceDeltaRUB: toNum(v?.priceDeltaRUB) ?? undefined,
          priceDeltaUZS: toNum(v?.priceDeltaUZS) ?? undefined,
          image: img,
          gallery: img ? [img] : undefined,
        };
      })
      .filter((x) => x.id && x.title);

    out[slug] = {
      id: slug,
      slug,
      title: String(src?.title ?? "—"),
      brand: src?.brand ?? null,
      cat: src?.cat ?? null,
      module: src?.module ?? null,
      collection: src?.collection ?? null,

      // ✅ БАЗОВАЯ ЦЕНА ИЗ Strapi Product
      priceUZS: toNum(src?.priceUZS ?? src?.priceUzs ?? src?.price_uzs),
priceRUB: toNum(src?.priceRUB ?? src?.priceRub ?? src?.price_rub),


      image: image || undefined,
      gallery: galleryFinal.length ? galleryFinal : undefined,
      variants,
    };
  }

  return out;
}

/**
 * ✅ Совместимость с твоими импортами в CartClient:
 * import { fetchProductsMap, type LiteProduct } from "@/app/lib/strapi/products";
 */
export async function fetchProductsMap(slugs: string[]) {
  return fetchStrapiProductsMapBySlugs(slugs);
}
