"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

export default function CollectionSceneGallery({
  title,
  gallery,
}: {
  title: string;
  gallery: string[];
}) {
  const safeGallery = useMemo(
    () => (Array.isArray(gallery) ? gallery.filter(Boolean) : []),
    [gallery],
  );
  const [idx, setIdx] = useState(0);

  const hasMany = safeGallery.length > 1;
  const active = safeGallery[idx] ?? safeGallery[0] ?? "";

  function prev() {
    if (!safeGallery.length) return;
    setIdx((v) => (v - 1 + safeGallery.length) % safeGallery.length);
  }
  function next() {
    if (!safeGallery.length) return;
    setIdx((v) => (v + 1) % safeGallery.length);
  }

  // ✅ если фоток стало меньше (например 2 вместо 3) — индекс не должен уехать в пустоту
  if (idx > safeGallery.length - 1 && safeGallery.length) {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    setIdx(0);
  }

  return (
    <div className="rounded-[28px] bg-black/[0.03] p-6">
      <div className="relative overflow-hidden rounded-[22px] bg-white">
        <div className="relative aspect-[16/10] w-full">
          {active ? (
            <Image
              src={active}
              alt={title}
              fill
              className="object-cover"
              sizes="(max-width: 1024px) 100vw, 720px"
              priority
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-black/40">
              Нет фото
            </div>
          )}
        </div>

        {hasMany ? (
          <>
            <button
              type="button"
              onClick={prev}
              aria-label="Prev"
              className="cursor-pointer absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-black/10 bg-white/90 p-3 shadow-sm hover:bg-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>

            <button
              type="button"
              onClick={next}
              aria-label="Next"
              className="cursor-pointer absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-black/10 bg-white/90 p-3 shadow-sm hover:bg-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </>
        ) : null}

        <div className="absolute bottom-3 right-3">
          <div className="rounded-full border border-black/10 bg-white/90 p-2 shadow-sm">
            <Maximize2 className="h-4 w-4 text-black/70" />
          </div>
        </div>
      </div>

      {/* ✅ Никаких “пустых” карточек: рисуем ровно сколько фоток есть */}
      {safeGallery.length > 1 ? (
        <div className="mt-4 flex gap-3 overflow-x-auto pb-1">
          {safeGallery.map((src, i) => (
            <button
              key={`${src}-${i}`}
              type="button"
              onClick={() => setIdx(i)}
              className={cn(
                "cursor-pointer relative h-[92px] w-[140px] shrink-0 overflow-hidden rounded-[18px] border bg-white",
                i === idx
                  ? "border-black/30"
                  : "border-black/10 hover:border-black/20",
              )}
              aria-label={`Thumb ${i + 1}`}
            >
              <Image
                src={src}
                alt={`${title} ${i + 1}`}
                fill
                className="object-cover"
                sizes="140px"
              />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
