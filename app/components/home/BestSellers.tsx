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

// seeded shuffle
function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function shuffleSeeded<T>(arr: T[], seed: number) {
  const a = arr.slice();
  const rnd = mulberry32(seed);
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function getSeedEveryLoad() {
  return Math.floor(Math.random() * 2_147_483_647) + 1;
}
function mapBrandLabel(brand: string) {
  const b = brand.trim().toLowerCase();
  if (b === "scandi") return "SCANDY";
  return b ? b.toUpperCase() : "";
}

type PriceEntry = {
  productId: string | number; // ✅ slug или number
  title?: string; // ✅ берём название из Strapi (приоритет)
  priceUZS: number;
  priceRUB: number;
  collectionBadge?: string;
  isActive?: boolean;
};

type HitUIItem = {
  id: string;
  title: string;
  href: string;
  image: string;

  price_rub: number;
  price_uzs: number;

  badge: string;
  skuLabel?: string;

  brandLabel?: string;
};

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

// ✅ главное: найти товар по id ИЛИ по slug/productId поля в моках
function resolveProduct(productId: string | number) {
  const s = String(productId ?? "").trim();
  if (!s) return null;

  // если строка — число, пробуем по id
  const n = Number(s);
  if (Number.isFinite(n) && n > 0) {
    const byId = (CATALOG_MOCK as any[]).find((p) => Number(p.id) === n);
    if (byId) return byId;
  }

  // иначе ищем по возможным полям slug/productId
  return (CATALOG_MOCK as any[]).find((p) => {
    const a = String(p.productId ?? "").trim();
    const b = String(p.slug ?? "").trim();
    const c = String(p.handle ?? "").trim();
    const d = String(p.id ?? "").trim();
    return a === s || b === s || c === s || d === s;
  });
}

export default function BestSellers({
  title = "Хит продаж",
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

  const list = useMemo<HitUIItem[]>(() => {
    if (!priceEntries.length) return [];

    const hits = priceEntries.filter(
      (e) => e.isActive && e.collectionBadge === "Хит продаж",
    );
    if (!hits.length) return [];

    const items = hits
      .map((entry) => {
        const product = resolveProduct(entry.productId);
        if (!product) return null;

        const brandRaw = String(product.brand ?? "")
          .replace(/[-_]+/g, " ")
          .trim();
        const brandLabel = mapBrandLabel(brandRaw) || undefined;

        // ✅ Title: приоритет Strapi -> fallback на мок
        const displayTitle = String(
          (entry.title ?? "").trim() || (product.title ?? "").trim() || "",
        );

        return {
          id: String(product.id),
          title: displayTitle,
          href: `/product/${product.id}`,
          image: String(product.image ?? ""),

          price_rub: Number(entry.priceRUB ?? 0),
          price_uzs: Number(entry.priceUZS ?? 0),

          // ✅ ОСТАВЛЯЕМ "Хит продаж" как бейдж секции
          badge: entry.collectionBadge ?? "Хит продаж",
          skuLabel: `ID: ${product.id}`,
          brandLabel,
        };
      })
      .filter(Boolean) as HitUIItem[];

    const seed = getSeedEveryLoad();
    return shuffleSeeded(items, seed).slice(0, Math.min(12, items.length));
  }, [priceEntries]);

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
      const perView = w >= 1024 ? 4 : w >= 768 ? 2 : 1;
      const newPages = Math.max(1, Math.ceil(list.length / perView));
      setPages(newPages);
      setPage((p) => Math.min(p, newPages - 1));
    };

    calcPages();
    window.addEventListener("resize", calcPages);
    return () => window.removeEventListener("resize", calcPages);
  }, [list.length]);

  // desktop GSAP slide
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
      window.innerWidth >= 1024 ? 4 : window.innerWidth >= 768 ? 2 : 1;

    const shift = page * perView * (cw + gap);

    if (reducedMotion) {
      gsap.set(trackRef.current, { x: -shift });
      return;
    }

    gsap.to(trackRef.current, { x: -shift, duration: 0.9, ease: "expo.out" });
  }, [page, reducedMotion, list.length, isTouchMode]);

  // mobile scroll sync -> page
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
      const perView = w >= 1024 ? 4 : w >= 768 ? 2 : 1;
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
    const perView = w >= 1024 ? 4 : w >= 768 ? 2 : 1;

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
    const perView = w >= 1024 ? 4 : w >= 768 ? 2 : 1;

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
    const perView = w >= 1024 ? 4 : w >= 768 ? 2 : 1;

    const target = i * perView * step;
    vp.scrollTo({ left: target, behavior: "smooth" });
  };

  // hover actions (desktop only)
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

  // reveal
  useLayoutEffect(() => {
    if (!rootRef.current) return;
    if (reducedMotion) return;

    const root = rootRef.current;

    const header = root.querySelector(
      "[data-reveal='header']",
    ) as HTMLElement | null;
    const viewport = root.querySelector(
      "[data-reveal='viewport']",
    ) as HTMLElement | null;
    const dots = root.querySelector(
      "[data-reveal='dots']",
    ) as HTMLElement | null;
    const wind = root.querySelector("[data-wind]") as HTMLElement | null;

    const cards = Array.from(
      root.querySelectorAll("[data-card]"),
    ) as HTMLElement[];

    const tl = gsap.timeline({
      scrollTrigger: { trigger: root, start: "top 78%", once: true },
    });

    if (header) gsap.set(header, { autoAlpha: 0, y: 18, filter: "blur(10px)" });
    if (viewport)
      gsap.set(viewport, {
        autoAlpha: 0,
        y: 22,
        filter: "blur(12px)",
        clipPath: "inset(0 0 18% 0 round 18px)",
      });
    if (dots) gsap.set(dots, { autoAlpha: 0, y: 10, filter: "blur(8px)" });
    if (wind) gsap.set(wind, { xPercent: -140, autoAlpha: 0 });
    if (cards.length) gsap.set(cards, { y: 10, filter: "blur(6px)" });

    const tl2 = tl
      .to(
        wind,
        { autoAlpha: 1, xPercent: 140, duration: 0.85, ease: "expo.out" },
        0,
      )
      .to(
        header,
        {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.55,
          ease: "power3.out",
        },
        0.08,
      )
      .to(
        viewport,
        {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          clipPath: "inset(0 0 0% 0 round 18px)",
          duration: 0.75,
          ease: "expo.out",
        },
        0.12,
      )
      .to(
        cards,
        {
          y: 0,
          filter: "blur(0px)",
          duration: 0.55,
          ease: "power3.out",
          stagger: 0.06,
        },
        0.22,
      )
      .to(
        dots,
        {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.45,
          ease: "power3.out",
        },
        0.35,
      );

    return () => {
      tl2.kill();
      ScrollTrigger.getAll().forEach((st) => {
        if (st.trigger === root) st.kill();
      });
    };
  }, [reducedMotion, list.length]);

  return (
    <section ref={rootRef} className="w-full bg-white relative overflow-hidden">
      <div
        data-wind
        className="pointer-events-none absolute inset-y-0 -left-[40%] w-[180%]"
        style={{
          background:
            "linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.78) 45%, rgba(255,255,255,0) 100%)",
          mixBlendMode: "soft-light",
        }}
      />

      <div className="mx-auto w-full max-w-[1200px] px-4 py-12">
        <div
          data-reveal="header"
          className="flex items-center justify-between gap-4"
        >
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
                "shadow-[0_12px_34px_rgba(0,0,0,0.10)]",
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
                "shadow-[0_12px_34px_rgba(0,0,0,0.10)]",
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
          data-reveal="viewport"
          ref={viewportRef}
          className={cn(
            "mt-8",
            isTouchMode ? "overflow-x-auto" : "overflow-hidden",
            isTouchMode ? "snap-x snap-mandatory" : "",
            "[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
            "pr-0 lg:pr-[110px]",
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
              const value = currency === "RUB" ? p.price_rub : p.price_uzs;

              const snapshot = {
                title: p.title,
                href: p.href,
                imageUrl: p.image,
                sku: p.skuLabel ?? null,
                price_uzs: p.price_uzs,
                price_rub: p.price_rub,
              };

              const badgeVariant = "gold";

              return (
                <Link
                  key={`${p.id}-${idx}`}
                  href={p.href}
                  data-card
                  className={cn(
                    "group block shrink-0 cursor-pointer",
                    isTouchMode ? "snap-start" : "",
                    "w-[260px] sm:w-[270px] md:w-[300px] lg:w-[282px]",
                  )}
                >
                  <div
                    className={cn(
                      "relative flex flex-col h-full",
                      "rounded-[22px]",
                      "border border-black/10 bg-white",
                      "shadow-[0_14px_40px_rgba(0,0,0,0.07)]",
                      "transition-transform duration-300",
                      "group-hover:-translate-y-[2px]",
                      "group-hover:shadow-[0_20px_60px_rgba(0,0,0,0.10)]",
                    )}
                  >
                    <div className="relative overflow-visible rounded-t-[22px] bg-white">
                      <div className="absolute left-3 top-0.5 z-20">
                        <BadgePill text={p.badge} variant={badgeVariant} />
                      </div>

                      <div
                        data-actions
                        className="absolute right-3 top-3 z-20"
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

                      <div className="relative overflow-hidden rounded-t-[22px]">
                        <div className="relative aspect-[4/3] bg-white">
                          <Image
                            src={p.image}
                            alt={p.title}
                            fill
                            className={cn(
                              "object-cover object-center",
                              "transition-transform duration-500",
                              "group-hover:scale-[1.03]",
                            )}
                            priority={idx < 6}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="px-5 pt-3 pb-3">
                      <div className="text-[20px] font-semibold tracking-[-0.01em] text-black">
                        {formatPrice(value, currency)}
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

                      {p.brandLabel ? (
                        <div className="mt-1.5 text-[11px] tracking-[0.18em] uppercase text-black/45">
                          {p.brandLabel}
                        </div>
                      ) : (
                        <div className="mt-1.5 h-[12px]" />
                      )}
                    </div>

                    <div
                      className="pointer-events-none absolute inset-0 rounded-[22px]"
                      style={{
                        boxShadow: "inset 0 1px 0 rgba(255,255,255,0.7)",
                      }}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        <div data-reveal="dots" className="mt-6 flex justify-center gap-2">
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
