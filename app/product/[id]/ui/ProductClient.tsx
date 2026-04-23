"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Heart,
  ShoppingCart,
  Minus,
  Plus,
  Check,
  ArrowUpRight,
  X,
  Download,
} from "lucide-react";

import { useRegionLang } from "@/app/context/region-lang";
import { useShopState } from "@/app/context/shop-state";
import { formatPrice } from "@/app/lib/format/price";
import {
  hasCartLeadCapture,
  saveCartLeadData,
  setCartLeadCaptureDone,
  upsertCartLineMeta,
} from "@/app/lib/cart-lead";

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
  assemblyInstructionTitle?: string;
  assemblyInstructionFile?: {
    url: string;
    name?: string;
  } | null;
  related?: Array<{
    id: string;
    title: string;
    image: string;
    price_rub: number;
    price_uzs: number;
    href: string;
    badge?: string;
  }>;
  setItems?: Array<{
    id: string;
    title: string;
    article?: string;
    price_rub?: number;
    price_uzs?: number;
    href?: string;
    quantity?: number;
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
type Region = "uz" | "ru";

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function asNonEmptyString(v: unknown): string | null {
  if (typeof v !== "string") return null;
  const s = v.trim();
  return s ? s : null;
}

function normalizeArticleColor(color?: string | null) {
  const value = String(color ?? "").trim();
  if (!value) return "";
  return value.charAt(0).toLowerCase() + value.slice(1);
}

function getDisplayArticle(baseArticle?: string | null, color?: string | null) {
  const article = String(baseArticle ?? "").trim();
  const normalizedColor = normalizeArticleColor(color);

  if (!article) return "—";
  if (!normalizedColor || normalizedColor === "—") return article;

  return `${article} (${normalizedColor})`;
}

function LeadBeforeCartModal({
  open,
  onClose,
  onSubmit,
}: {
  open: boolean;
  onClose: () => void;
  onSubmit: (payload: { name: string; phone: string }) => void;
}) {
  const { region } = useRegionLang() as { region: Region };
  const [mounted, setMounted] = useState(false);
  const [name, setName] = useState("");
  const [phoneDigits, setPhoneDigits] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open) {
      setName("");
      setPhoneDigits("");
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }

    document.addEventListener("keydown", onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  if (!mounted || !open) return null;

  const cleanName = name.trim();
  const isNameValid = cleanName.length >= 2;

  const isPhoneValid =
    region === "uz"
      ? /^\d{9}$/.test(phoneDigits)
      : String(phoneDigits).trim().length >= 7;

  const canSubmit = isNameValid && isPhoneValid;

  const fullPhone =
    region === "uz" ? `+998${phoneDigits}` : String(phoneDigits).trim();

  return createPortal(
    <div
      className="fixed inset-0 z-[99999] flex items-end justify-center px-3 pb-3 pt-10 sm:items-center sm:px-4 sm:pb-4"
      onClick={onClose}
      aria-modal="true"
      role="dialog"
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-[5px]" />

      <div
        className={cn(
          "relative w-full max-w-[420px] overflow-hidden rounded-[24px]",
          "border border-white/40 bg-white/95 shadow-[0_25px_80px_rgba(0,0,0,0.24)]",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute inset-x-0 top-0 h-20 bg-[radial-gradient(circle_at_top,rgba(214,179,106,0.18),transparent_70%)]" />

        <div className="relative z-10 px-4 pb-4 pt-4 sm:px-5 sm:pb-5 sm:pt-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-[10px] tracking-[0.22em] text-black/40">
                LIONETO
              </div>
              <h3 className="mt-1 text-[22px] font-semibold leading-[1.05] tracking-[-0.03em] text-black sm:text-[24px]">
                Добавить в корзину
              </h3>
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Закрыть"
              className={cn(
                "cursor-pointer inline-flex h-9 w-9 items-center justify-center rounded-full",
                "border border-black/10 bg-white text-black/55 transition",
                "hover:border-black/20 hover:text-black",
              )}
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3">
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ваше имя"
              className={cn(
                "h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm text-black outline-none transition",
                "focus:border-black/20",
              )}
            />

            {region === "uz" ? (
              <div className="flex h-12 items-center overflow-hidden rounded-2xl border border-black/10 bg-white">
                <div className="px-4 text-sm font-semibold text-black/60">
                  +998
                </div>
                <input
                  value={phoneDigits}
                  onChange={(e) => {
                    const only = e.target.value.replace(/\D/g, "").slice(0, 9);
                    setPhoneDigits(only);
                  }}
                  inputMode="numeric"
                  placeholder="Телефон"
                  className="h-full w-full px-4 text-sm outline-none"
                />
              </div>
            ) : (
              <input
                value={phoneDigits}
                onChange={(e) => setPhoneDigits(e.target.value)}
                inputMode="tel"
                placeholder="Телефон"
                className={cn(
                  "h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm text-black outline-none transition",
                  "focus:border-black/20",
                )}
              />
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className={cn(
                "inline-flex h-11 items-center justify-center rounded-full border border-black/10 bg-white",
                "text-sm font-medium text-black/70 transition hover:border-black/20 hover:text-black",
              )}
            >
              Отмена
            </button>

            <button
              type="button"
              disabled={!canSubmit}
              onClick={() => {
                if (!canSubmit) return;
                onSubmit({ name: cleanName, phone: fullPhone });
              }}
              className={cn(
                "inline-flex h-11 items-center justify-center rounded-full text-sm font-semibold transition",
                canSubmit
                  ? "cursor-pointer bg-black text-white hover:opacity-90"
                  : "cursor-not-allowed bg-black/10 text-black/35",
              )}
            >
              Продолжить
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function getAccentFromVariant(
  variantKey?: string | null,
  selectedByGroup?: Record<string, unknown> | null,
): Accent {
  const rawColor = selectedByGroup ? selectedByGroup["color"] : undefined;
  const c =
    asNonEmptyString(rawColor)?.toLowerCase() ??
    (isRecord(rawColor)
      ? asNonEmptyString(rawColor["id"])?.toLowerCase()
      : "") ??
    "";

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

function getDisplayColor(args: {
  product: ProductPageModel;
  selectedByGroup: Record<string, unknown> | null | undefined;
  selectedVariants: Array<ProductVariant> | null | undefined;
  groupsForUI:
    | Array<{ group: string; items: ProductVariant[] }>
    | null
    | undefined;
}): string {
  const { product, selectedByGroup, selectedVariants, groupsForUI } = args;

  const hasColorVariants =
    (Array.isArray(product.variants) &&
      product.variants.some((v) => v && v.kind === "color")) ||
    (Array.isArray(groupsForUI) &&
      groupsForUI.some(
        (g) =>
          g &&
          g.group === "color" &&
          Array.isArray(g.items) &&
          g.items.some((v) => v && v.kind === "color"),
      ));

  if (hasColorVariants) {
    const fromSelectedVariants = Array.isArray(selectedVariants)
      ? selectedVariants.find((v) => v && v.kind === "color")?.title
      : undefined;

    const t1 = asNonEmptyString(fromSelectedVariants);
    if (t1) return t1;

    const rawSel = selectedByGroup ? selectedByGroup["color"] : undefined;

    const selectedColorId =
      asNonEmptyString(rawSel) ??
      (isRecord(rawSel) ? asNonEmptyString(rawSel["id"]) : null);

    if (selectedColorId) {
      const group = Array.isArray(groupsForUI)
        ? groupsForUI.find((g) => g && g.group === "color")
        : undefined;

      const fromGroup = group?.items?.find(
        (v) => v && String(v.id) === selectedColorId,
      )?.title;

      const t2 = asNonEmptyString(fromGroup);
      if (t2) return t2;

      const fromProductVariants = Array.isArray(product.variants)
        ? product.variants.find((v) => v && String(v.id) === selectedColorId)
            ?.title
        : undefined;

      const t3 = asNonEmptyString(fromProductVariants);
      if (t3) return t3;
    }

    return "—";
  }

  const strapiColor = asNonEmptyString(product.extra?.color);
  return strapiColor ?? "—";
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

  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [visibleSetItems, setVisibleSetItems] = useState(
    product.setItems ?? [],
  );

  useEffect(() => {
    setVisibleSetItems(product.setItems ?? []);
  }, [product.setItems]);

  const {
    selectedByGroup,
    setSelectedByGroup,
    selectedVariants,
    variantDelta,
    groupsForUI,
  } = useProductVariants(product, currency);

  const variantKey = useMemo(() => {
    const entries = Object.entries(selectedByGroup || {})
      .map(([g, v]) => {
        if (!v) return null;

        if (typeof v === "string") {
          const s = v.trim();
          return s ? ([g, s] as const) : null;
        }

        if (typeof v === "object") {
          const rec = v as Record<string, unknown>;
          const rawId = rec["id"];
          const id = typeof rawId === "string" ? rawId.trim() : "";
          return id ? ([g, id] as const) : null;
        }

        return null;
      })
      .filter(Boolean) as Array<readonly [string, string]>;

    if (!entries.length) return null;

    entries.sort(([a], [b]) => a.localeCompare(b));
    return entries.map(([g, v]) => `${g}:${v}`).join("|");
  }, [selectedByGroup]);

  const accent: Accent = useMemo(
    () =>
      getAccentFromVariant(
        variantKey,
        (selectedByGroup as Record<string, unknown>) ?? null,
      ),
    [variantKey, selectedByGroup],
  );

  const displayColor = useMemo(() => {
    return getDisplayColor({
      product,
      selectedByGroup:
        (selectedByGroup as unknown as Record<string, unknown>) ?? null,
      selectedVariants,
      groupsForUI:
        (groupsForUI as Array<{
          group: string;
          items: ProductVariant[];
        }>) ?? null,
    });
  }, [product, selectedByGroup, selectedVariants, groupsForUI]);

  const displayArticle = useMemo(() => {
    return getDisplayArticle(
      product.extra?.article || product.sku || "—",
      displayColor,
    );
  }, [product.extra?.article, product.sku, displayColor]);

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

  const vk = variantKey ?? undefined;

  const fav = isFav(product.id, vk);
  const inCart = isInCart(product.id, vk);

  const baseUnitPrice =
    currency === "RUB" ? product.price_rub : product.price_uzs;
  const unitPrice = baseUnitPrice + variantDelta;
  const totalPrice = unitPrice * qty;

  function saveCartMeta() {
    const imageFromVariant =
      Array.isArray(variantGallery) && variantGallery.length > 0
        ? variantGallery[0]
        : product.image;

    upsertCartLineMeta({
      productId: product.id,
      variantId: vk ?? "base",
      variantTitle:
        selectedVariants
          .map((v) => v.title)
          .filter(Boolean)
          .join(", ") || null,
      title: product.title,
      href: `/product/${encodeURIComponent(product.id)}`,
      imageUrl: imageFromVariant || product.image || null,
      sku: displayArticle,
      price_uzs: product.price_uzs + (currency === "UZS" ? variantDelta : 0),
      price_rub: product.price_rub + (currency === "RUB" ? variantDelta : 0),
    });
  }

  const toggleMainCart = () => {
    if (inCart) {
      removeFromCart(product.id, vk);
      return;
    }

    if (hasCartLeadCapture()) {
      saveCartMeta();
      addToCart(product.id, qty, vk);
      return;
    }

    setLeadModalOpen(true);
  };

  const confirmAddToCart = (payload: { name: string; phone: string }) => {
    saveCartLeadData(payload);
    setCartLeadCaptureDone();
    saveCartMeta();
    addToCart(product.id, qty, vk);
    setLeadModalOpen(false);
  };

  const hasCollection =
    !!product.collectionHref &&
    !!product.collectionLabel &&
    !!product.categoryLabel;

  const showCollectionCard = hasCollection && !product.isCollection;

  const collectionBadge = String(product.brand || product.collectionLabel || "")
    .trim()
    .toUpperCase();

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
    <>
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

            {product.isCollection && visibleSetItems.length > 0 ? (
              <section className="mt-6">
                <h2 className="text-[16px] font-semibold text-black">
                  В комплектацию входит:
                </h2>

                <div className="mt-3 overflow-hidden border-2 border-black">
                  <div className="grid grid-cols-[1.6fr_.8fr_.9fr_auto] gap-0 border-b-2 border-black bg-white">
                    <div className="border-r-2 border-black px-3 py-3 text-[14px] font-semibold text-black">
                      Название модуля
                    </div>
                    <div className="border-r-2 border-black px-3 py-3 text-[14px] font-semibold text-black">
                      Артикул
                    </div>
                    <div className="border-r-2 border-black px-3 py-3 text-[14px] font-semibold text-black">
                      Цена
                    </div>
                    <div className="px-3 py-3 text-[14px] font-semibold text-black">
                      —
                    </div>
                  </div>

                  {visibleSetItems.map((item) => {
                    const itemPrice =
                      currency === "RUB"
                        ? (item.price_rub ?? 0)
                        : (item.price_uzs ?? 0);

                    return (
                      <div
                        key={item.id}
                        className="grid grid-cols-[1.6fr_.8fr_.9fr_auto] gap-0 border-b-2 border-black last:border-b-0"
                      >
                        <div className="border-r-2 border-black px-3 py-3 text-[13px] text-black">
                          {item.href ? (
                            <Link
                              href={item.href}
                              className="underline underline-offset-4 hover:text-black/70"
                            >
                              {item.title}
                              {item.quantity && item.quantity > 1
                                ? ` × ${item.quantity}`
                                : ""}
                            </Link>
                          ) : (
                            <span>
                              {item.title}
                              {item.quantity && item.quantity > 1
                                ? ` × ${item.quantity}`
                                : ""}
                            </span>
                          )}
                        </div>

                        <div className="border-r-2 border-black px-3 py-3 text-[13px] text-black">
                          {item.article || "—"}
                        </div>

                        <div className="border-r-2 border-black px-3 py-3 text-[13px] text-black">
                          {itemPrice > 0
                            ? formatPrice(itemPrice, currency)
                            : "—"}
                        </div>

                        <div className="px-2 py-2">
                          <button
                            type="button"
                            onClick={() =>
                              setVisibleSetItems((prev) =>
                                prev.filter((x) => x.id !== item.id),
                              )
                            }
                            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-black/15 text-black/60 transition hover:border-black/25 hover:text-black"
                            aria-label={`Удалить ${item.title}`}
                          >
                            <X className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </section>
            ) : null}

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

                  <div className="grid h-9 w-9 place-items-center rounded-full border border-black/10 bg-white">
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
            <p className="mt-3 whitespace-pre-line text-[13px] leading-relaxed text-black/70">
              {product.description || "—"}
            </p>
          </section>

          <section>
            <h2 className="text-[16px] font-semibold text-black">
              Дополнительная информация
            </h2>

            <div className="mt-4 space-y-2 text-[13px] text-black/70">
              <Row label="Артикул" value={displayArticle} />
              <Row label="Размер" value={product.extra?.size || "—"} />
              <Row label="Цвет" value={displayColor} />
              <Row label="Материал" value={product.extra?.material || "—"} />

              {product.assemblyInstructionFile?.url ? (
                <Row
                  label="Инструкция"
                  value={
                    <a
                      href={`/api/download-instruction?url=${encodeURIComponent(
                        product.assemblyInstructionFile.url,
                      )}&name=${encodeURIComponent(
                        product.assemblyInstructionFile.name ||
                          "instruction.pdf",
                      )}`}
                      className="inline-flex items-center gap-2 text-black underline underline-offset-4 hover:text-black/70"
                    >
                      <Download className="h-4 w-4" />
                      {product.assemblyInstructionTitle?.trim() ||
                        product.assemblyInstructionFile.name?.trim() ||
                        "Скачать PDF"}
                    </a>
                  }
                />
              ) : null}
            </div>
          </section>
        </div>

        <ProductRelated
          title={
            product.isCollection
              ? "Товары коллекции"
              : "С этим товаром покупают"
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

      <LeadBeforeCartModal
        open={leadModalOpen}
        onClose={() => setLeadModalOpen(false)}
        onSubmit={confirmAddToCart}
      />
    </>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-[120px] shrink-0 text-black/45">{label}</div>
      <div className="flex-1 border-b border-dotted border-black/20 pb-1">
        {value}
      </div>
    </div>
  );
}
