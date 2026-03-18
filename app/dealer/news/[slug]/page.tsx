import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Eye } from "lucide-react";
import NewsViewTracker from "./NewsViewTracker";
import NewsLikeButton from "./NewsLikeButton";
import { getDealerNewsBySlug } from "@/app/lib/dealer/news";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

function formatDate(dateString?: string): string {
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

function renderParagraphs(content: string) {
  return content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block, index) => (
      <p
        key={`${block.slice(0, 24)}-${index}`}
        className="text-[16px] leading-8 text-black/80"
      >
        {block}
      </p>
    ));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const item = await getDealerNewsBySlug(slug);

  if (!item) {
    return {
      title: "Новость не найдена — Dealer Portal",
    };
  }

  return {
    title: `${item.title} — Dealer Portal`,
    description: item.excerpt || "Новость дилерского кабинета Lioneto.",
    robots: {
      index: false,
      follow: false,
    },
  };
}

export default async function DealerNewsDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const item = await getDealerNewsBySlug(slug);

  if (!item) {
    notFound();
  }

  const dateLabel = formatDate(item.publishedAt || item.createdAt);
  const contentBlocks = renderParagraphs(item.content);

  return (
    <main className="mx-auto w-full max-w-[980px] px-4 py-6 md:px-6 md:py-8">
      <NewsViewTracker slug={item.slug} />

      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-[12px] uppercase tracking-[0.22em] text-black/40">
            Dealer Portal
          </p>
          <h1 className="mt-2 text-[34px] font-semibold leading-[1.05] tracking-[-0.03em] text-black md:text-[44px]">
            {item.title}
          </h1>
        </div>

        <Link
          href="/dealer/news"
          className="inline-flex h-11 items-center justify-center rounded-full border border-black/10 px-5 text-[14px] font-medium text-black transition hover:bg-black hover:text-white"
        >
          Ко всем новостям
        </Link>
      </div>

      <article className="overflow-hidden rounded-[28px] border border-black/10 bg-white shadow-[0_20px_60px_-40px_rgba(0,0,0,0.3)]">
        <div className="p-6 md:p-8">
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
              <span className="normal-case text-[14px] tracking-normal text-black/40">
                {dateLabel}
              </span>
            ) : null}
          </div>

          {item.excerpt ? (
            <p className="mt-5 text-[18px] leading-8 text-black/65">
              {item.excerpt}
            </p>
          ) : null}

          <div className="mt-5 flex flex-wrap items-center gap-4 text-[14px] text-black/45">
            <span className="inline-flex items-center gap-1.5">
              <Eye className="h-4 w-4" />
              {item.viewsCount ?? 0}
            </span>
          </div>

          <div className="mt-4">
            <NewsLikeButton
              slug={item.slug}
              initialLikesCount={item.likesCount ?? 0}
            />
          </div>

          {item.coverUrl ? (
            <div className="mt-6 overflow-hidden rounded-[24px] border border-black/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={item.coverUrl}
                alt={item.title}
                className="h-auto w-full object-cover"
              />
            </div>
          ) : null}

          <div className="mt-8 space-y-5">
            {contentBlocks.length > 0 ? (
              contentBlocks
            ) : item.content ? (
              <p className="text-[16px] leading-8 text-black/80">
                {item.content}
              </p>
            ) : (
              <p className="text-[16px] leading-8 text-black/55">
                Полный текст новости пока не добавлен.
              </p>
            )}
          </div>
        </div>
      </article>
    </main>
  );
}
