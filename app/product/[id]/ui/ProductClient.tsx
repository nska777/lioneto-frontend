"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  ShoppingCart,
  Minus,
  Plus,
  Check,
  ArrowUpRight,
} from "lucide-react";

import { useRegionLang } from "@/app/context/region-lang";
import { useShopState } from "@/app/context/shop-state";
import { formatPrice } from "@/app/lib/format/price";

import ProductGallery from "./ProductGallery";
import ProductVariants from "./ProductVariants";
import ProductLightbox from "./ProductLightbox";
import ProductRelated from "./ProductRelated";

import { useProductVariants } from "./hooks/useProductVariants";
import { useProductGallery } from "./hooks/useProductGallery";
import { useProductLightbox } from "./hooks/useProductLightbox";

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

type MegaPreview = {
  title: string;
  main: string;
  a: string;
  b: string;
};

export type ProductVariant = {
  id: string;
  title: string;
  kind: "color" | "option";
  group?: string;
  disabled?: boolean;
  priceDeltaRUB?: number;
  priceDeltaUZS?: number;
  image?: string;
  gallery?: string[];
};

export type ProductPageModel = {
  id: string;
  title: string;
  badge?: string;
  sku?: string;
  image: string;
  gallery: string[];
  price_rub: number;
  price_uzs: number;
  description?: string;
  extra?: {
    article?: string;
    size?: string;
    color?: string;
    material?: string;
  };
  related?: Array<{
    id: string;
    title: string;
    image: string;
    price_rub: number;
    price_uzs: number;
    href: string;
    badge?: string;
  }>;
  variants?: ProductVariant[];
  brand?: string;
  category?: string;
  collectionHref?: string;
  categoryLabel?: string;
  collectionLabel?: string;
  collectionPreview?: MegaPreview;
  isCollection?: boolean;
};

type Accent = "white" | "cappuccino" | "default";

/** ✅ Определяем акцент только по выбранному цвету/variantKey (без ломки логики) */
function getAccentFromVariant(
  variantKey?: string | null,
  selectedByGroup?: Record<string, any> | null,
): Accent {
  const c = String((selectedByGroup as any)?.color ?? "")
    .trim()
    .toLowerCase();
  if (c) {
    if (c.includes("white") || c.includes("бел")) return "white";
    if (c.includes("cappuccino") || c.includes("капуч")) return "cappuccino";
  }

  const k = String(variantKey ?? "")
    .trim()
    .toLowerCase();
  if (k.includes("white") || k.includes("бел")) return "white";
  if (k.includes("cappuccino") || k.includes("капуч")) return "cappuccino";

  return "default";
}

export default function ProductClient({
  product,
}: {
  product: ProductPageModel;
}) {
  const router = useRouter();
  const { region } = useRegionLang();
  const currency: "RUB" | "UZS" = region === "ru" ? "RUB" : "UZS";

  const shop = useShopState();
  const { isFav, toggleFav, isInCart, addToCart, removeFromCart } = shop;

  const {
    selectedByGroup,
    setSelectedByGroup,
    selectedVariants,
    variantDelta,
    groupsForUI,
  } = useProductVariants(product, currency);

  /**
   * ✅ ВАЖНО:
   * variantKey строим из selectedByGroup:
   * - поддерживает строку и объект {id,title}
   * - group:id | group:id ...
   */
  const variantKey = useMemo(() => {
    const entries = Object.entries(selectedByGroup || {})
      .map(([g, v]) => {
        if (!v) return null;

        // если строка
        if (typeof v === "string") {
          const s = v.trim();
          return s ? ([g, s] as const) : null;
        }

        // если объект { id, title }
        if (typeof v === "object") {
          const id =
            typeof (v as any).id === "string"
              ? String((v as any).id).trim()
              : "";

          return id ? ([g, id] as const) : null;
        }

        return null;
      })
      .filter(Boolean) as Array<readonly [string, string]>;

    if (!entries.length) return null;

    entries.sort(([a], [b]) => a.localeCompare(b));
    return entries.map(([g, v]) => `${g}:${v}`).join("|");
  }, [selectedByGroup]);

  // ✅ Акцент (white / cappuccino) — ВОТ ЭТОГО НЕ ХВАТАЛО
  const accent: Accent = useMemo(
    () => getAccentFromVariant(variantKey, selectedByGroup as any),
    [variantKey, selectedByGroup],
  );

  // ✅ Берём галерею/картинку выбранного варианта (цвета)
  const variantGallery = useMemo(() => {
    const withGallery = selectedVariants.find(
      (v) => Array.isArray(v.gallery) && v.gallery.length > 0,
    );
    if (withGallery?.gallery?.length) return withGallery.gallery;

    const withImage = selectedVariants.find((v) => !!v.image);
    if (withImage?.image) return [withImage.image];

    return null;
  }, [selectedVariants]);

  const { gallery, activeIdx, setActiveIdx, onPrev, onNext } =
    useProductGallery(
      {
        id: product.id,
        image: product.image,
        gallery: product.gallery,
      },
      {
        variantGallery,
        // ✅ cacheKey меняется при смене color/option
        cacheKey: `${product.id}:${variantKey ?? "base"}`,
      },
    );

  const maxLen = gallery.length;

  const {
    lightboxOpen,
    setLightboxOpen,
    lightboxIdx,
    setLightboxIdx,
    openLightbox,
    nextLb,
    prevLb,
  } = useProductLightbox({ maxLen, activeIdx, setActiveIdx });

  const [qty, setQty] = useState(1);

  // ✅ везде используем variantKey
  const vk = variantKey ?? undefined;

  const fav = isFav(product.id, vk);
  const inCart = isInCart(product.id, vk);

  const baseUnitPrice =
    currency === "RUB" ? product.price_rub : product.price_uzs;
  const unitPrice = baseUnitPrice + variantDelta;
  const totalPrice = unitPrice * qty;

  const toggleMainCart = () => {
    if (inCart) removeFromCart(product.id, vk);
    else addToCart(product.id, qty, vk);
  };

  const hasCollection =
    !!product.collectionHref &&
    !!product.collectionLabel &&
    !!product.categoryLabel;

  const showCollectionCard = hasCollection && !product.isCollection;

  const collectionBadge = String(product.brand || product.collectionLabel || "")
    .trim()
    .toUpperCase();

  // ✅ стили-акценты (тонко, премиально)
  const accentVars = useMemo(() => {
    const acc =
      accent === "cappuccino"
        ? "#C6A27E"
        : accent === "white"
          ? "#F5F5F5"
          : "#111111";

    const accText =
      accent === "cappuccino"
        ? "#FFFFFF"
        : accent === "white"
          ? "#111111"
          : "#FFFFFF";

    const ring =
      accent === "cappuccino"
        ? "rgba(198,162,126,0.45)"
        : accent === "white"
          ? "rgba(0,0,0,0.14)"
          : "rgba(0,0,0,0.14)";

    const soft =
      accent === "cappuccino"
        ? "rgba(198,162,126,0.18)"
        : accent === "white"
          ? "rgba(0,0,0,0.06)"
          : "rgba(0,0,0,0.06)";

    return {
      "--acc": acc,
      "--accText": accText,
      "--accRing": ring,
      "--accSoft": soft,
    } as React.CSSProperties;
  }, [accent]);

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-8">
      <div className="mb-4 text-[12px] text-black/40">
        <Link href="/" className="hover:text-black/70">
          Главная
        </Link>{" "}
        /{" "}
        <Link href="/catalog" className="hover:text-black/70">
          Каталог
        </Link>
        {hasCollection ? (
          <>
            {" "}
            /{" "}
            <Link
              href={`/category/${product.category}`}
              className="hover:text-black/70"
            >
              {product.categoryLabel}
            </Link>{" "}
            /{" "}
            <Link
              href={product.collectionHref!}
              className="hover:text-black/70"
            >
              {product.collectionLabel}
            </Link>
          </>
        ) : null}{" "}
        / <span className="text-black/60">{product.title}</span>
      </div>

      <div className="mb-5 flex flex-wrap items-center justify-between gap-2 sm:flex-nowrap sm:gap-3">
        <button
          onClick={() => router.back()}
          className={cn(
            "cursor-pointer inline-flex items-center gap-2 rounded-full border",
            "h-9 px-3 text-[11px] tracking-[0.16em] uppercase",
            "sm:h-11 sm:px-4 sm:py-2 sm:text-[12px]",
            "border-black/10 bg-white text-black/70",
            "hover:border-black/20 hover:text-black transition",
          )}
          type="button"
        >
          ← НАЗАД
        </button>

        <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
          <button
            onClick={() => toggleFav(product.id, vk)}
            className={cn(
              "cursor-pointer inline-flex items-center gap-2 rounded-full border",
              "h-9 px-3 text-[11px]",
              "sm:h-11 sm:px-4 sm:py-2 sm:text-[13px]",
              "border-black/10 bg-white text-black/75",
              "hover:border-black/20 hover:text-black transition",
            )}
            type="button"
          >
            <Heart
              className={cn(
                "h-4 w-4 sm:h-4 sm:w-4",
                fav && "fill-current text-rose-600",
              )}
            />
            В избранное
          </button>

          <button
            onClick={toggleMainCart}
            style={accentVars}
            className={cn(
              "cursor-pointer inline-flex items-center gap-2 rounded-full",
              "h-9 px-3 text-[11px]",
              "sm:h-11 sm:px-4 sm:py-2 sm:text-[13px]",
              "transition active:scale-[0.99]",
              accent === "cappuccino"
                ? "bg-[var(--acc)] text-white shadow-[0_12px_26px_var(--accSoft)] hover:brightness-[0.98]"
                : "bg-black text-white hover:bg-black/90",
            )}
            type="button"
          >
            <ShoppingCart className="h-4 w-4" />
            {inCart ? "В корзине" : "В корзину"}
          </button>
        </div>
      </div>

      <div className="grid gap-10 lg:grid-cols-[520px_1fr]">
        <ProductGallery
          key={`${product.id}-${gallery.length}-${variantKey ?? "base"}`}
          title={product.title}
          gallery={gallery}
          activeIdx={activeIdx}
          setActiveIdx={setActiveIdx}
          onPrev={onPrev}
          onNext={onNext}
          onOpenLightbox={(idx) => openLightbox(idx)}
        />

        <aside
          style={accentVars}
          className={cn(
            "relative",
            accent === "cappuccino"
              ? "shadow-[0_0_0_1px_var(--accRing),0_30px_80px_-60px_var(--accSoft)] rounded-3xl p-5 -m-5"
              : "rounded-3xl p-5 -m-5",
          )}
        >
          {collectionBadge ? (
            <div className="mb-2 inline-flex rounded-full border border-black/10 bg-white px-3 py-1 text-[11px] tracking-[0.18em] uppercase text-black/55">
              Коллекция: {collectionBadge}
            </div>
          ) : null}

          <h1 className="text-[28px] font-semibold leading-[1.1] tracking-[-0.02em] text-black">
            {product.title}
          </h1>

          <div
            className={cn(
              "mt-4 rounded-2xl p-3",
              accent === "cappuccino"
                ? "bg-[rgba(198,162,126,0.06)]"
                : "bg-transparent",
            )}
          >
            <ProductVariants
              groups={groupsForUI}
              selectedByGroup={selectedByGroup}
              setSelectedByGroup={setSelectedByGroup}
              currency={currency}
            />
          </div>

          <div className="mt-3 flex items-start justify-between gap-6">
            <div className="text-[28px] font-semibold text-black">
              {formatPrice(totalPrice, currency)}
            </div>

            <div className="shrink-0">
              <div className="inline-flex h-10 items-center overflow-hidden border border-black/20 bg-white">
                <button
                  onClick={() => setQty((v) => Math.max(1, v - 1))}
                  className="cursor-pointer grid h-10 w-10 place-items-center border-r border-black/20 hover:bg-black/[0.03] transition"
                  aria-label="Минус"
                  type="button"
                >
                  <Minus className="h-4 w-4 text-black/70" />
                </button>

                <div className="grid h-10 w-10 place-items-center text-[13px] font-medium text-black/80">
                  {qty}
                </div>

                <button
                  onClick={() => setQty((v) => v + 1)}
                  className="cursor-pointer grid h-10 w-10 place-items-center border-l border-black/20 hover:bg-black/[0.03] transition"
                  aria-label="Плюс"
                  type="button"
                >
                  <Plus className="h-4 w-4 text-black/70" />
                </button>
              </div>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-4">
            <button
              onClick={toggleMainCart}
              style={accentVars}
              className={cn(
                "cursor-pointer inline-flex items-center justify-center gap-2",
                "h-12 flex-1 rounded-none",
                "text-[13px] font-semibold transition active:scale-[0.99]",
                inCart
                  ? "bg-emerald-600 text-white hover:bg-emerald-700"
                  : accent === "cappuccino"
                    ? "bg-[var(--acc)] text-white hover:brightness-[0.98] shadow-[0_16px_36px_var(--accSoft)]"
                    : "bg-white text-black border border-black/20 hover:bg-black/[0.02]",
              )}
              type="button"
            >
              {inCart ? (
                <Check className="h-4 w-4" />
              ) : (
                <ShoppingCart className="h-4 w-4" />
              )}
              {inCart ? "Добавлено" : "В корзину"}
            </button>

            <button
              onClick={() => {
                shop.setOneClick(product.id, qty, vk);
                router.push("/checkout?mode=oneclick");
              }}
              style={accentVars}
              className={cn(
                "cursor-pointer h-12 flex-1 rounded-none",
                "text-[13px] font-semibold",
                "transition active:scale-[0.99]",
                "bg-black text-white hover:bg-black/90",
              )}
              type="button"
            >
              Купить в 1 клик
            </button>
          </div>

          {showCollectionCard && (
            <Link
              href={product.collectionHref!}
              className={cn(
                "mt-6 block rounded-3xl border border-black/10 bg-white p-3",
                "shadow-[0_35px_110px_-85px_rgba(0,0,0,0.35)]",
                "hover:border-black/20 transition cursor-pointer",
              )}
            >
              <div className="mb-3 flex items-center justify-between gap-3">
                <div>
                  <div className="text-[11px] tracking-[0.18em] uppercase text-black/45">
                    Коллекция
                  </div>
                  <div className="mt-1 text-[14px] font-semibold text-black/85">
                    {product.categoryLabel} / {product.collectionLabel}
                  </div>
                </div>

                <div className="h-9 w-9 rounded-full border border-black/10 bg-white grid place-items-center">
                  <ArrowUpRight className="h-4 w-4 text-black/60" />
                </div>
              </div>

              <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-black/5">
                {product.collectionPreview?.main ? (
                  <div className="absolute inset-0" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-sm text-black/40">
                    Нет превью
                  </div>
                )}
              </div>
            </Link>
          )}
        </aside>
      </div>

      <div className="mt-10 grid gap-10 lg:grid-cols-2">
        <section>
          <h2 className="text-[16px] font-semibold text-black">Описание</h2>
          <p className="mt-3 text-[13px] leading-relaxed text-black/70 whitespace-pre-line">
            {product.description || "—"}
          </p>
        </section>

        <section>
          <h2 className="text-[16px] font-semibold text-black">
            Дополнительная информация
          </h2>

          <div className="mt-4 space-y-2 text-[13px] text-black/70">
            <Row
              label="Артикул"
              value={product.extra?.article || product.sku || "—"}
            />
            <Row label="Размер" value={product.extra?.size || "—"} />
            <Row label="Цвет" value={product.extra?.color || "—"} />
            <Row label="Материал" value={product.extra?.material || "—"} />
          </div>
        </section>
      </div>

      <ProductRelated
        title={
          product.isCollection ? "Товары коллекции" : "С этим товаром покупают"
        }
        items={(product.related ?? []).slice(0, 4)}
        currency={currency}
      />

      <ProductLightbox
        open={lightboxOpen}
        title={product.title}
        gallery={gallery}
        idx={lightboxIdx}
        setIdx={setLightboxIdx}
        onClose={() => setLightboxOpen(false)}
        onPrev={prevLb}
        onNext={nextLb}
      />
    </main>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-[120px] shrink-0 text-black/45">{label}</div>
      <div className="flex-1 border-b border-dotted border-black/20 pb-1">
        {value}
      </div>
    </div>
  );
}
