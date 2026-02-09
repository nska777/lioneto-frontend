"use client";

import { X, Search, ChevronDown } from "lucide-react";

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

export default function CatalogToolbar({
  q,
  setQ,
  sort,
  setSort,
}: {
  q: string;
  setQ: (v: string) => void;
  sort: "default" | "title_asc" | "price_asc" | "price_desc";
  setSort: (v: "default" | "title_asc" | "price_asc" | "price_desc") => void;
}) {
  return (
    <div
      className={cn(
        "mb-5 rounded-[24px] p-4 md:p-5",
        // “дорогая” подложка без молока: белый + легчайший теплый градиент
        "bg-white",
        "shadow-[0_28px_90px_rgba(0,0,0,0.08)]",
        "ring-1 ring-black/5",
        "relative overflow-hidden",
      )}
    >
      {/* soft highlight */}
      <div
        className="pointer-events-none absolute -top-24 left-1/2 h-48 w-[520px] -translate-x-1/2 rounded-full opacity-[0.55] blur-3xl"
        style={{
          background:
            "radial-gradient(closest-side, rgba(0,0,0,0.06), rgba(0,0,0,0))",
        }}
      />
      {/* inner hairline */}
      <div className="pointer-events-none absolute inset-0 rounded-[24px] ring-1 ring-white/50" />

      <div className="relative grid gap-3 md:grid-cols-[1fr_280px]">
        {/* Search */}
        <div
          className={cn(
            "group relative rounded-[18px] px-4 py-3",
            "bg-white",
            "ring-1 ring-black/7",
            "shadow-[0_18px_55px_rgba(0,0,0,0.07)]",
            "transition",
            "hover:-translate-y-[1px] hover:shadow-[0_24px_70px_rgba(0,0,0,0.09)] hover:ring-black/10",
            "focus-within:-translate-y-[1px] focus-within:shadow-[0_26px_80px_rgba(0,0,0,0.10)] focus-within:ring-black/12",
          )}
        >
          {/* micro inner glow */}
          <div className="pointer-events-none absolute inset-0 rounded-[18px] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]" />

          <div className="flex items-center gap-3">
            <div
              className={cn(
                "grid h-9 w-9 place-items-center rounded-full",
                "bg-black/[0.03] ring-1 ring-black/[0.06]",
                "transition",
                "group-hover:bg-black/[0.04]",
              )}
            >
              <Search className="h-[18px] w-[18px] text-black/55" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="text-[10px] tracking-[0.22em] uppercase text-black/45">
                Поиск
              </div>

              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Витрина, тумба, шкаф…"
                className={cn(
                  "mt-1 w-full bg-transparent",
                  "text-[14px] text-black/85 outline-none",
                  "placeholder:text-black/35",
                )}
              />
            </div>
          </div>

          {!!q.trim() && (
            <button
              type="button"
              onClick={() => setQ("")}
              className={cn(
                "absolute right-3 top-1/2 -translate-y-1/2",
                "grid h-9 w-9 place-items-center rounded-full",
                "bg-white",
                "ring-1 ring-black/10",
                "shadow-[0_16px_45px_rgba(0,0,0,0.10)]",
                "text-black/55 transition",
                "hover:text-black hover:ring-black/18 hover:shadow-[0_22px_60px_rgba(0,0,0,0.12)]",
                "active:scale-[0.98]",
                "cursor-pointer",
              )}
              aria-label="Очистить поиск"
              title="Очистить"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Sort */}
        <div
          className={cn(
            "group relative rounded-[18px] px-4 py-3",
            "bg-white",
            "ring-1 ring-black/7",
            "shadow-[0_18px_55px_rgba(0,0,0,0.07)]",
            "transition",
            "hover:-translate-y-[1px] hover:shadow-[0_24px_70px_rgba(0,0,0,0.09)] hover:ring-black/10",
            "focus-within:-translate-y-[1px] focus-within:shadow-[0_26px_80px_rgba(0,0,0,0.10)] focus-within:ring-black/12",
          )}
        >
          {/* micro inner glow */}
          <div className="pointer-events-none absolute inset-0 rounded-[18px] shadow-[inset_0_1px_0_rgba(255,255,255,0.85)]" />

          <div className="text-[10px] tracking-[0.22em] uppercase text-black/45">
            Сортировка
          </div>

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className={cn(
              "mt-1 w-full appearance-none",
              "bg-transparent pr-11",
              "cursor-pointer",
              "text-[14px] text-black/85",
              "outline-none",
            )}
          >
            <option value="default">По умолчанию</option>
            <option value="title_asc">По алфавиту (A→Я)</option>
            <option value="price_asc">Цена (по возрастанию)</option>
            <option value="price_desc">Цена (по убыванию)</option>
          </select>

          <div
            className={cn(
              "pointer-events-none absolute right-3 top-1/2 -translate-y-1/2",
              "grid h-9 w-9 place-items-center rounded-full",
              "bg-black/[0.03] ring-1 ring-black/[0.06]",
              "transition",
              "group-hover:bg-black/[0.04]",
            )}
          >
            <ChevronDown className="h-[18px] w-[18px] text-black/55" />
          </div>
        </div>
      </div>
    </div>
  );
}
