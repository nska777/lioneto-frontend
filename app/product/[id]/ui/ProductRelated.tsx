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

function isRemoteSrc(src: string) {
  return /^https?:\/\//i.test(src);
}

function isLocalhostUrl(src: string) {
  try {
    const u = new URL(src);
    return (
      u.hostname === "localhost" ||
      u.hostname === "127.0.0.1" ||
      u.hostname === "::1"
    );
  } catch {
    return false;
  }
}

/* ================= Badge (SAME as BestSellers) ================= */

function BadgePill({
  text,
  variant,
}: {
  text: string;
  variant: "gold" | "green";
}) {
  const isGreen = variant === "green";

  return (
    <span className="relative inline-flex h-5 items-center overflow-hidden rounded-[12px] px-3">
      <span
        className="absolute inset-0 rounded-[12px]"
        style={{
          background: isGreen
            ? "radial-gradient(120% 140% at 30% 20%, #E8FFF2 0%, #BFF7D6 28%, #57E39A 55%, #17B868 78%, #0C7F45 100%)"
            : "radial-gradient(120% 140% at 30% 20%, #FFF1B8 0%, #FFD36A 35%, #E6A93C 65%, #C98A1A 100%)",
        }}
      />
      <span
        className="absolute inset-[1px] rounded-[11px]"
        style={{
          background: isGreen
            ? "linear-gradient(180deg, rgba(255,255,255,0.62), rgba(255,255,255,0.10))"
            : "linear-gradient(180deg, rgba(255,255,255,0.55), rgba(255,255,255,0.12))",
        }}
      />
      <span
        className="absolute inset-0 rounded-[12px]"
        style={{
          boxShadow: isGreen
            ? "0 0 0 1px rgba(120, 255, 190, 0.85), 0 10px 28px rgba(12, 127, 69, 0.28)"
            : "0 0 0 1px rgba(255,215,130,0.85), 0 10px 28px rgba(201,138,26,0.35)",
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
      <span
        className={cn(
          "relative z-10 text-[12px] font-semibold tracking-[0.04em]",
          isGreen ? "text-[#064B2A]" : "text-[#5A3A00]",
        )}
      >
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
    id: string; // может быть slug
    title: string;
    image: string;
    price_rub: number;
    price_uzs: number;
    href?: string;
    badge?: string;
    sku?: string;

    // optional, если ты начнёшь прокидывать
    slug?: string;
    productId?: string;
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

      <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {orderedItems.map((p, idx) => {
          // ✅ единый ключ товара (важно для корзины/избранного после ухода от моков)
          const pid = String(p.productId ?? p.slug ?? p.id ?? "").trim();

          const v = currency === "RUB" ? p.price_rub : p.price_uzs;

          const imgSrc = String(p.image ?? "").trim() || "/placeholder.png";
          const href = String(p.href ?? `/product/${encodeURIComponent(pid)}`);

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

          const added = isInCart(pid);
          const liked = isFav(pid, "base");

          const badgeVariant: "gold" | "green" = "gold";

          return (
            <article key={pid || p.id} data-card className="group h-full">
              <Link href={hrefWithFrom} className="block h-full">
                <div
                  className={cn(
                    "relative flex h-full flex-col",
                    "rounded-[22px]",
                    "border border-black/10 bg-white",
                    "shadow-[0_14px_40px_rgba(0,0,0,0.07)]",
                    "transition-transform duration-300",
                    "group-hover:-translate-y-[2px]",
                    "group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.10)]",
                    "overflow-hidden",
                  )}
                >
                  <div className="relative overflow-visible rounded-t-[22px] bg-white">
                    {p.badge ? (
                      <div className="absolute left-3 top-0.5 z-20">
                        <BadgePill
                          text={String(p.badge)}
                          variant={badgeVariant}
                        />
                      </div>
                    ) : null}

                    <div
                      data-actions
                      className={cn(
                        "absolute right-3 top-3 z-20",
                        "opacity-0 translate-y-2 pointer-events-none",
                        "transition-all duration-300 ease-out",
                        "group-hover:opacity-100 group-hover:translate-y-0 group-hover:pointer-events-auto",
                      )}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                    >
                      <ProductActions
                        id={pid}
                        snapshot={snapshot}
                        onOpenSpecs={() => {
                          window.location.href = hrefWithFrom;
                        }}
                      />
                    </div>

                    <div className="relative overflow-hidden rounded-t-[22px]">
                      <div className="relative aspect-[4/3] bg-white">
                        {/* ✅ ВАЖНО: remote/localhost картинки лучше рендерить <img>,
                            чтобы не ловить "private ip" от next/image в dev */}
                        {isRemoteSrc(imgSrc) && isLocalhostUrl(imgSrc) ? (
                          <img
                            src={imgSrc}
                            alt={String(p.title ?? "")}
                            className={cn(
                              "absolute inset-0 h-full w-full",
                              "object-cover object-center",
                              "transition-transform duration-500",
                              "group-hover:scale-[1.03]",
                            )}
                            loading={idx < 6 ? "eager" : "lazy"}
                          />
                        ) : (
                          <Image
                            key={imgSrc}
                            src={imgSrc}
                            alt={String(p.title ?? "")}
                            fill
                            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
                            className={cn(
                              "object-cover object-center",
                              "transition-transform duration-500",
                              "group-hover:scale-[1.03]",
                            )}
                            priority={idx < 6}
                          />
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="px-5 pt-3 pb-3">
                    <div className="text-[20px] font-semibold tracking-[-0.01em] text-black">
                      {formatPrice(Number(v ?? 0), currency)}
                    </div>

                    <div
                      className={cn(
                        "mt-1 text-[14px] leading-snug text-black/70",
                        "whitespace-normal break-words",
                        "line-clamp-2",
                        "min-h-[40px]",
                      )}
                      title={p.title}
                    >
                      {p.title}
                    </div>

                    <div className="mt-1.5 h-[12px]" />
                  </div>

                  <div className="mt-auto px-5 pb-4">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        if (!added) addToCart(pid, 1);
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

                    {toggleFav ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          toggleFav(pid, "base");
                        }}
                        style={{ cursor: "pointer" }}
                        aria-label={
                          liked ? "Убрать из избранного" : "В избранное"
                        }
                        className="sr-only"
                      >
                        {liked ? "liked" : "not-liked"}
                      </button>
                    ) : null}
                  </div>

                  <div
                    className="pointer-events-none absolute inset-0 rounded-[22px]"
                    style={{
                      boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)",
                    }}
                  />
                </div>
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
