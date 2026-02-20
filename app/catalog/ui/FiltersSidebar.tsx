"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";
import { normalizeModuleToken } from "./catalog-utils";

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

export type FiltersValue = {
  menu: string[];
  collections: string[];
  types: string[];
  priceMin: number;
  priceMax: number; // ✅ 0 => Infinity (без верхнего лимита)
};

export type FiltersMeta = {
  priceAbsMin: number;
  priceAbsMax: number;
  menuItems: { label: string; value: string }[];
  collectionItems: { label: string; value: string }[];
  typeItems: { label: string; value: string }[];
};

function Section({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-black/10 pb-4">
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex w-full cursor-pointer items-center justify-between py-3"
      >
        <span className="text-[14px] font-medium text-black/85">{title}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 text-black/55 transition",
            open ? "rotate-180" : "rotate-0",
          )}
        />
      </button>

      {open ? <div className="space-y-2">{children}</div> : null}
    </div>
  );
}

function CheckRow({
  checked,
  label,
  onChange,
}: {
  checked: boolean;
  label: string;
  onChange: () => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 rounded-lg px-2 py-1 text-[13px] text-black/70 transition hover:bg-black/[0.03] hover:text-black">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 accent-black"
      />
      <span className="leading-snug">{label}</span>
    </label>
  );
}

export default function FiltersSidebar({
  value,
  meta,
  onChange,
  onReset,
  currencyLabel,
}: {
  value: FiltersValue;
  meta: FiltersMeta;
  onChange: (next: FiltersValue) => void;
  onReset: () => void;
  currencyLabel: string;
}) {
  // ✅ UI fields (inputs)
  const [minLocal, setMinLocal] = useState(value.priceMin);

  // ⚠️ maxLocal хранит "реальное" значение (0 => Infinity),
  // но в инпуте мы показываем число. Поэтому показываем meta.priceAbsMax когда value.priceMax==0.
  const [maxLocal, setMaxLocal] = useState(
    value.priceMax === 0 ? meta.priceAbsMax : value.priceMax,
  );

  // ✅ drag values (range)
  const [minDrag, setMinDrag] = useState(value.priceMin);
  const [maxDrag, setMaxDrag] = useState(
    value.priceMax === 0 ? meta.priceAbsMax : value.priceMax,
  );

  const tRef = useRef<number | null>(null);

  useEffect(() => {
    // при входящих value синхронизируем UI:
    // если пришло priceMax=0, показываем сверху meta.priceAbsMax (как "без лимита")
    const maxShown = value.priceMax === 0 ? meta.priceAbsMax : value.priceMax;

    setMinLocal(value.priceMin);
    setMaxLocal(maxShown);

    setMinDrag(value.priceMin);
    setMaxDrag(maxShown);
  }, [value.priceMin, value.priceMax, meta.priceAbsMax]);

  const clamp = (n: number, a: number, b: number) =>
    Math.max(a, Math.min(b, n));

  const normalizePair = (minN: number, maxN: number) => {
    const mn = clamp(minN, meta.priceAbsMin, meta.priceAbsMax);
    const mx = clamp(maxN, meta.priceAbsMin, meta.priceAbsMax);
    const fixedMin = Math.min(mn, mx);
    const fixedMax = Math.max(mn, mx);
    return { fixedMin, fixedMax };
  };

  // ✅ key fix: если max == верхняя граница, то считаем это "без ограничения" => priceMax=0
  const toCatalogMax = (fixedMax: number) => {
    // небольшой допуск на случай дробных/дерганий
    const eps = 0.000001;
    return fixedMax >= meta.priceAbsMax - eps ? 0 : fixedMax;
  };

  const applyPriceDebounced = (minN: number, maxN: number) => {
    const { fixedMin, fixedMax } = normalizePair(minN, maxN);

    setMinLocal(fixedMin);
    setMaxLocal(fixedMax);

    if (tRef.current) window.clearTimeout(tRef.current);
    tRef.current = window.setTimeout(() => {
      onChange({
        ...value,
        priceMin: fixedMin,
        priceMax: toCatalogMax(fixedMax),
      });
    }, 90);
  };

  const applyPriceNow = (minN: number, maxN: number) => {
    const { fixedMin, fixedMax } = normalizePair(minN, maxN);
    if (tRef.current) window.clearTimeout(tRef.current);
    tRef.current = null;

    setMinLocal(fixedMin);
    setMaxLocal(fixedMax);

    setMinDrag(fixedMin);
    setMaxDrag(fixedMax);

    onChange({
      ...value,
      priceMin: fixedMin,
      priceMax: toCatalogMax(fixedMax),
    });
  };

  useEffect(() => {
    return () => {
      if (tRef.current) window.clearTimeout(tRef.current);
    };
  }, []);

  const uniq = (arr: string[]) => Array.from(new Set(arr.filter(Boolean)));

  const toggleInArray = (arr: string[], v: string) => {
    const clean = uniq(arr);
    return clean.includes(v) ? clean.filter((x) => x !== v) : [...clean, v];
  };

  const menuSet = useMemo(
    () => new Set(uniq(value.menu)),
    [value.menu.join("|")],
  );
  const collectionsSet = useMemo(
    () => new Set(uniq(value.collections)),
    [value.collections.join("|")],
  );
  const typesSet = useMemo(
    () => new Set(uniq(value.types)),
    [value.types.join("|")],
  );

  const minPct = useMemo(() => {
    const span = meta.priceAbsMax - meta.priceAbsMin || 1;
    return ((minDrag - meta.priceAbsMin) / span) * 100;
  }, [minDrag, meta.priceAbsMin, meta.priceAbsMax]);

  const maxPct = useMemo(() => {
    const span = meta.priceAbsMax - meta.priceAbsMin || 1;
    return ((maxDrag - meta.priceAbsMin) / span) * 100;
  }, [maxDrag, meta.priceAbsMin, meta.priceAbsMax]);

  return (
    <aside className="h-fit rounded-2xl border border-white/70 bg-#f3f3f3 p-4 shadow-[0_18px_40px_-30px_rgba(0,0,0,0.35)]">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[12px] tracking-[0.18em] uppercase text-black/45">
          Фильтры
        </div>

        <button
          onClick={() => {
            if (tRef.current) window.clearTimeout(tRef.current);
            tRef.current = null;
            onReset();
          }}
          className="cursor-pointer rounded-full border border-black/10 bg-white px-3 py-1.5 text-[11px] tracking-[0.14em] uppercase text-black/65 hover:border-black/20 hover:text-black"
        >
          Сбросить
        </button>
      </div>

      <Section title="Разделы" defaultOpen>
        {meta.menuItems.map((it) => (
          <CheckRow
            key={it.value}
            checked={menuSet.has(it.value)}
            label={it.label}
            onChange={() =>
              onChange({
                ...value,
                menu: toggleInArray(value.menu, it.value),
              })
            }
          />
        ))}
      </Section>

      <Section title="Цена" defaultOpen>
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-black/10 bg-white px-3 py-2">
            <div className="text-[10px] tracking-[0.16em] uppercase text-black/45">
              Мин
            </div>
            <input
              value={minLocal}
              onChange={(e) => setMinLocal(Number(e.target.value || 0))}
              onBlur={() => applyPriceNow(minLocal, maxLocal)}
              className="mt-1 w-full bg-transparent text-[13px] text-black/80 outline-none"
              inputMode="numeric"
            />
          </div>

          <div className="rounded-xl border border-black/10 bg-white px-3 py-2">
            <div className="text-[10px] tracking-[0.16em] uppercase text-black/45">
              Макс
            </div>
            <input
              value={maxLocal}
              onChange={(e) => setMaxLocal(Number(e.target.value || 0))}
              onBlur={() => applyPriceNow(minLocal, maxLocal)}
              className="mt-1 w-full bg-transparent text-[13px] text-black/80 outline-none"
              inputMode="numeric"
            />
          </div>
        </div>

        <div className="mt-3">
          <div className="relative h-10">
            <div className="pointer-events-none absolute left-0 right-0 top-1/2 -translate-y-1/2">
              <div className="h-[6px] rounded-full bg-black/10" />
              <div
                className="absolute top-0 h-[6px] rounded-full bg-black/85"
                style={{
                  left: `${minPct}%`,
                  width: `${Math.max(0, maxPct - minPct)}%`,
                }}
              />
            </div>

            <input
              type="range"
              min={meta.priceAbsMin}
              max={meta.priceAbsMax}
              value={minDrag}
              onInput={(e) => {
                const v = Number((e.target as HTMLInputElement).value);
                const { fixedMin, fixedMax } = normalizePair(v, maxDrag);
                setMinDrag(fixedMin);
                setMaxDrag(fixedMax);
                applyPriceDebounced(fixedMin, fixedMax);
              }}
              onChange={() => {}}
              onPointerUp={() => applyPriceNow(minDrag, maxDrag)}
              onKeyUp={() => applyPriceNow(minDrag, maxDrag)}
              className={cn(
                "absolute inset-0 w-full cursor-pointer bg-transparent",
                "appearance-none",
                "[&::-webkit-slider-thumb]:appearance-none",
                "[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4",
                "[&::-webkit-slider-thumb]:rounded-full",
                "[&::-webkit-slider-thumb]:bg-black",
                "[&::-webkit-slider-thumb]:shadow-[0_10px_25px_rgba(0,0,0,0.20)]",
                "[&::-webkit-slider-thumb]:ring-2 [&::-webkit-slider-thumb]:ring-white",
                "[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4",
                "[&::-moz-range-thumb]:rounded-full",
                "[&::-moz-range-thumb]:border-0",
                "[&::-moz-range-thumb]:bg-black",
                "[&::-moz-range-thumb]:box-shadow-[0_10px_25px_rgba(0,0,0,0.20)]",
                "[&::-webkit-slider-runnable-track]:bg-transparent",
                "[&::-moz-range-track]:bg-transparent",
              )}
            />

            <input
              type="range"
              min={meta.priceAbsMin}
              max={meta.priceAbsMax}
              value={maxDrag}
              onInput={(e) => {
                const v = Number((e.target as HTMLInputElement).value);
                const { fixedMin, fixedMax } = normalizePair(minDrag, v);
                setMinDrag(fixedMin);
                setMaxDrag(fixedMax);
                applyPriceDebounced(fixedMin, fixedMax);
              }}
              onChange={() => {}}
              onPointerUp={() => applyPriceNow(minDrag, maxDrag)}
              onKeyUp={() => applyPriceNow(minDrag, maxDrag)}
              className={cn(
                "absolute inset-0 w-full cursor-pointer bg-transparent",
                "appearance-none",
                "[&::-webkit-slider-thumb]:appearance-none",
                "[&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4",
                "[&::-webkit-slider-thumb]:rounded-full",
                "[&::-webkit-slider-thumb]:bg-black",
                "[&::-webkit-slider-thumb]:shadow-[0_10px_25px_rgba(0,0,0,0.20)]",
                "[&::-webkit-slider-thumb]:ring-2 [&::-webkit-slider-thumb]:ring-white",
                "[&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:w-4",
                "[&::-moz-range-thumb]:rounded-full",
                "[&::-moz-range-thumb]:border-0",
                "[&::-moz-range-thumb]:bg-black",
                "[&::-moz-range-thumb]:box-shadow-[0_10px_25px_rgba(0,0,0,0.20)]",
                "[&::-webkit-slider-runnable-track]:bg-transparent",
                "[&::-moz-range-track]:bg-transparent",
              )}
            />
          </div>

          <div className="mt-1 flex items-center justify-between text-[12px] text-black/55">
            <span>
              {minDrag.toLocaleString("en-US")} {currencyLabel}
            </span>
            <span>
              {maxDrag.toLocaleString("en-US")} {currencyLabel}
            </span>
          </div>
        </div>
      </Section>

      <Section title="Коллекции" defaultOpen>
        {meta.collectionItems.map((it) => (
          <CheckRow
            key={it.value}
            checked={collectionsSet.has(it.value)}
            label={it.label}
            onChange={() =>
              onChange({
                ...value,
                collections: toggleInArray(value.collections, it.value),
              })
            }
          />
        ))}
      </Section>

      <Section title="Модули" defaultOpen>
        {meta.typeItems.map((it) => {
          const token = normalizeModuleToken(it.value);
          return (
            <CheckRow
              key={String(it.value)}
              checked={typesSet.has(token)}
              label={it.label}
              onChange={() =>
                onChange({
                  ...value,
                  types: toggleInArray(value.types, token),
                })
              }
            />
          );
        })}
      </Section>

      <div className="mt-4 rounded-xl border border-black/10 bg-black/[0.02] p-3 text-[12px] text-black/60">
        Эти фильтры перенесём на Strapi, сохранив те же query-параметры.
      </div>
    </aside>
  );
}
