// app/catalog/ui/useCatalogParams.ts
"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { useRegionLang } from "@/app/context/region-lang";
import { BRANDS, CATALOG_MOCK as MOCK } from "@/app/lib/mock/catalog-products";

import { MODULE_ITEMS, ROOM_ITEMS } from "./catalog-constants";
import {
  parseCSV,
  setCSV,
  normalizeCollectionToken,
  normalizeModuleToken,
  normalizeRoomToken,
} from "./catalog-utils";

import type { FiltersMeta, FiltersValue } from "./FiltersSidebar";

export type SortKey = "default" | "title_asc" | "price_asc" | "price_desc";

type ProductAny = (typeof MOCK)[number] & Record<string, any>;

export function useCatalogParams({
  initialBrand,
  initialCategory,
}: {
  initialBrand: string;
  initialCategory: string;
}) {
  const router = useRouter();
  const sp = useSearchParams();
  const { region } = useRegionLang(); // "uz" | "ru"

  const currencyLabel = region === "uz" ? "сум" : "руб.";

  // ✅ FIX: нормальный парсер чисел (Strapi/CSV часто шлёт "5 590 000" или NBSP)
  const num = (v: any) => {
    const s = String(v ?? "")
      .replace(/\u00A0/g, " ") // NBSP
      .replace(/\u202F/g, " ") // narrow NBSP
      .replace(/\s+/g, "") // убрать пробелы-разделители
      .replace(/,/g, ".") // на всякий
      .trim();

    if (!s) return 0;

    const n = Number(s);
    return Number.isFinite(n) ? n : 0;
  };

  const priceOf = (p: ProductAny) => {
    if (region === "uz") {
      const v = p.price_uzs ?? p.priceUZS ?? p.priceUz ?? p.uzs ?? 0;
      return num(v);
    }
    const v = p.price_rub ?? p.priceRUB ?? p.priceRub ?? p.rub ?? 0;
    return num(v);
  };

  const fmtPrice = (rub: number, uzs: number) =>
    region === "uz"
      ? `${Number(uzs || 0).toLocaleString("en-US")} сум`
      : `${Number(rub || 0).toLocaleString("en-US")} руб.`;

  function pushParams(mutator: (p: URLSearchParams) => void) {
    const params = new URLSearchParams(sp.toString());
    mutator(params);
    const qs = params.toString();
    router.push(qs ? `/catalog?${qs}` : "/catalog", { scroll: false });
  }

  function setSingleParam(key: string, val: string) {
    pushParams((params) => {
      const clean = String(val ?? "").trim();
      if (!clean) params.delete(key);
      else params.set(key, clean);
    });
  }

  function setSingleCSVParam(
    key: "menu" | "collections" | "types",
    val: string,
  ) {
    pushParams((params) => {
      let clean = String(val ?? "").trim();

      if (key === "collections") clean = normalizeCollectionToken(clean);
      if (key === "types") clean = normalizeModuleToken(clean);
      if (key === "menu") clean = normalizeRoomToken(clean);

      if (!clean) params.delete(key);
      else params.set(key, clean);

      // ✅ если ушли с "Шкафы" или "Витрины" — подфильтры сбрасываем
      if (key === "types") {
        const next = String(clean).toLowerCase();
        if (next !== "shkafy" && next !== "vitrini") {
          params.delete("doors");
          params.delete("facade");
        }
      }
    });
  }

  // --------- URL tokens ---------

  const menuFromUrl = useMemo(
    () => parseCSV(sp.get("menu")).map(normalizeRoomToken).filter(Boolean),
    [sp],
  );

  // ✅ heroRoom теперь просто вычисляем (НЕ чистим menu)
  const heroRoom = useMemo(() => {
    if (menuFromUrl.length) return menuFromUrl[0] || "";
    const old = normalizeRoomToken(sp.get("category") || initialCategory || "");
    return old || "";
  }, [menuFromUrl, sp, initialCategory]);

  const selectedMenu = useMemo(() => {
    const n = parseCSV(sp.get("menu")).map(normalizeRoomToken).filter(Boolean);
    if (n.length) return n;

    const old = normalizeRoomToken(sp.get("category") || initialCategory || "");
    return old ? [old] : [];
  }, [sp, initialCategory]);

  const selectedCollections = useMemo(() => {
    const n = parseCSV(sp.get("collections"))
      .map(normalizeCollectionToken)
      .filter(Boolean);
    if (n.length) return n;

    const old = normalizeCollectionToken(sp.get("brand") || initialBrand || "");
    return old ? [old] : [];
  }, [sp, initialBrand]);

  const selectedTypes = useMemo(
    () => parseCSV(sp.get("types")).map(normalizeModuleToken).filter(Boolean),
    [sp],
  );

  const selectedDoors = useMemo(() => parseCSV(sp.get("doors")), [sp]);
  const selectedFacades = useMemo(() => parseCSV(sp.get("facade")), [sp]);

  // --------- price bounds ---------

  const absMin = useMemo(() => {
    if (region === "uz") return 0;

    const prices = MOCK.map((p) => priceOf(p as any)).filter((x) =>
      Number.isFinite(x),
    );

    const nonZero = prices.filter((x) => x > 0);
    const base = nonZero.length ? nonZero : prices;

    return base.length ? Math.min(...base) : 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region]);

  const absMax = useMemo(() => {
    if (region === "uz") return 100_000_000;

    const prices = MOCK.map((p) => priceOf(p as any)).filter((x) =>
      Number.isFinite(x),
    );

    const nonZero = prices.filter((x) => x > 0);
    const base = nonZero.length ? nonZero : prices;

    return base.length ? Math.max(...base) : 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region]);

  const rawMin = sp.get("min");
  const rawMax = sp.get("max");

  const minFromUrl =
    rawMin === null
      ? absMin
      : Number.isFinite(Number(rawMin))
        ? Number(rawMin)
        : absMin;

  let maxFromUrl =
    rawMax === null
      ? absMax
      : Number.isFinite(Number(rawMax))
        ? Number(rawMax)
        : absMax;

  if (maxFromUrl <= 0) maxFromUrl = absMax;

  const safeMin = Math.min(minFromUrl, maxFromUrl);
  const safeMax = Math.max(minFromUrl, maxFromUrl);

  const sidebarValue: FiltersValue = {
    menu: selectedMenu,
    collections: selectedCollections,
    types: selectedTypes,
    priceMin: safeMin,
    priceMax: safeMax,
  };

  // ✅ “Спальни” первыми по label
  const menuItemsSorted = useMemo(() => {
    const raw = ROOM_ITEMS.map((x) => ({ label: x.label, value: x.value }));
    return [...raw].sort((a, b) => {
      const la = String(a.label || "").toLowerCase();
      const lb = String(b.label || "").toLowerCase();
      const aIs = la.includes("спаль");
      const bIs = lb.includes("спаль");
      if (aIs && !bIs) return -1;
      if (!aIs && bIs) return 1;
      return 0;
    });
  }, []);

  const sidebarMeta: FiltersMeta = {
    priceAbsMin: absMin,
    priceAbsMax: absMax,
    menuItems: menuItemsSorted,
    collectionItems: BRANDS.map((x) => ({ label: x.title, value: x.slug })),
    typeItems: MODULE_ITEMS as any,
  };

  function onSidebarChange(next: FiltersValue) {
    pushParams((params) => {
      setCSV(params, "menu", next.menu.map(normalizeRoomToken).filter(Boolean));
      setCSV(
        params,
        "collections",
        next.collections.map(normalizeCollectionToken).filter(Boolean),
      );
      setCSV(
        params,
        "types",
        next.types.map(normalizeModuleToken).filter(Boolean),
      );

      const hasDoorFacadeCats =
        next.types.includes("shkafy") || next.types.includes("vitrini");
      if (!hasDoorFacadeCats) {
        params.delete("doors");
        params.delete("facade");
      }

      params.set("min", String(next.priceMin));
      params.set("max", String(next.priceMax));
    });
  }

  function resetAll() {
    router.push("/catalog", { scroll: false });
  }

  const qFromUrl = (sp.get("q") || "").trim();
  const sort = ((sp.get("sort") || "default") as SortKey) || "default";

  const [q, setQ] = useState(qFromUrl);
  useEffect(() => setQ(qFromUrl), [qFromUrl]);

  useEffect(() => {
    const t = window.setTimeout(() => {
      const clean = q.trim();
      if (clean === qFromUrl) return;

      pushParams((params) => {
        if (!clean) params.delete("q");
        else params.set("q", clean);
      });
    }, 250);

    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  function setSort(next: SortKey) {
    pushParams((params) => {
      if (!next || next === "default") params.delete("sort");
      else params.set("sort", next);
    });
  }

  return {
    sp,
    heroRoom,

    region,
    currencyLabel,
    fmtPrice,
    priceOf,

    pushParams,
    setSingleParam,
    setSingleCSVParam,

    selectedDoors,
    selectedFacades,

    sidebarValue,
    sidebarMeta,

    onSidebarChange,
    resetAll,

    qFromUrl,
    q,
    setQ,
    sort,
    setSort,
  };
}
