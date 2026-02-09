"use client";

import { useEffect, useMemo, useState } from "react";
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

import { applyPrices, type PriceRow } from "./prices-utils";

type ProductAny = (typeof MOCK)[number] & Record<string, any>;

export function useCatalogData({
  sidebarValue,
  qFromUrl,
  sort,
  region,
  priceOf,
  selectedDoors,
  selectedFacades,
}: {
  sidebarValue: FiltersValue;
  qFromUrl: string;
  sort: SortKey;
  region: string;
  priceOf: (p: ProductAny) => number;
  selectedDoors: string[];
  selectedFacades: string[];
}) {
  const activeRoom = sidebarValue.menu[0] || "";
  const activeCollection = sidebarValue.collections[0] || "";
  const activeModule = sidebarValue.types[0] || "";

  const isRoomMode = !!activeRoom && ROOM_MENUS_SET.has(norm(activeRoom));
  const isDoorsFacadeUI = activeModule === "shkafy" || activeModule === "vitrini";

  const facadeItems =
    activeModule === "vitrini" ? VITRINI_FACADE_ITEMS : FACADE_ITEMS;

  // ==========================
  // ✅ PRICES FROM STRAPI (via Next API)
  // ==========================
  const [priceRows, setPriceRows] = useState<PriceRow[] | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const res = await fetch("/api/prices", { cache: "no-store" });
        if (!res.ok) return;

        const json = await res.json();
        const rows = Array.isArray(json?.data) ? (json.data as PriceRow[]) : [];
        if (alive) setPriceRows(rows);
      } catch {
        // молча, fallback на MOCK
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  // ✅ Накрываем цены поверх моков до фильтрации
  const DATA = useMemo(() => {
    if (!priceRows?.length) return MOCK as any[];
    return applyPrices(MOCK as any[], priceRows);
  }, [priceRows]);

  const { bedroomsFirst, bedroomsFirstList, collectionRest, sorted } = useMemo(() => {
    const needle = (qFromUrl || "").toLowerCase().trim();

    const hasRoom = sidebarValue.menu.length > 0;
    const hasCollection = sidebarValue.collections.length > 0;
    const hasModule = sidebarValue.types.length > 0;

    // ✅ когда выбраны Раздел + Коллекция -> показываем ВСЮ коллекцию (room фильтр игнорируем)
    const shouldIgnoreRoomFilter = hasRoom && hasCollection;

    const isDoorFacadeFilter =
      !shouldIgnoreRoomFilter &&
      (sidebarValue.types.includes("shkafy") || sidebarValue.types.includes("vitrini"));

    const doorsSet = new Set(selectedDoors);
    const facadeSet = new Set(selectedFacades);

    const baseFiltered = (DATA as any[]).filter((pAny) => {
      const p = pAny as ProductAny;

      const room = getRoomSlug(p);
      const isScene = ROOM_MENUS_SET.has(norm(room)); // сцены: bedrooms/living/youth
      const col = getCollectionSlug(p);

      // ROOM — только если НЕ режим "раздел+коллекция"
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

        if (isDoorFacadeFilter && (mod === "shkafy" || mod === "vitrini")) {
          if (doorsSet.size) {
            const d = String(p.attrs?.doors ?? "");
            if (!doorsSet.has(d)) return false;
          }
          if (facadeSet.size) {
            const f = String(p.attrs?.facade ?? "");
            if (!facadeSet.has(f)) return false;
          }
        }
      }

      // PRICE
      const price = priceOf(p);
      if (price < sidebarValue.priceMin) return false;
      if (price > sidebarValue.priceMax) return false;

      // SEARCH
      if (needle) {
        const hay = `${p.title ?? ""} ${p.badge ?? ""}`.toLowerCase();
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
          const price = priceOf(p);
          if (price < sidebarValue.priceMin) return false;
          if (price > sidebarValue.priceMax) return false;

          if (needle) {
            const hay = `${p.title ?? ""} ${p.badge ?? ""}`.toLowerCase();
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
    // ✅ НИЖНИЙ СПИСОК МОДУЛЕЙ КОЛЛЕКЦИИ
    // ===========================
    const topIds = new Set(scenesTop.map((p) => String(p.id)));

    const rest = baseFiltered.filter((p) => {
      if (topIds.has(String(p.id))) return false;

      const room = norm(getRoomSlug(p));
      const isScene = ROOM_MENUS_SET.has(room);
      if (isScene) return false;

      return true;
    });

    const restSorted = [...rest];
    switch (sort) {
      case "title_asc":
        restSorted.sort((a, b) =>
          String(a.title).localeCompare(String(b.title), "ru"),
        );
        break;
      case "price_asc":
        restSorted.sort((a, b) => priceOf(a as any) - priceOf(b as any));
        break;
      case "price_desc":
        restSorted.sort((a, b) => priceOf(b as any) - priceOf(a as any));
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
