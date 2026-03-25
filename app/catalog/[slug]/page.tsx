import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ComponentProps } from "react";
import ProductClient from "@/app/product/[id]/ui/ProductClient";

import { megaCategories, MEGA_PREVIEWS } from "@/app/lib/headerData";
import { CATALOG_MOCK, CATALOG_BY_ID } from "@/app/lib/mock/catalog-products";

const BASE_URL = "https://lioneto.com";

function titleCase(s: string) {
  if (!s) return s;
  return s.slice(0, 1).toUpperCase() + s.slice(1);
}

function parseCollectionSlug(slug: string) {
  const m = slug?.match(/^collection-([a-z0-9-]+)-([a-z0-9-]+)$/i);
  if (!m) return null;
  return { brand: m[1], category: m[2] };
}

function pickLabel(obj: unknown): string | undefined {
  if (!obj || typeof obj !== "object") return undefined;
  const o = obj as Record<string, unknown>;
  const v = o.label ?? o.title ?? o.name;
  return typeof v === "string" ? v : undefined;
}

function xfnv1a(str: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function pickDeterministic<T>(items: T[], key: string, count: number) {
  if (items.length <= count) return items;
  const rand = mulberry32(xfnv1a(key));
  const pool = [...items];
  const out: T[] = [];
  while (out.length < count && pool.length) {
    const idx = Math.floor(rand() * pool.length);
    const picked = pool.splice(idx, 1)[0];
    if (picked !== undefined) out.push(picked);
  }
  return out;
}

type CatalogModule = {
  id: string | number;
  title?: string | null;
  image?: string | null;
  price_rub?: number | null;
  price_uzs?: number | null;
  badge?: string | null;
  collectionKey?: string | null;
  slug?: string | null;
};

function isCatalogModule(v: unknown): v is CatalogModule {
  if (!v || typeof v !== "object") return false;
  const o = v as Record<string, unknown>;
  return "id" in o;
}

type ShowcaseShape = {
  price_uzs?: number | null;
  price_rub?: number | null;
};

type PreviewShape = {
  main?: unknown;
  a?: unknown;
  b?: unknown;
  label?: unknown;
  title?: unknown;
  name?: unknown;
};

function asString(v: unknown): string | undefined {
  return typeof v === "string" && v.trim() ? v : undefined;
}

function toFiniteNum(v: unknown): number | undefined {
  const n = Number(v);
  return Number.isFinite(n) ? n : undefined;
}

function minFinite(nums: Array<number | undefined>) {
  let best: number | undefined;
  for (const n of nums) {
    if (typeof n !== "number") continue;
    if (best === undefined || n < best) best = n;
  }
  return best;
}

function buildCatalogCollectionState(slug: string) {
  if (!slug) return null;

  const href = `/catalog/${slug}`;
  const parsed = parseCollectionSlug(slug);
  if (!parsed) return null;

  const found = megaCategories
    .flatMap((c) => c.items.map((it) => ({ cat: c, it })))
    .find((x) => x.it.href === href);

  const categoryLabel =
    pickLabel(found?.cat) ?? titleCase(parsed.category ?? "Категория");

  const collectionLabel =
    pickLabel(found?.it) ?? titleCase(parsed.brand ?? "Коллекция");

  const previewRaw = MEGA_PREVIEWS[href] as unknown;
  const preview: PreviewShape | undefined =
    previewRaw && typeof previewRaw === "object"
      ? (previewRaw as PreviewShape)
      : undefined;

  const collectionId = `col-${parsed.brand}-${parsed.category}`;

  const modulesAll = (
    Array.isArray(CATALOG_MOCK) ? (CATALOG_MOCK as unknown[]) : []
  )
    .filter(isCatalogModule)
    .filter((p) => p.collectionKey === collectionId);

  if (!modulesAll.length) return null;

  const showcaseRaw = CATALOG_BY_ID.get(collectionId) as unknown;
  const showcase: ShowcaseShape | undefined =
    showcaseRaw && typeof showcaseRaw === "object"
      ? (showcaseRaw as ShowcaseShape)
      : undefined;

  const showcaseUzs = toFiniteNum(showcase?.price_uzs);
  const showcaseRub = toFiniteNum(showcase?.price_rub);

  const minUzs = minFinite(modulesAll.map((x) => toFiniteNum(x.price_uzs)));
  const minRub = minFinite(modulesAll.map((x) => toFiniteNum(x.price_rub)));

  const price_uzs =
    showcaseUzs && showcaseUzs > 0 ? showcaseUzs : (minUzs ?? 0);
  const price_rub =
    showcaseRub && showcaseRub > 0 ? showcaseRub : (minRub ?? 0);

  const previewMain = asString(preview?.main);
  const previewA = asString(preview?.a);
  const previewB = asString(preview?.b);
  const firstImage = asString(modulesAll[0]?.image) ?? "";

  const gallery = [previewMain, previewA, previewB, firstImage]
    .filter((v): v is string => typeof v === "string" && v.length > 0)
    .map(String);

  return {
    slug,
    href,
    parsed,
    found,
    categoryLabel,
    collectionLabel,
    previewRaw,
    preview,
    collectionId,
    modulesAll,
    price_uzs,
    price_rub,
    previewMain,
    previewA,
    previewB,
    firstImage,
    gallery,
  };
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const state = buildCatalogCollectionState(slug);

  if (!state) {
    return {
      title: "Коллекция не найдена | Lioneto",
      description: "Запрашиваемая коллекция не найдена.",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = `${state.collectionLabel} — ${state.categoryLabel} | Lioneto`;
  const description =
    state.modulesAll.length > 0
      ? `Коллекция ${state.collectionLabel} для категории «${state.categoryLabel}» от Lioneto. Фото витрины, состав коллекции и модули: ${state.modulesAll.length} позиций.`
      : `Коллекция ${state.collectionLabel} от Lioneto.`;

  const canonical = `${BASE_URL}${state.href}`;
  const image = state.gallery[0] || `${BASE_URL}/og-image.jpg`;

  return {
    title,
    description,
    alternates: {
      canonical,
    },
    openGraph: {
      type: "website",
      url: canonical,
      title,
      description,
      siteName: "Lioneto",
      images: image
        ? [
            {
              url: image,
              alt: `Коллекция ${state.collectionLabel}`,
            },
          ]
        : [],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: image ? [image] : [],
    },
  };
}

export default async function CatalogSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const state = buildCatalogCollectionState(slug);
  if (!state) return notFound();

  const {
    href,
    parsed,
    categoryLabel,
    collectionLabel,
    previewRaw,
    collectionId,
    modulesAll,
    price_uzs,
    price_rub,
    previewMain,
    firstImage,
    gallery,
  } = state;

  const modules4 = pickDeterministic(modulesAll, collectionId, 4);
  const canonical = `${BASE_URL}${href}`;

  type ProductClientProduct = ComponentProps<typeof ProductClient>["product"];

  const product = {
    id: collectionId,
    title: pickLabel(previewRaw) ?? `Коллекция «${collectionLabel}»`,
    badge: "Коллекция",
    href,
    sku: collectionId.toUpperCase(),
    image: previewMain ?? firstImage,
    gallery: gallery.length ? gallery : [firstImage],

    price_rub,
    price_uzs,

    description:
      "Это витрина коллекции. Вы можете добавить коллекцию в корзину как единый товар, либо выбрать модуль ниже и посмотреть характеристики.",

    extra: {
      article: collectionId.toUpperCase(),
      size: "—",
      color: "—",
      material: "—",
    },

    related: modules4.map((x) => {
      const productSlug = asString(x.slug) || String(x.id);

      return {
        id: String(x.id),
        title: x.title ?? "",
        image: asString(x.image) ?? "",
        price_rub: toFiniteNum(x.price_rub) ?? 0,
        price_uzs: toFiniteNum(x.price_uzs) ?? 0,
        href: `/product/${productSlug}`,
        badge: x.badge ?? "",
      };
    }),

    brand: parsed.brand,
    category: parsed.category,
    collectionHref: href,
    categoryLabel,
    collectionLabel,
    collectionPreview: previewRaw,

    isCollection: true,
  } as ProductClientProduct;

  const collectionTitle =
    pickLabel(previewRaw) ?? `Коллекция ${collectionLabel}`;
  const image = product.gallery?.[0] || `${BASE_URL}/og-image.jpg`;

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
        name: collectionTitle,
        item: canonical,
      },
    ],
  };

  const collectionPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: collectionTitle,
    url: canonical,
    description: product.description,
    image: product.gallery,
    isPartOf: {
      "@type": "WebSite",
      name: "Lioneto",
      url: BASE_URL,
    },
    about: {
      "@type": "Thing",
      name: `${collectionLabel} ${categoryLabel}`,
    },
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${collectionTitle} — модули коллекции`,
    url: canonical,
    numberOfItems: modulesAll.length,
    itemListElement: modulesAll.slice(0, 12).map((x, index) => {
      const productSlug = asString(x.slug) || String(x.id);
      const itemUrl = `${BASE_URL}/product/${productSlug}`;

      return {
        "@type": "ListItem",
        position: index + 1,
        url: itemUrl,
        name: x.title ?? `Модуль ${index + 1}`,
        image: asString(x.image) || image,
      };
    }),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionPageJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <ProductClient product={product} />
    </>
  );
}
