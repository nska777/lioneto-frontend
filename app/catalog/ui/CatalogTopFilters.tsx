"use client";

import { BrandItem } from "@/app/lib/mock/catalog-base";
import {
  normalizeCollectionToken,
  normalizeModuleToken,
  normalizeRoomToken,
} from "./catalog-utils";

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

export default function CatalogTopFilters({
  roomItems,
  brands,
  moduleItems,

  activeRoom,
  activeCollection,
  activeModule,
  onPickRoom,
  onPickCollection,
  onPickModule,

  // doors/facade
  isDoorsFacadeUI,
  doorsTitle,
  facadeTitle,
  doorItems,
  facadeItems,
  activeDoor,
  activeFacade,
  onPickDoor,
  onPickFacade,
  onResetDoorFacade,
}: {
  roomItems: Array<{ label: string; value: string }>;
  brands: BrandItem[];
  moduleItems: Array<{ label: string; value: string }>;

  activeRoom: string;
  activeCollection: string;
  activeModule: string;
  onPickRoom: (v: string) => void;
  onPickCollection: (v: string) => void;
  onPickModule: (v: string) => void;

  isDoorsFacadeUI: boolean;
  doorsTitle: string;
  facadeTitle: string;
  doorItems: Array<{ label: string; value: string }>;
  facadeItems: Array<{ label: string; value: string }>;
  activeDoor: string;
  activeFacade: string;
  onPickDoor: (v: string) => void;
  onPickFacade: (v: string) => void;
  onResetDoorFacade: () => void;
}) {
  const doorItemsForUI =
    activeModule === "vitrini"
      ? doorItems.filter((d) => d.value === "1" || d.value === "2")
      : doorItems;

  const activeRoomNorm = normalizeRoomToken(activeRoom);
  const activeCollectionNorm = normalizeCollectionToken(activeCollection);
  const activeModuleNorm = normalizeModuleToken(activeModule);

  return (
    <div className="mb-4 rounded-2xl border border-black/10 bg-[#F7F5F2] p-4 shadow-[0_10px_30px_rgba(0,0,0,0.06)]">
      {/* РАЗДЕЛ */}
      <div className="text-[12px] tracking-[0.18em] uppercase text-black/45">
        Раздел
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {roomItems.map((c) => {
          const active = activeRoomNorm === normalizeRoomToken(c.value);
          return (
            <button
              key={c.value}
              onClick={() => onPickRoom(c.value)}
              className={cn(
                "cursor-pointer rounded-full border px-3 py-1.5 text-[12px] transition",
                active
                  ? "border-black bg-black text-white"
                  : "border-black/10 bg-white text-black/70 hover:text-black",
              )}
            >
              {c.label}
            </button>
          );
        })}
      </div>

      {/* КОЛЛЕКЦИИ */}
      <div className="mt-6 text-[12px] tracking-[0.18em] uppercase text-black/45">
        Коллекции
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {brands.map((b) => {
          const active =
            activeCollectionNorm === normalizeCollectionToken(b.slug);
          return (
            <button
              key={b.slug}
              onClick={() => onPickCollection(b.slug)}
              className={cn(
                "cursor-pointer rounded-full border px-3 py-1.5 text-[12px] transition",
                active
                  ? "border-black bg-black text-white"
                  : "border-black/10 bg-white text-black/70 hover:text-black",
              )}
            >
              {b.title}
            </button>
          );
        })}
      </div>

      {/* МОДУЛИ */}
      <div className="mt-6 text-[12px] tracking-[0.18em] uppercase text-black/45">
        Модули
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {moduleItems.map((m) => {
          // ✅ важно: сравнение через normalizeModuleToken (tumby/tumbi)
          const active = activeModuleNorm === normalizeModuleToken(m.value);

          return (
            <button
              key={m.value}
              onClick={() => onPickModule(m.value)}
              className={cn(
                "cursor-pointer rounded-full border px-3 py-1.5 text-[12px] transition",
                active
                  ? "border-black bg-black text-white"
                  : "border-black/10 bg-white text-black/70 hover:text-black",
              )}
            >
              {m.label}
            </button>
          );
        })}
      </div>

      {/* ДВЕРИ / ФАСАДЫ */}
      {isDoorsFacadeUI ? (
        <div className="mt-6">
          <div className="text-[12px] tracking-[0.18em] uppercase text-black/45">
            {doorsTitle}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {doorItemsForUI.map((d) => {
              const active = activeDoor === d.value;
              return (
                <button
                  key={d.value}
                  onClick={() => onPickDoor(d.value)}
                  className={cn(
                    "cursor-pointer rounded-full border px-3 py-1.5 text-[12px] transition",
                    active
                      ? "border-black bg-black text-white"
                      : "border-black/10 bg-white text-black/70 hover:text-black",
                  )}
                >
                  {d.label}
                </button>
              );
            })}
          </div>

          <div className="mt-6 text-[12px] tracking-[0.18em] uppercase text-black/45">
            {facadeTitle}
          </div>
          <div className="mt-3 flex flex-wrap gap-2">
            {facadeItems.map((f) => {
              const active = activeFacade === f.value;
              return (
                <button
                  key={f.value}
                  onClick={() => onPickFacade(f.value)}
                  className={cn(
                    "cursor-pointer rounded-full border px-3 py-1.5 text-[12px] transition",
                    active
                      ? "border-black bg-black text-white"
                      : "border-black/10 bg-white text-black/70 hover:text-black",
                  )}
                >
                  {f.label}
                </button>
              );
            })}
          </div>

          {activeDoor || activeFacade ? (
            <button
              onClick={onResetDoorFacade}
              className="mt-4 cursor-pointer rounded-full border border-black/10 bg-white px-4 py-2 text-[12px] tracking-[0.16em] uppercase text-black/70 hover:text-black"
            >
              Сбросить подфильтры
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
