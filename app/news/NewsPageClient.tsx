"use client";

import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

type NewsTag = "Поступление" | "Обновление" | "Акция" | "Событие";

export type NewsItemInput = {
  id: string | number;
  title: string;
  excerpt?: string;
  subtitle?: string;
  description?: string;
  content?: string;
  dateLabel?: string;
  tag?: string;
  type?: string;
  slug: string;
  publishedAt?: string;
  createdAt?: string;
  cover?: { url: string; alternativeText?: string | null } | null;
  image?: { url: string; alternativeText?: string | null } | null;
  coverImage?: string;
};

type NewsItem = {
  id: string;
  title: string;
  excerpt: string;
  dateLabel: string;
  tag: NewsTag;
  slug: string;
  imageUrl: string;
  imageAlt: string;
};

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

function stripHtml(html?: string) {
  return String(html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatDate(value?: string) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function toPageTag(raw?: string): NewsTag {
  const s = String(raw ?? "").toLowerCase();

  if (
    s.includes("arrival") ||
    s.includes("postuplenie") ||
    s.includes("поступ")
  ) {
    return "Поступление";
  }

  if (s.includes("update") || s.includes("obnovlenie") || s.includes("обнов")) {
    return "Обновление";
  }

  if (
    s.includes("sale") ||
    s.includes("promo") ||
    s.includes("action") ||
    s.includes("akciya") ||
    s.includes("акц")
  ) {
    return "Акция";
  }

  if (s.includes("event") || s.includes("sobytie") || s.includes("событ")) {
    return "Событие";
  }

  return "Обновление";
}

function normalizeItems(input: NewsItemInput[]): NewsItem[] {
  return (input || [])
    .map((it) => {
      const id = String(it.id ?? "").trim();
      const title = String(it.title ?? "").trim();
      const slug = String(it.slug ?? "").trim();

      if (!id || !title || !slug) return null;

      const excerpt =
        String(
          it.excerpt ||
            it.subtitle ||
            it.description ||
            stripHtml(it.content) ||
            "",
        ).trim() || "Краткое описание новости пока не заполнено.";

      const dateLabel =
        String(it.dateLabel || "").trim() ||
        formatDate(it.publishedAt || it.createdAt);

      const tag = toPageTag(it.tag || it.type);

      const imageUrl = it.coverImage || it.cover?.url || it.image?.url || "";

      const imageAlt =
        it.cover?.alternativeText || it.image?.alternativeText || title;

      return {
        id,
        title,
        excerpt,
        dateLabel,
        tag,
        slug,
        imageUrl,
        imageAlt,
      };
    })
    .filter(Boolean) as NewsItem[];
}

const TAGS: Array<"Все" | NewsTag> = [
  "Все",
  "Поступление",
  "Обновление",
  "Акция",
  "Событие",
];

function TagPill({
  active,
  children,
  onClick,
}: {
  active?: boolean;
  children: React.ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-full border px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] transition",
        active
          ? "border-black bg-black text-white"
          : "border-black/10 bg-white text-black/65 hover:border-black/30 hover:text-black",
      )}
      type="button"
    >
      {children}
    </button>
  );
}

function NewsCard({ item, index }: { item: NewsItem; index: number }) {
  const href = `/news/${item.slug}`;

  return (
    <Link
      href={href}
      className={cn(
        "group block overflow-hidden rounded-[30px] border border-black/10 bg-white shadow-sm transition duration-300",
        "hover:-translate-y-1 hover:border-black/20 hover:shadow-xl",
      )}
    >
      <article>
        <div className="relative aspect-[16/10] w-full overflow-hidden bg-black/[0.04]">
          {item.imageUrl ? (
            <Image
              src={item.imageUrl}
              alt={item.imageAlt}
              fill
              unoptimized
              className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-neutral-200 text-[11px] font-semibold uppercase tracking-[0.3em] text-black/35">
              Lioneto News
            </div>
          )}

          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-white px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-black shadow-sm">
              {item.tag}
            </span>

            {item.dateLabel ? (
              <span className="rounded-full bg-white/90 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.14em] text-black/60 shadow-sm">
                {item.dateLabel}
              </span>
            ) : null}
          </div>
        </div>

        <div className="p-5 md:p-6">
          <div className="text-[11px] font-semibold uppercase tracking-[0.28em] text-black/35">
            Новость {String(index + 1).padStart(2, "0")}
          </div>

          <h2 className="mt-4 text-[20px] font-semibold leading-snug tracking-[-0.02em] text-black md:text-[22px]">
            {item.title}
          </h2>

          <p className="mt-3 line-clamp-3 text-[14px] font-medium leading-7 text-black/60">
            {item.excerpt}
          </p>

          <div className="mt-6 flex items-center justify-between gap-4">
            <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-black/40">
              Открыть
            </span>

            <span className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.22em] text-black transition group-hover:translate-x-1">
              Читать
              <ArrowRight size={15} />
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

export default function NewsPageClient({ items }: { items: NewsItemInput[] }) {
  const [tag, setTag] = useState<(typeof TAGS)[number]>("Все");

  const normalized = useMemo(() => normalizeItems(items), [items]);

  const filtered = useMemo(() => {
    return normalized.filter((it) => {
      return tag === "Все" || it.tag === tag;
    });
  }, [normalized, tag]);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [tag]);

  return (
    <div>
      <div className="flex flex-wrap gap-2 md:gap-3">
        {TAGS.map((t) => (
          <TagPill key={t} active={t === tag} onClick={() => setTag(t)}>
            {t === "Все" ? "Все" : t}
          </TagPill>
        ))}
      </div>

      <div className="mt-10 md:mt-12">
        {filtered.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((item, index) => (
              <NewsCard key={item.id} item={item} index={index} />
            ))}
          </div>
        ) : (
          <div className="rounded-[30px] border border-dashed border-black/15 bg-white px-6 py-16 text-center">
            <p className="text-[20px] font-semibold text-black">
              Новости пока не добавлены
            </p>
            <p className="mt-3 text-[14px] leading-7 text-black/55">
              Проверь, что записи опубликованы в Strapi и заполнено поле slug.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
