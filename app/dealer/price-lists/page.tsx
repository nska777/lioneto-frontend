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
  disabled?: boolean;
};

const COLLECTION_ORDER = [
  "amber",
  "scandy",
  "elizabeth",
  "salvador",
  "pitti",
  "buongiorno",
] as const;

const EXTRA_CARD_ORDER = ["request-form"] as const;

type CollectionSlug = (typeof COLLECTION_ORDER)[number];
type ExtraCardSlug = (typeof EXTRA_CARD_ORDER)[number];

const COLLECTION_LABELS: Record<CollectionSlug, string> = {
  amber: "AMBER",
  scandy: "SCANDY",
  elizabeth: "ELIZABETH",
  salvador: "SALVADOR",
  pitti: "PITTI",
  buongiorno: "BUONGIORNO",
};

const EXTRA_CARD_LABELS: Record<ExtraCardSlug, string> = {
  "request-form": "Форма заявки",
};

const UNIFIED_PRICE_CARD: PriceListCardItem = {
  id: "unified-price",
  title: "Единый прайс по коллекциям",
  subtitle: "В разработке",
  fileHref: "",
  disabled: true,
};

const cardStyle: CSSProperties = {
  borderColor: "rgba(184, 154, 92, 0.24)",
  background:
    "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(250,247,240,0.98) 100%)",
};

const cardGlowStyle: CSSProperties = {
  background: `
    radial-gradient(90% 100% at 0% 0%, rgba(225, 211, 166, 0.26) 0%, rgba(225, 211, 166, 0.00) 48%),
    radial-gradient(70% 70% at 100% 0%, rgba(245, 236, 211, 0.36) 0%, rgba(245, 236, 211, 0.00) 48%)
  `,
};

function DownloadIcon() {
  return (
    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M12 4v8.2m0 0 3.2-3.2M12 12.2 8.8 9"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.5 16.3v1.1A1.6 1.6 0 0 0 7.1 19h9.8a1.6 1.6 0 0 0 1.6-1.6v-1.1"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ExcelIcon() {
  return (
    <svg
      width="19"
      height="19"
      viewBox="0 0 24 24"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M6.8 3.8h7.1l3.3 3.35v13.05H6.8V3.8Z"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinejoin="round"
      />
      <path
        d="M13.8 3.9v3.45h3.35"
        stroke="currentColor"
        strokeWidth="1.45"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="m9.2 10 2.1 2.55L9.05 15.5m4.75-5.5-2.25 2.55 2.1 2.95"
        stroke="currentColor"
        strokeWidth="1.55"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function isCollectionSlug(slug: string): slug is CollectionSlug {
  return (COLLECTION_ORDER as readonly string[]).includes(slug);
}

function isExtraCardSlug(slug: string): slug is ExtraCardSlug {
  return (EXTRA_CARD_ORDER as readonly string[]).includes(slug);
}

function buildCollectionCards(
  items: DealerPriceListItem[],
): PriceListCardItem[] {
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
      fileHref: "",
      subtitle: "В разработке",
      disabled: true,
    });
  }

  return result;
}

function buildExtraCards(items: DealerPriceListItem[]): PriceListCardItem[] {
  const bySlug = new Map<string, DealerPriceListItem>();

  for (const item of items) {
    if (!bySlug.has(item.collectionSlug)) {
      bySlug.set(item.collectionSlug, item);
    }
  }

  const result: PriceListCardItem[] = [];

  for (const slug of EXTRA_CARD_ORDER) {
    const item = bySlug.get(slug);

    if (!item) {
      continue;
    }

    result.push({
      id: slug,
      title: item.collectionTitle?.trim() || EXTRA_CARD_LABELS[slug],
      fileHref: item.fileUrl,
      subtitle: "Скачать Excel (.xlsx)",
    });
  }

  return result;
}

function PriceCard({
  item,
  large = false,
}: {
  item: PriceListCardItem;
  large?: boolean;
}) {
  const isDisabled = Boolean(item.disabled);

  const content = (
    <>
      <span
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={cardGlowStyle}
      />

      <span className="pointer-events-none absolute left-0 top-0 h-full w-[5px] bg-gradient-to-b from-[#eadfbe] via-[#cdb26f] to-[#f4ead2]" />

      <div className="relative z-[1] flex min-w-0 items-center gap-4">
        <span
          className={[
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-[16px] border shadow-[0_10px_22px_-18px_rgba(0,0,0,0.35)]",
            isDisabled
              ? "border-black/10 bg-black/[0.03] text-black/35"
              : "border-[#d8c493]/45 bg-[#f8f1dd] text-[#9a7a2e]",
          ].join(" ")}
        >
          <ExcelIcon />
        </span>

        <div className="min-w-0">
          <div
            className={[
              "break-words font-semibold leading-[1.2] tracking-[0.03em]",
              isDisabled ? "text-black/45" : "text-black",
              large ? "text-[18px]" : "text-[16px]",
            ].join(" ")}
          >
            {item.title}
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <span
              className={[
                "rounded-full border px-3 py-1 text-[12px] font-medium",
                isDisabled
                  ? "border-black/8 bg-black/[0.03] text-black/38"
                  : "border-black/8 bg-white/75 text-black/58",
              ].join(" ")}
            >
              {item.subtitle}
            </span>
          </div>
        </div>
      </div>

      <div className="relative z-[1] flex shrink-0 items-center">
        <span
          className={[
            "inline-flex items-center justify-center rounded-full border shadow-[0_10px_24px_-18px_rgba(0,0,0,0.38)] transition-all duration-300",
            large ? "h-11 w-11" : "h-10 w-10",
            isDisabled
              ? "cursor-not-allowed border-black/8 bg-black/[0.03] text-black/28"
              : "border-black/10 bg-white text-black/62 group-hover:scale-105 group-hover:border-[#c9ad6e]/45 group-hover:text-black",
          ].join(" ")}
        >
          {isDisabled ? (
            <span className="text-[16px] font-semibold">×</span>
          ) : (
            <DownloadIcon />
          )}
        </span>
      </div>
    </>
  );

  const className = [
    "group relative overflow-hidden rounded-[24px] border",
    large ? "min-h-[118px] px-6 py-5" : "min-h-[106px] px-5 py-4",
    "flex items-center justify-between gap-5",
    "transition-all duration-300 ease-out",
    isDisabled
      ? "cursor-not-allowed opacity-80"
      : "hover:-translate-y-[2px] hover:border-[#c9ad6e]/45 hover:shadow-[0_18px_48px_-32px_rgba(0,0,0,0.32)]",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/15",
  ].join(" ");

  if (isDisabled) {
    return (
      <div
        className={className}
        style={cardStyle}
        aria-label={`${item.title} — в разработке`}
      >
        {content}
      </div>
    );
  }

  return (
    <a
      href={item.fileHref}
      download
      target="_blank"
      rel="noreferrer"
      className={className}
      style={cardStyle}
      aria-label={`Скачать ${item.title}`}
    >
      {content}
    </a>
  );
}

export default async function Page() {
  const dealer = await getCurrentDealer();
  const countryCode = dealer?.countryCode?.trim().toUpperCase() || "RU";

  const priceLists = await getDealerPriceListsByCountry(countryCode);

  const normalizedPriceLists = priceLists.filter((item) => {
    const slug = item.collectionSlug?.trim();

    if (!slug) {
      return false;
    }

    return isCollectionSlug(slug) || isExtraCardSlug(slug);
  });

  const cards = buildCollectionCards(normalizedPriceLists);
  const extraCards = buildExtraCards(normalizedPriceLists);

  return (
    <div className="space-y-10">
      <header className="flex items-start justify-between gap-6">
        <div>
          <h1 className="mt-1 text-[26px] font-semibold tracking-[-0.035em] text-black">
            Прайс-листы
          </h1>
        </div>
      </header>

      {cards.length > 0 ? (
        <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {cards.map((it) => (
            <PriceCard key={it.id} item={it} />
          ))}
        </section>
      ) : (
        <div className="rounded-[22px] border border-black/10 bg-white px-5 py-6 text-sm text-black/55">
          Для вашего региона прайс-листы пока не добавлены.
        </div>
      )}

      {extraCards.length > 0 ? (
        <section className="space-y-5">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#a5823a]">
              Files
            </p>
            <h2 className="mt-2 text-[24px] font-semibold tracking-[-0.035em] text-black">
              Документы
            </h2>
          </div>

          <section className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {extraCards.map((it) => (
              <PriceCard key={it.id} item={it} />
            ))}
          </section>
        </section>
      ) : null}

      <section className="space-y-5">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#a5823a]">
            Full price
          </p>
          <h2 className="mt-2 text-[24px] font-semibold tracking-[-0.035em] text-black">
            Единый прайс по коллекциям
          </h2>
        </div>

        <PriceCard item={UNIFIED_PRICE_CARD} large />
      </section>
    </div>
  );
}
