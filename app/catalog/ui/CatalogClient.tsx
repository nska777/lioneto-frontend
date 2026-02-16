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

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

function joinUrl(base: string, path: string) {
  const b = String(base || "").replace(/\/+$/, "");
  const p = String(path || "").trim();
  if (!p) return b;
  if (/^https?:\/\//i.test(p)) return p;
  return `${b}${p.startsWith("/") ? "" : "/"}${p}`;
}

function normKey(v: unknown) {
  return String(v ?? "")
    .trim()
    .toLowerCase();
}

function pickStrapiItem(item: any) {
  const src = item?.attributes ?? item ?? {};
  const id = src?.id ?? item?.id ?? src?.documentId ?? undefined;

  const mediaUrl =
    src?.media?.url ??
    src?.media?.data?.attributes?.url ??
    src?.media?.data?.url ??
    "";

  const galleryData = src?.gallery?.data ?? src?.gallery ?? [];
  const galleryArr = Array.isArray(galleryData) ? galleryData : [];

  const gallery = galleryArr
    .map((g: any) => g?.attributes?.url ?? g?.url ?? "")
    .filter(Boolean);

  const col = String(src?.collection ?? src?.brand ?? "")
    .trim()
    .toLowerCase();
  const mod = String(src?.module ?? src?.cat ?? "")
    .trim()
    .toLowerCase();

  const openKey = String(src?.slug ?? src?.productId ?? id ?? "")
    .trim()
    .toLowerCase();

  const catalogHref = `/catalog?${[
    col ? `collections=${encodeURIComponent(col)}` : "",
    mod ? `types=${encodeURIComponent(mod)}` : "",
    openKey ? `open=${encodeURIComponent(openKey)}` : "",
  ]
    .filter(Boolean)
    .join("&")}`;

  return {
    id,
    productId: src?.productId ?? src?.slug ?? id,
    slug: src?.slug ?? undefined,

    title: src?.title ?? "",
    brand: src?.brand ?? undefined,
    cat: src?.cat ?? undefined,
    collection: src?.collection ?? undefined,
    module: src?.module ?? undefined,

    badge: src?.collectionBadge ?? src?.badge ?? undefined,
    collectionBadge: src?.collectionBadge ?? undefined,

    isActive: src?.isActive ?? true,
    sortOrder: src?.sortOrder ?? undefined,

    priceUZS: src?.priceUZS ?? 0,
    priceRUB: src?.priceRUB ?? 0,
    oldPriceUZS: src?.oldPriceUZS ?? undefined,
    oldPriceRUB: src?.oldPriceRUB ?? undefined,

    image: mediaUrl,
    cardImage: src?.media ?? mediaUrl,
    gallery,

    __source: "strapi",
    __openKey: openKey,
    __catalogHref: catalogHref,
  };
}

function declOfGoods(n: number) {
  const nn = Math.abs(Number(n || 0));
  const n100 = nn % 100;
  const n10 = nn % 10;
  if (n100 >= 11 && n100 <= 14) return "товаров";
  if (n10 === 1) return "товар";
  if (n10 >= 2 && n10 <= 4) return "товара";
  return "товаров";
}

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

  const TEST_MODE = process.env.NEXT_PUBLIC_STRAPI_TEST_MODE === "true";
  const CATALOG_SOURCE = String(
    process.env.NEXT_PUBLIC_CATALOG_SOURCE || "mocks",
  )
    .trim()
    .toLowerCase();

  const STRAPI_URL = String(process.env.NEXT_PUBLIC_STRAPI_URL || "").trim();

  useEffect(() => {
    console.log("CATALOG ENV DEBUG:", {
      CATALOG_SOURCE,
      STRAPI_URL,
      TEST_MODE,
    });
  }, [CATALOG_SOURCE, STRAPI_URL, TEST_MODE]);

  // ==========================
  // ✅ FIX: helpers to prevent duplicated CSV params (types=tumbi,tumbi,...)
  // ==========================
  const uniq = (arr: string[]) =>
    Array.from(
      new Set(
        (arr ?? [])
          .map((s) =>
            String(s ?? "")
              .trim()
              .toLowerCase(),
          )
          .filter(Boolean),
      ),
    );

  const setCSVParam = (
    params: URLSearchParams,
    key: string,
    list: string[],
  ) => {
    const clean = uniq(list);
    if (clean.length === 0) params.delete(key);
    else params.set(key, clean.join(","));
  };

  const setNumParam = (params: URLSearchParams, key: string, n: number) => {
    const v = Number.isFinite(Number(n)) ? String(Number(n)) : "";
    if (!v || v === "0") params.delete(key);
    else params.set(key, v);
  };

  // ✅ FIX: Always pass a deduped value to FiltersSidebar UI
  const sidebarValueSafe = useMemo(() => {
    return {
      ...sidebarValue,
      menu: uniq(sidebarValue.menu),
      collections: uniq(sidebarValue.collections),
      types: uniq(sidebarValue.types),
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    sidebarValue.menu.join(","),
    sidebarValue.collections.join(","),
    sidebarValue.types.join(","),
    sidebarValue.priceMin,
    sidebarValue.priceMax,
  ]);

  // ✅ FIX: Intercept sidebar change and write query via params.set (no append)
  const onSidebarChangeSafe = (next: typeof sidebarValue) => {
    pushParams((params) => {
      setCSVParam(params, "menu", next.menu);
      setCSVParam(params, "collections", next.collections);
      setCSVParam(params, "types", next.types);

      setNumParam(params, "min", next.priceMin);
      setNumParam(params, "max", next.priceMax);
    });

    onSidebarChange({
      ...next,
      menu: uniq(next.menu),
      collections: uniq(next.collections),
      types: uniq(next.types),
    });
  };

  // ==========================
  // ✅ Strapi Products fetch (safe + fallback)
  // ==========================
  const [strapiItems, setStrapiItems] = useState<any[] | null>(null);

  useEffect(() => {
    let alive = true;

    const run = async () => {
      if (CATALOG_SOURCE !== "strapi") {
        if (alive) setStrapiItems(null);
        return;
      }

      if (!STRAPI_URL) {
        if (alive) setStrapiItems([]);
        return;
      }

      try {
        const pageSize = 200;
        let page = 1;
        let total = Infinity;

        const all: any[] = [];

        while (alive && all.length < total) {
          const url = joinUrl(
            STRAPI_URL,
            `/api/products?populate=*&pagination[page]=${page}&pagination[pageSize]=${pageSize}&sort=sortOrder:asc,updatedAt:desc`,
          );

          const res = await fetch(url, { cache: "no-store" });
          if (!res.ok) throw new Error("Strapi products fetch failed");

          const json = await res.json();

          const arr = Array.isArray(json?.data) ? json.data : [];
          const mapped = arr
            .map((it: any) => pickStrapiItem(it))
            .filter(Boolean);
          all.push(...mapped);

          const p = json?.meta?.pagination;
          total = typeof p?.total === "number" ? p.total : all.length;

          if (!arr.length) break;
          page += 1;

          // safety break
          if (page > 50) break;
        }

        if (alive) setStrapiItems(all);
      } catch (e) {
        console.error("Strapi products fetch failed", e);
        if (alive) setStrapiItems([]);
      }
    };

    run();
    return () => {
      alive = false;
    };
  }, [CATALOG_SOURCE, STRAPI_URL]);

  // ✅ базовый список товаров (для useCatalogData)
  const baseItems = useMemo(() => {
    if (CATALOG_SOURCE !== "strapi") return [];
    if (!Array.isArray(strapiItems)) return [];
    return strapiItems;
  }, [CATALOG_SOURCE, strapiItems]);

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
    baseItems,
  });

  const activeDoor = selectedDoors[0] || "";
  const activeFacade = selectedFacades[0] || "";

  const heroRoomEffective = heroRoom || activeRoom;

  // ✅ price-entries больше не используем вообще
  const applyPrices = useMemo(() => {
    return (p: any) => ({
      ...p,
      __hasProductPage: true,
    });
  }, []);

  const bedroomsFirst2 = bedroomsFirst
    ? applyPrices(bedroomsFirst as any)
    : null;
  const bedroomsFirstList2 = (bedroomsFirstList ?? []).map(applyPrices);
  const collectionRest2 = (collectionRest ?? []).map(applyPrices);
  const sorted2 = (sorted ?? []).map(applyPrices);

  const filterActive = (p: any) => (TEST_MODE ? true : p?.isActive !== false);

  const sorted3 = (sorted2 ?? []).filter(filterActive);
  const bedroomsFirstList3 = (bedroomsFirstList2 ?? []).filter(filterActive);
  const collectionRest3 = (collectionRest2 ?? []).filter(filterActive);

  const bedroomsFirst3 =
    bedroomsFirst2 && !filterActive(bedroomsFirst2 as any)
      ? null
      : bedroomsFirst2;

  const moduleItemsForCollection = useMemo(() => {
    if (!activeCollection) return [];

    const set = new Set<string>();
    for (const p of baseItems as any[]) {
      const col = getCollectionSlug(p);
      if (col && col === activeCollection) {
        const mod = getModuleSlug(p);
        if (mod) set.add(mod);
      }
    }

    const known = Array.from(MODULE_ITEMS).filter((m) =>
      set.has(String(m.value)),
    );
    const knownSet = new Set(known.map((m) => String(m.value)));
    const unknown = Array.from(set)
      .filter((v) => !knownSet.has(v))
      .map((v) => ({ label: v, value: v }));

    return [...known, ...unknown];
  }, [activeCollection, baseItems]);

  const [heroSlides, setHeroSlides] = useState<string[]>([]);

  const roomLabel = useMemo(() => {
    const v = String(heroRoomEffective || "")
      .trim()
      .toLowerCase();
    if (v === "bedrooms") return "Спальни";
    if (v === "living") return "Гостиные";
    if (v === "youth") return "Молодёжные";
    if (v === "tables_chairs") return "Столы и стулья";
    if (v === "hallway") return "Прихожие";
    return "";
  }, [heroRoomEffective]);

  const heroTitle = useMemo(() => {
    if (!activeCollection) return "";
    return String(activeCollection).toUpperCase();
  }, [activeCollection]);

  const heroDescription = useMemo(() => {
    if (!activeCollection) return "";
    const base = String(activeCollection).toUpperCase();
    return `Спальня ${base} — воплощение премиального комфорта и современного стиля. Коллекция AMBER создана для тех, кто ценит баланс эстетики, уюта и функциональности. Чистые линии, благородные оттенки и тщательно продуманные детали формируют атмосферу спокойствия и гармонии, превращая спальню в личное пространство для полноценного отдыха и восстановления.`;
  }, [activeCollection]);

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
    CATALOG_SOURCE,
    strapiItems?.length,
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

  const sortKey = String(sort ?? "").toLowerCase();
  const isPopular = sortKey.includes("popular") || sortKey.includes("pop");
  const isUpdated =
    sortKey.includes("update") ||
    sortKey.includes("new") ||
    sortKey.includes("date");
  const isPrice =
    sortKey.includes("price") ||
    sortKey.includes("cost") ||
    sortKey.includes("sum");
  const isPriceDesc =
    sortKey.includes("desc") ||
    sortKey.includes("down") ||
    sortKey.includes("high");
  const isPriceAsc = isPrice && !isPriceDesc;

  const setPopularSort = () => setSort("popular" as any);
  const setUpdatedSort = () => setSort("updated" as any);
  const togglePriceSort = () => {
    if (isPrice) setSort((isPriceAsc ? "price_desc" : "price_asc") as any);
    else setSort("price_asc" as any);
  };

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-2">
      {!hero ? (
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[24px] font-medium tracking-[-0.02em]">
              Каталог
            </h1>
            <p className="mt-1 text-[13px] text-black/55">
              Товары: {sorted3.length}
            </p>
            {TEST_MODE ? (
              <p className="mt-1 text-[12px] text-black/40">
                TEST_MODE: on • source: {CATALOG_SOURCE}
              </p>
            ) : null}
          </div>

          <button
            onClick={resetAll}
            className="cursor-pointer rounded-full border border-black/10 bg-white px-4 py-2 text-[12px] tracking-[0.16em] uppercase text-black/70 hover:text-black"
          >
            Сбросить
          </button>
        </div>
      ) : null}

      {hero && heroSlides.length ? (
        <div className="mb-4">
          <CatalogHeroSlider slides={heroSlides} />
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
        <div>
          {hero ? (
            <div className="mb-3 pb-3">
              <div className="flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <h1 className="whitespace-nowrap text-[22px] font-semibold tracking-[-0.03em] leading-none">
                      {heroTitle || "Коллекция"}
                    </h1>

                    <span className="shrink-0 whitespace-nowrap inline-flex h-7 items-center rounded-none border border-black/10 bg-#f3f3f3 px-3 text-[11px] font-medium tracking-[0.22em] uppercase text-black/55 leading-none">
                      {sorted3.length} {declOfGoods(sorted3.length)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="catalog-filters-wrap">
            <FiltersSidebar
              value={sidebarValueSafe as any}
              meta={sidebarMeta}
              onChange={onSidebarChangeSafe as any}
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
          </div>
        </div>

        <section>
          {hero ? (
            <div className="mb-4 px-1">
              <div className="text-[14px] leading-relaxed text-black/60">
                {heroDescription}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="text-[11px] font-medium uppercase tracking-[0.22em] text-black/35">
                  Сортировать по:
                </div>

                <div className="flex flex-wrap items-center gap-4">
                  <button
                    type="button"
                    onClick={setPopularSort}
                    className={cn(
                      "cursor-pointer text-[13px] font-medium",
                      isPopular
                        ? "text-black"
                        : "text-black/35 hover:text-black/70",
                    )}
                  >
                    Популярности
                  </button>

                  <button
                    type="button"
                    onClick={togglePriceSort}
                    className={cn(
                      "cursor-pointer text-[13px] font-medium inline-flex items-center gap-1",
                      isPrice
                        ? "text-black"
                        : "text-black/35 hover:text-black/70",
                    )}
                  >
                    Цене
                    {isPrice ? (
                      <span className="text-[14px] leading-none">
                        {isPriceAsc ? "↑" : "↓"}
                      </span>
                    ) : null}
                  </button>

                  <button
                    type="button"
                    onClick={setUpdatedSort}
                    className={cn(
                      "cursor-pointer text-[13px] font-medium",
                      isUpdated
                        ? "text-black"
                        : "text-black/35 hover:text-black/70",
                    )}
                  >
                    Обновлению
                  </button>
                </div>
              </div>
            </div>
          ) : (
            TopBar
          )}

          {!hero ? TopBar : null}

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

          <style jsx global>{`
            .catalog-filters-wrap [class*="rounded-"] {
              border-radius: 12px !important;
            }
            .catalog-filters-wrap [class*="rounded-full"] {
              border-radius: 12px !important;
            }
          `}</style>
        </section>
      </div>
    </main>
  );
}
