// app/lib/mock/collections-slider.ts
// Мок ТОЛЬКО для CollectionsSlider (не используется нигде больше)

export type SliderImage = {
  url: string;
  alternativeText?: string | null;
};

export type SliderCollection = {
  id: string;
  title: string;
  description?: string;
  images: SliderImage[]; // [0] — главный слайд, [1] — второй
  href?: string;
};

const img = (url: string, alt?: string): SliderImage => ({
  url,
  alternativeText: alt ?? null,
});

export const COLLECTIONS_SLIDER_MOCK: SliderCollection[] = [
  {
    id: "scandy",
    title: "SCANDY",
    description:
      "Скандинавский стиль с акцентом на светлые оттенки, натуральные материалы и функциональность.",
    images: [
      img("/images/collections/scandy/01.jpg", "SCANDY интерьер"),
      img("/images/collections/scandy/02.jpg", "SCANDY интерьер"),
    ],
    href: "/catalog?brand=skandy",
  },

  {
    id: "amber",
    title: "AMBER",
    description:
      "Современные формы, спокойная цветовая палитра и универсальные решения для интерьера.",
    images: [
      img("/images/collections/amber/01.jpg", "AMBER интерьер"),
      img("/images/collections/amber/02.jpg", "AMBER интерьер"),
    ],
    href: "/catalog?brand=amber",
  },

  {
    id: "elizabeth",
    title: "ELIZABETH",
    description:
      "Элегантная коллекция с классическими пропорциями и утончёнными деталями.",
    images: [
      img("/images/collections/elizabeth/01.jpg", "ELIZABETH интерьер"),
    ],
    href: "/catalog?brand=elizabeth",
  },

  {
    id: "buongiorno",
    title: "BUONGIORNO",
    description:
      "Мягкие линии, уютные композиции и тёплая атмосфера для спальни и гостиной.",
    images: [
      img("/images/collections/buongiorno/01.jpg", "BUONGIORNO интерьер"),
      img("/images/collections/buongiorno/02.jpg", "BUONGIORNO интерьер"),
    ],
    href: "/catalog?brand=buongiorno",
  },

  {
    id: "pitti",
    title: "PITTI",
    description:
      "Минимализм и строгость форм, подчёркнутые качественными материалами и деталями.",
    images: [
      img("/images/collections/pitti/01.jpg", "PITTI интерьер"),
			
    ],
    href: "/catalog?brand=pitti",
  },

  {
    id: "salvador",
    title: "SALVADOR",
    description:
      "Современный дизайн с выразительными акцентами и продуманной эргономикой.",
    images: [
      img("/images/collections/salvador/01.jpg", "SALVADOR интерьер"),
      img("/images/collections/salvador/02.jpg", "SALVADOR интерьер"),
    ],
    href: "/catalog?brand=salvador",
  },
];
