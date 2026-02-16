"use client";

import { X, Search } from "lucide-react";

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

type SortKey = "default" | "title_asc" | "price_asc" | "price_desc";

export default function CatalogToolbar({
  q,
  setQ,
  sort,
  setSort,
}: {
  q: string;
  setQ: (v: string) => void;
  sort: SortKey;
  setSort: (v: SortKey) => void;
}) {
  // ✅ “Цене” делаем переключателем (asc/desc)
  const isPrice = sort === "price_asc" || sort === "price_desc";
  const priceLabel = sort === "price_desc" ? "Цене ↓" : "Цене ↑";

  const gold = "#C9A24A"; // премиальный “золотой” (как у тебя в UI)

  const SortLink = ({
    active,
    children,
    onClick,
  }: {
    active: boolean;
    children: React.ReactNode;
    onClick: () => void;
  }) => (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "cursor-pointer select-none",
        "text-[12px] md:text-[13px]",
        "transition-colors",
        active ? "text-black" : "text-black/55 hover:text-black",
      )}
      style={
        active
          ? {
              textDecorationThickness: "1px",
              textUnderlineOffset: "5px",
              textDecorationLine: "underline",
              textDecorationColor: gold,
            }
          : undefined
      }
    >
      {children}
    </button>
  );

  return (
    <div
      className={cn(
        "mb-5 rounded-[24px] p-4 md:p-5",
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
      <div className="pointer-events-none absolute inset-0 rounded-[24px] ring-1 ring-white/50" />

      <div className="relative grid gap-3 md:grid-cols-[1fr_auto] md:items-center">
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

        {/* Sort row like classic */}
        <div
          className={cn(
            "flex items-center justify-between gap-3",
            "rounded-[18px] px-4 py-3",
            "bg-white ring-1 ring-black/7",
            "shadow-[0_18px_55px_rgba(0,0,0,0.07)]",
          )}
        >
          <div className="text-[11px] tracking-[0.12em] uppercase text-black/45 whitespace-nowrap">
            Сортировать по:
          </div>

          <div className="flex items-center gap-4">
            <SortLink
              active={sort === "default"}
              onClick={() => setSort("default")}
            >
              Популярности
            </SortLink>

            <SortLink
              active={isPrice}
              onClick={() =>
                setSort(sort === "price_asc" ? "price_desc" : "price_asc")
              }
            >
              {priceLabel}
            </SortLink>

            {/* ✅ у тебя нет ключа “обновлению” в логике — НЕ ломаем её.
                Делимапим на title_asc чисто ради UI. */}
            <SortLink
              active={sort === "title_asc"}
              onClick={() => setSort("title_asc")}
            >
              Обновлению
            </SortLink>
          </div>
        </div>
      </div>
    </div>
  );
}
