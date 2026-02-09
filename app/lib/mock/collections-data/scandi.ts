// app/lib/mock/collections-data/scandi.ts
import { makeGallery, makeProduct, type CatalogProduct } from "../catalog-base";

// =========================
// SCANDI — COLORS (универсально)
// =========================
const OAK = "Белый";
const CAPPUCCINO = "Капучино";

// если капучино дороже — поставь дельту (можешь 0 оставить)
const CAPPUCCINO_DELTA_UZS = 0;
const CAPPUCCINO_DELTA_RUB = 0;

// helpers
function withColorVariants(opts: {
  baseGallery: string[];
  basePath: string; // например "/products/scandi/shkafy/1d-blind"
  countForAlt?: number; // если хочешь генерить alt через makeGallery
}) {
  const { baseGallery, basePath } = opts;

  // 🔁 по умолчанию ожидаем, что капучино лежит в отдельной папке с суффиксом -cappuccino
  // например: /products/scandi/shkafy/1d-blind-cappuccino/01.jpg
  // Если таких файлов нет — ничего не сломается: UI будет, но картинки могут совпасть.
  const cappuccinoBasePath = `${basePath}-cappuccino`;

  // если базовая галерея сделана makeGallery(path, 1) — там один файл 01.jpg,
  // мы можем сделать alt тоже через makeGallery(..., 1)
  const cappuccinoGallery =
    opts.countForAlt && opts.countForAlt > 0
      ? makeGallery(cappuccinoBasePath, opts.countForAlt)
      : baseGallery.map((src) => src.replace(basePath, cappuccinoBasePath));

  return [
    {
      id: "color-oak",
      title: OAK,
      kind: "color" as const,
      group: "color",
      priceDeltaUZS: 0,
      priceDeltaRUB: 0,
      gallery: baseGallery,
    },
    {
      id: "color-cappuccino",
      title: CAPPUCCINO,
      kind: "color" as const,
      group: "color",
      priceDeltaUZS: CAPPUCCINO_DELTA_UZS,
      priceDeltaRUB: CAPPUCCINO_DELTA_RUB,
      gallery: cappuccinoGallery,
    },
  ];
}

export const SCANDI_PRODUCTS: CatalogProduct[] = [
  // =========================
  // ШКАФЫ — SCANDI
  // =========================

  makeProduct({
    id: "scandi-shkafy-1d-blind",
    title: "Шкаф одностворчатый глухой",
    brand: "scandi",
    cat: "shkafy",
    basePath: "/products/scandi/shkafy/1d-blind",
    gallery: makeGallery("/products/scandi/shkafy/1d-blind", 1),
    priceUZS: 0,
    priceRUB: 0,
    variants: withColorVariants({
      baseGallery: makeGallery("/products/scandi/shkafy/1d-blind", 1),
      basePath: "/products/scandi/shkafy/1d-blind",
      countForAlt: 1,
    }),
    attrs: { doors: 1, facade: "blind" },
  }),

  makeProduct({
    id: "scandi-shkafy-1d-mirror",
    title: "Шкаф одностворчатый зеркальный",
    brand: "scandi",
    cat: "shkafy",
    basePath: "/products/scandi/shkafy/1d-mirror",
    gallery: makeGallery("/products/scandi/shkafy/1d-mirror", 1),
    priceUZS: 0,
    priceRUB: 0,
    variants: withColorVariants({
      baseGallery: makeGallery("/products/scandi/shkafy/1d-mirror", 1),
      basePath: "/products/scandi/shkafy/1d-mirror",
      countForAlt: 1,
    }),
    attrs: { doors: 1, facade: "mirror" },
  }),

  makeProduct({
    id: "scandi-shkafy-2d-mirror",
    title: "Шкаф двухстворчатый зеркальный",
    brand: "scandi",
    cat: "shkafy",
    basePath: "/products/scandi/shkafy/2d-mirror",
    gallery: makeGallery("/products/scandi/shkafy/2d-mirror", 1),
    priceUZS: 0,
    priceRUB: 0,
    variants: withColorVariants({
      baseGallery: makeGallery("/products/scandi/shkafy/2d-mirror", 1),
      basePath: "/products/scandi/shkafy/2d-mirror",
      countForAlt: 1,
    }),
    attrs: { doors: 2, facade: "mirror" },
  }),

  makeProduct({
    id: "scandi-shkafy-2d-blind",
    title: "Шкаф двухстворчатый глухой",
    brand: "scandi",
    cat: "shkafy",
    basePath: "/products/scandi/shkafy/2d-blind",
    gallery: makeGallery("/products/scandi/shkafy/2d-blind", 1),
    priceUZS: 0,
    priceRUB: 0,
    variants: withColorVariants({
      baseGallery: makeGallery("/products/scandi/shkafy/2d-blind", 1),
      basePath: "/products/scandi/shkafy/2d-blind",
      countForAlt: 1,
    }),
    attrs: { doors: 2, facade: "blind" },
  }),

  makeProduct({
    id: "scandi-shkafy-3d-blind",
    title: "Шкаф трехстворчатый глухой",
    brand: "scandi",
    cat: "shkafy",
    basePath: "/products/scandi/shkafy/3d-blind",
    gallery: makeGallery("/products/scandi/shkafy/3d-blind", 1),
    priceUZS: 0,
    priceRUB: 0,
    variants: withColorVariants({
      baseGallery: makeGallery("/products/scandi/shkafy/3d-blind", 1),
      basePath: "/products/scandi/shkafy/3d-blind",
      countForAlt: 1,
    }),
    attrs: { doors: 3, facade: "blind" },
  }),

  makeProduct({
    id: "scandi-shkafy-3d-mirror",
    title: "Шкаф трехстворчатый зеркальный",
    brand: "scandi",
    cat: "shkafy",
    basePath: "/products/scandi/shkafy/3d-mirror",
    gallery: makeGallery("/products/scandi/shkafy/3d-mirror", 1),
    priceUZS: 0,
    priceRUB: 0,
    variants: withColorVariants({
      baseGallery: makeGallery("/products/scandi/shkafy/3d-mirror", 1),
      basePath: "/products/scandi/shkafy/3d-mirror",
      countForAlt: 1,
    }),
    attrs: { doors: 3, facade: "mirror" },
  }),

  makeProduct({
    id: "scandi-shkafy-3d-blind-combined",
    title: "Шкаф трехстворчатый с угловым модулем",
    brand: "scandi",
    cat: "shkafy",
    basePath: "/products/scandi/shkafy/3d-blind-combined",
    gallery: makeGallery("/products/scandi/shkafy/3d-blind-combined", 1),
    priceUZS: 0,
    priceRUB: 0,
    variants: withColorVariants({
      baseGallery: makeGallery("/products/scandi/shkafy/3d-blind-combined", 1),
      basePath: "/products/scandi/shkafy/3d-blind-combined",
      countForAlt: 1,
    }),
    attrs: { doors: 3, facade: "combined" },
  }),

  makeProduct({
    id: "scandi-shkafy-3d-mirror-combined",
    title: "Шкаф трехстворчатый зеркальный с угловым модулем",
    brand: "scandi",
    cat: "shkafy",
    basePath: "/products/scandi/shkafy/3d-mirror-combined",
    gallery: makeGallery("/products/scandi/shkafy/3d-mirror-combined", 1),
    priceUZS: 0,
    priceRUB: 0,
    variants: withColorVariants({
      baseGallery: makeGallery("/products/scandi/shkafy/3d-mirror-combined", 1),
      basePath: "/products/scandi/shkafy/3d-mirror-combined",
      countForAlt: 1,
    }),
    attrs: { doors: 3, facade: "mirror-combined" },
  }),

  makeProduct({
    id: "scandi-shkafy-4d-blind",
    title: "Шкаф четырехстворчатый глухой",
    brand: "scandi",
    cat: "shkafy",
    basePath: "/products/scandi/shkafy/4d-blind",
    gallery: makeGallery("/products/scandi/shkafy/4d-blind", 1),
    priceUZS: 0,
    priceRUB: 0,
    variants: withColorVariants({
      baseGallery: makeGallery("/products/scandi/shkafy/4d-blind", 1),
      basePath: "/products/scandi/shkafy/4d-blind",
      countForAlt: 1,
    }),
    attrs: { doors: 4, facade: "blind" },
  }),

  makeProduct({
    id: "scandi-shkafy-4d-mirror",
    title: "Шкаф четырехстворчатый зеркальный",
    brand: "scandi",
    cat: "shkafy",
    basePath: "/products/scandi/shkafy/4d-mirror",
    gallery: makeGallery("/products/scandi/shkafy/4d-mirror", 1),
    priceUZS: 0,
    priceRUB: 0,
    variants: withColorVariants({
      baseGallery: makeGallery("/products/scandi/shkafy/4d-mirror", 1),
      basePath: "/products/scandi/shkafy/4d-mirror",
      countForAlt: 1,
    }),
    attrs: { doors: 4, facade: "mirror" },
  }),

  // =========================
  // ВИТРИНЫ — SCANDI
  // =========================

  makeProduct({
    id: "scandi-vitrini-1d-blind",
    title: "Витрина одностворчатая",
    brand: "scandi",
    cat: "vitrini",
    basePath: "/products/scandi/vitrini/1d-blind",
    gallery: makeGallery("/products/scandi/vitrini/1d-blind", 1),
    priceUZS: 0,
    priceRUB: 0,
    variants: withColorVariants({
      baseGallery: makeGallery("/products/scandi/vitrini/1d-blind", 1),
      basePath: "/products/scandi/vitrini/1d-blind",
      countForAlt: 1,
    }),
    attrs: { doors: 1, facade: "blind" },
  }),
  makeProduct({
    id: "scandi-vitrini-1d-glass",
    title: "Витрина одностворчатая со стеклом",
    brand: "scandi",
    cat: "vitrini",
    basePath: "/products/scandi/vitrini/1d-glass",
    gallery: makeGallery("/products/scandi/vitrini/1d-glass", 1),
    priceUZS: 0,
    priceRUB: 0,
    variants: withColorVariants({
      baseGallery: makeGallery("/products/scandi/vitrini/1d-glass", 1),
      basePath: "/products/scandi/vitrini/1d-glass",
      countForAlt: 1,
    }),
    attrs: { doors: 1, facade: "combined" },

  }),
  makeProduct({
    id: "scandi-vitrini-1d-glass-shelves",
    title: "Витрина одностворчатая со стеклом и стеклянными полками",
    brand: "scandi",
    cat: "vitrini",
    basePath: "/products/scandi/vitrini/1d-glass-shelves",
    gallery: makeGallery("/products/scandi/vitrini/1d-glass-shelves", 1),
    priceUZS: 0,
    priceRUB: 0,
    variants: withColorVariants({
      baseGallery: makeGallery("/products/scandi/vitrini/1d-glass-shelves", 1),
      basePath: "/products/scandi/vitrini/1d-glass-shelves",
      countForAlt: 1,
    }),
    attrs: { doors: 1, facade: "combined" },

  }),

  makeProduct({
    id: "scandi-vitrini-2d-blind",
    title: "Витрина двустворчатая",
    brand: "scandi",
    cat: "vitrini",
    basePath: "/products/scandi/vitrini/2d-blind",
    gallery: makeGallery("/products/scandi/vitrini/2d-blind", 1),
    priceUZS: 0,
    priceRUB: 0,
    variants: withColorVariants({
      baseGallery: makeGallery("/products/scandi/vitrini/2d-blind", 1),
      basePath: "/products/scandi/vitrini/2d-blind",
      countForAlt: 1,
    }),
    attrs: { doors: 2, facade: "blind" },
  }),
  makeProduct({
    id: "scandi-vitrini-2d-glass",
    title: "Витрина двустворчатая со стеклом",
    brand: "scandi",
    cat: "vitrini",
    basePath: "/products/scandi/vitrini/2d-glass",
    gallery: makeGallery("/products/scandi/vitrini/2d-glass", 1),
    priceUZS: 0,
    priceRUB: 0,
    variants: withColorVariants({
      baseGallery: makeGallery("/products/scandi/vitrini/2d-glass", 1),
      basePath: "/products/scandi/vitrini/2d-glass",
      countForAlt: 1,
    }),
    attrs: { doors: 2, facade: "combined" },

  }),
  makeProduct({
    id: "scandi-vitrini-2d-glass-shelves",
    title: "Витрина двустворчатая со стеклом и стеклянными полками",
    brand: "scandi",
    cat: "vitrini",
    basePath: "/products/scandi/vitrini/2d-glass-shelves",
    gallery: makeGallery("/products/scandi/vitrini/2d-glass-shelves", 1),
    priceUZS: 0,
    priceRUB: 0,
    variants: withColorVariants({
      baseGallery: makeGallery("/products/scandi/vitrini/2d-glass-shelves", 1),
      basePath: "/products/scandi/vitrini/2d-glass-shelves",
      countForAlt: 1,
    }),
    attrs: { doors: 2, facade: "combined" },
  }),

  // =========================
  // КОМОДЫ — SCANDI
  // =========================

  makeProduct({
    id: "scandi-komody-3-drawers",
    title: "Комод три ящика",
    brand: "scandi",
    cat: "komody",
    basePath: "/products/scandi/komody/3-drawers",
    gallery: makeGallery("/products/scandi/komody/3-drawers", 1),
    priceUZS: 0,
    priceRUB: 0,
    variants: withColorVariants({
      baseGallery: makeGallery("/products/scandi/komody/3-drawers", 1),
      basePath: "/products/scandi/komody/3-drawers",
      countForAlt: 1,
    }),
    attrs: { subType: "3-drawers" },
  }),

  makeProduct({
    id: "scandi-komody-wide",
    title: "Комод широкий",
    brand: "scandi",
    cat: "komody",
    basePath: "/products/scandi/komody/wide",
    gallery: makeGallery("/products/scandi/komody/wide", 1),
    priceUZS: 0,
    priceRUB: 0,
    variants: withColorVariants({
      baseGallery: makeGallery("/products/scandi/komody/wide", 1),
      basePath: "/products/scandi/komody/wide",
      countForAlt: 1,
    }),
    attrs: { subType: "wide" },
  }),

  // =========================
  // ЗЕРКАЛА — SCANDI
  // =========================

  makeProduct({
    id: "scandi-zerkala-on-dresser",
    title: "Зеркало на комод",
    brand: "scandi",
    cat: "zerkala",
    basePath: "/products/scandi/zerkala/on-dresser",
    gallery: makeGallery("/products/scandi/zerkala/on-dresser", 1),
    priceUZS: 0,
    priceRUB: 0,
    variants: withColorVariants({
      baseGallery: makeGallery("/products/scandi/zerkala/on-dresser", 1),
      basePath: "/products/scandi/zerkala/on-dresser",
      countForAlt: 1,
    }),
    attrs: { subType: "on-dresser" },
  }),

  makeProduct({
    id: "scandi-zerkala-wide",
    title: "Зеркало широкое",
    brand: "scandi",
    cat: "zerkala",
    basePath: "/products/scandi/zerkala/wide",
    gallery: makeGallery("/products/scandi/zerkala/wide", 1),
    priceUZS: 0,
    priceRUB: 0,
    variants: withColorVariants({
      baseGallery: makeGallery("/products/scandi/zerkala/wide", 1),
      basePath: "/products/scandi/zerkala/wide",
      countForAlt: 1,
    }),
    attrs: { subType: "wide" },
  }),

  // =========================
  // СТОЛЫ — SCANDI
  // =========================

  makeProduct({
    id: "scandi-stoli-desk",
    title: "Стол письменный",
    brand: "scandi",
    cat: "stoli",
    basePath: "/products/scandi/stoli/desk",
    gallery: makeGallery("/products/scandi/stoli/desk", 1),
    priceUZS: 0,
    priceRUB: 0,
    variants: withColorVariants({
      baseGallery: makeGallery("/products/scandi/stoli/desk", 1),
      basePath: "/products/scandi/stoli/desk",
      countForAlt: 1,
    }),
    attrs: { subType: "desk" },
  }),

  makeProduct({
    id: "scandi-stoli-toilet",
    title: "Стол туалетный",
    brand: "scandi",
    cat: "stoli",
    basePath: "/products/scandi/stoli/toilet",
    gallery: makeGallery("/products/scandi/stoli/toilet", 1),
    priceUZS: 0,
    priceRUB: 0,
    variants: withColorVariants({
      baseGallery: makeGallery("/products/scandi/stoli/toilet", 1),
      basePath: "/products/scandi/stoli/toilet",
      countForAlt: 1,
    }),
    attrs: { subType: "toilet" },
  }),

  // =========================
  // ТУМБЫ — SCANDI
  // =========================

  makeProduct({
    id: "scandi-tumby-bedside",
    title: "Тумба прикроватная",
    brand: "scandi",
    cat: "tumby",
    basePath: "/products/scandi/tumby/bedside",
    gallery: makeGallery("/products/scandi/tumby/bedside", 1),
    priceUZS: 0,
    priceRUB: 0,
    variants: withColorVariants({
      baseGallery: makeGallery("/products/scandi/tumby/bedside", 1),
      basePath: "/products/scandi/tumby/bedside",
      countForAlt: 1,
    }),
    attrs: { subType: "bedside" },
  }),

  makeProduct({
    id: "scandi-tumby-tv",
    title: "Тумба ТВ",
    brand: "scandi",
    cat: "tumby",
    basePath: "/products/scandi/tumby/tv",
    gallery: makeGallery("/products/scandi/tumby/tv", 1),
    priceUZS: 0,
    priceRUB: 0,
    variants: withColorVariants({
      baseGallery: makeGallery("/products/scandi/tumby/tv", 1),
      basePath: "/products/scandi/tumby/tv",
      countForAlt: 1,
    }),
    attrs: { subType: "tv" },
  }),

  // =========================
  // ФАСАДЫ — SCANDI
  // =========================

  makeProduct({
    id: "scandi-fasadi-blind",
    title: "Фасад глухой",
    brand: "scandi",
    cat: "fasadi",
    basePath: "/products/scandi/fasadi/blind",
    gallery: makeGallery("/products/scandi/fasadi/blind", 1),
    priceUZS: 0,
    priceRUB: 0,
    variants: withColorVariants({
      baseGallery: makeGallery("/products/scandi/fasadi/blind", 1),
      basePath: "/products/scandi/fasadi/blind",
      countForAlt: 1,
    }),
    attrs: { subType: "blind" },
  }),

  makeProduct({
    id: "scandi-fasadi-mirror",
    title: "Фасад зеркальный",
    brand: "scandi",
    cat: "fasadi",
    basePath: "/products/scandi/fasadi/mirror",
    gallery: makeGallery("/products/scandi/fasadi/mirror", 1),
    priceUZS: 0,
    priceRUB: 0,
    variants: withColorVariants({
      baseGallery: makeGallery("/products/scandi/fasadi/mirror", 1),
      basePath: "/products/scandi/fasadi/mirror",
      countForAlt: 1,
    }),
    attrs: { subType: "mirror" },
  }),

  // =========================
  // КРОВАТИ — SCANDI (твои как были, оставил)
  // =========================

  makeProduct({
    id: "scandi-krovati-min-base",
    title: "Кровать с кроватным основанием",
    brand: "scandi",
    cat: "krovati",
    basePath: "/products/scandi/krovati/min-base",
    gallery: [
      "/products/scandi/krovati/min-base/01.jpg",
      "/products/scandi/krovati/min-base/02.jpg",
    ],
    priceUZS: 18_900_000,
    priceRUB: 0,

    variants: [
      {
        id: "size-120x200",
        title: "120×200",
        kind: "option",
        group: "size",
        priceDeltaUZS: 0,
        priceDeltaRUB: 0,
      },
      {
        id: "size-160x200",
        title: "160×200",
        kind: "option",
        group: "size",
        priceDeltaUZS: +2_000_000,
        priceDeltaRUB: 0,
      },

      {
        id: "color-oak",
        title: OAK,
        kind: "color",
        group: "color",
        priceDeltaUZS: 0,
        priceDeltaRUB: 0,
        gallery: [
          "/products/scandi/krovati/min-base/01.jpg",
          "/products/scandi/krovati/min-base/02.jpg",
        ],
      },
      {
        id: "color-cappuccino",
        title: CAPPUCCINO,
        kind: "color",
        group: "color",
        priceDeltaUZS: CAPPUCCINO_DELTA_UZS,
        priceDeltaRUB: CAPPUCCINO_DELTA_RUB,
        gallery: [
          "/products/scandi/krovati/min-base-cappuccino/01.jpg",
          "/products/scandi/krovati/min-base-cappuccino/02.jpg",
        ],
      },
    ],

    attrs: { subType: "min", mechanism: "base" } as any,
  }),

  makeProduct({
    id: "scandi-krovati-min-lift",
    title: "Кровать с подъёмным механизмом",
    brand: "scandi",
    cat: "krovati",
    basePath: "/products/scandi/krovati/min-lift",
    gallery: ["/products/scandi/krovati/min-lift/01.jpg"],
    priceUZS: 21_900_000,
    priceRUB: 0,

    variants: [
      {
        id: "size-160x200",
        title: "160×200",
        kind: "option",
        group: "size",
        priceDeltaUZS: 0,
        priceDeltaRUB: 0,
      },

      {
        id: "mechanism-lift",
        title: "С подъёмным механизмом",
        kind: "option",
        group: "mechanism",
        priceDeltaUZS: 0,
        priceDeltaRUB: 0,
      },
      {
        id: "mechanism-base",
        title: "Без подъёмного механизма",
        kind: "option",
        group: "mechanism",
        disabled: true,
        priceDeltaUZS: 0,
        priceDeltaRUB: 0,
      },

      {
        id: "color-oak",
        title: OAK,
        kind: "color",
        group: "color",
        priceDeltaUZS: 0,
        priceDeltaRUB: 0,
        gallery: ["/products/scandi/krovati/min-lift/01.jpg"],
      },
      {
        id: "color-cappuccino",
        title: CAPPUCCINO,
        kind: "color",
        group: "color",
        priceDeltaUZS: CAPPUCCINO_DELTA_UZS,
        priceDeltaRUB: CAPPUCCINO_DELTA_RUB,
        gallery: ["/products/scandi/krovati/min-lift-cappuccino/01.jpg"],
      },
    ],

    attrs: { subType: "min", mechanism: "lift" } as any,
  }),
];
