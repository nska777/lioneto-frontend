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

type ProductAny = (typeof MOCK)[number] & Record<string, any>;

function toNum(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
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
  baseItems: any[];
}) {
  const activeRoom = sidebarValue.menu[0] || "";
  const activeCollection = sidebarValue.collections[0] || "";
  const activeModule = sidebarValue.types[0] || "";

  const isRoomMode = !!activeRoom && ROOM_MENUS_SET.has(norm(activeRoom));
  const isDoorsFacadeUI =
    activeModule === "shkafy" || activeModule === "vitrini";

  const facadeItems =
    activeModule === "vitrini" ? VITRINI_FACADE_ITEMS : FACADE_ITEMS;

  const DATA = useMemo(
    () => (Array.isArray(baseItems) ? baseItems : []),
    [baseItems],
  );

  const { bedroomsFirst, bedroomsFirstList, collectionRest, sorted } = useMemo(() => {
    const needle = (qFromUrl || "").toLowerCase().trim();

    const hasRoom = sidebarValue.menu.length > 0;
    const hasCollection = sidebarValue.collections.length > 0;
    const hasModule = sidebarValue.types.length > 0;

    // ✅ ВАЖНО:
    // - когда выбраны Раздел + Коллекция -> показываем ВСЮ коллекцию (room фильтр игнорируем)
    // - когда выбраны Раздел + Модуль (types) -> показываем ВСЕ товары модуля по каталогу (room фильтр игнорируем)
    const shouldIgnoreRoomFilter = hasRoom && (hasCollection || hasModule);

    // ✅ Двери/фасады должны работать независимо от игнора room
    const isDoorFacadeFilter =
      sidebarValue.types.includes("shkafy") || sidebarValue.types.includes("vitrini");

    const doorsSet = new Set(selectedDoors);
    const facadeSet = new Set(selectedFacades);

    // ✅ SAFE priceOf: сначала Strapi поля, потом fallback на старый priceOf
    const safePriceOf = (pAny: any) => {
      const p = pAny as any;

      const raw =
        region === "uz"
          ? (p?.priceUZS ?? p?.priceUzs ?? p?.price_uzs ?? p?.priceUZSBase ?? p?.priceUzsBase)
          : (p?.priceRUB ?? p?.priceRub ?? p?.price_rub ?? p?.priceRUBBase ?? p?.priceRubBase);

      const n1 = Number(raw);
      if (Number.isFinite(n1) && n1 > 0) return n1;

      // fallback на текущую функцию (моки/старые поля)
      const n2 = Number((priceOf as any)(pAny as any));
      return Number.isFinite(n2) ? n2 : 0;
    };

    // ✅ Нормализуем границы цены:
    // - priceMin < 0 => 0
    // - priceMax <= 0 => Infinity (то есть "без верхнего лимита")
    const minBound = Math.max(0, toNum(sidebarValue.priceMin));
    const maxRaw = toNum(sidebarValue.priceMax);
    const maxBound = maxRaw > 0 ? maxRaw : Number.POSITIVE_INFINITY;

    const baseFiltered = (DATA as any[]).filter((pAny) => {
      const p = pAny as ProductAny;

      const room = getRoomSlug(p);
      const isScene = ROOM_MENUS_SET.has(norm(room)); // сцены: bedrooms/living/youth
      const col = getCollectionSlug(p);

      // ROOM — только если НЕ игнорим room
      if (!shouldIgnoreRoomFilter) {
        if (sidebarValue.menu.length) {
          if (room && !sidebarValue.menu.includes(room)) return false;
        }
      }

      // COLLECTION — всегда
      if (sidebarValue.collections.length) {
        if (!sidebarValue.collections.includes(col)) return false;
      }

      // MODULE — только для НЕ-сцен
      const mod = getModuleSlug(p);
      if (hasModule && !isScene) {
        if (!sidebarValue.types.includes(mod)) return false;

        // doors/facade для шкафов/витрин
        if (isDoorFacadeFilter && (mod === "shkafy" || mod === "vitrini")) {
          if (doorsSet.size) {
            const d = String((p as any).attrs?.doors ?? "");
            if (!doorsSet.has(d)) return false;
          }
          if (facadeSet.size) {
            const f = String((p as any).attrs?.facade ?? "");
            if (!facadeSet.has(f)) return false;
          }
        }
      }

      // PRICE ✅ (теперь корректно для Strapi)
      const price = safePriceOf(pAny);
      if (price < minBound) return false;
      if (price > maxBound) return false;

      // SEARCH
      if (needle) {
        const hay = `${(p as any).title ?? ""} ${(p as any).badge ?? ""}`.toLowerCase();
        if (!hay.includes(needle)) return false;
      }

      return true;
    });

    // ===========================
    // ✅ ВЕРХНИЕ СЦЕНЫ (приоритет)
    // ===========================
    const priorityRoom = hasRoom ? norm(activeRoom) : "bedrooms";

    const pickScenes = (roomSlug: string) =>
      (DATA as any[])
        .map((x) => x as ProductAny)
        .filter((p) => {
          const room = norm(getRoomSlug(p));
          const isScene = ROOM_MENUS_SET.has(room);
          if (!isScene) return false;

          if (room !== roomSlug) return false;

          if (activeCollection) {
            if (getCollectionSlug(p) !== activeCollection) return false;
          }

          // ✅ цена/поиск учитываем, модуль НЕТ
          const price = safePriceOf(p as any);
          if (price < minBound) return false;
          if (price > maxBound) return false;

          if (needle) {
            const hay = `${(p as any).title ?? ""} ${(p as any).badge ?? ""}`.toLowerCase();
            if (!hay.includes(needle)) return false;
          }

          return true;
        });

    let scenesTop = pickScenes(priorityRoom);

    // ✅ Фолбэк на bedrooms ТОЛЬКО если раздел НЕ выбран явно
    if (!hasRoom && !scenesTop.length) {
      scenesTop = pickScenes("bedrooms");
    }

    // ===========================
    // ✅ НИЖНИЙ СПИСОК (БЕЗ СЦЕН)
    // ===========================
    const topIds = new Set(scenesTop.map((p) => String((p as any).id)));

    const rest = baseFiltered.filter((p) => {
      if (topIds.has(String((p as any).id))) return false;

      const room = norm(getRoomSlug(p as any));
      const isScene = ROOM_MENUS_SET.has(room);
      if (isScene) return false;

      return true;
    });

    const restSorted = [...rest];
    switch (sort) {
      case "title_asc":
        restSorted.sort((a, b) =>
          String((a as any).title).localeCompare(String((b as any).title), "ru"),
        );
        break;
      case "price_asc":
        restSorted.sort((a, b) => safePriceOf(a as any) - safePriceOf(b as any));
        break;
      case "price_desc":
        restSorted.sort((a, b) => safePriceOf(b as any) - safePriceOf(a as any));
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
    sidebarValue.menu.join(","),
    sidebarValue.collections.join(","),
    sidebarValue.types.join(","),
    sidebarValue.priceMin,
    sidebarValue.priceMax,
    selectedDoors.join(","),
    selectedFacades.join(","),
    activeRoom,
    activeCollection,
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
