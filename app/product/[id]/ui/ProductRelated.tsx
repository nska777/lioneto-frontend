"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";

import ProductActions from "@/app/catalog/ProductActions";

import { useShopState } from "@/app/context/shop-state";
import { formatPrice } from "@/app/lib/format/price";

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

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

/* ================= Badge (reuse style from CatalogCard) ================= */

function GreenPremiumBadge({ text }: { text: string }) {
  return (
    <span className="relative inline-flex h-7 items-center overflow-hidden rounded-[12px] px-3">
      <span
        className="absolute inset-0 rounded-[12px]"
        style={{
          background:
            "radial-gradient(120% 140% at 30% 20%, #E8FFF2 0%, #BFF7D6 28%, #57E39A 55%, #17B868 78%, #0C7F45 100%)",
        }}
      />
      <span
        className="absolute inset-[1px] rounded-[11px]"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.62), rgba(255,255,255,0.10))",
        }}
      />
      <span
        className="absolute inset-0 rounded-[12px]"
        style={{
          boxShadow:
            "0 0 0 1px rgba(120,255,190,0.85), 0 10px 28px rgba(12,127,69,0.22)",
        }}
      />
      <span
        className="pointer-events-none absolute -left-[60%] top-0 h-full w-[60%] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.70) 50%, transparent 100%)",
          transform: "skewX(-20deg)",
        }}
      />
      <span className="relative z-10 text-[12px] font-semibold tracking-[0.04em] text-[#064B2A]">
        {text}
      </span>
    </span>
  );
}

/* ================= Component ================= */

export default function ProductRelated({
  title,
  items,
  currency,
}: {
  title: string;
  items: Array<{
    id: string;
    title: string;
    image: string;
    price_rub: number;
    price_uzs: number;
    href: string;
    badge?: string;
    sku?: string;
  }>;
  currency: "RUB" | "UZS";
}) {
  const shop = useShopState();
  const { addToCart, isInCart } = shop;

  // ✅ Избранное: "как положено" — toggleFav + isFav если есть
  const toggleFav = (shop as any).toggleFav as
    | ((productId: string, variantId?: string) => void)
    | undefined;

  const isFavFn = (shop as any).isFav as
    | ((productId: string, variantId?: string) => boolean)
    | undefined;

  const favoritesArr = (shop as any).favorites as string[] | undefined;
  const parseKey = (shop as any).parseKey as
    | ((key: string) => { productId: string; variantId: string })
    | undefined;

  const isFavFallback = (productId: string, variantId = "base") => {
    if (!favoritesArr?.length || !parseKey) return false;
    return favoritesArr.some((k) => {
      const parsed = parseKey(String(k));
      return (
        String(parsed.productId) === String(productId) &&
        String(parsed.variantId || "base") === String(variantId || "base")
      );
    });
  };

  const isFav = (productId: string, variantId = "base") => {
    if (isFavFn) return !!isFavFn(productId, variantId);
    return isFavFallback(productId, variantId);
  };

  // ✅ стабильный рандом внутри сессии
  const [seed, setSeed] = useState(0);

  useEffect(() => {
    const ids = (items || []).map((x) => String(x.id)).join("|");
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

  const orderedItems = useMemo(() => {
    if (!items?.length) return [];
    if (!seed) return items;
    return seededShuffle(items, seed);
  }, [items, seed]);

  return (
    <section className="mt-12">
      <h2 className="text-[20px] font-semibold text-black">{title}</h2>

      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {orderedItems.map((p, idx) => {
          const v = currency === "RUB" ? p.price_rub : p.price_uzs;

          const imgSrc = String(p.image ?? "").trim() || "/placeholder.png";
          const href = p.href || `/product/${p.id}`;

          const catalogPath =
            typeof window !== "undefined"
              ? window.location.pathname + window.location.search
              : "/catalog";

          const hrefWithFrom = href.includes("?")
            ? `${href}&from=${encodeURIComponent(catalogPath)}`
            : `${href}?from=${encodeURIComponent(catalogPath)}`;

          const snapshot = {
            title: p.title,
            href: hrefWithFrom,
            imageUrl: imgSrc,
            sku: p.sku ? String(p.sku) : null,
            price_uzs: Number(p.price_uzs ?? 0),
            price_rub: Number(p.price_rub ?? 0),
          };

          const added = isInCart(String(p.id));
          const liked = isFav(String(p.id), "base");

          return (
            <article
              key={p.id}
              data-card
              className={cn(
                "group h-full overflow-hidden rounded-2xl",
                "border border-black/10 bg-white",
                "shadow-[0_10px_30px_rgba(0,0,0,0.06)]",
              )}
            >
              <Link href={hrefWithFrom} className="flex h-full flex-col">
                {/* IMAGE (like CatalogCard) */}
                <div className="relative aspect-[16/11] overflow-hidden bg-white px-3 py-2">
                  <Image
                    key={imgSrc}
                    src={imgSrc}
                    alt={String(p.title ?? "")}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className={cn(
                      "object-contain object-center",
                      "transition-transform duration-500",
                      "group-hover:scale-[1.02]",
                    )}
                    priority={idx < 6}
                  />

                  {p.badge ? (
                    <div className="absolute left-3 top-3 z-10">
                      <GreenPremiumBadge text={String(p.badge)} />
                    </div>
                  ) : null}

                  {/* Hover actions: reuse ProductActions (fav + cart) */}
                  <div className="absolute right-3 top-3 z-10 flex translate-y-[-6px] gap-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
                    <div
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <ProductActions
                        id={String(p.id)}
                        snapshot={snapshot}
                        onOpenSpecs={() => {
                          window.location.href = hrefWithFrom;
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* CONTENT */}
                <div className="flex flex-1 flex-col px-4 pt-3 pb-3">
                  <div
                    className="overflow-hidden text-[14px] font-medium leading-[20px] text-black/90"
                    style={{
                      display: "-webkit-box",
                      WebkitBoxOrient: "vertical" as any,
                      WebkitLineClamp: 2,
                      maxHeight: 40,
                    }}
                  >
                    {p.title}
                  </div>

                  <div className="mt-2 text-[15px] font-semibold text-black">
                    {formatPrice(Number(v ?? 0), currency)}
                  </div>

                  {/* BUTTON (same as CatalogCard) */}
                  <div className="mt-auto pt-3">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!added) addToCart(String(p.id), 1);
                      }}
                      className={cn(
                        "lionetoCartBtn relative h-10 w-full overflow-hidden rounded-xl",
                        "inline-flex items-center justify-center",
                        "text-[12px] font-semibold tracking-[0.14em] uppercase",
                        "transition cursor-pointer",
                        "active:scale-[0.99]",
                        added ? "isAdded" : "isIdle",
                      )}
                      aria-label={
                        added ? "Добавлено в корзину" : "Добавить в корзину"
                      }
                    >
                      <span className="bgSlide pointer-events-none absolute inset-0 opacity-0" />
                      <span className="glass pointer-events-none absolute inset-[1px] rounded-[11px] opacity-0" />
                      <span className="shine pointer-events-none absolute -left-[60%] top-0 h-full w-[55%] opacity-0" />
                      <span className="relative z-10">
                        {added ? "Добавлено" : "В корзину"}
                      </span>
                    </button>

                    <style jsx>{`
                      .lionetoCartBtn.isIdle {
                        border: 1px solid rgba(0, 0, 0, 0.14);
                        color: rgba(0, 0, 0, 0.82);
                        background: rgba(255, 255, 255, 0.72);
                        box-shadow:
                          inset 0 1px 0 rgba(255, 255, 255, 0.9),
                          0 10px 26px rgba(0, 0, 0, 0.06);
                        backdrop-filter: blur(10px);
                      }
                      .lionetoCartBtn.isIdle:hover {
                        border-color: rgba(215, 181, 107, 0.72);
                        color: rgba(0, 0, 0, 0.92);
                      }

                      .lionetoCartBtn.isAdded {
                        border: 1px solid rgba(215, 181, 107, 0.75);
                        color: rgba(90, 58, 0, 0.92);
                        background: radial-gradient(
                          120% 140% at 30% 20%,
                          rgba(255, 241, 184, 0.98) 0%,
                          rgba(255, 211, 106, 0.92) 35%,
                          rgba(230, 169, 60, 0.86) 65%,
                          rgba(201, 138, 26, 0.82) 100%
                        );
                        box-shadow:
                          inset 0 1px 0 rgba(255, 255, 255, 0.65),
                          0 14px 34px rgba(201, 138, 26, 0.22);
                      }
                      .lionetoCartBtn.isAdded {
                        cursor: default;
                      }
                      .lionetoCartBtn.isAdded .bgSlide,
                      .lionetoCartBtn.isAdded .glass,
                      .lionetoCartBtn.isAdded .shine {
                        display: none;
                      }

                      .lionetoCartBtn .bgSlide {
                        background: linear-gradient(
                          90deg,
                          rgba(255, 241, 184, 0) 0%,
                          rgba(255, 241, 184, 0.9) 18%,
                          rgba(255, 211, 106, 0.9) 40%,
                          rgba(230, 169, 60, 0.86) 62%,
                          rgba(201, 138, 26, 0.84) 82%,
                          rgba(255, 241, 184, 0) 100%
                        );
                        background-size: 240% 100%;
                        background-position: 0% 50%;
                      }
                      .lionetoCartBtn .glass {
                        background: linear-gradient(
                          180deg,
                          rgba(255, 255, 255, 0.55),
                          rgba(255, 255, 255, 0.08)
                        );
                      }
                      .lionetoCartBtn .shine {
                        background: linear-gradient(
                          120deg,
                          transparent 0%,
                          rgba(255, 255, 255, 0.92) 50%,
                          transparent 100%
                        );
                        transform: skewX(-18deg);
                      }

                      .lionetoCartBtn.isIdle:hover .bgSlide {
                        opacity: 1;
                        animation: lioneto_bgSlide 900ms ease-out forwards;
                      }
                      .lionetoCartBtn.isIdle:hover .glass {
                        opacity: 1;
                        transition: opacity 180ms ease;
                      }
                      .lionetoCartBtn.isIdle:hover .shine {
                        opacity: 1;
                        animation: lioneto_shineSlide 900ms ease-out forwards;
                      }

                      @keyframes lioneto_bgSlide {
                        0% {
                          background-position: 0% 50%;
                        }
                        100% {
                          background-position: 100% 50%;
                        }
                      }
                      @keyframes lioneto_shineSlide {
                        0% {
                          transform: translateX(0) skewX(-18deg);
                          opacity: 0;
                        }
                        10% {
                          opacity: 1;
                        }
                        100% {
                          transform: translateX(260%) skewX(-18deg);
                          opacity: 0;
                        }
                      }
                    `}</style>

                    {/* ✅ “как положено” избранное: отдельная кнопка-подпись (не ломаем ProductActions) */}
                    {toggleFav ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleFav(String(p.id), "base");
                        }}
                        style={{ cursor: "pointer" }}
                      ></button>
                    ) : null}
                  </div>
                </div>
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
