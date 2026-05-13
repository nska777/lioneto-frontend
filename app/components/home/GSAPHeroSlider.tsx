"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Slide = {
  id: string;
  title: string;
  ctaLabel: string;
  href: string;
  image: string;
};

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

const DEFAULT_SLIDES: Slide[] = [
  {
    id: "s1",
    title: "ГОСТИНАЯ SALVADOR",
    ctaLabel: "В КАТАЛОГ",
    href: "/catalog?menu=living&collections=salvador&hero=1",
    image: "/hero/01.jpg",
  },
  {
    id: "s2",
    title: "СПАЛЬНЯ AMBER",
    ctaLabel: "В КАТАЛОГ",
    href: "/catalog?menu=bedrooms&collections=amber&hero=1",
    image: "/hero/02.jpg",
  },
  {
    id: "s3",
    title: "СПАЛЬНЯ BUONGIORNO",
    ctaLabel: "В КАТАЛОГ",
    href: "/catalog?menu=bedrooms&collections=buongiorno&hero=1",
    image: "/hero/03.jpg",
  },
  {
    id: "s4",
    title: "ГОСТИНАЯ BUONGIORNO",
    ctaLabel: "В КАТАЛОГ",
    href: "/catalog?menu=living&collections=buongiorno&hero=1",
    image: "/hero/04.jpg",
  },
  {
    id: "s5",
    title: "МОЛОДЁЖНАЯ ELIZABETH",
    ctaLabel: "В КАТАЛОГ",
    href: "/catalog?menu=youth&collections=elizabeth&hero=1",
    image: "/hero/05.jpg",
  },
  {
    id: "s6",
    title: "СПАЛЬНЯ ELIZABETH",
    ctaLabel: "В КАТАЛОГ",
    href: "/catalog?menu=bedrooms&collections=elizabeth&hero=1",
    image: "/hero/06.jpg",
  },
  {
    id: "s7",
    title: "ГОСТИНАЯ PITTI",
    ctaLabel: "В КАТАЛОГ",
    href: "/catalog?menu=living&collections=pitti&hero=1",
    image: "/hero/07.jpg",
  },
  {
    id: "s8",
    title: "ГОСТИНАЯ SCANDY",
    ctaLabel: "В КАТАЛОГ",
    href: "/catalog?menu=living&collections=scandy&hero=1",
    image: "/hero/08.jpg",
  },
  {
    id: "s9",
    title: "МОЛОДЁЖНАЯ SCANDY",
    ctaLabel: "В КАТАЛОГ",
    href: "/catalog?menu=youth&collections=scandi&hero=1",
    image: "/hero/09.jpg",
  },
  {
    id: "s10",
    title: "СПАЛЬНЯ SALVADOR",
    ctaLabel: "В КАТАЛОГ",
    href: "/catalog?menu=bedrooms&collections=salvador&hero=1",
    image: "/hero/010.jpg",
  },
];

export default function GSAPHeroSlider({
  slides = DEFAULT_SLIDES,
  autoMs = 5200,
}: {
  slides?: Slide[];
  autoMs?: number;
}) {
  const timerRef = useRef<number | null>(null);
  const touchStartXRef = useRef<number | null>(null);

  const [active, setActive] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const safeSlides = useMemo(() => {
    const arr =
      Array.isArray(slides) && slides.length ? slides : DEFAULT_SLIDES;

    return arr.filter((s) => s && s.id && s.title && s.image);
  }, [slides]);

  const slidesCount = safeSlides.length;

  const goTo = useCallback(
    (idx: number) => {
      if (slidesCount <= 1) return;

      setActive(() => {
        return (idx + slidesCount) % slidesCount;
      });
    },
    [slidesCount],
  );

  const next = useCallback(() => {
    setActive((current) => {
      if (slidesCount <= 1) return current;
      return (current + 1) % slidesCount;
    });
  }, [slidesCount]);

  const prev = useCallback(() => {
    setActive((current) => {
      if (slidesCount <= 1) return current;
      return (current - 1 + slidesCount) % slidesCount;
    });
  }, [slidesCount]);

  const stopAuto = useCallback(() => {
    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const startAuto = useCallback(() => {
    stopAuto();

    if (slidesCount <= 1) return;

    timerRef.current = window.setInterval(() => {
      next();
    }, autoMs);
  }, [autoMs, next, slidesCount, stopAuto]);

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)");

    const update = () => {
      setIsMobile(mq.matches);
    };

    update();

    mq.addEventListener?.("change", update);

    return () => {
      mq.removeEventListener?.("change", update);
    };
  }, []);

  useEffect(() => {
    startAuto();

    return () => {
      stopAuto();
    };
  }, [startAuto, stopAuto]);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const preloadIndexes = [
      active,
      (active + 1) % slidesCount,
      (active - 1 + slidesCount) % slidesCount,
    ];

    preloadIndexes.forEach((idx) => {
      const src = safeSlides[idx]?.image;
      if (!src) return;

      const img = new window.Image();
      img.decoding = "async";
      img.src = src;
    });
  }, [active, safeSlides, slidesCount]);

  if (!safeSlides.length) return null;

  return (
    <section className="w-full max-w-full overflow-hidden">
      <div className="mx-auto w-full max-w-[1200px] overflow-hidden px-4">
        <div
          onMouseEnter={stopAuto}
          onMouseLeave={startAuto}
          onTouchStart={(e) => {
            touchStartXRef.current = e.touches[0]?.clientX ?? null;
          }}
          onTouchEnd={(e) => {
            const startX = touchStartXRef.current;
            const endX = e.changedTouches[0]?.clientX ?? null;

            touchStartXRef.current = null;

            if (startX === null || endX === null) return;

            const diff = startX - endX;

            if (Math.abs(diff) < 35) return;

            if (diff > 0) {
              next();
            } else {
              prev();
            }
          }}
          className={cn(
            "relative isolate overflow-hidden rounded-none",
            "bg-neutral-200",
            "border-0 ring-0 outline-none",
            "h-[260px] sm:h-[420px] md:h-[520px]",
            "select-none",
          )}
          style={{
            border: "none",
            outline: "none",
            boxShadow: "none",
          }}
        >
          {safeSlides.map((s, i) => {
            const isActive = i === active;

            return (
              <div
                key={s.id}
                className={cn(
                  "absolute inset-0",
                  "transition-opacity duration-500 ease-out",
                  isActive
                    ? "z-10 opacity-100 pointer-events-auto"
                    : "z-0 opacity-0 pointer-events-none",
                )}
                aria-hidden={!isActive}
              >
                <img
                  src={s.image}
                  alt={s.title}
                  loading={i <= 2 ? "eager" : "lazy"}
                  decoding="async"
                  fetchPriority={i === 0 ? "high" : "auto"}
                  className="absolute inset-0 h-full w-full object-cover"
                />

                <div className="absolute inset-0 bg-black/10 md:bg-black/30" />

                <div className="relative z-10 flex h-full items-center justify-center px-10 sm:px-16 md:px-20">
                  <div className="w-full text-center">
                    <h2
                      className={cn(
                        "mx-auto max-w-[86%] font-semibold uppercase text-white",
                        "text-center",
                        "tracking-[0.035em] md:tracking-[0.08em]",
                        "text-[16px] sm:text-[24px] md:text-[44px]",
                        "leading-[1.15]",
                        "break-words",
                        "drop-shadow-[0_6px_16px_rgba(0,0,0,0.42)]",
                      )}
                      style={{
                        WebkitTextStroke: isMobile
                          ? "0.2px rgba(0,0,0,0.35)"
                          : "0.6px rgba(0,0,0,0.55)",
                        textShadow: isMobile
                          ? "0 2px 8px rgba(0,0,0,0.42)"
                          : "0 2px 10px rgba(0,0,0,0.38), 0 0 18px rgba(0,0,0,0.28)",
                      }}
                    >
                      {s.title}
                    </h2>

                    <div className="hidden items-center justify-center md:mt-5 md:flex">
                      <Link
                        href={s.href}
                        className={cn(
                          "inline-flex items-center justify-center",
                          "md:h-12 md:min-w-[170px] md:px-8",
                          "bg-transparent text-white",
                          "md:text-[13px]",
                          "font-semibold",
                          "tracking-[0.22em] uppercase",
                          "border-0 outline-none ring-0 shadow-none",
                          "transition-all duration-300",
                          "hover:opacity-80",
                          "cursor-pointer",
                        )}
                        style={{
                          textShadow:
                            "0 2px 10px rgba(0,0,0,0.45), 0 0 16px rgba(0,0,0,0.3)",
                        }}
                      >
                        {s.ctaLabel}
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              stopAuto();
              prev();
              startAuto();
            }}
            className={cn(
              "absolute left-3 top-1/2 z-30 -translate-y-1/2",
              "inline-flex items-center justify-center",
              "h-10 w-10 md:h-14 md:w-14",
              "border-0 bg-transparent p-0 text-white",
              "outline-none ring-0 shadow-none",
              "drop-shadow-[0_4px_10px_rgba(0,0,0,0.55)]",
              "hover:opacity-75",
              "cursor-pointer transition-opacity",
              "md:left-6",
            )}
            aria-label="Предыдущий слайд"
          >
            <ChevronLeft
              className="h-7 w-7 md:h-10 md:w-10"
              strokeWidth={2.25}
            />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              stopAuto();
              next();
              startAuto();
            }}
            className={cn(
              "absolute right-3 top-1/2 z-30 -translate-y-1/2",
              "inline-flex items-center justify-center",
              "h-10 w-10 md:h-14 md:w-14",
              "border-0 bg-transparent p-0 text-white",
              "outline-none ring-0 shadow-none",
              "drop-shadow-[0_4px_10px_rgba(0,0,0,0.55)]",
              "hover:opacity-75",
              "cursor-pointer transition-opacity",
              "md:right-6",
            )}
            aria-label="Следующий слайд"
          >
            <ChevronRight
              className="h-7 w-7 md:h-10 md:w-10"
              strokeWidth={2.25}
            />
          </button>

          <div className="pointer-events-auto absolute bottom-4 left-0 right-0 z-30 flex justify-center">
            <div className="rounded-full bg-black/18 px-3 py-2 ring-1 ring-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.18)] md:backdrop-blur-[6px]">
              <div className="flex items-center gap-2">
                {safeSlides.map((_, idx) => {
                  const dotActive = idx === active;

                  return (
                    <button
                      key={`dot-${idx}`}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        stopAuto();
                        goTo(idx);
                        startAuto();
                      }}
                      className={cn(
                        "h-2.5 flex-none rounded-full transition cursor-pointer",
                        dotActive
                          ? "w-8 bg-white shadow-[0_0_0_4px_rgba(255,255,255,0.16)]"
                          : "w-2.5 bg-white/70 hover:bg-white",
                      )}
                      aria-label={`Слайд ${idx + 1}`}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
