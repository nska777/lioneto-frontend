// app/catalog/ui/CatalogClient.tsx
"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import gsap from "gsap";

import FiltersSidebar from "./FiltersSidebar";
import CatalogGrid from "./CatalogGrid";
import CatalogTopBar from "./CatalogTopBar";
import CatalogHeroSlider from "./CatalogHeroSlider";

import { DOOR_ITEMS, MODULE_ITEMS } from "./catalog-constants";
import { norm } from "./catalog-utils";
import { useCatalogParams } from "./useCatalogParams";
import { useCatalogData } from "./useCatalogData";

import { HERO_SLIDES_MANIFEST, makeSlidesFromConf } from "./heroSlidesManifest";

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

type UnknownRecord = Record<string, unknown>;
type ProductAnyLocal = Record<string, unknown>;

const isRecord = (v: unknown): v is UnknownRecord =>
  typeof v === "object" && v !== null;

const isString = (v: unknown): v is string => typeof v === "string";
const isBoolean = (v: unknown): v is boolean => typeof v === "boolean";

const getUnknown = (v: unknown, key: string): unknown => {
  if (!isRecord(v)) return undefined;
  return v[key];
};

const getRecord = (v: unknown, key: string): UnknownRecord | null => {
  const val = getUnknown(v, key);
  return isRecord(val) ? val : null;
};

const getString = (v: unknown, key: string): string => {
  const val = getUnknown(v, key);
  return isString(val) ? val : "";
};

const getOptionalString = (v: unknown, key: string): string | undefined => {
  const s = getString(v, key).trim();
  return s ? s : undefined;
};

const getBoolean = (v: unknown, key: string, fallback: boolean): boolean => {
  const val = getUnknown(v, key);
  return isBoolean(val) ? val : fallback;
};

const getNumberOr = (v: unknown, key: string, fallback: number): number => {
  const val = getUnknown(v, key);

  if (typeof val === "number" && Number.isFinite(val)) return val;

  if (typeof val === "string") {
    const n = Number(
      val
        .replace(/\u00A0/g, " ")
        .replace(/\u202F/g, " ")
        .replace(/\s+/g, "")
        .replace(/,/g, ".")
        .trim(),
    );

    if (Number.isFinite(n)) return n;
  }

  return fallback;
};

function joinUrl(base: string, path: string) {
  const b = String(base || "").replace(/\/+$/, "");
  const p = String(path || "").trim();

  if (!p) return b;
  if (/^https?:\/\//i.test(p)) return p;

  return `${b}${p.startsWith("/") ? "" : "/"}${p}`;
}

type CatalogStrapiItem = ProductAnyLocal & {
  id: string;
  productId: string;
  slug?: string;

  title: string;
  sku?: string;
  articleShort?: string;

  brand?: string;
  cat?: string;
  collection?: string;
  module?: string;

  badge?: string;
  collectionBadge?: string;

  isActive: boolean;
  isActiveUZ?: boolean;
  isActiveRU?: boolean;
  publishedAt?: string | null;
  sortOrder?: number;

  priceUZS: number;
  priceRUB: number;
  oldPriceUZS?: number;
  oldPriceRUB?: number;

  image: string;
  gallery: string[];

  __source: "strapi";
  __openKey: string;
  __catalogHref: string;
};

function normalizeCollectionForCatalog(v: unknown) {
  const s = String(v ?? "")
    .trim()
    .toLowerCase();

  if (s === "scandy") return "scandi";

  return s;
}

function normalizeModuleForCatalog(v: unknown) {
  const s = String(v ?? "")
    .trim()
    .toLowerCase();

  if (s === "tumbi") return "tumby";
  if (s === "tumba") return "tumby";
  if (s === "shkaf") return "shkafy";
  if (s === "zerkalo") return "zerkala";

  return s;
}

function isCatalogSceneItem(p: Record<string, unknown>) {
  const slug = String(p.slug ?? "")
    .trim()
    .toLowerCase();

  const module = normalizeModuleForCatalog(p.module);

  return slug.startsWith("scene-") || module === "scene";
}

function getCatalogItemCollection(p: Record<string, unknown>) {
  const scene = isCatalogSceneItem(p);

  const collection = normalizeCollectionForCatalog(p.collection);
  const brand = normalizeCollectionForCatalog(p.brand);

  if (scene && brand) return brand;

  return collection || brand;
}

function getCatalogSortOrder(p: Record<string, unknown>) {
  const raw = p.sortOrder;
  const n = typeof raw === "number" ? raw : Number(raw);

  return Number.isFinite(n) ? n : 999999;
}

function getRegionPriceFromCatalogItem(
  p: Record<string, unknown>,
  region: string,
) {
  const regionKey = String(region || "uz")
    .trim()
    .toLowerCase();
  const raw = regionKey === "ru" ? p.priceRUB : p.priceUZS;
  const n = typeof raw === "number" ? raw : Number(raw);

  return Number.isFinite(n) ? n : 0;
}

function isVisibleFromStrapi(p: Record<string, unknown>, region = "uz") {
  const scene = isCatalogSceneItem(p);
  const regionKey = String(region || "uz")
    .trim()
    .toLowerCase();

  /**
   * isActive — главный общий выключатель карточки.
   * Scene пока оставляем с мягкой защитой, чтобы сборные карточки не пропали
   * из-за старых импортов.
   */
  if (!scene && p.isActive === false) return false;

  if (Object.prototype.hasOwnProperty.call(p, "publishedAt")) {
    if (p.publishedAt === null) return false;
  }

  /**
   * RU — строгая логика:
   * показываем только если товар явно включен для России
   * и есть нормальная цена RUB.
   */
  if (regionKey === "ru") {
    if (p.isActiveRU !== true) return false;
    if (!scene && getRegionPriceFromCatalogItem(p, "ru") <= 0) return false;
    return true;
  }

  /**
   * UZ — мягкая логика:
   * если isActiveUZ пустой/старый товар — не скрываем,
   * но если явно false — скрываем.
   */
  if (p.isActiveUZ === false) return false;
  if (!scene && getRegionPriceFromCatalogItem(p, "uz") <= 0) return false;

  return true;
}

function pickStrapiItem(item: unknown): CatalogStrapiItem {
  const itemRec = isRecord(item) ? item : {};
  const src = getRecord(itemRec, "attributes") ?? itemRec;

  const rawId =
    getUnknown(src, "id") ??
    getUnknown(itemRec, "id") ??
    getUnknown(src, "documentId");

  const id = String(rawId ?? "").trim() || getString(src, "slug").trim() || "";

  const media = getRecord(src, "media");
  const mediaUrl =
    (media ? getString(media, "url") : "") ||
    (() => {
      const d = media ? getRecord(media, "data") : null;
      const a = d ? getRecord(d, "attributes") : null;

      return (a ? getString(a, "url") : "") || (d ? getString(d, "url") : "");
    })() ||
    "";

  const galleryDataRaw = getUnknown(src, "gallery");
  const galleryData =
    (isRecord(galleryDataRaw)
      ? getUnknown(galleryDataRaw, "data")
      : undefined) ?? galleryDataRaw;

  const galleryArr = Array.isArray(galleryData) ? galleryData : [];
  const gallery = galleryArr
    .map((g) => {
      if (!isRecord(g)) return "";

      const attrs = getRecord(g, "attributes");

      return (
        (attrs ? getString(attrs, "url") : "") || getString(g, "url") || ""
      );
    })
    .filter(Boolean);

  const slug = getOptionalString(src, "slug");
  const productIdRaw = getUnknown(src, "productId");
  const productId = String(productIdRaw ?? slug ?? id ?? "").trim() || id;

  const collection = getOptionalString(src, "collection");
  const moduleSlug = getOptionalString(src, "module");
  const brand = getOptionalString(src, "brand");
  const cat = getOptionalString(src, "cat");

  const badge =
    getOptionalString(src, "collectionBadge") ??
    getOptionalString(src, "badge");

  const collectionBadge = getOptionalString(src, "collectionBadge");

  const isActive = getBoolean(src, "isActive", true);

  const isActiveUZRaw = getUnknown(src, "isActiveUZ");
  const isActiveRURaw = getUnknown(src, "isActiveRU");

  const isActiveUZ = isBoolean(isActiveUZRaw) ? isActiveUZRaw : undefined;
  const isActiveRU = isBoolean(isActiveRURaw) ? isActiveRURaw : undefined;

  const publishedAtRaw = getUnknown(src, "publishedAt");
  const publishedAt =
    typeof publishedAtRaw === "string" || publishedAtRaw === null
      ? publishedAtRaw
      : undefined;

  const sortOrderRaw = getUnknown(src, "sortOrder");
  const sortOrder =
    typeof sortOrderRaw === "number" && Number.isFinite(sortOrderRaw)
      ? sortOrderRaw
      : undefined;

  const priceUZS = getNumberOr(src, "priceUZS", 0);
  const priceRUB = getNumberOr(src, "priceRUB", 0);

  const oldPriceUZS = getNumberOr(src, "oldPriceUZS", 0) || undefined;
  const oldPriceRUB = getNumberOr(src, "oldPriceRUB", 0) || undefined;

  const openKey = String(slug ?? productId ?? id ?? "")
    .trim()
    .toLowerCase();

  const rawSlug = String(slug ?? "")
    .trim()
    .toLowerCase();

  const scene =
    rawSlug.startsWith("scene-") ||
    String(moduleSlug ?? "")
      .trim()
      .toLowerCase() === "scene";

  const colQ = String(
    scene ? (brand ?? collection ?? "") : (collection ?? brand ?? ""),
  )
    .trim()
    .toLowerCase();

  const modQ = String(scene ? "scene" : (moduleSlug ?? cat ?? ""))
    .trim()
    .toLowerCase();

  const catalogHref = `/catalog?${[
    colQ ? `collections=${encodeURIComponent(colQ)}` : "",
    modQ ? `types=${encodeURIComponent(modQ)}` : "",
    openKey ? `open=${encodeURIComponent(openKey)}` : "",
  ]
    .filter(Boolean)
    .join("&")}`;

  return {
    id,
    productId,
    slug,

    title: getString(src, "title"),
    sku: getOptionalString(src, "sku"),
    articleShort: getOptionalString(src, "articleShort"),

    brand,
    cat,
    collection,
    module: moduleSlug,

    badge,
    collectionBadge,

    isActive,
    isActiveUZ,
    isActiveRU,
    publishedAt,
    sortOrder,

    priceUZS,
    priceRUB,
    oldPriceUZS,
    oldPriceRUB,

    image: mediaUrl,
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

function CatalogLoadingSkeleton({ hero = false }: { hero?: boolean }) {
  return (
    <div className="mt-2">
      {hero ? (
        <div className="mb-5 flex items-start gap-6">
          <div className="h-[22px] w-36 animate-pulse rounded bg-black/10" />
          <div className="h-[22px] w-24 animate-pulse rounded bg-black/10" />
        </div>
      ) : null}

      <div className="mb-5 flex items-center gap-3">
        <div className="h-3 w-28 animate-pulse rounded bg-black/10" />
        <div className="h-3 w-20 animate-pulse rounded bg-black/10" />
        <div className="h-3 w-24 animate-pulse rounded bg-black/10" />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-[18px] border border-black/10 bg-white shadow-sm"
          >
            <div className="h-[210px] animate-pulse bg-gradient-to-b from-black/[0.04] via-black/[0.02] to-black/[0.10]" />

            <div className="space-y-3 p-4">
              <div className="h-4 w-[80%] animate-pulse rounded bg-black/10" />
              <div className="h-3 w-[52%] animate-pulse rounded bg-black/10" />

              <div className="flex items-center gap-1">
                <div className="h-3 w-16 animate-pulse rounded bg-black/10" />
                <div className="h-3 w-10 animate-pulse rounded bg-black/10" />
              </div>

              <div className="h-4 w-24 animate-pulse rounded bg-black/10" />

              <div className="h-10 animate-pulse rounded-[12px] border border-black/10 bg-black/[0.03]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

const HERO_DESC_BY_COLLECTION: Record<string, string> = {
  pitti:
    "В коллекции PITTI флорентийский стиль раскрывается через безупречное сочетание материалов и ручной работы. Эксклюзивность изделий подчёркивается использованием шпонированных плит, покрытых итальянским матовым лаком. Завершающий штрих — тщательно подобранная оригинальная фурнитура, которая дополняет общую эстетику.",
  elizabeth:
    "Коллекция ELIZABETH выполнена в стиле английской классики. Сдержанные, упорядоченные формы и контрастное сочетание оттенков создают выразительный и динамичный интерьер. Ручная сборка гарантирует высокое качество и уникальность каждого изделия.",
  amber:
    "В рамках коллекция AMBER современные тенденции гармонично сочетаются с высоким качеством материалов. Особого шарма коллекции придаёт грамотное комбинирование различных материалов и текстур, что выделяет ее на фоне других решений.",
  buongiorno:
    "Коллекция BUONGIORNO, выполненная в стиле арт-деко, дарит ощущение праздника и роскоши — к такой красоте хочется прикасаться снова и снова. Необычное исполнение фасадов, покрытие итальянской матовой эмалью и элегантные хрустальные ручки создают гармоничный образ с продуманными акцентами.",
  salvador:
    "Коллекция SALVADOR выполнена в неоклассическом стиле. Продуманная работа с акцентами, благородство шпонированных плит и безупречное сочетание различных материалов. Каждое изделие идеально вписывается в общую цветовую схему, создавая целостный и гармоничный образ.",
  scandi:
    "Коллекция SCANDY, выполненная в скандинавском стиле, объединяет эстетику и практичность: матовые фасады, изысканная лицевая фурнитура, использование массива дерева. Гармоничное сочетание природных оттенков создаёт уютный интерьер, который легко сочетается с другими цветовыми решениями.",
};

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

  type SidebarValue = typeof sidebarValue;
  type SortValue = Parameters<typeof setSort>[0];

  const TEST_MODE = process.env.NEXT_PUBLIC_STRAPI_TEST_MODE === "true";
  const CATALOG_SOURCE = String(
    process.env.NEXT_PUBLIC_CATALOG_SOURCE || "mocks",
  )
    .trim()
    .toLowerCase();

  const STRAPI_URL = String(process.env.NEXT_PUBLIC_STRAPI_URL || "").trim();

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
    const num = Number(n);
    const v = Number.isFinite(num) ? String(num) : "";

    if (!v || v === "0") params.delete(key);
    else params.set(key, v);
  };

  const sidebarValueSafe: SidebarValue = useMemo(() => {
    return {
      ...sidebarValue,
      menu: uniq(sidebarValue.menu),
      collections: uniq(sidebarValue.collections),
      types: uniq(sidebarValue.types),
    };
  }, [sidebarValue]);

  const onSidebarChangeSafe = (next: SidebarValue) => {
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

  const [strapiItems, setStrapiItems] = useState<CatalogStrapiItem[] | null>(
    null,
  );

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
        const pageSize = 100;
        let page = 1;
        let pageCount = 1;
        const acc: unknown[] = [];

        while (page <= pageCount) {
          const url = joinUrl(
            STRAPI_URL,
            `/api/products?` +
              `fields[0]=title&` +
              `fields[1]=slug&` +
              `fields[2]=collection&` +
              `fields[3]=module&` +
              `fields[4]=brand&` +
              `fields[5]=cat&` +
              `fields[6]=isActive&` +
              `fields[7]=isActiveUZ&` +
              `fields[8]=isActiveRU&` +
              `fields[9]=publishedAt&` +
              `fields[10]=sortOrder&` +
              `fields[11]=priceUZS&` +
              `fields[12]=priceRUB&` +
              `fields[13]=oldPriceUZS&` +
              `fields[14]=oldPriceRUB&` +
              `fields[15]=collectionBadge&` +
              `fields[16]=sku&` +
              `fields[17]=articleShort&` +
              `populate[media][fields][0]=url&` +
              `pagination[page]=${page}&pagination[pageSize]=${pageSize}&` +
              `sort=sortOrder:asc,updatedAt:desc`,
          );

          const res = await fetch(url, { cache: "no-store" });

          if (!res.ok) {
            throw new Error("Strapi products fetch failed");
          }

          const json: unknown = await res.json();
          const data = isRecord(json) ? getUnknown(json, "data") : undefined;
          const arr = Array.isArray(data) ? data : [];

          acc.push(...arr);

          const meta = isRecord(json) ? getRecord(json, "meta") : null;
          const pagination = meta ? getRecord(meta, "pagination") : null;
          const pc = pagination
            ? getUnknown(pagination, "pageCount")
            : undefined;

          pageCount = typeof pc === "number" && pc > 0 ? pc : 1;

          page += 1;

          if (!alive) return;
        }

        const mapped = acc.map((it) => pickStrapiItem(it));

        if (alive) {
          setStrapiItems(mapped);
        }
      } catch (e) {
        console.error("Strapi products fetch failed", e);

        if (alive) {
          setStrapiItems([]);
        }
      }
    };

    void run();

    return () => {
      alive = false;
    };
  }, [CATALOG_SOURCE, STRAPI_URL]);

  const baseItems = useMemo(() => {
    if (CATALOG_SOURCE !== "strapi") return [] as CatalogStrapiItem[];
    if (!Array.isArray(strapiItems)) return [] as CatalogStrapiItem[];

    return strapiItems;
  }, [CATALOG_SOURCE, strapiItems]);

  const isStrapiLoading = CATALOG_SOURCE === "strapi" && strapiItems === null;

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

  type CatalogItemRec = Record<string, unknown>;

  const isCatalogItemActive = (p: unknown): p is CatalogItemRec => {
    if (!isRecord(p)) return false;

    return isVisibleFromStrapi(p, region);
  };

  /**
   * Fallback:
   * Если useCatalogData по какой-то причине вернул 0,
   * но товары этой коллекции реально есть в Strapi,
   * показываем их напрямую.
   *
   * Scene / сборная карточка идет первой.
   */
  const fallbackCollectionItems = useMemo<CatalogItemRec[]>(() => {
    const currentCollection = normalizeCollectionForCatalog(activeCollection);

    if (!currentCollection) return [];
    if (!Array.isArray(baseItems) || baseItems.length === 0) return [];

    const list = (baseItems as unknown[])
      .filter((x): x is CatalogItemRec => isRecord(x))
      .filter((p) => isVisibleFromStrapi(p, region))
      .filter((p) => getCatalogItemCollection(p) === currentCollection)
      .sort((a, b) => {
        const sceneA = isCatalogSceneItem(a);
        const sceneB = isCatalogSceneItem(b);

        if (sceneA !== sceneB) return sceneA ? -1 : 1;

        const sa = getCatalogSortOrder(a);
        const sb = getCatalogSortOrder(b);

        if (sa !== sb) return sa - sb;

        const ia = Number(a.id ?? 0);
        const ib = Number(b.id ?? 0);

        if (Number.isFinite(ia) && Number.isFinite(ib) && ia !== ib) {
          return ia - ib;
        }

        return String(a.title ?? "").localeCompare(String(b.title ?? ""), "ru");
      });

    return list;
  }, [baseItems, activeCollection, region]);

  const sortedFromHook = (sorted ?? []).filter(isCatalogItemActive);

  const bedroomsFirstListFromHook = (bedroomsFirstList ?? []).filter(
    isCatalogItemActive,
  );

  const collectionRestFromHook = (collectionRest ?? []).filter(
    isCatalogItemActive,
  );

  const useFallback =
    sortedFromHook.length === 0 && fallbackCollectionItems.length > 0;

  const sorted3 = useFallback ? fallbackCollectionItems : sortedFromHook;

  const bedroomsFirstList3 = useFallback ? [] : bedroomsFirstListFromHook;

  const collectionRest3 = useFallback
    ? fallbackCollectionItems
    : collectionRestFromHook;

  const bedroomsFirst3: CatalogItemRec | null =
    !useFallback && bedroomsFirst && isCatalogItemActive(bedroomsFirst)
      ? bedroomsFirst
      : null;

  const activeDoor = selectedDoors[0] || "";
  const activeFacade = selectedFacades[0] || "";

  const heroRoomEffective = heroRoom || activeRoom;

  const moduleItemsForCollection = useMemo(() => {
    if (!activeCollection) return [];

    const currentCollection = normalizeCollectionForCatalog(activeCollection);
    const set = new Set<string>();

    for (const p of baseItems) {
      if (!isVisibleFromStrapi(p, region)) continue;

      const col = getCatalogItemCollection(p);

      if (col && col === currentCollection) {
        const mod = normalizeModuleForCatalog(p.module ?? p.cat);

        if (mod && !isCatalogSceneItem(p)) {
          set.add(mod);
        }
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
  }, [activeCollection, baseItems, region]);

  const doorItems = useMemo(() => [...DOOR_ITEMS], []);

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

    const key = String(activeCollection).trim().toLowerCase();
    const base = HERO_DESC_BY_COLLECTION[key];

    if (base) return base;

    const rn = roomLabel ? roomLabel.toLowerCase() : "интерьер";

    return `Коллекция ${String(activeCollection).toUpperCase()} — премиальное решение для ${rn}. Чистый дизайн, качественные материалы и продуманная функциональность создают цельный и дорогой образ пространства.`;
  }, [activeCollection, roomLabel]);

  const heroSlides = useMemo((): string[] => {
    if (!hero || !heroRoomEffective || !activeCollection) return [];

    const room = String(heroRoomEffective).trim().toLowerCase();
    const col = String(activeCollection).trim().toLowerCase();
    const key = `${room}:${col}`;

    const conf = HERO_SLIDES_MANIFEST?.[key];

    if (!conf) return [];

    return makeSlidesFromConf(conf);
  }, [hero, heroRoomEffective, activeCollection]);

  const menu = sidebarValue.menu;
  const collections = sidebarValue.collections;
  const types = sidebarValue.types;
  const priceMin = sidebarValue.priceMin;
  const priceMax = sidebarValue.priceMax;
  const strapiLen = Array.isArray(strapiItems) ? strapiItems.length : 0;

  useEffect(() => {
    if (!gridRef.current || isStrapiLoading) return;

    const cards = gridRef.current.querySelectorAll("[data-card]");

    gsap.killTweensOf(cards);

    cards.forEach((el) => {
      const h = el as HTMLElement;

      h.style.opacity = "1";
      h.style.transform = "translate3d(0,0,0)";
      h.style.filter = "none";
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
    menu,
    collections,
    types,
    priceMin,
    priceMax,
    region,
    qFromUrl,
    sort,
    selectedDoors,
    selectedFacades,
    CATALOG_SOURCE,
    strapiLen,
    sorted3.length,
    isStrapiLoading,
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
      doorItems={doorItems}
      facadeItems={facadeItems}
      moduleItemsForCollection={moduleItemsForCollection}
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

  const POPULAR_SORT: SortValue = "popular";
  const UPDATED_SORT: SortValue = "updated";
  const PRICE_ASC: SortValue = "price_asc";
  const PRICE_DESC: SortValue = "price_desc";

  const setPopularSort = () => setSort(POPULAR_SORT);
  const setUpdatedSort = () => setSort(UPDATED_SORT);

  const togglePriceSort = () => {
    if (isPrice) {
      setSort(isPriceAsc ? PRICE_DESC : PRICE_ASC);
    } else {
      setSort(PRICE_ASC);
    }
  };

  const safeTitle =
    normalizeCollectionForCatalog(heroTitle) === "scandi"
      ? "SCANDY"
      : heroTitle;

  const visibleCount = isStrapiLoading ? "..." : sorted3.length;

  const visibleCountLabel = isStrapiLoading
    ? "товаров"
    : declOfGoods(sorted3.length);

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-2 pb-24">
      {!hero ? (
        <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-[24px] font-medium tracking-[-0.02em]">
              Каталог
            </h1>

            <p className="mt-1 text-[13px] text-black/55">
              Товары: {visibleCount}
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
                    <h1 className="whitespace-nowrap text-[22px] font-semibold leading-none tracking-[-0.03em]">
                      {safeTitle || "Коллекция"}
                    </h1>

                    <span className="inline-flex h-7 shrink-0 items-center whitespace-nowrap rounded-none border border-black/10 bg-[#f3f3f3] px-3 text-[11px] font-medium leading-none tracking-[0.22em] text-black/55 uppercase">
                      {visibleCount} {visibleCountLabel}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : null}

          <div className="catalog-filters-wrap">
            <FiltersSidebar
              value={sidebarValueSafe}
              meta={sidebarMeta}
              onChange={onSidebarChangeSafe}
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
                <div className="text-[11px] font-medium tracking-[0.22em] text-black/35 uppercase">
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
                      "inline-flex cursor-pointer items-center gap-1 text-[13px] font-medium",
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

          {isStrapiLoading ? (
            <CatalogLoadingSkeleton hero={hero} />
          ) : (
            <CatalogGrid
              gridRef={gridRef}
              items={sorted3}
              fmtPrice={fmtPrice}
              bedroomsFirst={bedroomsFirst3}
              bedroomsFirstList={bedroomsFirstList3}
              collectionRest={collectionRest3}
              collectionTitle={
                normalizeCollectionForCatalog(activeCollection) === "scandi"
                  ? "SCANDY"
                  : activeCollection
              }
            />
          )}

          {!isStrapiLoading && sorted3.length === 0 ? (
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
