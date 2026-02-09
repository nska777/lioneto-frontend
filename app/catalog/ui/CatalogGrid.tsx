// app/catalog/ui/CatalogGrid.tsx
"use client";

import React from "react";
import CatalogCard from "./CatalogCard";

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

export default function CatalogGrid({
  gridRef,
  items,
  fmtPrice,

  bedroomsFirst,
  bedroomsFirstList,
  collectionRest,
  collectionTitle,
}: {
  gridRef: React.RefObject<HTMLDivElement | null>;
  items: Array<Record<string, any>>;
  fmtPrice: (rub: number, uzs: number) => string;

  bedroomsFirst?: Record<string, any> | null; // оставляем для совместимости
  bedroomsFirstList?: Array<Record<string, any>> | null; // ✅ NEW
  collectionRest?: Array<Record<string, any>>;
  collectionTitle?: string;
}) {
  const topList = (bedroomsFirstList ?? []).filter(Boolean);

  // если list не передали, но передали один элемент — используем его
  if (!topList.length && bedroomsFirst) topList.push(bedroomsFirst);

  const hasSplit = topList.length > 0 && (collectionRest?.length ?? 0) > 0;

  // если split-режим активен — снизу рисуем только rest
  const rest = hasSplit ? (collectionRest ?? []) : items;

  return (
    <div ref={gridRef}>
      {hasSplit ? (
        <div className="mb-6">
          {/* ✅ TOP: все сцены (может быть 1, может 2+) */}
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 items-stretch [grid-auto-rows:1fr]">
            {topList.map((p, idx) => {
              const key = `scene__${String(p.id ?? "")}__${String(
                p.image ?? p.cover ?? "",
              )}__${idx}`;

              return (
                <CatalogCard
                  key={key}
                  p={p as any}
                  idx={idx}
                  fmtPrice={fmtPrice}
                />
              );
            })}
          </div>

          <div className="mt-6 border-t border-black/10" />

          <div className="mt-4 flex items-end justify-between">
            <div className="text-[13px] font-medium tracking-[-0.01em] text-black">
              Модули коллекции
            </div>
            {collectionTitle ? (
              <div className="text-[11px] tracking-[0.18em] uppercase text-black/45">
                {String(collectionTitle).toUpperCase()}
              </div>
            ) : null}
          </div>
        </div>
      ) : null}

      {/* ✅ REST */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 items-stretch [grid-auto-rows:1fr]">
        {rest.map((p, idx) => {
          const key = `${String(p.id ?? "")}__${String(p.image ?? "")}__${String(
            p.title ?? "",
          )}__${idx}`;

          return <CatalogCard key={key} p={p} idx={idx} fmtPrice={fmtPrice} />;
        })}
      </div>
    </div>
  );
}
