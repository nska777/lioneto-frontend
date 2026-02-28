"use client";

import { useMemo } from "react";
import { CATALOG_MOCK as MOCK } from "@/app/lib/mock/catalog-products";

import {
  ROOM_MENUS_SET,
  FACADE_ITEMS,
  VITRINI_FACADE_ITEMS,
} from "./catalog-constants";
import { norm, getRoomSlug, getCollectionSlug, getModuleSlug } from "./catalog-utils";

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

function getNum(obj: UnknownRecord, key: string): number | undefined {
  const v = obj[key];
  return typeof v === "number" ? v : undefined;
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
  const menu = sidebarValue.menu;
  const collections = sidebarValue.collections;
  const types = sidebarValue.types;
  const priceMin = sidebarValue.priceMin;
  const priceMax = sidebarValue.priceMax;

  const activeRoom = menu[0] || "";
  const activeCollection = collections[0] || "";
  const activeModule = types[0] || "";

  const isRoomMode = !!activeRoom && ROOM_MENUS_SET.has(norm(activeRoom));
  const isDoorsFacadeUI = activeModule === "shkafy" || activeModule === "vitrini";

  const facadeItems =
    activeModule === "vitrini" ? VITRINI_FACADE_ITEMS : FACADE_ITEMS;

  const DATA = useMemo<unknown[]>(
    () => (Array.isArray(baseItems) ? baseItems : []),
    [baseItems]
  );

  const { bedroomsFirst, bedroomsFirstList, collectionRest, sorted } = useMemo(() => {
    const needle = (qFromUrl || "").toLowerCase().trim();

    const hasRoom = menu.length > 0;
    const hasCollection = collections.length > 0;
    const hasModule = types.length > 0;

 
    const shouldIgnoreRoomFilter = hasRoom && (hasCollection || hasModule);


    const isDoorFacadeFilter = types.includes("shkafy") || types.includes("vitrini");

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

    const baseFiltered = DATA.filter((pAny) => {
      if (!isRecord(pAny)) return false;
      const p = pAny as ProductAny;

      const room = getRoomSlug(p);
      const isScene = ROOM_MENUS_SET.has(norm(room)); // сцены: bedrooms/living/youth
      const col = getCollectionSlug(p);

      // ROOM — только если НЕ игнорим room
      if (!shouldIgnoreRoomFilter) {
        if (menu.length) {
          if (room && !menu.includes(room)) return false;
        }
      }

      // COLLECTION — всегда
      if (collections.length) {
        if (!collections.includes(col)) return false;
      }

      // MODULE — только для НЕ-сцен
      const mod = getModuleSlug(p);
      if (hasModule && !isScene) {
        if (!types.includes(mod)) return false;

        // doors/facade для шкафов/витрин
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

      const price = safePriceOf(pAny);
      if (price < minBound) return false;
      if (price > maxBound) return false;

      // SEARCH
      if (needle) {
        const title = getStr(p, "title") ?? "";
        const badge = getStr(p, "badge") ?? "";
        const hay = `${title} ${badge}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }

      return true;
    });


    const priorityRoom = hasRoom ? norm(activeRoom) : "bedrooms";

    const pickScenes = (roomSlug: string) =>
      DATA.filter((x): x is ProductAny => isRecord(x)).filter((p) => {
        const room = norm(getRoomSlug(p));
        const isScene = ROOM_MENUS_SET.has(room);
        if (!isScene) return false;

        if (room !== roomSlug) return false;

        if (activeCollection) {
          if (getCollectionSlug(p) !== activeCollection) return false;
        }


        const price = safePriceOf(p);
        if (price < minBound) return false;
        if (price > maxBound) return false;

        if (needle) {
          const title = getStr(p, "title") ?? "";
          const badge = getStr(p, "badge") ?? "";
          const hay = `${title} ${badge}`.toLowerCase();
          if (!hay.includes(needle)) return false;
        }

        return true;
      });

    let scenesTop = pickScenes(priorityRoom);

  
    if (!hasRoom && !scenesTop.length) {
      scenesTop = pickScenes("bedrooms");
    }

 
    const topIds = new Set(scenesTop.map((p) => idToString(p.id)));

    const rest = baseFiltered.filter((p) => {
      if (!isRecord(p)) return false;

      const pid = idToString(p.id);
      if (topIds.has(pid)) return false;

      const room = norm(getRoomSlug(p as ProductAny));
      const isScene = ROOM_MENUS_SET.has(room);
      if (isScene) return false;

      return true;
    });

    const restSorted = [...rest];

    switch (sort) {
      case "title_asc":
        restSorted.sort((a, b) => {
          const ta = isRecord(a) ? (getStr(a, "title") ?? "") : "";
          const tb = isRecord(b) ? (getStr(b, "title") ?? "") : "";
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
        break;
    }

    const fullSorted = scenesTop.length ? [...scenesTop, ...restSorted] : restSorted;

    return {
      bedroomsFirst: scenesTop[0] || null,
      bedroomsFirstList: scenesTop,
      collectionRest: restSorted,
      sorted: fullSorted,
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