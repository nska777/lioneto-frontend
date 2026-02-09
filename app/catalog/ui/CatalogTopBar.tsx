// app/catalog/ui/CatalogTopBar.tsx
"use client";

import CatalogTopFilters from "./CatalogTopFilters";
import CatalogToolbar from "./CatalogToolbar";

import { BRANDS } from "@/app/lib/mock/catalog-products";
import { DOOR_ITEMS, MODULE_ITEMS, ROOM_ITEMS } from "./catalog-constants";
import type { SortKey } from "./useCatalogParams";

export default function CatalogTopBar({
  activeRoom,
  activeCollection,
  activeModule,

  isRoomMode,
  isDoorsFacadeUI,

  q,
  setQ,
  sort,
  setSort,

  activeDoor,
  activeFacade,
  doorItems,
  facadeItems,

  moduleItemsForCollection, // ✅ NEW

  onPickRoom,
  onPickCollection,
  onPickModule,

  onPickDoor,
  onPickFacade,
  onResetDoorFacade,
}: {
  activeRoom: string;
  activeCollection: string;
  activeModule: string;

  isRoomMode: boolean;
  isDoorsFacadeUI: boolean;

  q: string;
  setQ: (v: string) => void;
  sort: SortKey;
  setSort: (v: SortKey) => void;

  activeDoor: string;
  activeFacade: string;
  doorItems: Array<{ label: string; value: string }>;
  facadeItems: Array<{ label: string; value: string }>;

  moduleItemsForCollection: Array<{ label: string; value: string }>; // ✅ NEW

  onPickRoom: (v: string) => void;
  onPickCollection: (v: string) => void;
  onPickModule: (v: string) => void;

  onPickDoor: (v: string) => void;
  onPickFacade: (v: string) => void;
  onResetDoorFacade: () => void;
}) {
  // “Спальни” первыми (если надо)
  const roomItemsSorted = (() => {
    return [...ROOM_ITEMS].sort((a, b) => {
      const la = String((a as any).label || "").toLowerCase();
      const lb = String((b as any).label || "").toLowerCase();
      const aIs = la.includes("спаль");
      const bIs = lb.includes("спаль");
      if (aIs && !bIs) return -1;
      if (!aIs && bIs) return 1;
      return 0;
    });
  })();

  return (
    <>
      <CatalogTopFilters
        roomItems={roomItemsSorted as any}
        brands={BRANDS as any}
        moduleItems={MODULE_ITEMS as any}
        moduleItemsForCollection={moduleItemsForCollection as any} // ✅ NEW
        activeRoom={activeRoom}
        activeCollection={activeCollection}
        activeModule={activeModule}
        onPickRoom={onPickRoom}
        onPickCollection={onPickCollection}
        onPickModule={onPickModule}
        isDoorsFacadeUI={isDoorsFacadeUI}
        doorsTitle={
          activeModule === "vitrini" ? "Витрины · Створки" : "Шкафы · Створки"
        }
        facadeTitle={
          activeModule === "vitrini" ? "Витрины · Вид" : "Шкафы · Фасад"
        }
        doorItems={doorItems?.length ? doorItems : (DOOR_ITEMS as any)}
        facadeItems={facadeItems as any}
        activeDoor={activeDoor}
        activeFacade={activeFacade}
        onPickDoor={onPickDoor}
        onPickFacade={onPickFacade}
        onResetDoorFacade={onResetDoorFacade}
      />

      <CatalogToolbar q={q} setQ={setQ} sort={sort} setSort={setSort} />
    </>
  );
}
