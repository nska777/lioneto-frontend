"use client";

import React, { useEffect, useMemo, useRef, useState } from "react";

type CollectionKey =
  | "amber"
  | "scandy"
  | "elizabeth"
  | "salvador"
  | "pitti"
  | "buongiorno";

type MediaKind = "photo" | "video";

type PhotoItem = {
  id: string;
  kind: "photo";
  collection: CollectionKey;
  title: string;
  src: string; // later: Strapi url
};

type VideoItem = {
  id: string;
  kind: "video";
  collection: CollectionKey;
  title: string;
  poster: string; // preview image
  src: string; // mp4 url for now (later: youtube/strapi)
  duration?: string; // "02:14"
};

type MediaItem = PhotoItem | VideoItem;

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

function titleFromCollectionKey(k: CollectionKey): string {
  switch (k) {
    case "amber":
      return "AMBER";
    case "scandy":
      return "SCANDY";
    case "elizabeth":
      return "ELIZABETH";
    case "salvador":
      return "SALVADOR";
    case "pitti":
      return "PITTI";
    case "buongiorno":
      return "BUONGIORNO";
  }
}

const COLLECTIONS: CollectionKey[] = [
  "amber",
  "scandy",
  "elizabeth",
  "salvador",
  "pitti",
  "buongiorno",
];

/**
 * ✅ MOCK DATA (replace with Strapi later)
 * Put your real assets into /public/dealer/media/... when ready.
 */
const PHOTOS: PhotoItem[] = [
  {
    id: "ph-amber-1",
    kind: "photo",
    collection: "amber",
    title: "AMBER — showroom",
    src: "/dealer/media/photos/amber/01.jpg",
  },
  {
    id: "ph-scandy-1",
    kind: "photo",
    collection: "scandy",
    title: "SCANDY — detail",
    src: "/dealer/media/photos/scandy/01.jpg",
  },
  {
    id: "ph-elizabeth-1",
    kind: "photo",
    collection: "elizabeth",
    title: "ELIZABETH — composition",
    src: "/dealer/media/photos/elizabeth/01.jpg",
  },
];

const VIDEOS: VideoItem[] = [
  {
    id: "vd-amber-1",
    kind: "video",
    collection: "amber",
    title: "AMBER — обзор коллекции",
    poster: "/dealer/media/videos/amber/poster.jpg",
    src: "/dealer/media/videos/amber/overview.mp4",
    duration: "02:10",
  },
  {
    id: "vd-scandy-1",
    kind: "video",
    collection: "scandy",
    title: "SCANDY — презентация",
    poster: "/dealer/media/videos/scandy/poster.jpg",
    src: "/dealer/media/videos/scandy/pres.mp4",
    duration: "01:42",
  },
];

function PremiumAccentPill({ active }: { active: boolean }) {
  // neutral “gold-ish” (not bright gold)
  const bg = active ? "#F3EBD2" : "transparent";
  const border = active ? "rgba(189,160,86,0.28)" : "rgba(0,0,0,0.10)";
  return (
    <span
      className="absolute inset-0 rounded-full"
      style={{ background: bg, border: `1px solid ${border}` }}
      aria-hidden="true"
    />
  );
}

function IconPlus({ open }: { open: boolean }) {
  // A clean plus that rotates to "x"
  return (
    <span
      className={cn(
        "relative inline-flex h-9 w-9 items-center justify-center rounded-full",
        "border border-black/10 bg-white",
        "transition-transform duration-300 ease-out",
        open ? "rotate-45" : "rotate-0",
      )}
      aria-hidden="true"
    >
      <span className="absolute h-[14px] w-[2px] rounded-full bg-black/70" />
      <span className="absolute h-[2px] w-[14px] rounded-full bg-black/70" />
    </span>
  );
}

function useMeasureHeight<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);
  const [h, setH] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ro = new ResizeObserver(() => {
      setH(el.scrollHeight);
    });

    ro.observe(el);
    setH(el.scrollHeight);

    return () => ro.disconnect();
  }, []);

  return { ref, height: h };
}

function AccordionRow({
  title,
  subtitle,
  open,
  onToggle,
  children,
}: {
  title: string;
  subtitle?: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const { ref, height } = useMeasureHeight<HTMLDivElement>();

  return (
    <div className="rounded-[18px] bg-white">
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "w-full cursor-pointer select-none",
          "rounded-[18px] border bg-white px-5 py-5",
          "text-left transition-colors hover:bg-black/[0.02]",
          "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/15",
        )}
        style={{ borderColor: "rgba(0,0,0,0.10)" }}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <div className="text-[14px] font-extrabold tracking-[0.14em] text-black">
              {title}
            </div>
            {subtitle ? (
              <div className="mt-1 text-sm text-black/55">{subtitle}</div>
            ) : null}
          </div>
          <IconPlus open={open} />
        </div>
      </button>

      <div
        className="overflow-hidden transition-[max-height,opacity] duration-500 ease-out"
        style={{ maxHeight: open ? height + 16 : 0, opacity: open ? 1 : 0 }}
      >
        <div ref={ref} className="px-5 pb-5 pt-4">
          {children}
        </div>
      </div>
    </div>
  );
}

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative inline-flex cursor-pointer items-center justify-center",
        "rounded-full px-4 py-2 text-xs font-semibold tracking-[0.12em] uppercase",
        "text-black/70 hover:text-black transition-colors",
      )}
    >
      <PremiumAccentPill active={active} />
      <span className="relative">{label}</span>
    </button>
  );
}

function Lightbox({
  open,
  onClose,
  children,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[9999]">
      <button
        type="button"
        aria-label="Close"
        onClick={onClose}
        className="absolute inset-0 cursor-pointer bg-black/35"
      />
      <div className="absolute left-1/2 top-1/2 w-[min(980px,calc(100vw-24px))] -translate-x-1/2 -translate-y-1/2">
        <div
          className="rounded-[18px] border bg-white shadow-[0_22px_70px_-34px_rgba(0,0,0,0.45)]"
          style={{ borderColor: "rgba(189,160,86,0.22)" }}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-[16px] border border-black/10 bg-white px-4 py-4 text-sm text-black/55">
      {text}
    </div>
  );
}

function PhotoGrid({
  items,
  onOpen,
}: {
  items: PhotoItem[];
  onOpen: (id: string) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((p) => (
        <button
          key={p.id}
          type="button"
          onClick={() => onOpen(p.id)}
          className={cn(
            "group cursor-pointer text-left",
            "rounded-[16px] border border-black/10 bg-white overflow-hidden",
            "transition-transform duration-300 ease-out hover:-translate-y-[2px]",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/15",
          )}
        >
          <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/[0.02]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={p.src}
              alt={p.title}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              draggable={false}
            />
          </div>

          <div className="px-4 py-3">
            <div className="text-xs font-semibold tracking-[0.12em] text-black/45">
              {titleFromCollectionKey(p.collection)}
            </div>
            <div className="mt-1 text-sm font-semibold text-black">
              {p.title}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

function VideoGrid({
  items,
  onOpen,
}: {
  items: VideoItem[];
  onOpen: (id: string) => void;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((v) => (
        <button
          key={v.id}
          type="button"
          onClick={() => onOpen(v.id)}
          className={cn(
            "group cursor-pointer text-left",
            "rounded-[16px] border border-black/10 bg-white overflow-hidden",
            "transition-transform duration-300 ease-out hover:-translate-y-[2px]",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/15",
          )}
        >
          <div className="relative aspect-[16/9] w-full overflow-hidden bg-black/[0.02]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={v.poster}
              alt={v.title}
              className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
              draggable={false}
            />

            <div className="absolute inset-0 flex items-center justify-center">
              <span className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/45 bg-black/35 backdrop-blur-[2px]">
                <span className="ml-[2px] h-0 w-0 border-y-[7px] border-y-transparent border-l-[11px] border-l-white/90" />
              </span>
            </div>

            {v.duration ? (
              <div className="absolute bottom-2 right-2 rounded-full border border-white/25 bg-black/45 px-3 py-1 text-xs font-semibold text-white/90">
                {v.duration}
              </div>
            ) : null}
          </div>

          <div className="px-4 py-3">
            <div className="text-xs font-semibold tracking-[0.12em] text-black/45">
              {titleFromCollectionKey(v.collection)}
            </div>
            <div className="mt-1 text-sm font-semibold text-black">
              {v.title}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}

export default function Page() {
  const [openKey, setOpenKey] = useState<MediaKind | null>("photo");
  const [collection, setCollection] = useState<CollectionKey | "all">("all");

  // lightbox state
  const [lightboxPhotoId, setLightboxPhotoId] = useState<string | null>(null);
  const [lightboxVideoId, setLightboxVideoId] = useState<string | null>(null);

  const filteredPhotos = useMemo(() => {
    if (collection === "all") return PHOTOS;
    return PHOTOS.filter((p) => p.collection === collection);
  }, [collection]);

  const filteredVideos = useMemo(() => {
    if (collection === "all") return VIDEOS;
    return VIDEOS.filter((v) => v.collection === collection);
  }, [collection]);

  const activePhoto = useMemo(() => {
    if (!lightboxPhotoId) return null;
    return PHOTOS.find((p) => p.id === lightboxPhotoId) ?? null;
  }, [lightboxPhotoId]);

  const activeVideo = useMemo(() => {
    if (!lightboxVideoId) return null;
    return VIDEOS.find((v) => v.id === lightboxVideoId) ?? null;
  }, [lightboxVideoId]);

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm text-black/45">Dealer Portal</div>
          <h1 className="mt-1 text-[22px] font-semibold tracking-[-0.02em] text-black">
            Мультимедиа
          </h1>
          <p className="mt-1 text-sm text-black/55">
            Фото и видео материалы по коллекциям. Премиальная витрина — без
            “синего”, без дерганий, всё кликабельное.
          </p>
        </div>
      </header>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-2">
        <Chip
          label="Все"
          active={collection === "all"}
          onClick={() => setCollection("all")}
        />
        {COLLECTIONS.map((c) => (
          <Chip
            key={c}
            label={titleFromCollectionKey(c)}
            active={collection === c}
            onClick={() => setCollection(c)}
          />
        ))}
      </div>

      {/* Accordions */}
      <div className="space-y-4">
        <AccordionRow
          title="ФОТОГАЛЕРЕЯ"
          subtitle="Готовые материалы для витрин, соцсетей и презентаций."
          open={openKey === "photo"}
          onToggle={() => setOpenKey((p) => (p === "photo" ? null : "photo"))}
        >
          {filteredPhotos.length === 0 ? (
            <EmptyState text="Пока нет фото в этой коллекции. Добавьте ассеты в /public/dealer/media/photos/..." />
          ) : (
            <PhotoGrid
              items={filteredPhotos}
              onOpen={(id) => setLightboxPhotoId(id)}
            />
          )}
        </AccordionRow>

        <AccordionRow
          title="ВИДЕОГАЛЕРЕЯ"
          subtitle="Обзоры коллекций, короткие клипы, материалы для продавцов."
          open={openKey === "video"}
          onToggle={() => setOpenKey((p) => (p === "video" ? null : "video"))}
        >
          {filteredVideos.length === 0 ? (
            <EmptyState text="Пока нет видео в этой коллекции. Добавьте ассеты в /public/dealer/media/videos/..." />
          ) : (
            <VideoGrid
              items={filteredVideos}
              onOpen={(id) => setLightboxVideoId(id)}
            />
          )}
        </AccordionRow>
      </div>

      {/* Photo Lightbox */}
      <Lightbox open={!!activePhoto} onClose={() => setLightboxPhotoId(null)}>
        {activePhoto ? (
          <div className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs font-semibold tracking-[0.12em] text-black/45">
                  {titleFromCollectionKey(activePhoto.collection)}
                </div>
                <div className="mt-1 truncate text-[16px] font-semibold text-black">
                  {activePhoto.title}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setLightboxPhotoId(null)}
                className="cursor-pointer rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-black/70 hover:text-black transition-colors"
              >
                Закрыть
              </button>
            </div>

            <div className="mt-4 overflow-hidden rounded-[16px] border border-black/10 bg-black/[0.02]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={activePhoto.src}
                alt={activePhoto.title}
                className="max-h-[70vh] w-full object-contain"
                draggable={false}
              />
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-black/55">
                Если нужно — добавим скачивание оригинала и “копировать ссылку”.
              </div>

              <a
                href={activePhoto.src}
                download
                className="cursor-pointer rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black/70 hover:text-black transition-colors"
              >
                Скачать
              </a>
            </div>
          </div>
        ) : null}
      </Lightbox>

      {/* Video Lightbox */}
      <Lightbox open={!!activeVideo} onClose={() => setLightboxVideoId(null)}>
        {activeVideo ? (
          <div className="p-4 sm:p-5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-xs font-semibold tracking-[0.12em] text-black/45">
                  {titleFromCollectionKey(activeVideo.collection)}
                </div>
                <div className="mt-1 truncate text-[16px] font-semibold text-black">
                  {activeVideo.title}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setLightboxVideoId(null)}
                className="cursor-pointer rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-black/70 hover:text-black transition-colors"
              >
                Закрыть
              </button>
            </div>

            <div className="mt-4 overflow-hidden rounded-[16px] border border-black/10 bg-black">
              <video
                className="h-auto w-full"
                controls
                playsInline
                preload="metadata"
                poster={activeVideo.poster}
              >
                <source src={activeVideo.src} type="video/mp4" />
              </video>
            </div>

            <div className="mt-4 flex items-center justify-between">
              <div className="text-sm text-black/55">
                Позже можно добавить YouTube/Vimeo, а также закрытую библиотеку
                из Strapi.
              </div>

              <a
                href={activeVideo.src}
                download
                className="cursor-pointer rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-semibold text-black/70 hover:text-black transition-colors"
              >
                Скачать
              </a>
            </div>
          </div>
        ) : null}
      </Lightbox>
    </div>
  );
}
