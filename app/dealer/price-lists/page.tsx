// app/dealer/price-lists/page.tsx
import type { CSSProperties } from "react";

type PriceListItem = {
  id: string;
  title: string;
  fileHref: string;
  subtitle?: string;
};

const PRICE_LISTS: PriceListItem[] = [
  { id: "amber", title: "AMBER", fileHref: "/dealer/price-lists/amber.xlsx" },
  {
    id: "scandy",
    title: "SCANDY",
    fileHref: "/dealer/price-lists/scandy.xlsx",
  },
  {
    id: "elizabeth",
    title: "ELIZABETH",
    fileHref: "/dealer/price-lists/elizabeth.xlsx",
  },
  {
    id: "salvador",
    title: "SALVADOR",
    fileHref: "/dealer/price-lists/salvador.xlsx",
  },
  { id: "pitti", title: "PITTI", fileHref: "/dealer/price-lists/pitti.xlsx" },
  {
    id: "buongiorno",
    title: "BUONGIORNO",
    fileHref: "/dealer/price-lists/buongiorno.xlsx",
  },
];

const cardStyle: CSSProperties = {
  // тонкая "шампань" рамка всегда → без дерганий
  borderColor: "rgba(189, 160, 86, 0.28)",
};

const goldGlowStyle: CSSProperties = {
  background:
    "radial-gradient(120% 120% at 20% 0%, rgba(232, 208, 148, 0.35) 0%, rgba(232, 208, 148, 0.0) 55%)",
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

export default function Page() {
  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between gap-6">
        <div>
          <div className="text-sm text-black/45">Dealer Portal</div>
          <h1 className="mt-1 text-[22px] font-semibold tracking-[-0.02em] text-black">
            Прайс-листы
          </h1>
          <p className="mt-1 text-sm text-black/55">
            Нажмите на коллекцию — загрузка начнётся сразу.
          </p>
        </div>
      </header>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {PRICE_LISTS.map((it) => (
          <a
            key={it.id}
            href={it.fileHref}
            download
            className={[
              "group relative overflow-hidden",
              "h-[112px] rounded-[20px] border bg-white",
              "px-6",
              "flex items-center justify-between",
              "transition-transform duration-200",
              "hover:-translate-y-[1px]",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20",
            ].join(" ")}
            style={cardStyle}
            aria-label={`Скачать прайс-лист ${it.title}`}
          >
            {/* мягкий gold sheen на hover */}
            <span
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              style={goldGlowStyle}
            />

            {/* лёгкая тень — только визуально, без скачков */}
            <span className="pointer-events-none absolute inset-0 shadow-[0_10px_30px_-18px_rgba(0,0,0,0.22)] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

            <div className="relative z-[1]">
              <div className="text-[14px] font-extrabold tracking-[0.18em] text-black">
                {it.title}
              </div>
              <div className="mt-1 text-xs text-black/45">
                Скачать Excel (.xlsx)
              </div>
            </div>

            <div className="relative z-[1] flex items-center gap-3">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-black/70 transition-colors duration-200 group-hover:text-black">
                <DownloadIcon />
              </span>
            </div>
          </a>
        ))}
      </section>

      <div className="pt-2 text-center text-xs text-black/45">
        При клике на карточку загрузка начинается сразу.
      </div>
    </div>
  );
}
