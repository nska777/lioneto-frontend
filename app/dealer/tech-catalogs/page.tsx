// app/dealer/tech-catalogs/page.tsx
import type { CSSProperties } from "react";

type TechCatalogItem = {
  id: string;
  title: string;
  fileHref: string; // файл в /public
  // необязательно: обложка, если потом захочешь
  coverHref?: string;
};

const TECH_CATALOGS: TechCatalogItem[] = [
  { id: "amber", title: "AMBER", fileHref: "/dealer/tech-catalogs/amber.pdf" },
  {
    id: "scandy",
    title: "SCANDY",
    fileHref: "/dealer/tech-catalogs/scandy.pdf",
  },
  {
    id: "elizabeth",
    title: "ELIZABETH",
    fileHref: "/dealer/tech-catalogs/elizabeth.pdf",
  },
  {
    id: "salvador",
    title: "SALVADOR",
    fileHref: "/dealer/tech-catalogs/salvador.pdf",
  },
  { id: "pitti", title: "PITTI", fileHref: "/dealer/tech-catalogs/pitti.pdf" },
  {
    id: "buongiorno",
    title: "BUONGIORNO",
    fileHref: "/dealer/tech-catalogs/buongiorno.pdf",
  },
];

const bookBorder: CSSProperties = {
  borderColor: "rgba(189, 160, 86, 0.26)", // тёплая шампань
};

const goldSheen: CSSProperties = {
  background:
    "radial-gradient(120% 120% at 22% 0%, rgba(232, 208, 148, 0.34) 0%, rgba(232, 208, 148, 0) 55%)",
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
            Технические каталоги
          </h1>
          <p className="mt-1 text-sm text-black/55">
            Выберите коллекцию — загрузка начнётся сразу.
          </p>
        </div>
      </header>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {TECH_CATALOGS.map((it) => (
          <a
            key={it.id}
            href={it.fileHref}
            download
            className={[
              "group relative overflow-hidden",
              // формат "книга": чуть выше и узкая “корешковая” полоса слева
              "h-[150px] rounded-[18px] border bg-white",
              "px-5 py-5",
              "flex items-stretch justify-between",
              "transition-transform duration-200",
              "hover:-translate-y-[1px]",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20",
            ].join(" ")}
            style={bookBorder}
            aria-label={`Скачать технический каталог ${it.title}`}
          >
            {/* gold sheen на hover */}
            <span
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              style={goldSheen}
            />
            {/* мягкая тень на hover */}
            <span className="pointer-events-none absolute inset-0 shadow-[0_16px_40px_-24px_rgba(0,0,0,0.26)] opacity-0 transition-opacity duration-200 group-hover:opacity-100" />

            {/* "Корешок книги" */}
            <span
              className="pointer-events-none absolute left-0 top-0 h-full w-[14px]"
              style={{
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.02) 55%, rgba(0,0,0,0.05) 100%)",
              }}
            />
            {/* разделительная линия у корешка */}
            <span className="pointer-events-none absolute left-[14px] top-0 h-full w-px bg-black/10" />

            <div className="relative z-[1] flex min-w-0 flex-1 flex-col justify-between pl-2">
              <div className="min-w-0">
                <div className="text-[14px] font-extrabold tracking-[0.18em] text-black">
                  {it.title}
                </div>
                <div className="mt-1 text-xs text-black/45">
                  Technical catalog (PDF)
                </div>
              </div>

              <div className="text-xs text-black/45">
                Нажмите для скачивания
              </div>
            </div>

            <div className="relative z-[1] flex items-end">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white text-black/70 transition-colors duration-200 group-hover:text-black">
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
