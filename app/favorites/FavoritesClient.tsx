// app/favorites/FavoritesClient.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ArrowRight, HeartOff, ShoppingBag, Trash2, Zap } from "lucide-react";

import { useRegionLang } from "../context/region-lang";
import { useShopState } from "../context/shop-state";
import { fetchStrapiProductsMapBySlugs } from "@/app/lib/strapi/products";

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

function formatMoney(n: number, region: "uz" | "ru") {
  const v = Number.isFinite(Number(n)) ? Number(n) : 0;
  if (region === "uz") return new Intl.NumberFormat("ru-RU").format(v) + " сум";
  return new Intl.NumberFormat("ru-RU").format(v) + " ₽";
}

/** ✅ Безопасная картинка (Strapi-friendly: <img>, без next/image) */
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
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="absolute inset-0 h-full w-full object-cover"
      onError={() => setBroken(true)}
      loading="lazy"
    />
  );
}

/** ================= Strapi price-entry (client) =================
 * Ключи цен: productId может быть:
 * - "slug::variantId"
 * - "slug::base"
 * - (иногда) "slug" — оставляем как самый последний fallback
 */
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
  const data: any[] = Array.isArray(json?.data) ? json.data : [];

  const map: Record<string, PriceEntry> = {};
  for (const item of data) {
    const a = item?.attributes ?? item; // на всякий случай
    const pid = String(a?.productId ?? "").trim();
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

/** ✅ composite variant: title + delta sum + image */
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
  region: "uz" | "ru",
) {
  const raw = String(variantId ?? "").trim();
  if (!raw || raw === "base") {
    return {
      title: null as string | null,
      delta: 0,
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

  const delta = picked.reduce((acc, v) => {
    const d =
      region === "uz"
        ? Number(v?.priceDeltaUZS ?? 0)
        : Number(v?.priceDeltaRUB ?? 0);
    return acc + (Number(d ?? 0) || 0);
  }, 0);

  const image =
    picked.find((v) => Array.isArray(v.gallery) && v.gallery.length)
      ?.gallery?.[0] ??
    picked.find((v) => !!v.image)?.image ??
    null;

  return { title: title || null, delta, image };
}

export default function FavoritesClient() {
  const { region } = useRegionLang();
  const shop = useShopState();

  const favKeys = shop.favorites;

  // slugs для продуктов
  const productIds = useMemo(() => {
    return favKeys
      .map((key) => shop.parseKey(String(key)).productId)
      .map((x) => String(x))
      .filter(Boolean);
  }, [favKeys, shop]);

  // ✅ ключи цен: slug::variantId + slug::base (и на крайняк slug)
  const priceKeys = useMemo(() => {
    const keys: string[] = [];
    for (const k of favKeys) {
      const { productId, variantId } = shop.parseKey(String(k));
      const pid = String(productId || "").trim();
      const vid = String(variantId || "base").trim() || "base";
      if (!pid) continue;
      keys.push(`${pid}::${vid}`);
      keys.push(`${pid}::base`);
      keys.push(pid); // самый последний fallback, если у тебя где-то так заведено
    }
    return Array.from(new Set(keys));
  }, [favKeys, shop]);

  const [priceMap, setPriceMap] = useState<Record<string, PriceEntry>>({});
  const [productsMap, setProductsMap] = useState<Record<string, any>>({});

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productIds.join("|"), priceKeys.join("|")]);

  const items = useMemo(() => {
    return favKeys
      .map((key) => {
        const k = String(key);
        const { productId, variantId } = shop.parseKey(k);

        const pid = String(productId || "").trim();
        const vid = String(variantId || "base").trim() || "base";
        const p = productsMap[pid];
        if (!pid || !p) return null;

        const variants = Array.isArray(p?.variants) ? p.variants : [];
        const resolved = resolveCompositeVariant(vid, variants, region);

        // ✅ 1) price-entry по variant
        const peVariant = priceMap[`${pid}::${vid}`];
        // ✅ 2) fallback base
        const peBase = priceMap[`${pid}::base`];
        // ✅ 3) fallback "slug"
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

        // ✅ fallback на Strapi Product base price
        const baseFromProduct =
          region === "uz" ? Number(p?.priceUZS ?? 0) : Number(p?.priceRUB ?? 0);

        const basePrice =
          (Number.isFinite(baseFromStrapi) && baseFromStrapi > 0
            ? baseFromStrapi
            : 0) ||
          (Number.isFinite(baseFromProduct) && baseFromProduct > 0
            ? baseFromProduct
            : 0) ||
          0;

        const price = (basePrice || 0) + (resolved.delta || 0);

        // title: сначала из price-entry variant/base/plain, потом product.title
        const title =
          String(
            peVariant?.title ??
              peBase?.title ??
              pePlain?.title ??
              p?.title ??
              "—",
          ) || "—";

        // image: variant.gallery[0] -> variant.image -> product.image -> product.gallery[0]
        const image =
          (resolved.image ? String(resolved.image) : "") ||
          (p?.image ? String(p.image) : "") ||
          (Array.isArray(p?.gallery) && p.gallery[0]
            ? String(p.gallery[0])
            : "");

        return {
          key: k,
          productId: pid,
          variantId: vid,
          title,
          variantTitle: resolved.title,
          price,
          image,
        };
      })
      .filter(Boolean) as Array<{
      key: string;
      productId: string;
      variantId: string;
      title: string;
      variantTitle: string | null;
      price: number;
      image: string;
    }>;
  }, [favKeys, shop, productsMap, priceMap, region]);

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
                    <SafeImage src={it.image} alt={it.title} />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={`/product/${it.productId}`}
                          className="cursor-pointer block truncate text-base font-medium tracking-[-0.01em] hover:underline"
                        >
                          {it.title}
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
                          shop.setOneClick(it.productId, 1, it.variantId);
                          window.location.href = "/checkout?mode=oneclick";
                        }}
                        className="cursor-pointer inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black/75 hover:text-black hover:border-black/20 transition"
                      >
                        Купить в 1 клик <Zap className="ml-2 h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <aside className="h-fit rounded-3xl border border-black/10 bg-white p-5">
          <div className="text-base font-semibold tracking-[-0.01em]">
            Рекомендуем
          </div>
          <p className="mt-1 text-sm text-black/55">
            Это включим на Strapi в следующем шаге (related).
          </p>

          <div className="mt-5">
            <Link
              href="/catalog"
              className="cursor-pointer inline-flex w-full items-center justify-center rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-medium text-black/75 hover:text-black hover:border-black/20 transition"
            >
              В каталог
            </Link>
          </div>
        </aside>
      </div>
    </main>
  );
}
