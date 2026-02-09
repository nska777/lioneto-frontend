// app/lib/mock/section-data/living.ts
import type { CollectionScene } from "./types";

const makeGallery = (basePath: string, count: number) =>
  Array.from({ length: count }, (_, i) => {
    const n = String(i + 1).padStart(2, "0");
    return `${basePath}/${n}.jpg`;
  });

export const LIVING_SCENES: CollectionScene[] = [
  // BUONGIORNO (white + cappuccino)
  {
    id: "scene-living-buongiorno-white",
    section: "living",
    collection: "buongiorno",
    variant: "white",
    title: "Гостиная",
    badge: "BUONGIORNO • белый",
    gallery: makeGallery("/sections/living/buongiorno/white", 4),
    cover: "/sections/living/buongiorno/white/01.jpg",
    priceRUB: 0,
    priceUZS: 0,
  },
  {
    id: "scene-living-buongiorno-cappuccino",
    section: "living",
    collection: "buongiorno",
    variant: "cappuccino",
    title: "Гостиная",
    badge: "BUONGIORNO • капучино",
    gallery: makeGallery("/sections/living/buongiorno/cappuccino", 1),
    cover: "/sections/living/buongiorno/cappuccino/01.jpg",
    priceRUB: 0,
    priceUZS: 0,
  },

  // PITTI
  {
    id: "scene-living-pitti",
    section: "living",
    collection: "pitti",
    title: "Гостиная",
    badge: "PITTI",
    gallery: makeGallery("/sections/living/pitti", 4),
    cover: "/sections/living/pitti/01.jpg",
    priceRUB: 0,
    priceUZS: 0,
  },

  // SALVADOR
  {
    id: "scene-living-salvador",
    section: "living",
    collection: "salvador",
    title: "Гостиная",
    badge: "SALVADOR",
    gallery: makeGallery("/sections/living/salvador", 1),
    cover: "/sections/living/salvador/01.jpg",
    priceRUB: 0,
    priceUZS: 0,
  },

  // SCANDI (white + cappuccino) — у тебя папка scandy
  {
    id: "scene-living-scandi-white",
    section: "living",
    collection: "scandi",
    variant: "white",
    title: "Гостиная",
    badge: "SCANDY • белый",
    gallery: makeGallery("/sections/living/scandy/white", 2),
    cover: "/sections/living/scandy/white/01.jpg",
    priceRUB: 0,
    priceUZS: 0,
  },
  {
    id: "scene-living-scandi-cappuccino",
    section: "living",
    collection: "scandi",
    variant: "cappuccino",
    title: "Гостиная",
    badge: "SCANDY • капучино",
    gallery: makeGallery("/sections/living/scandy/cappuccino", 1),
    cover: "/sections/living/scandy/cappuccino/01.jpg",
    priceRUB: 0,
    priceUZS: 0,
  },
];
