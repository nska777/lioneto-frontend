import { resolveStrapiImage } from "@/app/lib/strapi/resolveImage";

type AnyObj = Record<string, any>;

export type StrapiVariant = {
  id: string;
  title?: string;
  group?: string;

  /**
   * Артикул конкретного варианта цвета.
   * Например:
   * white      -> 10.210 (Б)
   * cappuccino -> 10.210 (К)
   */
  variantSku?: string;

  priceDeltaRUB?: number;
  priceDeltaUZS?: number;
  priceDeltaKZ?: number;
  priceDeltaKZT?: number;
  dealerPriceRUB?: number;
  dealerPriceUZS?: number;
  dealerPriceKZ?: number;
  dealerPriceKZT?: number;
  image?: string;
  gallery?: string[];
  isActive?: boolean;
  isActiveUZ?: boolean;
  isActiveRU?: boolean;
  isDealerActive?: boolean;
};

export type StrapiProductLite = {
  id: string;
  slug: string;
  title: string;

  isActive?: boolean | null;
  isActiveUZ?: boolean | null;
  isActiveRU?: boolean | null;
  isDealerActive?: boolean | null;

  brand?: string | null;
  cat?: string | null;
  module?: string | null;
  collection?: string | null;

  sku?: string | null;
  articleShort?: string | null;

  priceUZS?: number | null;
  priceRUB?: number | null;
  priceKZ?: number | null;
  priceKZT?: number | null;
  oldPriceUZS?: number | null;
  oldPriceRUB?: number | null;
  oldPriceKZ?: number | null;
  oldPriceKZT?: number | null;
  dealerPriceUZS?: number | null;
  dealerPriceRUB?: number | null;
  dealerPriceKZ?: number | null;
  dealerPriceKZT?: number | null;

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

function toPriceNum(v: any): number | null {
  const n = toNum(v);
  if (n === null) return null;

  // В старых Excel-файлах 28/29/32 часто использовались как мусорные заглушки.
  // Для цен Казахстана такие значения нельзя показывать как 32 ₸.
  if (n === 28 || n === 29 || n === 32) return null;

  return n;
}

function toBool(v: any): boolean | null {
  if (typeof v === "boolean") return v;

  const s = String(v ?? "").trim().toLowerCase();

  if (["true", "1", "yes", "да", "истина"].includes(s)) return true;
  if (["false", "0", "no", "нет", "ложь"].includes(s)) return false;

  return null;
}

function toCleanString(v: any): string | undefined {
  const s = String(v ?? "").trim();
  return s ? s : undefined;
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

    if (url) {
      const resolved = resolveStrapiImage(String(url));
      if (resolved) out.push(resolved);
    }
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

function normalizeVariantKey(raw: any) {
  const s = String(raw ?? "").trim();

  if (!s) {
    return { id: "", groupFromKey: undefined as string | undefined };
  }

  if (s.includes(":")) {
    const [g, id] = s.split(":");

    return {
      id: String(id ?? "").trim(),
      groupFromKey: String(g ?? "").trim(),
    };
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

function mapStrapiItemToLite(item: any): StrapiProductLite | null {
  const src = unwrapItem(item);
  const slug = String(src?.slug ?? "").trim();

  if (!slug) return null;

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

        title:
          v?.title !== undefined && v?.title !== null && String(v.title).trim()
            ? String(v.title).trim()
            : undefined,

        variantSku: toCleanString(v?.variantSku),

        group,

        priceDeltaRUB: toNum(v?.priceDeltaRUB) ?? undefined,
        priceDeltaUZS: toNum(v?.priceDeltaUZS) ?? undefined,
        priceDeltaKZ:
          toNum(v?.priceDeltaKZ ?? v?.priceDeltaKZT ?? v?.price_delta_kz) ??
          undefined,
        priceDeltaKZT:
          toNum(v?.priceDeltaKZT ?? v?.priceDeltaKZ ?? v?.price_delta_kzt) ??
          undefined,

        dealerPriceRUB: toNum(v?.dealerPriceRUB) ?? undefined,
        dealerPriceUZS: toNum(v?.dealerPriceUZS) ?? undefined,
        dealerPriceKZ:
          toNum(v?.dealerPriceKZ ?? v?.dealerPriceKZT ?? v?.dealer_price_kz) ??
          undefined,
        dealerPriceKZT:
          toNum(v?.dealerPriceKZT ?? v?.dealerPriceKZ ?? v?.dealer_price_kzt) ??
          undefined,

        image: img,
        gallery: img ? [img] : undefined,

        isActive: toBool(v?.isActive) ?? undefined,
        isActiveUZ: toBool(v?.isActiveUZ) ?? undefined,
        isActiveRU: toBool(v?.isActiveRU) ?? undefined,
        isDealerActive: toBool(v?.isDealerActive) ?? undefined,
      };
    })
    .filter((x) => x.id);

  return {
    id: slug,
    slug,
    title: String(src?.title ?? "—"),

    isActive: toBool(src?.isActive),
    isActiveUZ: toBool(src?.isActiveUZ),
    isActiveRU: toBool(src?.isActiveRU),
    isDealerActive: toBool(src?.isDealerActive),

    brand: src?.brand ?? null,
    cat: src?.cat ?? null,
    module: src?.module ?? null,
    collection: src?.collection ?? null,

    sku: src?.sku ?? null,
    articleShort: src?.articleShort ?? null,

    priceUZS: toNum(src?.priceUZS ?? src?.priceUzs ?? src?.price_uzs),
    priceRUB: toNum(src?.priceRUB ?? src?.priceRub ?? src?.price_rub),
    priceKZ: toPriceNum(src?.priceKZ ?? src?.priceKZT ?? src?.price_kz ?? src?.price_kzt),
    priceKZT: toPriceNum(src?.priceKZT ?? src?.priceKZ ?? src?.price_kzt ?? src?.price_kz),

    oldPriceUZS: toNum(src?.oldPriceUZS ?? src?.oldPriceUzs ?? src?.old_price_uzs),
    oldPriceRUB: toNum(src?.oldPriceRUB ?? src?.oldPriceRub ?? src?.old_price_rub),
    oldPriceKZ: toPriceNum(
      src?.oldPriceKZ ?? src?.oldPriceKZT ?? src?.old_price_kz ?? src?.old_price_kzt,
    ),
    oldPriceKZT: toPriceNum(
      src?.oldPriceKZT ?? src?.oldPriceKZ ?? src?.old_price_kzt ?? src?.old_price_kz,
    ),

    dealerPriceUZS: toNum(
      src?.dealerPriceUZS ?? src?.dealerPriceUzs ?? src?.dealer_price_uzs,
    ),
    dealerPriceRUB: toNum(
      src?.dealerPriceRUB ?? src?.dealerPriceRub ?? src?.dealer_price_rub,
    ),
    dealerPriceKZ: toNum(
      src?.dealerPriceKZ ?? src?.dealerPriceKZT ?? src?.dealer_price_kz ?? src?.dealer_price_kzt,
    ),
    dealerPriceKZT: toNum(
      src?.dealerPriceKZT ?? src?.dealerPriceKZ ?? src?.dealer_price_kzt ?? src?.dealer_price_kz,
    ),

    image: image || undefined,
    gallery: galleryFinal.length ? galleryFinal : undefined,
    variants,
  };
}

type StrapiPagination = {
  page: number;
  pageSize: number;
  pageCount: number;
  total: number;
};

type StrapiListResponse = {
  data: any[];
  meta?: { pagination?: StrapiPagination };
};

export async function fetchAllProductsLite(opts?: {
  pageSize?: number;
  sort?: string;
  filters?: Record<string, string | number | boolean>;
}) {
  const base = getStrapiBase();
  const pageSize = Math.max(1, Math.min(opts?.pageSize ?? 250, 1000));

  const baseParams = new URLSearchParams();

  baseParams.set("populate[0]", "media");
  baseParams.set("populate[1]", "gallery");
  baseParams.set("populate[2]", "variants");
  baseParams.set("populate[3]", "variants.image");

  baseParams.set("pagination[pageSize]", String(pageSize));

  if (opts?.sort) baseParams.set("sort", opts.sort);

  if (opts?.filters) {
    for (const [k, v] of Object.entries(opts.filters)) {
      if (v === undefined || v === null || v === "") continue;
      baseParams.set(k, String(v));
    }
  }

  const p1 = new URLSearchParams(baseParams);
  p1.set("pagination[page]", "1");

  const url1 = `${base}/api/products?${p1.toString()}`;
  const res1 = await fetch(url1, { cache: "no-store" });

  if (!res1.ok) {
    const text = await res1.text().catch(() => "");
    throw new Error(
      `fetchAllProductsLite failed ${res1.status}: ${text || url1}`,
    );
  }

  const json1 = (await res1.json()) as StrapiListResponse;
  const data1: any[] = Array.isArray(json1?.data) ? json1.data : [];
  const pag = json1?.meta?.pagination;

  const allItems: StrapiProductLite[] = [];

  for (const it of data1) {
    const mapped = mapStrapiItemToLite(it);
    if (mapped) allItems.push(mapped);
  }

  const pageCount = pag?.pageCount ?? 1;

  for (let page = 2; page <= pageCount; page++) {
    const p = new URLSearchParams(baseParams);
    p.set("pagination[page]", String(page));

    const url = `${base}/api/products?${p.toString()}`;
    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) continue;

    const json = (await res.json()) as StrapiListResponse;
    const chunk: any[] = Array.isArray(json?.data) ? json.data : [];

    for (const it of chunk) {
      const mapped = mapStrapiItemToLite(it);
      if (mapped) allItems.push(mapped);
    }
  }

  return {
    items: allItems,
    total: pag?.total ?? allItems.length,
    pageCount,
    pageSize,
  };
}

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
    const mapped = mapStrapiItemToLite(item);
    if (!mapped) continue;

    out[mapped.slug] = mapped;
  }

  return out;
}

export async function fetchProductsMap(slugs: string[]) {
  return fetchStrapiProductsMapBySlugs(slugs);
}