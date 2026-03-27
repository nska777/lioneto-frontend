"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import KnowledgeSectionContent from "./KnowledgeSectionContent";
import type {
  DealerTrainingData,
  DealerTrainingItem,
} from "@/app/lib/dealer/training";
import type { DealerKnowledgePost } from "@/app/lib/dealer/knowledge";

type TrainingSectionKey = "presentations" | "knowledge" | "interior";
type KindUi = "PDF" | "PPTX" | "VIDEO" | "DOC";

type FileListItem = {
  id: string;
  title: string;
  kind: KindUi;
  size?: string;
  href: string | null;
  download?: boolean;
  tags?: string[];
  description?: string | null;
  isAvailable: boolean;
};

type PresentationTile = {
  id: string;
  title: string;
  meta?: string;
  href: string;
  download?: boolean;
};

type VideoModalState = {
  title: string;
  src: string;
} | null;

type Props = {
  data: DealerTrainingData;
  knowledgePosts: DealerKnowledgePost[];
  canManageNotes?: boolean;
  dealerLogin?: string | null;
};

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

function mapKind(type: DealerTrainingItem["resolvedType"]): KindUi {
  switch (type) {
    case "pptx":
      return "PPTX";
    case "pdf":
      return "PDF";
    case "doc":
      return "DOC";
    case "video":
      return "VIDEO";
  }
}

function getKindStyles(kind: KindUi) {
  switch (kind) {
    case "PDF":
      return {
        pill: "border-[#E7C8C8] bg-[#FFF3F3] text-[#8F3D3D]",
        accent: "from-[#FFF1F1] to-white",
      };
    case "PPTX":
      return {
        pill: "border-[#E8D8B6] bg-[#FFF9ED] text-[#8A6333]",
        accent: "from-[#FFF7E7] to-white",
      };
    case "DOC":
      return {
        pill: "border-[#CFE0F4] bg-[#F2F8FF] text-[#345D8C]",
        accent: "from-[#F2F8FF] to-white",
      };
    case "VIDEO":
      return {
        pill: "border-[#D5D1F6] bg-[#F6F4FF] text-[#5645A3]",
        accent: "from-[#F7F4FF] to-white",
      };
  }
}

function getSectionTone(key: TrainingSectionKey) {
  switch (key) {
    case "presentations":
      return {
        chip: "Коллекции",
        glow: "radial-gradient(120% 120% at 10% 0%, rgba(235, 213, 164, 0.28) 0%, rgba(235, 213, 164, 0) 60%)",
        chipClass: "border-[#E5D4AA] bg-[#FFF7E3] text-[#8A6732]",
      };

    case "knowledge":
      return {
        chip: "База знаний",
        glow: "radial-gradient(120% 120% at 10% 0%, rgba(205, 227, 245, 0.28) 0%, rgba(205, 227, 245, 0) 60%)",
        chipClass: "border-[#CFE0F4] bg-[#F2F8FF] text-[#3A648F]",
      };

    case "interior":
      return {
        chip: "Интерьер",
        glow: "radial-gradient(120% 120% at 10% 0%, rgba(220, 214, 245, 0.28) 0%, rgba(220, 214, 245, 0) 60%)",
        chipClass: "border-[#D9D1F6] bg-[#F6F3FF] text-[#5B4AA2]",
      };
  }
}

function mapPresentationTiles(items: DealerTrainingItem[]): PresentationTile[] {
  const cmsTiles = items.map((item) => ({
    id: item.slug || String(item.id),
    title: (item.collectionTitle || item.title).toUpperCase(),
    meta: mapKind(item.resolvedType),
    href: item.downloadUrl || "#",
    download: true,
  }));

  return [
    ...cmsTiles,
    {
      id: "workbook",
      title: "РАБОЧАЯ ТЕТРАДЬ",
      meta: "NOTES",
      href: "/dealer/training/workbook",
      download: false,
    },
  ];
}

function mapFileList(items: DealerTrainingItem[]): FileListItem[] {
  return items.map((item) => {
    const isDownload = Boolean(item.downloadUrl);
    const href =
      item.resolvedType === "video"
        ? item.fileUrl || item.downloadUrl
        : item.downloadUrl;

    return {
      id: item.slug || String(item.id),
      title: item.title,
      kind: mapKind(item.resolvedType),
      size: item.fileSizeLabel ?? undefined,
      href,
      download: item.resolvedType === "video" ? false : isDownload,
      isAvailable: Boolean(href),
      tags: [...(item.label ? [item.label] : []), ...(item.tags ?? [])].filter(
        Boolean,
      ),
      description: item.description,
    };
  });
}

function KindPill({ kind }: { kind: KindUi }) {
  const styles = getKindStyles(kind);

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold tracking-[0.08em]",
        styles.pill,
      )}
    >
      {kind}
    </span>
  );
}

function PlusMark({ open }: { open: boolean }) {
  return (
    <span
      className={cn(
        "relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-black/10 bg-white text-black/70 shadow-[0_6px_20px_rgba(0,0,0,0.04)]",
        "transition-transform duration-300 ease-out",
        open && "rotate-45",
      )}
      aria-hidden="true"
    >
      <span className="absolute h-[16px] w-[2px] rounded-full bg-current" />
      <span className="absolute h-[2px] w-[16px] rounded-full bg-current" />
    </span>
  );
}

function SectionCard({
  toneKey,
  open,
  title,
  subtitle,
  onToggle,
  children,
}: {
  toneKey: TrainingSectionKey;
  open: boolean;
  title: string;
  subtitle: string;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  const tone = getSectionTone(toneKey);

  return (
    <div
      className="relative overflow-hidden rounded-[24px] border bg-white shadow-[0_18px_50px_rgba(64,48,20,0.04)]"
      style={{ borderColor: "rgba(189, 160, 86, 0.20)" }}
    >
      <span
        className="pointer-events-none absolute inset-0"
        style={{ background: tone.glow }}
      />

      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "relative z-[1] flex w-full cursor-pointer items-center justify-between gap-4 bg-white/70 px-6 py-5 text-left backdrop-blur-[1px]",
          "transition-colors duration-300 ease-out hover:bg-black/[0.02]",
        )}
      >
        <div className="min-w-0">
          <div
            className={cn(
              "mb-2 inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]",
              tone.chipClass,
            )}
          >
            {tone.chip}
          </div>

          <div className="text-[15px] font-extrabold tracking-[0.14em] text-black">
            {title.toUpperCase()}
          </div>
          <div className="mt-1 text-sm text-black/55">{subtitle}</div>
        </div>
        <PlusMark open={open} />
      </button>

      <div
        className={cn(
          "grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.2,0.9,0.2,1)]",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="relative z-[1] px-6 pb-6">
            <div className="mb-5 h-px w-full bg-black/10" />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function PresentationTileCard({ it }: { it: PresentationTile }) {
  const isWorkbook = it.id === "workbook";

  const inner = (
    <>
      <span
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{
          background: isWorkbook
            ? "radial-gradient(120% 120% at 20% 0%, rgba(214, 197, 160, 0.30) 0%, rgba(214, 197, 160, 0) 62%)"
            : "radial-gradient(120% 120% at 22% 0%, rgba(232, 208, 148, 0.26) 0%, rgba(232, 208, 148, 0) 60%)",
        }}
      />
      <span className="pointer-events-none absolute inset-x-0 top-0 h-[5px] bg-gradient-to-r from-[#E9D7A6] via-[#F4E9CC] to-[#E9D7A6]" />
      <div className="relative z-[1] text-center">
        <div className="text-[14px] font-extrabold tracking-[0.18em] text-black">
          {it.title}
        </div>
        <div className="mt-2 inline-flex rounded-full border border-black/10 bg-white/85 px-3 py-1 text-[11px] font-semibold tracking-[0.08em] text-black/55">
          {it.meta ?? "FILE"}
        </div>

        {isWorkbook ? (
          <div className="mt-3 text-[11px] font-semibold tracking-[0.12em] text-black/55">
            ОТКРЫТЬ
          </div>
        ) : (
          <div className="mt-3 text-[11px] font-semibold tracking-[0.12em] text-black/45">
            СКАЧАТЬ
          </div>
        )}
      </div>
    </>
  );

  const baseCls = cn(
    "group relative flex h-[126px] cursor-pointer items-center justify-center overflow-hidden rounded-[22px] border bg-[linear-gradient(180deg,#fffdf8_0%,#ffffff_100%)] px-6 shadow-[0_16px_32px_rgba(40,28,10,0.04)]",
    "transition-all duration-200 hover:-translate-y-[2px] hover:shadow-[0_22px_38px_rgba(40,28,10,0.08)]",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20",
  );

  const borderStyle = { borderColor: "rgba(189, 160, 86, 0.22)" as const };

  if (it.download) {
    return (
      <a
        href={it.href}
        download
        className={baseCls}
        style={borderStyle}
        aria-label={`Скачать ${it.title}`}
      >
        {inner}
      </a>
    );
  }

  return (
    <Link
      href={it.href}
      className={baseCls}
      style={borderStyle}
      aria-label={`Открыть ${it.title}`}
    >
      {inner}
    </Link>
  );
}

function FileRow({
  item,
  onOpenVideo,
}: {
  item: FileListItem;
  onOpenVideo: (title: string, src: string) => void;
}) {
  const styles = getKindStyles(item.kind);

  if (!item.isAvailable) {
    return (
      <div className="flex items-center justify-between gap-4 rounded-[18px] border border-dashed border-black/10 bg-white/70 px-4 py-4 text-sm text-black/45">
        <div className="min-w-0">
          <div className="font-semibold text-black/60">{item.title}</div>
          <div className="mt-1 text-xs text-black/40">
            Материал обновляется или файл еще не привязан.
          </div>
        </div>

        <span className="text-xs font-semibold tracking-[0.10em] text-black/35">
          НЕДОСТУПНО
        </span>
      </div>
    );
  }

  const content = (
    <>
      <div className="min-w-0">
        <div className="text-sm font-semibold text-black">{item.title}</div>
        <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs text-black/45">
          <KindPill kind={item.kind} />
          {item.size ? <span>{item.size}</span> : null}
          {item.tags && item.tags.length ? (
            <span className="truncate">• {item.tags.join(" • ")}</span>
          ) : null}
          {item.description ? (
            <span className="truncate">• {item.description}</span>
          ) : null}
        </div>
      </div>

      <span className="text-xs font-semibold tracking-[0.10em] text-black/45 group-hover:text-black/75">
        {item.download ? "Скачать" : "Открыть"}
      </span>
    </>
  );

  const baseClass = cn(
    "group relative flex cursor-pointer items-center justify-between gap-4 overflow-hidden rounded-[18px] border px-4 py-4 shadow-[0_10px_24px_rgba(50,40,18,0.03)]",
    "transition-all duration-200 hover:-translate-y-[1px] hover:shadow-[0_16px_30px_rgba(50,40,18,0.06)]",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20",
    `bg-gradient-to-r ${styles.accent}`,
    "border-black/10",
  );

  if (item.kind === "VIDEO" && item.href) {
    return (
      <button
        type="button"
        onClick={() => onOpenVideo(item.title, item.href!)}
        className={cn(baseClass, "w-full cursor-pointer text-left")}
      >
        {content}
      </button>
    );
  }

  if (item.download) {
    return (
      <a href={item.href ?? "#"} download className={baseClass}>
        {content}
      </a>
    );
  }

  return (
    <a
      href={item.href ?? "#"}
      target="_blank"
      rel="noreferrer"
      className={baseClass}
    >
      {content}
    </a>
  );
}

function VideoModal({
  video,
  onClose,
}: {
  video: VideoModalState;
  onClose: () => void;
}) {
  if (!video) return null;

  return (
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/55 px-4 py-6 backdrop-blur-[2px]">
      <div className="relative w-full max-w-4xl overflow-hidden rounded-[24px] border border-white/15 bg-[#121212] shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
        <div className="flex items-center justify-between gap-4 border-b border-white/10 px-5 py-4 text-white">
          <div className="min-w-0">
            <div className="text-xs font-semibold uppercase tracking-[0.14em] text-white/55">
              Видео
            </div>
            <div className="mt-1 truncate text-base font-semibold">
              {video.title}
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-white/15 bg-white/5 text-white/80 transition hover:bg-white/10 hover:text-white"
            aria-label="Закрыть видео"
          >
            ✕
          </button>
        </div>

        <div className="bg-black p-3">
          <video
            key={video.src}
            controls
            autoPlay
            className="aspect-video w-full rounded-[18px] bg-black"
            src={video.src}
          >
            Ваш браузер не поддерживает видео.
          </video>
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 -z-10 cursor-default"
        aria-label="Закрыть"
      />
    </div>
  );
}

export default function TrainingClient({
  data,
  knowledgePosts,
  canManageNotes = false,
  dealerLogin = null,
}: Props) {
  const [openKey, setOpenKey] = useState<TrainingSectionKey | null>(
    "presentations",
  );
  const [q, setQ] = useState("");
  const [videoModal, setVideoModal] = useState<VideoModalState>(null);

  const presentationTiles = useMemo(
    () => mapPresentationTiles(data.presentations),
    [data.presentations],
  );

  const interiorItems = useMemo(
    () => mapFileList(data.interior),
    [data.interior],
  );

  const filteredKnowledgePosts = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return knowledgePosts;

    return knowledgePosts.filter((item) => {
      const inTitle = item.title.toLowerCase().includes(query);
      const inExcerpt = item.excerpt?.toLowerCase().includes(query) ?? false;
      const inContent = item.content?.toLowerCase().includes(query) ?? false;
      const inLabel = item.label?.toLowerCase().includes(query) ?? false;
      const inTags = item.tags.some((tag) => tag.toLowerCase().includes(query));

      return inTitle || inExcerpt || inContent || inLabel || inTags;
    });
  }, [knowledgePosts, q]);

  const filteredInteriorItems = useMemo(() => {
    const query = q.trim().toLowerCase();

    if (!query) return interiorItems;

    return interiorItems.filter((item) => {
      const inTitle = item.title.toLowerCase().includes(query);
      const inTags = (item.tags ?? []).some((tag) =>
        tag.toLowerCase().includes(query),
      );
      const inDesc = item.description?.toLowerCase().includes(query) ?? false;

      return inTitle || inTags || inDesc;
    });
  }, [interiorItems, q]);

  const isSearching = q.trim().length > 0;

  return (
    <>
      <div className="space-y-6">
        <header className="relative overflow-hidden rounded-[26px] border border-[#E7DCC2] bg-[linear-gradient(180deg,#fffdf8_0%,#fffaf1_100%)] px-6 py-6 shadow-[0_18px_40px_rgba(61,46,17,0.04)]">
          <span className="absolute inset-0 bg-[radial-gradient(120%_120%_at_0%_0%,rgba(236,218,175,0.34)_0%,rgba(236,218,175,0)_52%)]" />
          <div className="relative z-[1]">
            <div className="inline-flex rounded-full border border-black/10 bg-white/85 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-black/50">
              Dealer Portal
            </div>
            <h1 className="mt-3 text-[28px] font-semibold tracking-[-0.03em] text-black">
              Учебные материалы
            </h1>
            <p className="mt-2 max-w-[760px] text-sm text-black/55">
              Презентации, база знаний, интерьерные гайды и рабочая тетрадь для
              заметок.
            </p>
          </div>
        </header>

        <div className="flex flex-col gap-3">
          <div className="relative w-full max-w-[680px]">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Поиск по базе знаний и материалам..."
              className="w-full rounded-[16px] border border-[#E4D7B8] bg-white px-4 py-3 text-sm text-black outline-none placeholder:text-black/35 shadow-[0_8px_20px_rgba(40,30,10,0.03)] focus:border-[#D9C38C]"
            />
            {q ? (
              <button
                type="button"
                onClick={() => setQ("")}
                className="absolute right-2 top-1/2 -translate-y-1/2 cursor-pointer rounded-full px-3 py-1 text-xs text-black/55 hover:text-black"
              >
                Очистить
              </button>
            ) : null}
          </div>
        </div>

        <div className="space-y-5">
          <SectionCard
            toneKey="presentations"
            open={!isSearching && openKey === "presentations"}
            title="Учебные презентации"
            subtitle={`Коллекции (${data.presentations.length}) + рабочая тетрадь для заметок.`}
            onToggle={() =>
              setOpenKey(openKey === "presentations" ? null : "presentations")
            }
          >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {presentationTiles.map((it) => (
                <PresentationTileCard key={it.id} it={it} />
              ))}
            </div>
          </SectionCard>

          <SectionCard
            toneKey="interior"
            open={
              isSearching
                ? filteredInteriorItems.length > 0
                : openKey === "interior"
            }
            title="Стиль и интерьер"
            subtitle="Lookbook, гайды, видео — скачивание сразу."
            onToggle={() =>
              setOpenKey(openKey === "interior" ? null : "interior")
            }
          >
            {filteredInteriorItems.length === 0 ? (
              <div className="rounded-[16px] border border-black/10 bg-white px-4 py-3 text-sm text-black/55">
                Пока нет доступных материалов.
              </div>
            ) : (
              <ul className="space-y-3">
                {filteredInteriorItems.map((item) => (
                  <li key={item.id}>
                    <FileRow
                      item={item}
                      onOpenVideo={(title, src) =>
                        setVideoModal({ title, src })
                      }
                    />
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard
            toneKey="knowledge"
            open={
              isSearching
                ? filteredKnowledgePosts.length > 0
                : openKey === "knowledge"
            }
            title="База знаний"
            subtitle={`Новости, заметки, скрипты, чек-листы, стандарты${knowledgePosts.length ? ` (${knowledgePosts.length})` : ""}`}
            onToggle={() =>
              setOpenKey(openKey === "knowledge" ? null : "knowledge")
            }
          >
            <KnowledgeSectionContent
              posts={filteredKnowledgePosts}
              canManageNotes={canManageNotes}
              dealerLogin={dealerLogin}
            />
          </SectionCard>
        </div>
      </div>

      <VideoModal video={videoModal} onClose={() => setVideoModal(null)} />
    </>
  );
}
