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

function kindLabel(item: DealerNewsItem): string {
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

  if (item.source === "dealer_note") return "ЗАМЕТКА";
  if (item.source === "knowledge_post") return "НОВОСТЬ";
  return item.kind === "promo" ? "АКЦИЯ" : "НОВОСТЬ";
}

function kindBadgeClass(item: DealerNewsItem): string {
  if (item.source === "calendar") {
    return "bg-red-500 text-white border-red-500";
  }

  if (item.source === "dealer_note") {
    return "bg-[#F4D98D] text-[#6E5319] border-[#DDBA57]";
  }

  if (item.source === "knowledge_post") {
    return "bg-[#FFF5DD] text-[#7B5A22] border-[#E3C98D]";
  }

  return "bg-[#F3E7C4] text-[#7A5A16] border-[#E2C982]";
}

function getCardClass(item: DealerNewsItem): string {
  if (item.source === "dealer_note") {
    return "border-[#E3C98D] bg-[linear-gradient(180deg,#FFF9EC_0%,#FFF4D9_100%)] hover:border-[#D8B868]";
  }

  if (item.source === "knowledge_post") {
    return "border-[#E7DCC2] bg-[linear-gradient(180deg,#FFFDF8_0%,#FFF7E8_100%)] hover:border-[#DCC89A]";
  }

  return "border-black/10 bg-white hover:border-black/15 hover:bg-[linear-gradient(180deg,rgba(255,255,255,1)_0%,rgba(250,250,250,1)_100%)]";
}

function canShowApplyBadge(item: DealerNewsItem): boolean {
  return (
    item.source === "calendar" &&
    item.isRegistrationOpen &&
    (item.eventType === "training" || item.eventType === "webinar")
  );
}

function getApplyHref(item: DealerNewsItem): string {
  if (!item.href) return "/dealer/calendar";
  return item.href.includes("?")
    ? `${item.href}&apply=1`
    : `${item.href}?apply=1`;
}

type Props = {
  items: DealerNewsItem[];
};

export default function DealerNewsList({ items }: Props) {
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTag, setSelectedTag] = useState("");

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();

    for (const item of items) {
      if (item.source === "dealer_note" || item.source === "knowledge_post") {
        continue;
      }

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
        (item.source !== "dealer_note" &&
          item.source !== "knowledge_post" &&
          item.hashtags.some(
            (tag) => tag.trim().replace(/^#/, "") === selectedTag,
          ));

      return matchesDate && matchesTag;
    });

    next.sort((a, b) => {
      const sourcePriority = (item: DealerNewsItem) => {
        if (item.source === "dealer_note") return 0;
        if (item.source === "knowledge_post") return 1;
        if (item.source === "news") return 2;
        return 3;
      };

      const sourceDiff = sourcePriority(a) - sourcePriority(b);
      if (sourceDiff !== 0) return sourceDiff;

      if (a.isPinned !== b.isPinned) {
        return a.isPinned ? -1 : 1;
      }

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
    setSelectedDate("");
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
    <div className="space-y-5">
      <section className="rounded-[24px] border border-black/10 bg-white p-4 shadow-[0_18px_50px_-40px_rgba(0,0,0,0.28)] md:p-5">
        <div className="flex flex-col gap-4">
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
            <div className="min-w-0">
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

      <section className="px-1 pt-1">
        <div>
          <h2 className="text-[30px] leading-[1.08] font-semibold tracking-[-0.02em] text-black">
            Новости и акции
          </h2>
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
            const isKnowledge =
              item.source === "knowledge_post" || item.source === "dealer_note";

            return (
              <article
                key={`${item.source}-${item.id}`}
                className={cn(
                  "group relative overflow-hidden rounded-[24px] border p-5 shadow-[0_18px_50px_-40px_rgba(0,0,0,0.28)] transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_22px_50px_-34px_rgba(0,0,0,0.2)] md:p-6",
                  getCardClass(item),
                )}
              >
                <div className="mb-2">
                  {dateLabel ? (
                    <div className="mb-2 text-[12px] normal-case tracking-normal text-black/40 md:text-[13px]">
                      {dateLabel}
                    </div>
                  ) : null}

                  <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.16em]">
                    <span
                      className={cn(
                        "rounded-full border px-2.5 py-1",
                        kindBadgeClass(item),
                      )}
                    >
                      {kindLabel(item)}
                    </span>

                    {item.isPinned ? (
                      <span className="rounded-full bg-black px-2.5 py-1 text-white">
                        Важно
                      </span>
                    ) : null}

                    {isKnowledge ? (
                      <span className="rounded-full border border-[#E3C98D] bg-[#FFF5DD] px-2.5 py-1 text-[#7B5A22]">
                        ИЗ БАЗЫ ЗНАНИЙ
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
                </div>

                <h2
                  className={cn(
                    "mt-3 font-semibold tracking-[-0.03em] text-black transition-colors duration-300 group-hover:text-black/80",
                    isKnowledge
                      ? "text-[19px] leading-[1.24] md:text-[23px]"
                      : "text-[20px] leading-[1.22] md:mt-4 md:text-[26px] md:leading-[1.15]",
                  )}
                >
                  {item.title}
                </h2>

                {item.excerpt ? (
                  <p
                    className={cn(
                      "mt-3 max-w-[860px] transition-colors duration-300 group-hover:text-black/78",
                      isKnowledge
                        ? "text-[14px] leading-6 text-black/66"
                        : "text-[15px] leading-6 text-black/68",
                    )}
                  >
                    {item.excerpt}
                  </p>
                ) : null}

                <div className="mt-4 flex flex-wrap items-center gap-4">
                  {item.source !== "calendar" ? (
                    <div className="flex items-center gap-3 text-[13px] text-black/45">
                      <span className="inline-flex items-center gap-1.5">
                        <Eye className="h-4 w-4 transition-colors duration-300 group-hover:text-black/55" />
                        {item.viewsCount ?? 0}
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
                  ) : null}

                  <Link
                    href={item.href}
                    className="inline-flex items-center gap-2 text-[14px] font-medium text-black transition-all duration-300 group-hover:translate-x-[2px] group-hover:text-black/75"
                  >
                    {item.ctaLabel || "Читать подробнее"}
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
