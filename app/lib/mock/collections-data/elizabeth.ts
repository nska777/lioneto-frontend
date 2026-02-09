// app/lib/mock/collections-data/elizabeth.ts
import { makeGallery, makeProduct, type CatalogProduct } from "../catalog-base";

export const ELIZABETH_PRODUCTS: CatalogProduct[] = [
  // =========================
  // КРОВАТИ — ELIZABETH
  // =========================
  makeProduct({
    id: "elizabeth-krovati-bed",
    title: "Кровать",
    brand: "elizabeth",
    cat: "krovati",
    basePath: "/products/elizabeth/krovati/bed",
    gallery: makeGallery("/products/elizabeth/krovati/bed", 2),
    priceUZS: 0,
    priceRUB: 0,
    attrs: { subType: "bed" },
  }),

  // =========================
  // КОМОДЫ — ELIZABETH
  // =========================
  makeProduct({
    id: "elizabeth-komody-komod",
    title: "Комод",
    brand: "elizabeth",
    cat: "komody",
    basePath: "/products/elizabeth/komody/komod",
    gallery: makeGallery("/products/elizabeth/komody/komod", 1),
    priceUZS: 0,
    priceRUB: 0,
    attrs: { subType: "komod" },
  }),

  // =========================
  // СТОЛЫ — ELIZABETH
  // =========================
  makeProduct({
    id: "elizabeth-stoli-stol-desk",
    title: "Стол письменный",
    brand: "elizabeth",
    cat: "stoli",
    basePath: "/products/elizabeth/stoli/stol-desk",
    gallery: makeGallery("/products/elizabeth/stoli/stol-desk", 1),
    priceUZS: 0,
    priceRUB: 0,
    attrs: { subType: "stol-desk" },
  }),

  // =========================
  // ТУМБЫ — ELIZABETH
  // =========================
  makeProduct({
    id: "elizabeth-tumby-tumba-bedside-3drawers",
    title: "Тумба прикроватная с тремя ящиками",
    brand: "elizabeth",
    cat: "tumby",
    basePath: "/products/elizabeth/tumby/tumba-bedside-3drawers",
    gallery: makeGallery("/products/elizabeth/tumby/tumba-bedside-3drawers", 1),
    priceUZS: 0,
    priceRUB: 0,
    attrs: { subType: "tumba-bedside-3drawers" },
  }),

  makeProduct({
    id: "elizabeth-tumby-tumba-bedside",
    title: "Тумба прикроватная",
    brand: "elizabeth",
    cat: "tumby",
    basePath: "/products/elizabeth/tumby/tumba-bedside",
    gallery: makeGallery("/products/elizabeth/tumby/tumba-bedside", 1),
    priceUZS: 0,
    priceRUB: 0,
    attrs: { subType: "tumba-bedside" },
  }),

  // =========================
  // ШКАФЫ — ELIZABETH
  // =========================
  makeProduct({
    id: "elizabeth-shkafy-shkaf-4d-drawers",
    title: "Шкаф четырёхстворчатый с выдвижными ящиками",
    brand: "elizabeth",
    cat: "shkafy",
    basePath: "/products/elizabeth/shkafy/shkaf-4d-drawers",
    gallery: makeGallery("/products/elizabeth/shkafy/shkaf-4d-drawers", 2),
    priceUZS: 0,
    priceRUB: 0,
    attrs: { subType: "shkaf-4d-drawers" },
  }),
];
