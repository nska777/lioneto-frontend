import type { CSSProperties } from "react";

import {
  getDealerTechCatalogs,
  type DealerTechCatalogItem,
} from "@/app/lib/dealer/price-lists";

type TechCatalogCardItem = {
  id: string;
  title: string;
  fileHref: string;
  subtitle: string;
};

const COLLECTION_ORDER = [
  "amber",
  "scandy",
  "elizabeth",
  "salvador",
  "pitti",
  "buongiorno",
] as const;

type CollectionSlug = (typeof COLLECTION_ORDER)[number];

const COLLECTION_LABELS: Record<CollectionSlug, string> = {
  amber: "AMBER",
  scandy: "SCANDY",
  elizabeth: "ELIZABETH",
  salvador: "SALVADOR",
  pitti: "PITTI",
  buongiorno: "BUONGIORNO",
};

const cardBorder: CSSProperties = {
  borderColor: "rgba(189, 160, 86, 0.26)",
};

const cardGlow: CSSProperties = {
  background:
    "radial-gradient(120% 120% at 22% 0%, rgba(232, 208, 148, 0.28) 0%, rgba(232, 208, 148, 0) 56%)",
};

function DownloadIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 3v10m0 0 4-4m-4 4-4-4"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CatalogIcon() {
  return (
    <svg
      width="26"
      height="26"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6.75 4.75h8.5a2 2 0 0 1 2 2v10.5a1 1 0 0 1-1.54.84l-2.46-1.54-2.46 1.54a1 1 0 0 1-1.08 0l-2.46-1.54-2.46 1.54a1 1 0 0 1-1.54-.84V6.75a2 2 0 0 1 2-2Z"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M8.5 8.25h6.75"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <path
        d="M8.5 11.25h5"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function buildCards(items: DealerTechCatalogItem[]): TechCatalogCardItem[] {
  const bySlug = new Map<string, DealerTechCatalogItem>();

  for (const item of items) {
    if (!bySlug.has(item.collectionSlug)) {
      bySlug.set(item.collectionSlug, item);
    }
  }

  const result: TechCatalogCardItem[] = [];

  for (const slug of COLLECTION_ORDER) {
    const item = bySlug.get(slug);
    if (!item) continue;

    result.push({
      id: slug,
      title: COLLECTION_LABELS[slug],
      fileHref: item.fileUrl,
      subtitle: "Technical catalog · PDF",
    });
  }

  return result;
}

export default async function Page() {
  const catalogs = await getDealerTechCatalogs();
  const cards = buildCards(catalogs);

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-6">
        <div>
          <div className="text-sm text-black/45">Dealer Portal</div>
          <h1 className="mt-1 text-[22px] font-semibold tracking-[-0.02em] text-black">
            Технические каталоги
          </h1>
          <p className="mt-1 text-sm text-black/55">
            Выберите коллекцию — загрузка начнётся сразу.
          </p>
        </div>
      </header>

      {cards.length > 0 ? (
        <>
          <section className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {cards.map((it) => (
              <a
                key={it.id}
                href={`/api/dealer/download?url=${encodeURIComponent(
                  it.fileHref,
                )}&name=${encodeURIComponent(`${it.title}.pdf`)}`}
                className={[
                  "group relative overflow-hidden",
                  "min-h-[176px] rounded-[18px] border bg-white",
                  "px-4 py-4",
                  "transition-all duration-200",
                  "hover:-translate-y-[2px] hover:shadow-[0_18px_40px_-24px_rgba(0,0,0,0.22)]",
                  "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20",
                ].join(" ")}
                style={cardBorder}
                aria-label={`Скачать технический каталог ${it.title}`}
              >
                <span
                  className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                  style={cardGlow}
                />

                <span
                  className="pointer-events-none absolute left-0 top-0 h-full w-[16px]"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(198,171,103,0.20) 0%, rgba(160,129,56,0.10) 48%, rgba(198,171,103,0.20) 100%)",
                  }}
                />
                <span className="pointer-events-none absolute left-[16px] top-0 h-full w-px bg-black/10" />

                <span className="pointer-events-none absolute left-[10px] top-[18px] h-[42px] w-[6px] rounded-full bg-[rgba(189,160,86,0.25)]" />
                <span className="pointer-events-none absolute left-[10px] top-[70px] h-[42px] w-[6px] rounded-full bg-[rgba(189,160,86,0.18)]" />
                <span className="pointer-events-none absolute left-[10px] top-[122px] h-[26px] w-[6px] rounded-full bg-[rgba(189,160,86,0.12)]" />

                <div className="relative z-[1] flex h-full flex-col justify-between pl-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="inline-flex items-center gap-2 rounded-full border border-[rgba(189,160,86,0.24)] bg-[rgba(189,160,86,0.08)] px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.18em] text-black/55">
                        <CatalogIcon />
                        <span className="-ml-1">PDF</span>
                      </div>

                      <div className="mt-4 text-[15px] font-extrabold tracking-[0.18em] text-black">
                        {it.title}
                      </div>

                      <div className="mt-1 text-xs text-black/45">
                        {it.subtitle}
                      </div>
                    </div>

                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-black/10 bg-white text-black/70 transition-colors duration-200 group-hover:text-black">
                      <DownloadIcon />
                    </span>
                  </div>

                  <div className="mt-6 space-y-2">
                    <div className="h-px w-full bg-black/8" />
                    <div className="flex items-center justify-between gap-3 text-[11px] text-black/45">
                      <span>Технический каталог</span>
                      <span>Скачать</span>
                    </div>
                  </div>
                </div>
              </a>
            ))}
          </section>
        </>
      ) : (
        <div className="rounded-[20px] border border-black/10 bg-white px-5 py-6 text-sm text-black/55">
          Технические каталоги пока не добавлены.
        </div>
      )}
    </div>
  );
}
