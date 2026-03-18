import Link from "next/link";
import { Eye, Heart } from "lucide-react";

import { getDealerNews } from "@/app/lib/dealer/news";

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

function formatDate(dateString: string | null): string {
  if (!dateString) return "";

  try {
    return new Intl.DateTimeFormat("ru-RU", {
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(new Date(dateString));
  } catch {
    return "";
  }
}

function kindLabel(kind: "news" | "promo"): string {
  return kind === "promo" ? "АКЦИЯ" : "НОВОСТЬ";
}

export default async function DealerNewsPage() {
  const items = await getDealerNews();

  return (
    <main className="mx-auto w-full max-w-[1120px] px-4 py-6 md:px-6 md:py-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[12px] uppercase tracking-[0.22em] text-black/40">
            Dealer Portal
          </p>
          <h1 className="mt-2 text-[34px] font-semibold tracking-[-0.03em] text-black">
            Новости и акции
          </h1>
          <p className="mt-2 max-w-[720px] text-[15px] leading-6 text-black/55">
            Все актуальные обновления, материалы и объявления для дилеров
            Lioneto.
          </p>
        </div>

        <Link
          href="/dealer/dashboard"
          className="inline-flex h-11 items-center justify-center rounded-full border border-black/10 px-5 text-[14px] font-medium text-black transition hover:bg-black hover:text-white"
        >
          Назад в кабинет
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="rounded-[28px] border border-black/10 bg-white p-8 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.3)]">
          <h2 className="text-[22px] font-semibold tracking-[-0.03em] text-black">
            Пока новостей нет
          </h2>
          <p className="mt-2 text-[15px] leading-6 text-black/55">
            Когда в Strapi будут опубликованы новости для дилеров, они появятся
            здесь.
          </p>
        </div>
      ) : (
        <div className="space-y-5">
          {items.map((item) => {
            const dateLabel = formatDate(item.publishedAt || item.createdAt);

            return (
              <article
                key={item.id}
                className="rounded-[28px] border border-black/10 bg-white p-6 shadow-[0_20px_60px_-40px_rgba(0,0,0,0.3)] transition hover:shadow-[0_26px_70px_-38px_rgba(0,0,0,0.35)] md:p-7"
              >
                <div className="flex flex-wrap items-center gap-3 text-[12px] uppercase tracking-[0.18em]">
                  <span className="rounded-full bg-black/5 px-3 py-1 text-black/55">
                    {kindLabel(item.kind)}
                  </span>

                  {item.isPinned ? (
                    <span className="rounded-full bg-black px-3 py-1 text-white">
                      Важно
                    </span>
                  ) : null}

                  {dateLabel ? (
                    <span className="normal-case tracking-normal text-[14px] text-black/40">
                      {dateLabel}
                    </span>
                  ) : null}
                </div>

                <h2 className="mt-5 text-[28px] font-semibold tracking-[-0.03em] text-black">
                  {item.title}
                </h2>

                {item.excerpt ? (
                  <p className="mt-4 max-w-[900px] text-[16px] leading-7 text-black/70">
                    {item.excerpt}
                  </p>
                ) : null}

                <div className="mt-6 flex flex-wrap items-center gap-5">
                  <div className="flex items-center gap-4 text-[14px] text-black/45">
                    <span className="inline-flex items-center gap-1.5">
                      <Eye className="h-4 w-4" />
                      {item.viewsCount}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Heart
                        className={cn(
                          "h-4 w-4",
                          (item.likesCount ?? 0) > 0
                            ? "fill-red-500 text-red-500"
                            : "text-black/35",
                        )}
                      />
                      {item.likesCount ?? 0}
                    </span>
                  </div>

                  <Link
                    href={`/dealer/news/${item.slug}`}
                    className={cn(
                      "inline-flex items-center gap-2 text-[15px] font-medium text-black transition",
                      "hover:translate-x-0.5",
                    )}
                  >
                    Читать подробнее
                    <span aria-hidden="true">→</span>
                  </Link>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </main>
  );
}
