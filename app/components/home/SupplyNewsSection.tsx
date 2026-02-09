"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

export type NewsItem = {
  id: string | number;

  title: string;
  subtitle?: string;
  excerpt?: string;

  dateLabel?: string;
  tag?: string;
  type?: string;

  slug?: string;

  cover?: { url: string; alternativeText?: string | null } | null;
  image?: { url: string } | null;
};

const FALLBACK_IMAGES = [
  "/hero/1.jpg",
  "/hero/2.jpg",
  "/hero/3.jpg",
  "/hero/4.jpg",
  "/hero/5.jpg",
  "/hero/6.jpg",
];

function getTag(n: NewsItem) {
  return (n.tag ?? n.type ?? "").trim();
}

function getFullText(n: NewsItem) {
  return (n.subtitle ?? n.excerpt ?? "").trim();
}

// ✅ на главной — только короткое превью
function makePreview(text: string, maxChars = 220) {
  const t = text.replace(/\s+/g, " ").trim();
  if (!t) return "";
  if (t.length <= maxChars) return t;
  return t.slice(0, maxChars).replace(/[,\s]+$/, "") + "…";
}

gsap.registerPlugin(ScrollTrigger);

export default function SupplyNewsSection({
  items = [],
  href = "/news",
  title = "Новости",
  subtitle = "Только важное: коллекции, сервис и материалы",
}: {
  items?: NewsItem[];
  href?: string;
  title?: string;
  subtitle?: string;
}) {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const [index, setIndex] = useState(0);

  const reduced = useMemo(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
  }, []);

  const canPrev = index > 0;
  const canNext = index < Math.max(0, items.length - 1);

  const scrollToIndex = (i: number) => {
    const track = trackRef.current;
    if (!track) return;

    const cards = Array.from(
      track.querySelectorAll<HTMLElement>("[data-card]"),
    );
    const el = cards[i];
    if (!el) return;

    const left = el.offsetLeft - 8;
    track.scrollTo({ left, behavior: "smooth" });
    setIndex(i);
  };

  useEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const onScroll = () => {
      const cards = Array.from(
        track.querySelectorAll<HTMLElement>("[data-card]"),
      );
      if (!cards.length) return;

      const x = track.scrollLeft;
      let best = 0;
      let bestDist = Infinity;

      for (let i = 0; i < cards.length; i++) {
        const d = Math.abs(cards[i].offsetLeft - x);
        if (d < bestDist) {
          bestDist = d;
          best = i;
        }
      }
      setIndex(best);
    };

    track.addEventListener("scroll", onScroll, { passive: true });
    return () => track.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (reduced) return;

    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const header = root.querySelector<HTMLElement>("[data-head]");
      const cards = root.querySelectorAll<HTMLElement>("[data-card]");

      if (header) {
        const kids = header.querySelectorAll<HTMLElement>("[data-head-item]");
        gsap.set(kids, { autoAlpha: 0, y: 16 });
        gsap.to(kids, {
          autoAlpha: 1,
          y: 0,
          duration: 0.85,
          ease: "power3.out",
          stagger: 0.07,
          scrollTrigger: { trigger: header, start: "top 88%", once: true },
        });
      }

      if (cards.length) {
        gsap.set(cards, { autoAlpha: 0, y: 18, scale: 0.992 });
        gsap.to(cards, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: { trigger: root, start: "top 80%", once: true },
        });
      }
    }, root);

    return () => ctx.revert();
  }, [reduced]);

  return (
    <section ref={rootRef} className="bg-white text-black">
      <div className="mx-auto w-full max-w-[1200px] px-4">
        {/* Header */}
        <div data-head className="pt-10 md:pt-14">
          <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
            <div>
              <div
                data-head-item
                className="text-[12px] tracking-[0.18em] text-black/50"
              >
                LIONETO • NEWS
              </div>
              <h2
                data-head-item
                className="mt-2 text-[22px] font-semibold tracking-[-0.01em] md:text-[30px]"
              >
                {title}
              </h2>
              <p
                data-head-item
                className="mt-2 max-w-2xl text-[14px] leading-7 text-black/70"
              >
                {subtitle}
              </p>
            </div>

            {/* Actions */}
            <div data-head-item className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => canPrev && scrollToIndex(index - 1)}
                className={cn(
                  "group inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border bg-white transition",
                  canPrev
                    ? "border-black/15 hover:border-black/25"
                    : "cursor-not-allowed border-black/10 opacity-50",
                )}
              >
                <ChevronLeft className="h-5 w-5 text-black/70 transition group-hover:-translate-x-0.5" />
              </button>

              <button
                type="button"
                onClick={() => canNext && scrollToIndex(index + 1)}
                className={cn(
                  "group inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border bg-white transition",
                  canNext
                    ? "border-black/15 hover:border-black/25"
                    : "cursor-not-allowed border-black/10 opacity-50",
                )}
              >
                <ChevronRight className="h-5 w-5 text-black/70 transition group-hover:translate-x-0.5" />
              </button>

              <Link
                href={href}
                className="group ml-2 inline-flex cursor-pointer items-center justify-center rounded-full bg-black px-5 py-3 text-[13px] font-medium tracking-[0.12em] text-white transition hover:opacity-90"
              >
                ВСЕ НОВОСТИ
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </Link>
            </div>
          </div>
        </div>

        {/* Track */}
        <div className="relative mt-7">
          {/*<div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-[linear-gradient(90deg,rgba(255,255,255,1),rgba(255,255,255,0))]" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-[linear-gradient(270deg,rgba(255,255,255,1),rgba(255,255,255,0))]" /> */}

          <div
            ref={trackRef}
            className="flex gap-4 overflow-x-auto pb-2 pr-2 scrollbar-hide snap-x snap-mandatory"
          >
            {items.map((n, i) => {
              const imgSrc =
                n.cover?.url || FALLBACK_IMAGES[i % FALLBACK_IMAGES.length];

              const tag = getTag(n);
              const fullText = getFullText(n);
              const preview = makePreview(fullText, 220);

              return (
                <Link
                  key={String(n.id)}
                  href={href}
                  data-card
                  className={cn(
                    "group relative min-w-[290px] max-w-[290px] snap-start cursor-pointer",
                    "overflow-hidden rounded-[28px] border border-black/10 bg-white",
                    "transition hover:border-black/20",
                    "md:min-w-[360px] md:max-w-[360px]",
                  )}
                >
                  <div className="relative h-[170px] w-full overflow-hidden md:h-[190px]">
                    <Image
                      src={imgSrc}
                      alt={n.title}
                      fill
                      unoptimized
                      sizes="(max-width: 768px) 290px, 360px"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                      priority={i < 2}
                    />

                    <div className="absolute left-4 top-4 z-20 flex items-center gap-2">
                      {tag && (
                        <div className="rounded-full border border-white/60 bg-white/70 px-3 py-1 text-[11px] font-medium tracking-[0.18em] text-black/80 backdrop-blur-md">
                          {tag}
                        </div>
                      )}

                      {n.dateLabel && (
                        <div className="rounded-full border border-white/50 bg-white/55 px-3 py-1 text-[11px] font-medium tracking-[0.18em] text-black/75 backdrop-blur-md">
                          {n.dateLabel}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="p-5">
                    <div className="text-[11px] tracking-[0.18em] text-black/45">
                      НОВОСТЬ {String(i + 1).padStart(2, "0")}
                    </div>

                    <div className="mt-2 text-[16px] font-semibold leading-[1.15] tracking-[-0.01em] text-black/85">
                      {n.title}
                    </div>

                    {preview && (
                      <p className="mt-2 line-clamp-4 text-[13px] leading-6 text-black/65">
                        {preview}
                      </p>
                    )}

                    <div className="mt-5 flex items-center justify-between">
                      <div className="text-[12px] tracking-[0.18em] text-black/45">
                        ОТКРЫТЬ
                      </div>
                      <span className="text-[12px] tracking-[0.18em] text-black/60 group-hover:text-black">
                        Читать →
                      </span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
