// app/lib/mock/collections-data/amber.ts
import { makeGallery, makeProduct, type CatalogProduct } from "../catalog-base";

// маленький хелпер для единичных картинок (01/02)
const one = (basePath: string, file: "01" | "02" = "01") => [`${basePath}/${file}.jpg`];

export const AMBER_PRODUCTS: CatalogProduct[] = [
  // -------------------------
  // KOMODY
  // -------------------------
  makeProduct({
    id: "amber-komody-komod",
    title: "Комод",
    brand: "amber",
    cat: "komody",
    basePath: "/products/amber/komody/komod",
    gallery: makeGallery("/products/amber/komody/komod", 1),
    priceUZS: 0,
    priceRUB: 0,
  }),

  makeProduct({
    id: "amber-komody-komod-shirokiy",
    title: "Комод широкий",
    brand: "amber",
    cat: "komody",
    basePath: "/products/amber/komody/komod-shirokiy",
    gallery: makeGallery("/products/amber/komody/komod-shirokiy", 1),
    priceUZS: 0,
    priceRUB: 0,
  }),

  makeProduct({
    id: "amber-komody-komod-shirokiy-nojki",
    title: "Комод широкий на ножках",
    brand: "amber",
    cat: "komody",
    basePath: "/products/amber/komody/komod-shirokiy-nojki",
    gallery: makeGallery("/products/amber/komody/komod-shirokiy-nojki", 1),
    priceUZS: 0,
    priceRUB: 0,
  }),

  // -------------------------
  // KROVATI — ✅ единственное место с ценой и variants
  // -------------------------
  makeProduct({
    id: "amber-krovati-krovat",
    title: "Кровать",
    brand: "amber",
    cat: "krovati",
    basePath: "/products/amber/krovati/krovat",

    // 2 фото в папке (01 и 02)
    gallery: makeGallery("/products/amber/krovati/krovat", 2),

    // ✅ базовая цена = "без подъёмного механизма"
    priceUZS: 19_150_000,
    priceRUB: 0,

    // ✅ формат КАК У SALVADOR: массив опций
    variants: [
      {
        id: "mechanism-base",
        title: "Без подъёмного механизма",
        kind: "option",
        group: "mechanism",
        priceDeltaUZS: 0,
        priceDeltaRUB: 0,
        gallery: ["/products/amber/krovati/krovat/01.jpg"],
      },
      {
        id: "mechanism-lift",
        title: "С подъёмным механизмом",
        kind: "option",
        group: "mechanism",
        // ✅ тут меняй на нужную разницу
        priceDeltaUZS: 3_000_000,
        priceDeltaRUB: 0,
        gallery: ["/products/amber/krovati/krovat/02.jpg"],
      },
    ],

    attrs: { subType: "bed-mechanism" } as any,
  }),

  // -------------------------
  // POLKI
  // -------------------------
  makeProduct({
    id: "amber-polki-antresol-1d",
    title: "Антресоль 1D",
    brand: "amber",
    cat: "polki",
    basePath: "/products/amber/polki/antresol-1d",
    gallery: makeGallery("/products/amber/polki/antresol-1d", 1),
    priceUZS: 0,
    priceRUB: 0,
  }),

  makeProduct({
    id: "amber-polki-antresol-2d",
    title: "Антресоль 2D",
    brand: "amber",
    cat: "polki",
    basePath: "/products/amber/polki/antresol-2d",
    gallery: makeGallery("/products/amber/polki/antresol-2d", 1),
    priceUZS: 0,
    priceRUB: 0,
  }),

  // -------------------------
  // SHKAFY
  // -------------------------
  makeProduct({
    id: "amber-shkafy-shkaf-1d",
    title: "Шкаф 1D",
    brand: "amber",
    cat: "shkafy",
    basePath: "/products/amber/shkafy/shkaf-1d",
    gallery: makeGallery("/products/amber/shkafy/shkaf-1d", 1),
    priceUZS: 0,
    priceRUB: 0,
  }),

  makeProduct({
    id: "amber-shkafy-shkaf-2d",
    title: "Шкаф 2D",
    brand: "amber",
    cat: "shkafy",
    basePath: "/products/amber/shkafy/shkaf-2d",
    // ⚠️ у тебя внутри файл 02.jpg, поэтому делаем вручную
    gallery: one("/products/amber/shkafy/shkaf-2d", "02"),
    priceUZS: 0,
    priceRUB: 0,
  }),

  // -------------------------
  // STELLAJI
  // -------------------------
  makeProduct({
    id: "amber-stellaji-stellaj-end",
    title: "Стеллаж завершающий",
    brand: "amber",
    cat: "stellaji",
    basePath: "/products/amber/stellaji/stellaj-end",
    gallery: makeGallery("/products/amber/stellaji/stellaj-end", 1),
    priceUZS: 0,
    priceRUB: 0,
  }),

  makeProduct({
    id: "amber-stellaji-stellaj-open",
    title: "Стеллаж открытый",
    brand: "amber",
    cat: "stellaji",
    basePath: "/products/amber/stellaji/stellaj-open",
    gallery: makeGallery("/products/amber/stellaji/stellaj-open", 1),
    priceUZS: 0,
    priceRUB: 0,
  }),

  // -------------------------
  // STOLI
  // -------------------------
  makeProduct({
    id: "amber-stoli-stol-jurnalniy",
    title: "Стол журнальный",
    brand: "amber",
    cat: "stoli",
    basePath: "/products/amber/stoli/stol-jurnalniy",
    gallery: makeGallery("/products/amber/stoli/stol-jurnalniy", 1),
    priceUZS: 0,
    priceRUB: 0,
  }),

  makeProduct({
    id: "amber-stoli-stol-na-nojkah",
    title: "Стол на ножках",
    brand: "amber",
    cat: "stoli",
    basePath: "/products/amber/stoli/stol-na-nojkah",
    gallery: makeGallery("/products/amber/stoli/stol-na-nojkah", 1),
    priceUZS: 0,
    priceRUB: 0,
  }),

  makeProduct({
    id: "amber-stoli-stol-pismenniy",
    title: "Стол письменный",
    brand: "amber",
    cat: "stoli",
    basePath: "/products/amber/stoli/stol-pismenniy",
    gallery: makeGallery("/products/amber/stoli/stol-pismenniy", 1),
    priceUZS: 0,
    priceRUB: 0,
  }),

  makeProduct({
    id: "amber-stoli-stol-podvesnoy",
    title: "Стол подвесной",
    brand: "amber",
    cat: "stoli",
    basePath: "/products/amber/stoli/stol-podvesnoy",
    gallery: makeGallery("/products/amber/stoli/stol-podvesnoy", 1),
    priceUZS: 0,
    priceRUB: 0,
  }),

  // -------------------------
  // TUMBI
  // -------------------------
  makeProduct({
    id: "amber-tumbi-tumba",
    title: "Тумба",
    brand: "amber",
    cat: "tumbi",
    basePath: "/products/amber/tumbi/tumba",
    gallery: makeGallery("/products/amber/tumbi/tumba", 1),
    priceUZS: 0,
    priceRUB: 0,
  }),

  makeProduct({
    id: "amber-tumbi-tumba-navesnaya",
    title: "Тумба навесная",
    brand: "amber",
    cat: "tumbi",
    basePath: "/products/amber/tumbi/tumba-navesnaya",
    gallery: makeGallery("/products/amber/tumbi/tumba-navesnaya", 1),
    priceUZS: 0,
    priceRUB: 0,
  }),

  makeProduct({
    id: "amber-tumbi-tumba-tv-big-nojki",
    title: "Тумба ТВ большая на ножках",
    brand: "amber",
    cat: "tumbi",
    basePath: "/products/amber/tumbi/tumba-tv-big-nojki",
    gallery: makeGallery("/products/amber/tumbi/tumba-tv-big-nojki", 1),
    priceUZS: 0,
    priceRUB: 0,
  }),

  makeProduct({
    id: "amber-tumbi-tumba-tv-na-nojkah",
    title: "Тумба ТВ на ножках",
    brand: "amber",
    cat: "tumbi",
    basePath: "/products/amber/tumbi/tumba-tv-na-nojkah",
    gallery: makeGallery("/products/amber/tumbi/tumba-tv-na-nojkah", 1),
    priceUZS: 0,
    priceRUB: 0,
  }),

  makeProduct({
    id: "amber-tumbi-tumba-tv-navesnaya",
    title: "Тумба ТВ навесная",
    brand: "amber",
    cat: "tumbi",
    basePath: "/products/amber/tumbi/tumba-tv-navesnaya",
    gallery: makeGallery("/products/amber/tumbi/tumba-tv-navesnaya", 1),
    priceUZS: 0,
    priceRUB: 0,
  }),

  // -------------------------
  // VESHALKI
  // -------------------------
  makeProduct({
    id: "amber-veshalki-veshalka-big",
    title: "Вешалка большая",
    brand: "amber",
    cat: "veshalki",
    basePath: "/products/amber/veshalki/veshalka-big",
    gallery: makeGallery("/products/amber/veshalki/veshalka-big", 1),
    priceUZS: 0,
    priceRUB: 0,
  }),

  makeProduct({
    id: "amber-veshalki-veshalka-small",
    title: "Вешалка маленькая",
    brand: "amber",
    cat: "veshalki",
    basePath: "/products/amber/veshalki/veshalka-small",
    gallery: makeGallery("/products/amber/veshalki/veshalka-small", 1),
    priceUZS: 0,
    priceRUB: 0,
  }),

  // -------------------------
  // ZERKALA
  // -------------------------
  makeProduct({
    id: "amber-zerkala-zerkalo",
    title: "Зеркало",
    brand: "amber",
    cat: "zerkala",
    basePath: "/products/amber/zerkala/zerkalo",
    gallery: makeGallery("/products/amber/zerkala/zerkalo", 1),
    priceUZS: 0,
    priceRUB: 0,
  }),

  makeProduct({
    id: "amber-zerkala-zerkalo-round",
    title: "Зеркало круглое",
    brand: "amber",
    cat: "zerkala",
    basePath: "/products/amber/zerkala/zerkalo-round",
    gallery: makeGallery("/products/amber/zerkala/zerkalo-round", 1),
    priceUZS: 0,
    priceRUB: 0,
  }),
];
