"use client";

import React, { useEffect, useMemo, useState } from "react";

import CatalogCard from "@/app/catalog/ui/CatalogCard";
import { useRegionLang } from "@/app/context/region-lang";
import { getModuleSlug, norm } from "@/app/catalog/ui/catalog-utils";

/* ================= Helpers: stable shuffle per session ================= */

function hashString(input: string) {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function seededShuffle<T>(arr: T[], seed: number) {
  const a = arr.slice();
  const rnd = mulberry32(seed);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/* ================= Safe module resolver (НЕ ПАДАЕТ) ================= */

function safeGetModuleToken(p: any) {
  if (!p) return "";
  // 1) пробуем твой каноничный helper (но безопасно)
  try {
    const m = getModuleSlug(p as any);
    if (m) return norm(String(m));
  } catch {
    // ignore
  }

  // 2) fallback по полям
  const raw =
    p?.module ??
    p?.cat ??
    p?.type ??
    p?.item_type ??
    p?.kind ??
    p?.itemType ??
    "";
  return norm(String(raw || ""));
}

function toNum(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

/* ================= Component ================= */

export default function ProductRelated({
  title,
  items,
  currency,
}: {
  title: string;
  items: Array<{
    id: string; // может быть slug
    title: string;
    image: string;
    price_rub: number;
    price_uzs: number;
    href?: string;
    badge?: string;
    sku?: string;

    // optional
    slug?: string;
    productId?: string;

    // optional module fields (если прокидываешь)
    module?: string;
    cat?: string;
    type?: string;
  }>;
  currency: "RUB" | "UZS";
}) {
  const rl = useRegionLang() as any;
  const region: "ru" | "uz" = rl?.region === "ru" ? "ru" : "uz";

  // ✅ fmtPrice как в каталоге — CatalogCard его ждёт
  const fmtPrice = (rub: number, uzs: number) => {
    const v = currency === "RUB" ? rub || uzs : uzs || rub;
    if (!v) return region === "ru" ? "Цена по запросу" : "Цена по запросу";
    try {
      const locale = "ru-RU";
      const s = new Intl.NumberFormat(locale).format(Number(v));
      return currency === "RUB" ? `${s} ₽` : `${s} сум`;
    } catch {
      return String(v);
    }
  };

  // ✅ стабильный рандом внутри сессии (как у тебя)
  const [seed, setSeed] = useState(0);

  useEffect(() => {
    const ids = (items || []).map((x) => String(x?.id ?? "")).join("|");
    const key = `lioneto_related_seed::${hashString(
      `${title}::${currency}::${ids}`,
    )}`;
    try {
      const stored = sessionStorage.getItem(key);
      if (stored) setSeed(Number(stored) || 1);
      else {
        const s = Math.floor(Math.random() * 1_000_000_000) + 1;
        sessionStorage.setItem(key, String(s));
        setSeed(s);
      }
    } catch {
      setSeed(hashString(`${title}::${currency}::${ids}`) || 1);
    }
  }, [title, currency, items]);

  /**
   * ✅ ВАЖНО:
   * Твой items должен быть "весь каталог" (или большой список), иначе нечего выбирать.
   * Но даже если он маленький — блок не пропадёт, просто покажем random из того что есть.
   */
  const picked = useMemo(() => {
    const src = Array.isArray(items) ? items.filter(Boolean) : [];
    if (!src.length) return [];

    // current обычно передаётся отдельно, но у тебя сейчас нет.
    // Поэтому: если в items есть "текущий" — мы его НЕ знаем.
    // Значит просто делаем подборку по модулю если у элементов есть module/cat,
    // иначе общий random.
    //
    // Если ты хочешь 100% исключать текущий товар — надо чтобы ты передавал currentId,
    // но ты просил не усложнять — поэтому сейчас НЕ трогаю вызовы.

    // 1) определим самый "частый" module token среди src? нет.
    // правильнее: если items уже приходят от ProductPage как "по модулю" — ок.
    // но ты хочешь "по модулю" именно текущего товара.
    //
    // Чтобы не ломать вызовы, делаем так:
    // - если src[0] и дальше содержат module/cat — берём их как candidates (они уже подобраны)
    // - если нет — просто random.
    //
    // (Если ты мне скинешь место, где вызываешь ProductRelated, я добавлю current и будет идеально.)

    // 🔥 Но минимум: если у src есть module/cat, то группируем по module token текущей страницы:
    const pageModule =
      typeof window !== "undefined"
        ? norm(
            // пытаемся вытащить из URL /product/<slug> => slug часто содержит module? не факт
            "",
          )
        : "";

    // Если pageModule пустой — просто random
    let candidates = src;

    // Если у элементов есть module/cat и мы можем вычислить token у них — то сделаем “модульный” пул:
    // (это уже даст рандом "по модулям", не по коллекции)
    const anyHasModule = src.some((x) => safeGetModuleToken(x));
    if (anyHasModule) {
      // если pageModule неизвестен — берём самый частый token в src как "опорный"
      let token = pageModule;

      if (!token) {
        const freq = new Map<string, number>();
        for (const x of src) {
          const t = safeGetModuleToken(x);
          if (!t) continue;
          freq.set(t, (freq.get(t) || 0) + 1);
        }
        // самый частый
        token =
          Array.from(freq.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || "";
      }

      if (token) {
        const byToken = src.filter((x) => safeGetModuleToken(x) === token);
        // если нашли мало — не “убиваем” блок, а расширяем общим списком
        candidates = byToken.length >= 4 ? byToken : src;
      }
    }

    const ordered = seed ? seededShuffle(candidates, seed) : candidates;
    return ordered.slice(0, 4);
  }, [items, seed]);

  // ✅ Блок НЕ скрываем “просто так”.
  // Если items пустой — тогда null.
  if (!picked.length) return null;

  // ✅ Приводим к формату, который ожидает CatalogCard (минимально нужные поля)
  const mappedForCatalog = picked.map((p) => {
    const pid = String(p.productId ?? p.slug ?? p.id ?? "").trim();

    return {
      id: pid || String(p.id ?? ""),
      productId: pid || String(p.id ?? ""),
      slug: p.slug ?? pid,

      title: String(p.title ?? "").trim(),
      image: String(p.image ?? "").trim(),

      // цены под CatalogCard
      priceRUB: toNum(p.price_rub),
      priceUZS: toNum(p.price_uzs),

      badge: p.badge ? String(p.badge) : undefined,

      // чтобы CatalogCard строил /product/...
      href: p.href ? String(p.href) : undefined,

      // для совместимости
      sku: p.sku ? String(p.sku) : undefined,
    };
  });

  return (
    <section className="mt-12">
      <h2 className="text-[20px] font-semibold text-black">{title}</h2>

      {/* ✅ ВИЗУАЛ 1-в-1 как каталог: просто CatalogCard */}
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 items-stretch [grid-auto-rows:1fr]">
        {mappedForCatalog.map((p, idx) => {
          const key = `rel__${String(p.id)}__${idx}`;
          return (
            <CatalogCard key={key} p={p as any} idx={idx} fmtPrice={fmtPrice} />
          );
        })}
      </div>
    </section>
  );
}
