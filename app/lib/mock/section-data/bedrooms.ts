// app/lib/mock/section-data/bedrooms.ts
import type { CollectionScene } from "./types";

const makeGallery = (basePath: string, count: number) =>
  Array.from({ length: count }, (_, i) => {
    const n = String(i + 1).padStart(2, "0");
    return `${basePath}/${n}.jpg`;
  });

export const BEDROOMS_SCENES: CollectionScene[] = [
  // AMBER (без вариантов)
  {
    id: "scene-bedrooms-amber",
    section: "bedrooms",
    collection: "amber",
    title: "Спальня",
    badge: "AMBER",
    // поставит реальное кол-во фоток
    gallery: makeGallery("/sections/bedrooms/amber", 4),
    cover: "/sections/bedrooms/amber/01.jpg",
    priceRUB: 0,
    priceUZS: 0,
  },

  // BUONGIORNO (white + cappuccino)
  {
    id: "scene-bedrooms-buongiorno-white",
    section: "bedrooms",
    collection: "buongiorno",
    variant: "white",
    title: "Спальня",
    badge: "BUONGIORNO • белый",
    gallery: makeGallery("/sections/bedrooms/buongiorno/white", 1),
    cover: "/sections/bedrooms/buongiorno/white/01.jpg",
    priceRUB: 0,
    priceUZS: 0,
  },
  {
    id: "scene-bedrooms-buongiorno-cappuccino",
    section: "bedrooms",
    collection: "buongiorno",
    variant: "cappuccino",
    title: "Спальня",
    badge: "BUONGIORNO • капучино",
    gallery: makeGallery("/sections/bedrooms/buongiorno/cappuccino", 2),
    cover: "/sections/bedrooms/buongiorno/cappuccino/01.jpg",
    priceRUB: 0,
    priceUZS: 0,
  },

  // SCANDI (white + cappuccino)
  {
    id: "scene-bedrooms-scandi-white",
    section: "bedrooms",
    collection: "scandi",
    variant: "white",
    title: "Спальня",
    badge: "SCANDY • белый",
    gallery: makeGallery("/sections/bedrooms/scandi/white", 5),
    cover: "/sections/bedrooms/scandi/white/01.jpg",
    priceRUB: 0,
    priceUZS: 0,
  },
  {
    id: "scene-bedrooms-scandi-cappuccino",
    section: "bedrooms",
    collection: "scandi",
    variant: "cappuccino",
    title: "Спальня",
    badge: "SCANDY • капучино",
    gallery: makeGallery("/sections/bedrooms/scandi/cappuccino", 3),
    cover: "/sections/bedrooms/scandi/cappuccino/01.jpg",
    priceRUB: 0,
    priceUZS: 0,
  },

  // ELIZABETH
  {
    id: "scene-bedrooms-elizabeth",
    section: "bedrooms",
    collection: "elizabeth",
    title: "Спальня",
    badge: "ELIZABETH",
    gallery: makeGallery("/sections/bedrooms/elizabeth", 2),
    cover: "/sections/bedrooms/elizabeth/01.jpg",
    priceRUB: 0,
    priceUZS: 0,
  },

  // PITTI
  {
    id: "scene-bedrooms-pitti",
    section: "bedrooms",
    collection: "pitti",
    title: "Спальня",
    badge: "PITTI",
    gallery: makeGallery("/sections/bedrooms/pitti", 10),
    cover: "/sections/bedrooms/pitti/01.jpg",
    priceRUB: 0,
    priceUZS: 0,
  },

  // SALVADOR
  {
    id: "scene-bedrooms-salvador",
    section: "bedrooms",
    collection: "salvador",
    title: "Спальня",
    badge: "SALVADOR",
    gallery: makeGallery("/sections/bedrooms/salvador", 2),
    cover: "/sections/bedrooms/salvador/01.jpg",
    priceRUB: 0,
    priceUZS: 0,
  },
];
