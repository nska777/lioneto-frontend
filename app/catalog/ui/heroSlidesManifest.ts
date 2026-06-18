// app/catalog/ui/heroSlidesManifest.ts

export type HeroSlidesConf = {
  base: string;
  count: number;
  ext?: "jpg" | "webp";
};

export const HERO_SLIDES_MANIFEST: Record<string, HeroSlidesConf> = {
  // key = `${room}:${collection}`

  // bedrooms
  "bedrooms:amber": {
    base: "/slidermenu/bedrooms/amber",
    count: 4,
    ext: "jpg",
  },
  "bedrooms:buongiorno": {
    base: "/slidermenu/bedrooms/buongiorno",
    count: 2,
    ext: "jpg",
  },
  "bedrooms:elizabeth": {
    base: "/slidermenu/bedrooms/elizabeth",
    count: 2,
    ext: "jpg",
  },
  "bedrooms:pitti": {
    base: "/slidermenu/bedrooms/pitti",
    count: 3,
    ext: "jpg",
  },
  "bedrooms:salvador": {
    base: "/slidermenu/bedrooms/salvador",
    count: 2,
    ext: "jpg",
  },
  "bedrooms:scandi": {
    base: "/slidermenu/bedrooms/scandi",
    count: 2,
    ext: "jpg",
  },

  // living
  "living:amber": {
    base: "/slidermenu/living/amber",
    count: 2,
    ext: "jpg",
  },
  "living:salvador": {
    base: "/slidermenu/living/salvador",
    count: 1,
    ext: "jpg",
  },
  "living:pitti": {
    base: "/slidermenu/living/pitti",
    count: 2,
    ext: "jpg",
  },
  "living:buongiorno": {
    base: "/slidermenu/living/buongiorno",
    count: 2,
    ext: "jpg",
  },
  "living:scandi": {
    base: "/slidermenu/living/scandi",
    count: 2,
    ext: "jpg",
  },

  // youth
  "youth:scandi": {
    base: "/slidermenu/youth/scandi",
    count: 1,
    ext: "jpg",
  },
  "youth:elizabeth": {
    base: "/slidermenu/youth/elizabeth",
    count: 1,
    ext: "jpg",
  },
};

export function makeSlidesFromConf(conf: HeroSlidesConf) {
  const ext = conf.ext ?? "jpg";

  return Array.from({ length: conf.count }, (_, i) => {
    const n = String(i + 1).padStart(2, "0");
    return `${conf.base}/${n}.${ext}`;
  });
}