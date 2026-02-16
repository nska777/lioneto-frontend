// app/catalog/ui/CatalogTopBar.tsx
"use client";

import CatalogToolbar from "./CatalogToolbar";
import type { SortKey } from "./useCatalogParams";

export default function CatalogTopBar({
  // оставляем пропсы для совместимости — ничего не ломаем в CatalogClient
  // но сверху мы их больше не рисуем (раздел/коллекции/модули теперь только слева)

  q,
  setQ,
  sort,
  setSort,
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

  moduleItemsForCollection?: Array<{ label: string; value: string }>;

  onPickRoom: (v: string) => void;
  onPickCollection: (v: string) => void;
  onPickModule: (v: string) => void;

  onPickDoor: (v: string) => void;
  onPickFacade: (v: string) => void;
  onResetDoorFacade: () => void;
}) {
  return <CatalogToolbar q={q} setQ={setQ} sort={sort} setSort={setSort} />;
}
