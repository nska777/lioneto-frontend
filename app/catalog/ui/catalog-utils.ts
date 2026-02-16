// app/catalog/ui/catalog-utils.ts

import { BRANDS, CATALOG_MOCK as MOCK } from "@/app/lib/mock/catalog-products";
import { MODULE_ITEMS, ROOM_ITEMS } from "./catalog-constants";

type ProductAny = (typeof MOCK)[number] & Record<string, any>;

export function norm(s: string) {
  return String(s ?? "").trim().toLowerCase();
}

/** CSV helpers (нужны useCatalogParams) */
export function parseCSV(v: string | null) {
  if (!v) return [];
  return v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export function setCSV(params: URLSearchParams, key: string, arr: string[]) {
  if (!arr.length) params.delete(key);
  else params.set(key, arr.join(","));
}

/**
 * ✅ Канонизатор бренда.
 * В данных/папках у тебя: "scandi" (это канон)
 * А в UI/ссылках может прилетать: "scandy" или "skandy"
 */
export function normalizeBrandSlug(v: string) {
  const s = norm(v);
  if (!s) return "";

  if (s === "scandy") return "scandi";
  if (s === "skandy") return "scandi";
  if (s === "scand") return "scandi";

  return s;
}

// ✅ коллекции могут прилетать как slug или как title
export function normalizeCollectionToken(v: string) {
  const t0 = normalizeBrandSlug(v);
  if (!t0) return "";

  const bySlug = BRANDS.find((b) => normalizeBrandSlug(b.slug) === t0);
  if (bySlug) return normalizeBrandSlug(bySlug.slug);

  const byTitle = BRANDS.find((b) => norm(b.title) === t0);
  if (byTitle) return normalizeBrandSlug(byTitle.slug);

  return t0;
}

export function normalizeModuleToken(v: string) {
  let t = norm(v);
  if (!t) return "";

  // ✅ алиасы для "тумбы" — приводим ВСЁ к tumbi
  if (t === "tumby") t = "tumbi"; // важный алиас: папки tumby, UI tumbi
  if (t === "tumba" || t === "tumb") t = "tumbi";
  if (t === "тумба" || t === "тумбы") t = "tumbi";

  const byValue = MODULE_ITEMS.find((x) => norm(x.value) === t);
  if (byValue) return norm(byValue.value);

  const byLabel = MODULE_ITEMS.find((x) => norm(x.label) === t);
  if (byLabel) return norm(byLabel.value);

  return t;
}

export function normalizeRoomToken(v: string) {
  const t = norm(v);
  if (!t) return "";

  const byValue = ROOM_ITEMS.find((x) => norm(x.value) === t);
  if (byValue) return norm(byValue.value);

  const byLabel = ROOM_ITEMS.find((x) => norm(x.label) === t);
  if (byLabel) return norm(byLabel.value);

  return t;
}

export function getRoomSlug(p: ProductAny) {
  return norm(
    p.cat ?? p.menu ?? p.room ?? p.section ?? p.category ?? p.room_slug ?? "",
  );
}

export function getCollectionSlug(p: ProductAny) {
  const raw =
    p.brand ??
    p.collection ??
    p.model ??
    p.series ??
    p.brandSlug ??
    p.collectionSlug ??
    "";

  return normalizeCollectionToken(String(raw ?? ""));
}

export function getModuleSlug(p: ProductAny) {
  // ✅ КРИТИЧНО: модуль тоже должен проходить normalizeModuleToken
  // иначе tumby vs tumbi никогда не совпадут
  const raw = p.type ?? p.module ?? p.kind ?? p.item_type ?? p.cat ?? "";
  return normalizeModuleToken(String(raw ?? ""));
}
