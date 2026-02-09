export type Hotspot = {
  id: string;
  productId: string;     // id из CATALOG_MOCK
  xPct: number;          // 0..100
  yPct: number;          // 0..100
  side?: "left" | "right"; // куда открывать карточку (опционально)
};

export type HeroSlide = {
  id: string;
  image: string;         // /images/...
  title?: string;
  subtitle?: string;
  hotspots: Hotspot[];
};

export const HERO_SLIDES_WITH_HOTSPOTS: HeroSlide[] = [
  {
    id: "sale-1",
    image: "/images/hero/sale-01.jpg",
    title: "Сейчас проходят скидки",
    subtitle: "до 25% на мебель",
    hotspots: [
      { id: "h1", productId: "amber-shkafy-shkaf-gostinnaya", xPct: 48, yPct: 34, side: "left" },
      { id: "h2", productId: "scandi-krovati-min-base", xPct: 62, yPct: 43, side: "right" },
      { id: "h3", productId: "buongiorno-zerkalo", xPct: 55, yPct: 62, side: "left" },
    ],
  },
];
