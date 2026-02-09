// app/catalog/ui/CatalogClient.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import gsap from "gsap";

import FiltersSidebar from "./FiltersSidebar";
import CatalogGrid from "./CatalogGrid";
import CatalogTopBar from "./CatalogTopBar";
import CatalogHeroSlider from "./CatalogHeroSlider";

import { DOOR_ITEMS, MODULE_ITEMS } from "./catalog-constants";
import { norm, getCollectionSlug, getModuleSlug } from "./catalog-utils";
import { useCatalogParams } from "./useCatalogParams";
import { useCatalogData } from "./useCatalogData";

import { HERO_SLIDES_MANIFEST, makeSlidesFromConf } from "./heroSlidesManifest";

import { CATALOG_MOCK } from "@/app/lib/mock/catalog-products";
import { fetchPricesMap, type PriceEntry } from "@/app/lib/prices";

export default function CatalogClient({
  initialBrand,
  initialCategory,
}: {
  initialBrand: string;
  initialCategory: string;
}) {
  const gridRef = useRef<HTMLDivElement | null>(null);
  const sp = useSearchParams();

  const hero = sp.get("hero") === "1";

  const {
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
    heroRoom,
  } = useCatalogParams({ initialBrand, initialCategory });

  const {
    activeRoom,
    activeCollection,
    activeModule,
    isRoomMode,
    isDoorsFacadeUI,
    facadeItems,

    bedroomsFirst,
    bedroomsFirstList,
    collectionRest,
    sorted,
  } = useCatalogData({
    sidebarValue,
    qFromUrl,
    sort,
    region,
    priceOf,
    selectedDoors,
    selectedFacades,
  });

  const activeDoor = selectedDoors[0] || "";
  const activeFacade = selectedFacades[0] || "";

  const heroRoomEffective = heroRoom || activeRoom;

  const [pricesMap, setPricesMap] = useState<Map<string, PriceEntry> | null>(
    null,
  );

  useEffect(() => {
    let alive = true;

    fetchPricesMap()
      .then((m) => alive && setPricesMap(m))
      .catch(() => alive && setPricesMap(new Map()));

    return () => {
      alive = false;
    };
  }, []);

  const applyPrices = useMemo(() => {
    return (p: any) => {
      if (!pricesMap) return p;

      const key = String(p.productId ?? p.id ?? "").trim();
      if (!key) return p;

      const row = pricesMap.get(key);
      if (!row) return p;

      const title = row.title?.trim() ? row.title : p.title;

      const priceUZS = Number(row.priceUZS ?? 0);
      const priceRUB = Number(row.priceRUB ?? 0);

      const oldPriceUZS = Number(row.oldPriceUZS ?? 0) || undefined;
      const oldPriceRUB = Number(row.oldPriceRUB ?? 0) || undefined;

      return {
        ...p,

        title,

        priceUZS,
        priceRUB,
        oldPriceUZS,
        oldPriceRUB,

        hasDiscount: row.hasDiscount ?? p.hasDiscount,
        // ✅ ВАЖНО: кладём в p.badge, чтобы карточка показала “бейдж коллекции”
        badge: row.collectionBadge ?? p.badge,
        isActive: row.isActive ?? p.isActive ?? true,

        cardImage: row.cardImage ?? p.cardImage,
      };
    };
  }, [pricesMap]);

  const bedroomsFirst2 = bedroomsFirst
    ? applyPrices(bedroomsFirst as any)
    : null;
  const bedroomsFirstList2 = (bedroomsFirstList ?? []).map(applyPrices);
  const collectionRest2 = (collectionRest ?? []).map(applyPrices);
  const sorted2 = (sorted ?? []).map(applyPrices);

  // ✅ фильтр isActive
  const sorted3 = (sorted2 ?? []).filter((p: any) => p.isActive !== false);
  const bedroomsFirstList3 = (bedroomsFirstList2 ?? []).filter(
    (p: any) => p.isActive !== false,
  );
  const collectionRest3 = (collectionRest2 ?? []).filter(
    (p: any) => p.isActive !== false,
  );

  const bedroomsFirst3 =
    bedroomsFirst2 && (bedroomsFirst2 as any).isActive === false
      ? null
      : bedroomsFirst2;

  const moduleItemsForCollection = useMemo(() => {
    if (!activeCollection) return [];

    const set = new Set<string>();
    for (const p of CATALOG_MOCK as any[]) {
      const col = getCollectionSlug(p);
      if (col && col === activeCollection) {
        const mod = getModuleSlug(p);
        if (mod) set.add(mod);
      }
    }

    const known = (MODULE_ITEMS as any[]).filter((m) =>
      set.has(String(m.value)),
    );
    const knownSet = new Set(known.map((m) => String(m.value)));
    const unknown = Array.from(set)
      .filter((v) => !knownSet.has(v))
      .map((v) => ({ label: v, value: v }));

    return [...known, ...unknown];
  }, [activeCollection]);

  const [heroSlides, setHeroSlides] = useState<string[]>([]);

  const heroTitle = useMemo(() => {
    if (!heroRoomEffective || !activeCollection) return "";
    const roomLabel =
      heroRoomEffective === "bedrooms"
        ? "Спальня"
        : heroRoomEffective === "living"
          ? "Гостиная"
          : heroRoomEffective === "youth"
            ? "Молодёжная"
            : heroRoomEffective === "tables_chairs"
              ? "Столы и стулья"
              : heroRoomEffective === "hallway"
                ? "Прихожая"
                : "Коллекция";

    return `${roomLabel} «${String(activeCollection).toUpperCase()}»`;
  }, [heroRoomEffective, activeCollection]);

  useEffect(() => {
    if (!hero || !heroRoomEffective || !activeCollection) {
      setHeroSlides([]);
      return;
    }

    const room = String(heroRoomEffective).trim().toLowerCase();
    const col = String(activeCollection).trim().toLowerCase();
    const key = `${room}:${col}`;

    const conf = HERO_SLIDES_MANIFEST?.[key];
    if (!conf) {
      setHeroSlides([]);
      return;
    }

    setHeroSlides(makeSlidesFromConf(conf));
  }, [hero, heroRoomEffective, activeCollection]);

  useEffect(() => {
    if (!gridRef.current) return;
    const cards = gridRef.current.querySelectorAll("[data-card]");
    gsap.killTweensOf(cards);

    cards.forEach((el) => {
      (el as HTMLElement).style.opacity = "1";
      (el as HTMLElement).style.transform = "translate3d(0,0,0)";
      (el as HTMLElement).style.filter = "none";
    });

    gsap.fromTo(
      cards,
      { y: 16, opacity: 0, filter: "blur(10px)" },
      {
        y: 0,
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.7,
        ease: "power3.out",
        stagger: 0.04,
      },
    );
  }, [
    sidebarValue.menu.join(","),
    sidebarValue.collections.join(","),
    sidebarValue.types.join(","),
    sidebarValue.priceMin,
    sidebarValue.priceMax,
    region,
    qFromUrl,
    sort,
    selectedDoors.join(","),
    selectedFacades.join(","),
    pricesMap,
  ]);

  const TopBar = (
    <CatalogTopBar
      activeRoom={activeRoom}
      activeCollection={activeCollection}
      activeModule={activeModule}
      isRoomMode={isRoomMode}
      isDoorsFacadeUI={isDoorsFacadeUI}
      q={q}
      setQ={setQ}
      sort={sort}
      setSort={setSort}
      activeDoor={activeDoor}
      activeFacade={activeFacade}
      doorItems={DOOR_ITEMS as any}
      facadeItems={facadeItems as any}
      moduleItemsForCollection={moduleItemsForCollection as any}
      onPickRoom={(v) =>
        setSingleCSVParam(
          "menu",
          activeRoom === v.trim().toLowerCase() ? "" : v,
        )
      }
      onPickCollection={(v) =>
        setSingleCSVParam(
          "collections",
          activeCollection === v.trim().toLowerCase() ? "" : v,
        )
      }
      onPickModule={(v) => {
        const next =
          activeModule === v.trim().toLowerCase() ? "" : String(v ?? "");

        pushParams((params) => {
          const clean = String(next ?? "")
            .trim()
            .toLowerCase();
          if (!clean) params.delete("types");
          else params.set("types", clean);

          const m = norm(clean);
          if (m !== "shkafy" && m !== "vitrini") {
            params.delete("doors");
            params.delete("facade");
          }
        });
      }}
      onPickDoor={(v) => setSingleParam("doors", activeDoor === v ? "" : v)}
      onPickFacade={(v) =>
        setSingleParam("facade", activeFacade === v ? "" : v)
      }
      onResetDoorFacade={() =>
        pushParams((params) => {
          params.delete("doors");
          params.delete("facade");
        })
      }
    />
  );

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-10">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-[24px] font-medium tracking-[-0.02em]">
            Каталог
          </h1>
          <p className="mt-1 text-[13px] text-black/55">
            Товары: {sorted3.length}
          </p>
        </div>

        <button
          onClick={resetAll}
          className="cursor-pointer rounded-full border border-black/10 bg-white px-4 py-2 text-[12px] tracking-[0.16em] uppercase text-black/70 hover:text-black"
        >
          Сбросить
        </button>
      </div>

      {hero && heroSlides.length ? (
        <div className="mb-6">
          <CatalogHeroSlider
            slides={heroSlides}
            subtitle="Коллекция"
            title={heroTitle}
            height={420}
          />
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <FiltersSidebar
          value={sidebarValue}
          meta={sidebarMeta}
          onChange={onSidebarChange}
          onReset={() =>
            pushParams((params) => {
              params.delete("menu");
              params.delete("collections");
              params.delete("types");
              params.delete("min");
              params.delete("max");
              params.delete("doors");
              params.delete("facade");
            })
          }
          currencyLabel={currencyLabel}
        />

        <section>
          {TopBar}

          <CatalogGrid
            gridRef={gridRef}
            items={sorted3 as any}
            fmtPrice={fmtPrice}
            bedroomsFirst={bedroomsFirst3 as any}
            bedroomsFirstList={bedroomsFirstList3 as any}
            collectionRest={collectionRest3 as any}
            collectionTitle={activeCollection}
          />

          {sorted3.length === 0 ? (
            <div className="mt-8 rounded-2xl border border-black/10 bg-[#F7F5F2] p-8 text-center text-black/60">
              Ничего не найдено. Попробуй изменить поиск или снять часть
              фильтров.
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
