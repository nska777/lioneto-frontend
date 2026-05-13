// app/catalog/ui/CatalogCard.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import React, { useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import ProductActions from "../ProductActions";
import { useRegionLang } from "@/app/context/region-lang";

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

type Currency = "RUB" | "UZS";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function isString(v: unknown): v is string {
  return typeof v === "string";
}

function getVal(obj: unknown, key: string): unknown {
  if (!isRecord(obj)) return undefined;
  return obj[key];
}

function getStr(obj: unknown, key: string): string {
  const v = getVal(obj, key);
  return isString(v) ? v : "";
}

function getFirstStringFromArray(v: unknown): string {
  if (!Array.isArray(v)) return "";
  const found = v.find((x) => typeof x === "string" && x.trim().length > 0);
  return typeof found === "string" ? found : "";
}

function getPath(obj: unknown, path: string[]): unknown {
  let cur: unknown = obj;

  for (const k of path) {
    if (!isRecord(cur)) return undefined;
    cur = cur[k];
  }

  return cur;
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function DiscountBadge({ percent }: { percent: number }) {
  return (
    <span className="inline-flex h-7 items-center rounded-[6px] bg-[#ffd1d1] px-2.5 text-[15px] font-semibold leading-none text-[#ff3f3f] shadow-[0_6px_14px_rgba(255,63,63,0.10)]">
      -{percent}%
    </span>
  );
}

function FeatureBadge({ text }: { text: string }) {
  return (
    <span className="inline-flex h-7 items-center rounded-[6px] border border-[#bddde6] bg-[#e8f6f9] px-2.5 text-[13px] font-semibold leading-none text-[#4f8795] shadow-[0_6px_14px_rgba(79,135,149,0.08)]">
      {text}
    </span>
  );
}

function RatingStars({
  value,
  count,
  className,
}: {
  value: number;
  count?: number;
  className?: string;
}) {
  const v = clamp(Number.isFinite(value) ? value : 0, 0, 5);
  const full = Math.floor(v);
  const frac = v - full;

  const fillForIndex = (i: number) => {
    const idx = i + 1;
    if (idx <= full) return 1;
    if (idx === full + 1) return clamp(frac, 0, 1);
    return 0;
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <div
        className="flex items-center gap-[2px]"
        aria-label={`Рейтинг ${v.toFixed(1)} из 5`}
      >
        {Array.from({ length: 5 }).map((_, i) => {
          const fill = fillForIndex(i);

          return (
            <span
              key={i}
              className="relative inline-flex"
              style={{ width: 14, height: 14 }}
            >
              <svg
                viewBox="0 0 24 24"
                width={14}
                height={14}
                className="absolute inset-0"
                aria-hidden="true"
              >
                <path
                  d="M12 17.3l-6.18 3.55 1.64-7.03L2 9.24l7.19-.62L12 2l2.81 6.62 7.19.62-5.46 4.58 1.64 7.03L12 17.3z"
                  className="fill-black/10"
                />
              </svg>

              {fill > 0 ? (
                <span
                  className="absolute inset-0 overflow-hidden"
                  style={{ width: `${Math.round(fill * 100)}%` }}
                >
                  <svg
                    viewBox="0 0 24 24"
                    width={14}
                    height={14}
                    aria-hidden="true"
                  >
                    <path
                      d="M12 17.3l-6.18 3.55 1.64-7.03L2 9.24l7.19-.62L12 2l2.81 6.62 7.19.62-5.46 4.58 1.64 7.03L12 17.3z"
                      className="fill-[#C8A04A]"
                    />
                  </svg>
                </span>
              ) : null}
            </span>
          );
        })}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[12px] leading-none text-black/70">
          {v.toFixed(1)}
        </span>

        {typeof count === "number" ? (
          <span className="text-[12px] leading-none text-black/40">
            ({count})
          </span>
        ) : null}
      </div>
    </div>
  );
}

function num(v: unknown): number {
  const x = typeof v === "number" ? v : Number(v);
  return Number.isFinite(x) ? x : 0;
}

function buildOldPriceFallback({
  current,
  old,
  otherCurrent,
  otherOld,
}: {
  current: number;
  old: number;
  otherCurrent: number;
  otherOld: number;
}) {
  if (old > current && current > 0) return old;

  if (current > 0 && otherCurrent > 0 && otherOld > otherCurrent) {
    const discountMultiplier = otherOld / otherCurrent;
    return Math.round(current * discountMultiplier);
  }

  return 0;
}

export default function CatalogCard({
  p,
  idx,
  fmtPrice,
}: {
  p: Record<string, unknown>;
  idx: number;
  fmtPrice: (rub: number, uzs: number) => string;
}) {
  const rl = useRegionLang();

  const rlCurrency = isRecord(rl) ? getVal(rl, "currency") : undefined;
  const rlRegion = isRecord(rl) ? getVal(rl, "region") : undefined;

  const currency: Currency =
    (rlCurrency === "RUB" || rlCurrency === "UZS" ? rlCurrency : undefined) ??
    (rlRegion === "ru" ? "RUB" : "UZS");

  const pathname = usePathname();
  const sp = useSearchParams();

  const catalogPath = useMemo(() => {
    const qs = sp?.toString();
    return `${pathname}${qs ? `?${qs}` : ""}`;
  }, [pathname, sp]);

  void catalogPath;

  const routeKey = String(
    getStr(p, "productId") || getStr(p, "slug") || getStr(p, "id"),
  ).trim();

  const href = routeKey
    ? `/product/${encodeURIComponent(routeKey)}`
    : "/catalog";

  const title = String(getStr(p, "title")).trim() || "Товар";

  const curRub = num(getVal(p, "priceRUB") ?? getVal(p, "price_rub") ?? 0);
  const curUzs = num(getVal(p, "priceUZS") ?? getVal(p, "price_uzs") ?? 0);

  const oldRubRaw = num(
    getVal(p, "oldPriceRUB") ?? getVal(p, "old_price_rub") ?? 0,
  );

  const oldUzsRaw = num(
    getVal(p, "oldPriceUZS") ?? getVal(p, "old_price_uzs") ?? 0,
  );

  const oldRub = buildOldPriceFallback({
    current: curRub,
    old: oldRubRaw,
    otherCurrent: curUzs,
    otherOld: oldUzsRaw,
  });

  const oldUzs = buildOldPriceFallback({
    current: curUzs,
    old: oldUzsRaw,
    otherCurrent: curRub,
    otherOld: oldRubRaw,
  });

  const cur = currency === "RUB" ? curRub : curUzs;
  const old = currency === "RUB" ? oldRub : oldUzs;

  const hasAnyPrice = cur > 0;
  const hasDiscount = old > 0 && cur > 0 && old > cur;

  const computedPct = hasDiscount
    ? Math.max(1, Math.min(99, Math.round((1 - cur / old) * 100)))
    : 0;

  const badgeMain = String(getVal(p, "badge") ?? "").trim();
  const collectionBadge = String(getVal(p, "collectionBadge") ?? "").trim();
  const featureBadge = (collectionBadge || badgeMain || "").trim();

  const ratingValueRaw =
    getVal(p, "rating") ??
    getVal(p, "ratingValue") ??
    getVal(p, "stars") ??
    getVal(p, "avgRating") ??
    4.8;

  const ratingValue = clamp(num(ratingValueRaw), 0, 5);

  const reviewsCountRaw =
    getVal(p, "reviewsCount") ??
    getVal(p, "reviews") ??
    getVal(p, "ratingCount") ??
    getVal(p, "reviews_count") ??
    24;

  const reviewsCount = Math.max(0, Math.round(num(reviewsCountRaw)));
  const showRating = true;

  const snapshot = {
    title,
    href,
    imageUrl: getStr(p, "image"),
    sku: (getStr(p, "sku") || "").trim() ? getStr(p, "sku") : null,
    price_uzs: curUzs,
    price_rub: curRub,
  };

  const STRAPI = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

  const strapiImgCandidate =
    getPath(p, ["cardImage", "formats", "small", "url"]) ??
    getPath(p, ["cardImage", "formats", "medium", "url"]) ??
    getPath(p, ["cardImage", "formats", "thumbnail", "url"]) ??
    getPath(p, ["cardImage", "url"]) ??
    (typeof getVal(p, "cardImage") === "string"
      ? getVal(p, "cardImage")
      : undefined);

  const strapiImg = isString(strapiImgCandidate) ? strapiImgCandidate : "";

  const strapiSrc = strapiImg
    ? strapiImg.startsWith("http")
      ? strapiImg
      : `${STRAPI}${strapiImg}`
    : "";

  const firstGallery =
    getFirstStringFromArray(getVal(p, "gallery")) ||
    getFirstStringFromArray(getVal(p, "images")) ||
    getFirstStringFromArray(getVal(p, "photos")) ||
    "";

  let imgSrcFallback =
    String(firstGallery ?? "").trim() ||
    String(getStr(p, "image") || getStr(p, "cover") || "").trim() ||
    "/placeholder.png";

  const source = getStr(p, "__source");

  if (imgSrcFallback.startsWith("/") && (source === "strapi" || !!strapiSrc)) {
    const looksLikeStrapi =
      imgSrcFallback.startsWith("/uploads/") ||
      imgSrcFallback.startsWith("/sections/");

    if (looksLikeStrapi) imgSrcFallback = `${STRAPI}${imgSrcFallback}`;
  }

  const src = (strapiSrc || imgSrcFallback || "/placeholder.png").trim();
  const isRemote = /^https?:\/\//i.test(src);
  const eager = idx < 8;

  const titleClampStyle: React.CSSProperties & {
    WebkitBoxOrient: "vertical";
    WebkitLineClamp: number;
  } = {
    display: "-webkit-box",
    WebkitBoxOrient: "vertical",
    WebkitLineClamp: 2,
    maxHeight: 40,
  };

  return (
    <article
      data-card
      className={cn(
        "group h-full overflow-hidden rounded-2xl",
        "border border-black/10 bg-white",
        "shadow-[0_10px_30px_rgba(0,0,0,0.06)]",
      )}
    >
      <Link href={href} className="flex h-full flex-col">
        <div className="relative aspect-[13/11] overflow-hidden bg-white">
          <Image
            key={src}
            src={src}
            alt={title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className={cn(
              "object-cover object-center",
              "transition-transform duration-500",
              "group-hover:scale-[1.02]",
            )}
            priority={eager}
            quality={75}
            placeholder="empty"
            unoptimized={isRemote}
          />

          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />

          <div className="absolute right-3 top-3 z-10 flex translate-y-[-4px] flex-col gap-2 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <div
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <ProductActions
                id={routeKey}
                snapshot={snapshot}
                onOpenSpecs={() => {
                  window.location.href = href;
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col px-4 pb-3 pt-3">
          {hasDiscount || featureBadge ? (
            <div className="mb-3.5 flex min-h-7 flex-wrap items-center gap-2.5">
              {hasDiscount ? <DiscountBadge percent={computedPct} /> : null}

              {featureBadge ? <FeatureBadge text={featureBadge} /> : null}
            </div>
          ) : null}

          <div
            className="overflow-hidden text-[14px] font-medium leading-[20px] text-black/90"
            style={titleClampStyle}
          >
            {title}
          </div>

          {showRating ? (
            <RatingStars
              value={ratingValue}
              count={reviewsCount}
              className="mt-2"
            />
          ) : null}

          <div className="mt-2 flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
            {hasAnyPrice ? (
              <>
                <div className="text-[16px] font-bold tracking-[-0.01em] text-black">
                  {fmtPrice(curRub, curUzs)}
                </div>

                {hasDiscount ? (
                  <div className="text-[15px] font-semibold text-black/55 line-through decoration-black/45 decoration-[1.5px] sm:text-[16px]">
                    {fmtPrice(oldRub, oldUzs)}
                  </div>
                ) : null}
              </>
            ) : (
              <div className="text-[13px] font-medium text-black/55">
                Цена по запросу
              </div>
            )}
          </div>

          <div className="mt-auto pt-3">
            <span
              className={cn(
                "relative h-10 w-full overflow-hidden rounded-xl",
                "inline-flex items-center justify-center",
                "text-[12px] font-semibold tracking-[0.14em] uppercase",
                "transition cursor-pointer",
                "active:scale-[0.99]",
                "border border-black/10 bg-white",
                "hover:border-black/20 hover:text-black",
                "shadow-[0_10px_26px_rgba(0,0,0,0.06)]",
              )}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                window.location.href = href;
              }}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  window.location.href = href;
                }
              }}
              aria-label="Открыть товар"
            >
              Открыть товар
            </span>
          </div>
        </div>
      </Link>
    </article>
  );
}
