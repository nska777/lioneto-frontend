// app/lib/mock/section-data/index.ts
import type {
  CollectionKey,
  CollectionScene,
  SceneVariantKey,
  SectionKey,
} from "./types";

import { BEDROOMS_SCENES } from "./bedrooms";
import { LIVING_SCENES } from "./living";
import { YOUTH_SCENES } from "./youth";

/**
 * ✅ Единый список сцен (для любых разделов)
 */
export const ALL_SCENES: CollectionScene[] = [
  ...BEDROOMS_SCENES,
  ...LIVING_SCENES,
  ...YOUTH_SCENES,
];

/**
 * ✅ Метаданные коллекций
 */
export const COLLECTIONS_META: Record<CollectionKey, any> = {
  amber: { key: "amber", label: "AMBER" },
  buongiorno: { key: "buongiorno", label: "BUONGIORNO", hasVariants: true },
  elizabeth: { key: "elizabeth", label: "ELIZABETH" },
  pitti: { key: "pitti", label: "PITTI" },
  salvador: { key: "salvador", label: "SALVADOR" },
  scandi: { key: "scandi", label: "SCANDI", hasVariants: true },
};

/**
 * ✅ Какие коллекции есть в каждом разделе
 */
export const SECTION_COLLECTIONS: any = {
  bedrooms: ["amber", "buongiorno", "elizabeth", "pitti", "salvador", "scandi"],
  living: ["buongiorno", "pitti", "salvador", "scandi"],
  youth: ["elizabeth", "scandi"],
};

/**
 * ✅ Внутренний “канонический” вариант:
 * - если у сцены нет variant -> считаем "default"
 */
export type SceneVariant = SceneVariantKey | "default";

export function normalizeVariant(v?: SceneVariantKey): SceneVariant {
  return v ?? "default";
}

export function getCollectionsForSection(section: SectionKey): CollectionKey[] {
  return SECTION_COLLECTIONS[section] ?? [];
}

/**
 * ✅ Все сцены конкретной коллекции в конкретном разделе
 */
export function getScenes(section: SectionKey, collection: CollectionKey) {
  return ALL_SCENES.filter(
    (s) => s.section === section && s.collection === collection,
  );
}

/**
 * ✅ Список вариантов для (section, collection)
 * Возвращает ["white","cappuccino"] или ["default"] или микс (редко)
 */
export function getVariants(section: SectionKey, collection: CollectionKey) {
  const scenes = getScenes(section, collection);

  // нормализуем, чтобы никогда не было undefined/null
  const variants = Array.from(
    new Set(scenes.map((s) => normalizeVariant(s.variant))),
  );

  // сортировка чтобы white/cappuccino шли красиво, default последним
  const order: SceneVariant[] = ["white", "cappuccino", "default"];

  return variants.sort((a, b) => order.indexOf(a) - order.indexOf(b));
}

/**
 * ✅ Получить одну сцену (section, collection, variant)
 * variant: "white" | "cappuccino" | "default"
 */
export function getScene(
  section: SectionKey,
  collection: CollectionKey,
  variant: SceneVariant,
): CollectionScene | null {
  return (
    ALL_SCENES.find(
      (s) =>
        s.section === section &&
        s.collection === collection &&
        normalizeVariant(s.variant) === variant,
    ) ?? null
  );
}
