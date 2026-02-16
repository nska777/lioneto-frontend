// app/lib/mock/collections-data/buongiorno.ts
import { makeGallery, makeProduct, type CatalogProduct } from "../catalog-base";

const ROSE = "Бежевая роза";
const WHITE = "Белая";

//  временно: белый цвет дороже на 800 000 сум 
const WHITE_DELTA_UZS = 800_000;

export const BUONGIORNO_PRODUCTS: CatalogProduct[] = [
  // =========================
  // ВИТРИНЫ — BUONGIORNO
  // =========================
  makeProduct({
    id: "buongiorno-vitrini-vitrina-2d",
    title: "Витрина двухстворчатая",
    brand: "buongiorno",
    cat: "vitrini",
    basePath: "/products/buongiorno/vitrini/vitrina-2d",
    gallery: makeGallery("/products/buongiorno/vitrini/vitrina-2d", 2),

    priceUZS: 12_900_000,
    priceRUB: 0,

    variants: [
      {
        id: "color-rose",
        title: ROSE,
        kind: "color",
        group: "color",
        priceDeltaUZS: 0,
        priceDeltaRUB: 0,
        gallery: ["/products/buongiorno/vitrini/vitrina-2d/01.jpg"],
      },
      {
        id: "color-white",
        title: WHITE,
        kind: "color",
        group: "color",
        priceDeltaUZS: WHITE_DELTA_UZS,
        priceDeltaRUB: 0,
        gallery: ["/products/buongiorno/vitrini/vitrina-2d/02.jpg"],
      },
    ],

    attrs: { doors: 2, subType: "vitrina-2d" },
  }),

  makeProduct({
    id: "buongiorno-vitrini-vitrina-1d",
    title: "Витрина одностворчатая",
    brand: "buongiorno",
    cat: "vitrini",
    basePath: "/products/buongiorno/vitrini/vitrina-1d",
    gallery: makeGallery("/products/buongiorno/vitrini/vitrina-1d", 2),

    priceUZS: 11_900_000,
    priceRUB: 0,

    variants: [
      {
        id: "color-rose",
        title: ROSE,
        kind: "color",
        group: "color",
        priceDeltaUZS: 0,
        priceDeltaRUB: 0,
        gallery: ["/products/buongiorno/vitrini/vitrina-1d/01.jpg"],
      },
      {
        id: "color-white",
        title: WHITE,
        kind: "color",
        group: "color",
        priceDeltaUZS: WHITE_DELTA_UZS,
        priceDeltaRUB: 0,
        gallery: ["/products/buongiorno/vitrini/vitrina-1d/02.jpg"],
      },
    ],

    attrs: { doors: 1, subType: "vitrina-1d" },
  }),

  // =========================
  // ЗЕРКАЛА — BUONGIORNO
  // =========================
  makeProduct({
    id: "buongiorno-zerkala-mirror-big",
    title: "Зеркало большое",
    brand: "buongiorno",
    cat: "zerkala",
    basePath: "/products/buongiorno/zerkala/mirror-big",
    gallery: makeGallery("/products/buongiorno/zerkala/mirror-big", 2),

    priceUZS: 2_900_000,
    priceRUB: 0,

    // ✅ тут у тебя 01/02 перепутаны по цветам — оставляю как ты настроил:
    // ROSE -> 02, WHITE -> 01
    variants: [
      {
        id: "color-rose",
        title: ROSE,
        kind: "color",
        group: "color",
        priceDeltaUZS: 0,
        priceDeltaRUB: 0,
        gallery: ["/products/buongiorno/zerkala/mirror-big/02.jpg"],
      },
      {
        id: "color-white",
        title: WHITE,
        kind: "color",
        group: "color",
        priceDeltaUZS: WHITE_DELTA_UZS,
        priceDeltaRUB: 0,
        gallery: ["/products/buongiorno/zerkala/mirror-big/01.jpg"],
      },
    ],

    attrs: { subType: "mirror-big" },
  }),

  makeProduct({
    id: "buongiorno-zerkala-mirror",
    title: "Зеркало",
    brand: "buongiorno",
    cat: "zerkala",
    basePath: "/products/buongiorno/zerkala/mirror",
    gallery: makeGallery("/products/buongiorno/zerkala/mirror", 2),

    priceUZS: 2_400_000,
    priceRUB: 0,

    variants: [
      {
        id: "color-rose",
        title: ROSE,
        kind: "color",
        group: "color",
        priceDeltaUZS: 0,
        priceDeltaRUB: 0,
        gallery: ["/products/buongiorno/zerkala/mirror/01.jpg"],
      },
      {
        id: "color-white",
        title: WHITE,
        kind: "color",
        group: "color",
        priceDeltaUZS: WHITE_DELTA_UZS,
        priceDeltaRUB: 0,
        gallery: ["/products/buongiorno/zerkala/mirror/02.jpg"],
      },
    ],

    attrs: { subType: "mirror" },
  }),

  // =========================
  // КОМОДЫ — BUONGIORNO
  // =========================
  makeProduct({
    id: "buongiorno-komody-komod",
    title: "Комод",
    brand: "buongiorno",
    cat: "komody",
    basePath: "/products/buongiorno/komody/komod",
    gallery: makeGallery("/products/buongiorno/komody/komod", 2),

    priceUZS: 7_900_000,
    priceRUB: 0,

    variants: [
      {
        id: "color-rose",
        title: ROSE,
        kind: "color",
        group: "color",
        priceDeltaUZS: 0,
        priceDeltaRUB: 0,
        gallery: ["/products/buongiorno/komody/komod/01.jpg"],
      },
      {
        id: "color-white",
        title: WHITE,
        kind: "color",
        group: "color",
        priceDeltaUZS: WHITE_DELTA_UZS,
        priceDeltaRUB: 0,
        gallery: ["/products/buongiorno/komody/komod/02.jpg"],
      },
    ],

    attrs: { subType: "komod" },
  }),

  makeProduct({
    id: "buongiorno-komody-komod-combined",
    title: "Комод комбинированный",
    brand: "buongiorno",
    cat: "komody",
    basePath: "/products/buongiorno/komody/komod-combined",
    gallery: makeGallery("/products/buongiorno/komody/komod-combined", 2),

    priceUZS: 8_900_000,
    priceRUB: 0,

    // ✅ как ты настроил: ROSE -> 02, WHITE -> 01
    variants: [
      {
        id: "color-rose",
        title: ROSE,
        kind: "color",
        group: "color",
        priceDeltaUZS: 0,
        priceDeltaRUB: 0,
        gallery: ["/products/buongiorno/komody/komod-combined/02.jpg"],
      },
      {
        id: "color-white",
        title: WHITE,
        kind: "color",
        group: "color",
        priceDeltaUZS: WHITE_DELTA_UZS,
        priceDeltaRUB: 0,
        gallery: ["/products/buongiorno/komody/komod-combined/01.jpg"],
      },
    ],

    attrs: { subType: "komod-combined" },
  }),

  // =========================
  // КРОВАТИ — BUONGIORNO
  // =========================
  makeProduct({
    id: "buongiorno-krovati-bed-base",
    title: "Кровать с основанием",
    brand: "buongiorno",
    cat: "krovati",
    basePath: "/products/buongiorno/krovati/bed-base",
    gallery: makeGallery("/products/buongiorno/krovati/bed-base", 2),

    priceUZS: 18_900_000,
    priceRUB: 0,

    variants: [
      {
        id: "color-rose",
        title: ROSE,
        kind: "color",
        group: "color",
        priceDeltaUZS: 0,
        priceDeltaRUB: 0,
        gallery: ["/products/buongiorno/krovati/bed-base/01.jpg"],
      },
      {
        id: "color-white",
        title: WHITE,
        kind: "color",
        group: "color",
        priceDeltaUZS: WHITE_DELTA_UZS,
        priceDeltaRUB: 0,
        gallery: ["/products/buongiorno/krovati/bed-base/02.jpg"],
      },
    ],

    attrs: { subType: "bed-base" },
  }),

  makeProduct({
    id: "buongiorno-krovati-bed-mattress",
    title: "Кровать с матрасом",
    brand: "buongiorno",
    cat: "krovati",
    basePath: "/products/buongiorno/krovati/bed-mattress",
    gallery: makeGallery("/products/buongiorno/krovati/bed-mattress", 2),

    priceUZS: 21_900_000,
    priceRUB: 0,

    variants: [
      {
        id: "color-rose",
        title: ROSE,
        kind: "color",
        group: "color",
        priceDeltaUZS: 0,
        priceDeltaRUB: 0,
        gallery: ["/products/buongiorno/krovati/bed-mattress/01.jpg"],
      },
      {
        id: "color-white",
        title: WHITE,
        kind: "color",
        group: "color",
        priceDeltaUZS: WHITE_DELTA_UZS,
        priceDeltaRUB: 0,
        gallery: ["/products/buongiorno/krovati/bed-mattress/02.jpg"],
      },
    ],

    attrs: { subType: "bed-mattress" },
  }),

  makeProduct({
    id: "buongiorno-krovati-bed-lift",
    title: "Кровать с подъёмным механизмом",
    brand: "buongiorno",
    cat: "krovati",
    basePath: "/products/buongiorno/krovati/bed-lift",
    gallery: makeGallery("/products/buongiorno/krovati/bed-lift", 2),

    priceUZS: 24_900_000,
    priceRUB: 0,

    variants: [
      {
        id: "color-rose",
        title: ROSE,
        kind: "color",
        group: "color",
        priceDeltaUZS: 0,
        priceDeltaRUB: 0,
        gallery: ["/products/buongiorno/krovati/bed-lift/02.jpg"],
      },
      {
        id: "color-white",
        title: WHITE,
        kind: "color",
        group: "color",
        priceDeltaUZS: WHITE_DELTA_UZS,
        priceDeltaRUB: 0,
        gallery: ["/products/buongiorno/krovati/bed-lift/01.jpg"],
      },
    ],

    attrs: { subType: "bed-lift" },
  }),

  // =========================
  // ПУФЫ — BUONGIORNO  (slug в CATS: "pufi")
  // =========================
  makeProduct({
    id: "buongiorno-pufi-banquette-small",
    title: "Банкетка маленькая",
    brand: "buongiorno",
    cat: "pufi",
    basePath: "/products/buongiorno/pufi/banquette-small",
    gallery: makeGallery("/products/buongiorno/pufi/banquette-small", 2),

    priceUZS: 2_900_000,
    priceRUB: 0,

    variants: [
      {
        id: "color-rose",
        title: ROSE,
        kind: "color",
        group: "color",
        priceDeltaUZS: 0,
        priceDeltaRUB: 0,
        gallery: ["/products/buongiorno/pufi/banquette-small/02.jpg"],
      },
      {
        id: "color-white",
        title: WHITE,
        kind: "color",
        group: "color",
        priceDeltaUZS: WHITE_DELTA_UZS,
        priceDeltaRUB: 0,
        gallery: ["/products/buongiorno/pufi/banquette-small/01.jpg"],
      },
    ],

    attrs: { subType: "banquette-small" },
  }),

  makeProduct({
    id: "buongiorno-pufi-banquette-big",
    title: "Банкетка большая",
    brand: "buongiorno",
    cat: "pufi",
    basePath: "/products/buongiorno/pufi/banquette-big",
    gallery: makeGallery("/products/buongiorno/pufi/banquette-big", 2),

    priceUZS: 3_900_000,
    priceRUB: 0,

    variants: [
      {
        id: "color-rose",
        title: ROSE,
        kind: "color",
        group: "color",
        priceDeltaUZS: 0,
        priceDeltaRUB: 0,
        gallery: ["/products/buongiorno/pufi/banquette-big/01.jpg"],
      },
      {
        id: "color-white",
        title: WHITE,
        kind: "color",
        group: "color",
        priceDeltaUZS: WHITE_DELTA_UZS,
        priceDeltaRUB: 0,
        gallery: ["/products/buongiorno/pufi/banquette-big/02.jpg"],
      },
    ],

    attrs: { subType: "banquette-big" },
  }),

  // =========================
  // СТОЛЫ — BUONGIORNO
  // =========================
  makeProduct({
    id: "buongiorno-stoli-desk",
    title: "Стол письменный",
    brand: "buongiorno",
    cat: "stoli",
    basePath: "/products/buongiorno/stoli/desk",
    gallery: makeGallery("/products/buongiorno/stoli/desk", 2),

    priceUZS: 5_900_000,
    priceRUB: 0,

    variants: [
      {
        id: "color-rose",
        title: ROSE,
        kind: "color",
        group: "color",
        priceDeltaUZS: 0,
        priceDeltaRUB: 0,
        gallery: ["/products/buongiorno/stoli/desk/02.jpg"],
      },
      {
        id: "color-white",
        title: WHITE,
        kind: "color",
        group: "color",
        priceDeltaUZS: WHITE_DELTA_UZS,
        priceDeltaRUB: 0,
        gallery: ["/products/buongiorno/stoli/desk/01.jpg"],
      },
    ],

    attrs: { subType: "desk" },
  }),

  makeProduct({
    id: "buongiorno-stoli-desk-1drawer",
    title: "Стол с одним ящиком",
    brand: "buongiorno",
    cat: "stoli",
    basePath: "/products/buongiorno/stoli/desk-1drawer",
    gallery: makeGallery("/products/buongiorno/stoli/desk-1drawer", 2),

    priceUZS: 6_400_000,
    priceRUB: 0,

    variants: [
      {
        id: "color-rose",
        title: ROSE,
        kind: "color",
        group: "color",
        priceDeltaUZS: 0,
        priceDeltaRUB: 0,
        gallery: ["/products/buongiorno/stoli/desk-1drawer/01.jpg"],
      },
      {
        id: "color-white",
        title: WHITE,
        kind: "color",
        group: "color",
        priceDeltaUZS: WHITE_DELTA_UZS,
        priceDeltaRUB: 0,
        gallery: ["/products/buongiorno/stoli/desk-1drawer/02.jpg"],
      },
    ],

    attrs: { subType: "desk-1drawer" },
  }),

  // =========================
  // ТУМБЫ ТВ — BUONGIORNO
  // =========================
  makeProduct({
    id: "buongiorno-tumby-tv-tumba-tv",
    title: "Тумба ТВ",
    brand: "buongiorno",
    cat: "tumby-tv",
    basePath: "/products/buongiorno/tumby-tv/tumba-tv",
    gallery: makeGallery("/products/buongiorno/tumby-tv/tumba-tv", 2),

    priceUZS: 6_900_000,
    priceRUB: 0,

    variants: [
      {
        id: "color-rose",
        title: ROSE,
        kind: "color",
        group: "color",
        priceDeltaUZS: 0,
        priceDeltaRUB: 0,
        gallery: ["/products/buongiorno/tumby-tv/tumba-tv/01.jpg"],
      },
      {
        id: "color-white",
        title: WHITE,
        kind: "color",
        group: "color",
        priceDeltaUZS: WHITE_DELTA_UZS,
        priceDeltaRUB: 0,
        gallery: ["/products/buongiorno/tumby-tv/tumba-tv/02.jpg"],
      },
    ],

    attrs: { subType: "tumba-tv" },
  }),

  // =========================
  // ТУМБЫ — BUONGIORNO
  // =========================
  makeProduct({
    id: "buongiorno-tumby-tumba-bedside",
    title: "Тумба прикроватная",
    brand: "buongiorno",
    cat: "tumby",
    basePath: "/products/buongiorno/tumby/tumba-bedside",
    gallery: makeGallery("/products/buongiorno/tumby/tumba-bedside", 2),

    priceUZS: 3_900_000,
    priceRUB: 0,

    // ✅ как ты настроил: ROSE -> 02, WHITE -> 01
    variants: [
      {
        id: "color-rose",
        title: ROSE,
        kind: "color",
        group: "color",
        priceDeltaUZS: 0,
        priceDeltaRUB: 0,
        gallery: ["/products/buongiorno/tumby/tumba-bedside/02.jpg"],
      },
      {
        id: "color-white",
        title: WHITE,
        kind: "color",
        group: "color",
        priceDeltaUZS: WHITE_DELTA_UZS,
        priceDeltaRUB: 0,
        gallery: ["/products/buongiorno/tumby/tumba-bedside/01.jpg"],
      },
    ],

    attrs: { subType: "tumba-bedside" },
  }),

  // =========================
  // ШКАФЫ — BUONGIORNO
  // =========================
  makeProduct({
    id: "buongiorno-shkafy-shkaf-4d-drawers",
    title: "Шкаф четырёхстворчатый с выдвижными ящиками",
    brand: "buongiorno",
    cat: "shkafy",
    basePath: "/products/buongiorno/shkafy/shkaf-4d-drawers",
    gallery: makeGallery("/products/buongiorno/shkafy/shkaf-4d-drawers", 2),

    priceUZS: 16_900_000,
    priceRUB: 0,

    variants: [
      {
        id: "color-rose",
        title: ROSE,
        kind: "color",
        group: "color",
        priceDeltaUZS: 0,
        priceDeltaRUB: 0,
        gallery: ["/products/buongiorno/shkafy/shkaf-4d-drawers/01.jpg"],
      },
      {
        id: "color-white",
        title: WHITE,
        kind: "color",
        group: "color",
        priceDeltaUZS: WHITE_DELTA_UZS,
        priceDeltaRUB: 0,
        gallery: ["/products/buongiorno/shkafy/shkaf-4d-drawers/02.jpg"],
      },
    ],

    attrs: { doors: 4, subType: "shkaf-4d-drawers" },
  }),
];
