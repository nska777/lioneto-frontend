"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Link from "next/link";
import gsap from "gsap";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

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
    title: "МОЛОДЁЖНАЯ SKANDY",
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
  const router = useRouter();

  const rootRef = useRef<HTMLDivElement | null>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const autoRef = useRef<number | null>(null);
  const busyRef = useRef(false);

  const touchStartXRef = useRef<number | null>(null);
  const touchStartYRef = useRef<number | null>(null);
  const suppressClickUntilRef = useRef(0);

  const [active, setActive] = useState(0);
  const activeRef = useRef(0);

  const [isMobile, setIsMobile] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();

    window.addEventListener("resize", checkMobile);

    return () => {
      window.removeEventListener("resize", checkMobile);
    };
  }, []);

  useEffect(() => {
    const media = window.matchMedia?.("(prefers-reduced-motion: reduce)");

    const update = () => {
      setReducedMotion(Boolean(media?.matches));
    };

    update();

    media?.addEventListener?.("change", update);

    return () => {
      media?.removeEventListener?.("change", update);
    };
  }, []);

  const shouldLoadImage = useCallback(
    (idx: number) => {
      if (!isMobile) return true;

      const prevIdx = (active - 1 + slides.length) % slides.length;
      const nextIdx = (active + 1) % slides.length;

      return idx === active || idx === prevIdx || idx === nextIdx;
    },
    [active, isMobile, slides.length],
  );

  const stopAuto = useCallback(() => {
    if (autoRef.current) {
      window.clearInterval(autoRef.current);
    }

    autoRef.current = null;
  }, []);

  const go = useCallback(
    (nextIdx: number) => {
      if (!rootRef.current) return;
      if (busyRef.current) return;
      if (slides.length <= 1) return;

      const root = rootRef.current;
      const prevIdx = activeRef.current;
      const clamped = (nextIdx + slides.length) % slides.length;

      if (clamped === prevIdx) return;

      busyRef.current = true;

      const prev = root.querySelector(
        `[data-slide="${prevIdx}"]`,
      ) as HTMLElement | null;

      const next = root.querySelector(
        `[data-slide="${clamped}"]`,
      ) as HTMLElement | null;

      if (!prev || !next) {
        activeRef.current = clamped;
        setActive(clamped);
        busyRef.current = false;
        return;
      }

      const prevImg = prev.querySelector("[data-img]") as HTMLElement | null;
      const nextImg = next.querySelector("[data-img]") as HTMLElement | null;

      const prevOverlay = prev.querySelector(
        "[data-overlay]",
      ) as HTMLElement | null;

      const nextOverlay = next.querySelector(
        "[data-overlay]",
      ) as HTMLElement | null;

      const nextTitle = next.querySelector(
        "[data-title]",
      ) as HTMLElement | null;

      const nextBtnWrap = next.querySelector(
        "[data-btn-wrap]",
      ) as HTMLElement | null;

      tlRef.current?.kill();

      gsap.set(next, {
        zIndex: 2,
        opacity: 1,
        pointerEvents: "auto",
      });

      gsap.set(prev, {
        zIndex: 1,
        pointerEvents: "none",
      });

      if (isMobile || reducedMotion) {
        gsap.set(nextImg, {
          scale: 1,
          clearProps: "filter",
        });

        gsap.set(nextOverlay, {
          opacity: 0.34,
        });

        gsap.set(nextTitle, {
          y: 10,
          opacity: 0,
        });

        gsap.set(nextBtnWrap, {
          y: 10,
          opacity: 0,
        });

        const tl = gsap.timeline({
          defaults: { ease: "power2.out" },
          onComplete: () => {
            gsap.set(prev, {
              opacity: 0,
              pointerEvents: "none",
            });

            activeRef.current = clamped;
            setActive(clamped);
            busyRef.current = false;
          },
        });

        tl.to(prev, { opacity: 0, duration: 0.28 }, 0)
          .to(next, { opacity: 1, duration: 0.28 }, 0)
          .to(nextTitle, { y: 0, opacity: 1, duration: 0.28 }, 0.08)
          .to(nextBtnWrap, { y: 0, opacity: 1, duration: 0.28 }, 0.12);

        tlRef.current = tl;

        return;
      }

      gsap.set(nextImg, {
        scale: 1.025,
        clearProps: "filter",
      });

      gsap.set(nextOverlay, {
        opacity: 0.2,
      });

      gsap.set(nextTitle, {
        y: 18,
        opacity: 0,
      });

      gsap.set(nextBtnWrap, {
        y: 18,
        opacity: 0,
      });

      const tl = gsap.timeline({
        defaults: { ease: "power3.out" },
        onComplete: () => {
          gsap.set(prev, {
            opacity: 0,
            pointerEvents: "none",
          });

          activeRef.current = clamped;
          setActive(clamped);
          busyRef.current = false;
        },
      });

      tl.to(prevImg, { scale: 1.01, duration: 0.4 }, 0)
        .to(prevOverlay, { opacity: 0.5, duration: 0.4 }, 0)
        .to(prev, { opacity: 0, duration: 0.45 }, 0.08)
        .to(
          nextImg,
          {
            scale: 1,
            duration: 0.75,
            ease: "expo.out",
          },
          0.04,
        )
        .to(nextOverlay, { opacity: 0.38, duration: 0.55 }, 0.08)
        .to(nextTitle, { y: 0, opacity: 1, duration: 0.45 }, 0.18)
        .to(nextBtnWrap, { y: 0, opacity: 1, duration: 0.42 }, 0.24);

      tlRef.current = tl;
    },
    [isMobile, reducedMotion, slides.length],
  );

  const startAuto = useCallback(() => {
    stopAuto();

    if (reducedMotion) return;
    if (slides.length <= 1) return;

    autoRef.current = window.setInterval(() => {
      if (!busyRef.current) {
        go(activeRef.current + 1);
      }
    }, autoMs);
  }, [autoMs, go, reducedMotion, slides.length, stopAuto]);

  const next = useCallback(() => {
    go(activeRef.current + 1);
  }, [go]);

  const prev = useCallback(() => {
    go(activeRef.current - 1);
  }, [go]);

  const onTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.changedTouches[0];

    touchStartXRef.current = touch?.clientX ?? null;
    touchStartYRef.current = touch?.clientY ?? null;

    stopAuto();
  };

  const onTouchEnd = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.changedTouches[0];

    const startX = touchStartXRef.current;
    const startY = touchStartYRef.current;
    const endX = touch?.clientX ?? null;
    const endY = touch?.clientY ?? null;

    touchStartXRef.current = null;
    touchStartYRef.current = null;

    if (startX == null || startY == null || endX == null || endY == null) {
      startAuto();
      return;
    }

    const diffX = startX - endX;
    const diffY = startY - endY;

    const absX = Math.abs(diffX);
    const absY = Math.abs(diffY);

    const isHorizontalSwipe = absX >= 46 && absX > absY * 1.35;

    if (isHorizontalSwipe) {
      suppressClickUntilRef.current = Date.now() + 450;

      if (diffX > 0) {
        next();
      } else {
        prev();
      }
    }

    startAuto();
  };

  useLayoutEffect(() => {
    if (!rootRef.current) return;

    const root = rootRef.current;

    tlRef.current?.kill();

    slides.forEach((_, i) => {
      const el = root.querySelector(
        `[data-slide="${i}"]`,
      ) as HTMLElement | null;

      if (!el) return;

      gsap.set(el, {
        opacity: i === activeRef.current ? 1 : 0,
        zIndex: i === activeRef.current ? 2 : 1,
        pointerEvents: i === activeRef.current ? "auto" : "none",
      });
    });

    const first = root.querySelector(
      `[data-slide="${activeRef.current}"]`,
    ) as HTMLElement | null;

    const img = first?.querySelector("[data-img]") as HTMLElement | null;

    const overlay = first?.querySelector(
      "[data-overlay]",
    ) as HTMLElement | null;

    const title = first?.querySelector("[data-title]") as HTMLElement | null;

    const btnWrap = first?.querySelector(
      "[data-btn-wrap]",
    ) as HTMLElement | null;

    if (isMobile || reducedMotion) {
      gsap.set(img, {
        scale: 1,
        clearProps: "filter",
      });

      gsap.set(overlay, {
        opacity: 0.34,
      });

      gsap.set(title, {
        y: 0,
        opacity: 1,
      });

      gsap.set(btnWrap, {
        y: 0,
        opacity: 1,
      });

      startAuto();

      return () => {
        stopAuto();
        tlRef.current?.kill();
      };
    }

    gsap.set(img, {
      scale: 1.025,
      clearProps: "filter",
    });

    gsap.set(overlay, {
      opacity: 0.2,
    });

    gsap.set(title, {
      y: 18,
      opacity: 0,
    });

    gsap.set(btnWrap, {
      y: 18,
      opacity: 0,
    });

    const introTl = gsap.timeline({
      defaults: { ease: "power3.out" },
    });

    introTl
      .to(
        img,
        {
          scale: 1,
          duration: 0.9,
          ease: "expo.out",
        },
        0,
      )
      .to(overlay, { opacity: 0.38, duration: 0.55 }, 0.08)
      .to(title, { y: 0, opacity: 1, duration: 0.45 }, 0.18)
      .to(btnWrap, { y: 0, opacity: 1, duration: 0.42 }, 0.24);

    tlRef.current = introTl;

    startAuto();

    return () => {
      stopAuto();
      tlRef.current?.kill();
    };
  }, [isMobile, reducedMotion, slides.length, startAuto, stopAuto]);

  const activeSlide = useMemo(() => {
    return slides[active] ?? slides[0];
  }, [active, slides]);

  return (
    <section className="w-full max-w-full overflow-hidden">
      <div className="mx-auto w-full max-w-[1200px] overflow-hidden px-4">
        <div
          ref={rootRef}
          onMouseEnter={stopAuto}
          onMouseLeave={startAuto}
          onClick={() => {
            if (Date.now() < suppressClickUntilRef.current) return;
            router.push(activeSlide?.href ?? "/catalog");
          }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          className={cn(
            "relative isolate overflow-hidden rounded-none",
            "bg-transparent",
            "border-0 ring-0 outline-none",
            "h-[335px] sm:h-[420px] md:h-[520px]",
            "cursor-pointer select-none touch-pan-y",
          )}
          style={{
            border: "none",
            outline: "none",
            boxShadow: "none",
            touchAction: "pan-y",
            WebkitBackfaceVisibility: "hidden",
            backfaceVisibility: "hidden",
          }}
        >
          {slides.map((s, i) => {
            const isActive = i === active;
            const imageUrl = shouldLoadImage(i) ? s.image : "";

            return (
              <div
                key={s.id}
                data-slide={i}
                className="absolute inset-0 opacity-0"
                aria-hidden={!isActive}
              >
                <div
                  data-img
                  className="absolute inset-0 md:will-change-transform"
                  style={{
                    backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center center",
                    transform: "scale(1)",
                    WebkitBackfaceVisibility: "hidden",
                    backfaceVisibility: "hidden",
                  }}
                />

                <div
                  data-overlay
                  className="absolute inset-0 bg-black/30 md:bg-black/35"
                />

                <div className="relative z-10 flex h-full items-center justify-center px-4 md:px-10">
                  <div className="w-full text-center">
                    <h2
                      data-title
                      className={cn(
                        "mx-auto max-w-[92%] font-semibold uppercase text-white",
                        "tracking-[0.03em] md:tracking-[0.08em]",
                        "text-[18px] sm:text-[24px] md:text-[44px] leading-[1.08]",
                        "drop-shadow-[0_10px_26px_rgba(0,0,0,0.35)]",
                      )}
                    >
                      {s.title}
                    </h2>

                    <div
                      data-btn-wrap
                      className="mt-4 flex items-center justify-center gap-4 md:mt-5"
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          prev();
                        }}
                        className={cn(
                          "inline-flex items-center justify-center md:hidden",
                          "h-9 w-9 shrink-0",
                          "bg-transparent text-white",
                          "border-0 shadow-none outline-none ring-0",
                          "transition-opacity hover:opacity-80",
                          "cursor-pointer",
                        )}
                        aria-label="Предыдущий слайд"
                      >
                        <ChevronLeft className="h-7 w-7" strokeWidth={2.25} />
                      </button>

                      <Link
                        data-btn
                        href={s.href}
                        onClick={(e) => e.stopPropagation()}
                        className={cn(
                          "inline-flex items-center justify-center",
                          "min-w-[160px] sm:min-w-[180px] md:min-w-[190px]",
                          "px-7 py-3 sm:px-8 md:px-10",
                          "bg-transparent text-white",
                          "text-[11px] md:text-[13px] tracking-[0.18em] md:tracking-[0.22em] uppercase",
                          "border border-white/75",
                          "transition-all duration-300",
                          "hover:shadow-[inset_0_0_0_2px_rgba(255,255,255,0.9)]",
                          "cursor-pointer",
                        )}
                      >
                        {s.ctaLabel}
                      </Link>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          next();
                        }}
                        className={cn(
                          "inline-flex items-center justify-center md:hidden",
                          "h-9 w-9 shrink-0",
                          "bg-transparent text-white",
                          "border-0 shadow-none outline-none ring-0",
                          "transition-opacity hover:opacity-80",
                          "cursor-pointer",
                        )}
                        aria-label="Следующий слайд"
                      >
                        <ChevronRight className="h-7 w-7" strokeWidth={2.25} />
                      </button>
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
              prev();
            }}
            className={cn(
              "absolute left-6 top-1/2 z-20 hidden -translate-y-1/2 md:block",
              "bg-transparent p-2",
              "rounded-none border-0 shadow-none outline-none ring-0",
              "text-white/90 hover:text-white hover:opacity-80",
              "cursor-pointer transition-opacity",
            )}
            aria-label="Предыдущий слайд"
          >
            <ChevronLeft className="h-8 w-8" strokeWidth={2.1} />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className={cn(
              "absolute right-6 top-1/2 z-20 hidden -translate-y-1/2 md:block",
              "bg-transparent p-2",
              "rounded-none border-0 shadow-none outline-none ring-0",
              "text-white/90 hover:text-white hover:opacity-80",
              "cursor-pointer transition-opacity",
            )}
            aria-label="Следующий слайд"
          >
            <ChevronRight className="h-8 w-8" strokeWidth={2.1} />
          </button>

          <div className="pointer-events-auto absolute bottom-4 left-0 right-0 z-[30] flex justify-center">
            <div className="rounded-full bg-black/18 px-3 py-2 ring-1 ring-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.18)] md:backdrop-blur-[6px]">
              <div className="flex items-center gap-2">
                {Array.from({ length: slides.length }).map((_, idx) => {
                  const dotActive = idx === active;

                  return (
                    <button
                      key={`dot-${idx}`}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        go(idx);
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
