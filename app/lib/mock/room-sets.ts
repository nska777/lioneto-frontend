// app/lib/mock/room-sets.ts
import type { CatalogProduct } from "./catalog-products";

/**
 * Картинки лежат в public/sections/...
 * Пример:
 * /public/sections/bedrooms/pitti/01.jpg
 * /public/sections/bedrooms/buongiorno/white/01.jpg
 */

const pad2 = (n: number) => String(n).padStart(2, "0");

// Helper: путь к картинке
const img = (
  section: string,
  collection: string,
  file: string,
  variant?: string,
) =>
  variant
    ? `/sections/${section}/${collection}/${variant}/${file}`
    : `/sections/${section}/${collection}/${file}`;

// Helper: генерируем галерею строго по count (01.jpg..NN.jpg)
function makeGallery(
  section: string,
  collection: string,
  count: number,
  variant?: string,
) {
  return Array.from({ length: Math.max(0, count) }, (_, i) => {
    const file = `${pad2(i + 1)}.jpg`;
    return img(section, collection, file, variant);
  });
}

// Helper: main image = первый элемент галереи
function mainFromGallery(gallery: string[]) {
  return gallery[0] ?? "";
}

/**
 * Это "товары-наборы" (Спальня/Гостиная/Молодёжная).
 * Они открываются как обычный продукт: /product/[id]
 *
 * ⚠️ Важно:
 * - Количество миниатюр = gallery.length
 * - Если в папке 2 фото — ставим count=2 и ВСЁ (лишних быть не может)
 * - Если в папке 10 фото — ставим count=10
 */
export const ROOM_SETS: CatalogProduct[] = [
  // -------------------------
  // BEDROOMS
  // -------------------------

  // BUONGIORNO (white) — 2 фото
  (() => {
    const gallery = makeGallery("bedrooms", "buongiorno", 2, "white");
    return {
      id: "set-bedrooms-buongiorno-white",
      title: "Спальня",
      brand: "buongiorno",
      cat: "bedrooms",
      badge: "BUONGIORNO • белый",
      image: mainFromGallery(gallery),
      gallery,
      priceRUB: 0,
      priceUZS: 0,
    } satisfies CatalogProduct;
  })(),

  // BUONGIORNO (cappuccino) — 2 фото
  (() => {
    const gallery = makeGallery("bedrooms", "buongiorno", 2, "cappuccino");
    return {
      id: "set-bedrooms-buongiorno-cappuccino",
      title: "Спальня",
      brand: "buongiorno",
      cat: "bedrooms",
      badge: "BUONGIORNO • капучино",
      image: mainFromGallery(gallery),
      gallery,
      priceRUB: 0,
      priceUZS: 0,
    } satisfies CatalogProduct;
  })(),

  // AMBER — (поставь реальное кол-во, ниже пример 1)
  (() => {
    const gallery = makeGallery("bedrooms", "amber", 1);
    return {
      id: "set-bedrooms-amber",
      title: "Спальня",
      brand: "amber",
      cat: "bedrooms",
      badge: "AMBER",
      image: mainFromGallery(gallery),
      gallery,
      priceRUB: 0,
      priceUZS: 0,
    } satisfies CatalogProduct;
  })(),

  // SCANDI (white) — у тебя по факту 5 фото
  (() => {
    const gallery = makeGallery("bedrooms", "scandi", 5, "white");
    return {
      id: "set-bedrooms-scandi-white",
      title: "Спальня",
      brand: "scandi",
      cat: "bedrooms",
      badge: "SCANDY • белый",
      image: mainFromGallery(gallery),
      gallery,
      priceRUB: 0,
      priceUZS: 0,
    } satisfies CatalogProduct;
  })(),

  // SCANDI (cappuccino) — поставь реальное кол-во (пример 1)
  (() => {
    const gallery = makeGallery("bedrooms", "scandi", 1, "cappuccino");
    return {
      id: "set-bedrooms-scandi-cappuccino",
      title: "Спальня",
      brand: "scandi",
      cat: "bedrooms",
      badge: "SCANDY • капучино",
      image: mainFromGallery(gallery),
      gallery,
      priceRUB: 0,
      priceUZS: 0,
    } satisfies CatalogProduct;
  })(),

  // PITTI — у тебя по факту 10 фото
  (() => {
    const gallery = makeGallery("bedrooms", "pitti", 10);
    return {
      id: "set-bedrooms-pitti",
      title: "Спальня",
      brand: "pitti",
      cat: "bedrooms",
      badge: "PITTI",
      image: mainFromGallery(gallery),
      gallery,
      priceRUB: 0,
      priceUZS: 0,
    } satisfies CatalogProduct;
  })(),

  // ELIZABETH — по факту 2 фото
  (() => {
    const gallery = makeGallery("bedrooms", "elizabeth", 2);
    return {
      id: "set-bedrooms-elizabeth",
      title: "Спальня",
      brand: "elizabeth",
      cat: "bedrooms",
      badge: "ELIZABETH",
      image: mainFromGallery(gallery),
      gallery,
      priceRUB: 0,
      priceUZS: 0,
    } satisfies CatalogProduct;
  })(),

  // SALVADOR — по факту 2 фото
  (() => {
    const gallery = makeGallery("bedrooms", "salvador", 2);
    return {
      id: "set-bedrooms-salvador",
      title: "Спальня",
      brand: "salvador",
      cat: "bedrooms",
      badge: "SALVADOR",
      image: mainFromGallery(gallery),
      gallery,
      priceRUB: 0,
      priceUZS: 0,
    } satisfies CatalogProduct;
  })(),
];
