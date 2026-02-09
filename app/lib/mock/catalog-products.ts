// app/lib/mock/catalog-products.ts
// ✅ Тонкий сборщик: BRANDS / CATS / COLLECTION_PRODUCTS / CATALOG_MOCK / CATALOG_BY_ID
// ✅ + DEV-защита: лог дублей id (чтобы не было "кровать из SCANDI везде")

export type {
  BrandItem,
  CatItem,
  CatalogVariant,
  CatalogProduct,
} from "./catalog-base";
import type { BrandItem, CatItem, CatalogProduct } from "./catalog-base";

// ✅ генератор сцен (спальни / гостиные / молодежные) → товары
import { buildSectionSceneProducts } from "./section-scenes-as-products";

import {
  SCANDI_PRODUCTS,
  SALVADOR_PRODUCTS,
  PITTI_PRODUCTS,
  ELIZABETH_PRODUCTS,
  BUONGIORNO_PRODUCTS,
  AMBER_PRODUCTS,
} from "./collections-data";

// ==============================
// BRANDS (коллекции)
// ==============================
export const BRANDS: BrandItem[] = [
  { title: "AMBER", slug: "amber" },
  { title: "BUONGIORNO", slug: "buongiorno" },
  { title: "ELIZABETH", slug: "elizabeth" },
  { title: "PITTI", slug: "pitti" },
  { title: "SALVADOR", slug: "salvador" },
  { title: "SCANDY", slug: "scandi" },
];

// ==============================
// CATS (категории / модули + комнаты)
// ⚠️ slug должен совпадать с путями в public
// ==============================
export const CATS: CatItem[] = [
  // модули
  { title: "Фасады", slug: "fasadi" },
  { title: "Комоды", slug: "komody" },
  { title: "Кровати", slug: "krovati" },
  { title: "Плинтусы", slug: "plintusy" },
  { title: "Полки", slug: "polki" },
  { title: "Шкафы", slug: "shkafy" },
  { title: "Стеллажи", slug: "stellaji" },
  { title: "Столы", slug: "stoli" },
  { title: "Тумбы", slug: "tumby" },
  { title: "Вешалки", slug: "veshalki" },
  { title: "Витрины", slug: "vitrini" },
  { title: "Зеркала", slug: "zerkala" },
  { title: "Пуфы", slug: "pufi" },

  // комнаты (как товары)
  { title: "Спальни", slug: "bedrooms" },
  { title: "Гостиные", slug: "living" },
  { title: "Молодёжные", slug: "youth" },
];

// ==============================
// /collection/[key]
// ==============================
export type CollectionItem = { id: string; title: string };
export const COLLECTION_PRODUCTS: CollectionItem[] = BRANDS.map((b) => ({
  id: b.slug,
  title: b.title,
}));

// ==============================
// SECTION SCENES → PRODUCTS
// ==============================
const SECTION_SCENE_PRODUCTS: CatalogProduct[] =
  buildSectionSceneProducts();

// ==============================
// CATALOG_MOCK (единый источник правды)
// ==============================
export const CATALOG_MOCK: CatalogProduct[] = [
  // модульные товары
  ...SCANDI_PRODUCTS,
  ...SALVADOR_PRODUCTS,
  ...PITTI_PRODUCTS,
  ...ELIZABETH_PRODUCTS,
  ...BUONGIORNO_PRODUCTS,
  ...AMBER_PRODUCTS,

  // сцены как товары (спальни / гостиные / молодежные)
  ...SECTION_SCENE_PRODUCTS,
];

// ==============================
// DEV: защита от дублей id
// ==============================
if (process.env.NODE_ENV !== "production") {
  const seen = new Set<string>();
  const dups: string[] = [];

  for (const p of CATALOG_MOCK) {
    const id = String(p.id);
    if (seen.has(id)) dups.push(id);
    else seen.add(id);
  }

  if (dups.length) {
    // eslint-disable-next-line no-console
    console.error("❌ DUPLICATE PRODUCT IDs in CATALOG_MOCK:", dups);
  }
}

// ==============================
// Быстрый доступ по id
// ==============================
export const CATALOG_BY_ID = new Map<string, CatalogProduct>(
  CATALOG_MOCK.map((p) => [String(p.id), p]),
);

// запасной вариант (если где-то был object-доступ)
export const CATALOG_BY_ID_OBJ = Object.fromEntries(
  CATALOG_MOCK.map((p) => [String(p.id), p]),
) as Record<string, CatalogProduct>;
