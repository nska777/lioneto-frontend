"use client";

import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

type Props = {
  slug: string;
  initialLikesCount: number;
  className?: string;
};

function getStorageKey(slug: string): string {
  return `dealer-news-liked:${slug}`;
}

export default function NewsLikeButton({
  slug,
  initialLikesCount,
  className,
}: Props) {
  const router = useRouter();
  const storageKey = useMemo(() => getStorageKey(slug), [slug]);

  const [liked, setLiked] = useState(false);
  const [likesCount, setLikesCount] = useState(initialLikesCount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(storageKey);
      if (saved === "1") {
        setLiked(true);
      }
    } catch {}
  }, [storageKey]);

  useEffect(() => {
    setLikesCount(initialLikesCount);
  }, [initialLikesCount]);

  async function handleLike() {
    if (liked || loading) return;

    const prevLiked = liked;
    const prevCount = likesCount;

    setLiked(true);
    setLikesCount((prev) => prev + 1);
    setLoading(true);

    try {
      const res = await fetch("/api/dealer/news/like", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ slug }),
      });

      const json = (await res.json()) as {
        ok?: boolean;
        likesCount?: number;
        error?: string;
      };

      if (!res.ok || !json.ok) {
        setLiked(prevLiked);
        setLikesCount(prevCount);
        return;
      }

      if (typeof json.likesCount === "number") {
        setLikesCount(json.likesCount);
      }

      try {
        window.localStorage.setItem(storageKey, "1");
      } catch {}

      router.refresh();
    } catch {
      setLiked(prevLiked);
      setLikesCount(prevCount);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={handleLike}
      disabled={liked || loading}
      aria-pressed={liked}
      aria-label={liked ? "Лайк уже поставлен" : "Поставить лайк"}
      className={cn(
        "group inline-flex h-9 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-[13px] font-medium transition-all duration-200 disabled:cursor-default",
        liked
          ? "border-red-200 bg-red-50 text-red-600"
          : "border-black/10 bg-white text-black hover:border-red-200 hover:bg-red-50/70 hover:text-red-600",
        loading && "opacity-80",
        className,
      )}
    >
      <Heart
        className={cn(
          "h-[15px] w-[15px] transition-all duration-200",
          liked ? "fill-red-500 text-red-500" : "text-current",
        )}
      />
      <span>{liked ? "Понравилось" : "Нравится"}</span>
      <span
        className={cn(
          "min-w-[10px] text-left",
          liked ? "text-red-600" : "text-black/55 group-hover:text-red-600",
        )}
      >
        {likesCount}
      </span>
    </button>
  );
}
