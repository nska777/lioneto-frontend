// app/lib/mock/section-data/youth.ts
import type { CollectionScene } from "./types";

const makeGallery = (basePath: string, count: number) =>
  Array.from({ length: count }, (_, i) => {
    const n = String(i + 1).padStart(2, "0");
    return `${basePath}/${n}.jpg`;
  });

export const YOUTH_SCENES: CollectionScene[] = [
  {
    id: "scene-youth-elizabeth",
    section: "youth",
    collection: "elizabeth",
    title: "Молодёжная",
    badge: "ELIZABETH",
    gallery: makeGallery("/sections/youth/elizabeth", 1),
    cover: "/sections/youth/elizabeth/01.jpg",
    priceRUB: 0,
    priceUZS: 0,
  },
  {
    id: "scene-youth-scandi",
    section: "youth",
    collection: "scandi",
    title: "Молодёжная",
    badge: "SCANDI",
    gallery: makeGallery("/sections/youth/scandi", 3),
    cover: "/sections/youth/scandi/01.jpg",
    priceRUB: 0,
    priceUZS: 0,
  },
];
