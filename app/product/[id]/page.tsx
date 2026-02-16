import { notFound } from "next/navigation";
import ProductClient from "./ui/ProductClient";
import { resolveStrapiImage } from "@/app/lib/strapi/resolveImage";

function norm(v: any) {
  return String(v ?? "")
    .trim()
    .toLowerCase();
}

type StrapiProduct = {
  id?: string | number;
  documentId?: string;
  title?: string;
  slug?: string;
  isActive?: boolean;
  brand?: string;
  cat?: string;
  module?: string;
  collection?: string;
  collectionBadge?: string | null;

  media?: any;
  gallery?: any;
  variants?: any[];

  priceUZS?: number | null;
  priceRUB?: number | null;
  oldPriceUZS?: number | null;
  oldPriceRUB?: number | null;

  description?: string | null;
  sku?: string | null;
  sizeText?: string | null;
  colorText?: string | null;
  materialText?: string | null;
};

function pickStrapiMediaUrl(m: any): string | undefined {
  if (!m) return undefined;
  const a = m?.data?.attributes ?? m?.attributes ?? m;
  const url =
    a?.formats?.large?.url ||
    a?.formats?.medium?.url ||
    a?.formats?.small?.url ||
    a?.url;

  return url ? resolveStrapiImage(String(url)) : undefined;
}

function pickStrapiGalleryUrls(g: any): string[] {
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

function pickVariantImageUrl(v: any) {
  const a =
    v?.image?.data?.attributes ?? v?.image?.attributes ?? v?.image ?? null;

  const url =
    a?.formats?.large?.url ||
    a?.formats?.medium?.url ||
    a?.formats?.small?.url ||
    a?.url ||
    null;

  return url ? resolveStrapiImage(String(url)) : undefined;
}

async function fetchStrapiProductBySlug(
  slug: string,
): Promise<StrapiProduct | null> {
  const base =
    process.env.NEXT_PUBLIC_STRAPI_URL ||
    process.env.STRAPI_URL ||
    "http://localhost:1337";

  const url =
    `${base.replace(/\/$/, "")}` +
    `/api/products?filters[slug][$eq]=${encodeURIComponent(slug)}` +
    `&populate[0]=media` +
    `&populate[1]=gallery` +
    `&populate[2]=variants` +
    `&populate[3]=variants.image`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;

    const json = await res.json();
    const item = json?.data?.[0];
    if (!item) return null;

    const src = item?.attributes ?? item;

    return {
      id: src?.id ?? item?.id,
      title: src?.title ?? "",
      slug: src?.slug ?? "",
      isActive: !!src?.isActive,
      brand: src?.brand ?? null,
      cat: src?.cat ?? null,
      module: src?.module ?? null,
      collection: src?.collection ?? null,
      collectionBadge: src?.collectionBadge ?? null,
      media: src?.media ?? null,
      gallery: src?.gallery ?? null,
      variants: Array.isArray(src?.variants) ? src.variants : [],
      priceUZS: src?.priceUZS ?? null,
      priceRUB: src?.priceRUB ?? null,
      oldPriceUZS: src?.oldPriceUZS ?? null,
      oldPriceRUB: src?.oldPriceRUB ?? null,
      description: src?.description ?? null,
      sku: src?.sku ?? null,
      sizeText: src?.sizeText ?? null,
      colorText: src?.colorText ?? null,
      materialText: src?.materialText ?? null,
    };
  } catch {
    return null;
  }
}

async function fetchRelatedStrapiProducts(seed: {
  brand?: string | null;
  collection?: string | null;
  cat?: string | null;
  currentSlug: string;
}) {
  const base =
    process.env.NEXT_PUBLIC_STRAPI_URL ||
    process.env.STRAPI_URL ||
    "http://localhost:1337";

  const params = new URLSearchParams();
  params.set("pagination[pageSize]", "24");
  params.set("populate[0]", "media");
  params.set("filters[isActive][$eq]", "true");

  if (seed.collection) params.set("filters[collection][$eq]", seed.collection);
  else if (seed.brand) params.set("filters[brand][$eq]", seed.brand);
  else if (seed.cat) params.set("filters[cat][$eq]", seed.cat);

  const url = `${base.replace(/\/$/, "")}/api/products?${params.toString()}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];

    const json = await res.json();
    const data: any[] = Array.isArray(json?.data) ? json.data : [];

    return data
      .map((item) => {
        const src = item?.attributes ?? item;
        return {
          title: src?.title ?? "",
          slug: src?.slug ?? "",
          brand: src?.brand ?? null,
          media: src?.media ?? null,
          priceUZS: src?.priceUZS ?? null,
          priceRUB: src?.priceRUB ?? null,
        };
      })
      .filter((p) => p.slug && p.slug !== seed.currentSlug);
  } catch {
    return [];
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const sp = await fetchStrapiProductBySlug(id);
  if (!sp || sp.isActive === false) return notFound();

  const slug = String(sp.slug || id);

  const image = pickStrapiMediaUrl(sp.media) || "";
  const galleryBase = pickStrapiGalleryUrls(sp.gallery);

  const variantImgs = Array.isArray(sp.variants)
    ? (sp.variants.map(pickVariantImageUrl).filter(Boolean) as string[])
    : [];

  const galleryFinal = (
    galleryBase.length
      ? galleryBase
      : image
        ? [image, ...variantImgs]
        : variantImgs
  ).filter(Boolean);

  const relatedStrapi = await fetchRelatedStrapiProducts({
    brand: sp.brand ?? null,
    collection: sp.collection ?? null,
    cat: sp.cat ?? null,
    currentSlug: slug,
  });

  const product = {
    id: slug,
    productId: slug,
    slug,

    title: sp.title || "—",
    badge: "",
    collectionBadge: sp.collectionBadge ?? null,
    hasDiscount: false,
    href: `/product/${slug}`,

    sku: String(sp.sku ?? slug),

    image,
    gallery: (galleryFinal.length ? galleryFinal : ["/placeholder.png"]).filter(
      Boolean,
    ),

    price_rub: Number(sp.priceRUB ?? 0),
    price_uzs: Number(sp.priceUZS ?? 0),

    old_price_rub:
      typeof sp.oldPriceRUB === "number" ? sp.oldPriceRUB : undefined,
    old_price_uzs:
      typeof sp.oldPriceUZS === "number" ? sp.oldPriceUZS : undefined,

    variants: Array.isArray(sp.variants)
      ? sp.variants
          .map((v: any) => {
            const vid = String(v?.variantKey || v?.id || "");
            const img = pickVariantImageUrl(v);

            return {
              id: vid,
              title: String(v?.title || vid || ""),
              kind: v?.type === "color" ? "color" : "option",
              group: v?.group ? String(v.group) : undefined,
              priceDeltaRUB:
                v?.priceDeltaRUB !== undefined
                  ? Number(v.priceDeltaRUB)
                  : undefined,
              priceDeltaUZS:
                v?.priceDeltaUZS !== undefined
                  ? Number(v.priceDeltaUZS)
                  : undefined,
              image: img,
            };
          })
          .filter((x: any) => x.id)
      : [],

    brand: norm(sp.brand),
    collectionLabel: String(sp.brand ?? "").toUpperCase(),

    description: String(sp.description ?? "Описание скоро будет."),
    extra: {
      article: String(sp.sku ?? slug),
      size: String(sp.sizeText ?? "—"),
      color: String(sp.colorText ?? "—"),
      material: String(sp.materialText ?? "—"),
    },

    related: relatedStrapi.slice(0, 4).map((rp) => {
      const rSlug = String(rp.slug);
      const rImage = pickStrapiMediaUrl(rp.media) || "/placeholder.png";

      return {
        id: rSlug,
        productId: rSlug,
        slug: rSlug,
        title: String(rp.title ?? "—"),
        href: `/product/${rSlug}`,
        image: rImage,
        gallery: [rImage],
        price_rub: Number(rp.priceRUB ?? 0),
        price_uzs: Number(rp.priceUZS ?? 0),
        variants: [],
        brand: norm(rp.brand),
        collectionLabel: String(rp.brand ?? "").toUpperCase(),
      };
    }),
  };
  const variantsFixed = (product.variants ?? []).map((v: any) => {
    const rawKind = String(v?.kind ?? v?.type ?? "").toLowerCase();
    return {
      ...v,
      kind: (rawKind === "color" ? "color" : "option") as "color" | "option",
    };
  });

  const productFixed = { ...product, variants: variantsFixed };

  return <ProductClient product={productFixed} />;
}
