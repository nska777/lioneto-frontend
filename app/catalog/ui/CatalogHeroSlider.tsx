// app/catalog/ui/CatalogHeroSlider.tsx
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

// ✅ preload cache (чтобы клик был мгновенным)
const __heroImgCache = new Set<string>();

function preloadImage(src: string) {
  if (!src) return Promise.resolve();
  if (__heroImgCache.has(src)) return Promise.resolve();

  return new Promise<void>((resolve) => {
    const img = new window.Image();
    img.onload = async () => {
      __heroImgCache.add(src);
      try {
        // @ts-ignore
        if (img.decode) await img.decode();
      } catch {}
      resolve();
    };
    img.onerror = () => resolve();
    img.src = src;
  });
}

export default function CatalogHeroSlider({
  slides,
  title,
  subtitle,
}: {
  slides: string[];
  title?: string;
  subtitle?: string;
}) {
  const safeSlides = useMemo(() => (slides || []).filter(Boolean), [slides]);

  const [idx, setIdx] = useState(0);

  // ✅ один источник правды для Image src
  const [srcA, setSrcA] = useState<string>("");
  const [srcB, setSrcB] = useState<string>("");

  // ✅ refs чтобы клики были мгновенные и без “залипания”
  const idxRef = useRef(0);
  const frontRef = useRef<0 | 1>(0);
  const [front, setFront] = useState<0 | 1>(0);

  const lockRef = useRef(false);
  const pendingRef = useRef<number | null>(null);

  const normIndex = (i: number) =>
    safeSlides.length ? (i + safeSlides.length) % safeSlides.length : 0;

  useEffect(() => {
    idxRef.current = idx;
  }, [idx]);

  useEffect(() => {
    frontRef.current = front;
  }, [front]);

  // reset + preload
  useEffect(() => {
    const first = safeSlides[0] || "";
    const second = safeSlides.length > 1 ? safeSlides[1] : first;

    setIdx(0);
    idxRef.current = 0;

    setFront(0);
    frontRef.current = 0;

    lockRef.current = false;
    pendingRef.current = null;

    setSrcA(first);
    setSrcB(second);

    if (safeSlides.length) {
      void preloadImage(first);
      if (second) void preloadImage(second);

      const prev =
        safeSlides.length > 2 ? safeSlides[safeSlides.length - 1] : "";
      if (prev) void preloadImage(prev);

      // тихо прогреем всё
      safeSlides.forEach((s) => void preloadImage(s));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [safeSlides.join("|")]);

  if (!safeSlides.length) return null;

  async function goTo(targetIndex: number) {
    if (safeSlides.length <= 1) return;

    const ni = normIndex(targetIndex);
    if (ni === idxRef.current) return;

    // если жмут быстро — запоминаем последний запрос
    if (lockRef.current) {
      pendingRef.current = ni;
      return;
    }

    lockRef.current = true;

    const nextSrc = safeSlides[ni] || safeSlides[0];

    // ✅ ВАЖНО: сначала прогрели картинку, потом переключили слой
    await preloadImage(nextSrc);

    const curFront = frontRef.current;

    if (curFront === 0) setSrcB(nextSrc);
    else setSrcA(nextSrc);

    // мгновенно переключаем “передний” слой
    const nextFront: 0 | 1 = curFront === 0 ? 1 : 0;
    setFront(nextFront);
    frontRef.current = nextFront;

    setIdx(ni);
    idxRef.current = ni;

    // прогреем соседние (след/пред)
    const n1 = safeSlides[normIndex(ni + 1)];
    const p1 = safeSlides[normIndex(ni - 1)];
    if (n1) void preloadImage(n1);
    if (p1) void preloadImage(p1);

    lockRef.current = false;

    const pending = pendingRef.current;
    pendingRef.current = null;
    if (pending !== null && pending !== ni) {
      // без задержек
      void goTo(pending);
    }
  }

  function goBy(delta: number) {
    void goTo(idxRef.current + delta);
  }

  // какие src показываем сейчас (по front)
  const fallbackCurrent = safeSlides[idxRef.current] || safeSlides[0];
  const showSrcA = srcA || fallbackCurrent;
  const showSrcB =
    srcB || safeSlides[normIndex(idxRef.current + 1)] || fallbackCurrent;

  return (
    <div
      className="
        relative w-full overflow-hidden
        border border-black/10 bg-white
        shadow-[0_18px_60px_-40px_rgba(0,0,0,0.35)]
        rounded-[0px]
        h-[260px]
        sm:h-[420px]
        xl:h-[532px]
      "
    >
      {/* Слои */}
      <div className="absolute inset-0">
        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-150",
            front === 0 ? "opacity-100" : "opacity-0",
          )}
        >
          <Image
            src={showSrcA}
            alt={title || "collection"}
            fill
            priority
            className="object-cover"
            sizes="100vw"
          />
        </div>

        <div
          className={cn(
            "absolute inset-0 transition-opacity duration-150",
            front === 1 ? "opacity-100" : "opacity-0",
          )}
        >
          <Image
            src={showSrcB}
            alt={title || "collection"}
            fill
            className="object-cover"
            sizes="100vw"
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-black/0 to-transparent pointer-events-none" />
      </div>

      {/* Точки */}
      {safeSlides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 z-30 -translate-x-1/2 flex items-center gap-2">
          {safeSlides.slice(0, 12).map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => void goTo(i)}
              aria-label={`slide-${i + 1}`}
              className={cn(
                "h-[6px] w-[6px] rounded-full transition cursor-pointer",
                i === idx ? "bg-white" : "bg-white/35 hover:bg-white/55",
              )}
            />
          ))}
        </div>
      )}

      {/* Стрелки */}
      {safeSlides.length > 1 && (
        <>
          <button
            type="button"
            onClick={() => goBy(-1)}
            className="absolute left-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white backdrop-blur-md hover:bg-white/15 cursor-pointer"
            aria-label="prev"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>

          <button
            type="button"
            onClick={() => goBy(1)}
            className="absolute right-4 top-1/2 z-20 -translate-y-1/2 rounded-full bg-white/10 p-2 text-white backdrop-blur-md hover:bg-white/15 cursor-pointer"
            aria-label="next"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
    </div>
  );
}
