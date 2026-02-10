"use client";

import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

export default function ProductGallery({
  title,
  gallery,
  activeIdx,
  setActiveIdx,
  onPrev,
  onNext,
  onOpenLightbox,
}: {
  title: string;
  gallery: string[];
  activeIdx: number;
  setActiveIdx: (n: number) => void;
  onPrev: () => void;
  onNext: () => void;
  onOpenLightbox: (idx: number) => void;
}) {
  const safeGallery = gallery?.length ? gallery : [];
  const safeIdx =
    safeGallery.length > 0
      ? Math.min(Math.max(activeIdx, 0), safeGallery.length - 1)
      : 0;

  const showThumbs = safeGallery.length > 1;

  const thumbsCols =
    safeGallery.length === 2
      ? "grid-cols-2"
      : safeGallery.length === 3
        ? "grid-cols-3"
        : "grid-cols-4";

  return (
    <section>
      <div className="relative aspect-square overflow-hidden rounded-3xl bg-black/[0.03]">
        {safeGallery.length ? (
          <>
            <button
              type="button"
              onClick={() => onOpenLightbox(safeIdx)}
              className="absolute inset-0 cursor-zoom-in"
              aria-label="Открыть фото в полный размер"
            />

            <Image
              src={safeGallery[safeIdx]}
              alt={title}
              fill
              priority
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 520px"
            />

            {safeGallery.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onPrev();
                  }}
                  className={cn(
                    "absolute left-3 top-1/2 -translate-y-1/2 z-10",
                    "h-11 w-11 rounded-full bg-white/90 border border-black/10",
                    "grid place-items-center shadow-[0_10px_30px_rgba(0,0,0,0.10)]",
                    "hover:bg-white transition cursor-pointer",
                  )}
                  aria-label="Предыдущее фото"
                >
                  <ChevronLeft className="h-5 w-5 text-black/70" />
                </button>

                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onNext();
                  }}
                  className={cn(
                    "absolute right-3 top-1/2 -translate-y-1/2 z-10",
                    "h-11 w-11 rounded-full bg-white/90 border border-black/10",
                    "grid place-items-center shadow-[0_10px_30px_rgba(0,0,0,0.10)]",
                    "hover:bg-white transition cursor-pointer",
                  )}
                  aria-label="Следующее фото"
                >
                  <ChevronRight className="h-5 w-5 text-black/70" />
                </button>
              </>
            )}

            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                onOpenLightbox(safeIdx);
              }}
              className={cn(
                "absolute right-3 bottom-3 z-10",
                "h-10 w-10 rounded-full bg-white/90 border border-black/10",
                "grid place-items-center shadow-[0_10px_30px_rgba(0,0,0,0.10)]",
                "hover:bg-white transition cursor-pointer",
              )}
              aria-label="Открыть в полный размер"
            >
              <Maximize2 className="h-4 w-4 text-black/70" />
            </button>
          </>
        ) : null}
      </div>

      {showThumbs ? (
        <div className={cn("mt-3 grid gap-2", thumbsCols)}>
          {safeGallery.map((src, i) => {
            const active = i === safeIdx;
            return (
              <button
                key={`${src}-${i}`}
                type="button"
                onClick={() => setActiveIdx(i)}
                className={cn(
                  "cursor-pointer relative aspect-square overflow-hidden rounded-2xl bg-black/[0.03] transition",
                  active
                    ? "ring-2 ring-black/20"
                    : "hover:ring-2 hover:ring-black/10",
                )}
                aria-label={`Фото ${i + 1}`}
              >
                <Image
                  src={src}
                  alt={`${title} ${i + 1}`}
                  fill
                  className="object-cover"
                  sizes="120px"
                />
              </button>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
