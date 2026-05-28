import type { Metadata } from "next";
import { notFound } from "next/navigation";
import type { ComponentProps } from "react";
import ProductClient from "@/app/product/[id]/ui/ProductClient";

import { megaCategories, MEGA_PREVIEWS } from "@/app/lib/headerData";
import { CATALOG_MOCK, CATALOG_BY_ID } from "@/app/lib/mock/catalog-products";
import { strapiFetch } from "@/app/lib/strapi";

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
  price_kz?: number | null;
  price_tj?: number | null;
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
  price_kz?: number | null;
  price_tj?: number | null;
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
  const showcaseKz = toFiniteNum(showcase?.price_kz);
  const showcaseTj = toFiniteNum(showcase?.price_tj);

  const minUzs = minFinite(modulesAll.map((x) => toFiniteNum(x.price_uzs)));
  const minRub = minFinite(modulesAll.map((x) => toFiniteNum(x.price_rub)));
  const minKz = minFinite(modulesAll.map((x) => toFiniteNum(x.price_kz)));
  const minTj = minFinite(modulesAll.map((x) => toFiniteNum(x.price_tj)));

  const price_uzs =
    showcaseUzs && showcaseUzs > 0 ? showcaseUzs : (minUzs ?? 0);
  const price_rub =
    showcaseRub && showcaseRub > 0 ? showcaseRub : (minRub ?? 0);
  const price_kz = showcaseKz && showcaseKz > 0 ? showcaseKz : (minKz ?? 0);
  const price_tj = showcaseTj && showcaseTj > 0 ? showcaseTj : (minTj ?? 0);

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
    price_kz,
    price_tj,
    previewMain,
    previewA,
    previewB,
    firstImage,
    gallery,
  };
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function getRecord(v: unknown, key: string): Record<string, unknown> | null {
  if (!isRecord(v)) return null;
  const value = v[key];
  return isRecord(value) ? value : null;
}

function getValue(obj: unknown, ...keys: string[]) {
  let current: unknown = obj;
  for (const key of keys) {
    if (!isRecord(current)) return undefined;
    current = current[key];
  }
  return current;
}

function getText(obj: unknown, ...keys: string[]) {
  const value = getValue(obj, ...keys);
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function getNum(obj: unknown, ...keys: string[]) {
  const value = getValue(obj, ...keys);
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

function unwrapEntity(entity: unknown): Record<string, unknown> | null {
  if (!isRecord(entity)) return null;

  const attrs = getRecord(entity, "attributes");
  if (attrs) {
    const id = entity["id"];
    return isRecord(attrs)
      ? {
          ...(typeof id === "number" || typeof id === "string" ? { id } : {}),
          ...attrs,
        }
      : null;
  }

  return entity;
}

function unwrapRelationOne(value: unknown): Record<string, unknown> | null {
  if (!value) return null;

  if (isRecord(value) && "data" in value) {
    return unwrapEntity((value as Record<string, unknown>).data);
  }

  return unwrapEntity(value);
}

function unwrapRelationMany(value: unknown): Record<string, unknown>[] {
  if (!value) return [];

  if (isRecord(value) && "data" in value) {
    const data = (value as Record<string, unknown>).data;
    return Array.isArray(data)
      ? (data.map(unwrapEntity).filter(Boolean) as Record<string, unknown>[])
      : [];
  }

  if (Array.isArray(value)) {
    return value.map(unwrapEntity).filter(Boolean) as Record<string, unknown>[];
  }

  return [];
}

function buildStrapiMediaUrl(url?: string | null) {
  const raw = String(url ?? "").trim();
  if (!raw) return "";

  if (/^https?:\/\//i.test(raw)) return raw;

  const base = (process.env.NEXT_PUBLIC_STRAPI_URL || "")
    .trim()
    .replace(/\/$/, "");
  if (!base) return raw;

  return `${base}${raw.startsWith("/") ? raw : `/${raw}`}`;
}

function buildSceneProductSlug(brand: string, category: string) {
  return `scene-${category}-${brand}`;
}

type SceneSetItem = {
  id: string;
  title: string;
  article?: string;
  price_rub?: number;
  price_uzs?: number;
  price_kz?: number;
  price_tj?: number;
  href?: string;
  quantity?: number;
};

type StrapiSceneData = {
  sceneProduct: Record<string, unknown> | null;
  setItems: SceneSetItem[];
};

function parseSetItemsJson(value: unknown): SceneSetItem[] {
  if (!Array.isArray(value)) return [];

  const result: SceneSetItem[] = [];

  value.forEach((item, index) => {
    if (!isRecord(item)) return;

    const idRaw = item.id;
    const slug = asString(item.slug);
    const title = asString(item.title) ?? "Без названия";

    const id =
      (typeof idRaw === "string" && idRaw.trim()) ||
      (typeof idRaw === "number" ? String(idRaw) : "") ||
      slug ||
      `set-item-${index + 1}`;

    const article = asString(item.article);
    const priceRub = toFiniteNum(item.price_rub);
    const priceUzs = toFiniteNum(item.price_uzs);
    const priceKz = toFiniteNum(item.price_kz);
    const priceTj = toFiniteNum(item.price_tj);
    const quantity = toFiniteNum(item.quantity);

    const setItem: SceneSetItem = {
      id,
      title,
      quantity: quantity ?? 1,
    };

    if (article) {
      setItem.article = article;
    }

    if (typeof priceRub === "number") {
      setItem.price_rub = priceRub;
    }

    if (typeof priceUzs === "number") {
      setItem.price_uzs = priceUzs;
    }

    if (typeof priceKz === "number") {
      setItem.price_kz = priceKz;
    }

    if (typeof priceTj === "number") {
      setItem.price_tj = priceTj;
    }

    if (slug) {
      setItem.href = `/product/${slug}`;
    }

    result.push(setItem);
  });

  return result;
}

async function getSceneProductSetData(
  brand: string,
  category: string,
): Promise<StrapiSceneData> {
  const sceneSlug = buildSceneProductSlug(brand, category);

  const sceneQuery = `/api/products?filters[slug][$eq]=${encodeURIComponent(
    sceneSlug,
  )}&pagination[pageSize]=1&populate[media]=true&populate[gallery]=true&populate[assemblyInstructionFile]=true`;

  const sceneJson = await strapiFetch<any>(sceneQuery);

  const sceneDataRaw =
    Array.isArray(sceneJson?.data) && sceneJson.data.length > 0
      ? sceneJson.data[0]
      : null;

  const sceneProduct = unwrapEntity(sceneDataRaw);
  const setItems = parseSetItemsJson(sceneProduct?.set_items_json);

  return {
    sceneProduct,
    setItems,
  };
}

function mergeSceneGallery(
  fallbackGallery: string[],
  sceneProduct: Record<string, unknown> | null,
) {
  const mediaOne = unwrapRelationOne(sceneProduct?.media);
  const galleryMany = unwrapRelationMany(sceneProduct?.gallery);

  const fromMedia = buildStrapiMediaUrl(
    getText(mediaOne, "url") ?? getText(mediaOne, "formats", "large", "url"),
  );

  const fromGallery = galleryMany
    .map((img) =>
      buildStrapiMediaUrl(
        getText(img, "url") ?? getText(img, "formats", "large", "url"),
      ),
    )
    .filter(Boolean);

  const merged = [fromMedia, ...fromGallery, ...fallbackGallery].filter(
    Boolean,
  );

  return Array.from(new Set(merged));
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
    price_kz,
    price_tj,
    previewMain,
    firstImage,
    gallery,
  } = state;

  const modules4 = pickDeterministic(modulesAll, collectionId, 4);
  const canonical = `${BASE_URL}${href}`;

  const { sceneProduct, setItems } = await getSceneProductSetData(
    parsed.brand,
    parsed.category,
  );

  const mergedGallery = mergeSceneGallery(gallery, sceneProduct);
  const primaryImage = mergedGallery[0] || previewMain || firstImage || "";

  const sceneTitle =
    getText(sceneProduct, "title") ??
    pickLabel(previewRaw) ??
    `Коллекция «${collectionLabel}»`;

  const sceneDescription =
    getText(sceneProduct, "description") ??
    "Это витрина коллекции. Вы можете добавить коллекцию в корзину как единый товар, либо выбрать модуль ниже и посмотреть характеристики.";

  const sceneArticle =
    getText(sceneProduct, "article") ?? collectionId.toUpperCase();

  const sceneSize = getText(sceneProduct, "size") ?? "—";
  const sceneColor = getText(sceneProduct, "color") ?? "—";
  const sceneMaterial = getText(sceneProduct, "material") ?? "—";

  const scenePriceRub =
    getNum(sceneProduct, "priceRUB") ??
    getNum(sceneProduct, "price_rub") ??
    price_rub;

  const scenePriceUzs =
    getNum(sceneProduct, "priceUZS") ??
    getNum(sceneProduct, "price_uzs") ??
    price_uzs;

  const scenePriceKz =
    getNum(sceneProduct, "priceKZ") ??
    getNum(sceneProduct, "price_kz") ??
    price_kz;

  const scenePriceTj =
    getNum(sceneProduct, "priceTJ") ??
    getNum(sceneProduct, "price_tj") ??
    price_tj;

  const sceneOldPriceRub =
    getNum(sceneProduct, "oldPriceRUB") ??
    getNum(sceneProduct, "old_price_rub");

  const sceneOldPriceUzs =
    getNum(sceneProduct, "oldPriceUZS") ??
    getNum(sceneProduct, "old_price_uzs");

  const sceneOldPriceKz =
    getNum(sceneProduct, "oldPriceKZ") ?? getNum(sceneProduct, "old_price_kz");

  const sceneOldPriceTj =
    getNum(sceneProduct, "oldPriceTJ") ?? getNum(sceneProduct, "old_price_tj");

  const assemblyInstructionTitle =
    getText(sceneProduct, "assemblyInstructionTitle") ?? undefined;

  const assemblyInstructionFileEntity = unwrapRelationOne(
    sceneProduct?.assemblyInstructionFile,
  );

  const assemblyInstructionUrl = buildStrapiMediaUrl(
    getText(assemblyInstructionFileEntity, "url"),
  );

  type ProductClientProduct = ComponentProps<typeof ProductClient>["product"];

  const product = {
    id: String(sceneProduct?.documentId ?? sceneProduct?.id ?? collectionId),
    title: sceneTitle,
    badge: "Коллекция",
    href,
    sku: sceneArticle,
    image: primaryImage,
    gallery: mergedGallery.length ? mergedGallery : [firstImage],

    price_rub: scenePriceRub,
    price_uzs: scenePriceUzs,
    price_kz: scenePriceKz,
    price_tj: scenePriceTj,

    old_price_rub: sceneOldPriceRub,
    old_price_uzs: sceneOldPriceUzs,
    old_price_kz: sceneOldPriceKz,
    old_price_tj: sceneOldPriceTj,

    description: sceneDescription,

    extra: {
      article: sceneArticle,
      size: sceneSize,
      color: sceneColor,
      material: sceneMaterial,
    },

    assemblyInstructionTitle,
    assemblyInstructionFile: assemblyInstructionUrl
      ? {
          url: assemblyInstructionUrl,
          name:
            getText(assemblyInstructionFileEntity, "name") ?? "instruction.pdf",
        }
      : null,

    related: modules4.map((x) => {
      const productSlug = asString(x.slug) || String(x.id);

      return {
        id: String(x.id),
        title: x.title ?? "",
        image: asString(x.image) ?? "",
        price_rub: toFiniteNum(x.price_rub) ?? 0,
        price_uzs: toFiniteNum(x.price_uzs) ?? 0,
        price_kz: toFiniteNum(x.price_kz) ?? 0,
        price_tj: toFiniteNum(x.price_tj) ?? 0,
        href: `/product/${productSlug}`,
        badge: x.badge ?? "",
      };
    }),

    setItems,

    brand: parsed.brand,
    category: parsed.category,
    collectionHref: href,
    categoryLabel,
    collectionLabel,
    collectionPreview: previewRaw,

    isCollection: true,
  } as ProductClientProduct;

  const collectionTitle = sceneTitle;
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
