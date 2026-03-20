export type DealerCountryCode = "RU" | "UZ" | "KZ" | "TJ";

export type DealerCategory =
  | "Спальни"
  | "Гостиные"
  | "Молодежные"
  | "Прихожие"
  | "Столы и стулья";

export type DealerCollection = {
  slug: string;
  title: string;
  description: string;
  image: string;
  moduleCount: number;
  categories: DealerCategory[];
};

export type DealerProductPriceMap = Record<DealerCountryCode, number>;

export type DealerAddon = {
  id: string;
  title: string;
  type: "checkbox" | "quantity";
  price: DealerProductPriceMap;
};

export type DealerProduct = {
  id: string;
  collectionSlug: string;
  category: DealerCategory;
  title: string;
  article: string;
  image: string;
  description: string;
  price: DealerProductPriceMap;
  addons?: DealerAddon[];
};

export const dealerCollections: DealerCollection[] = [
  {
    slug: "amber",
    title: "AMBER",
    description: "Современная коллекция с мягкими формами и теплыми оттенками.",
    image: "/images/placeholder-product.jpg",
    moduleCount: 24,
    categories: ["Спальни", "Гостиные", "Прихожие"],
  },
  {
    slug: "scandy",
    title: "SCANDY",
    description: "Светлая коллекция в скандинавском стиле.",
    image: "/images/placeholder-product.jpg",
    moduleCount: 18,
    categories: ["Спальни", "Гостиные", "Молодежные"],
  },
  {
    slug: "elizabeth",
    title: "ELIZABETH",
    description: "Более классическая линия с выразительными фасадами.",
    image: "/images/placeholder-product.jpg",
    moduleCount: 20,
    categories: ["Спальни", "Гостиные"],
  },
  {
    slug: "salvador",
    title: "SALVADOR",
    description: "Премиальная коллекция для спальни и гостиной.",
    image: "/images/placeholder-product.jpg",
    moduleCount: 28,
    categories: ["Спальни", "Гостиные", "Прихожие", "Столы и стулья"],
  },
  {
    slug: "pitti",
    title: "PITTI",
    description: "Минималистичная коллекция с чистыми линиями.",
    image: "/images/placeholder-product.jpg",
    moduleCount: 17,
    categories: ["Спальни", "Молодежные"],
  },
  {
    slug: "buongiorno",
    title: "BUONGIORNO",
    description: "Функциональные модули для ежедневных интерьеров.",
    image: "/images/placeholder-product.jpg",
    moduleCount: 32,
    categories: ["Спальни", "Гостиные", "Прихожие", "Столы и стулья"],
  },
];

export const dealerProducts: DealerProduct[] = [
  {
    id: "salvador-wardrobe-4",
    collectionSlug: "salvador",
    category: "Спальни",
    title: "Шкаф 4-дверный Salvador",
    article: "SL-WD-04",
    image: "/images/placeholder-product.jpg",
    description:
      "Вместительный шкаф с современным фасадом для основной спальни.",
    price: {
      RU: 120000,
      UZ: 16800000,
      KZ: 650000,
      TJ: 14600,
    },
    addons: [
      {
        id: "mirror-facade",
        title: "Зеркало на фасад",
        type: "checkbox",
        price: {
          RU: 12000,
          UZ: 1680000,
          KZ: 65000,
          TJ: 1460,
        },
      },
      {
        id: "extra-shelf",
        title: "Дополнительная полка",
        type: "quantity",
        price: {
          RU: 2500,
          UZ: 350000,
          KZ: 14000,
          TJ: 300,
        },
      },
    ],
  },
  {
    id: "salvador-bed-160",
    collectionSlug: "salvador",
    category: "Спальни",
    title: "Кровать 160 Salvador",
    article: "SL-BD-160",
    image: "/images/placeholder-product.jpg",
    description:
      "Двуспальная кровать с широкой спинкой и мягким визуальным акцентом.",
    price: {
      RU: 89000,
      UZ: 12460000,
      KZ: 480000,
      TJ: 10800,
    },
  },
  {
    id: "salvador-tv",
    collectionSlug: "salvador",
    category: "Гостиные",
    title: "Тумба TV Salvador",
    article: "SL-TV-02",
    image: "/images/placeholder-product.jpg",
    description: "Компактная ТВ-тумба для современной гостиной.",
    price: {
      RU: 43500,
      UZ: 6090000,
      KZ: 234000,
      TJ: 5300,
    },
  },
  {
    id: "amber-hall",
    collectionSlug: "amber",
    category: "Прихожие",
    title: "Зеркало Amber",
    article: "AM-HL-01",
    image: "/images/placeholder-product.jpg",
    description: "Компактный модуль для прихожей с местом для хранения.",
    price: {
      RU: 54000,
      UZ: 7560000,
      KZ: 291000,
      TJ: 6600,
    },
  },
  {
    id: "amber-bedside",
    collectionSlug: "amber",
    category: "Спальни",
    title: "Тумба прикроватная Amber",
    article: "AM-BS-02",
    image: "/images/placeholder-product.jpg",
    description: "Аккуратная прикроватная тумба для спальни.",
    price: {
      RU: 18500,
      UZ: 2590000,
      KZ: 100000,
      TJ: 2250,
    },
  },
  {
    id: "amber-console",
    collectionSlug: "amber",
    category: "Прихожие",
    title: "Стеллаж Amber",
    article: "AM-CN-01",
    image: "/images/placeholder-product.jpg",
    description: "Компактная консоль для прихожей Amber.",
    price: {
      RU: 22000,
      UZ: 3080000,
      KZ: 119000,
      TJ: 2680,
    },
  },
  {
    id: "amber-mirror",
    collectionSlug: "amber",
    category: "Прихожие",
    title: "Кровать Amber",
    article: "AM-MR-01",
    image: "/images/placeholder-product.jpg",
    description: "Настенное зеркало для прихожей Amber.",
    price: {
      RU: 12500,
      UZ: 1750000,
      KZ: 68000,
      TJ: 1520,
    },
  },
  {
    id: "scandy-dresser",
    collectionSlug: "scandy",
    category: "Спальни",
    title: "Комод Scandy",
    article: "SC-DR-03",
    image: "/images/placeholder-product.jpg",
    description: "Светлый комод с лаконичным фасадом.",
    price: {
      RU: 39000,
      UZ: 5460000,
      KZ: 211000,
      TJ: 4750,
    },
  },
  {
    id: "buongiorno-table",
    collectionSlug: "buongiorno",
    category: "Столы и стулья",
    title: "Кровать Buongiorno",
    article: "BG-TB-01",
    image: "/images/placeholder-product.jpg",
    description: "Обеденный стол для современной столовой зоны.",
    price: {
      RU: 47000,
      UZ: 6580000,
      KZ: 254000,
      TJ: 5700,
    },
  },
];