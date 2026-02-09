"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

import { useRegionLang } from "@/app/context/region-lang";
import { CATALOG_MOCK } from "@/app/lib/mock/catalog-products";
import { COLLECTIONS_HOTSPOTS } from "@/app/lib/mock/collections-hotspots";

gsap.registerPlugin(ScrollTrigger);

type StrapiImage = {
  url: string;
  alternativeText?: string | null;
  width?: number | null;
  height?: number | null;
};

type Hotspot = {
  id: string;
  productId: string; // id из CATALOG_MOCK
  xPct: number; // 0..100
  yPct: number; // 0..100
  side?: "left" | "right"; // опционально
};

export type CollectionItem = {
  id: string | number;
  title: string;
  description?: string;
  images: StrapiImage[];
  href?: string;

  // точки по фото: ключ = индекс картинки (activeImage)
  hotspots?: Record<number, Hotspot[]>;
};

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

function clampIndex(i: number, len: number) {
  if (len <= 0) return 0;
  return ((i % len) + len) % len;
}

export function resolveSrc(url?: string) {
  if (!url) return "";
  if (url.startsWith("http")) return url;

  // public paths: /images/... or /mock/... etc.
  if (url.startsWith("/")) {
    // Strapi relative: /uploads/...
    if (url.startsWith("/uploads")) {
      const raw = (process.env.NEXT_PUBLIC_STRAPI_URL || "").trim();

      // ✅ если Strapi не настроен — не отдаём битый url
      if (!raw) return "";

      const isLocal =
        raw.includes("localhost") ||
        raw.includes("127.0.0.1") ||
        raw.includes("0.0.0.0");

      // ✅ ЖЕЛЕЗНО: если base локальный — НЕ используем его (иначе Vercel падает)
      // Локально у тебя просто будут не грузиться uploads, пока не настроишь Strapi домен.
      if (isLocal) return "";

      return `${raw}${url}`;
    }

    // обычный абсолютный путь из public
    return url;
  }

  // fallback
  return `/${url}`;
}

/**
 * ✅ Безопасный helper для next/image
 * next/image НЕЛЬЗЯ кормить пустым src
 */
export function safeResolveSrc(url?: string): string | null {
  const src = resolveSrc(url);
  return src && src.trim().length > 0 ? src : null;
}

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

export default function CollectionsSlider({
  collections,
}: {
  collections: CollectionItem[];
}) {
  const { region } = useRegionLang();
  const currency: "RUB" | "UZS" = region === "ru" ? "RUB" : "UZS";

  const rootRef = useRef<HTMLElement | null>(null);
  const cardRef = useRef<HTMLDivElement | null>(null);

  const safeCollections = useMemo(
    () => (collections || []).filter((c) => c?.images?.length),
    [collections],
  );

  const [activeCollection, setActiveCollection] = useState(0);
  const [activeImage, setActiveImage] = useState(0);

  const [lightboxOpen, setLightboxOpen] = useState(false);

  // ✅ состояние открытой точки
  const [openHotspotId, setOpenHotspotId] = useState<string | null>(null);

  // ✅ hover-bridge: чтобы можно было уйти мышкой с зоны хотспота на карточку
  const closeT = useRef<number | null>(null);

  const cancelClose = () => {
    if (closeT.current) {
      window.clearTimeout(closeT.current);
      closeT.current = null;
    }
  };

  const scheduleClose = () => {
    cancelClose();
    closeT.current = window.setTimeout(() => {
      setOpenHotspotId(null);
    }, 180);
  };

  // manual hold timer refs (чтобы не залипало)
  const manualHoldRef = useRef(false);
  const holdTimeoutRef = useRef<number | null>(null);

  const holdFor = (ms = 2500) => {
    manualHoldRef.current = true;
    if (holdTimeoutRef.current) window.clearTimeout(holdTimeoutRef.current);
    holdTimeoutRef.current = window.setTimeout(() => {
      manualHoldRef.current = false;
      holdTimeoutRef.current = null;
    }, ms);
  };

  const productById = useMemo(() => {
    const map = new Map<string, any>();
    (CATALOG_MOCK ?? []).forEach((p: any) => map.set(String(p.id), p));
    return map;
  }, []);

  const current = safeCollections[activeCollection];
  const currentImages = current?.images || [];
  const currentImg = currentImages[activeImage];

  const currentHeroSrc = useMemo(
    () => safeResolveSrc(currentImg?.url),
    [currentImg?.url],
  );

  const hotspots: Hotspot[] = useMemo(() => {
    const key = String(current?.id);
    if (!key) return [];
    return COLLECTIONS_HOTSPOTS[key]?.[activeImage] ?? [];
  }, [current?.id, activeImage]);

  const activeHotspot = openHotspotId
    ? hotspots.find((h) => h.id === openHotspotId) || null
    : null;

  const activeProduct = activeHotspot
    ? productById.get(String(activeHotspot.productId))
    : null;

  // Reveal лёгкий
  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const title = root.querySelector("[data-col-title]");
      const wrap = root.querySelector("[data-col-wrap]");
      const thumbs = root.querySelector("[data-col-thumbs]");

      gsap.set([title, wrap, thumbs], { autoAlpha: 0, y: 10 });

      gsap
        .timeline({
          scrollTrigger: {
            trigger: root,
            start: "top 78%",
            toggleActions: "play none none reverse",
          },
          defaults: { ease: "power3.out" },
        })
        .to(title, { autoAlpha: 1, y: 0, duration: 0.5 })
        .to(wrap, { autoAlpha: 1, y: 0, duration: 0.6 }, "-=0.25")
        .to(thumbs, { autoAlpha: 1, y: 0, duration: 0.5 }, "-=0.35");
    }, root);

    return () => ctx.revert();
  }, []);

  // смена коллекции -> сброс фото и закрытие хотспота
  useEffect(() => {
    setActiveImage(0);
    setOpenHotspotId(null);
  }, [activeCollection]);

  // смена фото -> закрыть хотспот
  useEffect(() => {
    setOpenHotspotId(null);
  }, [activeImage]);

  // ✅ анимация карточки хотспота
  useEffect(() => {
    if (!openHotspotId) return;
    if (!cardRef.current) return;

    gsap.fromTo(
      cardRef.current,
      { autoAlpha: 0, y: 10, filter: "blur(10px)", scale: 0.98 },
      {
        autoAlpha: 1,
        y: 0,
        filter: "blur(0px)",
        scale: 1,
        duration: 0.26,
        ease: "power3.out",
      },
    );
  }, [openHotspotId]);

  // Keyboard: Esc + arrows for lightbox
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (openHotspotId) setOpenHotspotId(null);
        if (lightboxOpen) setLightboxOpen(false);
      }

      if (!lightboxOpen) return;

      if (e.key === "ArrowRight") {
        holdFor(2500);
        setActiveImage((p) => clampIndex(p + 1, currentImages.length));
      }
      if (e.key === "ArrowLeft") {
        holdFor(2500);
        setActiveImage((p) => clampIndex(p - 1, currentImages.length));
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightboxOpen, currentImages.length, openHotspotId]);

  // ✅ закрытие хотспот-карточки кликом вне
  useEffect(() => {
    const onDown = (e: MouseEvent) => {
      if (!openHotspotId) return;

      const target = e.target as HTMLElement | null;
      if (!target) return;

      // клик по точке — пусть обработает сама точка
      if (target.closest?.("[data-hotspot]")) return;

      // клик внутри карточки — не закрываем
      if (cardRef.current && cardRef.current.contains(target)) return;

      setOpenHotspotId(null);
    };

    window.addEventListener("mousedown", onDown);
    return () => window.removeEventListener("mousedown", onDown);
  }, [openHotspotId]);

  // cleanup hold timeout
  useEffect(() => {
    return () => {
      if (holdTimeoutRef.current) window.clearTimeout(holdTimeoutRef.current);
      if (closeT.current) window.clearTimeout(closeT.current);
    };
  }, []);

  if (!safeCollections.length) return null;

  const goPrevCollection = () => {
    holdFor();
    setActiveCollection((p) => clampIndex(p - 1, safeCollections.length));
  };
  const goNextCollection = () => {
    holdFor();
    setActiveCollection((p) => clampIndex(p + 1, safeCollections.length));
  };

  const goPrevImage = () => {
    holdFor();
    setActiveImage((p) => clampIndex(p - 1, currentImages.length));
  };
  const goNextImage = () => {
    holdFor();
    setActiveImage((p) => clampIndex(p + 1, currentImages.length));
  };

  // ✅ позиционирование карточки: авто влево/вправо по x
  const computedSide: "left" | "right" =
    activeHotspot?.side ??
    (activeHotspot && activeHotspot.xPct > 58 ? "left" : "right");

  const activePriceRaw =
    activeProduct &&
    Number(
      currency === "RUB"
        ? (activeProduct.priceRUB ?? activeProduct.price_rub ?? 0)
        : (activeProduct.priceUZS ?? activeProduct.price_uzs ?? 0),
    );

  return (
    <section
      ref={rootRef}
      className="w-full px-0 pb-10 pt-10 md:pb-14 md:pt-14"
      aria-label="Коллекции"
    >
      <div className="mx-auto w-full max-w-[1200px] px-4">
        {/* Header */}
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="text-[11px] tracking-[0.22em] text-black/45">
              LIONETO • COLLECTIONS
            </div>
            <h2
              data-col-title
              className="mt-2 text-[28px] font-semibold leading-[1.06] tracking-[-0.02em] text-black md:text-[40px]"
            >
              Коллекции
            </h2>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <button
              type="button"
              aria-label="Предыдущая коллекция"
              onClick={goPrevCollection}
              className={cn(
                "grid h-10 w-10 place-items-center rounded-full",
                "border border-black/10 bg-white",
                "shadow-[0_10px_28px_rgba(0,0,0,0.06)]",
                "transition hover:-translate-y-[1px] hover:shadow-[0_14px_36px_rgba(0,0,0,0.08)]",
                "active:translate-y-0",
              )}
              style={{ cursor: "pointer" }}
            >
              <ChevronLeft className="h-5 w-5 text-black/70" />
            </button>
            <button
              type="button"
              aria-label="Следующая коллекция"
              onClick={goNextCollection}
              className={cn(
                "grid h-10 w-10 place-items-center rounded-full",
                "border border-black/10 bg-white",
                "shadow-[0_10px_28px_rgba(0,0,0,0.06)]",
                "transition hover:-translate-y-[1px] hover:shadow-[0_14px_36px_rgba(0,0,0,0.08)]",
                "active:translate-y-0",
              )}
              style={{ cursor: "pointer" }}
            >
              <ChevronRight className="h-5 w-5 text-black/70" />
            </button>
          </div>
        </div>

        {/* Main */}
        <div data-col-wrap className="mt-6 md:mt-8">
          <div
            className={cn(
              "relative w-full overflow-visible rounded-2xl",
              "border border-black/10 bg-white",
              "shadow-[0_22px_60px_rgba(0,0,0,0.08)]",
            )}
          >
            {/* ✅ обрезаем только картинку */}
            <div className="relative overflow-hidden rounded-2xl">
              {/* ✅ outer НЕ button (внутри есть button hotspots) */}
              <div
                role="button"
                tabIndex={0}
                onClick={() => {
                  holdFor();
                  setLightboxOpen(true);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    holdFor();
                    setLightboxOpen(true);
                  }
                }}
                className="relative block w-full"
                style={{ cursor: "pointer" }}
              >
                <div
                  className="
                    relative w-full
                    h-[420px]
                    sm:h-[480px]
                    md:h-[560px]
                    lg:h-[640px]
                    xl:h-[720px]
                  "
                >
                  {currentHeroSrc ? (
                    <Image
                      src={currentHeroSrc}
                      alt={currentImg?.alternativeText || current.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 1200px"
                      className="object-cover"
                      priority
                    />
                  ) : (
                    <div className="absolute inset-0 bg-black/5" />
                  )}

                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent" />

                  <div className="absolute left-3 top-3 rounded-full bg-white/80 px-3 py-1 text-[12px] text-black/70">
                    {activeCollection + 1}/{safeCollections.length} •{" "}
                    {activeImage + 1}/{currentImages.length}
                  </div>

                  {/* ✅ HOTSPOTS */}
                  {hotspots.map((h) => (
                    <button
                      key={`${String(current?.id)}-${activeImage}-${h.id}`}
                      type="button"
                      data-hotspot
                      onMouseEnter={() => {
                        cancelClose();
                        setOpenHotspotId(h.id);
                      }}
                      onMouseLeave={() => {
                        scheduleClose();
                      }}
                      onFocus={() => {
                        cancelClose();
                        setOpenHotspotId(h.id);
                      }}
                      onBlur={() => {
                        scheduleClose();
                      }}
                      onClick={(e) => {
                        // ✅ оставляем клик как fallback (мобилки/тач)
                        e.preventDefault();
                        e.stopPropagation();
                        setOpenHotspotId((prev) =>
                          prev === h.id ? null : h.id,
                        );
                      }}
                      className={cn(
                        // ✅ большая зона клика
                        "absolute z-[70] h-16 w-16 -translate-x-1/2 -translate-y-1/2",
                        // ✅ полностью прозрачная / невидимая
                        "bg-transparent shadow-none ring-0",
                        // ✅ курсор и доступность
                        "cursor-pointer focus:outline-none",
                        "focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent",
                      )}
                      style={{
                        left: `${h.xPct}%`,
                        top: `${h.yPct}%`,
                      }}
                      aria-label="Открыть модуль"
                    >
                      {/* ✅ маркер можно оставить, но сделать невидимым */}
                      <span className="pointer-events-none absolute inset-0 rounded-full opacity-0" />
                    </button>
                  ))}

                  {/* ✅ Карточка товара */}
                  {openHotspotId && activeHotspot && activeProduct ? (
                    <div
                      ref={cardRef}
                      className={cn(
                        "absolute z-[80]",
                        "w-[320px] max-w-[86vw]",
                        "rounded-2xl border border-white/40",
                        "bg-white/88 backdrop-blur-xl",
                        "shadow-[0_22px_70px_rgba(0,0,0,0.22)]",
                        "p-3",
                      )}
                      style={{
                        left: `${activeHotspot.xPct}%`,
                        top: `${activeHotspot.yPct}%`,
                        transform:
                          computedSide === "left"
                            ? "translate(calc(-100% - 14px), -50%)"
                            : "translate(14px, -50%)",
                      }}
                      onMouseEnter={() => cancelClose()}
                      onMouseLeave={() => scheduleClose()}
                      onMouseDown={(e) => e.stopPropagation()}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="text-[11px] tracking-[0.18em] text-black/45">
                          LIONETO • MODULE
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            setOpenHotspotId(null);
                          }}
                          className="grid h-7 w-7 place-items-center rounded-full bg-black/5 hover:bg-black/8 transition"
                          style={{ cursor: "pointer" }}
                          aria-label="Закрыть"
                        >
                          <X className="h-4 w-4 text-black/65" />
                        </button>
                      </div>

                      <Link
                        href={`/product/${activeProduct.id}`}
                        className="mt-2 block"
                        style={{ cursor: "pointer" }}
                        onClick={() => setOpenHotspotId(null)}
                      >
                        <div className="flex gap-3">
                          <div className="relative h-[64px] w-[92px] overflow-hidden rounded-xl bg-white ring-1 ring-black/10">
                            <Image
                              src={activeProduct.image}
                              alt={activeProduct.title}
                              fill
                              sizes="92px"
                              className="object-contain p-1.5"
                            />
                            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 bg-gradient-to-t from-black/[0.04] to-transparent" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="text-[14px] font-semibold leading-snug text-black line-clamp-2">
                              {activeProduct.title}
                            </div>

                            {activePriceRaw ? (
                              <div className="mt-1 text-[13px] font-semibold text-black">
                                {formatPrice(activePriceRaw, currency)}
                              </div>
                            ) : (
                              <div className="mt-1 text-[12px] text-black/45">
                                Цена уточняется
                              </div>
                            )}

                            <div className="mt-1 text-[12px] text-black/45">
                              Открыть товар →
                            </div>
                          </div>
                        </div>
                      </Link>
                    </div>
                  ) : null}

                  {/* ✅ Описание справа */}
                  <div
                    className={cn(
                      "pointer-events-none absolute right-4 top-4 hidden md:flex",
                      "z-[26]",
                      "w-[340px] max-w-[40%]",
                      "flex-col",
                      "rounded-2xl border border-white/40",
                      "bg-white/82 backdrop-blur-xl",
                      "shadow-[0_18px_60px_rgba(0,0,0,0.12)]",
                      "p-5",
                    )}
                    style={{ maxHeight: "calc(100% - 32px)" }}
                  >
                    <div>
                      <div className="text-[18px] font-semibold tracking-[-0.01em] text-black">
                        {current.title}
                      </div>
                      {current.description ? (
                        <div className="mt-3 text-[13px] leading-[1.75] text-black/60 line-clamp-6">
                          {current.description}
                        </div>
                      ) : null}
                    </div>

                    <div className="mt-4 flex items-center gap-2 pointer-events-auto">
                      {safeCollections.map((_, i) => (
                        <button
                          key={String(safeCollections[i].id)}
                          type="button"
                          aria-label={`Коллекция ${i + 1}`}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            holdFor();
                            setActiveCollection(i);
                          }}
                          className={cn(
                            "h-2 w-2 rounded-full transition",
                            i === activeCollection
                              ? "bg-black/70"
                              : "bg-black/20 hover:bg-black/35",
                          )}
                          style={{ cursor: "pointer" }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ✅ На мобилке описание под картинкой */}
            <div className="px-4 pb-4 pt-4 md:hidden">
              <h3 className="text-[20px] font-semibold leading-snug tracking-[-0.01em] text-black">
                {current.title}
              </h3>

              {current.description && (
                <p className="mt-3 whitespace-pre-line text-[14px] leading-[1.75] text-black/60">
                  {current.description}
                </p>
              )}

              <div className="mt-4 flex items-center gap-2">
                {safeCollections.map((_, i) => (
                  <button
                    key={String(safeCollections[i].id)}
                    type="button"
                    aria-label={`Коллекция ${i + 1}`}
                    onClick={() => {
                      holdFor();
                      setActiveCollection(i);
                    }}
                    className={cn(
                      "h-2 w-2 rounded-full transition",
                      i === activeCollection
                        ? "bg-black/70"
                        : "bg-black/20 hover:bg-black/35",
                    )}
                    style={{ cursor: "pointer" }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Thumbs */}
        <div data-col-thumbs className="mt-6 md:mt-7">
          <div className="flex gap-3 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {currentImages.map((img, i) => {
              const thumbSrc = safeResolveSrc(img?.url);
              return (
                <button
                  key={`${current.id}-img-${i}`}
                  type="button"
                  onClick={() => {
                    holdFor();
                    setActiveImage(i);
                  }}
                  className={cn(
                    "relative h-[86px] w-[140px] shrink-0 overflow-hidden rounded-xl",
                    "border border-black/10 bg-white",
                    "shadow-[0_10px_26px_rgba(0,0,0,0.06)]",
                    "transition hover:-translate-y-[1px]",
                    i === activeImage ? "ring-2 ring-black/35" : "ring-0",
                  )}
                  style={{ cursor: "pointer" }}
                >
                  {thumbSrc ? (
                    <Image
                      src={thumbSrc}
                      alt={img.alternativeText || `Фото ${i + 1}`}
                      fill
                      sizes="140px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="absolute inset-0 bg-black/5" />
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-3 flex items-center justify-center gap-2">
            {currentImages.slice(0, 7).map((_, i) => (
              <span
                key={`dot-${i}`}
                className={cn(
                  "h-1.5 w-1.5 rounded-full",
                  i === activeImage ? "bg-black/65" : "bg-black/18",
                )}
              />
            ))}
          </div>
        </div>

        {lightboxOpen && (
          <Lightbox
            title={current.title}
            images={currentImages}
            activeIndex={activeImage}
            onClose={() => setLightboxOpen(false)}
            onPrev={goPrevImage}
            onNext={goNextImage}
            onPick={(i) => {
              holdFor();
              setActiveImage(i);
            }}
          />
        )}
      </div>
    </section>
  );
}

function Lightbox({
  title,
  images,
  activeIndex,
  onClose,
  onPrev,
  onNext,
  onPick,
}: {
  title: string;
  images: StrapiImage[];
  activeIndex: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  onPick: (i: number) => void;
}) {
  const img = images[activeIndex];
  const src = safeResolveSrc(img?.url);

  return (
    <div
      className="fixed inset-0 z-[80] bg-black/65"
      role="dialog"
      aria-modal="true"
      aria-label={`Просмотр: ${title}`}
      onMouseDown={(e) => {
        if (e.currentTarget === e.target) onClose();
      }}
    >
      <div className="mx-auto grid h-full w-full max-w-[1200px] grid-rows-[auto_1fr_auto] px-4 py-6 md:py-10">
        <div className="flex items-center justify-between">
          <div className="text-[12px] tracking-[0.18em] text-white/70">
            {title} • {activeIndex + 1}/{images.length}
          </div>

          <button
            type="button"
            onClick={onClose}
            className="grid h-10 w-10 place-items-center rounded-full bg-white/10 ring-1 ring-white/15 transition hover:bg-white/14"
            style={{ cursor: "pointer" }}
            aria-label="Закрыть"
          >
            <X className="h-5 w-5 text-white/90" />
          </button>
        </div>

        <div className="mt-4 grid place-items-center">
          <div className="relative w-full max-w-[1100px] overflow-hidden rounded-2xl bg-black/30 ring-1 ring-white/10">
            <div className="relative h-[70vh] w-full md:h-[74vh]">
              {src ? (
                <Image
                  src={src}
                  alt={img?.alternativeText || title}
                  fill
                  sizes="(max-width: 768px) 100vw, 1200px"
                  className="object-contain"
                  priority
                />
              ) : (
                <div className="absolute inset-0 bg-white/5" />
              )}
            </div>

            <button
              type="button"
              onClick={onPrev}
              aria-label="Предыдущее фото"
              className="absolute left-3 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-white/10 ring-1 ring-white/15 transition hover:bg-white/14"
              style={{ cursor: "pointer" }}
            >
              <ChevronLeft className="h-5 w-5 text-white/90" />
            </button>
            <button
              type="button"
              onClick={onNext}
              aria-label="Следующее фото"
              className="absolute right-3 top-1/2 -translate-y-1/2 grid h-10 w-10 place-items-center rounded-full bg-white/10 ring-1 ring-white/15 transition hover:bg-white/14"
              style={{ cursor: "pointer" }}
            >
              <ChevronRight className="h-5 w-5 text-white/90" />
            </button>
          </div>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {images.map((t, i) => {
            const tSrc = safeResolveSrc(t?.url);
            return (
              <button
                key={`lb-${i}`}
                type="button"
                onClick={() => onPick(i)}
                className={cn(
                  "relative h-[58px] w-[90px] shrink-0 overflow-hidden rounded-lg ring-1 ring-white/15 transition",
                  i === activeIndex
                    ? "ring-2 ring-white/55"
                    : "opacity-80 hover:opacity-100",
                )}
                style={{ cursor: "pointer" }}
              >
                {tSrc ? (
                  <Image
                    src={tSrc}
                    alt={t.alternativeText || `thumb ${i + 1}`}
                    fill
                    sizes="90px"
                    className="object-cover"
                  />
                ) : (
                  <div className="absolute inset-0 bg-white/5" />
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
