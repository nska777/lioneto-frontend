import Link from "next/link";

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
              key={item.id}
              className="rounded-[28px] border border-black/10 bg-white p-6 shadow-sm"
            >
              <div className="mb-4 flex flex-wrap items-center gap-2">
                <span
                  className={cn(
                    "rounded-full px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em]",
                    item.kind === "promo"
                      ? "bg-[#efe4c8] text-[#6f5322]"
                      : "bg-black/5 text-black/60",
                  )}
                >
                  {item.kind === "promo" ? "Акция" : "Новость"}
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
              </div>

              <h3 className="text-[24px] font-semibold tracking-[-0.02em] text-black">
                {item.title}
              </h3>

              {item.excerpt ? (
                <p className="mt-3 max-w-[900px] text-[16px] leading-7 text-black/70">
                  {item.excerpt}
                </p>
              ) : null}

              <div className="mt-5 flex flex-wrap items-center gap-4 text-[14px] text-black/45">
                <span>👁 {item.viewsCount}</span>
                <span>♡ {item.likesCount}</span>

                <Link
                  href={`/dealer/news/${item.slug}`}
                  className="font-medium text-black transition hover:opacity-60"
                >
                  Читать подробнее →
                </Link>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
