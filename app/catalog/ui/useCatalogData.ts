"use client";

import { useMemo } from "react";
import { CATALOG_MOCK as MOCK } from "@/app/lib/mock/catalog-products";

import {
  ROOM_MENUS_SET,
  FACADE_ITEMS,
  VITRINI_FACADE_ITEMS,
} from "./catalog-constants";
import {
  norm,
  getRoomSlug,
  getCollectionSlug,
  getModuleSlug,
} from "./catalog-utils";

import type { SortKey } from "./useCatalogParams";
import type { FiltersValue } from "./FiltersSidebar";

type UnknownRecord = Record<string, unknown>;
type ProductAny = (typeof MOCK)[number] & UnknownRecord;

function isRecord(v: unknown): v is UnknownRecord {
  return typeof v === "object" && v !== null;
}

function getStr(obj: UnknownRecord, key: string): string | undefined {
  const v = obj[key];
  return typeof v === "string" ? v : undefined;
}

function parseSmartNumber(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;

  if (typeof v !== "string") return undefined;

  const raw = v
    .replace(/\u00A0/g, " ")
    .replace(/\u202F/g, " ")
    .trim();

  if (!raw) return undefined;

  /**
   * В Excel часто бывает:
   * 17,425,000
   * 17 425 000
   * 17.425.000
   * 17425000
   *
   * Для цен нам важнее прочитать тысячные разделители,
   * чем десятичные дроби.
   */
  const compact = raw.replace(/\s+/g, "");

  if (/^\d{1,3}(,\d{3})+$/.test(compact)) {
    const n = Number(compact.replace(/,/g, ""));
    return Number.isFinite(n) ? n : undefined;
  }

  if (/^\d{1,3}(\.\d{3})+$/.test(compact)) {
    const n = Number(compact.replace(/\./g, ""));
    return Number.isFinite(n) ? n : undefined;
  }

  const normalized = compact.replace(/,/g, ".");
  const n = Number(normalized);

  return Number.isFinite(n) ? n : undefined;
}

function getNum(obj: UnknownRecord, key: string): number | undefined {
  return parseSmartNumber(obj[key]);
}

function getNestedRecord(obj: UnknownRecord, key: string): UnknownRecord | null {
  const v = obj[key];
  return isRecord(v) ? v : null;
}

function toNum(v: unknown) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function idToString(v: unknown): string {
  if (typeof v === "string") return v;
  if (typeof v === "number" && Number.isFinite(v)) return String(v);
  return "";
}

function itemKey(p: UnknownRecord): string {
  return (
    idToString(p.id) ||
    String(getStr(p, "documentId") || "") ||
    String(getStr(p, "slug") || "") ||
    String(getStr(p, "sku") || "")
  );
}

function cleanSlug(v: unknown) {
  const s = norm(String(v ?? ""));

  /**
   * На фронте у нас фильтр коллекции обычно scandi,
   * а в Excel/Strapi может быть scandy.
   */
  if (s === "scandy") return "scandi";

  return s;
}

function isRoomSlug(v: string) {
  return (
    v === "bedrooms" ||
    v === "living" ||
    v === "youth" ||
    v === "hallway" ||
    v === "tables_chairs"
  );
}

function isSceneProduct(p: UnknownRecord) {
  const module = cleanSlug(getStr(p, "module") || "");
  const slug = cleanSlug(getStr(p, "slug") || "");
  const cat = cleanSlug(getStr(p, "cat") || "");
  const collection = cleanSlug(getStr(p, "collection") || "");

  /**
   * Главный признак scene:
   * module=scene или slug начинается с scene-.
   *
   * Дополнительно страхуемся:
   * если slug содержит scene и cat/collection похожи на комнату.
   */
  return (
    module === "scene" ||
    slug.startsWith("scene-") ||
    (slug.includes("scene") && isRoomSlug(cat)) ||
    (slug.includes("scene") && isRoomSlug(collection))
  );
}

function getCollectionSlugSafe(p: UnknownRecord) {
  const scene = isSceneProduct(p);

  const brand = cleanSlug(getStr(p, "brand") || "");
  const collection = cleanSlug(getStr(p, "collection") || "");
  const collectionSlug = cleanSlug(getStr(p, "collectionSlug") || "");
  const brandSlug = cleanSlug(getStr(p, "brandSlug") || "");

  /**
   * ВАЖНО:
   * scene-карточка может иметь collection=bedrooms/living/youth,
   * но настоящая коллекция у неё лежит в brand=amber/scandy/etc.
   */
  if (scene && brand) return brand;

  const direct = collection || brand || collectionSlug || brandSlug;
  if (direct) return direct;

  try {
    return cleanSlug(getCollectionSlug(p as ProductAny));
  } catch {
    return "";
  }
}

function getModuleSlugSafe(p: UnknownRecord) {
  if (isSceneProduct(p)) return "scene";

  const direct =
    getStr(p, "module") ||
    getStr(p, "cat") ||
    getStr(p, "moduleSlug") ||
    getStr(p, "category");

  if (direct) return cleanSlug(direct);

  try {
    return cleanSlug(getModuleSlug(p as ProductAny));
  } catch {
    return "";
  }
}

function getRoomSlugSafe(p: UnknownRecord) {
  const cat = cleanSlug(getStr(p, "cat") || "");
  const collection = cleanSlug(getStr(p, "collection") || "");
  const room = cleanSlug(getStr(p, "room") || "");
  const menu = cleanSlug(getStr(p, "menu") || "");
  const category = cleanSlug(getStr(p, "category") || "");
  const slug = cleanSlug(getStr(p, "slug") || "");

  if (room && ROOM_MENUS_SET.has(room)) return room;
  if (menu && ROOM_MENUS_SET.has(menu)) return menu;

  /**
   * Для scene-карточек комната обычно лежит в cat:
   * cat=bedrooms/living/youth.
   */
  if (cat && ROOM_MENUS_SET.has(cat)) return cat;

  if (collection && ROOM_MENUS_SET.has(collection)) return collection;
  if (category && ROOM_MENUS_SET.has(category)) return category;

  if (slug.includes("bedroom") || slug.includes("spal")) return "bedrooms";
  if (slug.includes("living") || slug.includes("gost")) return "living";
  if (slug.includes("youth") || slug.includes("molod")) return "youth";

  try {
    return cleanSlug(getRoomSlug(p as ProductAny));
  } catch {
    return "";
  }
}

function getRegionPrice(p: UnknownRecord, region: string) {
  const r = String(region || "uz").trim().toLowerCase();

  const raw =
    r === "ru"
      ? getNum(p, "priceRUB") ?? getNum(p, "priceRub") ?? getNum(p, "price_rub")
      : getNum(p, "priceUZS") ??
        getNum(p, "priceUzs") ??
        getNum(p, "price_uzs");

  return toNum(raw);
}

function isActiveProduct(p: UnknownRecord, region: string) {
  const scene = isSceneProduct(p);
  const r = String(region || "uz").trim().toLowerCase();

  /**
   * isActive — общий главный выключатель.
   * Если Excel поставил false, товар/scene скрываем.
   */
  if (p.isActive === false) return false;

  /**
   * Если Strapi вернул publishedAt:null — это draft/unpublished.
   */
  if (Object.prototype.hasOwnProperty.call(p, "publishedAt")) {
    if (p.publishedAt === null) return false;
  }

  /**
   * Россия:
   * обычному товару нужна цена RUB,
   * scene можно показывать без цены.
   */
  if (r === "ru") {
    if (p.isActiveRU !== true) return false;
    if (!scene && getRegionPrice(p, "ru") <= 0) return false;
    return true;
  }

  /**
   * Узбекистан:
   * если явно isActiveUZ=false — скрываем.
   * Обычному товару нужна цена UZS,
   * scene можно показывать без цены.
   */
  if (p.isActiveUZ === false) return false;
  if (!scene && getRegionPrice(p, "uz") <= 0) return false;

  return true;
}

function sortCatalogItems(a: UnknownRecord, b: UnknownRecord) {
  const sa = toNum(a.sortOrder);
  const sb = toNum(b.sortOrder);

  if (sa !== sb) return sa - sb;

  const ta = getStr(a, "title") ?? "";
  const tb = getStr(b, "title") ?? "";

  return ta.localeCompare(tb, "ru");
}

export function useCatalogData({
  sidebarValue,
  qFromUrl,
  sort,
  region,
  priceOf,
  selectedDoors,
  selectedFacades,
  baseItems,
}: {
  sidebarValue: FiltersValue;
  qFromUrl: string;
  sort: SortKey;
  region: string;
  priceOf: (p: ProductAny) => number;
  selectedDoors: string[];
  selectedFacades: string[];
  baseItems: unknown[];
}) {
  const menu = sidebarValue.menu.map(cleanSlug).filter(Boolean);
  const collections = sidebarValue.collections.map(cleanSlug).filter(Boolean);
  const types = sidebarValue.types.map(cleanSlug).filter(Boolean);
  const priceMin = sidebarValue.priceMin;
  const priceMax = sidebarValue.priceMax;

  const activeRoom = menu[0] || "";
  const activeCollection = collections[0] || "";
  const activeModule = types[0] || "";

  const isRoomMode = !!activeRoom && ROOM_MENUS_SET.has(activeRoom);
  const isDoorsFacadeUI = activeModule === "shkafy" || activeModule === "vitrini";

  const facadeItems =
    activeModule === "vitrini" ? VITRINI_FACADE_ITEMS : FACADE_ITEMS;

  const DATA = useMemo<UnknownRecord[]>(
    () => (Array.isArray(baseItems) ? baseItems.filter(isRecord) : []),
    [baseItems],
  );

  const { bedroomsFirst, bedroomsFirstList, collectionRest, sorted } =
    useMemo(() => {
      const needle = (qFromUrl || "").toLowerCase().trim();

      const hasRoom = menu.length > 0;
      const hasCollection = collections.length > 0;
      const hasModule = types.length > 0;

      const isDoorFacadeFilter =
        types.includes("shkafy") || types.includes("vitrini");

      const doorsSet = new Set(selectedDoors);
      const facadeSet = new Set(selectedFacades);

      const safePriceOf = (pAny: unknown) => {
        if (!isRecord(pAny)) return 0;

        const raw =
          region === "uz"
            ? getNum(pAny, "priceUZS") ??
              getNum(pAny, "priceUzs") ??
              getNum(pAny, "price_uzs") ??
              getNum(pAny, "priceUZSBase") ??
              getNum(pAny, "priceUzsBase")
            : getNum(pAny, "priceRUB") ??
              getNum(pAny, "priceRub") ??
              getNum(pAny, "price_rub") ??
              getNum(pAny, "priceRUBBase") ??
              getNum(pAny, "priceRubBase");

        const n1 = toNum(raw);
        if (n1 > 0) return n1;

        const n2 = toNum(priceOf(pAny as ProductAny));
        return n2;
      };

      const minBound = Math.max(0, toNum(priceMin));
      const maxRaw = toNum(priceMax);
      const maxBound = maxRaw > 0 ? maxRaw : Number.POSITIVE_INFINITY;

      const passesTextAndPrice = (p: UnknownRecord) => {
        const price = safePriceOf(p);

        /**
         * Scene-карточку не режем ценовым фильтром,
         * потому что у неё часто цена 0 или "Цена по запросу".
         */
        if (!isSceneProduct(p)) {
          if (price < minBound) return false;
          if (price > maxBound) return false;
        }

        if (needle) {
          const title = getStr(p, "title") ?? "";
          const badge = getStr(p, "badge") ?? "";
          const collectionBadge = getStr(p, "collectionBadge") ?? "";
          const sku = getStr(p, "sku") ?? "";
          const articleShort = getStr(p, "articleShort") ?? "";
          const slug = getStr(p, "slug") ?? "";

          const hay =
            `${title} ${badge} ${collectionBadge} ${sku} ${articleShort} ${slug}`.toLowerCase();

          if (!hay.includes(needle)) return false;
        }

        return true;
      };

      /**
       * Если выбрана комната — сначала пытаемся найти scene именно этой комнаты.
       *
       * ВАЖНО:
       * Строго делим по разделам ТОЛЬКО scene-карточки:
       * bedrooms -> только спальни
       * living -> только гостиные
       * youth -> только молодёжные
       *
       * Обычные товары/модули ниже не режем строго по bedrooms/living,
       * если выбрана коллекция, потому что у них cat может быть krovati,
       * shkafy, tumby, komody и т.д.
       */
      const priorityRoom = hasRoom ? activeRoom : "bedrooms";

      const allScenesForCollection = DATA.filter((p) => {
        if (!isActiveProduct(p, region)) return false;
        if (!isSceneProduct(p)) return false;

        const sceneCollection = getCollectionSlugSafe(p);
        const sceneRoom = getRoomSlugSafe(p);

        if (activeCollection && sceneCollection !== activeCollection) {
          return false;
        }

        /**
         * Только SCENE-карточки строго делим по разделу.
         * Так гостиная BUONGIORNO больше не попадёт в спальни BUONGIORNO.
         */
        if (hasRoom) {
          if (!sceneRoom || !menu.includes(sceneRoom)) return false;
        }

        return passesTextAndPrice(p);
      });

      const exactRoomScenes = allScenesForCollection.filter((p) => {
        const sceneRoom = getRoomSlugSafe(p);

        if (!priorityRoom) return true;

        return sceneRoom === priorityRoom;
      });

      const scenesTop = [...exactRoomScenes].sort(sortCatalogItems);

      const sceneKeys = new Set(scenesTop.map(itemKey));

      /**
       * 2. Потом обычные товары/модули.
       */
      const rest = DATA.filter((p) => {
        if (!isActiveProduct(p, region)) return false;

        const key = itemKey(p);
        if (key && sceneKeys.has(key)) return false;

        /**
         * Scene-карточки не должны попадать в обычную сетку второй раз.
         */
        if (isSceneProduct(p)) return false;

        const room = getRoomSlugSafe(p);
        const col = getCollectionSlugSafe(p);
        const mod = getModuleSlugSafe(p);

        /**
         * ВАЖНО:
         * Обычные товары/модули внутри коллекции НЕ режем строго по
         * bedrooms/living/youth, потому что у них cat может быть:
         * krovati/shkafy/tumby/komody и т.д.
         *
         * Если коллекция НЕ выбрана, тогда фильтр раздела работает как раньше.
         */
        if (!hasCollection && hasRoom) {
          if (room && !menu.includes(room)) return false;
        }

        if (hasCollection) {
          if (!collections.includes(col)) return false;
        }

        if (hasModule) {
          if (!types.includes(mod)) return false;

          if (isDoorFacadeFilter && (mod === "shkafy" || mod === "vitrini")) {
            const attrs = getNestedRecord(p, "attrs");

            if (doorsSet.size) {
              const d = attrs ? idToString(attrs["doors"]) : "";
              if (!doorsSet.has(d)) return false;
            }

            if (facadeSet.size) {
              const f = attrs ? idToString(attrs["facade"]) : "";
              if (!facadeSet.has(f)) return false;
            }
          }
        }

        return passesTextAndPrice(p);
      });

      const restSorted = [...rest];

      switch (sort) {
        case "title_asc":
          restSorted.sort((a, b) => {
            const ta = getStr(a, "title") ?? "";
            const tb = getStr(b, "title") ?? "";
            return ta.localeCompare(tb, "ru");
          });
          break;

        case "price_asc":
          restSorted.sort((a, b) => safePriceOf(a) - safePriceOf(b));
          break;

        case "price_desc":
          restSorted.sort((a, b) => safePriceOf(b) - safePriceOf(a));
          break;

        default:
          restSorted.sort(sortCatalogItems);
          break;
      }

      return {
        bedroomsFirst: scenesTop[0] || null,
        bedroomsFirstList: scenesTop,
        collectionRest: restSorted,
        sorted: [...scenesTop, ...restSorted],
      };
    }, [
      DATA,
      qFromUrl,
      region,
      sort,
      menu,
      collections,
      types,
      priceMin,
      priceMax,
      selectedDoors,
      selectedFacades,
      activeRoom,
      activeCollection,
      priceOf,
    ]);

  return {
    activeRoom,
    activeCollection,
    activeModule,
    isRoomMode,
    isDoorsFacadeUI,
    facadeItems,

    bedroomsFirst,
    bedroomsFirstList,
    collectionRest,
    sorted,
  };
}