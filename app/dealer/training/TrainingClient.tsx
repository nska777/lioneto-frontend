"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type TrainingSectionKey = "presentations" | "sales" | "style";

type TrainingFile = {
  id: string;
  title: string;
  kind: "PDF" | "PPTX" | "VIDEO" | "DOC";
  size?: string;
  fileHref: string;
  tags?: string[];
};

type PresentationTile = {
  id: string; // can be "workbook"
  title: string;
  meta?: string; // "PPTX", etc.
  // If href is internal route -> open page (no download)
  href: string;
  // For download tiles
  download?: boolean;
};

type TrainingSection = {
  key: TrainingSectionKey;
  title: string;
  subtitle: string;
  items?: TrainingFile[];
};

const PRESENTATION_TILES: PresentationTile[] = [
  {
    id: "amber",
    title: "AMBER",
    meta: "PPTX",
    href: "/dealer/training/presentations/by-collection/amber.pptx",
    download: true,
  },
  {
    id: "scandy",
    title: "SCANDY",
    meta: "PPTX",
    href: "/dealer/training/presentations/by-collection/scandy.pptx",
    download: true,
  },
  {
    id: "elizabeth",
    title: "ELIZABETH",
    meta: "PPTX",
    href: "/dealer/training/presentations/by-collection/elizabeth.pptx",
    download: true,
  },
  {
    id: "salvador",
    title: "SALVADOR",
    meta: "PPTX",
    href: "/dealer/training/presentations/by-collection/salvador.pptx",
    download: true,
  },
  {
    id: "pitti",
    title: "PITTI",
    meta: "PPTX",
    href: "/dealer/training/presentations/by-collection/pitti.pptx",
    download: true,
  },
  {
    id: "buongiorno",
    title: "BUONGIORNO",
    meta: "PPTX",
    href: "/dealer/training/presentations/by-collection/buongiorno.pptx",
    download: true,
  },

  // ✅ workbook is NOT download. It's an internal Notes page.
  {
    id: "workbook",
    title: "РАБОЧАЯ ТЕТРАДЬ",
    meta: "NOTES",
    href: "/dealer/training/workbook",
    download: false,
  },
];

const SECTIONS: TrainingSection[] = [
  {
    key: "presentations",
    title: "Учебные презентации",
    subtitle:
      "Выберите коллекцию — скачивание начнётся сразу. Рабочая тетрадь — для ваших заметок.",
  },
  {
    key: "sales",
    title: "Материалы по продажам",
    subtitle: "Скрипты, чек-листы, стандарты и быстрые ответы клиенту.",
    items: [
      {
        id: "sales-script-1",
        title: "Скрипт встречи в салоне — контакт → подбор → закрытие",
        kind: "PDF",
        size: "1.2 MB",
        fileHref: "/dealer/training/sales/salon-script.pdf",
        tags: ["скрипт", "салон"],
      },
      {
        id: "sales-checklist",
        title: "Чек-лист презентации товара — 10 шагов",
        kind: "PDF",
        size: "0.6 MB",
        fileHref: "/dealer/training/sales/presentation-checklist.pdf",
        tags: ["чек-лист"],
      },
      {
        id: "sales-qa",
        title: "FAQ продавца — короткие ответы на частые вопросы",
        kind: "DOC",
        size: "0.4 MB",
        fileHref: "/dealer/training/sales/sales-faq.docx",
        tags: ["FAQ", "ответы"],
      },
    ],
  },
  {
    key: "style",
    title: "Стиль и интерьер",
    subtitle: "Сочетания, визуальные аргументы и подбор под интерьер клиента.",
    items: [
      {
        id: "style-lookbook",
        title: "Lookbook — сочетания цветов и материалов",
        kind: "PDF",
        size: "22 MB",
        fileHref: "/dealer/training/style/lookbook.pdf",
        tags: ["lookbook", "интерьер"],
      },
      {
        id: "style-room-guides",
        title: "Гайды по комнатам — спальня / гостиная / прихожая",
        kind: "PDF",
        size: "7 MB",
        fileHref: "/dealer/training/style/room-guides.pdf",
        tags: ["гайд", "комнаты"],
      },
      {
        id: "style-video",
        title: "Видео — как презентовать мебель в интерьере (2–3 минуты)",
        kind: "VIDEO",
        size: "—",
        fileHref: "/dealer/training/style/presentation-video.mp4",
        tags: ["видео"],
      },
    ],
  },
];

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

function KindPill({ kind }: { kind: TrainingFile["kind"] }) {
  return (
    <span className="inline-flex cursor-pointer items-center rounded-full border border-black/10 bg-white px-2.5 py-1 text-[11px] font-semibold tracking-[0.08em] text-black/65">
      {kind}
    </span>
  );
}

function PlusMark({ open }: { open: boolean }) {
  return (
    <span
      className={cn(
        "relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-black/10 bg-white text-black/70",
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
  open,
  title,
  subtitle,
  onToggle,
  children,
}: {
  open: boolean;
  title: string;
  subtitle: string;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <div
      className="overflow-hidden rounded-[18px] border bg-white"
      style={{ borderColor: "rgba(189, 160, 86, 0.22)" }}
    >
      <button
        type="button"
        onClick={onToggle}
        className={cn(
          "w-full cursor-pointer text-left",
          "px-5 py-5",
          "flex items-center justify-between gap-4",
          "bg-white",
          "transition-colors duration-300 ease-out",
          "hover:bg-black/[0.02]",
        )}
      >
        <div className="min-w-0">
          <div className="text-[14px] font-extrabold tracking-[0.12em] text-black">
            {title.toUpperCase()}
          </div>
          <div className="mt-1 text-sm text-black/55">{subtitle}</div>
        </div>
        <PlusMark open={open} />
      </button>

      {/* ultra-smooth: grid rows + opacity (no DOM measuring, no lag) */}
      <div
        className={cn(
          "grid",
          "transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.2,0.9,0.2,1)]",
          open ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
        )}
      >
        <div className="min-h-0 overflow-hidden">
          <div className="px-5 pb-5">
            <div className="mb-4 h-px w-full bg-black/10" />
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

function PresentationTileCard({ it }: { it: PresentationTile }) {
  const inner = (
    <>
      {/* subtle champagne sheen on hover */}
      <span
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
        style={{
          background:
            "radial-gradient(120% 120% at 22% 0%, rgba(232, 208, 148, 0.26) 0%, rgba(232, 208, 148, 0) 60%)",
        }}
      />
      <div className="relative z-[1] text-center">
        <div className="text-[14px] font-extrabold tracking-[0.18em] text-black">
          {it.title}
        </div>
        <div className="mt-1 text-xs text-black/45">{it.meta ?? "FILE"}</div>

        {it.id === "workbook" ? (
          <div className="mt-2 text-[11px] font-semibold tracking-[0.1em] text-black/55">
            ОТКРЫТЬ
          </div>
        ) : null}
      </div>
    </>
  );

  const baseCls = cn(
    "group relative cursor-pointer overflow-hidden",
    "h-[112px] rounded-[18px] border bg-white",
    "px-6",
    "flex items-center justify-center",
    "transition-transform duration-200 hover:-translate-y-[1px]",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20",
  );

  const borderStyle = { borderColor: "rgba(189, 160, 86, 0.22)" as const };

  // Download tile
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

  // Internal navigation tile (workbook)
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

export default function TrainingClient() {
  const [openKey, setOpenKey] = useState<TrainingSectionKey | null>(
    "presentations",
  );

  // Search controls only for file lists
  const [q, setQ] = useState("");
  const [kindFilter, setKindFilter] = useState<"ALL" | TrainingFile["kind"]>(
    "ALL",
  );

  const filteredFilesBySection = useMemo(() => {
    const query = q.trim().toLowerCase();

    const filterList = (items: TrainingFile[]): TrainingFile[] =>
      items.filter((it) => {
        const okKind = kindFilter === "ALL" ? true : it.kind === kindFilter;
        if (!okKind) return false;
        if (!query) return true;
        const inTitle = it.title.toLowerCase().includes(query);
        const inTags = (it.tags ?? []).some((t) =>
          t.toLowerCase().includes(query),
        );
        return inTitle || inTags;
      });

    const salesItems = SECTIONS.find((s) => s.key === "sales")?.items ?? [];
    const styleItems = SECTIONS.find((s) => s.key === "style")?.items ?? [];

    return {
      sales: filterList(salesItems),
      style: filterList(styleItems),
    };
  }, [q, kindFilter]);

  return (
    <div className="space-y-6">
      <header>
        <div className="text-sm text-black/45">Dealer Portal</div>
        <h1 className="mt-1 text-[22px] font-semibold tracking-[-0.02em] text-black">
          Учебные материалы
        </h1>
        <p className="mt-1 text-sm text-black/55">
          Откройте раздел — выберите материал — скачивание начнётся сразу.
        </p>
      </header>

      {/* Search controls (only for file lists) */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="relative w-full max-w-[520px]">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Поиск по файлам (продажи / интерьер)…"
            className="w-full cursor-pointer rounded-[14px] border border-black/10 bg-white px-4 py-3 text-sm text-black outline-none placeholder:text-black/35 focus:border-black/20"
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

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setKindFilter("ALL")}
            className={cn(
              "cursor-pointer rounded-full border px-3 py-2 text-xs font-semibold tracking-[0.06em] transition-colors",
              "border-black/10 bg-white text-black/65 hover:text-black",
              kindFilter === "ALL" &&
                "bg-[#F3EBD2] border-[#E4D9B8] text-black",
            )}
          >
            ALL
          </button>
          {(["PDF", "PPTX", "VIDEO", "DOC"] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setKindFilter(k)}
              className={cn(
                "cursor-pointer rounded-full border px-3 py-2 text-xs font-semibold tracking-[0.06em] transition-colors",
                "border-black/10 bg-white text-black/65 hover:text-black",
                kindFilter === k && "bg-[#F3EBD2] border-[#E4D9B8] text-black",
              )}
            >
              {k}
            </button>
          ))}
        </div>
      </div>

      {/* Accordion */}
      <div className="space-y-4">
        {/* 1) Presentations -> tiles (6 collections + workbook) */}
        <SectionCard
          open={openKey === "presentations"}
          title="Учебные презентации"
          subtitle="Коллекции (6) + рабочая тетрадь для заметок."
          onToggle={() =>
            setOpenKey(openKey === "presentations" ? null : "presentations")
          }
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PRESENTATION_TILES.map((it) => (
              <PresentationTileCard key={it.id} it={it} />
            ))}
          </div>
        </SectionCard>

        {/* 2) Sales -> file list */}
        <SectionCard
          open={openKey === "sales"}
          title="Материалы по продажам"
          subtitle="Скрипты, чек-листы, стандарты — скачивание сразу."
          onToggle={() => setOpenKey(openKey === "sales" ? null : "sales")}
        >
          {filteredFilesBySection.sales.length === 0 ? (
            <div className="rounded-[14px] border border-black/10 bg-white px-4 py-3 text-sm text-black/55">
              Ничего не найдено.
            </div>
          ) : (
            <ul className="space-y-2">
              {filteredFilesBySection.sales.map((it) => (
                <li key={it.id}>
                  <a
                    href={it.fileHref}
                    download
                    className={cn(
                      "group flex cursor-pointer items-center justify-between gap-4",
                      "rounded-[14px] border border-black/10 bg-white px-4 py-3",
                      "transition-colors duration-200 hover:bg-black/[0.02]",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20",
                    )}
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-black">
                        {it.title}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-black/45">
                        <KindPill kind={it.kind} />
                        {it.size ? <span>{it.size}</span> : null}
                        {it.tags && it.tags.length ? (
                          <span className="truncate">
                            • {it.tags.join(" • ")}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <span className="text-xs font-semibold tracking-[0.08em] text-black/45 group-hover:text-black/70">
                      Скачать
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        {/* 3) Style -> file list */}
        <SectionCard
          open={openKey === "style"}
          title="Стиль и интерьер"
          subtitle="Lookbook, гайды, видео — скачивание сразу."
          onToggle={() => setOpenKey(openKey === "style" ? null : "style")}
        >
          {filteredFilesBySection.style.length === 0 ? (
            <div className="rounded-[14px] border border-black/10 bg-white px-4 py-3 text-sm text-black/55">
              Ничего не найдено.
            </div>
          ) : (
            <ul className="space-y-2">
              {filteredFilesBySection.style.map((it) => (
                <li key={it.id}>
                  <a
                    href={it.fileHref}
                    download
                    className={cn(
                      "group flex cursor-pointer items-center justify-between gap-4",
                      "rounded-[14px] border border-black/10 bg-white px-4 py-3",
                      "transition-colors duration-200 hover:bg-black/[0.02]",
                      "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20",
                    )}
                  >
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-black">
                        {it.title}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-black/45">
                        <KindPill kind={it.kind} />
                        {it.size ? <span>{it.size}</span> : null}
                        {it.tags && it.tags.length ? (
                          <span className="truncate">
                            • {it.tags.join(" • ")}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <span className="text-xs font-semibold tracking-[0.08em] text-black/45 group-hover:text-black/70">
                      Скачать
                    </span>
                  </a>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>
      </div>

      <div className="pt-1 text-center text-xs text-black/45">
        Нажмите на элемент — действие выполнится сразу.
      </div>
    </div>
  );
}
