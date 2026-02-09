// app/lib/mock/collections-data/salvador.ts
import { makeGallery, makeProduct, type CatalogProduct } from "../catalog-base";

export const SALVADOR_PRODUCTS: CatalogProduct[] = [
  // =========================
  // КОМОДЫ — SALVADOR
  // =========================
  makeProduct({
    id: "salvador-komody-komod",
    title: "Комод",
    brand: "salvador",
    cat: "komody",
    basePath: "/products/salvador/komody/komod",
    gallery: makeGallery("/products/salvador/komody/komod", 1),
    priceUZS: 0,
    priceRUB: 0,
    attrs: { subType: "komod" },
  }),

  // =========================
  // ЗЕРКАЛА — SALVADOR
  // =========================
  makeProduct({
    id: "salvador-zerkala-round",
    title: "Зеркало круглое",
    brand: "salvador",
    cat: "zerkala",
    basePath: "/products/salvador/zerkala/round",
    gallery: makeGallery("/products/salvador/zerkala/round", 1),
    priceUZS: 0,
    priceRUB: 0,
    attrs: { subType: "round" },
  }),

  // =========================
  // КРОВАТИ — SALVADOR
  // =========================
  makeProduct({
    id: "salvador-krovati-bed-mechanism",
    title: "Кровать с подъёмным механизмом",
    brand: "salvador",
    cat: "krovati",
    basePath: "/products/salvador/krovati/bed-mechanism",
    gallery: makeGallery("/products/salvador/krovati/bed-mechanism", 2),

    // ✅ цена только тут (как было у тебя)
    priceUZS: 18_900_000,
    priceRUB: 0,

    variants: [
      {
        id: "mechanism-base",
        title: "Без подъёмного механизма",
        kind: "option",
        group: "mechanism",
        priceDeltaUZS: 0,
        priceDeltaRUB: 0,
        gallery: ["/products/salvador/krovati/bed-mechanism/01.jpg"],
      },
      {
        id: "mechanism-lift",
        title: "С подъёмным механизмом",
        kind: "option",
        group: "mechanism",
        priceDeltaUZS: 3_000_000,
        priceDeltaRUB: 0,
        gallery: ["/products/salvador/krovati/bed-mechanism/02.jpg"],
      },
    ],

    attrs: { subType: "bed-mechanism" } as any,
  }),

  // =========================
  // СТОЛЫ — SALVADOR
  // =========================
  makeProduct({
    id: "salvador-stoli-stol-toilet",
    title: "Стол туалетный",
    brand: "salvador",
    cat: "stoli",
    basePath: "/products/salvador/stoli/stol-toilet",
    gallery: makeGallery("/products/salvador/stoli/stol-toilet", 1),
    priceUZS: 0,
    priceRUB: 0,
    attrs: { subType: "stol-toilet" },
  }),

  // =========================
  // ТУМБЫ — SALVADOR
  // =========================
  makeProduct({
    id: "salvador-tumby-tumba-bedside",
    title: "Тумба прикроватная",
    brand: "salvador",
    cat: "tumby",
    basePath: "/products/salvador/tumby/tumba-bedside",
    gallery: makeGallery("/products/salvador/tumby/tumba-bedside", 1),
    priceUZS: 0,
    priceRUB: 0,
    attrs: { subType: "tumba-bedside" },
  }),
  makeProduct({
    id: "salvador-tumby-tumba-tv",
    title: "Тумба ТВ",
    brand: "salvador",
    cat: "tumby",
    basePath: "/products/salvador/tumby/tumba-tv",
    gallery: makeGallery("/products/salvador/tumby/tumba-tv", 1),
    priceUZS: 0,
    priceRUB: 0,
    attrs: { subType: "tumba-tv" },
  }),

  // =========================
  // ФАСАДЫ — SALVADOR
  // =========================
  makeProduct({
    id: "salvador-fasadi-blind",
    title: "Фасад глухой",
    brand: "salvador",
    cat: "fasadi",
    basePath: "/products/salvador/fasadi/blind",
    gallery: makeGallery("/products/salvador/fasadi/blind", 1),
    priceUZS: 0,
    priceRUB: 0,
    attrs: { subType: "blind" },
  }),
  makeProduct({
    id: "salvador-fasadi-mirror",
    title: "Фасад зеркальный",
    brand: "salvador",
    cat: "fasadi",
    basePath: "/products/salvador/fasadi/mirror",
    gallery: makeGallery("/products/salvador/fasadi/mirror", 1),
    priceUZS: 0,
    priceRUB: 0,
    attrs: { subType: "mirror" },
  }),

  // =========================
  // ШКАФЫ — SALVADOR
  // =========================
  makeProduct({
    id: "salvador-shkafy-2d",
    title: "Шкаф двухстворчатый",
    brand: "salvador",
    cat: "shkafy",
    basePath: "/products/salvador/shkafy/2d",
    gallery: makeGallery("/products/salvador/shkafy/2d", 1),
    priceUZS: 0,
    priceRUB: 0,
    attrs: { doors: 2 },
  }),
  makeProduct({
    id: "salvador-shkafy-4d",
    title: "Шкаф четырёхстворчатый",
    brand: "salvador",
    cat: "shkafy",
    basePath: "/products/salvador/shkafy/4d",
    gallery: makeGallery("/products/salvador/shkafy/4d", 1),
    priceUZS: 0,
    priceRUB: 0,
    attrs: { doors: 4 },
  }),
  makeProduct({
    id: "salvador-shkafy-4d-mirror",
    title: "Шкаф четырёхстворчатый с зеркальными фасадами",
    brand: "salvador",
    cat: "shkafy",
    basePath: "/products/salvador/shkafy/4d-mirror",
    gallery: makeGallery("/products/salvador/shkafy/4d-mirror", 1),
    priceUZS: 0,
    priceRUB: 0,
    attrs: { doors: 4, facade: "mirror" },
  }),

  // =========================
  // ДЕКОР — SALVADOR
  // =========================
  makeProduct({
    id: "salvador-dekor-wardrobe-set",
    title: "Комплект декора на шкаф",
    brand: "salvador",
    cat: "dekor",
    basePath: "/products/salvador/dekor/wardrobe-set",
    gallery: makeGallery("/products/salvador/dekor/wardrobe-set", 1),
    priceUZS: 0,
    priceRUB: 0,
    attrs: { subType: "wardrobe-set" },
  }),
];
