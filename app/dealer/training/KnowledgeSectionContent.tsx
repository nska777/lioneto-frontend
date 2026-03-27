"use client";

import { memo, useEffect, useMemo, useState } from "react";
import { Eye, Heart, X } from "lucide-react";
import type { DealerKnowledgePost } from "@/app/lib/dealer/knowledge";

type Props = {
  posts: DealerKnowledgePost[];
  canManageNotes?: boolean;
  dealerLogin?: string | null;
};

type CounterOverride = {
  viewsCount?: number;
  likesCount?: number;
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function getKindUi(kind: DealerKnowledgePost["kind"]) {
  switch (kind) {
    case "news":
      return {
        label: "НОВОСТЬ",
        className: "border-[#D8E4F4] bg-white text-[#4A6A8F]",
      };
    case "article":
      return {
        label: "СТАТЬЯ",
        className: "border-[#D9D1F6] bg-[#F6F3FF] text-[#5B4AA2]",
      };
    case "note":
    default:
      return {
        label: "ЗАМЕТКА",
        className: "border-[#E5D4AA] bg-[#FFF7E3] text-[#8A6732]",
      };
  }
}

function normalizeTextToParagraphs(text: string | null | undefined) {
  if (!text) return [];

  return text
    .split(/\n{2,}/)
    .map((part) => part.trim())
    .filter(Boolean);
}

function buildLikedStorageKey(dealerLogin: string | null | undefined) {
  return `dealer-knowledge-liked:${dealerLogin ?? "guest"}`;
}

function readLikedMap(dealerLogin: string | null | undefined) {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.localStorage.getItem(buildLikedStorageKey(dealerLogin));
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeLikedMap(
  dealerLogin: string | null | undefined,
  value: Record<string, boolean>,
) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(
      buildLikedStorageKey(dealerLogin),
      JSON.stringify(value),
    );
  } catch {}
}

function getDisplayedCounts(
  post: DealerKnowledgePost,
  overrides: Record<string, CounterOverride>,
  liked: boolean,
) {
  const override = overrides[post.slug];

  const rawViews = override?.viewsCount ?? post.viewsCount ?? 0;
  const rawLikes = override?.likesCount ?? post.likesCount ?? 0;

  return {
    viewsCount: rawViews,
    likesCount: liked ? Math.max(1, rawLikes) : rawLikes,
  };
}

function Stats({
  viewsCount,
  likesCount,
  liked = false,
  large = false,
}: {
  viewsCount: number;
  likesCount: number;
  liked?: boolean;
  large?: boolean;
}) {
  const iconSize = large ? 19 : 17;
  const textClass = large ? "text-[14px]" : "text-[13px]";

  return (
    <div className="flex items-center gap-4 text-black/55">
      <span className={cn("inline-flex items-center gap-1.5", textClass)}>
        <Eye size={iconSize} strokeWidth={2.1} />
        <span>{viewsCount}</span>
      </span>

      <span className={cn("inline-flex items-center gap-1.5", textClass)}>
        <Heart
          size={iconSize}
          strokeWidth={2.1}
          className={liked ? "fill-[#D84C4C] text-[#D84C4C]" : "text-[#D84C4C]"}
        />
        <span>{likesCount}</span>
      </span>
    </div>
  );
}

const KnowledgeCard = memo(function KnowledgeCard({
  post,
  viewsCount,
  likesCount,
  liked,
  onOpen,
}: {
  post: DealerKnowledgePost;
  viewsCount: number;
  likesCount: number;
  liked: boolean;
  onOpen: (post: DealerKnowledgePost) => void;
}) {
  const kindUi = getKindUi(post.kind);

  return (
    <article className="rounded-[24px] border border-[#E7DCC2] bg-[linear-gradient(180deg,#fffdf9_0%,#ffffff_100%)] px-5 py-5 shadow-[0_14px_30px_rgba(50,40,18,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <div
            className={cn(
              "inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]",
              kindUi.className,
            )}
          >
            {kindUi.label}
          </div>

          <div className="inline-flex items-center rounded-full bg-[#E89C4B] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
            БАЗА ЗНАНИЙ
          </div>

          <div className="text-xs text-black/35">
            {formatDate(post.publishedAt || post.createdAt)}
          </div>
        </div>
      </div>

      <h3 className="mt-4 text-[28px] font-semibold tracking-[-0.03em] text-black">
        {post.title}
      </h3>

      {post.excerpt ? (
        <p className="mt-3 max-w-[920px] text-[15px] leading-7 text-black/58">
          {post.excerpt}
        </p>
      ) : null}

      {post.tags.length > 0 ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex rounded-full border border-black/10 bg-white px-3 py-1 text-xs text-black/45"
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap items-center gap-4">
        <Stats
          viewsCount={viewsCount}
          likesCount={likesCount}
          liked={liked}
          large
        />

        <button
          type="button"
          onClick={() => onOpen(post)}
          className="inline-flex cursor-pointer items-center justify-center rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-black/65 transition hover:bg-black/[0.03] hover:text-black"
        >
          Читать далее
        </button>

        {post.downloadUrl ? (
          <a
            href={post.downloadUrl}
            download
            className="inline-flex cursor-pointer items-center justify-center rounded-full border border-[#BFD3EA] bg-[#F2F8FF] px-5 py-3 text-sm font-semibold text-[#3A648F] transition hover:bg-[#EAF3FE]"
          >
            Скачать файл
          </a>
        ) : null}
      </div>
    </article>
  );
});

function KnowledgePostModal({
  post,
  viewsCount,
  likesCount,
  liked,
  likePending,
  onClose,
  onLike,
}: {
  post: DealerKnowledgePost;
  viewsCount: number;
  likesCount: number;
  liked: boolean;
  likePending: boolean;
  onClose: () => void;
  onLike: (slug: string) => void;
}) {
  const kindUi = getKindUi(post.kind);
  const paragraphs = normalizeTextToParagraphs(post.content || post.excerpt);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 px-4 py-6 backdrop-blur-[2px]">
      <div className="relative z-[1] w-full max-w-4xl overflow-hidden rounded-[28px] border border-[#E7DCC2] bg-white shadow-[0_30px_80px_rgba(0,0,0,0.18)]">
        <div className="flex items-start justify-between gap-4 border-b border-black/10 px-6 py-5">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <div
                className={cn(
                  "inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]",
                  kindUi.className,
                )}
              >
                {kindUi.label}
              </div>

              <div className="inline-flex items-center rounded-full bg-[#E89C4B] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white">
                БАЗА ЗНАНИЙ
              </div>

              <div className="text-sm text-black/40">
                {formatDate(post.publishedAt || post.createdAt)}
              </div>
            </div>

            <h2 className="mt-3 text-[28px] font-semibold tracking-[-0.03em] text-black">
              {post.title}
            </h2>

            <div className="mt-4 flex flex-wrap items-center gap-4">
              <Stats
                viewsCount={viewsCount}
                likesCount={likesCount}
                liked={liked}
                large
              />

              <button
                type="button"
                onClick={() => onLike(post.slug)}
                disabled={likePending || liked}
                className={cn(
                  "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition",
                  liked || likePending
                    ? "cursor-not-allowed border-[#F0D6D6] bg-[#FFF4F4] text-[#D84C4C] opacity-100"
                    : "cursor-pointer border-[#E7C8C8] bg-white text-[#D84C4C] hover:bg-[#FFF3F3]",
                )}
              >
                <Heart
                  size={18}
                  strokeWidth={2}
                  className={
                    liked ? "fill-[#D84C4C] text-[#D84C4C]" : "text-[#D84C4C]"
                  }
                />
                {liked
                  ? "Вы уже лайкнули"
                  : likePending
                    ? "Сохраняем..."
                    : "Лайкнуть"}
              </button>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-11 w-11 shrink-0 cursor-pointer items-center justify-center rounded-full border border-black/10 bg-white text-black/70 transition hover:bg-black/[0.03] hover:text-black"
            aria-label="Закрыть"
          >
            <X size={20} strokeWidth={2.2} />
          </button>
        </div>

        <div className="max-h-[70vh] overflow-y-auto px-6 py-6">
          {post.coverUrl ? (
            <div className="mb-6 overflow-hidden rounded-[22px] border border-black/10 bg-white">
              <img
                src={post.coverUrl}
                alt={post.coverAlt || post.title}
                className="h-auto w-full object-cover"
              />
            </div>
          ) : null}

          {post.excerpt ? (
            <div className="mb-6 rounded-[20px] border border-[#E7DCC2] bg-white px-5 py-4 text-[15px] leading-7 text-black/70">
              {post.excerpt}
            </div>
          ) : null}

          <div className="space-y-4 text-[16px] leading-8 text-black/78">
            {paragraphs.length > 0 ? (
              paragraphs.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))
            ) : (
              <p>Полный текст пока не добавлен.</p>
            )}
          </div>

          {post.tags.length > 0 ? (
            <div className="mt-8 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex rounded-full border border-black/10 bg-white px-3 py-1 text-xs text-black/55"
                >
                  {tag}
                </span>
              ))}
            </div>
          ) : null}

          {post.downloadUrl ? (
            <div className="mt-8">
              <a
                href={post.downloadUrl}
                download
                className="inline-flex cursor-pointer items-center justify-center rounded-full border border-[#BFD3EA] bg-[#F2F8FF] px-5 py-3 text-sm font-semibold text-[#3A648F] transition hover:bg-[#EAF3FE]"
              >
                Скачать файл
              </a>
            </div>
          ) : null}
        </div>
      </div>

      <button
        type="button"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
        aria-label="Закрыть окно"
      />
    </div>
  );
}

export default function KnowledgeSectionContent({
  posts,
  canManageNotes = false,
  dealerLogin = null,
}: Props) {
  const [openedSlug, setOpenedSlug] = useState<string | null>(null);
  const [counterOverrides, setCounterOverrides] = useState<
    Record<string, CounterOverride>
  >({});
  const [viewedSlugs, setViewedSlugs] = useState<Record<string, boolean>>({});
  const [likedSlugs, setLikedSlugs] = useState<Record<string, boolean>>({});
  const [likePendingSlug, setLikePendingSlug] = useState<string | null>(null);

  const sortedPosts = useMemo(() => posts, [posts]);

  useEffect(() => {
    setLikedSlugs(readLikedMap(dealerLogin) as Record<string, boolean>);
  }, [dealerLogin]);

  const openedPost = useMemo(
    () => sortedPosts.find((item) => item.slug === openedSlug) ?? null,
    [sortedPosts, openedSlug],
  );

  async function handleTrackView(slug: string) {
    try {
      const res = await fetch(`/api/dealer/knowledge/${slug}/view`, {
        method: "POST",
      });

      if (!res.ok) return;

      const json = (await res.json()) as { viewsCount?: number };

      if (typeof json.viewsCount === "number") {
        setCounterOverrides((prev) => ({
          ...prev,
          [slug]: {
            ...prev[slug],
            viewsCount: json.viewsCount,
          },
        }));
      }
    } catch {}
  }

  function handleOpen(post: DealerKnowledgePost) {
    setOpenedSlug(post.slug);

    if (viewedSlugs[post.slug]) return;

    setViewedSlugs((prev) => ({ ...prev, [post.slug]: true }));

    const current = getDisplayedCounts(
      post,
      counterOverrides,
      Boolean(likedSlugs[post.slug]),
    );

    setCounterOverrides((prev) => ({
      ...prev,
      [post.slug]: {
        ...prev[post.slug],
        viewsCount: current.viewsCount + 1,
      },
    }));

    window.setTimeout(() => {
      void handleTrackView(post.slug);
    }, 0);
  }

  async function handleLike(slug: string) {
    if (likePendingSlug) return;
    if (likedSlugs[slug]) return;

    const post = sortedPosts.find((item) => item.slug === slug);
    if (!post) return;

    setLikePendingSlug(slug);

    const current = getDisplayedCounts(post, counterOverrides, false);

    setCounterOverrides((prev) => ({
      ...prev,
      [slug]: {
        ...prev[slug],
        likesCount: current.likesCount + 1,
      },
    }));

    const nextLikedMap = {
      ...likedSlugs,
      [slug]: true,
    };

    setLikedSlugs(nextLikedMap);
    writeLikedMap(dealerLogin, nextLikedMap);

    try {
      const res = await fetch(`/api/dealer/knowledge/${slug}/like`, {
        method: "POST",
      });

      if (!res.ok) throw new Error("like failed");

      const json = (await res.json()) as { likesCount?: number };

      if (typeof json.likesCount === "number") {
        setCounterOverrides((prev) => ({
          ...prev,
          [slug]: {
            ...prev[slug],
            likesCount: Math.max(1, json.likesCount),
          },
        }));
      }
    } catch {
      const rollbackMap = { ...nextLikedMap };
      delete rollbackMap[slug];
      setLikedSlugs(rollbackMap);
      writeLikedMap(dealerLogin, rollbackMap);

      setCounterOverrides((prev) => ({
        ...prev,
        [slug]: {
          ...prev[slug],
          likesCount: Math.max(0, current.likesCount),
        },
      }));
    } finally {
      setLikePendingSlug(null);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-black/50">
          Всего материалов: {sortedPosts.length}
        </div>

        {canManageNotes ? (
          <button
            type="button"
            className="inline-flex cursor-pointer items-center justify-center rounded-full border border-black/10 bg-white px-5 py-2.5 text-sm font-semibold text-black/70 transition hover:bg-black/[0.03]"
          >
            Создать заметку
          </button>
        ) : null}
      </div>

      {sortedPosts.length === 0 ? (
        <div className="rounded-[18px] border border-black/10 bg-white px-4 py-4 text-sm text-black/55">
          Пока нет записей.
        </div>
      ) : (
        sortedPosts.map((post) => {
          const liked = Boolean(likedSlugs[post.slug]);
          const counts = getDisplayedCounts(post, counterOverrides, liked);

          return (
            <KnowledgeCard
              key={post.slug}
              post={post}
              viewsCount={counts.viewsCount}
              likesCount={counts.likesCount}
              liked={liked}
              onOpen={handleOpen}
            />
          );
        })
      )}

      {openedPost ? (
        <KnowledgePostModal
          post={openedPost}
          viewsCount={
            getDisplayedCounts(
              openedPost,
              counterOverrides,
              Boolean(likedSlugs[openedPost.slug]),
            ).viewsCount
          }
          likesCount={
            getDisplayedCounts(
              openedPost,
              counterOverrides,
              Boolean(likedSlugs[openedPost.slug]),
            ).likesCount
          }
          liked={Boolean(likedSlugs[openedPost.slug])}
          likePending={likePendingSlug === openedPost.slug}
          onClose={() => setOpenedSlug(null)}
          onLike={handleLike}
        />
      ) : null}
    </div>
  );
}
