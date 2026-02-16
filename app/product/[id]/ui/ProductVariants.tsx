"use client";

import React, { useMemo } from "react";
import { formatPrice } from "@/app/lib/format/price";

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

export type ProductVariant = {
  id: string;
  title: string;
  kind: "color" | "option";
  group?: string;
  disabled?: boolean;

  priceDeltaRUB?: number;
  priceDeltaUZS?: number;

  image?: string;
  gallery?: string[];
};

type GroupInput = {
  group: string;
  items: ProductVariant[];
};

type Props = {
  groups: GroupInput[];
  selectedByGroup: Record<string, string>;
  setSelectedByGroup: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
  currency: "RUB" | "UZS";
};

function labelForGroup(groupKey: string) {
  if (groupKey === "size") return "Размеры кровати";
  if (groupKey === "mechanism") return "Механизм";
  if (groupKey === "color") return "Цвет";
  return "Модификация";
}

function deltaOf(v: ProductVariant, currency: "RUB" | "UZS") {
  return currency === "RUB"
    ? Number(v.priceDeltaRUB ?? 0) || 0
    : Number(v.priceDeltaUZS ?? 0) || 0;
}

function sortGroups(keys: string[]) {
  const order = ["size", "mechanism", "color", "option"];
  return [...keys].sort((a, b) => {
    const ai = order.indexOf(a);
    const bi = order.indexOf(b);
    if (ai === -1 && bi === -1) return a.localeCompare(b, "ru");
    if (ai === -1) return 1;
    if (bi === -1) return -1;
    return ai - bi;
  });
}

function sortSize(a: ProductVariant, b: ProductVariant) {
  const parse = (t: string) => {
    const m = t.replace(/\s/g, "").match(/(\d+)[x×](\d+)/i);
    if (!m) return [0, 0];
    return [Number(m[1] ?? 0), Number(m[2] ?? 0)];
  };
  const [aw, al] = parse(a.title);
  const [bw, bl] = parse(b.title);
  if (aw !== bw) return aw - bw;
  if (al !== bl) return al - bl;
  return String(a.title).localeCompare(String(b.title), "ru");
}

function isLift(v: ProductVariant) {
  const s = `${v.id} ${v.title}`.toLowerCase();
  return (
    s.includes("mechanism-lift") ||
    s.includes("lift") ||
    s.includes("подъём") ||
    s.includes("подъем") ||
    s.includes("с подъ")
  );
}

function isBase(v: ProductVariant) {
  const s = `${v.id} ${v.title}`.toLowerCase();
  return (
    s.includes("mechanism-base") ||
    s.includes("base") ||
    s.includes("без подъ") ||
    s.includes("без подъем") ||
    s.includes("без подъём")
  );
}

function sortMechanism(a: ProductVariant, b: ProductVariant) {
  // disabled всегда вниз
  const ad = a.disabled ? 1 : 0;
  const bd = b.disabled ? 1 : 0;
  if (ad !== bd) return ad - bd;

  // lift — первым (как раньше)
  const al = isLift(a) ? 0 : 1;
  const bl = isLift(b) ? 0 : 1;
  if (al !== bl) return al - bl;

  return String(a.title).localeCompare(String(b.title), "ru");
}

function getColorToken(title: string) {
  const t = (title || "").toLowerCase();

  // частые варианты
  if (t.includes("бел")) return "white";
  if (t.includes("черн")) return "black";
  if (t.includes("сер")) return "gray";
  if (t.includes("граф")) return "graphite";
  if (t.includes("беж")) return "beige";
  if (t.includes("капуч")) return "cappuccino";
  if (t.includes("роз")) return "rose";
  if (t.includes("крем")) return "cream";
  if (t.includes("орех")) return "walnut";
  if (t.includes("дуб")) return "oak";
  if (t.includes("корич")) return "brown";
  if (t.includes("син")) return "blue";
  if (t.includes("зел")) return "green";

  return "neutral";
}

function swatchClass(token: string) {
  // не указываю “ядовитые” цвета — всё мягко и премиально
  switch (token) {
    case "white":
      return "bg-white";
    case "black":
      return "bg-black";
    case "gray":
      return "bg-zinc-300";
    case "graphite":
      return "bg-zinc-700";
    case "beige":
      return "bg-[#E7D8C7]";
    case "cappuccino":
      return "bg-[#CBB39A]";
    case "rose":
      return "bg-[#E7C7D6]";
    case "cream":
      return "bg-[#F1E9DA]";
    case "oak":
      return "bg-[#D2B48C]";
    case "walnut":
      return "bg-[#8B6B4F]";
    case "brown":
      return "bg-[#7A5A44]";
    case "blue":
      return "bg-[#BFD3E6]";
    case "green":
      return "bg-[#C7D6C7]";
    default:
      return "bg-zinc-200";
  }
}

/**
 * ✅ ТЕМА ПИЛЮЛИ ДЛЯ ЦВЕТА (вся пилюля, не только кружок)
 * Белый — белая премиальная пилюля.
 * Капучино — мягкий капучино.
 */
function getColorPillTheme(token: string) {
  switch (token) {
    case "white":
      return {
        base: "bg-white text-black border-black/15 shadow-[0_10px_26px_rgba(0,0,0,0.08)]",
        hover:
          "hover:border-black/25 hover:shadow-[0_14px_32px_rgba(0,0,0,0.10)]",
        active:
          "bg-white text-black border-black/35 shadow-[0_16px_38px_rgba(0,0,0,0.12)]",
        ring: "ring-black/10",
      };
    case "cappuccino":
      return {
        base: "bg-[#F2E7DB] text-[#3C2C22] border-[#E2CBB6] shadow-[0_10px_26px_rgba(0,0,0,0.07)]",
        hover:
          "hover:bg-[#EBDDCE] hover:border-[#D9BEA6] hover:shadow-[0_14px_32px_rgba(0,0,0,0.10)]",
        active:
          "bg-[#D9BFA8] text-[#2D1F17] border-[#CDAE93] shadow-[0_16px_38px_rgba(0,0,0,0.14)]",
        ring: "ring-[#CDAE93]/35",
      };
    default:
      return {
        base: "bg-white/85 text-black/70 border-black/10 shadow-[0_8px_22px_rgba(0,0,0,0.06)]",
        hover: "hover:border-black/15 hover:text-black",
        active:
          "bg-black text-white border-black/15 shadow-[0_14px_34px_rgba(0,0,0,0.22)]",
        ring: "ring-black/10",
      };
  }
}

function DeltaBadge({
  delta,
  active,
  disabled,
  currency,
}: {
  delta: number;
  active: boolean;
  disabled: boolean;
  currency: "RUB" | "UZS";
}) {
  if (!delta) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] leading-none",
        active ? "bg-white/15 text-white/90" : "bg-black/[0.04] text-black/55",
        disabled && "bg-black/[0.04] text-black/25",
      )}
    >
      {delta > 0 ? "+" : ""}
      {formatPrice(delta, currency)}
    </span>
  );
}

function PremiumPillButton({
  title,
  active,
  disabled,
  onClick,
  right,
}: {
  title: string;
  active: boolean;
  disabled: boolean;
  onClick: () => void;
  right?: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      aria-disabled={disabled}
      title={disabled ? "Пока недоступно" : undefined}
      className={cn(
        "group relative inline-flex select-none items-center gap-2 rounded-full px-4 py-2 text-[12px] transition",
        "border backdrop-blur",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20",
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        active
          ? cn(
              "border-black/15 bg-black text-white",
              "shadow-[0_14px_34px_rgba(0,0,0,0.22)]",
            )
          : cn(
              "border-black/10 bg-white/85 text-black/70",
              "shadow-[0_10px_26px_rgba(0,0,0,0.08)]",
              "hover:border-black/15 hover:text-black",
            ),
        disabled &&
          "bg-black/[0.02] text-black/30 shadow-none hover:border-black/10 hover:text-black/30",
      )}
    >
      <span
        className={cn(
          "pointer-events-none absolute inset-0 rounded-full opacity-0 transition",
          active
            ? "opacity-100 [background:radial-gradient(120%_120%_at_50%_0%,rgba(255,255,255,0.20)_0%,rgba(255,255,255,0.00)_60%)]"
            : "group-hover:opacity-100 [background:radial-gradient(120%_120%_at_50%_0%,rgba(0,0,0,0.06)_0%,rgba(0,0,0,0.00)_60%)]",
        )}
      />
      <span
        className={cn(
          "pointer-events-none absolute inset-0 rounded-full opacity-0 transition",
          active
            ? "opacity-100 ring-1 ring-white/10"
            : "group-hover:opacity-100 ring-1 ring-black/[0.04]",
        )}
      />
      <span className="relative leading-none">{title}</span>
      {right ? <span className="relative">{right}</span> : null}
    </button>
  );
}

function MechanismCard({
  title,
  subtitle,
  active,
  disabled,
  delta,
  currency,
  onClick,
}: {
  title: string;
  subtitle: string;
  active: boolean;
  disabled: boolean;
  delta: number;
  currency: "RUB" | "UZS";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-pressed={active}
      aria-disabled={disabled}
      title={disabled ? "Пока недоступно" : undefined}
      className={cn(
        "relative w-full text-left rounded-2xl border p-3.5 transition",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20",
        disabled ? "cursor-not-allowed" : "cursor-pointer",
        active
          ? "border-black/15 bg-black text-white shadow-[0_16px_40px_rgba(0,0,0,0.20)]"
          : "border-black/10 bg-white/85 text-black shadow-[0_10px_30px_rgba(0,0,0,0.06)] hover:border-black/15",
        disabled &&
          "border-black/10 bg-black/[0.02] text-black/35 shadow-none hover:border-black/10",
      )}
    >
      <span
        className={cn(
          "pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition",
          active
            ? "opacity-100 [background:radial-gradient(120%_120%_at_30%_0%,rgba(255,255,255,0.16)_0%,rgba(255,255,255,0.00)_60%)]"
            : "hover:opacity-100 [background:radial-gradient(120%_120%_at_30%_0%,rgba(0,0,0,0.06)_0%,rgba(0,0,0,0.00)_60%)]",
        )}
      />

      <div className="relative flex items-start justify-between gap-3">
        <div>
          <div className="text-[12px] font-medium leading-[16px]">{title}</div>
          <div
            className={cn(
              "mt-1 text-[11px] leading-[14px]",
              active ? "text-white/70" : "text-black/45",
              disabled && "text-black/30",
            )}
          >
            {subtitle}
          </div>
        </div>

        {delta !== 0 ? (
          <span
            className={cn(
              "shrink-0 inline-flex items-center rounded-full px-2.5 py-1 text-[10px] leading-none",
              active
                ? "bg-white/15 text-white/90"
                : "bg-black/[0.04] text-black/60",
              disabled && "bg-black/[0.04] text-black/30",
            )}
          >
            {delta > 0 ? "+" : ""}
            {formatPrice(delta, currency)}
          </span>
        ) : null}
      </div>

      <div
        className={cn(
          "relative mt-3 h-[1px] w-full",
          active ? "bg-white/15" : "bg-black/5",
          disabled && "bg-black/5",
        )}
      />

      <div
        className={cn(
          "relative mt-3 flex items-center gap-2 text-[11px]",
          active ? "text-white/80" : "text-black/55",
          disabled && "text-black/35",
        )}
      >
        <span
          className={cn(
            "inline-flex h-5 w-5 items-center justify-center rounded-full border",
            active ? "border-white/20 bg-white/10" : "border-black/10 bg-white",
            disabled && "border-black/10 bg-black/[0.02]",
          )}
        >
          <span
            className={cn(
              "h-2 w-2 rounded-full",
              active ? "bg-white/85" : "bg-black/50",
              disabled && "bg-black/25",
            )}
          />
        </span>
        <span>Премиальный вариант выбора</span>
      </div>
    </button>
  );
}

export default function ProductVariants({
  groups,
  selectedByGroup,
  setSelectedByGroup,
  currency,
}: Props) {
  const normalized = useMemo(() => {
    const arr = Array.isArray(groups) ? groups : [];

    const cleaned = arr
      .filter((g) => g && g.group && Array.isArray(g.items))
      .map((g) => ({
        group: String(g.group),
        items: g.items.filter(Boolean).map((v) => ({
          ...v,
          id: String(v.id),
          title: String(v.title ?? ""),
          group: String(v.group ?? g.group ?? "").trim() || String(g.group),
          kind: v.kind === "color" ? "color" : "option",
          disabled: !!(v as any).disabled,
        })),
      }));

    const orderedKeys = sortGroups(cleaned.map((g) => g.group));

    return orderedKeys.map((key) => {
      const g = cleaned.find((x) => x.group === key)!;
      const items = [...g.items];

      if (key === "size") (items as any[]).sort(sortSize as any);
      else if (key === "mechanism") (items as any[]).sort(sortMechanism as any);
      else
        items.sort((a, b) =>
          String(a.title).localeCompare(String(b.title), "ru"),
        );

      return { group: key, items };
    });
  }, [groups]);

  if (!normalized.length) return null;

  const pick = (groupKey: string, v: ProductVariant) => {
    if (v.disabled) return;
    setSelectedByGroup((prev) => ({ ...prev, [groupKey]: v.id }));
  };

  return (
    <div className="mt-5">
      {normalized.map((g) => {
        const label = labelForGroup(g.group);
        const selectedId = selectedByGroup[g.group];

        const isColor = g.group === "color";
        const isMechanism = g.group === "mechanism";

        return (
          <div key={g.group} className="mt-6 first:mt-0">
            <div className="flex items-end justify-between gap-3">
              <div className="text-[11px] tracking-[0.18em] uppercase text-black/45">
                {label}
              </div>

              <div className="text-[11px] text-black/35">
                {isColor ? "выберите оттенок" : null}
              </div>
            </div>

            {isMechanism ? (
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {g.items.map((v) => {
                  const active = v.id === selectedId;
                  const disabled = !!v.disabled;
                  const d = deltaOf(v as any, currency);

                  const title = isLift(v as any)
                    ? "С подъёмным механизмом"
                    : isBase(v as any)
                      ? "Без подъёмного механизма"
                      : String(v.title);

                  const subtitle = isLift(v as any)
                    ? "Доступ к хранению внутри"
                    : isBase(v as any)
                      ? "Классическое основание"
                      : "";

                  return (
                    <MechanismCard
                      key={v.id}
                      title={title}
                      subtitle={subtitle}
                      active={active}
                      disabled={disabled}
                      delta={d}
                      currency={currency}
                      onClick={() => pick(g.group, v as any)}
                    />
                  );
                })}
              </div>
            ) : null}

            {/* ✅ COLOR: теперь вся пилюля в цвет */}
            {isColor ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {g.items.map((v) => {
                  const active = v.id === selectedId;
                  const disabled = !!v.disabled;

                  const d = deltaOf(v as any, currency);
                  const token = getColorToken(v.title);
                  const theme = getColorPillTheme(token);

                  return (
                    <button
                      key={v.id}
                      type="button"
                      onClick={() => pick(g.group, v as any)}
                      disabled={disabled}
                      aria-pressed={active}
                      aria-disabled={disabled}
                      title={disabled ? "Пока недоступно" : undefined}
                      className={cn(
                        "group relative inline-flex items-center gap-2 rounded-full border px-3 py-2 transition",
                        "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20",
                        disabled ? "cursor-not-allowed" : "cursor-pointer",
                        active ? cn(theme.active) : cn(theme.base, theme.hover),
                        disabled &&
                          "bg-black/[0.02] text-black/35 border-black/10 shadow-none hover:border-black/10",
                      )}
                    >
                      {/* swatch */}
                      <span
                        className={cn(
                          "relative inline-flex h-6 w-6 items-center justify-center rounded-full border",
                          // swatch border — чуть контрастнее на цветных пилюлях
                          active ? "border-black/25" : "border-black/15",
                          disabled && "border-black/10",
                        )}
                      >
                        <span
                          className={cn(
                            "h-[18px] w-[18px] rounded-full",
                            swatchClass(token),
                          )}
                        />
                        <span className="pointer-events-none absolute inset-0 rounded-full [background:radial-gradient(120%_120%_at_30%_0%,rgba(255,255,255,0.65)_0%,rgba(255,255,255,0.00)_55%)]" />
                      </span>

                      <span className="relative text-[12px] leading-none">
                        {v.title}
                      </span>

                      {d !== 0 ? (
                        <span className="relative">
                          <DeltaBadge
                            delta={d}
                            active={active}
                            disabled={disabled}
                            currency={currency}
                          />
                        </span>
                      ) : null}

                      {/* hairline ring */}
                      <span
                        className={cn(
                          "pointer-events-none absolute inset-0 rounded-full opacity-0 transition",
                          active
                            ? cn("opacity-100 ring-1", theme.ring)
                            : "group-hover:opacity-100 ring-1 ring-black/[0.06]",
                        )}
                      />
                    </button>
                  );
                })}
              </div>
            ) : null}

            {!isColor && !isMechanism ? (
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {g.items.map((v) => {
                  const active = v.id === selectedId;
                  const disabled = !!v.disabled;
                  const d = deltaOf(v as any, currency);
                  return (
                    <PremiumPillButton
                      key={v.id}
                      title={v.title}
                      active={active}
                      disabled={disabled}
                      onClick={() => pick(g.group, v as any)}
                      right={
                        d !== 0 ? (
                          <DeltaBadge
                            delta={d}
                            active={active}
                            disabled={disabled}
                            currency={currency}
                          />
                        ) : null
                      }
                    />
                  );
                })}
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
