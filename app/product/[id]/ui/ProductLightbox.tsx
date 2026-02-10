"use client";

import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

export default function ProductLightbox({
  open,
  title,
  gallery,
  idx,
  setIdx,
  onClose,
  onPrev,
  onNext,
}: {
  open: boolean;
  title: string;
  gallery: string[];
  idx: number;
  setIdx: (n: number) => void;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  if (!open) return null;

  const hasNav = gallery.length > 1;

  return (
    <div className="fixed inset-0 z-[100]">
      {/* фон */}
      <button
        className="absolute inset-0 bg-black/70 backdrop-blur-[2px] cursor-zoom-out"
        onClick={onClose}
        aria-label="Закрыть"
        type="button"
      />

      {/* FULLSCREEN viewport */}
      <div
        className="absolute inset-0"
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* крестик */}
        <button
          onClick={onClose}
          className={cn(
            "absolute right-5 top-5 z-20",
            "h-10 w-10 rounded-full bg-white/90 border border-black/10",
            "grid place-items-center shadow-[0_10px_30px_rgba(0,0,0,0.18)]",
            "hover:bg-white transition cursor-pointer",
          )}
          aria-label="Закрыть"
          type="button"
        >
          <X className="h-5 w-5 text-black/70" />
        </button>

        {/* стрелки */}
        {hasNav && (
          <>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onPrev();
              }}
              className={cn(
                "absolute left-5 top-1/2 -translate-y-1/2 z-20",
                "h-12 w-12 rounded-full bg-white/90 border border-black/10",
                "grid place-items-center shadow-[0_10px_30px_rgba(0,0,0,0.18)]",
                "hover:bg-white transition cursor-pointer",
              )}
              aria-label="Предыдущее фото"
              type="button"
            >
              <ChevronLeft className="h-6 w-6 text-black/70" />
            </button>

            <button
              onClick={(e) => {
                e.stopPropagation();
                onNext();
              }}
              className={cn(
                "absolute right-5 top-1/2 -translate-y-1/2 z-20",
                "h-12 w-12 rounded-full bg-white/90 border border-black/10",
                "grid place-items-center shadow-[0_10px_30px_rgba(0,0,0,0.18)]",
                "hover:bg-white transition cursor-pointer",
              )}
              aria-label="Следующее фото"
              type="button"
            >
              <ChevronRight className="h-6 w-6 text-black/70" />
            </button>
          </>
        )}

        {/* изображение на весь экран */}
        <div className="absolute inset-0 z-10">
          <Image
            src={gallery[idx]}
            alt={title}
            fill
            priority
            sizes="100vw"
            className="object-contain"
          />
        </div>

        {/* нижняя плашка (не мешает картинке) */}
        <div className="absolute bottom-5 left-1/2 z-20 -translate-x-1/2">
          <div
            className={cn(
              "flex items-center gap-3",
              "rounded-full border border-white/20 bg-black/35 backdrop-blur",
              "px-4 py-2",
            )}
          >
            <div className="max-w-[60vw] truncate text-[12px] text-white/85">
              {title}
            </div>
            <div className="text-[12px] text-white/70">
              {idx + 1} / {Math.max(1, gallery.length)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
