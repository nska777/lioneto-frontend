"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type {
  DealerMultimediaCollectionSlug,
  DealerMultimediaItem,
} from "@/app/lib/dealer/multimedia";

type Props = {
  collectionSlug: DealerMultimediaCollectionSlug;
  collectionTitle: string;
  photos: DealerMultimediaItem[];
};

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

function GalleryLightbox({
  open,
  photo,
  currentIndex,
  total,
  onClose,
  onPrev,
  onNext,
}: {
  open: boolean;
  photo: DealerMultimediaItem | null;
  currentIndex: number;
  total: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  useEffect(() => {
    if (!open) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
      if (event.key === "ArrowLeft") onPrev();
      if (event.key === "ArrowRight") onNext();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose, onPrev, onNext]);

  if (!open || !photo) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      <button
        type="button"
        aria-label="Закрыть"
        onClick={onClose}
        className="absolute inset-0 cursor-pointer bg-black/70"
      />

      <div className="absolute inset-0 flex items-center justify-center p-4 sm:p-6">
        <div
          className={cn(
            "relative w-[min(88vw,1280px)] overflow-hidden rounded-[24px]",
            "border border-white/10 bg-[#111] shadow-[0_30px_100px_-40px_rgba(0,0,0,0.9)]",
          )}
        >
          <div className="flex items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
            <div className="min-w-0">
              <div className="text-[11px] font-semibold tracking-[0.14em] text-white/45">
                {photo.collectionSlug.toUpperCase()}
              </div>
              <div className="truncate text-sm font-semibold text-white sm:text-[15px]">
                {photo.title}
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="rounded-full border border-white/10 px-3 py-1 text-xs font-semibold text-white/70">
                {currentIndex + 1} / {total}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/80 transition hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="relative bg-black">
            <div className="flex min-h-[72vh] items-center justify-center px-3 py-3 sm:min-h-[82vh] sm:px-6">
              {photo.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={photo.imageUrl}
                  alt={photo.title}
                  className="max-h-[82vh] w-auto max-w-full object-contain"
                  draggable={false}
                />
              ) : null}
            </div>

            {total > 1 ? (
              <>
                <button
                  type="button"
                  onClick={onPrev}
                  aria-label="Предыдущее фото"
                  className={cn(
                    "absolute left-3 top-1/2 -translate-y-1/2",
                    "inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full",
                    "border border-white/10 bg-black/45 text-white/85 backdrop-blur-sm",
                    "transition hover:bg-black/60 hover:text-white",
                  )}
                >
                  <ChevronLeft className="h-5 w-5" />
                </button>

                <button
                  type="button"
                  onClick={onNext}
                  aria-label="Следующее фото"
                  className={cn(
                    "absolute right-3 top-1/2 -translate-y-1/2",
                    "inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full",
                    "border border-white/10 bg-black/45 text-white/85 backdrop-blur-sm",
                    "transition hover:bg-black/60 hover:text-white",
                  )}
                >
                  <ChevronRight className="h-5 w-5" />
                </button>
              </>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-white/10 px-4 py-3 sm:px-5">
            <div className="text-xs text-white/50"></div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function PhotoCollectionClient({
  collectionSlug,
  collectionTitle,
  photos,
}: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const activePhoto = useMemo(() => {
    if (activeIndex === null) return null;
    return photos[activeIndex] ?? null;
  }, [activeIndex, photos]);

  function openAt(index: number) {
    setActiveIndex(index);
  }

  function closeLightbox() {
    setActiveIndex(null);
  }

  function showPrev() {
    if (!photos.length) return;
    setActiveIndex((prev) => {
      if (prev === null) return 0;
      return prev === 0 ? photos.length - 1 : prev - 1;
    });
  }

  function showNext() {
    if (!photos.length) return;
    setActiveIndex((prev) => {
      if (prev === null) return 0;
      return prev === photos.length - 1 ? 0 : prev + 1;
    });
  }

  return (
    <div className="space-y-4">
      <div className="space-y-3">
        <Link
          href="/dealer/multimedia"
          className="inline-flex items-center rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black/70 transition-colors hover:text-black"
        >
          <ChevronLeft className="mr-1 h-4 w-4" />
          Назад
        </Link>

        <header>
          <h1 className="text-[20px] font-semibold tracking-[-0.02em] text-black sm:text-[22px]">
            {collectionTitle}
          </h1>
          <p className="mt-1 text-sm text-black/55">
            Коллекция: {collectionSlug.toUpperCase()} · {photos.length} фото
          </p>
        </header>
      </div>

      {photos.length === 0 ? (
        <div className="rounded-[16px] border border-black/10 bg-white px-4 py-4 text-sm text-black/55">
          В этой коллекции пока нет фотографий.
        </div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          {photos.map((photo, index) => (
            <button
              key={photo.id}
              type="button"
              onClick={() => openAt(index)}
              className={cn(
                "group cursor-pointer overflow-hidden rounded-[16px] border border-black/10 bg-white text-left",
                "transition-transform duration-300 ease-out hover:-translate-y-[2px]",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/15",
                "max-w-[340px]",
              )}
            >
              <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/[0.03]">
                {photo.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={photo.imageUrl}
                    alt={photo.title}
                    className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
                    draggable={false}
                  />
                ) : null}

                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/35 to-transparent px-2.5 pb-2.5 pt-8">
                  <div className="inline-flex rounded-full border border-white/25 bg-black/20 px-2 py-0.5 text-[10px] font-semibold tracking-[0.10em] text-white backdrop-blur-sm">
                    {index + 1} / {photos.length}
                  </div>
                </div>
              </div>

              <div className="px-3 py-2.5">
                <div className="text-[10px] font-semibold tracking-[0.12em] text-black/45">
                  {collectionTitle}
                </div>
                <div className="mt-1 line-clamp-2 text-[13px] font-semibold leading-[1.25] text-black">
                  {photo.title}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      <GalleryLightbox
        open={activeIndex !== null}
        photo={activePhoto}
        currentIndex={activeIndex ?? 0}
        total={photos.length}
        onClose={closeLightbox}
        onPrev={showPrev}
        onNext={showNext}
      />
    </div>
  );
}
