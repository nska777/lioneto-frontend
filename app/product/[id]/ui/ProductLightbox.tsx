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
      {/* ✅ лёгкий затемнённый фон, но без “чёрных полос” внутри модалки */}
      <button
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px] cursor-zoom-out"
        onClick={onClose}
        aria-label="Закрыть"
        type="button"
      />

      {/* ✅ центр-карточка */}
      <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-8">
        <div
          className={cn(
            "relative w-full bg-white",
            "rounded-3xl border border-black/10",
            "shadow-[0_40px_140px_-60px_rgba(0,0,0,0.45)]",
            // ✅ НЕ на весь экран:
            // максимум 1100px по ширине и 82vh по высоте
            "max-w-[1100px] max-h-[82vh] overflow-hidden",
          )}
          role="dialog"
          aria-modal="true"
        >
          {/* крестик */}
          <button
            onClick={onClose}
            className={cn(
              "absolute right-4 top-4 z-10",
              "h-10 w-10 rounded-full bg-white/90 border border-black/10",
              "grid place-items-center shadow-[0_10px_30px_rgba(0,0,0,0.12)]",
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
                  "absolute left-4 top-1/2 -translate-y-1/2 z-10",
                  "h-11 w-11 rounded-full bg-white/90 border border-black/10",
                  "grid place-items-center shadow-[0_10px_30px_rgba(0,0,0,0.12)]",
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
                  "absolute right-4 top-1/2 -translate-y-1/2 z-10",
                  "h-11 w-11 rounded-full bg-white/90 border border-black/10",
                  "grid place-items-center shadow-[0_10px_30px_rgba(0,0,0,0.12)]",
                  "hover:bg-white transition cursor-pointer",
                )}
                aria-label="Следующее фото"
                type="button"
              >
                <ChevronRight className="h-6 w-6 text-black/70" />
              </button>
            </>
          )}

          {/* картинка (внутри карточки) */}
          <div className="relative w-full h-[82vh] max-h-[82vh]">
            <Image
              src={gallery[idx]}
              alt={title}
              fill
              priority
              sizes="(max-width: 768px) 92vw, 1100px"
              className="object-contain"
            />
          </div>

          {/* мини подпись снизу (по желанию) */}
          <div className="flex items-center justify-between px-5 py-3 border-t border-black/10">
            <div className="text-[12px] text-black/55 truncate">{title}</div>
            <div className="text-[12px] text-black/45">
              {idx + 1} / {Math.max(1, gallery.length)}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
