"use client";

import Link from "next/link";
import { Eye, Heart } from "lucide-react";
import { useMemo, useState } from "react";

import type { DealerNewsItem } from "@/app/lib/dealer/news";

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

function toInputDate(dateString: string | null): string {
  if (!dateString) return "";

  try {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = `${date.getMonth() + 1}`.padStart(2, "0");
    const day = `${date.getDate()}`.padStart(2, "0");

    return `${year}-${month}-${day}`;
  } catch {
    return "";
  }
}

function getTodayInputDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, "0");
  const day = `${now.getDate()}`.padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function kindLabel(kind: "news" | "promo"): string {
  return kind === "promo" ? "АКЦИЯ" : "НОВОСТЬ";
}

type Props = {
  items: DealerNewsItem[];
};

export default function DealerNewsList({ items }: Props) {
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [selectedDate, setSelectedDate] = useState(getTodayInputDate());
  const [selectedTag, setSelectedTag] = useState("");

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();

    for (const item of items) {
      for (const tag of item.hashtags) {
        const normalized = tag.trim().replace(/^#/, "");
        if (normalized) {
          tagSet.add(normalized);
        }
      }
    }

    return Array.from(tagSet).sort((a, b) => a.localeCompare(b, "ru"));
  }, [items]);

  const filteredItems = useMemo(() => {
    const next = items.filter((item) => {
      const itemDate = toInputDate(item.publishedAt || item.createdAt);

      const matchesDate = !selectedDate || itemDate === selectedDate;
      const matchesTag =
        !selectedTag ||
        item.hashtags.some(
          (tag) => tag.trim().replace(/^#/, "") === selectedTag,
        );

      return matchesDate && matchesTag;
    });

    next.sort((a, b) => {
      const aTime = new Date(a.publishedAt || a.createdAt).getTime();
      const bTime = new Date(b.publishedAt || b.createdAt).getTime();

      if (sortOrder === "oldest") {
        return aTime - bTime;
      }

      return bTime - aTime;
    });

    return next;
  }, [items, selectedDate, selectedTag, sortOrder]);

  const resetFilters = () => {
    setSortOrder("newest");
    setSelectedDate(getTodayInputDate());
    setSelectedTag("");
  };

  if (items.length === 0) {
    return (
      <div className="rounded-[24px] border border-black/10 bg-white p-6 shadow-[0_18px_50px_-40px_rgba(0,0,0,0.28)]">
        <h2 className="text-[20px] font-semibold tracking-[-0.03em] text-black">
          Пока новостей нет
        </h2>
        <p className="mt-2 text-[14px] leading-6 text-black/55">
          Когда в Strapi будут опубликованы новости для дилеров, они появятся
          здесь.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <section className="rounded-[24px] border border-black/10 bg-white p-4 shadow-[0_18px_50px_-40px_rgba(0,0,0,0.28)] md:p-5">
        <div className="flex flex-col gap-3">
          <div className="grid gap-3 md:grid-cols-[1fr_220px_auto]">
            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.18em] text-black/45">
                Дата публикации
              </label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="h-10 w-full cursor-pointer rounded-[14px] border border-black/10 bg-white px-3 text-[14px] text-black outline-none transition focus:border-black/20"
              />
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-medium uppercase tracking-[0.18em] text-black/45">
                Сортировка
              </label>
              <select
                value={sortOrder}
                onChange={(e) =>
                  setSortOrder(
                    e.target.value === "oldest" ? "oldest" : "newest",
                  )
                }
                className="h-10 w-full cursor-pointer rounded-[14px] border border-black/10 bg-white px-3 text-[14px] text-black outline-none transition focus:border-black/20"
              >
                <option value="newest">Сначала новые</option>
                <option value="oldest">Сначала старые</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                type="button"
                onClick={resetFilters}
                className="inline-flex h-10 cursor-pointer items-center justify-center rounded-full border border-black/10 px-4 text-[14px] font-medium text-black transition hover:bg-black hover:text-white"
              >
                Сбросить
              </button>
            </div>
          </div>

          {allTags.length > 0 ? (
            <div>
              <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.18em] text-black/45">
                Хэштеги
              </p>

              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setSelectedTag("")}
                  className={cn(
                    "cursor-pointer rounded-full border px-3 py-1 text-[12px] transition",
                    selectedTag === ""
                      ? "border-black bg-black text-white"
                      : "border-black/10 bg-white text-black/65 hover:border-black/20 hover:text-black",
                  )}
                >
                  Все
                </button>

                {allTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(tag)}
                    className={cn(
                      "cursor-pointer rounded-full border px-3 py-1 text-[12px] transition",
                      selectedTag === tag
                        ? "border-black bg-black text-white"
                        : "border-black/10 bg-white text-black/65 hover:border-black/20 hover:text-black",
                    )}
                  >
                    #{tag}
                  </button>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </section>

      {filteredItems.length === 0 ? (
        <div className="rounded-[24px] border border-black/10 bg-white p-6 shadow-[0_18px_50px_-40px_rgba(0,0,0,0.28)]">
          <h2 className="text-[20px] font-semibold tracking-[-0.03em] text-black">
            Ничего не найдено
          </h2>
          <p className="mt-2 text-[14px] leading-6 text-black/55">
            Попробуй изменить дату или выбрать другой хэштег.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredItems.map((item) => {
            const dateLabel = formatDate(item.publishedAt || item.createdAt);

            return (
              <article
                key={item.id}
                className="group rounded-[24px] border border-black/10 bg-white p-5 shadow-[0_18px_50px_-40px_rgba(0,0,0,0.28)] transition-all duration-300 hover:-translate-y-[2px] hover:border-black/15 hover:bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(250,250,250,1)_100%)] hover:shadow-[0_22px_50px_-34px_rgba(0,0,0,0.2)] md:p-6"
              >
                <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.16em]">
                  <span className="rounded-full bg-black/5 px-2.5 py-1 text-black/55">
                    {kindLabel(item.kind)}
                  </span>

                  {item.isPinned ? (
                    <span className="rounded-full bg-black px-2.5 py-1 text-white">
                      Важно
                    </span>
                  ) : null}

                  {dateLabel ? (
                    <span className="normal-case text-[13px] tracking-normal text-black/40">
                      {dateLabel}
                    </span>
                  ) : null}
                </div>

                <h2 className="mt-4 text-[24px] font-semibold tracking-[-0.03em] text-black transition-colors duration-300 group-hover:text-black/80 md:text-[26px]">
                  {item.title}
                </h2>

                {item.excerpt ? (
                  <p className="mt-3 max-w-[860px] text-[15px] leading-6 text-black/68 transition-colors duration-300 group-hover:text-black/78">
                    {item.excerpt}
                  </p>
                ) : null}

                {item.hashtags.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {item.hashtags.map((tag) => (
                      <button
                        key={`${item.id}-${tag}`}
                        type="button"
                        onClick={() =>
                          setSelectedTag(tag.trim().replace(/^#/, ""))
                        }
                        className="cursor-pointer rounded-full border border-black/10 px-2.5 py-1 text-[11px] text-black/55 transition hover:border-black/20 hover:text-black"
                      >
                        #{tag}
                      </button>
                    ))}
                  </div>
                ) : null}

                <div className="mt-4 flex flex-wrap items-center gap-4">
                  <div className="flex items-center gap-3 text-[13px] text-black/45">
                    <span className="inline-flex items-center gap-1.5">
                      <Eye className="h-4 w-4 transition-colors duration-300 group-hover:text-black/55" />
                      {item.viewsCount}
                    </span>

                    <span className="inline-flex items-center gap-1">
                      <Heart
                        className={cn(
                          "h-[15px] w-[15px] transition-transform duration-300 group-hover:scale-110",
                          (item.likesCount ?? 0) > 0
                            ? "fill-red-500 text-red-500"
                            : "text-black/30 group-hover:text-red-400",
                        )}
                      />
                      <span className="text-black/45">
                        {item.likesCount ?? 0}
                      </span>
                    </span>
                  </div>

                  <Link
                    href={`/dealer/news/${item.slug}`}
                    className="inline-flex items-center gap-2 text-[14px] font-medium text-black transition-all duration-300 group-hover:translate-x-[2px] group-hover:text-black/75"
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
    </div>
  );
}
