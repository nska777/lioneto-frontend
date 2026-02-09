"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo } from "react";
import { usePathname, useSearchParams } from "next/navigation";

import ProductActions from "../ProductActions";
import { useShopState } from "@/app/context/shop-state"; // ⚠️ проверь путь
import { useRegionLang } from "@/app/context/region-lang"; // ✅ нужно для корректного % в текущей валюте

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
  const { addToCart, isInCart } = useShopState();

  // ✅ для корректного процента скидки в зависимости от выбранной валюты
  const rl = useRegionLang() as any;
  const currency: "RUB" | "UZS" =
    (rl?.currency as "RUB" | "UZS" | undefined) ??
    (rl?.region === "ru" ? "RUB" : "UZS");

  // ✅ стабильный "from" без window → нет hydration mismatch
  const pathname = usePathname();
  const sp = useSearchParams();
  const catalogPath = useMemo(() => {
    const qs = sp?.toString();
    return `${pathname}${qs ? `?${qs}` : ""}`;
  }, [pathname, sp]);

  const href = `/product/${p.id}?from=${encodeURIComponent(catalogPath)}`;

  const title = String(p.title ?? "").trim() || "Товар";

  // ✅ цены: Strapi (priceUZS/priceRUB) + fallback на старые поля
  const curRub = n(
    p.priceRUB ??
      p.price_rub ??
      p.priceRUB ??
      p.priceRUB ??
      p.priceRUB ??
      p.priceRUB ??
      0,
  );
  const curUzs = n(
    p.priceUZS ??
      p.price_uzs ??
      p.priceUZS ??
      p.priceUZS ??
      p.priceUZS ??
      p.priceUZS ??
      0,
  );

  const oldRub = n(
    p.oldPriceRUB ?? p.old_price_rub ?? p.oldPriceRUB ?? p.oldPriceRUB ?? 0,
  );
  const oldUzs = n(
    p.oldPriceUZS ?? p.old_price_uzs ?? p.oldPriceUZS ?? p.oldPriceUZS ?? 0,
  );

  // ✅ скидка считается по ТЕКУЩЕЙ валюте (RU=RUB, UZ=UZS), с фолбэком на другую валюту
  const cur = currency === "RUB" ? curRub || curUzs : curUzs || curRub;
  const old = currency === "RUB" ? oldRub || oldUzs : oldUzs || oldRub;

  const hasDiscount = old > 0 && cur > 0 && old > cur;

  const computedPct = hasDiscount
    ? Math.max(1, Math.min(99, Math.round((1 - cur / old) * 100)))
    : 0;

  const discountPct = n(p.discountPct ?? computedPct);

  // ✅ бейджи
  const badgeMain = p.badge ? String(p.badge) : "";
  const collectionBadge = p.collectionBadge ? String(p.collectionBadge) : "";

  const snapshot = {
    title,
    href,
    imageUrl: p.image,
    sku: p.sku ? String(p.sku) : null,
    price_uzs: curUzs,
    price_rub: curRub,
  };

  const STRAPI = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

  // fallback (локальная картинка)
  const imgSrcFallback =
    String(p.image ?? p.cover ?? "").trim() || "/placeholder.png";

  // ✅ Strapi cardImage
  const strapiImg =
    (p.cardImage?.formats?.small?.url as string | undefined) ??
    (p.cardImage?.url as string | undefined) ??
    undefined;

  const strapiSrc = strapiImg
    ? strapiImg.startsWith("http")
      ? strapiImg
      : `${STRAPI}${strapiImg}`
    : "";

  const added = isInCart(String(p.id));

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
        {/* IMAGE */}
        <div className="relative aspect-[16/11] overflow-hidden bg-white px-3 py-2">
          {/* ✅ Strapi картинка — через <img> (без next/image host/private-ip проблем) */}
          {strapiSrc ? (
            <img
              src={strapiSrc}
              alt={title}
              className={cn(
                "absolute inset-0 h-full w-full",
                "object-contain object-center",
                "transition-transform duration-500",
                "group-hover:scale-[1.02]",
              )}
              loading={idx < 6 ? "eager" : "lazy"}
            />
          ) : (
            <Image
              key={imgSrcFallback}
              src={imgSrcFallback}
              alt={title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
              className={cn(
                "object-contain object-center",
                "transition-transform duration-500",
                "group-hover:scale-[1.02]",
              )}
              priority={idx < 6}
            />
          )}

          {/* ✅ BADGES: в одну строку слева (скидка + хит + collectionBadge) */}
          {hasDiscount || badgeMain || collectionBadge ? (
            <div className="absolute left-3 top-3 z-10 flex items-center gap-2">
              {hasDiscount ? (
                <GoldDiscountBadge text={`Скидка −${computedPct}%`} />
              ) : null}

              {badgeMain ? <GreenPremiumBadge text={badgeMain} /> : null}

              {collectionBadge ? (
                <GreenPremiumBadge text={collectionBadge} />
              ) : null}
            </div>
          ) : null}

          {/* ✅ ACTION ICONS: вертикально справа */}
          <div className="absolute right-3 top-3 z-10 flex flex-col gap-2 translate-y-[-4px] opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100">
            <div
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
              }}
            >
              <ProductActions
                id={String(p.id)}
                snapshot={snapshot}
                onOpenSpecs={() => {
                  window.location.href = href;
                }}
              />
            </div>
          </div>
        </div>

        {/* CONTENT */}
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
            <div className="text-[15px] font-semibold text-black">
              {fmtPrice(curRub, curUzs)}
            </div>

            {hasDiscount ? (
              <div className="text-[13px] text-black/35 line-through">
                {fmtPrice(oldRub, oldUzs)}
              </div>
            ) : null}
          </div>

          <div className="mt-auto pt-3">
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                if (!added) addToCart(String(p.id), 1);
              }}
              className={cn(
                "lionetoCartBtn relative h-10 w-full overflow-hidden rounded-xl",
                "inline-flex items-center justify-center",
                "text-[12px] font-semibold tracking-[0.14em] uppercase",
                "transition cursor-pointer",
                "active:scale-[0.99]",
                added ? "isAdded" : "isIdle",
              )}
              aria-label={added ? "Добавлено в корзину" : "Добавить в корзину"}
            >
              <span className="bgSlide pointer-events-none absolute inset-0 opacity-0" />
              <span className="glass pointer-events-none absolute inset-[1px] rounded-[11px] opacity-0" />
              <span className="shine pointer-events-none absolute -left-[60%] top-0 h-full w-[55%] opacity-0" />

              <span className="relative z-10">
                {added ? "Добавлено" : "В корзину"}
              </span>
            </button>

            <style jsx>{`
              .lionetoCartBtn.isIdle {
                border: 1px solid rgba(0, 0, 0, 0.14);
                color: rgba(0, 0, 0, 0.82);
                background: rgba(255, 255, 255, 0.72);
                box-shadow:
                  inset 0 1px 0 rgba(255, 255, 255, 0.9),
                  0 10px 26px rgba(0, 0, 0, 0.06);
                backdrop-filter: blur(10px);
              }
              .lionetoCartBtn.isIdle:hover {
                border-color: rgba(215, 181, 107, 0.72);
                color: rgba(0, 0, 0, 0.92);
              }

              .lionetoCartBtn.isAdded {
                border: 1px solid rgba(215, 181, 107, 0.75);
                color: rgba(90, 58, 0, 0.92);
                background: radial-gradient(
                  120% 140% at 30% 20%,
                  rgba(255, 241, 184, 0.98) 0%,
                  rgba(255, 211, 106, 0.92) 35%,
                  rgba(230, 169, 60, 0.86) 65%,
                  rgba(201, 138, 26, 0.82) 100%
                );
                box-shadow:
                  inset 0 1px 0 rgba(255, 255, 255, 0.65),
                  0 14px 34px rgba(201, 138, 26, 0.22);
              }
              .lionetoCartBtn.isAdded {
                cursor: default;
              }
              .lionetoCartBtn.isAdded .bgSlide,
              .lionetoCartBtn.isAdded .glass,
              .lionetoCartBtn.isAdded .shine {
                display: none;
              }

              .lionetoCartBtn .bgSlide {
                background: linear-gradient(
                  90deg,
                  rgba(255, 241, 184, 0) 0%,
                  rgba(255, 241, 184, 0.9) 18%,
                  rgba(255, 211, 106, 0.9) 40%,
                  rgba(230, 169, 60, 0.86) 62%,
                  rgba(201, 138, 26, 0.84) 82%,
                  rgba(255, 241, 184, 0) 100%
                );
                background-size: 240% 100%;
                background-position: 0% 50%;
              }
              .lionetoCartBtn .glass {
                background: linear-gradient(
                  180deg,
                  rgba(255, 255, 255, 0.55),
                  rgba(255, 255, 255, 0.08)
                );
              }
              .lionetoCartBtn .shine {
                background: linear-gradient(
                  120deg,
                  transparent 0%,
                  rgba(255, 255, 255, 0.92) 50%,
                  transparent 100%
                );
                transform: skewX(-18deg);
              }

              .lionetoCartBtn.isIdle:hover .bgSlide {
                opacity: 1;
                animation: lioneto_bgSlide 900ms ease-out forwards;
              }
              .lionetoCartBtn.isIdle:hover .glass {
                opacity: 1;
                transition: opacity 180ms ease;
              }
              .lionetoCartBtn.isIdle:hover .shine {
                opacity: 1;
                animation: lioneto_shineSlide 900ms ease-out forwards;
              }

              @keyframes lioneto_bgSlide {
                0% {
                  background-position: 0% 50%;
                }
                100% {
                  background-position: 100% 50%;
                }
              }
              @keyframes lioneto_shineSlide {
                0% {
                  transform: translateX(0) skewX(-18deg);
                  opacity: 0;
                }
                10% {
                  opacity: 1;
                }
                100% {
                  transform: translateX(260%) skewX(-18deg);
                  opacity: 0;
                }
              }
            `}</style>
          </div>
        </div>
      </Link>
    </article>
  );
}
