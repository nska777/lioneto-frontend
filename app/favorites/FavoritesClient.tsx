"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, HeartOff, ShoppingBag, Trash2, Zap } from "lucide-react";

import { useRegionLang } from "../context/region-lang";
import { useShopState } from "../context/shop-state";
import { fetchStrapiProductsMapBySlugs } from "@/app/lib/strapi/products";

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

type Region = "uz" | "ru";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function formatMoney(n: number, region: Region) {
  const v = Number.isFinite(Number(n)) ? Number(n) : 0;
  if (region === "uz") return new Intl.NumberFormat("ru-RU").format(v) + " сум";
  return new Intl.NumberFormat("ru-RU").format(v) + " ₽";
}

function normalizeArticleColor(color?: string | null) {
  const value = String(color ?? "").trim();
  if (!value) return "";
  return value.charAt(0).toLowerCase() + value.slice(1);
}

function getDisplayArticle(baseArticle?: string | null, color?: string | null) {
  const article = String(baseArticle ?? "").trim();
  const normalizedColor = normalizeArticleColor(color);

  if (!article) return "—";
  if (!normalizedColor) return article;

  return `${article} (${normalizedColor})`;
}

function productHrefWithVariant(productId: string, variantId: string) {
  const pid = String(productId || "").trim();
  const vid = String(variantId || "base").trim();

  if (!pid) return "/catalog";
  if (!vid || vid === "base") return `/product/${encodeURIComponent(pid)}`;

  return `/product/${encodeURIComponent(pid)}?variant=${encodeURIComponent(
    vid,
  )}`;
}

function SafeImage({ src, alt }: { src: string; alt: string }) {
  const [broken, setBroken] = React.useState(false);

  if (!src || broken) {
    return (
      <div className="absolute inset-0 grid place-items-center bg-black/5">
        <div className="text-[11px] tracking-[0.22em] text-black/35">
          NO IMAGE
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="absolute inset-0 h-full w-full object-cover"
      onError={() => setBroken(true)}
      loading="lazy"
    />
  );
}

type PriceEntry = {
  productId: string;
  title?: string | null;
  priceUZS?: number | null;
  priceRUB?: number | null;
  oldPriceUZS?: number | null;
  oldPriceRUB?: number | null;
  hasDiscount?: boolean | null;
  collectionBadge?: string | null;
  isActive?: boolean | null;
};

type CartLineMeta = {
  productId?: string;
  variantId?: string;
  variantTitle?: string | null;
  title?: string;
  href?: string;
  imageUrl?: string | null;
  sku?: string;
  price_uzs?: number;
  price_rub?: number;

  selectedColor?: string | null;
  selectedVariantKey?: string | null;

  selectedSetItemId?: string | null;
  selectedSetItemTitle?: string | null;
  selectedSetItemOptionKey?: string | null;
  selectedSetItemColorKey?: string | null;
  selectedSetItemArticle?: string | null;
  selectedSetItemNote?: string | null;

  optionTitle?: string | null;
  optionKey?: string | null;
  colorKey?: string | null;

  quantity?: number;
};

const toNum = (v: unknown) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

function metaString(v: unknown): string | null {
  const s = typeof v === "string" ? v.trim() : "";
  return s ? s : null;
}

function asMetaRecord(v: unknown): CartLineMeta | null {
  if (!isRecord(v)) return null;
  return v as CartLineMeta;
}

function metaMatches(
  meta: CartLineMeta | null,
  productId: string,
  variantId: string,
) {
  if (!meta) return false;

  const mp = String(meta.productId ?? "").trim();
  const mv = String(meta.variantId ?? "base").trim() || "base";

  return mp === productId && mv === variantId;
}

function findMetaInValue(
  value: unknown,
  productId: string,
  variantId: string,
): CartLineMeta | null {
  if (!value) return null;

  if (Array.isArray(value)) {
    for (const item of value) {
      const meta = asMetaRecord(item);
      if (metaMatches(meta, productId, variantId)) return meta;
    }
    return null;
  }

  if (!isRecord(value)) return null;

  const directKeys = [
    `${productId}::${variantId}`,
    `${productId}|${variantId}`,
    `${productId}:${variantId}`,
    `${productId}__${variantId}`,
    `${productId}-${variantId}`,
  ];

  for (const key of directKeys) {
    const direct = asMetaRecord(value[key]);
    if (direct) return direct;
  }

  const nested = value[productId];

  if (isRecord(nested)) {
    const byVariant =
      asMetaRecord(nested[variantId]) ||
      asMetaRecord(nested[`variant:${variantId}`]) ||
      asMetaRecord(nested["base"]);

    if (byVariant) return byVariant;
  }

  for (const item of Object.values(value)) {
    const meta = asMetaRecord(item);
    if (metaMatches(meta, productId, variantId)) return meta;

    const nestedMeta = findMetaInValue(item, productId, variantId);
    if (nestedMeta) return nestedMeta;
  }

  return null;
}

function readCartLineMeta(
  productId: string,
  variantId: string,
): CartLineMeta | null {
  if (typeof window === "undefined") return null;

  const preferredKeys = [
    "lioneto:cart:line-meta:v1",
    "lioneto:cart-line-meta:v1",
    "lioneto:cart-line-meta",
    "lioneto:cart:meta",
    "cart-line-meta",
  ];

  for (const key of preferredKeys) {
    const raw = window.localStorage.getItem(key);
    if (!raw) continue;

    try {
      const parsed: unknown = JSON.parse(raw);
      const found = findMetaInValue(parsed, productId, variantId);
      if (found) return found;
    } catch {
      // ignore
    }
  }

  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (!key) continue;

    const lower = key.toLowerCase();

    if (
      !lower.includes("cart") &&
      !lower.includes("lead") &&
      !lower.includes("meta")
    ) {
      continue;
    }

    const raw = window.localStorage.getItem(key);
    if (!raw) continue;

    try {
      const parsed: unknown = JSON.parse(raw);
      const found = findMetaInValue(parsed, productId, variantId);
      if (found) return found;
    } catch {
      // ignore
    }
  }

  return null;
}

function readMetaPrice(meta: CartLineMeta | null, region: Region): number {
  if (!meta) return 0;

  const raw = region === "uz" ? meta.price_uzs : meta.price_rub;
  const n = Number(raw);

  return Number.isFinite(n) && n > 0 ? n : 0;
}

async function fetchPriceMapByKeys(keys: string[]) {
  const ids = Array.from(
    new Set(keys.map((s) => String(s || "").trim()).filter(Boolean)),
  );

  if (!ids.length) return {} as Record<string, PriceEntry>;

  const base = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

  const params = new URLSearchParams();
  ids.forEach((id, i) => params.set(`filters[productId][$in][${i}]`, id));
  params.set("pagination[pageSize]", String(Math.min(100, ids.length)));

  const url = `${base.replace(/\/$/, "")}/api/price-entries?${params.toString()}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return {} as Record<string, PriceEntry>;

  const json = await res.json();
  const data: unknown[] = Array.isArray(json?.data) ? json.data : [];

  const map: Record<string, PriceEntry> = {};

  for (const item of data) {
    const rec = isRecord(item) ? item : {};
    const a = isRecord(rec.attributes) ? rec.attributes : rec;

    const pid = String(a.productId ?? "").trim();
    if (!pid) continue;

    map[pid] = {
      productId: pid,
      title: a.title != null ? String(a.title) : null,
      priceUZS: a.priceUZS !== undefined ? toNum(a.priceUZS) : null,
      priceRUB: a.priceRUB !== undefined ? toNum(a.priceRUB) : null,
      oldPriceUZS: a.oldPriceUZS !== undefined ? toNum(a.oldPriceUZS) : null,
      oldPriceRUB: a.oldPriceRUB !== undefined ? toNum(a.oldPriceRUB) : null,
      hasDiscount: typeof a.hasDiscount === "boolean" ? a.hasDiscount : null,
      collectionBadge:
        a.collectionBadge !== undefined ? String(a.collectionBadge) : null,
      isActive: typeof a.isActive === "boolean" ? a.isActive : null,
    };
  }

  return map;
}

function resolveCompositeVariant(
  variantId: string,
  variants: Array<{
    id: string;
    title?: string;
    group?: string;
    priceDeltaRUB?: number;
    priceDeltaUZS?: number;
    image?: string;
    gallery?: string[];
  }>,
  region: Region,
) {
  const raw = String(variantId ?? "").trim();

  if (!raw || raw === "base") {
    return {
      title: null as string | null,
      finalPrice: 0,
      image: null as string | null,
    };
  }

  const parts = raw
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);

  const picked: typeof variants = [];

  for (const part of parts) {
    if (part.includes(":")) {
      const [g, id] = part.split(":");
      const group = String(g ?? "").trim();
      const vid = String(id ?? "").trim();

      if (!vid) continue;

      const found =
        variants.find(
          (v) =>
            String(v.id) === vid &&
            (group ? String(v.group ?? "") === group : true),
        ) ?? variants.find((v) => String(v.id) === vid);

      if (found) picked.push(found);
      continue;
    }

    const found = variants.find((v) => String(v.id) === part);
    if (found) picked.push(found);
  }

  const title = picked
    .map((v) => (v.title ? String(v.title).trim() : ""))
    .filter(Boolean)
    .join(", ");

  const finalPrice =
    picked
      .map((v) =>
        region === "uz"
          ? Number(v?.priceDeltaUZS ?? 0)
          : Number(v?.priceDeltaRUB ?? 0),
      )
      .find((price) => Number.isFinite(price) && price > 0) || 0;

  const image =
    picked.find((v) => Array.isArray(v.gallery) && v.gallery.length)
      ?.gallery?.[0] ??
    picked.find((v) => !!v.image)?.image ??
    null;

  return { title: title || null, finalPrice, image };
}

type LiteRelated = {
  slug: string;
  title: string;
  image: string;
  priceUZS?: number | null;
  priceRUB?: number | null;
};

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function stableSessionSeed(key: string) {
  try {
    const k = `lioneto:seed:${key}`;
    const got = sessionStorage.getItem(k);
    if (got) return Number(got) || 1;

    const s = Math.floor(Math.random() * 1e9) + 1;
    sessionStorage.setItem(k, String(s));

    return s;
  } catch {
    return 1;
  }
}

function resolveStrapiUrlMaybe(base: string, url: string) {
  const u = String(url || "").trim();

  if (!u) return "";
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  if (!u.startsWith("/")) return `${base.replace(/\/$/, "")}/${u}`;

  return `${base.replace(/\/$/, "")}${u}`;
}

function pickStrapiImage(a: unknown, base: string) {
  if (!isRecord(a)) return "";

  const image = isRecord(a.image) ? a.image : {};
  const imageData = isRecord(image.data) ? image.data : {};
  const imageAttributes = isRecord(imageData.attributes)
    ? imageData.attributes
    : {};
  const imageFormats = isRecord(image.formats) ? image.formats : {};
  const imageSmall = isRecord(imageFormats.small) ? imageFormats.small : {};
  const imageThumb = isRecord(imageFormats.thumbnail)
    ? imageFormats.thumbnail
    : {};

  const gallery = a.gallery;
  let galleryFirst: unknown = "";

  if (Array.isArray(gallery)) {
    galleryFirst = gallery[0];
  } else if (isRecord(gallery)) {
    const gData = gallery.data;
    if (Array.isArray(gData)) galleryFirst = gData[0];
  }

  const galleryFirstRec = isRecord(galleryFirst) ? galleryFirst : {};
  const galleryFirstAttr = isRecord(galleryFirstRec.attributes)
    ? galleryFirstRec.attributes
    : {};
  const galleryFormats = isRecord(galleryFirstAttr.formats)
    ? galleryFirstAttr.formats
    : {};
  const gallerySmall = isRecord(galleryFormats.small)
    ? galleryFormats.small
    : {};
  const galleryThumb = isRecord(galleryFormats.thumbnail)
    ? galleryFormats.thumbnail
    : {};

  const raw =
    image.url ??
    imageAttributes.url ??
    imageSmall.url ??
    imageThumb.url ??
    galleryFirstRec.url ??
    galleryFirstAttr.url ??
    gallerySmall.url ??
    galleryThumb.url ??
    a.image ??
    a.cover ??
    "";

  return resolveStrapiUrlMaybe(base, String(raw || ""));
}

async function fetchLiteRelatedProducts(limit = 24) {
  const base = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";
  const url = `${base.replace(/\/$/, "")}/api/products?pagination[pageSize]=${encodeURIComponent(
    String(limit),
  )}&fields[0]=slug&fields[1]=title&fields[2]=priceUZS&fields[3]=priceRUB&populate[0]=image&populate[1]=gallery`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return [] as LiteRelated[];

  const json = await res.json();
  const data: unknown[] = Array.isArray(json?.data) ? json.data : [];

  const out: LiteRelated[] = [];

  for (const item of data) {
    const rec = isRecord(item) ? item : {};
    const a = isRecord(rec.attributes) ? rec.attributes : rec;

    const slug = String(a.slug ?? "").trim();
    if (!slug) continue;

    out.push({
      slug,
      title: String(a.title ?? slug),
      image: pickStrapiImage(a, base),
      priceUZS: toNum(a.priceUZS),
      priceRUB: toNum(a.priceRUB),
    });
  }

  return out;
}

function readArticle(p: unknown): string {
  if (!isRecord(p)) return "";
  return String(p.sku ?? p.article ?? p.id ?? "").trim();
}

function readProductBasePrice(p: unknown, region: Region): number {
  if (!isRecord(p)) return 0;

  const raw =
    region === "uz" ? (p.priceUZS ?? p.price_uzs) : (p.priceRUB ?? p.price_rub);

  const n = Number(raw);

  return Number.isFinite(n) && n > 0 ? n : 0;
}

type FavoriteItem = {
  key: string;
  productId: string;
  variantId: string;
  title: string;
  variantTitle: string | null;
  selectedColor: string | null;
  selectedSetItemTitle: string | null;
  selectedSetItemOptionKey: string | null;
  selectedSetItemColorKey: string | null;
  article: string;
  price: number;
  image: string;
};

export default function FavoritesClient() {
  const { region } = useRegionLang();
  const shop = useShopState();

  const favKeys = shop.favorites;

  const productIds = useMemo(() => {
    return favKeys
      .map((key) => shop.parseKey(String(key)).productId)
      .map((x) => String(x))
      .filter(Boolean);
  }, [favKeys, shop]);

  const priceKeys = useMemo(() => {
    const keys: string[] = [];

    for (const k of favKeys) {
      const { productId, variantId } = shop.parseKey(String(k));
      const pid = String(productId || "").trim();
      const vid = String(variantId || "base").trim() || "base";

      if (!pid) continue;

      keys.push(`${pid}::${vid}`);
      keys.push(`${pid}::base`);
      keys.push(pid);
    }

    return Array.from(new Set(keys));
  }, [favKeys, shop]);

  const [priceMap, setPriceMap] = useState<Record<string, PriceEntry>>({});
  const [productsMap, setProductsMap] = useState<Record<string, any>>({});

  const [related, setRelated] = useState<LiteRelated[]>([]);
  const [relatedPriceMap, setRelatedPriceMap] = useState<
    Record<string, PriceEntry>
  >({});

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const [pm, pr] = await Promise.all([
          fetchPriceMapByKeys(priceKeys),
          fetchStrapiProductsMapBySlugs(productIds),
        ]);

        if (!alive) return;

        setPriceMap(pm);
        setProductsMap(pr);
      } catch {
        if (!alive) return;

        setPriceMap({});
        setProductsMap({});
      }
    })();

    return () => {
      alive = false;
    };
  }, [productIds.join("|"), priceKeys.join("|")]);

  const items = useMemo(() => {
    return favKeys
      .map((key) => {
        const k = String(key);
        const { productId, variantId } = shop.parseKey(String(k));

        const pid = String(productId || "").trim();
        const vid = String(variantId || "base").trim() || "base";

        const p = productsMap[pid];
        if (!pid || !p) return null;

        const meta = readCartLineMeta(pid, vid);

        const variants = Array.isArray(p?.variants) ? p.variants : [];
        const resolved = resolveCompositeVariant(vid, variants, region);

        const peVariant = priceMap[`${pid}::${vid}`];
        const peBase = priceMap[`${pid}::base`];
        const pePlain = priceMap[pid];

        const pickBaseFromEntry = (pe?: PriceEntry) => {
          const n =
            region === "uz"
              ? Number(pe?.priceUZS ?? 0)
              : Number(pe?.priceRUB ?? 0);
          return Number.isFinite(n) ? n : 0;
        };

        const baseFromStrapi =
          (peVariant && pickBaseFromEntry(peVariant)) ||
          (peBase && pickBaseFromEntry(peBase)) ||
          (pePlain && pickBaseFromEntry(pePlain)) ||
          0;

        const baseFromProduct = readProductBasePrice(p, region);

        const basePrice =
          (Number.isFinite(baseFromStrapi) && baseFromStrapi > 0
            ? baseFromStrapi
            : 0) ||
          (Number.isFinite(baseFromProduct) && baseFromProduct > 0
            ? baseFromProduct
            : 0) ||
          0;

        const metaPrice = readMetaPrice(meta, region);

        const price =
          metaPrice > 0
            ? metaPrice
            : resolved.finalPrice > 0
              ? resolved.finalPrice
              : basePrice;

        const title =
          metaString(meta?.title) ||
          String(
            peVariant?.title ??
              peBase?.title ??
              pePlain?.title ??
              p?.title ??
              "—",
          ) ||
          "—";

        const selectedColor = metaString(meta?.selectedColor);

        const selectedSetItemTitle =
          metaString(meta?.selectedSetItemTitle) ||
          metaString(meta?.optionTitle);

        const selectedSetItemOptionKey =
          metaString(meta?.selectedSetItemOptionKey) ||
          metaString(meta?.optionKey);

        const selectedSetItemColorKey =
          metaString(meta?.selectedSetItemColorKey) ||
          metaString(meta?.colorKey);

        const variantTitle =
          [selectedColor, selectedSetItemTitle].filter(Boolean).join(", ") ||
          metaString(meta?.variantTitle) ||
          resolved.title;

        const image =
          metaString(meta?.imageUrl) ||
          (resolved.image ? String(resolved.image) : "") ||
          (p?.image ? String(p.image) : "") ||
          (Array.isArray(p?.gallery) && p.gallery[0]
            ? String(p.gallery[0])
            : "");

        const article =
          metaString(meta?.sku) ||
          getDisplayArticle(readArticle(p), selectedColor || resolved.title);

        return {
          key: k,
          productId: pid,
          variantId: vid,
          title,
          variantTitle,
          selectedColor,
          selectedSetItemTitle,
          selectedSetItemOptionKey,
          selectedSetItemColorKey,
          article,
          price,
          image,
        };
      })
      .filter(Boolean) as FavoriteItem[];
  }, [favKeys, shop, productsMap, priceMap, region]);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const favSet = new Set(productIds.map((s) => String(s)));

        const pool = await fetchLiteRelatedProducts(24);
        if (!alive) return;

        const filtered = pool.filter((p) => !favSet.has(String(p.slug)));

        const seed = stableSessionSeed(
          `favorites-related:${productIds.join("|")}`,
        );
        const rnd = mulberry32(seed);

        const shuffled = [...filtered].sort(() => rnd() - 0.5);
        const pick = shuffled.slice(0, 3);

        setRelated(pick);

        const relKeys: string[] = [];

        for (const r of pick) {
          const s = String(r.slug).trim();
          if (!s) continue;

          relKeys.push(`${s}::base`);
          relKeys.push(s);
        }

        const relMap = await fetchPriceMapByKeys(relKeys);
        if (!alive) return;

        setRelatedPriceMap(relMap);
      } catch {
        if (!alive) return;

        setRelated([]);
        setRelatedPriceMap({});
      }
    })();

    return () => {
      alive = false;
    };
  }, [productIds.join("|"), region]);

  const clearFavorites = () => {
    favKeys.forEach((key) => {
      const { productId, variantId } = shop.parseKey(String(key));
      shop.toggleFav(productId, variantId);
    });
  };

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-[12px] tracking-[0.28em] text-black/45">
            LIONETO
          </div>

          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">
            Избранное
          </h1>

          <p className="mt-2 text-sm text-black/55">
            {items.length
              ? `Товаров: ${items.length}`
              : "Пока пусто — добавь товары сердечком."}
          </p>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={clearFavorites}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-black/75 transition hover:border-black/20 hover:text-black"
            title="Очистить избранное"
          >
            <Trash2 className="h-4 w-4" />
            Очистить
          </button>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="rounded-3xl border border-black/10 bg-white p-8">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-black/5">
                  <HeartOff className="h-6 w-6 text-black/60" />
                </div>

                <div>
                  <div className="text-base font-medium">Избранное пустое</div>
                  <div className="text-sm text-black/55">
                    Нажимай на сердечко на карточке — товар появится здесь.
                  </div>
                </div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/catalog"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
                >
                  В каталог <ArrowRight className="h-4 w-4" />
                </Link>

                <Link
                  href="/cart"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-medium text-black/75 transition hover:border-black/20 hover:text-black"
                >
                  Открыть корзину <ShoppingBag className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : (
            items.map((it) => {
              const productHref = productHrefWithVariant(
                it.productId,
                it.variantId,
              );

              return (
                <div
                  key={it.key}
                  className="rounded-3xl border border-black/10 bg-white p-4 md:p-5"
                >
                  <div className="flex gap-4">
                    <Link
                      href={productHref}
                      className="relative h-24 w-24 shrink-0 cursor-pointer overflow-hidden rounded-2xl bg-black/5"
                    >
                      <SafeImage src={it.image} alt={it.title} />
                    </Link>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            href={productHref}
                            className="block cursor-pointer truncate text-base font-medium tracking-[-0.01em] hover:underline"
                          >
                            {it.title}
                          </Link>

                          <div className="mt-1 text-[12px] text-black/45">
                            Артикул: {it.article}
                          </div>

                          {it.selectedColor ? (
                            <div className="mt-1 text-[12px] text-black/55">
                              Цвет:{" "}
                              <span className="font-semibold text-black/75">
                                {it.selectedColor}
                              </span>
                            </div>
                          ) : null}

                          {it.selectedSetItemTitle ? (
                            <div className="mt-1 text-[12px] text-black/55">
                              Комплектация:{" "}
                              <span className="font-semibold text-black/75">
                                {it.selectedSetItemTitle}
                              </span>
                            </div>
                          ) : it.variantTitle && it.variantId !== "base" ? (
                            <div className="mt-1 text-[12px] text-black/55">
                              Вариант:{" "}
                              <span className="font-semibold text-black/75">
                                {it.variantTitle}
                              </span>
                            </div>
                          ) : null}

                          <div className="mt-1 text-xs text-black/45">
                            ID: {it.productId}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            shop.toggleFav(it.productId, it.variantId)
                          }
                          className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-black/10 bg-white text-black/65 transition hover:border-black/20 hover:text-black"
                          title="Убрать из избранного"
                          aria-label="Убрать из избранного"
                        >
                          <HeartOff className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="text-sm text-black/55">Цена</div>

                        <div className="text-right">
                          <div className="text-lg font-semibold tracking-[-0.02em]">
                            {formatMoney(it.price, region)}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-wrap gap-3">
                        <Link
                          href={productHref}
                          className="inline-flex cursor-pointer items-center justify-center rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black/75 transition hover:border-black/20 hover:text-black"
                        >
                          Смотреть
                        </Link>

                        <button
                          type="button"
                          onClick={() => {
                            shop.addToCart(it.productId, 1, it.variantId);
                            window.location.href = "/cart";
                          }}
                          className="inline-flex cursor-pointer items-center justify-center rounded-full bg-black px-4 py-2 text-sm font-medium text-white transition hover:opacity-90"
                        >
                          В корзину <ArrowRight className="ml-2 h-4 w-4" />
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            shop.setOneClick(it.productId, 1, it.variantId);
                            window.location.href = "/checkout?mode=oneclick";
                          }}
                          className="inline-flex cursor-pointer items-center justify-center rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black/75 transition hover:border-black/20 hover:text-black"
                        >
                          Купить в 1 клик <Zap className="ml-2 h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <aside className="h-fit rounded-3xl border border-black/10 bg-white p-5">
          <div className="text-base font-semibold tracking-[-0.01em]">
            Рекомендуем
          </div>

          <p className="mt-1 text-sm text-black/55">
            Подборка похожих товаров — чтобы собрать комплект.
          </p>

          <div className="mt-4 space-y-3">
            {related.length ? (
              related.map((r) => {
                const peBase = relatedPriceMap[`${r.slug}::base`];
                const pePlain = relatedPriceMap[r.slug];

                const priceFromEntry =
                  region === "uz"
                    ? Number(peBase?.priceUZS ?? pePlain?.priceUZS ?? 0)
                    : Number(peBase?.priceRUB ?? pePlain?.priceRUB ?? 0);

                const priceFromProduct =
                  region === "uz"
                    ? Number(r?.priceUZS ?? 0)
                    : Number(r?.priceRUB ?? 0);

                const price =
                  (Number.isFinite(priceFromEntry) && priceFromEntry > 0
                    ? priceFromEntry
                    : 0) ||
                  (Number.isFinite(priceFromProduct) && priceFromProduct > 0
                    ? priceFromProduct
                    : 0) ||
                  0;

                return (
                  <div
                    key={r.slug}
                    className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white p-3"
                  >
                    <Link
                      href={`/product/${r.slug}`}
                      className="relative h-14 w-14 shrink-0 cursor-pointer overflow-hidden rounded-xl bg-black/5"
                      title={r.title}
                    >
                      <SafeImage src={r.image} alt={r.title} />
                    </Link>

                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/product/${r.slug}`}
                        className="block cursor-pointer truncate text-sm font-medium text-black/85 hover:underline"
                        title={r.title}
                      >
                        {r.title}
                      </Link>

                      <div className="mt-0.5 text-xs text-black/60">
                        {formatMoney(price, region)}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        shop.addToCart(r.slug, 1, "base");
                        window.location.href = "/cart";
                      }}
                      className="inline-flex cursor-pointer items-center justify-center rounded-full bg-black px-3 py-2 text-[12px] font-medium text-white transition hover:opacity-90"
                      title="В корзину"
                    >
                      В корзину
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="rounded-2xl border border-black/10 bg-white p-4 text-sm text-black/55">
                Пока подбираем рекомендации…
              </div>
            )}
          </div>

          <div className="mt-5">
            <Link
              href="/catalog"
              className="inline-flex w-full cursor-pointer items-center justify-center rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-medium text-black/75 transition hover:border-black/20 hover:text-black"
            >
              В каталог
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
