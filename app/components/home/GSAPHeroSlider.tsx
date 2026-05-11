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

function isIOSDevice() {
  if (typeof window === "undefined") return false;

  const ua = window.navigator.userAgent || "";
  const platform = window.navigator.platform || "";

  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (platform === "MacIntel" && window.navigator.maxTouchPoints > 1)
  );
}

export default function GSAPHeroSlider({
  slides = DEFAULT_SLIDES,
  autoMs = 5200,
}: {
  slides?: Slide[];
  autoMs?: number;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const autoRef = useRef<number | null>(null);
  const busyRef = useRef(false);
  const activeRef = useRef(0);
  const preloadedRef = useRef<Set<string>>(new Set());

  const [active, setActive] = useState(0);
  const [isMobile, setIsMobile] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);

  const safeSlides = useMemo(() => {
    const arr =
      Array.isArray(slides) && slides.length ? slides : DEFAULT_SLIDES;

    return arr.filter((s) => s && s.id && s.title && s.image);
  }, [slides]);

  const preloadImage = useCallback((src?: string) => {
    if (!src || typeof window === "undefined") return;
    if (preloadedRef.current.has(src)) return;

    preloadedRef.current.add(src);

    const img = new window.Image();
    img.src = src;
  }, []);

  const preloadAround = useCallback(
    (idx: number) => {
      if (!safeSlides.length) return;

      const current = (idx + safeSlides.length) % safeSlides.length;
      const prevIdx = (current - 1 + safeSlides.length) % safeSlides.length;
      const nextIdx = (current + 1) % safeSlides.length;

      preloadImage(safeSlides[current]?.image);
      preloadImage(safeSlides[prevIdx]?.image);
      preloadImage(safeSlides[nextIdx]?.image);
    },
    [preloadImage, safeSlides],
  );

  useEffect(() => {
    setIsIOS(isIOSDevice());
  }, []);

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

  useEffect(() => {
    preloadAround(active);
  }, [active, preloadAround]);

  const shouldLoadImage = useCallback(
    (idx: number) => {
      if (!isMobile) return true;
      if (!safeSlides.length) return false;

      const prevIdx = (active - 1 + safeSlides.length) % safeSlides.length;
      const nextIdx = (active + 1) % safeSlides.length;

      return idx === active || idx === prevIdx || idx === nextIdx;
    },
    [active, isMobile, safeSlides.length],
  );

  const stopAuto = useCallback(() => {
    if (autoRef.current) {
      window.clearInterval(autoRef.current);
    }

    autoRef.current = null;
  }, []);

  const goLight = useCallback(
    (nextIdx: number) => {
      if (safeSlides.length <= 1) return;

      const clamped = (nextIdx + safeSlides.length) % safeSlides.length;

      activeRef.current = clamped;
      preloadAround(clamped);
      setActive(clamped);
    },
    [preloadAround, safeSlides.length],
  );

  const go = useCallback(
    (nextIdx: number) => {
      if (isIOS) {
        goLight(nextIdx);
        return;
      }

      if (!rootRef.current) return;
      if (safeSlides.length <= 1) return;

      const root = rootRef.current;
      const prevIdx = activeRef.current;
      const clamped = (nextIdx + safeSlides.length) % safeSlides.length;

      if (clamped === prevIdx) return;

      preloadAround(clamped);

      if (busyRef.current) {
        tlRef.current?.kill();
        busyRef.current = false;
      }

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

      if (nextImg && safeSlides[clamped]?.image) {
        nextImg.style.backgroundImage = `url(${safeSlides[clamped].image})`;
      }

      tlRef.current?.kill();
      busyRef.current = true;

      activeRef.current = clamped;
      setActive(clamped);

      gsap.set(next, {
        zIndex: 3,
        opacity: 1,
        pointerEvents: "auto",
      });

      gsap.set(prev, {
        zIndex: 2,
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
          y: 8,
          opacity: 0,
        });

        gsap.set(nextBtnWrap, {
          y: 8,
          opacity: 0,
        });

        const tl = gsap.timeline({
          defaults: { ease: "power2.out", overwrite: "auto" },
          onComplete: () => {
            gsap.set(prev, {
              opacity: 0,
              zIndex: 1,
              pointerEvents: "none",
            });

            gsap.set(next, {
              zIndex: 2,
              pointerEvents: "auto",
            });

            busyRef.current = false;
          },
        });

        tl.to(prev, { opacity: 0, duration: 0.22 }, 0)
          .to(next, { opacity: 1, duration: 0.22 }, 0)
          .to(nextTitle, { y: 0, opacity: 1, duration: 0.24 }, 0.04)
          .to(nextBtnWrap, { y: 0, opacity: 1, duration: 0.24 }, 0.08);

        tlRef.current = tl;

        return;
      }

      gsap.set(nextImg, {
        scale: 1.018,
        clearProps: "filter",
      });

      gsap.set(nextOverlay, {
        opacity: 0.24,
      });

      gsap.set(nextTitle, {
        y: 14,
        opacity: 0,
      });

      gsap.set(nextBtnWrap, {
        y: 14,
        opacity: 0,
      });

      const tl = gsap.timeline({
        defaults: { ease: "power3.out", overwrite: "auto" },
        onComplete: () => {
          gsap.set(prev, {
            opacity: 0,
            zIndex: 1,
            pointerEvents: "none",
          });

          gsap.set(next, {
            zIndex: 2,
            pointerEvents: "auto",
          });

          busyRef.current = false;
        },
      });

      tl.to(prevImg, { scale: 1.006, duration: 0.32 }, 0)
        .to(prevOverlay, { opacity: 0.48, duration: 0.32 }, 0)
        .to(prev, { opacity: 0, duration: 0.34 }, 0.04)
        .to(
          nextImg,
          {
            scale: 1,
            duration: 0.56,
            ease: "power3.out",
          },
          0,
        )
        .to(nextOverlay, { opacity: 0.38, duration: 0.4 }, 0.04)
        .to(nextTitle, { y: 0, opacity: 1, duration: 0.34 }, 0.1)
        .to(nextBtnWrap, { y: 0, opacity: 1, duration: 0.32 }, 0.14);

      tlRef.current = tl;
    },
    [goLight, isIOS, isMobile, preloadAround, reducedMotion, safeSlides],
  );

  const startAuto = useCallback(() => {
    stopAuto();

    if (isIOS) return;
    if (reducedMotion) return;
    if (safeSlides.length <= 1) return;

    autoRef.current = window.setInterval(() => {
      if (!busyRef.current) {
        go(activeRef.current + 1);
      }
    }, autoMs);
  }, [autoMs, go, isIOS, reducedMotion, safeSlides.length, stopAuto]);

  const next = useCallback(() => {
    if (isIOS) {
      goLight(activeRef.current + 1);
      return;
    }

    go(activeRef.current + 1);
  }, [go, goLight, isIOS]);

  const prev = useCallback(() => {
    if (isIOS) {
      goLight(activeRef.current - 1);
      return;
    }

    go(activeRef.current - 1);
  }, [go, goLight, isIOS]);

  useLayoutEffect(() => {
    if (!rootRef.current) return;

    const root = rootRef.current;

    tlRef.current?.kill();
    busyRef.current = false;

    safeSlides.forEach((s, i) => {
      const el = root.querySelector(
        `[data-slide="${i}"]`,
      ) as HTMLElement | null;

      if (!el) return;

      const isCurrent = i === activeRef.current;

      if (isIOS) {
        el.style.opacity = isCurrent ? "1" : "0";
        el.style.zIndex = isCurrent ? "2" : "1";
        el.style.pointerEvents = isCurrent ? "auto" : "none";

        const img = el.querySelector("[data-img]") as HTMLElement | null;
        const overlay = el.querySelector(
          "[data-overlay]",
        ) as HTMLElement | null;
        const title = el.querySelector("[data-title]") as HTMLElement | null;
        const btnWrap = el.querySelector(
          "[data-btn-wrap]",
        ) as HTMLElement | null;

        if (img) {
          img.style.backgroundImage = s.image ? `url(${s.image})` : "";
          img.style.transform = "none";
          img.style.willChange = "auto";
          img.style.backfaceVisibility = "visible";
          img.style.webkitBackfaceVisibility = "visible";
        }

        if (overlay) {
          overlay.style.opacity = "0.34";
        }

        if (title) {
          title.style.transform = "none";
          title.style.opacity = "1";
        }

        if (btnWrap) {
          btnWrap.style.transform = "none";
          btnWrap.style.opacity = "1";
        }

        return;
      }

      gsap.set(el, {
        opacity: isCurrent ? 1 : 0,
        zIndex: isCurrent ? 2 : 1,
        pointerEvents: isCurrent ? "auto" : "none",
      });
    });

    if (isIOS) {
      stopAuto();

      return () => {
        stopAuto();
        tlRef.current?.kill();
        busyRef.current = false;
      };
    }

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
        busyRef.current = false;
      };
    }

    gsap.set(img, {
      scale: 1.018,
      clearProps: "filter",
    });

    gsap.set(overlay, {
      opacity: 0.24,
    });

    gsap.set(title, {
      y: 14,
      opacity: 0,
    });

    gsap.set(btnWrap, {
      y: 14,
      opacity: 0,
    });

    const introTl = gsap.timeline({
      defaults: { ease: "power3.out", overwrite: "auto" },
      onComplete: () => {
        busyRef.current = false;
      },
    });

    busyRef.current = true;

    introTl
      .to(
        img,
        {
          scale: 1,
          duration: 0.6,
          ease: "power3.out",
        },
        0,
      )
      .to(overlay, { opacity: 0.38, duration: 0.4 }, 0.04)
      .to(title, { y: 0, opacity: 1, duration: 0.34 }, 0.1)
      .to(btnWrap, { y: 0, opacity: 1, duration: 0.32 }, 0.14);

    tlRef.current = introTl;

    startAuto();

    return () => {
      stopAuto();
      tlRef.current?.kill();
      busyRef.current = false;
    };
  }, [isIOS, isMobile, reducedMotion, safeSlides, startAuto, stopAuto]);

  if (!safeSlides.length) return null;

  return (
    <section className="w-full max-w-full overflow-hidden">
      <div className="mx-auto w-full max-w-[1200px] overflow-hidden px-4">
        <div
          ref={rootRef}
          onMouseEnter={isIOS ? undefined : stopAuto}
          onMouseLeave={isIOS ? undefined : startAuto}
          className={cn(
            "relative isolate overflow-hidden rounded-none",
            "bg-transparent",
            "border-0 ring-0 outline-none",
            "h-[335px] sm:h-[420px] md:h-[520px]",
            "select-none",
          )}
          style={{
            border: "none",
            outline: "none",
            boxShadow: "none",
            transform: isIOS ? "none" : undefined,
            willChange: isIOS ? "auto" : undefined,
            WebkitBackfaceVisibility: isIOS ? "visible" : "hidden",
            backfaceVisibility: isIOS ? "visible" : "hidden",
          }}
        >
          {safeSlides.map((s, i) => {
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
                  className={cn(
                    "absolute inset-0",
                    isIOS ? "" : "md:will-change-transform",
                  )}
                  style={{
                    backgroundImage: imageUrl ? `url(${imageUrl})` : undefined,
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center center",
                    transform: isIOS ? "none" : "scale(1)",
                    willChange: isIOS ? "auto" : undefined,
                    WebkitBackfaceVisibility: isIOS ? "visible" : "hidden",
                    backfaceVisibility: isIOS ? "visible" : "hidden",
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
                        className={cn(
                          "inline-flex items-center justify-center",
                          "min-w-[160px] sm:min-w-[180px] md:min-w-[190px]",
                          "px-7 py-3 sm:px-8 md:px-10",
                          "bg-transparent text-white",
                          "text-[11px] md:text-[13px] tracking-[0.18em] md:tracking-[0.22em] uppercase",
                          "border border-white/75",
                          "transition-all duration-300",
                          isIOS
                            ? ""
                            : "hover:shadow-[inset_0_0_0_2px_rgba(255,255,255,0.9)]",
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
            <div
              className={cn(
                "rounded-full bg-black/18 px-3 py-2 ring-1 ring-white/10",
                isIOS
                  ? ""
                  : "shadow-[0_10px_30px_rgba(0,0,0,0.18)] md:backdrop-blur-[6px]",
              )}
            >
              <div className="flex items-center gap-2">
                {Array.from({ length: safeSlides.length }).map((_, idx) => {
                  const dotActive = idx === active;

                  return (
                    <button
                      key={`dot-${idx}`}
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();

                        if (isIOS) {
                          goLight(idx);
                          return;
                        }

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
