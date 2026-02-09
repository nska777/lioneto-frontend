// i18n/index.ts
import ru from "./locales/ru";
import uz from "./locales/uz";

export const dictionaries = { ru, uz } as const;
export type Lang = keyof typeof dictionaries;

export function getDict(lang: Lang) {
  return dictionaries[lang] ?? dictionaries.ru;
}

function getByPath(obj: any, path: string) {
  return path.split(".").reduce((o, k) => (o ? o[k] : undefined), obj);
}

export function t(dict: any, key: unknown): string {
  if (typeof key !== "string" || !key.trim()) return "";
  const v = getByPath(dict, key);
  return typeof v === "string" ? v : key;
}

// ✅ безопасный fallback
export function tF(dict: any, key: unknown, fallback: string): string {
  if (typeof key !== "string" || !key.trim()) return fallback;
  const v = getByPath(dict, key);
  return typeof v === "string" && v.trim() ? v : fallback;
}
