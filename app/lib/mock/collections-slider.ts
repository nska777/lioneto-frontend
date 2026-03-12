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
      "Плавные линии и мягкие формы, естественность, использование акварельных тонов, удобство и чувство меры.",
    images: [
      img("/images/collections/scandy/01.jpg", "SCANDY интерьер"),
      img("/images/collections/scandy/02.jpg", "SCANDY интерьер"),
      img("/images/collections/scandy/03.jpg", "SCANDY интерьер"),
    ],
    href: "/catalog?brand=skandy",
  },

  {
    id: "amber",
    title: "AMBER",
    description:
      "Лаконичная обстановка, спокойные цветовые решения, сочетание различных текстур и функциональность.",
    images: [
      img("/images/collections/amber/01.jpg", "AMBER интерьер"),
      img("/images/collections/amber/02.jpg", "AMBER интерьер"),
      img("/images/collections/amber/03.jpg", "AMBER интерьер"),
    ],
    href: "/catalog?brand=amber",
  },

  {
    id: "elizabeth",
    title: "ELIZABETH",
    description:
      "Элегантность, сдержанность и душевный покой, светлые тона с яркими акцентами, легкость и воздушность.",
    images: [
      img("/images/collections/elizabeth/01.jpg", "ELIZABETH интерьер"),
      img("/images/collections/elizabeth/02.jpg", "ELIZABETH интерьер"),
      img("/images/collections/elizabeth/03.jpg", "ELIZABETH интерьер"),
    ],
    href: "/catalog?brand=elizabeth",
  },

  {
    id: "buongiorno",
    title: "BUONGIORNO",
    description:
      "Геометричность и сложность форм, изысканность и статусность, роскошь, которую можно себе позволить." ,
      
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
      "Изящность в сочетании с монументальностью, характерные декоративные элементы, темная цветовая гамма.",
    images: [
      img("/images/collections/pitti/01.jpg", "PITTI интерьер"),
      img("/images/collections/pitti/02.jpg", "PITTI интерьер"),
			
    ],
    href: "/catalog?brand=pitti",
  },

  {
    id: "salvador",
    title: "SALVADOR",
    description:
      "Современная классика, утонченность и комфорт, тактильно приятные материалы, умиротворяющее цветовое решение.",
    images: [
      img("/images/collections/salvador/01.jpg", "SALVADOR интерьер"),
      img("/images/collections/salvador/02.jpg", "SALVADOR интерьер"),
    ],
    href: "/catalog?brand=salvador",
  },
];
