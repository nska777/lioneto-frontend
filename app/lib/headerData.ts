// app/lib/headerData.ts
export type MegaSlidesKey = `${string}:${string}`; // "bedrooms:amber"

export const MEGA_SLIDES: Record<MegaSlidesKey, string[]> = {
  // bedrooms
  "bedrooms:amber": [
    "/mega/bedrooms/amber/055.jpg",
    "/mega/bedrooms/amber/02.jpg",
    "/mega/bedrooms/amber/03.jpg",
  ],
  "bedrooms:buongiorno": [
    "/mega/bedrooms/buongiorno/01.jpg",
    "/mega/bedrooms/buongiorno/02.jpg",
  ],
  "bedrooms:elizabeth": ["/mega/bedrooms/elizabeth/01.jpg"],
  "bedrooms:pitti": ["/mega/bedrooms/pitti/01.jpg"],
  "bedrooms:salvador": ["/mega/bedrooms/salvador/01.jpg"],
  "bedrooms:scandy": ["/mega/bedrooms/scandy/01.jpg"],

  // living
  "living:amber": ["/mega/living/amber/01.jpg"],
  "living:buongiorno": ["/mega/living/buongiorno/01.jpg"],
  "living:elizabeth": ["/mega/living/elizabeth/01.jpg"],
  "living:pitti": ["/mega/living/pitti/01.jpg"],
  "living:salvador": ["/mega/living/salvador/01.jpg"],
  "living:scandy": ["/mega/living/scandy/01.jpg"],

  // youth
  "youth:amber": ["/mega/youth/amber/01.jpg"],
  "youth:buongiorno": ["/mega/youth/buongiorno/01.jpg"],
  "youth:elizabeth": ["/mega/youth/elizabeth/01.jpg"],
  "youth:pitti": ["/mega/youth/pitti/01.jpg"],
  "youth:salvador": ["/mega/youth/salvador/01.jpg"],
  "youth:scandy": ["/mega/youth/scandy/01.jpg"],

  // tables_chairs
  "tables_chairs:amber": ["/mega/tables_chairs/amber/01.jpg"],
  "tables_chairs:buongiorno": ["/mega/tables_chairs/buongiorno/01.jpg"],

  // hallway
  "hallway:amber": ["/mega/hallway/amber/01.jpg"],
  "hallway:buongiorno": ["/mega/hallway/buongiorno/01.jpg"],
};
export type MegaItem = { labelKey: string; fallback: string; href: string };

export type MegaKey =
  | "bedrooms"
  | "living"
  | "hallway"
  | "office"
  | "wardrobes"
  | "tables";

export type MegaCategory = {
  key: MegaKey;
  labelKey: string;
  fallback: string;
  href: string;
  items: MegaItem[];
};

export type TopLink = { labelKey: string; fallback: string; href: string };

export const topLinks: readonly TopLink[] = [
  { labelKey: "header.top.catalog", fallback: "Каталог", href: "/catalog" },
  { labelKey: "header.top.about", fallback: "О компании", href: "/about" },
  { labelKey: "header.top.news", fallback: "Новости", href: "/news" },
  { labelKey: "header.top.contacts", fallback: "Контакты", href: "/contacts" },
  {
    labelKey: "header.top.cooperation",
    fallback: "Сотрудничество",
    href: "/cooperation",
  },
  { labelKey: "header.top.sale", fallback: "Акции", href: "/sale" },
] as const;

/**
 * ✅ Новый единый формат href для "витрины":
 * /catalog?menu=<menu>&collections=<brand>&hero=1
 *
 * Важно: обычный вход в /catalog (без hero) остаётся как есть (см. topLinks).
 */
const MENU_BY_CATEGORY: Record<string, string> = {
  bedrooms: "bedrooms",
  living: "living",
  youth: "youth",
};

export const makeCollectionHref = (brand: string, category: string) => {
  const menu = MENU_BY_CATEGORY[category] ?? category;
  return `/catalog?menu=${encodeURIComponent(menu)}&collections=${encodeURIComponent(
    brand,
  )}&hero=1`;
};

export const makeCollectionId = (brand: string, category: string) =>
  `col-${brand}-${category}`;

/**
 * ✅ Парсинг "витринного" href:
 * /catalog?menu=bedrooms&collections=amber&hero=1
 */
export function parseCollectionHref(href: string) {
  try {
    if (!href?.startsWith("/catalog")) return null;

    const qIndex = href.indexOf("?");
    if (qIndex === -1) return null;

    const search = href.slice(qIndex + 1);
    const sp = new URLSearchParams(search);

    const brand = sp.get("collections") ?? "";
    const category = sp.get("menu") ?? "";

    if (!brand || !category) return null;

    return { brand, category };
  } catch {
    return null;
  }
}

/**
 * ✅ Backward compat (если где-то остались старые slugs)
 * ожидаем slug: collection-amber-bedrooms
 */
export function parseCollectionSlug(slug: string) {
  const m = slug?.match(/^collection-([a-z0-9-]+)-([a-z0-9-]+)$/i);
  if (!m) return null;

  // category из slug -> menu
  const category = MENU_BY_CATEGORY[m[2]] ?? m[2];

  return { brand: m[1], category };
}

export const megaCategories: MegaCategory[] = [
  {
    key: "bedrooms",
    labelKey: "header.mega.bedrooms",
    fallback: "СПАЛЬНИ",
    href: "/category/bedrooms",
    items: [
      {
        labelKey: "brand.amber",
        fallback: "АМБЕР",
        href: makeCollectionHref("amber", "bedrooms"),
      },
      {
        labelKey: "brand.scandi",
        fallback: "СКАНДИ",
        href: makeCollectionHref("scandi", "bedrooms"),
      },
      {
        labelKey: "brand.elizabeth",
        fallback: "ЭЛИЗАБЕТ",
        href: makeCollectionHref("elizabeth", "bedrooms"),
      },
      {
        labelKey: "brand.salvador",
        fallback: "САЛЬВАДОР",
        href: makeCollectionHref("salvador", "bedrooms"),
      },
      {
        labelKey: "brand.pitti",
        fallback: "ПИТТИ",
        href: makeCollectionHref("pitti", "bedrooms"),
      },
      {
        labelKey: "brand.buongiorno",
        fallback: "БОНЖОРНО",
        href: makeCollectionHref("buongiorno", "bedrooms"),
      },
    ],
  },
  {
    key: "living",
    labelKey: "header.mega.living",
    fallback: "ГОСТИНЫЕ",
    href: "/category/living",
    items: [
      {
        labelKey: "brand.scandi",
        fallback: "СКАНДИ",
        href: makeCollectionHref("scandi", "living"),
      },
      {
        labelKey: "brand.pitti_alt",
        fallback: "ПИТТИ",
        href: makeCollectionHref("pitti", "living"),
      },
      {
        labelKey: "brand.salvador",
        fallback: "САЛЬВАДОР",
        href: makeCollectionHref("salvador", "living"),
      },
      {
        labelKey: "brand.bergen_white",
        fallback: "БОНЖОРНО",
        href: makeCollectionHref("buongiorno", "living"),
      },
    ],
  },
   {
    key: "wardrobes",
    labelKey: "header.mega.youth",
    fallback: "МОЛОДЕЖНЫЕ",
    href: "/category/youth",
    items: [
      {
        labelKey: "brand.scandi",
        fallback: "СКАНДИ",
        href: makeCollectionHref("scandi", "youth"),
      },
      {
        labelKey: "brand.elizabeth",
        fallback: "ЭЛИЗАБЕТ",
        href: makeCollectionHref("elizabeth", "youth"),
      },
    ],
  },
  {
    key: "hallway",
    labelKey: "header.mega.hallway",
    fallback: "ПРИХОЖИЕ",
    href: "/category/hallway",
    items: [
      {
        labelKey: "common.inDev",
        fallback: "В РАЗРАБОТКЕ",
        href: "/category/hallway",
      },
    ],
  },
  {
    key: "tables",
    labelKey: "header.mega.tables",
    fallback: "СТОЛЫ И СТУЛЬЯ",
    href: "/category/tables",
    items: [
      {
        labelKey: "common.inDev",
        fallback: "В РАЗРАБОТКЕ",
        href: "/category/tables",
      },
    ],
  },
 
];

/* =========================
   MEGA MENU PREVIEWS (1 big + 2 small)
   Картинки лежат в /public/mega/...
========================= */

type MegaPreview = {
  titleKey: string;
  fallback: string;
  main: string;
  a?: string;
  b?: string;
};


export const MEGA_PREVIEWS: Record<string, MegaPreview> = {
  // СПАЛЬНИ
  [makeCollectionHref("amber", "bedrooms")]: {
    titleKey: "mega.preview.bedrooms.amber",
    fallback: "Спальня «АМБЕР»",
    main: "/mega/bedrooms/amber/main.jpg",
    a: "/mega/bedrooms/amber/1.jpg",
    b: "/mega/bedrooms/amber/2.jpg",
  },
  [makeCollectionHref("scandi", "bedrooms")]: {
    titleKey: "mega.preview.bedrooms.scandi",
    fallback: "Спальня «СКАНДИ»",
    main: "/mega/bedrooms/scandi/main.jpg",
    a: "/mega/bedrooms/scandi/1.jpg",
    b: "/mega/bedrooms/scandi/2.jpg",
  },
  [makeCollectionHref("elizabeth", "bedrooms")]: {
    titleKey: "mega.preview.bedrooms.elizabeth",
    fallback: "Спальня «ЭЛИЗАБЕТ»",
    main: "/mega/bedrooms/elizabeth/main.jpg",
    a: "/mega/bedrooms/elizabeth/1.jpg",
    b: "/mega/bedrooms/elizabeth/2.jpg",
  },
  [makeCollectionHref("salvador", "bedrooms")]: {
    titleKey: "mega.preview.bedrooms.salvador",
    fallback: "Спальня «САЛЬВАДОР»",
    main: "/mega/bedrooms/salvador/main.jpg",
    a: "/mega/bedrooms/salvador/1.jpg",
    b: "/mega/bedrooms/salvador/2.jpg",
  },
  [makeCollectionHref("pitti", "bedrooms")]: {
    titleKey: "mega.preview.bedrooms.pitti",
    fallback: "Спальня «ПИТТИ»",
    main: "/mega/bedrooms/pitti/main.jpg",
    a: "/mega/bedrooms/pitti/1.jpg",
    b: "/mega/bedrooms/pitti/2.jpg",
  },
  [makeCollectionHref("buongiorno", "bedrooms")]: {
    titleKey: "mega.preview.bedrooms.buongiorno",
    fallback: "Спальня «БОНЖОРНО»",
    main: "/mega/bedrooms/buongiorno/main.jpg",
    a: "/mega/bedrooms/buongiorno/1.jpg",
    b: "/mega/bedrooms/buongiorno/2.jpg",
  },

  // ГОСТИНЫЕ
  [makeCollectionHref("scandi", "living")]: {
    titleKey: "mega.preview.living.scandi",
    fallback: "Гостиная «СКАНДИ»",
    main: "/mega/living/scandi/main.jpg",
    a: "/mega/living/scandi/1.jpg",
    b: "/mega/living/scandi/2.jpg",
  },
  [makeCollectionHref("pitti", "living")]: {
    titleKey: "mega.preview.living.pitti",
    fallback: "Гостиная «ПИТТИ»",
    main: "/mega/living/pitti/main.jpg",
    a: "/mega/living/pitti/1.jpg",
    b: "/mega/living/pitti/2.jpg",
  },
  [makeCollectionHref("salvador", "living")]: {
    titleKey: "mega.preview.living.salvador",
    fallback: "Гостиная «САЛЬВАДОР»",
    main: "/mega/living/salvador/main.jpg",
 
  },
  [makeCollectionHref("buongiorno", "living")]: {
    titleKey: "mega.preview.living.bergenWhite",
    fallback: "Гостиная «БОНЖОРНО»",
    main: "/mega/living/buongiorno/main.jpg",
    a: "/mega/living/buongiorno/1.jpg",
    b: "/mega/living/buongiorno/2.jpg",
  },

  // МОЛОДЕЖНЫЕ
  [makeCollectionHref("scandi", "youth")]: {
    titleKey: "mega.preview.youth.scandi",
    fallback: "Молодежная «СКАНДИ»",
    main: "/mega/youth/scandi/main.jpg",
    a: "/mega/youth/scandi/1.jpg",
    b: "/mega/youth/scandi/2.jpg",
  },
  [makeCollectionHref("elizabeth", "youth")]: {
    titleKey: "mega.preview.youth.elizabeth",
    fallback: "Молодежная «ЭЛИЗАБЕТ»",
    main: "/mega/youth/elizabeth/main.jpg",
  },
};

/**
 * ✅ Маппинг: href коллекции -> id "товара-витрины"
 */
export const COLLECTION_ID_BY_HREF: Record<string, string> = Object.keys(
  MEGA_PREVIEWS,
).reduce((acc, href) => {
  const meta = parseCollectionHref(href);
  if (!meta) return acc;
  acc[href] = makeCollectionId(meta.brand, meta.category);
  return acc;
}, {} as Record<string, string>);

/**
 * ✅ href -> {brand, category}
 */
export const COLLECTION_META_BY_HREF: Record<
  string,
  { brand: string; category: string }
> = Object.keys(MEGA_PREVIEWS).reduce((acc, href) => {
  const meta = parseCollectionHref(href);
  if (!meta) return acc;
  acc[href] = meta;
  return acc;
}, {} as Record<string, { brand: string; category: string }>);

export const REGION_DATA = {
  uz: {
    labelKey: "region.uz",
    fallback: "Узбекистан",
    phone: "+998 90 000-00-00",
    addresses: ["Rich House Мирзо-Улугбека, 18"],
    phonePrefix: "+998",
  },
  ru: {
    labelKey: "region.ru",
    fallback: "Россия",
    phone: "+7 495 077-85-59",
    addresses: [
      "Москва, ул. Тверская, 12",
      "Москва, Ленинградский просп., 45",
      "Санкт-Петербург, Невский пр., 28",
    ],
    phonePrefix: "+7",
  },
} as const;
