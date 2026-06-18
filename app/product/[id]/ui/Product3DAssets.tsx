"use client";

import React, { useEffect, useState } from "react";
import {
  Box,
  Download,
  FileArchive,
  Image as ImageIcon,
  X,
  ChevronDown,
  Camera,
  ArrowUpRight,
} from "lucide-react";

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

export type ProductTextureAsset = {
  title: string;
  url: string;
  preview?: string;
};

type ProductFileAsset = {
  url: string;
  name?: string;
};

type Props = {
  title: string;
  productId?: string;
  model3dFile?: ProductFileAsset | null;
  model3dOriginalFile?: ProductFileAsset | null;
  texturesArchiveFile?: ProductFileAsset | null;
  textureFiles?: ProductTextureAsset[];
};

function fileName(asset?: ProductFileAsset | null, fallback = "Файл") {
  if (asset?.name?.trim()) return asset.name.trim();

  const fromUrl = String(asset?.url ?? "")
    .split("/")
    .pop()
    ?.trim();

  return fromUrl || fallback;
}

function CompactAction({
  href,
  label,
  caption,
  icon,
  onClick,
}: {
  href?: string;
  label: string;
  caption?: string;
  icon: React.ReactNode;
  onClick?: () => void;
}) {
  const className = cn(
    "group inline-flex min-w-0 items-center gap-2 rounded-full border border-black/10 bg-white",
    "h-10 px-3 text-left transition hover:border-black/25 hover:bg-black/[0.02]",
  );

  const inner = (
    <>
      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-black text-white">
        {icon}
      </span>

      <span className="min-w-0 leading-none">
        <span className="block truncate text-[12px] font-semibold uppercase tracking-[0.08em] text-black">
          {label}
        </span>

        {caption ? (
          <span className="mt-1 block max-w-[150px] truncate text-[11px] text-black/45">
            {caption}
          </span>
        ) : null}
      </span>
    </>
  );

  if (href) {
    return (
      <a href={href} download className={className}>
        {inner}
      </a>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(className, "cursor-pointer")}
    >
      {inner}
    </button>
  );
}

function buildRoomPhotoUrl(productId?: string) {
  const botBaseUrl =
    process.env.NEXT_PUBLIC_RICHHOUSE_BOT_URL ||
    "https://t.me/RichHouseGameBot";

  const safeProductId = String(productId || "")
    .trim()
    .replace(/[^a-zA-Z0-9_-]/g, "_")
    .slice(0, 48);

  const source = safeProductId ? `room_photo_${safeProductId}` : "room_photo";

  return `${botBaseUrl}?start=${encodeURIComponent(source)}`;
}

export default function Product3DAssets({
  title,
  productId,
  model3dFile,
  model3dOriginalFile,
  texturesArchiveFile,
  textureFiles = [],
}: Props) {
  const [open, setOpen] = useState(false);
  const [viewerReady, setViewerReady] = useState(false);

  useEffect(() => {
    let alive = true;

    import("@google/model-viewer")
      .then(() => {
        if (alive) setViewerReady(true);
      })
      .catch(() => {
        if (alive) setViewerReady(false);
      });

    return () => {
      alive = false;
    };
  }, []);

  const hasModel = !!model3dFile?.url;
  const hasOriginal = !!model3dOriginalFile?.url;
  const hasArchive = !!texturesArchiveFile?.url;
  const hasTextures = textureFiles.length > 0;

  const roomPhotoUrl = buildRoomPhotoUrl(productId);

  if (!hasModel && !hasOriginal && !hasArchive && !hasTextures) {
    return (
      <section className="mt-4 rounded-2xl border border-black/10 bg-white px-3 py-3 shadow-[0_16px_46px_-42px_rgba(0,0,0,0.4)]">
        <div className="text-[9px] tracking-[0.18em] uppercase text-black/35">
          Визуализация
        </div>

        <h2 className="mt-0.5 text-[14px] font-semibold leading-tight text-black">
          Примерка в интерьере
        </h2>

        <a
          href={roomPhotoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 flex w-full items-center justify-between gap-3 rounded-2xl border border-black bg-black px-3 py-3 text-left text-white transition hover:bg-black/90"
        >
          <span className="flex min-w-0 items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-black">
              <Camera className="h-4 w-4" />
            </span>

            <span className="min-w-0">
              <span className="block text-[13px] font-semibold">
                Примерить по фото комнаты
              </span>
              <span className="mt-0.5 block text-[12px] text-white/60">
                Отправьте фото — менеджер подготовит подбор
              </span>
            </span>
          </span>

          <ArrowUpRight className="h-4 w-4 shrink-0 text-white/60" />
        </a>
      </section>
    );
  }

  return (
    <section className="mt-4 rounded-2xl border border-black/10 bg-white px-3 py-3 shadow-[0_16px_46px_-42px_rgba(0,0,0,0.4)]">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="text-[9px] tracking-[0.18em] uppercase text-black/35">
            3D материалы
          </div>

          <h2 className="mt-0.5 text-[14px] font-semibold leading-tight text-black">
            Модель и текстуры
          </h2>
        </div>

        <div className="flex flex-wrap items-center justify-end gap-2">
          {hasModel ? (
            <CompactAction
              label="Просмотр"
              caption="3D модель"
              icon={<Box className="h-3.5 w-3.5" />}
              onClick={() => setOpen(true)}
            />
          ) : null}

          {hasModel ? (
            <CompactAction
              href={model3dFile.url}
              label="GLB"
              caption={fileName(model3dFile, "model.glb")}
              icon={<Download className="h-3.5 w-3.5" />}
            />
          ) : null}

          {hasOriginal ? (
            <CompactAction
              href={model3dOriginalFile.url}
              label="WRL"
              caption={fileName(model3dOriginalFile, "model.wrl")}
              icon={<FileArchive className="h-3.5 w-3.5" />}
            />
          ) : null}
        </div>
      </div>

      {hasArchive || hasTextures ? (
        <details className="group mt-3 rounded-xl border border-black/10 bg-black/[0.015] px-3 py-2">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-[12px] font-semibold text-black">
            <span className="inline-flex min-w-0 items-center gap-2">
              <ImageIcon className="h-4 w-4 shrink-0 text-black/50" />
              <span className="truncate">
                Текстуры{hasTextures ? `: ${textureFiles.length} файл.` : ""}
              </span>
            </span>

            <ChevronDown className="h-4 w-4 shrink-0 text-black/45 transition group-open:rotate-180" />
          </summary>

          <div className="mt-3 flex flex-wrap gap-2">
            {hasArchive ? (
              <a
                href={texturesArchiveFile.url}
                download={fileName(texturesArchiveFile, "textures.zip")}
                className="inline-flex h-9 items-center gap-2 rounded-full border border-black/10 bg-white px-3 text-[12px] font-semibold text-black transition hover:border-black/25"
              >
                <Download className="h-3.5 w-3.5" />
                Скачать ZIP
              </a>
            ) : null}

            {textureFiles.map((texture, index) => (
              <a
                key={`${texture.url}-${index}`}
                href={texture.url}
                download
                className="inline-flex h-9 max-w-full items-center gap-2 rounded-full border border-black/10 bg-white px-2.5 text-[12px] font-medium text-black transition hover:border-black/25"
              >
                <span className="h-6 w-6 shrink-0 overflow-hidden rounded-full bg-black/[0.05]">
                  {texture.preview ? (
                    <img
                      src={texture.preview}
                      alt={texture.title}
                      className="h-full w-full object-cover"
                    />
                  ) : null}
                </span>

                <span className="max-w-[160px] truncate">
                  {texture.title || `Текстура ${index + 1}`}
                </span>

                <Download className="h-3.5 w-3.5 shrink-0 text-black/40" />
              </a>
            ))}
          </div>
        </details>
      ) : null}

      <a
        href={roomPhotoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex w-full items-center justify-between gap-3 rounded-2xl border border-black/10 bg-black px-3 py-3 text-left text-white transition hover:bg-black/90"
      >
        <span className="flex min-w-0 items-center gap-3">
          <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-black">
            <Camera className="h-4 w-4" />
          </span>

          <span className="min-w-0">
            <span className="block text-[13px] font-semibold">
              Примерить по фото комнаты
            </span>
            <span className="mt-0.5 block text-[12px] text-white/60">
              Отправьте фото — менеджер подготовит подбор
            </span>
          </span>
        </span>

        <ArrowUpRight className="h-4 w-4 shrink-0 text-white/60" />
      </a>

      {open && hasModel ? (
        <div
          className="fixed inset-0 z-[99999] flex items-end justify-center bg-black/65 p-3 backdrop-blur-sm sm:items-center sm:p-5"
          onClick={() => setOpen(false)}
        >
          <div
            className="flex h-[88vh] w-full max-w-6xl flex-col overflow-hidden rounded-[28px] bg-white shadow-[0_30px_100px_rgba(0,0,0,0.35)]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between gap-3 border-b border-black/10 px-4 py-4 sm:px-5">
              <div className="min-w-0">
                <div className="text-[10px] tracking-[0.18em] uppercase text-black/40">
                  3D просмотр
                </div>

                <div className="mt-1 truncate text-[18px] font-semibold text-black">
                  {title}
                </div>
              </div>

              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-10 w-10 shrink-0 cursor-pointer place-items-center rounded-full border border-black/10 bg-white transition hover:bg-black hover:text-white"
                aria-label="Закрыть"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="relative flex-1 bg-[#111111]">
              {viewerReady ? (
                React.createElement("model-viewer", {
                  src: model3dFile.url,
                  alt: title,
                  "camera-controls": true,
                  "auto-rotate": true,
                  "shadow-intensity": "1",
                  "environment-image": "neutral",
                  exposure: "1",
                  "camera-orbit": "35deg 70deg 105%",
                  "field-of-view": "35deg",
                  loading: "eager",
                  reveal: "auto",
                  ar: true,
                  "ar-modes": "webxr scene-viewer quick-look",
                  style: {
                    width: "100%",
                    height: "100%",
                    minHeight: "420px",
                    background: "#151515",
                  },
                })
              ) : (
                <div className="grid h-full min-h-[420px] place-items-center text-[13px] text-white/45">
                  Загрузка 3D-просмотра…
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-black/10 px-4 py-4 sm:px-5">
              <p className="text-[13px] text-black/50">
                Вращайте модель мышкой, колесом приближайте и отдаляйте.
              </p>

              <a
                href={model3dFile.url}
                download={fileName(model3dFile, "model.glb")}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-black px-5 text-[13px] font-semibold text-white transition hover:bg-black/90"
              >
                <Download className="h-4 w-4" />
                Скачать 3D
              </a>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
