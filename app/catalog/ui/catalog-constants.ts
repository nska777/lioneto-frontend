// app/catalog/ui/catalog-constants.ts

export const ROOM_ITEMS = [
  { label: "Спальни", value: "bedrooms" },
  { label: "Гостиные", value: "living" },
  { label: "Прихожие", value: "hallway" },
  { label: "Молодёжные", value: "youth" },
  { label: "Столы и стулья", value: "tables_chairs" },
] as const;

export const MODULE_ITEMS = [
  { label: "Комоды", value: "komody" },
  { label: "Тумбы", value: "tumby" },
  { label: "Кровати", value: "krovati" },
  { label: "Шкафы", value: "shkafy" },
  { label: "Стеллаж", value: "stellaji" },
  { label: "Антресоль", value: "antresol" },
  { label: "Зеркала", value: "zerkala" },
  { label: "Витрины", value: "vitrini" },
  { label: "Столы", value: "stoli" },
  { label: "Полки", value: "polki" },
  { label: "Пуфы", value: "pufi" },
  { label: "Вешалки", value: "veshalki" },
  { label: "Фасады", value: "fasadi" },
  { label: "Плинтус", value: "plintusy" },
  { label: "Потолки", value: "potolki" },
] as const;

// подфильтры створок
export const DOOR_ITEMS = [
  { label: "1", value: "1" },
  { label: "2", value: "2" },
  { label: "3", value: "3" },
  { label: "4", value: "4" },
] as const;

// шкафы — фасад
export const FACADE_ITEMS: Array<{ label: string; value: string }> = [
  { label: "Глухой", value: "blind" },
  { label: "Зеркальный", value: "mirror" },
  { label: "Комбинированный", value: "combined" },
  { label: "Зеркально-комбинир.", value: "mirror-combined" },
];

// витрины — вид
export const VITRINI_FACADE_ITEMS: Array<{ label: string; value: string }> = [
  { label: "Обычная", value: "blind" },
  { label: "Со стеклом", value: "glass" },
  { label: "Со стеклом и полками", value: "glass-shelves" },
];

// set “room-mode”
export const ROOM_MENUS_SET = new Set(
  ROOM_ITEMS.map((x) => String(x.value).trim().toLowerCase()),
);
