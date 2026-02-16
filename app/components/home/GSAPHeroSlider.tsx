"use client";

import { useLayoutEffect, useMemo, useRef, useState, useEffect } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRouter } from "next/navigation";

type Slide = {
  id: string;
  title: string;
  ctaLabel: string;
  href: string;
  image: string; // /hero/1.jpg
};

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

export default function GSAPHeroSlider({
  slides = [
    {
      id: "s1",
      title: "СПАЛЬНЯ SALVADOR",
      ctaLabel: "В КАТАЛОГ",
      href: "/catalog?collections=salvador",
      image: "/hero/1.jpg",
    },
    {
      id: "s2",
      title: "СПАЛЬНЯ AMBER",
      ctaLabel: "В КАТАЛОГ",
      href: "/catalog?collections=amber",
      image: "/hero/2.jpg",
    },
    {
      id: "s3",
      title: "СПАЛЬНЯ SCANDY",
      ctaLabel: "В КАТАЛОГ",
      href: "/catalog?collections=scandi",
      image: "/hero/3.jpg",
    },
    {
      id: "s4",
      title: "СПАЛЬНЯ BUONGIORNO",
      ctaLabel: "В КАТАЛОГ",
      href: "/catalog?collections=buongiorno",
      image: "/hero/4.jpg",
    },
    {
      id: "s5",
      title: "ГОСТИННАЯ BUONGIORNO",
      ctaLabel: "В КАТАЛОГ",
      href: "/catalog?collections=buongiorno",
      image: "/hero/5.jpg",
    },
    {
      id: "s6",
      title: "МОЛОДЁЖНАЯ ELIZABETH",
      ctaLabel: "В КАТАЛОГ",
      href: "/catalog?collections=elizabeth",
      image: "/hero/6.jpg",
    },
    {
      id: "s7",
      title: "ГОСТИНАЯ SALVADOR",
      ctaLabel: "В КАТАЛОГ",
      href: "/catalog?collections=salvador",
      image: "/hero/8.jpg",
    },
    {
      id: "s8",
      title: "ГОСТИНАЯ PITTI",
      ctaLabel: "В КАТАЛОГ",
      href: "/catalog?collections=pitti",
      image: "/hero/9.jpg",
    },
    {
      id: "s9",
      title: "ГОСТИНАЯ SKANDY",
      ctaLabel: "В КАТАЛОГ",
      href: "/catalog?collections=scandi",
      image: "/hero/10.jpg",
    },
    {
      id: "s10",
      title: "МОЛОДЁЖНАЯ SKANDY",
      ctaLabel: "В КАТАЛОГ",
      href: "/catalog?collections=scandi",
      image: "/hero/11.jpg",
    },
  ] as Slide[],
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

  const [active, setActive] = useState(0);
  const activeRef = useRef(0);

  useEffect(() => {
    activeRef.current = active;
  }, [active]);

  const reducedMotion = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  }, []);

  const stopAuto = () => {
    if (autoRef.current) window.clearInterval(autoRef.current);
    autoRef.current = null;
  };

  const startAuto = () => {
    stopAuto();
    if (reducedMotion) return;
    autoRef.current = window.setInterval(() => {
      if (!busyRef.current) go(activeRef.current + 1);
    }, autoMs);
  };

  const go = (nextIdx: number) => {
    if (!rootRef.current) return;
    if (busyRef.current) return;

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
    const nextTitle = next.querySelector("[data-title]") as HTMLElement | null;
    const nextBtn = next.querySelector("[data-btn]") as HTMLElement | null;

    gsap.set(next, { zIndex: 2, opacity: 1, pointerEvents: "auto" });
    gsap.set(prev, { zIndex: 1, pointerEvents: "none" });

    gsap.set(nextImg, { scale: 1.06, filter: "blur(8px)" });
    gsap.set(nextOverlay, { opacity: 0.25 });
    gsap.set([nextTitle, nextBtn], { y: 18, opacity: 0 });

    const tl = gsap.timeline({
      defaults: { ease: "power3.out" },
      onComplete: () => {
        gsap.set(prev, { opacity: 0, pointerEvents: "none" });
        setActive(clamped);
        busyRef.current = false;
      },
    });

    tl.to(prevImg, { scale: 1.02, duration: 0.45 }, 0)
      .to(prevOverlay, { opacity: 0.62, duration: 0.45 }, 0)
      .to(prev, { opacity: 0, duration: 0.55 }, 0.1)

      .to(
        nextImg,
        { scale: 1, filter: "blur(0px)", duration: 0.9, ease: "expo.out" },
        0.05,
      )
      .to(nextOverlay, { opacity: 0.55, duration: 0.7 }, 0.1)
      .to(nextTitle, { y: 0, opacity: 1, duration: 0.6 }, 0.22)
      .to(nextBtn, { y: 0, opacity: 1, duration: 0.55 }, 0.3);

    tlRef.current?.kill();
    tlRef.current = tl;
  };

  const next = () => go(activeRef.current + 1);
  const prev = () => go(activeRef.current - 1);

  useLayoutEffect(() => {
    if (!rootRef.current) return;

    const root = rootRef.current;

    slides.forEach((_, i) => {
      const el = root.querySelector(
        `[data-slide="${i}"]`,
      ) as HTMLElement | null;
      if (!el) return;
      gsap.set(el, {
        opacity: i === 0 ? 1 : 0,
        zIndex: i === 0 ? 2 : 1,
        pointerEvents: i === 0 ? "auto" : "none",
      });
    });

    if (!reducedMotion) {
      const first = root.querySelector(
        `[data-slide="0"]`,
      ) as HTMLElement | null;
      const img = first?.querySelector("[data-img]") as HTMLElement | null;
      const overlay = first?.querySelector(
        "[data-overlay]",
      ) as HTMLElement | null;
      const title = first?.querySelector("[data-title]") as HTMLElement | null;
      const btn = first?.querySelector("[data-btn]") as HTMLElement | null;

      gsap.set(img, { scale: 1.06, filter: "blur(8px)" });
      gsap.set(overlay, { opacity: 0.25 });
      gsap.set([title, btn], { y: 18, opacity: 0 });

      gsap
        .timeline({ defaults: { ease: "power3.out" } })
        .to(
          img,
          { scale: 1, filter: "blur(0px)", duration: 1.05, ease: "expo.out" },
          0,
        )
        .to(overlay, { opacity: 0.55, duration: 0.7 }, 0.1)
        .to(title, { y: 0, opacity: 1, duration: 0.6 }, 0.22)
        .to(btn, { y: 0, opacity: 1, duration: 0.55 }, 0.3);
    }

    startAuto();
    return () => {
      stopAuto();
      tlRef.current?.kill();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reducedMotion, slides.length, autoMs]);

  return (
    <section className="w-full">
      <div className="mx-auto w-full max-w-[1200px] px-4">
        <div
          ref={rootRef}
          onMouseEnter={stopAuto}
          onMouseLeave={startAuto}
          onClick={() =>
            router.push(slides[activeRef.current]?.href ?? "/catalog")
          }
          className={cn(
            "relative isolate overflow-hidden rounded-none",
            "bg-[#f3f3f3]",
            "border-0 ring-0 outline-none",
            "h-[420px] md:h-[520px]",
            "cursor-pointer select-none",
          )}
          style={{ border: "none", outline: "none", boxShadow: "none" }}
        >
          {/* мягкий highlight без швов (тот же радиус) */}
          <div className="pointer-events-none absolute inset-0 z-[5] rounded-none ring-1 ring-white/20" />

          {slides.map((s, i) => (
            <div
              key={s.id}
              data-slide={i}
              className="absolute inset-0 opacity-0"
              aria-hidden={i !== active}
            >
              <div
                data-img
                className="absolute inset-0 will-change-transform"
                style={{
                  backgroundImage: `url(${s.image})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  transform: "translateZ(0) scale(1.01)",
                }}
              />

              <div data-overlay className="absolute inset-0 bg-black/45" />

              <div className="relative z-10 flex h-full items-center justify-center px-5 md:px-10">
                <div className="text-center">
                  <h2
                    data-title
                    className={cn(
                      "text-white font-semibold uppercase",
                      "tracking-[0.08em]",
                      "text-[28px] md:text-[44px] leading-[1.05]",
                      "drop-shadow-[0_14px_35px_rgba(0,0,0,0.40)]",
                    )}
                  >
                    {s.title}
                  </h2>

                  <div className="mt-5 flex justify-center">
                    <Link
                      data-btn
                      href={s.href}
                      onClick={(e) => e.stopPropagation()}
                      className={cn(
                        "inline-flex items-center justify-center",
                        "px-10 py-3",
                        "bg-transparent",
                        "text-white",
                        "text-[12px] md:text-[13px] tracking-[0.22em] uppercase",
                        "border border-white/80",
                        "transition-all duration-300",
                        "hover:shadow-[inset_0_0_0_2px_rgba(255,255,255,0.9)]",
                        "cursor-pointer",
                      )}
                    >
                      {s.ctaLabel}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prev();
            }}
            className={cn(
              "absolute left-6 top-1/2 -translate-y-1/2 z-20",
              "p-2",
              "bg-transparent",
              "rounded-none",
              "shadow-none ring-0 border-0",
              "text-white/90 hover:text-white",
              "transition-opacity hover:opacity-70",
              "cursor-pointer",
            )}
            aria-label="Предыдущий слайд"
          >
            <ChevronLeft className="h-7 w-7" />
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              next();
            }}
            className={cn(
              "absolute right-6 top-1/2 -translate-y-1/2 z-20",
              "p-2",
              "bg-transparent",
              "rounded-none",
              "shadow-none ring-0 border-0",
              "text-white/90 hover:text-white",
              "transition-opacity hover:opacity-70",
              "cursor-pointer",
            )}
            aria-label="Следующий слайд"
          >
            <ChevronRight className="h-7 w-7" />
          </button>

          <div className="absolute bottom-4 left-0 right-0 z-[999] flex justify-center pointer-events-auto">
            <div className="rounded-full bg-black/18 px-3 py-2 backdrop-blur-[6px] ring-1 ring-white/10 shadow-[0_10px_30px_rgba(0,0,0,0.18)]">
              <div className="flex items-center gap-2">
                {Array.from({ length: slides.length }).map((_, idx) => {
                  const isActive = idx === active;
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
                        isActive
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
