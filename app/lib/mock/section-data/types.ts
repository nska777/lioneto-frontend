// app/lib/mock/section-data/types.ts

export type SectionKey = "bedrooms" | "living" | "youth";

export type CollectionKey =
  | "amber"
  | "buongiorno"
  | "elizabeth"
  | "pitti"
  | "salvador"
  | "scandi";

// ✅ Варианты цветов (если их нет — variant просто не указываем)
export type SceneVariantKey = "white" | "cappuccino";

export type CollectionScene = {
  id: string;

  // ✅ Раздел (Спальни/Гостиные/Молодёжные)
  section: SectionKey;

  // ✅ Коллекция (brand slug)
  collection: CollectionKey;

  /**
   * ✅ Если variant не указан — значит фото лежат прямо в папке коллекции:
   * /public/sections/{section}/{collection}/01.jpg
   *
   * Если указан — значит лежат в подпапке:
   * /public/sections/{section}/{collection}/{variant}/01.jpg
   */
  variant?: SceneVariantKey;

  // ✅ Тайтл на карточке (у тебя "Спальня", "Гостиная", "Молодёжная" и т.д.)
  title: string;

  // ✅ Бейдж сверху (например "BUONGIORNO • белый")
  badge?: string;

  // ✅ Обложка (на всякий случай, чтобы не зависеть от gallery[0])
  cover?: string;

  // ✅ Галерея (любой размер)
  gallery: string[];

  // ✅ Цены (потом заполнишь)
  priceRUB: number;
  priceUZS: number;
};
