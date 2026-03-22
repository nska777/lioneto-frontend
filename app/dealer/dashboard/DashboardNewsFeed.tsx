import Link from "next/link";
import { Heart, Eye } from "lucide-react";

export type DashboardNewsItem = {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  kind: "news" | "promo";
  isPinned: boolean;
  viewsCount: number;
  likesCount: number;
  publishedAt: string;
  coverUrl: string | null;

  source?: "news" | "calendar";
  eventType?:
    | "training"
    | "webinar"
    | "meeting"
    | "exhibition"
    | "important"
    | "industry";
  href?: string;
  ctaLabel?: string;
  isRegistrationOpen?: boolean;
};

type DashboardNewsFeedProps = {
  news: DashboardNewsItem[];
};

function formatDate(value: string): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function cn(...parts: Array<string | false | null | undefined>) {
  return parts.filter(Boolean).join(" ");
}

function kindLabel(item: DashboardNewsItem): string {
  if (item.source === "calendar") {
    switch (item.eventType) {
      case "training":
        return "ОБУЧЕНИЕ";
      case "webinar":
        return "ВЕБИНАР";
      case "meeting":
        return "ВСТРЕЧА";
      case "exhibition":
        return "СОБЫТИЕ";
      case "important":
        return "ВАЖНО";
      case "industry":
        return "ИНДУСТРИЯ";
      default:
        return "СОБЫТИЕ";
    }
  }

  return item.kind === "promo" ? "АКЦИЯ" : "НОВОСТЬ";
}

function kindBadgeClass(item: DashboardNewsItem): string {
  if (item.source === "calendar") {
    return "bg-red-500 text-white border-red-500";
  }

  return "bg-[#F3E7C4] text-[#7A5A16] border-[#E2C982]";
}

function getItemHref(item: DashboardNewsItem): string {
  if (item.source === "calendar" && item.href) {
    return item.href;
  }

  return `/dealer/news/${item.slug}`;
}

function getItemCtaLabel(item: DashboardNewsItem): string {
  if (item.source === "calendar") {
    return item.ctaLabel || "Перейти в календарь";
  }

  return "Читать подробнее";
}

function canShowApplyBadge(item: DashboardNewsItem): boolean {
  return (
    item.source === "calendar" &&
    Boolean(item.isRegistrationOpen) &&
    (item.eventType === "training" || item.eventType === "webinar")
  );
}

function getApplyHref(item: DashboardNewsItem): string {
  const href = getItemHref(item);
  return href.includes("?") ? `${href}&apply=1` : `${href}?apply=1`;
}

export default function DashboardNewsFeed({ news }: DashboardNewsFeedProps) {
  return (
    <section className="space-y-4">
      <div className="flex items-end justify-between gap-3">
        <div>
          <h2 className="text-[28px] font-semibold tracking-[-0.03em] text-black">
            Новости и акции
          </h2>
          <p className="mt-1 text-[15px] text-black/60">
            Актуальные обновления для дилеров Lioneto.
          </p>
        </div>

        <Link
          href="/dealer/news"
          className="rounded-full border border-black/10 bg-white px-4 py-2 text-[13px] font-medium text-black transition hover:bg-black hover:text-white"
        >
          Все новости
        </Link>
      </div>

      {news.length === 0 ? (
        <div className="rounded-[28px] border border-dashed border-black/12 bg-white p-8 text-[15px] text-black/55">
          Пока новостей нет.
        </div>
      ) : (
        <div className="space-y-4">
          {news.map((item) => (
            <article
              key={`${item.source ?? "news"}-${item.id}`}
              className="group relative overflow-hidden rounded-[28px] border border-black/10 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-[3px] hover:border-black/15 hover:bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(250,250,250,1)_100%)] hover:shadow-[0_24px_60px_-32px_rgba(0,0,0,0.22)]"
            >
              {item.source === "calendar" ? (
                <div className="pointer-events-none absolute right-[-74px] top-[34px] rotate-[38deg] rounded-none border border-[#E7D8A8] bg-[#F6EBCF] px-20 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#6E5520] shadow-sm">
                  Календарь событий
                </div>
              ) : null}

              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "rounded-full border px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em]",
                    kindBadgeClass(item),
                  )}
                >
                  {kindLabel(item)}
                </span>

                {item.isPinned ? (
                  <span className="rounded-full bg-black px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-white">
                    Важно
                  </span>
                ) : null}

                {item.publishedAt ? (
                  <span className="text-[13px] text-black/45">
                    {formatDate(item.publishedAt)}
                  </span>
                ) : null}

                {canShowApplyBadge(item) ? (
                  <Link
                    href={getApplyHref(item)}
                    className="inline-flex animate-pulse items-center rounded-full border border-emerald-400 bg-emerald-500 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-white shadow-[0_10px_30px_-14px_rgba(16,185,129,0.9)] transition hover:bg-emerald-600"
                  >
                    Успейте записаться
                  </Link>
                ) : null}
              </div>

              <h3 className="pr-28 text-[24px] font-semibold tracking-[-0.02em] text-black transition-colors duration-300 group-hover:text-black/80">
                {item.title}
              </h3>

              {item.excerpt ? (
                <p className="mt-3 max-w-[900px] text-[16px] leading-7 text-black/70 transition-colors duration-300 group-hover:text-black/78">
                  {item.excerpt}
                </p>
              ) : null}

              <div className="mt-5 flex flex-wrap items-center gap-4 text-[14px] text-black/45">
                {item.source !== "calendar" ? (
                  <>
                    <span className="inline-flex items-center gap-1.5">
                      <Eye className="h-[16px] w-[16px] text-black/35 transition-colors duration-300 group-hover:text-black/45" />
                      <span>{item.viewsCount ?? 0}</span>
                    </span>

                    <span className="inline-flex items-center gap-1">
                      <Heart
                        className={cn(
                          "h-[17px] w-[17px] transition-transform duration-300 group-hover:scale-110",
                          (item.likesCount ?? 0) > 0
                            ? "fill-red-500 text-red-500"
                            : "text-black/30 group-hover:text-red-400",
                        )}
                      />
                      <span className="text-black/45">
                        {item.likesCount ?? 0}
                      </span>
                    </span>
                  </>
                ) : null}

                <Link
                  href={getItemHref(item)}
                  className="font-medium text-black transition-all duration-300 group-hover:translate-x-[2px] group-hover:text-black/75"
                >
                  {getItemCtaLabel(item)} →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
