"use client";

import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { useRegionLang } from "@/app/context/region-lang";
import ProductActions from "@/app/catalog/ProductActions";
import { CATALOG_MOCK } from "@/app/lib/mock/catalog-products";

gsap.registerPlugin(ScrollTrigger);

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

function formatPrice(value: number, currency: "RUB" | "UZS") {
  try {
    const locale = currency === "RUB" ? "ru-RU" : "uz-UZ";
    return new Intl.NumberFormat(locale, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(value);
  } catch {
    return currency === "RUB"
      ? `${Math.round(value).toLocaleString("ru-RU")} ₽`
      : `${Math.round(value).toLocaleString("ru-RU")} сум`;
  }
}

type PriceEntry = {
  productId: string | number;
  title?: string;

  priceUZS: number;
  priceRUB: number;

  oldPriceUZS?: number;
  oldPriceRUB?: number;

  hasDiscount?: boolean;
  collectionBadge?: string;
  isActive?: boolean;
};

type BestPriceUIItem = {
  id: string;
  title: string;
  href: string;
  image: string;

  price_rub: number;
  price_uzs: number;

  old_price_rub?: number | null;
  old_price_uzs?: number | null;

  discountPercent?: number | null;

  badge: string;
  skuLabel?: string | null;

  brandLine?: string | null;
};

function toCapsLabel(v?: string | null) {
  const s = (v ?? "").trim();
  if (!s) return null;

  const low = s.toLowerCase();
  if (low === "scandi") return "SCANDY";
  if (low === "skandy") return "SCANDY";

  return s.toUpperCase();
}

function BestPriceBadge({
  text,
  discountPercent,
}: {
  text: string;
  discountPercent?: number | null;
}) {
  return (
    <span className="relative inline-flex h-6 items-center overflow-hidden rounded-[10px] px-2">
      <span
        className="absolute inset-0 rounded-[10px]"
        style={{
          background:
            "radial-gradient(120% 140% at 30% 20%, #E8FFF2 0%, #BFF7D6 28%, #57E39A 55%, #17B868 78%, #0C7F45 100%)",
        }}
      />
      <span
        className="absolute inset-[1px] rounded-[9px]"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.70), rgba(255,255,255,0.12))",
        }}
      />
      <span
        className="absolute inset-0 rounded-[10px]"
        style={{
          boxShadow:
            "0 0 0 1px rgba(120,255,190,0.75), 0 10px 26px rgba(12,127,69,0.20)",
        }}
      />
      <span
        className="pointer-events-none absolute -left-[60%] top-0 h-full w-[60%] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.65) 50%, transparent 100%)",
          transform: "skewX(-20deg)",
        }}
      />
      <span className="relative z-10 inline-flex items-center whitespace-nowrap text-[10px] font-semibold tracking-[0.02em] text-[#064B2A]">
        {text}
        {discountPercent ? (
          <span className="ml-1 text-[10px] text-[#064B2A]/70">
            −{discountPercent}%
          </span>
        ) : null}
      </span>
    </span>
  );
}

function resolveProduct(productId: string | number) {
  const s = String(productId ?? "").trim();
  if (!s) return null;

  const n = Number(s);
  if (Number.isFinite(n) && n > 0) {
    const byId = (CATALOG_MOCK as any[]).find((p) => Number(p.id) === n);
    if (byId) return byId;
  }

  return (CATALOG_MOCK as any[]).find((p) => {
    const a = String(p.productId ?? "").trim();
    const b = String(p.slug ?? "").trim();
    const c = String(p.handle ?? "").trim();
    const d = String(p.id ?? "").trim();
    return a === s || b === s || c === s || d === s;
  });
}

function calcDiscountPercent(price: number, old?: number | null) {
  if (!old || old <= 0) return null;
  if (!price || price <= 0) return null;
  if (old <= price) return null;
  return Math.round((1 - price / old) * 100);
}

export default function BestPrice({
  title = "Лучшая цена",
  priceEntries = [],
}: {
  title?: string;
  priceEntries?: PriceEntry[];
}) {
  const { region } = useRegionLang();
  const currency: "RUB" | "UZS" = region === "ru" ? "RUB" : "UZS";

  const rootRef = useRef<HTMLElement | null>(null);
  const viewportRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const [page, setPage] = useState(0);
  const [pages, setPages] = useState(1);
  const [isTouchMode, setIsTouchMode] = useState(false);

  const reducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  }, []);

  const list = useMemo<BestPriceUIItem[]>(() => {
    if (!priceEntries.length) return [];

    const best = priceEntries.filter(
      (e) => e.isActive && e.collectionBadge === "Лучшая цена",
    );
    if (!best.length) return [];

    const items = best
      .map((entry) => {
        const product = resolveProduct(entry.productId);
        if (!product) return null;

        const price_rub = Number(entry.priceRUB ?? 0);
        const price_uzs = Number(entry.priceUZS ?? 0);

        const old_price_rub =
          entry.oldPriceRUB != null ? Number(entry.oldPriceRUB) : null;
        const old_price_uzs =
          entry.oldPriceUZS != null ? Number(entry.oldPriceUZS) : null;

        const price = currency === "RUB" ? price_rub : price_uzs;
        const old = currency === "RUB" ? old_price_rub : old_price_uzs;

        const discountPercent = calcDiscountPercent(price, old);

        const line =
          toCapsLabel(product.collection ?? null) ||
          toCapsLabel(product.brand ?? null) ||
          null;

        const displayTitle = String(
          (entry.title ?? "").trim() || (product.title ?? "").trim() || "",
        );

        return {
          id: String(product.id),
          title: displayTitle,
          href: `/product/${product.id}`,
          image: String(product.image ?? ""),

          price_rub,
          price_uzs,

          old_price_rub,
          old_price_uzs,

          discountPercent,
          badge: "Лучшая цена",
          skuLabel: product.sku ? String(product.sku) : `ID: ${product.id}`,
          brandLine: line,
        };
      })
      .filter(Boolean) as BestPriceUIItem[];

    return items.slice(0, Math.min(10, items.length));
  }, [priceEntries, currency]);

  // touch mode
  useLayoutEffect(() => {
    const calc = () => {
      const w = window.innerWidth;
      const touch =
        w < 768 ||
        window.matchMedia?.("(pointer: coarse)")?.matches ||
        window.matchMedia?.("(hover: none)")?.matches;
      setIsTouchMode(!!touch);
    };
    calc();
    window.addEventListener("resize", calc);
    return () => window.removeEventListener("resize", calc);
  }, []);

  // pages
  useLayoutEffect(() => {
    const calcPages = () => {
      const w = window.innerWidth;
      const perView = w >= 1024 ? 3 : w >= 768 ? 2 : 1;
      const newPages = Math.max(1, Math.ceil(list.length / perView));
      setPages(newPages);
      setPage((p) => Math.min(p, newPages - 1));
    };

    calcPages();
    window.addEventListener("resize", calcPages);
    return () => window.removeEventListener("resize", calcPages);
  }, [list.length]);

  // desktop slide
  useLayoutEffect(() => {
    if (isTouchMode) return;
    if (!rootRef.current || !trackRef.current) return;

    const card = trackRef.current.querySelector(
      "[data-card]",
    ) as HTMLElement | null;
    if (!card) return;

    const gap = 24;
    const cw = card.getBoundingClientRect().width;
    const perView =
      window.innerWidth >= 1024 ? 3 : window.innerWidth >= 768 ? 2 : 1;

    const shift = page * perView * (cw + gap);

    if (reducedMotion) {
      gsap.set(trackRef.current, { x: -shift });
      return;
    }

    gsap.to(trackRef.current, { x: -shift, duration: 0.9, ease: "expo.out" });
  }, [page, reducedMotion, list.length, isTouchMode]);

  // mobile scroll sync
  useLayoutEffect(() => {
    if (!isTouchMode) return;
    const vp = viewportRef.current;
    if (!vp) return;

    const onScroll = () => {
      const card = vp.querySelector("[data-card]") as HTMLElement | null;
      if (!card) return;

      const gap = 24;
      const cw = card.getBoundingClientRect().width;
      const step = cw + gap;

      const w = window.innerWidth;
      const perView = w >= 1024 ? 3 : w >= 768 ? 2 : 1;
      const pageStep = perView * step;

      const p = Math.round(vp.scrollLeft / pageStep);
      setPage((prev) =>
        prev === p ? prev : Math.min(Math.max(p, 0), pages - 1),
      );
    };

    vp.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => vp.removeEventListener("scroll", onScroll);
  }, [isTouchMode, pages]);

  const prev = () => {
    if (!isTouchMode) return setPage((p) => Math.max(0, p - 1));

    const vp = viewportRef.current;
    if (!vp) return;

    const card = vp.querySelector("[data-card]") as HTMLElement | null;
    if (!card) return;

    const gap = 24;
    const cw = card.getBoundingClientRect().width;
    const step = cw + gap;
    const w = window.innerWidth;
    const perView = w >= 1024 ? 3 : w >= 768 ? 2 : 1;

    const target = Math.max(0, vp.scrollLeft - perView * step);
    vp.scrollTo({ left: target, behavior: "smooth" });
  };

  const next = () => {
    if (!isTouchMode) return setPage((p) => Math.min(pages - 1, p + 1));

    const vp = viewportRef.current;
    if (!vp) return;

    const card = vp.querySelector("[data-card]") as HTMLElement | null;
    if (!card) return;

    const gap = 24;
    const cw = card.getBoundingClientRect().width;
    const step = cw + gap;
    const w = window.innerWidth;
    const perView = w >= 1024 ? 3 : w >= 768 ? 2 : 1;

    const max = vp.scrollWidth - vp.clientWidth;
    const target = Math.min(max, vp.scrollLeft + perView * step);
    vp.scrollTo({ left: target, behavior: "smooth" });
  };

  const goToPage = (i: number) => {
    if (!isTouchMode) return setPage(i);

    const vp = viewportRef.current;
    if (!vp) return;

    const card = vp.querySelector("[data-card]") as HTMLElement | null;
    if (!card) return;

    const gap = 24;
    const cw = card.getBoundingClientRect().width;
    const step = cw + gap;
    const w = window.innerWidth;
    const perView = w >= 1024 ? 3 : w >= 768 ? 2 : 1;
    const target = i * perView * step;

    vp.scrollTo({ left: target, behavior: "smooth" });
  };

  // ✅ HOVER ACTIONS (как в BestSellers): на десктопе показывать только при наведении
  useLayoutEffect(() => {
    if (!rootRef.current) return;
    if (isTouchMode) return;

    const root = rootRef.current;
    const cards = Array.from(
      root.querySelectorAll("[data-card]"),
    ) as HTMLElement[];

    const cleanups: Array<() => void> = [];

    cards.forEach((card) => {
      const actions = card.querySelector(
        "[data-actions]",
      ) as HTMLElement | null;
      if (!actions) return;

      gsap.set(actions, {
        autoAlpha: 0,
        y: 10,
        filter: "blur(8px)",
        pointerEvents: "none",
      });

      const enter = () => {
        if (reducedMotion) {
          gsap.set(actions, { autoAlpha: 1, y: 0, filter: "blur(0px)" });
          actions.style.pointerEvents = "auto";
          return;
        }
        gsap.to(actions, {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.28,
          ease: "power3.out",
          onStart: () => {
            actions.style.pointerEvents = "auto";
          },
        });
      };

      const leave = () => {
        if (reducedMotion) {
          gsap.set(actions, { autoAlpha: 0, y: 10, filter: "blur(8px)" });
          actions.style.pointerEvents = "none";
          return;
        }
        gsap.to(actions, {
          autoAlpha: 0,
          y: 10,
          filter: "blur(8px)",
          duration: 0.22,
          ease: "power2.out",
          onComplete: () => {
            actions.style.pointerEvents = "none";
          },
        });
      };

      card.addEventListener("mouseenter", enter);
      card.addEventListener("mouseleave", leave);

      cleanups.push(() => {
        card.removeEventListener("mouseenter", enter);
        card.removeEventListener("mouseleave", leave);
      });
    });

    return () => cleanups.forEach((fn) => fn());
  }, [list.length, reducedMotion, isTouchMode]);

  return (
    <section
      ref={rootRef}
      className="w-full relative overflow-hidden"
      style={{ backgroundColor: "#f3f3f3" }}
    >
      <div className="mx-auto w-full max-w-[1200px] px-4 py-12">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-[30px] md:text-[36px] font-semibold tracking-[-0.02em] text-black">
            {title}
          </h2>

          <div className="flex items-center gap-2">
            <button
              onClick={prev}
              disabled={page === 0}
              className={cn(
                "h-10 w-10 rounded-full grid place-items-center",
                "border border-black/10 bg-white",
                "shadow-[0_10px_30px_rgba(0,0,0,0.08)]",
                "transition cursor-pointer",
                page === 0
                  ? "opacity-40 cursor-default"
                  : "hover:bg-black/[0.03]",
              )}
              aria-label="Назад"
            >
              <ChevronLeft className="h-5 w-5 text-black/70" />
            </button>

            <button
              onClick={next}
              disabled={page >= pages - 1}
              className={cn(
                "h-10 w-10 rounded-full grid place-items-center",
                "border border-black/10 bg-white",
                "shadow-[0_10px_30px_rgba(0,0,0,0.08)]",
                "transition cursor-pointer",
                page >= pages - 1
                  ? "opacity-40 cursor-default"
                  : "hover:bg-black/[0.03]",
              )}
              aria-label="Вперёд"
            >
              <ChevronRight className="h-5 w-5 text-black/70" />
            </button>
          </div>
        </div>

        <div
          ref={viewportRef}
          className={cn(
            "mt-8",
            isTouchMode ? "overflow-x-auto" : "overflow-hidden",
            isTouchMode ? "snap-x snap-mandatory" : "",
            "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          )}
          style={{ WebkitOverflowScrolling: "touch", scrollBehavior: "smooth" }}
        >
          <div
            ref={trackRef}
            className={cn(
              "flex gap-6 will-change-transform",
              isTouchMode ? "pr-4" : "",
            )}
            style={{ transform: "translateZ(0)" }}
          >
            {list.map((p, idx) => {
              const price = currency === "RUB" ? p.price_rub : p.price_uzs;
              const old =
                currency === "RUB" ? p.old_price_rub : p.old_price_uzs;

              const snapshot = {
                title: p.title,
                href: p.href,
                imageUrl: p.image,
                sku: p.skuLabel ?? null,
                price_uzs: p.price_uzs,
                price_rub: p.price_rub,
              };

              return (
                <Link
                  key={`${p.id}-${idx}`}
                  href={p.href}
                  data-card
                  className={cn(
                    "group block shrink-0 cursor-pointer",
                    isTouchMode ? "snap-start" : "",
                    "w-[260px] sm:w-[270px] md:w-[300px] lg:w-[360px]",
                  )}
                >
                  <div
                    className={cn(
                      "flex flex-col h-full",
                      "border border-black/10 bg-white",
                      "rounded-[18px]", // ✅ меньше округление
                      "shadow-[0_10px_30px_rgba(0,0,0,0.08)]",
                      "transition",
                      "group-hover:-translate-y-[2px]",
                      "group-hover:shadow-[0_18px_50px_rgba(0,0,0,0.10)]",
                    )}
                  >
                    {/* ✅ TOP: как в Hit продаж — снизу у картинки НЕ закругляем */}
                    <div className="relative overflow-visible rounded-t-[18px] bg-white">
                      <div className="absolute left-3 top-0.5 z-20">
                        <BestPriceBadge
                          text={p.badge}
                          discountPercent={p.discountPercent}
                        />
                      </div>

                      <div
                        data-actions
                        className="absolute right-2 top-2 z-20"
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                        }}
                      >
                        <ProductActions
                          id={p.id}
                          snapshot={snapshot}
                          onOpenSpecs={() => {
                            window.location.href = p.href;
                          }}
                        />
                      </div>

                      {/*  клипуем ТОЛЬКО картинку, и только сверху */}
                      <div className="relative overflow-hidden rounded-t-[18px]">
                        <div className="relative aspect-[4/3] bg-white">
                          <Image
                            src={p.image}
                            alt={p.title}
                            fill
                            className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
                            priority={idx < 6}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="px-5 pt-3 pb-3 min-h-[112px]">
                      <div className="flex items-baseline gap-3">
                        <div className="text-[20px] md:text-[22px] font-semibold tracking-[-0.01em] text-black">
                          {formatPrice(price, currency)}
                        </div>
                        {old && old > price ? (
                          <div className="text-[12px] text-black/40 line-through">
                            {formatPrice(old, currency)}
                          </div>
                        ) : null}
                      </div>

                      <div
                        className={cn(
                          "mt-2 text-[15px] md:text-[16px] leading-snug text-black/80",
                          "whitespace-normal break-words",
                          "line-clamp-2",
                          "min-h-[36px]",
                        )}
                        title={p.title}
                      >
                        {p.title}
                      </div>

                      <div className="mt-3 text-[11px] tracking-[0.18em] uppercase text-black/45">
                        {p.brandLine ?? "—"}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: pages }).map((_, i) => (
            <button
              key={i}
              onClick={() => goToPage(i)}
              className={cn(
                "h-2.5 w-2.5 rounded-full transition cursor-pointer",
                i === page
                  ? "bg-black/70 shadow-[0_0_0_4px_rgba(0,0,0,0.08)]"
                  : "bg-black/15 hover:bg-black/30",
              )}
              aria-label={`Страница ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
