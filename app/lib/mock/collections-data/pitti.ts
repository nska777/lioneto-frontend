// app/lib/mock/collections-data/pitti.ts
import { makeGallery, makeProduct, type CatalogProduct } from "../catalog-base";

export const PITTI_PRODUCTS: CatalogProduct[] = [
  // =========================
  // КОМОДЫ — PITTI
  // =========================

  makeProduct({
    id: "pitti-komody-komod-high",
    title: "Комод высокий",
    brand: "pitti",
    cat: "komody",
    basePath: "/products/pitti/komody/komod-high",
    gallery: makeGallery("/products/pitti/komody/komod-high", 1),
    priceUZS: 0,
    priceRUB: 0,
    attrs: { subType: "komod-high" },
  }),

  makeProduct({
    id: "pitti-komody-komod-combined",
    title: "Комод комбинированный",
    brand: "pitti",
    cat: "komody",
    basePath: "/products/pitti/komody/komod-combined",
    gallery: makeGallery("/products/pitti/komody/komod-combined", 2),
    priceUZS: 0,
    priceRUB: 0,
    attrs: { subType: "komod-combined" },
  }),

  // =========================
  // КРОВАТИ — PITTI
  // =========================

  makeProduct({
    id: "pitti-krovati-bed",
    title: "Кровать",
    brand: "pitti",
    cat: "krovati",
    basePath: "/products/pitti/krovati/bed",
    gallery: makeGallery("/products/pitti/krovati/bed", 2),
    priceUZS: 0,
    priceRUB: 0,
    attrs: { subType: "bed" },
  }),

  // =========================
  // СТОЛЫ — PITTI
  // =========================

  makeProduct({
    id: "pitti-stoli-stol-toilet-mirror",
    title: "Стол туалетный с зеркалом",
    brand: "pitti",
    cat: "stoli",
    basePath: "/products/pitti/stoli/stol-toilet-mirror",
    gallery: makeGallery("/products/pitti/stoli/stol-toilet-mirror", 1),
    priceUZS: 0,
    priceRUB: 0,
    attrs: { subType: "stol-toilet-mirror" },
  }),

  // =========================
  // ТУМБЫ — PITTI
  // =========================

  makeProduct({
    id: "pitti-tumby-tumba-bedside",
    title: "Тумба прикроватная",
    brand: "pitti",
    cat: "tumby",
    basePath: "/products/pitti/tumby/tumba-bedside",
    gallery: makeGallery("/products/pitti/tumby/tumba-bedside", 2),
    priceUZS: 0,
    priceRUB: 0,
    attrs: { subType: "tumba-bedside" },
  }),

  makeProduct({
    id: "pitti-tumby-tumba-tv",
    title: "ТВ тумба",
    brand: "pitti",
    cat: "tumby",
    basePath: "/products/pitti/tumby/tumba-tv",
    gallery: makeGallery("/products/pitti/tumby/tumba-tv", 1),
    priceUZS: 0,
    priceRUB: 0,
    attrs: { subType: "tumba-tv" },
  }),

  // =========================
  // ШКАФЫ — PITTI
  // =========================

  makeProduct({
    id: "pitti-shkafy-shkaf-tall",
    title: "Шкаф высокий",
    brand: "pitti",
    cat: "shkafy",
    basePath: "/products/pitti/shkafy/shkaf-tall",
    gallery: makeGallery("/products/pitti/shkafy/shkaf-tall", 1),
    priceUZS: 0,
    priceRUB: 0,
    attrs: { subType: "shkaf-tall" },
  }),

  makeProduct({
    id: "pitti-shkafy-shkaf-4d",
    title: "Шкаф четырёхстворчатый",
    brand: "pitti",
    cat: "shkafy",
    basePath: "/products/pitti/shkafy/shkaf-4d",
    gallery: makeGallery("/products/pitti/shkafy/shkaf-4d", 2),
    priceUZS: 0,
    priceRUB: 0,
    attrs: { subType: "shkaf-4d" },
  }),
];
