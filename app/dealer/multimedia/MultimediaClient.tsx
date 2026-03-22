"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type {
  DealerMultimediaCollectionCard,
  DealerMultimediaCollectionSlug,
} from "@/app/lib/dealer/multimedia";
import { DEALER_MULTIMEDIA_COLLECTIONS } from "@/app/lib/dealer/multimedia";

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

type Props = {
  collections: DealerMultimediaCollectionCard[];
};

function PremiumAccentPill({ active }: { active: boolean }) {
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
        "rounded-full px-3.5 py-2 text-[11px] font-semibold tracking-[0.12em] uppercase",
        "text-black/70 transition-colors hover:text-black",
      )}
    >
      <PremiumAccentPill active={active} />
      <span className="relative">{label}</span>
    </button>
  );
}

function CollectionCard({
  slug,
  title,
  coverUrl,
  photosCount,
}: DealerMultimediaCollectionCard) {
  return (
    <Link
      href={`/dealer/multimedia/photos/${slug}`}
      className={cn(
        "group block overflow-hidden rounded-[16px] border border-black/10 bg-white",
        "transition-transform duration-300 ease-out hover:-translate-y-[2px]",
        "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/15",
      )}
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-black/[0.03]">
        {coverUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverUrl}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
            draggable={false}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs font-medium tracking-[0.14em] text-black/30">
            НЕТ ФОТО
          </div>
        )}

        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/28 to-transparent px-3 pb-3 pt-8">
          <div className="inline-flex rounded-full border border-white/30 bg-white/15 px-2.5 py-1 text-[10px] font-semibold tracking-[0.12em] text-white backdrop-blur-sm">
            {photosCount} ФОТО
          </div>
        </div>
      </div>

      <div className="px-3.5 py-3">
        <div className="text-[11px] font-semibold tracking-[0.12em] text-black/45">
          КОЛЛЕКЦИЯ
        </div>
        <div className="mt-1 text-[15px] font-semibold text-black">{title}</div>
      </div>
    </Link>
  );
}

export default function MultimediaClient({ collections }: Props) {
  const [filter, setFilter] = useState<DealerMultimediaCollectionSlug | "all">(
    "all",
  );

  const filteredCollections = useMemo(() => {
    if (filter === "all") return collections;
    return collections.filter((item) => item.slug === filter);
  }, [collections, filter]);

  return (
    <div className="space-y-5">
      <header>
        <div className="text-sm text-black/45">Dealer Portal</div>
        <h1 className="mt-1 text-[22px] font-semibold tracking-[-0.02em] text-black">
          Мультимедиа
        </h1>
        <p className="mt-1 max-w-3xl text-sm text-black/55">
          Фото-материалы по коллекциям для витрин, презентаций и работы дилеров.
        </p>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <Chip
          label="Все"
          active={filter === "all"}
          onClick={() => setFilter("all")}
        />

        {DEALER_MULTIMEDIA_COLLECTIONS.map((item) => (
          <Chip
            key={item.slug}
            label={item.title}
            active={filter === item.slug}
            onClick={() => setFilter(item.slug)}
          />
        ))}
      </div>

      <section className="rounded-[18px] border border-black/10 bg-white p-4 sm:p-5">
        <div className="mb-4">
          <div className="text-[14px] font-extrabold tracking-[0.14em] text-black">
            ФОТОГАЛЕРЕЯ
          </div>
          <div className="mt-1 text-sm text-black/55">
            Выберите коллекцию и откройте галерею.
          </div>
        </div>

        {filteredCollections.length === 0 ? (
          <div className="rounded-[14px] border border-black/10 bg-black/[0.02] px-4 py-4 text-sm text-black/55">
            Для этой коллекции пока нет материалов.
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {filteredCollections.map((item) => (
              <CollectionCard key={item.slug} {...item} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
