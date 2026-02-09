// app/catalog/ui/CatalogHeroSlider.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import gsap from "gsap";
import { ChevronLeft, ChevronRight } from "lucide-react";

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

export default function CatalogHeroSlider({
  slides,
  title,
  subtitle,
  height = 360,
}: {
  slides: string[];
  title?: string;
  subtitle?: string;
  height?: number;
}) {
  const safeSlides = useMemo(() => (slides || []).filter(Boolean), [slides]);
  const [idx, setIdx] = useState(0);

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const imgARef = useRef<HTMLDivElement | null>(null);
  const imgBRef = useRef<HTMLDivElement | null>(null);

  const [front, setFront] = useState<0 | 1>(0);

  // ✅ блокируем повторные клики пока идёт анимация
  const animLockRef = useRef(false);
  const pendingIdxRef = useRef<number | null>(null);

  useEffect(() => {
    setIdx(0);
    setFront(0);
    animLockRef.current = false;
    pendingIdxRef.current = null;
  }, [safeSlides.join("|")]);

  if (!safeSlides.length) return null;

  const current = safeSlides[idx] || safeSlides[0];

  const normIndex = (i: number) => (i + safeSlides.length) % safeSlides.length;

  function goTo(targetIndex: number) {
    if (safeSlides.length <= 1) return;

    const ni = normIndex(targetIndex);
    if (ni === idx) return;

    // если уже идёт анимация — просто запомним последнюю цель
    if (animLockRef.current) {
      pendingIdxRef.current = ni;
      return;
    }

    const A = imgARef.current;
    const B = imgBRef.current;
    if (!A || !B) {
      setIdx(ni);
      return;
    }

    animLockRef.current = true;

    const top = front === 0 ? A : B;
    const under = front === 0 ? B : A;

    // кладём новый src на нижний слой
    under.setAttribute("data-src", safeSlides[ni]);

    gsap.killTweensOf([top, under]);

    // ⚡️ blur можно оставить минимальным, но лучше вообще убрать
    gsap.set(under, { opacity: 0, scale: 1.02 });
    gsap.to(top, {
      opacity: 0,
      scale: 1.02,
      duration: 0.5,
      ease: "power3.out",
    });
    gsap.to(under, {
      opacity: 1,
      scale: 1,
      duration: 0.6,
      ease: "power3.out",
      onComplete: () => {
        setFront(front === 0 ? 1 : 0);
        setIdx(ni);

        animLockRef.current = false;

        // если пока анимировали — пришла новая цель, сразу идём туда
        const pending = pendingIdxRef.current;
        pendingIdxRef.current = null;
        if (pending !== null && pending !== ni) {
          // дать React обновить idx/front
          requestAnimationFrame(() => goTo(pending));
        }
      },
    });
  }

  function goBy(delta: number) {
    goTo(idx + delta);
  }

  // src для отображения
  const showSrcA =
    front === 0
      ? current
      : imgARef.current?.getAttribute("data-src") || current;

  const showSrcB =
    front === 1
      ? current
      : imgBRef.current?.getAttribute("data-src") ||
        safeSlides[normIndex(idx + 1)];

  return (
    <div
      ref={wrapRef}
      className="relative overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-[0_18px_60px_-40px_rgba(0,0,0,0.35)]"
      style={{ height }}
    >
      {/* слои */}
      <div className="absolute inset-0">
        <div
          ref={imgARef}
          data-src={current}
          className={cn(
            "absolute inset-0",
            front === 0 ? "opacity-100" : "opacity-0",
          )}
        >
          <Image
            src={showSrcA}
            alt={title || "collection"}
            fill
            priority
            className="object-cover"
            sizes="(max-width: 1200px) 100vw, 1200px"
          />
        </div>

        <div
          ref={imgBRef}
          data-src={safeSlides[normIndex(idx + 1)]}
          className={cn(
            "absolute inset-0",
            front === 1 ? "opacity-100" : "opacity-0",
          )}
        >
          <Image
            src={showSrcB}
            alt={title || "collection"}
            fill
            className="object-cover"
            sizes="(max-width: 1200px) 100vw, 1200px"
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
      </div>

      {/* контент */}
      <div className="relative z-10 flex h-full flex-col justify-end p-6">
        {subtitle ? (
          <div className="text-[12px] tracking-[0.22em] uppercase text-white/80">
            {subtitle}
          </div>
        ) : null}
        {title ? (
          <div className="mt-2 text-[28px] font-medium tracking-[-0.02em] text-white">
            {title}
          </div>
        ) : null}

        {/* точки */}
        {safeSlides.length > 1 ? (
          <div className="mt-4 flex items-center gap-2">
            {safeSlides.slice(0, 7).map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)} // ✅ важно: goTo, а не go
                className={cn(
                  "h-[6px] w-[6px] rounded-full transition cursor-pointer",
                  i === idx ? "bg-white" : "bg-white/35 hover:bg-white/55",
                )}
                aria-label={`slide-${i + 1}`}
              />
            ))}
          </div>
        ) : null}
      </div>

      {/* стрелки */}
      {safeSlides.length > 1 ? (
        <>
          <button
            onClick={() => goBy(-1)}
            className="absolute left-4 top-1/2 z-20 -translate-y-1/2 cursor-pointer rounded-full border border-white/20 bg-white/10 p-2 text-white backdrop-blur-md hover:bg-white/15"
            aria-label="prev"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            onClick={() => goBy(1)}
            className="absolute right-4 top-1/2 z-20 -translate-y-1/2 cursor-pointer rounded-full border border-white/20 bg-white/10 p-2 text-white backdrop-blur-md hover:bg-white/15"
            aria-label="next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      ) : null}
    </div>
  );
}
