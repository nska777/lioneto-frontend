import { notFound } from "next/navigation";
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

// ✅ минимальный safe-reader для объектов из headerData (без правок типов)
function pickLabel(obj: unknown): string | undefined {
  if (!obj || typeof obj !== "object") return undefined;
  const o = obj as Record<string, unknown>;
  const v = o.label ?? o.title ?? o.name;
  return typeof v === "string" ? v : undefined;
}

// ✅ детерминированный "рандом" (4 модуля не прыгают)
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
    out.push(pool.splice(idx, 1)[0]);
  }
  return out;
}

export default async function CatalogSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
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

  const preview = MEGA_PREVIEWS[href] as unknown;
  const collectionId = `col-${parsed.brand}-${parsed.category}`;

  // ✅ строго: только модули этой витрины
  const modulesAll = (CATALOG_MOCK as any[]).filter(
    (p) => p.collectionKey === collectionId,
  );
  if (!modulesAll.length) return notFound();

  // ✅ цену берём из витрины
  const showcase = CATALOG_BY_ID.get(collectionId) as any;

  const price_uzs =
    Number(showcase?.price_uzs ?? 0) ||
    Math.min(...modulesAll.map((x) => Number(x.price_uzs ?? 0)));

  const price_rub =
    Number(showcase?.price_rub ?? 0) ||
    Math.min(...modulesAll.map((x) => Number(x.price_rub ?? 0)));

  // gallery sources (preview + fallback)
  const previewMain =
    (preview && typeof preview === "object"
      ? (preview as any).main
      : undefined) ?? undefined;

  const previewA =
    preview && typeof preview === "object" ? (preview as any).a : undefined;

  const previewB =
    preview && typeof preview === "object" ? (preview as any).b : undefined;

  const gallery = [previewMain, previewA, previewB, modulesAll[0]?.image]
    .filter(Boolean)
    .map(String);

  // ✅ 4 модуля → в блок "Товары коллекции" внутри ProductClient
  const modules4 = pickDeterministic(modulesAll, collectionId, 4);

  const product = {
    id: collectionId,
    title: pickLabel(preview) ?? `Коллекция «${collectionLabel}»`,
    badge: "Коллекция",
    href,
    sku: collectionId.toUpperCase(),
    image: (previewMain as any) || modulesAll[0].image,
    gallery: gallery.length ? gallery : [modulesAll[0].image],

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
      id: String((x as any).id),
      title: (x as any).title,
      image: (x as any).image,
      price_rub: Number((x as any).price_rub ?? 0),
      price_uzs: Number((x as any).price_uzs ?? 0),
      href: `/product/${(x as any).id}`,
      badge: (x as any).badge || "",
    })),

    brand: parsed.brand,
    category: parsed.category,
    collectionHref: href,
    categoryLabel,
    collectionLabel,
    collectionPreview: preview,

    isCollection: true,
  };

  return <ProductClient product={product as any} />;
}
