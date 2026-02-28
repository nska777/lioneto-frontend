import { notFound } from "next/navigation";
import type { ComponentProps } from "react";
import ProductClient from "@/app/product/[id]/ui/ProductClient";

import { megaCategories, MEGA_PREVIEWS } from "@/app/lib/headerData";
import { CATALOG_MOCK, CATALOG_BY_ID } from "@/app/lib/mock/catalog-products";

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

export default async function CatalogSlugPage({
  params,
}: {
  params: { slug: string };
}) {
  const { slug } = params;
  if (!slug) return notFound();

  const href = `/catalog/${slug}`;
  const parsed = parseCollectionSlug(slug);
  if (!parsed) return notFound();

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

  if (!modulesAll.length) return notFound();

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

  const modules4 = pickDeterministic(modulesAll, collectionId, 4);

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

    related: modules4.map((x) => ({
      id: String(x.id),
      title: x.title ?? "",
      image: asString(x.image) ?? "",
      price_rub: toFiniteNum(x.price_rub) ?? 0,
      price_uzs: toFiniteNum(x.price_uzs) ?? 0,
      href: `/product/${String(x.id)}`,
      badge: x.badge ?? "",
    })),

    brand: parsed.brand,
    category: parsed.category,
    collectionHref: href,
    categoryLabel,
    collectionLabel,
    collectionPreview: previewRaw,

    isCollection: true,
  } as ProductClientProduct;

  return <ProductClient product={product} />;
}
