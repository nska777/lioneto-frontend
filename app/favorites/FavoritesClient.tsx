// app/favorites/FavoritesClient.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, HeartOff, ShoppingBag, Trash2 } from "lucide-react";

import { useRegionLang } from "../context/region-lang";
import { useShopState } from "../context/shop-state";
import { CATALOG_BY_ID, CATALOG_MOCK } from "../lib/mock/catalog-products";

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

/* ================= Stable random helpers ================= */

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

/* ================= Utils ================= */

function formatMoney(n: number, region: "uz" | "ru") {
  if (region === "uz") return new Intl.NumberFormat("ru-RU").format(n) + " сум";
  return new Intl.NumberFormat("ru-RU").format(n) + " ₽";
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
    <Image
      src={src}
      alt={alt}
      fill
      className="object-cover"
      sizes="(max-width: 768px) 100vw, 360px"
      onError={() => setBroken(true)}
    />
  );
}

type VariantAny = {
  id: string;
  title?: string;
  priceDeltaRUB?: number;
  priceDeltaUZS?: number;
  image?: string;
};

/** ================= Strapi price-entry (client) ================= */

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

const toNum = (v: any) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

async function fetchPriceMap(productIds: string[]) {
  const ids = Array.from(new Set(productIds.filter(Boolean)));
  if (!ids.length) return {} as Record<string, PriceEntry>;

  const base =
    process.env.NEXT_PUBLIC_STRAPI_URL ||
    process.env.STRAPI_URL ||
    "http://localhost:1337";

  const params = new URLSearchParams();
  ids.forEach((id, i) => params.set(`filters[productId][$in][${i}]`, id));
  params.set("pagination[pageSize]", String(Math.min(100, ids.length)));

  const url = `${base.replace(/\/$/, "")}/api/price-entries?${params.toString()}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return {} as Record<string, PriceEntry>;

  const json = await res.json();
  const data: any[] = Array.isArray(json?.data) ? json.data : [];

  const map: Record<string, PriceEntry> = {};
  for (const item of data) {
    const a = item; // у тебя поля прямо тут (без attributes)
    const pid = String(a?.productId ?? "");
    if (!pid) continue;

    map[pid] = {
      productId: pid,
      title: a?.title ?? null,
      priceUZS: a?.priceUZS !== undefined ? toNum(a.priceUZS) : null,
      priceRUB: a?.priceRUB !== undefined ? toNum(a.priceRUB) : null,
      oldPriceUZS: a?.oldPriceUZS !== undefined ? toNum(a.oldPriceUZS) : null,
      oldPriceRUB: a?.oldPriceRUB !== undefined ? toNum(a.oldPriceRUB) : null,
      hasDiscount: typeof a?.hasDiscount === "boolean" ? a.hasDiscount : null,
      collectionBadge:
        a?.collectionBadge !== undefined ? String(a.collectionBadge) : null,
      isActive: typeof a?.isActive === "boolean" ? a.isActive : null,
    };
  }

  return map;
}

export default function FavoritesClient() {
  const { region } = useRegionLang();
  const shop = useShopState();

  // ✅ keys вида productId::variantId
  const favKeys = shop.favorites;

  // ✅ ids из избранного -> в Strapi
  const productIds = useMemo(() => {
    return favKeys
      .map((key) => {
        const { productId } = shop.parseKey(String(key));
        return String(productId);
      })
      .filter(Boolean);
  }, [favKeys, shop]);

  const [priceMap, setPriceMap] = useState<Record<string, PriceEntry>>({});

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const map = await fetchPriceMap(productIds);
        if (alive) setPriceMap(map);
      } catch {
        if (alive) setPriceMap({});
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productIds.join("|")]);

  const items = useMemo(() => {
    return favKeys
      .map((key) => {
        const k = String(key);
        const { productId, variantId } = shop.parseKey(k);

        const p = CATALOG_BY_ID.get(String(productId));
        if (!p) return null;

        const variants: VariantAny[] = Array.isArray((p as any).variants)
          ? ((p as any).variants as VariantAny[])
          : [];

        const variant =
          variantId && variantId !== "base"
            ? (variants.find((v) => String(v.id) === String(variantId)) ?? null)
            : null;

        // ✅ базовая цена: сначала Strapi, потом моки
        const pe = priceMap[String(productId)];

        const baseFromStrapi =
          region === "uz"
            ? Number(pe?.priceUZS ?? 0)
            : Number(pe?.priceRUB ?? 0);

        const baseFromMock =
          region === "uz"
            ? Number((p as any).price_uzs ?? (p as any).priceUZS ?? 0)
            : Number((p as any).price_rub ?? (p as any).priceRUB ?? 0);

        const basePrice =
          Number.isFinite(baseFromStrapi) && baseFromStrapi > 0
            ? baseFromStrapi
            : Number(baseFromMock ?? 0) || 0;

        const deltaRaw =
          region === "uz"
            ? Number(variant?.priceDeltaUZS ?? 0)
            : Number(variant?.priceDeltaRUB ?? 0);

        const delta = Number(deltaRaw ?? 0) || 0;

        const price = basePrice + delta;

        const variantTitle = variant?.title ? String(variant.title) : null;

        // ✅ картинка варианта, если есть
        const image =
          (variant?.image ? String(variant.image) : "") || (p as any).image;

        // ✅ title можно тоже взять из price-entry
        const title = String(pe?.title ?? (p as any).title ?? "");

        return {
          key: k,
          productId: String(productId),
          variantId: String(variantId),
          variantTitle,
          product: { ...(p as any), title } as any,
          price,
          image: String(image || ""),
        };
      })
      .filter(Boolean) as Array<{
      key: string;
      productId: string;
      variantId: string;
      variantTitle: string | null;
      product: (typeof CATALOG_MOCK)[number];
      price: number;
      image: string;
    }>;
  }, [favKeys, region, shop, priceMap]);

  // ✅ РЕКОМЕНДАЦИИ (FIX hydration):
  const [recommended, setRecommended] = useState<
    Array<(typeof CATALOG_MOCK)[number]>
  >([]);

  useEffect(() => {
    const set = new Set(favKeys.map((k) => shop.parseKey(String(k)).productId));
    const pool = CATALOG_MOCK.filter((p) => !set.has(String(p.id)));

    const ids = pool.map((x) => String(x.id)).join("|");
    const seedKey = `lioneto:favorites:recommended:${hashString(ids)}`;

    let seed = 1;
    try {
      const stored = sessionStorage.getItem(seedKey);
      if (stored) seed = Number(stored) || 1;
      else {
        seed = Math.floor(Math.random() * 1_000_000_000) + 1;
        sessionStorage.setItem(seedKey, String(seed));
      }
    } catch {
      seed = hashString(seedKey) || 1;
    }

    setRecommended(seededShuffle(pool, seed).slice(0, 3));
  }, [favKeys, shop]);

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
            className="cursor-pointer inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-black/75 hover:text-black hover:border-black/20 transition"
            title="Очистить избранное"
          >
            <Trash2 className="h-4 w-4" />
            Очистить
          </button>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        {/* LIST */}
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
                  className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-medium text-white hover:opacity-90 transition"
                >
                  В каталог <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/cart"
                  className="cursor-pointer inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-medium text-black/75 hover:text-black hover:border-black/20 transition"
                >
                  Открыть корзину <ShoppingBag className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : (
            items.map((it) => (
              <div
                key={it.key}
                className="rounded-3xl border border-black/10 bg-white p-4 md:p-5"
              >
                <div className="flex gap-4">
                  <Link
                    href={`/product/${it.productId}`}
                    className="cursor-pointer relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-black/5"
                  >
                    <SafeImage src={it.image} alt={it.product.title} />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={`/product/${it.productId}`}
                          className="cursor-pointer block truncate text-base font-medium tracking-[-0.01em] hover:underline"
                        >
                          {it.product.title}
                        </Link>

                        {it.variantTitle && it.variantId !== "base" ? (
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
                        className="cursor-pointer inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-black/65 hover:text-black hover:border-black/20 transition"
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
                        href={`/product/${it.productId}`}
                        className="cursor-pointer inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black/75 hover:text-black hover:border-black/20 transition"
                      >
                        Смотреть
                      </Link>

                      <button
                        type="button"
                        onClick={() => {
                          shop.addToCart(it.productId, 1, it.variantId);
                          window.location.href = "/cart";
                        }}
                        className="cursor-pointer inline-flex items-center justify-center rounded-full bg-black px-4 py-2 text-sm font-medium text-white hover:opacity-90 transition"
                      >
                        В корзину <ArrowRight className="ml-2 h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          // гарантированно кладём в корзину выбранный вариант
                          shop.addToCart(it.productId, 1, it.variantId);
                          window.location.href = "/checkout";
                        }}
                        className="cursor-pointer inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black/75 hover:text-black hover:border-black/20 transition"
                      >
                        Оформить заказ
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* RIGHT: RECOMMENDED */}
        <aside className="h-fit rounded-3xl border border-black/10 bg-white p-5">
          <div className="text-base font-semibold tracking-[-0.01em]">
            Рекомендуем
          </div>
          <p className="mt-1 text-sm text-black/55">Товары высокого спроса</p>

          <div className="mt-4 space-y-3">
            {recommended.map((p) => (
              <Link
                key={p.id}
                href={`/product/${p.id}`}
                className="group flex items-center gap-3 rounded-2xl border border-black/10 bg-white p-3 hover:border-black/20 transition cursor-pointer"
              >
                <div className="relative h-12 w-12 overflow-hidden rounded-xl bg-black/5 shrink-0">
                  <SafeImage src={p.image} alt={p.title} />
                </div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-medium group-hover:underline">
                    {p.title}
                  </div>
                  <div className="text-xs text-black/45">
                    {formatMoney(
                      (region === "uz"
                        ? (p as any).price_uzs
                        : (p as any).price_rub) ?? 0,
                      region,
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          <div className="mt-5">
            <Link
              href="/catalog"
              className="cursor-pointer inline-flex w-full items-center justify-center rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-medium text-black/75 hover:text-black hover:border-black/20 transition"
            >
              Ещё товары
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
