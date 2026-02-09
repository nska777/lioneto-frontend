import type { SectionKey, CollectionKey, SceneVariantKey } from "./types";

export function sectionImage(
  section: SectionKey,
  collection: CollectionKey,
  file: string,
  variant?: SceneVariantKey
) {
  if (variant) {
    return `/sections/${section}/${collection}/${variant}/${file}`;
  }
  return `/sections/${section}/${collection}/${file}`;
}

// app/lib/mock/section-data/utils.ts
export function makeGallery(basePath: string, count: number) {
  const pad2 = (n: number) => String(n).padStart(2, "0");
  return Array.from({ length: count }, (_, i) => `${basePath}/${pad2(i + 1)}.jpg`);
}

export function variantLabel(v: "white" | "cappuccino" | null) {
  if (v === "white") return "белый";
  if (v === "cappuccino") return "капучино";
  return "";
}
