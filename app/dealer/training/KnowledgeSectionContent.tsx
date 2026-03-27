"use client";

import { memo, useEffect, useMemo, useState } from "react";
import { Eye, Heart, PencilLine, Trash2, X } from "lucide-react";
import type { KnowledgeFeedItem } from "@/app/lib/dealer/notes";

type Props = {
  posts: KnowledgeFeedItem[];
  canManageNotes?: boolean;
  dealerLogin?: string | null;
  dealerRole?: "dealer" | "admin" | "owner" | "" | null;
};

type CounterOverride = {
  viewsCount?: number;
  likesCount?: number;
};

type SaveNoteResponse = {
  ok?: boolean;
  error?: string;
  post?: KnowledgeFeedItem;
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

function getKindUi(kind: KnowledgeFeedItem["kind"]) {
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
  post: KnowledgeFeedItem,
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

function canEditNote(
  post: KnowledgeFeedItem,
  dealerLogin?: string | null,
  dealerRole?: string | null,
) {
  if (post.sourceType !== "dealer_note") return false;
  if (!dealerLogin) return false;
  if (dealerRole === "admin" || dealerRole === "owner") return true;
  return post.authorLogin === dealerLogin;
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
  post: KnowledgeFeedItem;
  viewsCount: number;
  likesCount: number;
  liked: boolean;
  onOpen: (post: KnowledgeFeedItem) => void;
}) {
  const kindUi = getKindUi(post.kind);
  const isNote = post.kind === "note";

  return (
    <article
      className={cn(
        "rounded-[24px] border shadow-[0_14px_30px_rgba(50,40,18,0.04)]",
        isNote
          ? "border-[#8A63D2] bg-[linear-gradient(180deg,#F3ECFF_0%,#E7D8FF_100%)] px-5 py-4"
          : "border-[#E7DCC2] bg-[linear-gradient(180deg,#fffdf9_0%,#ffffff_100%)] px-5 py-5",
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        <div
          className={cn(
            "inline-flex items-center rounded-full border px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em]",
            isNote
              ? "border-[#B79AF0] bg-[#F7F1FF] text-[#6B46B2]"
              : kindUi.className,
          )}
        >
          {kindUi.label}
        </div>

        <div
          className={cn(
            "inline-flex items-center rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-white",
            isNote ? "bg-[#7C57C2]" : "bg-[#E89C4B]",
          )}
        >
          БАЗА ЗНАНИЙ
        </div>

        <div className="text-xs text-black/35">
          {formatDate(post.publishedAt || post.createdAt)}
        </div>
      </div>

      <h3
        className={cn(
          "mt-3 font-semibold tracking-[-0.03em] text-black",
          isNote ? "text-[20px] leading-[1.2]" : "text-[28px]",
        )}
      >
        {post.title}
      </h3>

      {post.excerpt ? (
        <p
          className={cn(
            "text-black/62",
            isNote
              ? "mt-2 line-clamp-2 text-[14px] leading-6"
              : "mt-3 max-w-[920px] text-[15px] leading-7",
          )}
        >
          {post.excerpt}
        </p>
      ) : null}

      {post.tags.length > 0 ? (
        <div className={cn("flex flex-wrap gap-2", isNote ? "mt-3" : "mt-4")}>
          {post.tags.map((tag) => (
            <span
              key={tag}
              className={cn(
                "inline-flex rounded-full border px-3 py-1 text-xs",
                isNote
                  ? "border-[#CDB8F5] bg-[#F8F3FF] text-[#6D56A5]"
                  : "border-black/10 bg-white text-black/45",
              )}
            >
              {tag}
            </span>
          ))}
        </div>
      ) : null}

      <div
        className={cn(
          "flex flex-wrap items-center gap-4",
          isNote ? "mt-4" : "mt-5",
        )}
      >
        <Stats
          viewsCount={viewsCount}
          likesCount={likesCount}
          liked={liked}
          large={!isNote}
        />

        <button
          type="button"
          onClick={() => onOpen(post)}
          className={cn(
            "inline-flex cursor-pointer items-center justify-center rounded-full border text-sm font-semibold transition",
            isNote
              ? "border-[#CBB7F1] bg-white/80 px-4 py-2 text-[#5D4695] hover:bg-white"
              : "border-black/10 bg-white px-5 py-3 text-black/65 hover:bg-black/[0.03] hover:text-black",
          )}
        >
          Читать далее
        </button>

        {post.downloadUrl ? (
          <a
            href={post.downloadUrl}
            download
            className={cn(
              "inline-flex cursor-pointer items-center justify-center rounded-full border text-sm font-semibold transition",
              isNote
                ? "border-[#BBA2EC] bg-[#EEE4FF] px-4 py-2 text-[#5F43A8] hover:bg-[#E7D9FF]"
                : "border-[#BFD3EA] bg-[#F2F8FF] px-5 py-3 text-[#3A648F] hover:bg-[#EAF3FE]",
            )}
          >
            Скачать файл
          </a>
        ) : null}
      </div>
    </article>
  );
});

function NoteEditorModal({
  open,
  mode,
  saving,
  error,
  title,
  excerpt,
  content,
  onClose,
  onTitleChange,
  onExcerptChange,
  onContentChange,
  onSubmit,
}: {
  open: boolean;
  mode: "create" | "edit";
  saving: boolean;
  error: string | null;
  title: string;
  excerpt: string;
  content: string;
  onClose: () => void;
  onTitleChange: (value: string) => void;
  onExcerptChange: (value: string) => void;
  onContentChange: (value: string) => void;
  onSubmit: () => void;
}) {
  useEffect(() => {
    if (!open) return;

    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  const titleText =
    mode === "edit" ? "Редактировать заметку" : "Создать заметку";
  const submitText =
    mode === "edit"
      ? saving
        ? "Сохраняем..."
        : "Сохранить изменения"
      : saving
        ? "Публикуем..."
        : "Опубликовать заметку";

  return (
    <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/45 px-4 py-6 backdrop-blur-[2px]">
      <div className="relative z-[1] w-full max-w-3xl overflow-hidden rounded-[28px] border border-[#E7DCC2] bg-white shadow-[0_30px_80px_rgba(0,0,0,0.18)]">
        <div className="flex items-start justify-between gap-4 border-b border-black/10 px-6 py-5">
          <div>
            <div className="inline-flex items-center rounded-full border border-[#E5D4AA] bg-[#FFF7E3] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.14em] text-[#8A6732]">
              ЗАМЕТКА
            </div>

            <h2 className="mt-3 text-[28px] font-semibold tracking-[-0.03em] text-black">
              {titleText}
            </h2>

            <p className="mt-2 text-sm text-black/50">
              Заметка сохраняется в Strapi и показывается в разделе базы знаний.
            </p>
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

        <div className="space-y-5 px-6 py-6">
          <div className="space-y-2">
            <label className="text-sm font-semibold text-black">
              Заголовок
            </label>
            <input
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Введите заголовок заметки"
              className="w-full rounded-[16px] border border-[#E4D7B8] bg-white px-4 py-3 text-sm text-black outline-none placeholder:text-black/35 focus:border-[#D9C38C]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-black">
              Краткое описание
            </label>
            <input
              value={excerpt}
              onChange={(e) => onExcerptChange(e.target.value)}
              placeholder="Короткий текст для карточки"
              className="w-full rounded-[16px] border border-[#E4D7B8] bg-white px-4 py-3 text-sm text-black outline-none placeholder:text-black/35 focus:border-[#D9C38C]"
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-semibold text-black">
              Текст заметки
            </label>
            <textarea
              value={content}
              onChange={(e) => onContentChange(e.target.value)}
              placeholder="Введите текст заметки"
              rows={10}
              className="w-full rounded-[20px] border border-[#E4D7B8] bg-white px-4 py-4 text-sm leading-7 text-black outline-none placeholder:text-black/35 focus:border-[#D9C38C]"
            />
          </div>

          {error ? (
            <div className="rounded-[16px] border border-[#F0D6D6] bg-[#FFF4F4] px-4 py-3 text-sm text-[#B24343]">
              {error}
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={onSubmit}
              disabled={saving}
              className={cn(
                "inline-flex items-center justify-center rounded-full px-5 py-3 text-sm font-semibold transition",
                saving
                  ? "cursor-not-allowed border border-[#E3C98D] bg-[#F7E7BF] text-[#8A6732] opacity-80"
                  : "cursor-pointer border border-[#E3C98D] bg-[#F1D07A] text-[#5F4317] hover:bg-[#EBC764]",
              )}
            >
              {submitText}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="inline-flex cursor-pointer items-center justify-center rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-semibold text-black/70 transition hover:bg-black/[0.03]"
            >
              Отмена
            </button>
          </div>
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

function KnowledgePostModal({
  post,
  viewsCount,
  likesCount,
  liked,
  likePending,
  canEditThisNote,
  deleting,
  onClose,
  onLike,
  onEdit,
  onDelete,
}: {
  post: KnowledgeFeedItem;
  viewsCount: number;
  likesCount: number;
  liked: boolean;
  likePending: boolean;
  canEditThisNote: boolean;
  deleting: boolean;
  onClose: () => void;
  onLike: (post: KnowledgeFeedItem) => void;
  onEdit: (post: KnowledgeFeedItem) => void;
  onDelete: (post: KnowledgeFeedItem) => void;
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
                onClick={() => onLike(post)}
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

              {post.downloadUrl ? (
                <a
                  href={post.downloadUrl}
                  download
                  className="inline-flex cursor-pointer items-center justify-center rounded-full border border-[#BFD3EA] bg-[#F2F8FF] px-5 py-2.5 text-sm font-semibold text-[#3A648F] transition hover:bg-[#EAF3FE]"
                >
                  Скачать файл
                </a>
              ) : null}

              {canEditThisNote ? (
                <>
                  <button
                    type="button"
                    onClick={() => onEdit(post)}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-[#E3C98D] bg-[#FFF7E3] px-4 py-2.5 text-sm font-semibold text-[#7B5A22] transition hover:bg-[#FCECC3]"
                  >
                    <PencilLine size={16} strokeWidth={2} />
                    Редактировать
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(post)}
                    disabled={deleting}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-full border px-4 py-2.5 text-sm font-semibold transition",
                      deleting
                        ? "cursor-not-allowed border-[#F0D6D6] bg-[#FFF4F4] text-[#B24343] opacity-80"
                        : "cursor-pointer border-[#F0D6D6] bg-white text-[#B24343] hover:bg-[#FFF4F4]",
                    )}
                  >
                    <Trash2 size={16} strokeWidth={2} />
                    {deleting ? "Удаляем..." : "Удалить"}
                  </button>
                </>
              ) : null}
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
  dealerRole = null,
}: Props) {
  const [localPosts, setLocalPosts] = useState<KnowledgeFeedItem[]>(posts);
  const [openedSlug, setOpenedSlug] = useState<string | null>(null);
  const [counterOverrides, setCounterOverrides] = useState<
    Record<string, CounterOverride>
  >({});
  const [viewedSlugs, setViewedSlugs] = useState<Record<string, boolean>>({});
  const [likedSlugs, setLikedSlugs] = useState<Record<string, boolean>>({});
  const [likePendingSlug, setLikePendingSlug] = useState<string | null>(null);

  const [editorMode, setEditorMode] = useState<"create" | "edit">("create");
  const [editingDocumentId, setEditingDocumentId] = useState<string | null>(
    null,
  );
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [createTitle, setCreateTitle] = useState("");
  const [createExcerpt, setCreateExcerpt] = useState("");
  const [createContent, setCreateContent] = useState("");
  const [createPending, setCreatePending] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [deletePendingDocumentId, setDeletePendingDocumentId] = useState<
    string | null
  >(null);

  useEffect(() => {
    setLocalPosts(posts);
  }, [posts]);

  const sortedPosts = useMemo(() => localPosts, [localPosts]);

  useEffect(() => {
    setLikedSlugs(readLikedMap(dealerLogin) as Record<string, boolean>);
  }, [dealerLogin]);

  const openedPost = useMemo(
    () => sortedPosts.find((item) => item.slug === openedSlug) ?? null,
    [sortedPosts, openedSlug],
  );

  async function handleTrackView(post: KnowledgeFeedItem) {
    const basePath =
      post.sourceType === "dealer_note"
        ? `/api/dealer/notes/by-slug/${post.slug}/view`
        : `/api/dealer/knowledge/${post.slug}/view`;

    try {
      const res = await fetch(basePath, {
        method: "POST",
      });

      if (!res.ok) return;

      const json = (await res.json()) as { viewsCount?: number };

      if (typeof json.viewsCount === "number") {
        setCounterOverrides((prev) => ({
          ...prev,
          [post.slug]: {
            ...prev[post.slug],
            viewsCount: json.viewsCount,
          },
        }));
      }
    } catch {}
  }

  function handleOpen(post: KnowledgeFeedItem) {
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
      void handleTrackView(post);
    }, 0);
  }

  async function handleLike(post: KnowledgeFeedItem) {
    if (likePendingSlug) return;
    if (likedSlugs[post.slug]) return;

    setLikePendingSlug(post.slug);

    const current = getDisplayedCounts(post, counterOverrides, false);

    setCounterOverrides((prev) => ({
      ...prev,
      [post.slug]: {
        ...prev[post.slug],
        likesCount: current.likesCount + 1,
      },
    }));

    const nextLikedMap = {
      ...likedSlugs,
      [post.slug]: true,
    };

    setLikedSlugs(nextLikedMap);
    writeLikedMap(dealerLogin, nextLikedMap);

    const basePath =
      post.sourceType === "dealer_note"
        ? `/api/dealer/notes/by-slug/${post.slug}/like`
        : `/api/dealer/knowledge/${post.slug}/like`;

    try {
      const res = await fetch(basePath, {
        method: "POST",
      });

      if (!res.ok) throw new Error("like failed");

      const json = (await res.json()) as { likesCount?: number };

      if (typeof json.likesCount === "number") {
        const safeLikesCount = json.likesCount;

        setCounterOverrides((prev) => ({
          ...prev,
          [post.slug]: {
            ...prev[post.slug],
            likesCount: Math.max(1, safeLikesCount),
          },
        }));
      }
    } catch {
      const rollbackMap = { ...nextLikedMap };
      delete rollbackMap[post.slug];
      setLikedSlugs(rollbackMap);
      writeLikedMap(dealerLogin, rollbackMap);

      setCounterOverrides((prev) => ({
        ...prev,
        [post.slug]: {
          ...prev[post.slug],
          likesCount: Math.max(0, current.likesCount),
        },
      }));
    } finally {
      setLikePendingSlug(null);
    }
  }

  function resetEditorForm() {
    setCreateTitle("");
    setCreateExcerpt("");
    setCreateContent("");
    setCreateError(null);
    setEditingDocumentId(null);
    setEditorMode("create");
  }

  function closeEditorModal() {
    if (createPending) return;
    setIsEditorOpen(false);
    resetEditorForm();
  }

  function openCreateModal() {
    setEditorMode("create");
    setEditingDocumentId(null);
    setCreateTitle("");
    setCreateExcerpt("");
    setCreateContent("");
    setCreateError(null);
    setIsEditorOpen(true);
  }

  function openEditModal(post: KnowledgeFeedItem) {
    setEditorMode("edit");
    setEditingDocumentId(post.documentId || null);
    setCreateTitle(post.title);
    setCreateExcerpt(post.excerpt ?? "");
    setCreateContent(post.content ?? "");
    setCreateError(null);
    setIsEditorOpen(true);
  }

  async function handleSaveNote() {
    const title = createTitle.trim();
    const excerpt = createExcerpt.trim();
    const content = createContent.trim();

    if (!title) {
      setCreateError("Укажите заголовок заметки");
      return;
    }

    if (!content) {
      setCreateError("Добавьте текст заметки");
      return;
    }

    setCreatePending(true);
    setCreateError(null);

    try {
      const isEdit = editorMode === "edit" && editingDocumentId;
      const url = isEdit
        ? `/api/dealer/notes/by-document/${editingDocumentId}/update`
        : "/api/dealer/notes/create";

      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          excerpt,
          content,
        }),
      });

      const json = (await res
        .json()
        .catch(() => null)) as SaveNoteResponse | null;

      if (!res.ok || !json?.ok || !json.post) {
        throw new Error(json?.error || "Не удалось сохранить заметку");
      }

      if (isEdit) {
        setLocalPosts((prev) =>
          prev.map((item) =>
            item.documentId === json.post?.documentId ? json.post : item,
          ),
        );

        if (openedSlug) {
          setOpenedSlug(json.post.slug);
        }
      } else {
        setLocalPosts((prev) => [json.post as KnowledgeFeedItem, ...prev]);
      }

      setIsEditorOpen(false);
      resetEditorForm();
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Не удалось сохранить заметку";
      setCreateError(message);
    } finally {
      setCreatePending(false);
    }
  }

  async function handleDelete(post: KnowledgeFeedItem) {
    if (post.sourceType !== "dealer_note" || !post.documentId) return;

    const confirmed = window.confirm(
      `Удалить заметку «${post.title}»? Это удалит запись и из Strapi.`,
    );

    if (!confirmed) return;

    setDeletePendingDocumentId(post.documentId);

    try {
      const res = await fetch(
        `/api/dealer/notes/by-document/${post.documentId}/delete`,
        {
          method: "DELETE",
        },
      );

      const json = (await res.json().catch(() => null)) as {
        ok?: boolean;
        error?: string;
      } | null;

      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "Не удалось удалить заметку");
      }

      setLocalPosts((prev) =>
        prev.filter((item) => item.documentId !== post.documentId),
      );

      if (openedSlug === post.slug) {
        setOpenedSlug(null);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Не удалось удалить заметку";
      window.alert(message);
    } finally {
      setDeletePendingDocumentId(null);
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
            onClick={openCreateModal}
            className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full border border-[#E3C98D] bg-[#FFF5DD] px-5 py-2.5 text-sm font-semibold text-[#7B5A22] transition hover:bg-[#FCECC3]"
          >
            <PencilLine size={16} strokeWidth={2.1} />
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
              key={`${post.sourceType}:${post.slug}`}
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
          canEditThisNote={canEditNote(openedPost, dealerLogin, dealerRole)}
          deleting={deletePendingDocumentId === openedPost.documentId}
          onClose={() => setOpenedSlug(null)}
          onLike={handleLike}
          onEdit={openEditModal}
          onDelete={handleDelete}
        />
      ) : null}

      <NoteEditorModal
        open={isEditorOpen}
        mode={editorMode}
        saving={createPending}
        error={createError}
        title={createTitle}
        excerpt={createExcerpt}
        content={createContent}
        onClose={closeEditorModal}
        onTitleChange={setCreateTitle}
        onExcerptChange={setCreateExcerpt}
        onContentChange={setCreateContent}
        onSubmit={handleSaveNote}
      />
    </div>
  );
}
