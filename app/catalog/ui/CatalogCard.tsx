"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import ProductActions from "../ProductActions";
import { useRegionLang } from "@/app/context/region-lang";

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

function GreenPremiumBadge({ text }: { text: string }) {
  return (
    <span className="relative inline-flex h-7 items-center overflow-hidden rounded-[12px] px-3">
      <span
        className="absolute inset-0 rounded-[12px]"
        style={{
          background:
            "radial-gradient(120% 140% at 30% 20%, #E8FFF2 0%, #BFF7D6 28%, #57E39A 55%, #17B868 78%, #0C7F45 100%)",
        }}
      />
      <span
        className="absolute inset-[1px] rounded-[11px]"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.62), rgba(255,255,255,0.10))",
        }}
      />
      <span
        className="absolute inset-0 rounded-[12px]"
        style={{
          boxShadow:
            "0 0 0 1px rgba(120,255,190,0.85), 0 10px 28px rgba(12,127,69,0.22)",
        }}
      />
      <span
        className="pointer-events-none absolute -left-[60%] top-0 h-full w-[60%] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.70) 50%, transparent 100%)",
          transform: "skewX(-20deg)",
        }}
      />
      <span className="relative z-10 text-[12px] font-semibold tracking-[0.04em] text-[#064B2A]">
        {text}
      </span>
    </span>
  );
}

function GoldDiscountBadge({ text }: { text: string }) {
  return (
    <span className="relative inline-flex h-7 items-center overflow-hidden rounded-[12px] px-3">
      <span
        className="absolute inset-0 rounded-[12px]"
        style={{
          background:
            "radial-gradient(120% 140% at 30% 20%, rgba(255,248,214,0.98) 0%, rgba(255,219,128,0.92) 35%, rgba(230,169,60,0.88) 70%, rgba(201,138,26,0.85) 100%)",
        }}
      />
      <span
        className="absolute inset-[1px] rounded-[11px]"
        style={{
          background:
            "linear-gradient(180deg, rgba(255,255,255,0.62), rgba(255,255,255,0.10))",
        }}
      />
      <span
        className="absolute inset-0 rounded-[12px]"
        style={{
          boxShadow:
            "0 0 0 1px rgba(215,181,107,0.80), 0 12px 30px rgba(201,138,26,0.22)",
        }}
      />
      <span
        className="pointer-events-none absolute -left-[60%] top-0 h-full w-[60%] opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background:
            "linear-gradient(120deg, transparent 0%, rgba(255,255,255,0.75) 50%, transparent 100%)",
          transform: "skewX(-20deg)",
        }}
      />
      <span className="relative z-10 text-[12px] font-semibold tracking-[0.04em] text-[#5A3A00]">
        {text}
      </span>
    </span>
  );
}

function n(v: any) {
  const x = Number(v);
  return Number.isFinite(x) ? x : 0;
}

export default function CatalogCard({
  p,
  idx,
  fmtPrice,
}: {
  p: Record<string, any>;
  idx: number;
  fmtPrice: (rub: number, uzs: number) => string;
}) {
  const rl = useRegionLang() as any;
  const currency: "RUB" | "UZS" =
    (rl?.currency as "RUB" | "UZS" | undefined) ??
    (rl?.region === "ru" ? "RUB" : "UZS");

  const pathname = usePathname();
  const sp = useSearchParams();
  const catalogPath = useMemo(() => {
    const qs = sp?.toString();
    return `${pathname}${qs ? `?${qs}` : ""}`;
  }, [pathname, sp]);

  const routeKey = String(p?.productId ?? p?.slug ?? p?.id ?? "").trim();
  const pid = routeKey || String(p?.id ?? "");

  const href =
    (p as any)?.href ||
    (pid ? `/product/${encodeURIComponent(pid)}` : "/catalog");

  const title = String(p.title ?? "").trim() || "Товар";

  const curRub = n(p.priceRUB ?? p.price_rub ?? 0);
  const curUzs = n(p.priceUZS ?? p.price_uzs ?? 0);
  const hasAnyPrice = curRub > 0 || curUzs > 0;

  const oldRub = n(p.oldPriceRUB ?? p.old_price_rub ?? 0);
  const oldUzs = n(p.oldPriceUZS ?? p.old_price_uzs ?? 0);

  const cur = currency === "RUB" ? curRub || curUzs : curUzs || curRub;
  const old = currency === "RUB" ? oldRub || oldUzs : oldUzs || oldRub;

  const hasDiscount = old > 0 && cur > 0 && old > cur;

  const computedPct = hasDiscount
    ? Math.max(1, Math.min(99, Math.round((1 - cur / old) * 100)))
    : 0;

  const badgeMain = p.badge ? String(p.badge).trim() : "";
  const collectionBadge = p.collectionBadge
    ? String(p.collectionBadge).trim()
    : "";

  // ✅ один feature badge (если нет скидки)
  const featureBadge = (collectionBadge || badgeMain || "").trim();

  const snapshot = {
    title,
    href,
    imageUrl: p.image,
    sku: p.sku ? String(p.sku) : null,
    price_uzs: curUzs,
    price_rub: curRub,
  };

  const STRAPI = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

  // 1) Пытаемся взять “малые” форматы Strapi
  const strapiImg =
    p.cardImage?.formats?.small?.url ||
    p.cardImage?.formats?.medium?.url ||
    p.cardImage?.formats?.thumbnail?.url ||
    p.cardImage?.url ||
    (typeof p.cardImage === "string" ? p.cardImage : undefined);

  const strapiSrc = strapiImg
    ? strapiImg.startsWith("http")
      ? strapiImg
      : `${STRAPI}${strapiImg}`
    : "";

  // 2) Фолбэк на галерею/картинку
  const firstGallery =
    (Array.isArray(p.gallery) && p.gallery[0]) ||
    (Array.isArray(p.images) && p.images[0]) ||
    (Array.isArray(p.photos) && p.photos[0]) ||
    "";

  let imgSrcFallback =
    String(firstGallery ?? "").trim() ||
    String(p.image ?? p.cover ?? "").trim() ||
    "/placeholder.png";

  if (
    imgSrcFallback.startsWith("/") &&
    (p.__source === "strapi" || strapiSrc)
  ) {
    const looksLikeStrapi =
      imgSrcFallback.startsWith("/uploads/") ||
      imgSrcFallback.startsWith("/sections/");
    if (looksLikeStrapi) imgSrcFallback = `${STRAPI}${imgSrcFallback}`;
  }

  // ✅ единый источник картинки
  const src = (strapiSrc || imgSrcFallback || "/placeholder.png").trim();
  const isRemote = /^https?:\/\//i.test(src);

  // ✅ первые карточки — приоритет
  const eager = idx < 8;

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
          {/* ✅ next/image остаётся, но remote не ломает доменами */}
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

          {/* ✅ лёгкий “премиум” градиент снизу */}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/20 to-transparent" />

          {/* ✅ БЕЙДЖ: если скидка — только скидка, иначе — один feature */}
          {hasDiscount || featureBadge ? (
            <div className="absolute left-3 top-3 z-10 flex items-center gap-2">
              {hasDiscount ? (
                <GoldDiscountBadge text={`Скидка −${computedPct}%`} />
              ) : (
                <GreenPremiumBadge text={featureBadge} />
              )}
            </div>
          ) : null}

          <div className="absolute right-3 top-3 z-10 flex flex-col gap-2 translate-y-[-4px] opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <div
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <ProductActions
                id={pid}
                snapshot={snapshot}
                onOpenSpecs={() => {
                  window.location.href = href;
                }}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-1 flex-col px-4 pb-3 pt-3">
          <div
            className="overflow-hidden text-[14px] font-medium leading-[20px] text-black/90"
            style={{
              display: "-webkit-box",
              WebkitBoxOrient: "vertical" as any,
              WebkitLineClamp: 2,
              maxHeight: 40,
            }}
          >
            {title}
          </div>

          <div className="mt-2 flex items-baseline gap-2">
            {hasAnyPrice ? (
              <>
                <div className="text-[15px] font-semibold text-black">
                  {fmtPrice(curRub, curUzs)}
                </div>

                {hasDiscount ? (
                  <div className="text-[13px] text-black/35 line-through">
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
