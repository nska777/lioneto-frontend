import type { CSSProperties } from "react";

import { getCurrentDealer } from "@/app/lib/get-current-dealer";
import {
  getDealerPriceListsByCountry,
  type DealerPriceListItem,
} from "@/app/lib/dealer/price-lists";

type PriceListCardItem = {
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

const UNIFIED_PRICE_CARD = {
  id: "unified-price",
  title: "Единый прайс по коллекциям",
  subtitle: "Скачать Excel (.xlsx)",
  fileHref: "/api/dealer/download?type=price-list&slug=unified-price",
};

const cardStyle: CSSProperties = {
  borderColor: "rgba(189, 160, 86, 0.22)",
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(249,246,239,0.98) 100%)",
};

const glowStyle: CSSProperties = {
  background: `
    radial-gradient(90% 90% at 0% 0%, rgba(221, 240, 154, 0.30) 0%, rgba(221, 240, 154, 0.00) 42%),
    radial-gradient(65% 60% at 100% 0%, rgba(191, 214, 255, 0.15) 0%, rgba(191, 214, 255, 0.00) 42%),
    linear-gradient(135deg, rgba(255,255,255,0.10) 0%, rgba(255,255,255,0.00) 58%)
  `,
};

const tabStyle: CSSProperties = {
  background:
    "linear-gradient(180deg, rgba(248,244,232,0.98) 0%, rgba(237,228,203,0.98) 100%)",
  borderColor: "rgba(189, 160, 86, 0.22)",
};

function DownloadIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 4v7.5m0 0 3-3m-3 3-3-3"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.5 16v1.1A1.4 1.4 0 0 0 6.9 18.5h10.2a1.4 1.4 0 0 0 1.4-1.4V16"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinecap="round"
      />
    </svg>
  );
}

function buildCards(items: DealerPriceListItem[]): PriceListCardItem[] {
  const bySlug = new Map<string, DealerPriceListItem>();

  for (const item of items) {
    if (!bySlug.has(item.collectionSlug)) {
      bySlug.set(item.collectionSlug, item);
    }
  }

  const result: PriceListCardItem[] = [];

  for (const slug of COLLECTION_ORDER) {
    const item = bySlug.get(slug);

    if (!item) {
      continue;
    }

    result.push({
      id: slug,
      title: COLLECTION_LABELS[slug],
      fileHref: item.fileUrl,
      subtitle: "Скачать Excel (.xlsx)",
    });
  }

  return result;
}

export default async function Page() {
  const dealer = await getCurrentDealer();
  const countryCode = dealer?.countryCode?.trim().toUpperCase() || "RU";

  const priceLists = await getDealerPriceListsByCountry(countryCode);
  const cards = buildCards(priceLists);

  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between gap-6">
        <div>
          <h1 className="mt-1 text-[21px] font-semibold tracking-[-0.02em] text-black">
            Прайс-листы
          </h1>
        </div>
      </header>

      {cards.length > 0 ? (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((it) => (
            <a
              key={it.id}
              href={it.fileHref}
              download
              target="_blank"
              rel="noreferrer"
              className={[
                "group relative overflow-visible",
                "h-[92px] rounded-[22px] border",
                "px-5",
                "flex items-center justify-between",
                "transition-all duration-300 ease-out",
                "hover:-translate-y-[2px] hover:shadow-[0_18px_44px_-30px_rgba(0,0,0,0.24)]",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/15",
              ].join(" ")}
              style={cardStyle}
              aria-label={`Скачать прайс-лист ${it.title}`}
            >
              <span
                className="pointer-events-none absolute inset-0 rounded-[22px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={glowStyle}
              />

              <span
                className="pointer-events-none absolute left-[18px] top-[-8px] h-[18px] w-[74px] rounded-[10px] border"
                style={tabStyle}
              />

              <span className="pointer-events-none absolute inset-0 rounded-[22px] ring-1 ring-transparent transition-all duration-300 group-hover:ring-[rgba(178,197,109,0.30)]" />

              <span className="pointer-events-none absolute left-0 top-[14px] bottom-[14px] w-[4px] rounded-r-full bg-gradient-to-b from-[#efe5c6] via-[#ddcf9f] to-[#f5ecd3] opacity-80 transition-opacity duration-300 group-hover:opacity-100" />

              <div className="relative z-[1] min-w-0">
                <div className="text-[12px] font-extrabold tracking-[0.22em] text-black">
                  {it.title}
                </div>
                <div className="mt-1 text-[11px] text-black/46 transition-colors duration-300 group-hover:text-black/58">
                  {it.subtitle}
                </div>
              </div>

              <div className="relative z-[1] ml-4 flex shrink-0 items-center">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/10 bg-white/86 text-black/60 shadow-[0_4px_12px_-10px_rgba(0,0,0,0.18)] transition-all duration-300 group-hover:border-black/12 group-hover:bg-white group-hover:text-black/82 group-hover:shadow-[0_8px_18px_-12px_rgba(0,0,0,0.22)]">
                  <DownloadIcon />
                </span>
              </div>
            </a>
          ))}
        </section>
      ) : (
        <div className="rounded-[20px] border border-black/10 bg-white px-5 py-6 text-sm text-black/55">
          Для вашего региона прайс-листы пока не добавлены.
        </div>
      )}

      <section className="space-y-4">
        <div>
          <h2 className="mt-1 text-[21px] font-semibold tracking-[-0.02em] text-black">
            Единый прайс по коллекциям
          </h2>
        </div>

        <a
          href={UNIFIED_PRICE_CARD.fileHref}
          download
          target="_blank"
          rel="noreferrer"
          className={[
            "group relative flex min-h-[110px] overflow-visible rounded-[22px] border px-6 py-5",
            "items-center justify-between",
            "transition-all duration-300 ease-out",
            "hover:-translate-y-[2px] hover:shadow-[0_18px_44px_-30px_rgba(0,0,0,0.24)]",
            "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/15",
          ].join(" ")}
          style={cardStyle}
          aria-label="Скачать единый прайс по коллекциям"
        >
          <span
            className="pointer-events-none absolute inset-0 rounded-[22px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
            style={glowStyle}
          />

          <span
            className="pointer-events-none absolute left-[18px] top-[-8px] h-[18px] w-[74px] rounded-[10px] border"
            style={tabStyle}
          />

          <span className="pointer-events-none absolute inset-0 rounded-[22px] ring-1 ring-transparent transition-all duration-300 group-hover:ring-[rgba(178,197,109,0.30)]" />

          <span className="pointer-events-none absolute left-0 top-[14px] bottom-[14px] w-[4px] rounded-r-full bg-gradient-to-b from-[#efe5c6] via-[#ddcf9f] to-[#f5ecd3] opacity-80 transition-opacity duration-300 group-hover:opacity-100" />

          <div className="relative z-[1] min-w-0">
            <div className="text-[13px] font-extrabold tracking-[0.18em] text-black">
              {UNIFIED_PRICE_CARD.title}
            </div>
            <div className="mt-2 text-[11px] text-black/46 transition-colors duration-300 group-hover:text-black/58">
              {UNIFIED_PRICE_CARD.subtitle}
            </div>
          </div>

          <div className="relative z-[1] ml-4 flex shrink-0 items-center">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/86 text-black/60 shadow-[0_4px_12px_-10px_rgba(0,0,0,0.18)] transition-all duration-300 group-hover:border-black/12 group-hover:bg-white group-hover:text-black/82 group-hover:shadow-[0_8px_18px_-12px_rgba(0,0,0,0.22)]">
              <DownloadIcon />
            </span>
          </div>
        </a>
      </section>
    </div>
  );
}
