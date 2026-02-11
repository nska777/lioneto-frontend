"use client";

import React, {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import Image from "next/image";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

type NewsTag = "Поступление" | "Обновление" | "Акция" | "Событие";

export type NewsItemInput = {
  id: string | number;
  title: string;
  excerpt?: string;
  subtitle?: string;
  dateLabel?: string;
  tag?: string;
  type?: string;
  slug: string;
  cover?: { url: string; alternativeText?: string | null } | null;
  image?: { url: string } | null;
};

type NewsItem = {
  id: string;
  title: string;
  excerpt: string;
  dateLabel: string;
  tag: NewsTag;
  slug: string;
  image?: { url: string } | null;
};

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

function toPageTag(raw?: string): NewsTag {
  const s = String(raw ?? "").toLowerCase();

  if (s.includes("arrival")) return "Поступление";
  if (s.includes("update")) return "Обновление";
  if (s.includes("sale")) return "Акция";
  if (s.includes("event")) return "Событие";

  return "Обновление";
}

function normalizeItems(input: NewsItemInput[]): NewsItem[] {
  return (input || [])
    .map((it) => {
      const id = String(it.id ?? "").trim();
      const title = String(it.title ?? "").trim();
      const slug = String(it.slug ?? "").trim();
      if (!id || !title || !slug) return null;

      const excerpt = String(it.excerpt ?? it.subtitle ?? "").trim();
      const dateLabel = String(it.dateLabel ?? "").trim();
      const tag = toPageTag(it.tag ?? it.type);

      const imageUrl = it.cover?.url || it.image?.url || "";

      return {
        id,
        title,
        excerpt: excerpt || "—",
        dateLabel,
        tag,
        slug,
        image: imageUrl ? { url: imageUrl } : null,
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
        "cursor-pointer rounded-full border px-4 py-2 text-[12px] tracking-[0.12em] transition",
        active
          ? "border-black/20 bg-black text-white"
          : "border-black/10 bg-white text-black/70 hover:border-black/20",
      )}
      type="button"
    >
      {children}
    </button>
  );
}

function NewsCard({
  item,
  isOpen,
  onToggle,
}: {
  item: NewsItem;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const img = item.image?.url;

  return (
    <article
      data-reveal
      className={cn(
        "group overflow-hidden rounded-3xl border bg-white transition",
        "border-black/10 hover:border-black/20",
        "cursor-pointer select-none",
      )}
      role="button"
      tabIndex={0}
      onClick={onToggle}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onToggle();
        }
      }}
      aria-expanded={isOpen}
    >
      {/* IMAGE */}
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        {img ? (
          <Image
            src={img}
            alt={item.title}
            fill
            unoptimized
            className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        ) : (
          <div className="absolute inset-0 bg-black/[0.04]" />
        )}

        {/* подложка для читабельности */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-24"
          style={{
            background:
              "linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.55) 100%)",
          }}
        />

        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="text-[12px] tracking-[0.16em] opacity-85">
            {item.tag.toUpperCase()}
            {item.dateLabel ? (
              <span className="opacity-75"> • {item.dateLabel}</span>
            ) : null}
          </div>
          <div className="mt-1 text-[18px] font-semibold leading-snug">
            {item.title}
          </div>
        </div>
      </div>

      {/* BODY */}
      <div className="p-6">
        {/* плавное раскрытие текста */}
        <div
          className="overflow-hidden"
          style={{
            maxHeight: isOpen ? 900 : 220,
            transition: "max-height 650ms cubic-bezier(0.22, 1, 0.36, 1)",
          }}
        >
          <p
            className={cn(
              "text-[14px] leading-7 text-black/70",
              !isOpen && "line-clamp-6",
            )}
          >
            {item.excerpt}
          </p>
        </div>

        {/* FOOTER: слева метка, справа кнопка (вместо Читать) */}
        <div className="mt-5 flex items-center justify-between">
          <div className="text-[12px] tracking-[0.18em] text-black/45">
            {isOpen ? "СВЕРНУТЬ" : "РАЗВЕРНУТЬ"}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation(); // ✅ важно: чтобы не срабатывало дважды
              onToggle();
            }}
            className={cn(
              "cursor-pointer text-[12px] tracking-[0.18em] transition",
              "text-black/60 hover:text-black",
            )}
          >
            {isOpen ? "Свернуть" : "Развернуть"} →
          </button>
        </div>
      </div>
    </article>
  );
}

export default function NewsPageClient({ items }: { items: NewsItemInput[] }) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  const [tag, setTag] = useState<(typeof TAGS)[number]>("Все");
  const [q, setQ] = useState("");

  // ✅ открыта только одна карточка
  const [openId, setOpenId] = useState<string | null>(null);

  const normalized = useMemo(() => normalizeItems(items), [items]);

  const filtered = useMemo(() => {
    const qq = q.toLowerCase();
    return normalized.filter((it) => {
      const okTag = tag === "Все" || it.tag === tag;
      const okQ =
        !qq ||
        it.title.toLowerCase().includes(qq) ||
        it.excerpt.toLowerCase().includes(qq);
      return okTag && okQ;
    });
  }, [normalized, tag, q]);

  // ✅ если фильтр/поиск изменился — закрываем (чтобы не оставалось открытым несуществующее)
  useEffect(() => {
    setOpenId(null);
  }, [tag, q]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 18 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              once: true,
            },
          },
        );
      });
    }, rootRef);

    return () => ctx.revert();
  }, [filtered.length]);

  return (
    <div ref={rootRef}>
      <div className="mb-6 flex flex-wrap gap-2">
        {TAGS.map((t) => (
          <TagPill key={t} active={t === tag} onClick={() => setTag(t)}>
            {t === "Все" ? "ВСЕ" : t.toUpperCase()}
          </TagPill>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {filtered.map((it) => (
          <NewsCard
            key={it.id}
            item={it}
            isOpen={openId === it.id}
            onToggle={() => {
              // ✅ toggle: если жмём на открытую — закрываем
              setOpenId((prev) => (prev === it.id ? null : it.id));
            }}
          />
        ))}
      </div>
    </div>
  );
}
