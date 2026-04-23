import type { Metadata } from "next";
import { notFound } from "next/navigation";
import ProductClient from "./ui/ProductClient";
import { resolveStrapiImage } from "@/app/lib/strapi/resolveImage";

const BASE_URL = "https://lioneto.com";

function norm(v: unknown) {
  return String(v ?? "")
    .trim()
    .toLowerCase();
}

type SetItemJson = {
  id?: string | number;
  title?: string;
  slug?: string;
  article?: string;
  image?: string;
  price_uzs?: number | string | null;
  price_rub?: number | string | null;
  quantity?: number | string | null;
  sort_order?: number | string | null;
};

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

  media?: unknown;
  gallery?: unknown;
  variants?: unknown[];

  priceUZS?: number | null;
  priceRUB?: number | null;
  oldPriceUZS?: number | null;
  oldPriceRUB?: number | null;

  description?: unknown;

  sku?: string | null;
  size?: string | null;
  color?: string | null;
  material?: string | null;

  sizeText?: string | null;
  colorText?: string | null;
  materialText?: string | null;

  assemblyInstructionTitle?: string | null;
  assemblyInstructionFile?: unknown;

  set_items_json?: unknown;
};

type SetItemWithResolvedImage = {
  id: string;
  title: string;
  article?: string;
  image?: string;
  price_rub?: number;
  price_uzs?: number;
  href?: string;
  quantity: number;
  sort_order: number;
  slug?: string;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function pickText(...values: Array<unknown>): string | undefined {
  for (const value of values) {
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return undefined;
}

function toFiniteNumber(v: unknown): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function pickStrapiMediaUrl(m: unknown): string | undefined {
  if (!m) return undefined;

  const rec = isRecord(m) ? m : null;
  const data = rec && isRecord(rec.data) ? rec.data : null;
  const attrs =
    (data && isRecord(data.attributes) ? data.attributes : null) ??
    (rec && isRecord(rec.attributes) ? rec.attributes : null) ??
    rec;

  const a = isRecord(attrs) ? attrs : null;
  if (!a) return undefined;

  const formats = isRecord(a.formats) ? a.formats : null;
  const large = formats && isRecord(formats.large) ? formats.large : null;
  const medium = formats && isRecord(formats.medium) ? formats.medium : null;
  const small = formats && isRecord(formats.small) ? formats.small : null;

  const url =
    (large && typeof large.url === "string" ? large.url : "") ||
    (medium && typeof medium.url === "string" ? medium.url : "") ||
    (small && typeof small.url === "string" ? small.url : "") ||
    (typeof a.url === "string" ? a.url : "");

  return url ? resolveStrapiImage(String(url)) : undefined;
}

function pickStrapiMediaName(m: unknown): string | undefined {
  if (!m) return undefined;

  const rec = isRecord(m) ? m : null;
  const data = rec && isRecord(rec.data) ? rec.data : null;
  const attrs =
    (data && isRecord(data.attributes) ? data.attributes : null) ??
    (rec && isRecord(rec.attributes) ? rec.attributes : null) ??
    rec;

  const a = isRecord(attrs) ? attrs : null;
  if (!a) return undefined;

  return typeof a.name === "string" && a.name.trim()
    ? a.name.trim()
    : undefined;
}

function pickStrapiGalleryUrls(g: unknown): string[] {
  if (!g) return [];

  const rec = isRecord(g) ? g : null;
  const data = rec ? rec.data : undefined;
  const arr = Array.isArray(data) ? data : Array.isArray(g) ? g : [];
  const out: string[] = [];

  for (const item of arr) {
    const it = isRecord(item) ? item : null;
    const attrs = it && isRecord(it.attributes) ? it.attributes : it;

    if (!isRecord(attrs)) continue;

    const formats = isRecord(attrs.formats) ? attrs.formats : null;
    const large = formats && isRecord(formats.large) ? formats.large : null;
    const medium = formats && isRecord(formats.medium) ? formats.medium : null;
    const small = formats && isRecord(formats.small) ? formats.small : null;

    const url =
      (large && typeof large.url === "string" ? large.url : "") ||
      (medium && typeof medium.url === "string" ? medium.url : "") ||
      (small && typeof small.url === "string" ? small.url : "") ||
      (typeof attrs.url === "string" ? attrs.url : "");

    if (url) out.push(resolveStrapiImage(String(url)));
  }

  return out.filter(Boolean);
}

function pickVariantImageUrl(v: unknown): string | undefined {
  if (!v || !isRecord(v)) return undefined;

  const image = v.image;
  const imgRec = isRecord(image) ? image : null;
  const data = imgRec && isRecord(imgRec.data) ? imgRec.data : null;
  const attrs =
    (data && isRecord(data.attributes) ? data.attributes : null) ??
    (imgRec && isRecord(imgRec.attributes) ? imgRec.attributes : null) ??
    imgRec;

  if (!attrs || !isRecord(attrs)) return undefined;

  const formats = isRecord(attrs.formats) ? attrs.formats : null;
  const large = formats && isRecord(formats.large) ? formats.large : null;
  const medium = formats && isRecord(formats.medium) ? formats.medium : null;
  const small = formats && isRecord(formats.small) ? formats.small : null;

  const url =
    (large && typeof large.url === "string" ? large.url : "") ||
    (medium && typeof medium.url === "string" ? medium.url : "") ||
    (small && typeof small.url === "string" ? small.url : "") ||
    (typeof attrs.url === "string" ? attrs.url : "");

  return url ? resolveStrapiImage(String(url)) : undefined;
}

function extractTextFromRich(v: unknown): string {
  if (typeof v === "string") return v.trim();

  if (Array.isArray(v)) {
    const parts: string[] = [];

    for (const b of v) {
      if (!isRecord(b)) continue;

      const children = b.children;
      if (Array.isArray(children)) {
        for (const ch of children) {
          if (!isRecord(ch)) continue;
          const t = ch.text;
          if (typeof t === "string" && t.trim()) parts.push(t.trim());
        }
      }

      const t2 = b.text;
      if (typeof t2 === "string" && t2.trim()) parts.push(t2.trim());
    }

    return parts.join("\n").trim();
  }

  if (isRecord(v)) {
    const blocks = v.blocks;
    if (Array.isArray(blocks)) return extractTextFromRich(blocks);

    const content = v.content;
    if (content) return extractTextFromRich(content);

    const text = v.text;
    if (typeof text === "string") return text.trim();
  }

  return "";
}

function parseSetItemsJson(value: unknown): SetItemWithResolvedImage[] {
  if (!Array.isArray(value)) return [];

  const items: SetItemWithResolvedImage[] = [];

  value.forEach((item, index) => {
    const raw = item as SetItemJson;
    if (!isRecord(raw)) return;

    const title = pickText(raw.title) || "Без названия";
    const slug = pickText(raw.slug);
    const article = pickText(raw.article);

    const id =
      (typeof raw.id === "string" && raw.id.trim()) ||
      (typeof raw.id === "number" ? String(raw.id) : "") ||
      slug ||
      `set-item-${index + 1}`;

    items.push({
      id,
      title,
      article: article || undefined,
      image: pickText(raw.image) || undefined,
      price_rub: toFiniteNumber(raw.price_rub),
      price_uzs: toFiniteNumber(raw.price_uzs),
      href: slug ? `/product/${slug}` : undefined,
      quantity: toFiniteNumber(raw.quantity) ?? 1,
      sort_order: toFiniteNumber(raw.sort_order) ?? index + 1,
      slug: slug || undefined,
    });
  });

  return items.sort((a, b) => a.sort_order - b.sort_order);
}

async function fetchStrapiProductBySlug(
  slug: string,
): Promise<StrapiProduct | null> {
  const base =
    process.env.NEXT_PUBLIC_STRAPI_URL ||
    process.env.STRAPI_URL ||
    "http://localhost:1337";

  const url =
    `${String(base).replace(/\/$/, "")}` +
    `/api/products?filters[slug][$eq]=${encodeURIComponent(slug)}` +
    `&populate[0]=media` +
    `&populate[1]=gallery` +
    `&populate[2]=variants` +
    `&populate[3]=variants.image` +
    `&populate[4]=assemblyInstructionFile`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;

    const json: unknown = await res.json();
    const root = isRecord(json) ? json : null;
    const data = root && Array.isArray(root.data) ? root.data : [];
    const item = data[0];

    if (!item || !isRecord(item)) return null;

    const src = (isRecord(item.attributes) ? item.attributes : item) as Record<
      string,
      unknown
    >;

    return {
      id:
        (src.id as string | number | undefined) ??
        (item.id as string | number | undefined),
      documentId:
        typeof src.documentId === "string"
          ? src.documentId
          : typeof item.documentId === "string"
            ? item.documentId
            : undefined,

      title: typeof src.title === "string" ? src.title : "",
      slug: typeof src.slug === "string" ? src.slug : "",
      isActive: typeof src.isActive === "boolean" ? src.isActive : true,

      brand: typeof src.brand === "string" ? src.brand : undefined,
      cat: typeof src.cat === "string" ? src.cat : undefined,
      module: typeof src.module === "string" ? src.module : undefined,
      collection:
        typeof src.collection === "string" ? src.collection : undefined,

      collectionBadge:
        typeof src.collectionBadge === "string" || src.collectionBadge === null
          ? (src.collectionBadge as string | null)
          : null,

      media: src.media ?? null,
      gallery: src.gallery ?? null,
      variants: Array.isArray(src.variants) ? (src.variants as unknown[]) : [],

      priceUZS: typeof src.priceUZS === "number" ? src.priceUZS : null,
      priceRUB: typeof src.priceRUB === "number" ? src.priceRUB : null,
      oldPriceUZS: typeof src.oldPriceUZS === "number" ? src.oldPriceUZS : null,
      oldPriceRUB: typeof src.oldPriceRUB === "number" ? src.oldPriceRUB : null,

      description: src.description ?? null,

      sku: typeof src.sku === "string" ? src.sku : null,
      size: typeof src.size === "string" ? src.size : null,
      color: typeof src.color === "string" ? src.color : null,
      material: typeof src.material === "string" ? src.material : null,

      sizeText: typeof src.sizeText === "string" ? src.sizeText : null,
      colorText: typeof src.colorText === "string" ? src.colorText : null,
      materialText:
        typeof src.materialText === "string" ? src.materialText : null,

      assemblyInstructionTitle:
        typeof src.assemblyInstructionTitle === "string"
          ? src.assemblyInstructionTitle
          : null,
      assemblyInstructionFile: src.assemblyInstructionFile ?? null,

      set_items_json: src.set_items_json ?? null,
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

  const url = `${String(base).replace(/\/$/, "")}/api/products?${params.toString()}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];

    const json: unknown = await res.json();
    const root = isRecord(json) ? json : null;
    const data =
      root && Array.isArray(root.data) ? (root.data as unknown[]) : [];

    return data
      .map((item) => {
        const it = isRecord(item) ? item : null;
        const src = it && isRecord(it.attributes) ? it.attributes : it;

        return {
          title: src && typeof src.title === "string" ? src.title : "",
          slug: src && typeof src.slug === "string" ? src.slug : "",
          brand: src && typeof src.brand === "string" ? src.brand : null,
          media: src ? (src.media as unknown) : null,
          priceUZS:
            src && typeof src.priceUZS === "number" ? src.priceUZS : null,
          priceRUB:
            src && typeof src.priceRUB === "number" ? src.priceRUB : null,
        };
      })
      .filter((p) => p.slug && p.slug !== seed.currentSlug);
  } catch {
    return [];
  }
}

async function resolveSetItemsImages(
  items: SetItemWithResolvedImage[],
): Promise<SetItemWithResolvedImage[]> {
  const resolved = await Promise.all(
    items.map(async (item) => {
      if (item.image || !item.slug) return item;

      const linked = await fetchStrapiProductBySlug(item.slug);
      const image =
        pickStrapiMediaUrl(linked?.media) ||
        pickStrapiGalleryUrls(linked?.gallery)[0] ||
        undefined;

      return {
        ...item,
        image,
      };
    }),
  );

  return resolved;
}

async function getProductSeoData(slugOrId: string) {
  const sp = await fetchStrapiProductBySlug(slugOrId);
  if (!sp || sp.isActive === false) return null;

  const slug = String(sp.slug || slugOrId);
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

  const desc = extractTextFromRich(sp.description);
  const titleBase = pickText(sp.title) || "Товар Lioneto";
  const brandName = pickText(sp.brand) || "Lioneto";
  const material = pickText(sp.material, sp.materialText);
  const color = pickText(sp.color, sp.colorText);
  const size = pickText(sp.size, sp.sizeText);

  const fallbackDescriptionParts = [
    titleBase,
    "премиальная мебель Lioneto",
    "Ташкент",
    material ? `материал: ${material}` : null,
    color ? `цвет: ${color}` : null,
    size ? `размер: ${size}` : null,
    "смотрите фото, описание, характеристики и доступные варианты",
  ].filter(Boolean);

  const descriptionFinal = desc || `${fallbackDescriptionParts.join(". ")}.`;

  const canonical = `${BASE_URL}/product/${slug}`;

  const seoTitleParts = [
    titleBase,
    material || null,
    color || null,
    "купить в Ташкенте",
  ].filter(Boolean);

  const seoTitle = `${seoTitleParts.join(" — ")} | Lioneto`;

  const keywords = [
    titleBase,
    `${titleBase} Lioneto`,
    `${titleBase} Ташкент`,
    `${titleBase} купить в Ташкенте`,
    material ? `${titleBase} ${material}` : null,
    color ? `${titleBase} ${color}` : null,
    size ? `${titleBase} ${size}` : null,
    brandName,
    "мебель в Ташкенте",
    "премиальная мебель Ташкент",
  ].filter(Boolean) as string[];

  return {
    sp,
    slug,
    titleBase,
    brandName,
    canonical,
    image: galleryFinal[0] || image || `${BASE_URL}/og-image.jpg`,
    gallery: galleryFinal,
    description: descriptionFinal,
    sku: pickText(sp.sku) || slug,
    material,
    color,
    size,
    seoTitle,
    keywords,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const seo = await getProductSeoData(id);

  if (!seo) {
    return {
      title: "Товар не найден | Lioneto",
      description: "Запрашиваемый товар не найден.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  return {
    title: seo.seoTitle,
    description: seo.description,
    keywords: seo.keywords,
    alternates: {
      canonical: seo.canonical,
    },
    openGraph: {
      type: "website",
      url: seo.canonical,
      title: seo.seoTitle,
      description: seo.description,
      siteName: "Lioneto",
      locale: "ru_RU",
      images: seo.image
        ? [
            {
              url: seo.image,
              alt: seo.titleBase,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.seoTitle,
      description: seo.description,
      images: seo.image ? [seo.image] : [],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const seo = await getProductSeoData(id);
  if (!seo) return notFound();

  const { sp, slug, description, sku, canonical, image } = seo;
  const galleryFinal = seo.gallery;

  const relatedStrapi = await fetchRelatedStrapiProducts({
    brand: sp.brand ?? null,
    collection: sp.collection ?? null,
    cat: sp.cat ?? null,
    currentSlug: slug,
  });

  const skuVal = String(sp.sku ?? slug).trim();
  const sizeVal = String(sp.size ?? sp.sizeText ?? "").trim();
  const colorVal = String(sp.color ?? sp.colorText ?? "").trim();
  const materialVal = String(sp.material ?? sp.materialText ?? "").trim();

  const assemblyInstructionUrl = pickStrapiMediaUrl(sp.assemblyInstructionFile);
  const assemblyInstructionName = pickStrapiMediaName(
    sp.assemblyInstructionFile,
  );

  const setItemsRaw = parseSetItemsJson(sp.set_items_json);
  const setItems = await resolveSetItemsImages(setItemsRaw);

  const product = {
    id: slug,
    productId: slug,
    slug,

    title: sp.title || "—",
    badge: "",
    collectionBadge: sp.collectionBadge ?? null,
    hasDiscount: false,
    href: `/product/${slug}`,

    sku: skuVal,
    description,

    article: skuVal,
    size: sizeVal || "—",
    color: colorVal || "—",
    material: materialVal || "—",
    descriptionText: description,
    sizeText: sizeVal || null,
    colorText: colorVal || null,
    materialText: materialVal || null,

    assemblyInstructionTitle: sp.assemblyInstructionTitle?.trim() || "",
    assemblyInstructionFile: assemblyInstructionUrl
      ? {
          url: assemblyInstructionUrl,
          name: assemblyInstructionName || "instruction.pdf",
        }
      : null,

    image: image || "",
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
          .map((v) => {
            if (!isRecord(v)) return null;

            const variantKey =
              typeof v.variantKey === "string"
                ? v.variantKey
                : typeof v.id === "string" || typeof v.id === "number"
                  ? String(v.id)
                  : "";

            const img = pickVariantImageUrl(v);
            const title = typeof v.title === "string" ? v.title : variantKey;
            const type = typeof v.type === "string" ? v.type : "";
            const group = typeof v.group === "string" ? v.group : undefined;

            const pdr =
              typeof v.priceDeltaRUB === "number" ? v.priceDeltaRUB : undefined;
            const pdu =
              typeof v.priceDeltaUZS === "number" ? v.priceDeltaUZS : undefined;

            return {
              id: String(variantKey || ""),
              title: String(title || ""),
              kind: type === "color" ? "color" : "option",
              group,
              priceDeltaRUB: pdr !== undefined ? Number(pdr) : undefined,
              priceDeltaUZS: pdu !== undefined ? Number(pdu) : undefined,
              image: img,
            };
          })
          .filter((x): x is NonNullable<typeof x> => !!x && !!x.id)
      : [],

    brand: norm(sp.brand),
    collectionLabel: String(sp.brand ?? "").toUpperCase(),

    extra: {
      article: skuVal,
      size: sizeVal || "—",
      color: colorVal || "—",
      material: materialVal || "—",
    },

    setItems,
    isCollection:
      String(sp.module ?? "")
        .trim()
        .toLowerCase() === "scene",

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

  const variantsFixed = (product.variants ?? []).map((v) => {
    const rawKind = String((v as { kind?: unknown })?.kind ?? "").toLowerCase();
    return {
      ...v,
      kind: (rawKind === "color" ? "color" : "option") as "color" | "option",
    };
  });

  const productFixed = { ...product, variants: variantsFixed };

  const offerCurrency =
    productFixed.price_uzs > 0
      ? "UZS"
      : productFixed.price_rub > 0
        ? "RUB"
        : null;

  const offerPrice =
    productFixed.price_uzs > 0
      ? productFixed.price_uzs
      : productFixed.price_rub > 0
        ? productFixed.price_rub
        : null;

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: productFixed.title,
    image: productFixed.gallery,
    description,
    sku,
    mpn: sku,
    brand: {
      "@type": "Brand",
      name: pickText(sp.brand) || "Lioneto",
    },
    category: pickText(sp.cat, sp.module, sp.collection) || undefined,
    material: materialVal || undefined,
    color: colorVal || undefined,
    additionalProperty: [
      sizeVal
        ? {
            "@type": "PropertyValue",
            name: "Размер",
            value: sizeVal,
          }
        : null,
      materialVal
        ? {
            "@type": "PropertyValue",
            name: "Материал",
            value: materialVal,
          }
        : null,
      colorVal
        ? {
            "@type": "PropertyValue",
            name: "Цвет",
            value: colorVal,
          }
        : null,
    ].filter(Boolean),
    offers:
      offerPrice && offerCurrency
        ? {
            "@type": "Offer",
            price: String(offerPrice),
            priceCurrency: offerCurrency,
            availability: "https://schema.org/InStock",
            url: canonical,
            itemCondition: "https://schema.org/NewCondition",
            seller: {
              "@type": "Organization",
              name: "Lioneto",
            },
          }
        : undefined,
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Главная",
        item: BASE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Каталог",
        item: `${BASE_URL}/catalog`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: productFixed.title,
        item: canonical,
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <ProductClient product={productFixed} />
    </>
  );
}
