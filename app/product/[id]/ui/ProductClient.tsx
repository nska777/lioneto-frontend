"use client";

import React, { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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

type ProductSetItem = {
  id: string;
  title: string;
  article?: string;
  image?: string;
  price_rub?: number;
  price_uzs?: number;
  href?: string;
  quantity?: number;
  colorKey?: string;
  optionKey?: string;
  note?: string;
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
  setItems?: ProductSetItem[];
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

function normalizeKey(v: unknown) {
  return String(v ?? "")
    .trim()
    .toLowerCase()
    .replace(/ё/g, "e")
    .replace(/ж/g, "zh")
    .replace(/ч/g, "ch")
    .replace(/ш/g, "sh")
    .replace(/щ/g, "sch")
    .replace(/ю/g, "yu")
    .replace(/я/g, "ya")
    .replace(/а/g, "a")
    .replace(/б/g, "b")
    .replace(/в/g, "v")
    .replace(/г/g, "g")
    .replace(/д/g, "d")
    .replace(/е/g, "e")
    .replace(/з/g, "z")
    .replace(/и/g, "i")
    .replace(/й/g, "y")
    .replace(/к/g, "k")
    .replace(/л/g, "l")
    .replace(/м/g, "m")
    .replace(/н/g, "n")
    .replace(/о/g, "o")
    .replace(/п/g, "p")
    .replace(/р/g, "r")
    .replace(/с/g, "s")
    .replace(/т/g, "t")
    .replace(/у/g, "u")
    .replace(/ф/g, "f")
    .replace(/х/g, "h")
    .replace(/ц/g, "c")
    .replace(/ы/g, "y")
    .replace(/ь/g, "")
    .replace(/ъ/g, "")
    .replace(/э/g, "e")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
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

function getPositiveNumber(v: unknown) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function getFiniteNumber(v: unknown) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function getSetItemOptionLabel(item?: ProductSetItem | null) {
  if (!item) return null;

  const title = String(item.title ?? "").trim();
  if (title) return title;

  const option = String(item.optionKey ?? "").trim();
  return option || null;
}

function parseVariantParam(raw: string) {
  const value = String(raw || "").trim();

  const result = {
    colorKey: "",
    setOptionKey: "",
  };

  if (!value || value === "base") return result;

  const parts = value
    .split("|")
    .map((x) => x.trim())
    .filter(Boolean);

  for (const part of parts) {
    const [rawGroup, ...rest] = part.split(":");
    const group = String(rawGroup || "").trim();
    const val = rest.join(":").trim();

    if (!group || !val) continue;

    if (group === "color") {
      result.colorKey = val;
    }

    if (group === "set") {
      result.setOptionKey = val;
    }
  }

  return result;
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
                "inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full",
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
  const searchParams = useSearchParams();

  const initialVariantFromUrl = searchParams?.get("variant") || "";

  const initialVariantSelection = useMemo(
    () => parseVariantParam(initialVariantFromUrl),
    [initialVariantFromUrl],
  );

  const { region } = useRegionLang();
  const currency: "RUB" | "UZS" = region === "ru" ? "RUB" : "UZS";

  const shop = useShopState();
  const { isFav, toggleFav, isInCart, addToCart, removeFromCart } = shop;

  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [collapsedSetItemIds, setCollapsedSetItemIds] = useState<string[]>([]);
  const [hoveredSetItemId, setHoveredSetItemId] = useState<string | null>(null);
  const [setItemsOpen, setSetItemsOpen] = useState(false);
  const [selectedSetItemId, setSelectedSetItemId] = useState<string | null>(
    null,
  );

  const allSetItems = useMemo(() => product.setItems ?? [], [product.setItems]);

  const { selectedByGroup, setSelectedByGroup, selectedVariants, groupsForUI } =
    useProductVariants(product, currency);

  useEffect(() => {
    if (!initialVariantSelection.colorKey) return;

    const colorKey = initialVariantSelection.colorKey;

    (
      setSelectedByGroup as React.Dispatch<
        React.SetStateAction<Record<string, unknown>>
      >
    )((prev) => {
      const prevRecord = isRecord(prev) ? prev : {};

      return {
        ...prevRecord,
        color: colorKey,
      };
    });
  }, [initialVariantSelection.colorKey, setSelectedByGroup]);

  const groupsForUIDisplay = useMemo(() => {
    if (!Array.isArray(groupsForUI)) return groupsForUI;

    return groupsForUI.map((group) => {
      if (!group || !Array.isArray(group.items)) return group;

      return {
        ...group,
        items: group.items.map((variant) => {
          if (!variant || variant.kind !== "color") return variant;

          return {
            ...variant,
            priceDeltaRUB: undefined,
            priceDeltaUZS: undefined,
          };
        }),
      };
    });
  }, [groupsForUI]);

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

  const selectedColorVariant = useMemo(() => {
    return selectedVariants.find((v) => v.kind === "color") ?? null;
  }, [selectedVariants]);

  const selectedColorKey = useMemo(() => {
    const rawFromVariant = selectedColorVariant?.id;
    if (rawFromVariant) return normalizeKey(rawFromVariant);

    const rawColor = selectedByGroup
      ? (selectedByGroup as Record<string, unknown>)["color"]
      : undefined;

    if (typeof rawColor === "string") return normalizeKey(rawColor);
    if (isRecord(rawColor)) return normalizeKey(rawColor.id);

    return "";
  }, [selectedColorVariant, selectedByGroup]);

  const visibleSetItems = useMemo(() => {
    if (!allSetItems.length) return [];

    const hasColorBoundItems = allSetItems.some((item) =>
      String(item.colorKey ?? "").trim(),
    );

    if (!hasColorBoundItems || !selectedColorKey) {
      return [...allSetItems].sort(
        (a, b) =>
          getFiniteNumber(a.quantity) - getFiniteNumber(b.quantity) ||
          String(a.title).localeCompare(String(b.title)),
      );
    }

    return allSetItems
      .filter((item) => {
        const itemColorKey = normalizeKey(item.colorKey);
        if (!itemColorKey) return true;
        return itemColorKey === selectedColorKey;
      })
      .sort(
        (a, b) =>
          getFiniteNumber(a.quantity) - getFiniteNumber(b.quantity) ||
          String(a.title).localeCompare(String(b.title)),
      );
  }, [allSetItems, selectedColorKey]);

  const hasSetItems = visibleSetItems.length > 0;

  const selectedSetItem = useMemo(() => {
    if (!visibleSetItems.length) return null;

    return (
      visibleSetItems.find((item) => item.id === selectedSetItemId) ??
      visibleSetItems[0] ??
      null
    );
  }, [visibleSetItems, selectedSetItemId]);

  const selectedSetItemLabel = useMemo(
    () => getSetItemOptionLabel(selectedSetItem),
    [selectedSetItem],
  );

  useEffect(() => {
    setCollapsedSetItemIds([]);
    setHoveredSetItemId(null);
    setSetItemsOpen(false);
    setSelectedSetItemId(null);
  }, [product.id]);

  useEffect(() => {
    if (!visibleSetItems.length) {
      setSelectedSetItemId(null);
      return;
    }

    const requestedOptionKey = initialVariantSelection.setOptionKey;

    if (requestedOptionKey) {
      const fromUrl = visibleSetItems.find(
        (item) =>
          normalizeKey(item.optionKey) === normalizeKey(requestedOptionKey) ||
          normalizeKey(item.id) === normalizeKey(requestedOptionKey),
      );

      if (fromUrl) {
        if (selectedSetItemId !== fromUrl.id) {
          setSelectedSetItemId(fromUrl.id);
        }
        return;
      }
    }

    const stillExists = visibleSetItems.some(
      (item) => item.id === selectedSetItemId,
    );

    if (!stillExists) {
      setSelectedSetItemId(visibleSetItems[0].id);
    }
  }, [
    visibleSetItems,
    selectedSetItemId,
    initialVariantSelection.setOptionKey,
  ]);

  const setItemKey = selectedSetItem
    ? `set:${selectedSetItem.optionKey || selectedSetItem.id}`
    : "no-set";

  const colorKeyForCart = selectedColorKey || "base-color";

  const cartVariantKey = useMemo(() => {
    const base = variantKey ?? `color:${colorKeyForCart}`;
    return hasSetItems ? `${base}|${setItemKey}` : base;
  }, [variantKey, colorKeyForCart, setItemKey, hasSetItems]);

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
        (groupsForUIDisplay as Array<{
          group: string;
          items: ProductVariant[];
        }>) ?? null,
    });
  }, [product, selectedByGroup, selectedVariants, groupsForUIDisplay]);

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

  const selectedSetItemGallery = useMemo(() => {
    if (selectedSetItem?.image) return [selectedSetItem.image];
    return null;
  }, [selectedSetItem]);

  const { gallery, activeIdx, setActiveIdx, onPrev, onNext } =
    useProductGallery(
      {
        id: product.id,
        image: product.image,
        gallery: product.gallery,
      },
      {
        variantGallery: selectedSetItemGallery ?? variantGallery,
        cacheKey: `${product.id}:${variantKey ?? "base"}:${setItemKey}`,
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

  const vk = cartVariantKey || undefined;

  const fav = isFav(product.id, vk);
  const inCart = isInCart(product.id, vk);

  const baseUnitPrice =
    currency === "RUB" ? product.price_rub : product.price_uzs;

  const selectedVariantFinalPrice = useMemo(() => {
    if (!selectedColorVariant) return null;

    const raw =
      currency === "RUB"
        ? selectedColorVariant.priceDeltaRUB
        : selectedColorVariant.priceDeltaUZS;

    const n = Number(raw);

    return Number.isFinite(n) && n > 0 ? n : null;
  }, [selectedColorVariant, currency]);

  const selectedSetItemPrice = useMemo(() => {
    if (!selectedSetItem) return 0;

    return currency === "RUB"
      ? getPositiveNumber(selectedSetItem.price_rub)
      : getPositiveNumber(selectedSetItem.price_uzs);
  }, [selectedSetItem, currency]);

  const unitPrice =
    selectedSetItemPrice > 0
      ? selectedSetItemPrice
      : (selectedVariantFinalPrice ?? baseUnitPrice);

  const finalUZS = useMemo(() => {
    const variantUZS = getPositiveNumber(selectedColorVariant?.priceDeltaUZS);
    const setItemUZS = getPositiveNumber(selectedSetItem?.price_uzs);

    if (setItemUZS > 0) return setItemUZS;
    if (variantUZS > 0) return variantUZS;
    return product.price_uzs;
  }, [selectedColorVariant, selectedSetItem, product.price_uzs]);

  const finalRUB = useMemo(() => {
    const variantRUB = getPositiveNumber(selectedColorVariant?.priceDeltaRUB);
    const setItemRUB = getPositiveNumber(selectedSetItem?.price_rub);

    if (setItemRUB > 0) return setItemRUB;
    if (variantRUB > 0) return variantRUB;
    return product.price_rub;
  }, [selectedColorVariant, selectedSetItem, product.price_rub]);

  const finalImage = useMemo(() => {
    const imageFromSetItem = selectedSetItem?.image || "";

    const imageFromVariant =
      Array.isArray(variantGallery) && variantGallery.length > 0
        ? variantGallery[0]
        : "";

    return imageFromSetItem || imageFromVariant || product.image || null;
  }, [selectedSetItem, variantGallery, product.image]);

  const collapsedSet = useMemo(
    () => new Set(collapsedSetItemIds),
    [collapsedSetItemIds],
  );

  const excludedOneSetSum = useMemo(() => {
    if (!product.isCollection) return 0;

    return visibleSetItems.reduce((sum, item) => {
      if (!collapsedSet.has(item.id)) return sum;

      const itemPrice =
        currency === "RUB"
          ? Number(item.price_rub ?? 0)
          : Number(item.price_uzs ?? 0);

      const itemQty = Math.max(1, Number(item.quantity ?? 1));
      return sum + itemPrice * itemQty;
    }, 0);
  }, [visibleSetItems, collapsedSet, currency, product.isCollection]);

  const displayUnitPrice = Math.max(0, unitPrice - excludedOneSetSum);
  const displayTotalPrice = displayUnitPrice * qty;

  const hoveredSetItem = useMemo(
    () => visibleSetItems.find((item) => item.id === hoveredSetItemId) ?? null,
    [visibleSetItems, hoveredSetItemId],
  );

  const toggleSetItemCollapsed = (itemId: string) => {
    setCollapsedSetItemIds((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
  };

  function saveCartMeta() {
    const variantTitle =
      [
        ...selectedVariants.map((v) => v.title).filter(Boolean),
        selectedSetItemLabel,
      ]
        .filter(Boolean)
        .join(", ") || null;

    const meta = {
      productId: product.id,
      variantId: vk ?? "base",
      variantTitle,
      title: product.title,
      href: `/product/${encodeURIComponent(product.id)}${
        vk ? `?variant=${encodeURIComponent(vk)}` : ""
      }`,
      imageUrl: finalImage,
      sku: displayArticle,
      price_uzs: finalUZS,
      price_rub: finalRUB,

      selectedColor: displayColor,
      selectedVariantKey: selectedColorVariant?.id ?? null,

      selectedSetItemId: selectedSetItem?.id ?? null,
      selectedSetItemTitle: selectedSetItemLabel,
      selectedSetItemOptionKey: selectedSetItem?.optionKey ?? null,
      selectedSetItemColorKey: selectedSetItem?.colorKey ?? null,
      selectedSetItemArticle: selectedSetItem?.article ?? null,
      selectedSetItemNote: selectedSetItem?.note ?? null,

      optionTitle: selectedSetItemLabel,
      optionKey: selectedSetItem?.optionKey ?? null,
      colorKey: selectedSetItem?.colorKey ?? selectedColorKey ?? null,

      quantity: qty,
    };

    upsertCartLineMeta(meta as Parameters<typeof upsertCartLineMeta>[0]);
  }

  const toggleFavorite = () => {
    saveCartMeta();
    toggleFav(product.id, vk);
  };

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
              "inline-flex cursor-pointer items-center gap-2 rounded-full border",
              "h-9 px-3 text-[11px] tracking-[0.16em] uppercase",
              "sm:h-11 sm:px-4 sm:py-2 sm:text-[12px]",
              "border-black/10 bg-white text-black/70",
              "transition hover:border-black/20 hover:text-black",
            )}
            type="button"
          >
            ← НАЗАД
          </button>

          <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
            <button
              onClick={toggleFavorite}
              className={cn(
                "inline-flex cursor-pointer items-center gap-2 rounded-full border",
                "h-9 px-3 text-[11px]",
                "sm:h-11 sm:px-4 sm:py-2 sm:text-[13px]",
                "border-black/10 bg-white text-black/75",
                "transition hover:border-black/20 hover:text-black",
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
                "inline-flex cursor-pointer items-center gap-2 rounded-full",
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
            key={`${product.id}-${gallery.length}-${variantKey ?? "base"}-${setItemKey}`}
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
                groups={groupsForUIDisplay}
                selectedByGroup={selectedByGroup}
                setSelectedByGroup={setSelectedByGroup}
                currency={currency}
              />
            </div>

            {hasSetItems ? (
              <div className="mt-3 rounded-2xl border border-black/10 bg-white p-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] tracking-[0.18em] uppercase text-black/40">
                      Комплектация
                    </div>
                    <div className="mt-1 text-[13px] font-semibold text-black">
                      {selectedSetItemLabel || "Выберите исполнение"}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setSetItemsOpen((v) => !v)}
                    className="inline-flex h-9 cursor-pointer items-center justify-center rounded-full border border-black/10 bg-white px-3 text-[12px] font-medium text-black/70 transition hover:border-black/20 hover:text-black"
                  >
                    {setItemsOpen ? "Скрыть" : "Изменить"}
                  </button>
                </div>
              </div>
            ) : null}

            <div className="mt-3 flex items-start justify-between gap-6">
              <div className="text-[28px] font-semibold text-black">
                {formatPrice(displayTotalPrice, currency)}
              </div>

              <div className="shrink-0">
                <div className="inline-flex h-10 items-center overflow-hidden border border-black/20 bg-white">
                  <button
                    onClick={() => setQty((v) => Math.max(1, v - 1))}
                    className="grid h-10 w-10 cursor-pointer place-items-center border-r border-black/20 transition hover:bg-black/[0.03]"
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
                    className="grid h-10 w-10 cursor-pointer place-items-center border-l border-black/20 transition hover:bg-black/[0.03]"
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
                  "inline-flex cursor-pointer items-center justify-center gap-2",
                  "h-12 flex-1 rounded-none",
                  "text-[13px] font-semibold transition active:scale-[0.99]",
                  inCart
                    ? "bg-emerald-600 text-white hover:bg-emerald-700"
                    : accent === "cappuccino"
                      ? "bg-[var(--acc)] text-white shadow-[0_16px_36px_var(--accSoft)] hover:brightness-[0.98]"
                      : "border border-black/20 bg-white text-black hover:bg-black/[0.02]",
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
                  saveCartMeta();
                  shop.setOneClick(product.id, qty, vk);
                  router.push("/checkout?mode=oneclick");
                }}
                style={accentVars}
                className={cn(
                  "h-12 flex-1 cursor-pointer rounded-none",
                  "text-[13px] font-semibold",
                  "transition active:scale-[0.99]",
                  "bg-black text-white hover:bg-black/90",
                )}
                type="button"
              >
                Купить в 1 клик
              </button>
            </div>

            {product.isCollection && hasSetItems ? (
              <section className="relative mt-6">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="text-[16px] font-semibold text-black sm:text-[18px]">
                    В комплектацию входит:
                  </h2>

                  {collapsedSetItemIds.length > 0 ? (
                    <div className="text-[12px] text-black/45">
                      Исключено: {collapsedSetItemIds.length}
                    </div>
                  ) : null}
                </div>

                {hoveredSetItem?.image ? (
                  <div className="pointer-events-none absolute right-[170px] top-10 z-30 hidden w-[240px] overflow-hidden rounded-[20px] border border-black/10 bg-white shadow-[0_24px_60px_-32px_rgba(0,0,0,0.35)] xl:block">
                    <div className="aspect-[4/3] bg-black/5">
                      <img
                        src={hoveredSetItem.image}
                        alt={hoveredSetItem.title}
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <div className="px-3 py-3">
                      <div className="text-[13px] font-semibold text-black">
                        {hoveredSetItem.title}
                      </div>
                      <div className="mt-1 text-[12px] text-black/50">
                        {hoveredSetItem.article || "Без артикула"}
                      </div>
                    </div>
                  </div>
                ) : null}

                <div className="space-y-2">
                  {visibleSetItems.map((item) => {
                    const itemPrice =
                      currency === "RUB"
                        ? Number(item.price_rub ?? 0)
                        : Number(item.price_uzs ?? 0);

                    const itemQty = Math.max(1, Number(item.quantity ?? 1));
                    const collapsed = collapsedSet.has(item.id);

                    return (
                      <div
                        key={item.id}
                        onMouseEnter={() => setHoveredSetItemId(item.id)}
                        onMouseLeave={() =>
                          setHoveredSetItemId((current) =>
                            current === item.id ? null : current,
                          )
                        }
                        className={cn(
                          "overflow-hidden rounded-[18px] border border-black/10 bg-white transition-all duration-300 ease-out",
                          "hover:border-black/20 hover:shadow-[0_12px_30px_-24px_rgba(0,0,0,0.22)]",
                          collapsed ? "px-3 py-2.5" : "px-3 py-3 sm:px-4",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => toggleSetItemCollapsed(item.id)}
                            className={cn(
                              "inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition",
                              collapsed
                                ? "border-black/15 bg-white text-black/70 hover:border-black/30 hover:bg-black/[0.03] hover:text-black"
                                : "border-black/15 bg-black/[0.04] text-black/80 hover:border-black/30 hover:bg-black/[0.07] hover:text-black",
                            )}
                            aria-label={
                              collapsed
                                ? `Вернуть в комплект ${item.title}`
                                : `Убрать из комплекта ${item.title}`
                            }
                            title={
                              collapsed
                                ? "Вернуть в комплект"
                                : "Убрать из комплекта"
                            }
                          >
                            {collapsed ? (
                              <Plus className="h-4 w-4" />
                            ) : (
                              <Minus className="h-4 w-4" />
                            )}
                          </button>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-2 shrink-0 rounded-full bg-black" />

                              {item.href ? (
                                <Link
                                  href={item.href}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="truncate text-[15px] font-semibold text-black underline-offset-4 hover:underline"
                                >
                                  {item.title}
                                  {itemQty > 1 ? ` × ${itemQty}` : ""}
                                </Link>
                              ) : (
                                <div className="truncate text-[15px] font-semibold text-black">
                                  {item.title}
                                  {itemQty > 1 ? ` × ${itemQty}` : ""}
                                </div>
                              )}
                            </div>

                            <div
                              className={cn(
                                "overflow-hidden transition-all duration-300 ease-out",
                                collapsed
                                  ? "max-h-0 translate-x-[-16px] opacity-0"
                                  : "mt-1 max-h-10 translate-x-0 opacity-100",
                              )}
                            >
                              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-black/50">
                                <span>
                                  Артикул:{" "}
                                  <span className="text-black/75">
                                    {item.article || "—"}
                                  </span>
                                </span>
                                {itemQty > 1 ? (
                                  <span>
                                    Кол-во:{" "}
                                    <span className="text-black/75">
                                      {itemQty}
                                    </span>
                                  </span>
                                ) : null}
                              </div>
                            </div>
                          </div>

                          <div
                            className={cn(
                              "shrink-0 overflow-hidden transition-all duration-300 ease-out",
                              collapsed
                                ? "max-w-0 translate-x-6 opacity-0"
                                : "max-w-[220px] translate-x-0 opacity-100",
                            )}
                          >
                            <div className="whitespace-nowrap rounded-full bg-black px-3 py-1.5 text-[13px] font-semibold text-white">
                              {itemPrice > 0
                                ? formatPrice(itemPrice * itemQty, currency)
                                : "—"}
                            </div>
                          </div>
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
                  "mt-6 block cursor-pointer rounded-3xl border border-black/10 bg-white p-3",
                  "shadow-[0_35px_110px_-85px_rgba(0,0,0,0.35)]",
                  "transition hover:border-black/20",
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

              {hasSetItems ? (
                <div className="flex items-start gap-3">
                  <div className="w-[120px] shrink-0 text-black/45">
                    Состав изделия
                  </div>

                  <div className="flex-1 border-b border-dotted border-black/20 pb-2">
                    <button
                      type="button"
                      onClick={() => setSetItemsOpen((v) => !v)}
                      className="inline-flex cursor-pointer items-center gap-2 text-black hover:text-black/70"
                    >
                      <span>
                        {selectedSetItemLabel || "Выберите комплектацию"}
                      </span>

                      <span className="inline-flex h-6 w-6 items-center justify-center rounded-md border border-black/20 bg-white">
                        {setItemsOpen ? (
                          <Minus className="h-3.5 w-3.5" />
                        ) : (
                          <Plus className="h-3.5 w-3.5" />
                        )}
                      </span>
                    </button>

                    <div
                      className={cn(
                        "overflow-hidden transition-all duration-300 ease-out",
                        setItemsOpen
                          ? "mt-3 max-h-[900px] opacity-100"
                          : "max-h-0 opacity-0",
                      )}
                    >
                      <div className="space-y-2">
                        {visibleSetItems.map((item) => {
                          const active = selectedSetItem?.id === item.id;
                          const itemQty = Math.max(
                            1,
                            Number(item.quantity ?? 1),
                          );

                          const itemPrice =
                            currency === "RUB"
                              ? getPositiveNumber(item.price_rub)
                              : getPositiveNumber(item.price_uzs);

                          return (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => setSelectedSetItemId(item.id)}
                              className={cn(
                                "flex w-full items-center gap-3 rounded-2xl border p-2.5 text-left transition",
                                active
                                  ? "border-black bg-black/[0.03] shadow-[0_14px_34px_-28px_rgba(0,0,0,0.35)]"
                                  : "border-black/10 bg-white hover:border-black/20 hover:bg-black/[0.015]",
                              )}
                            >
                              <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-black/[0.04]">
                                {item.image ? (
                                  <img
                                    src={item.image}
                                    alt={item.title}
                                    className="h-full w-full object-contain"
                                  />
                                ) : (
                                  <div className="grid h-full w-full place-items-center text-[9px] tracking-[0.16em] text-black/30">
                                    NO IMG
                                  </div>
                                )}

                                {active ? (
                                  <span className="absolute right-1 top-1 grid h-5 w-5 place-items-center rounded-full bg-black text-white">
                                    <Check className="h-3 w-3" />
                                  </span>
                                ) : null}
                              </div>

                              <div className="min-w-0 flex-1">
                                <div className="truncate text-[13px] font-semibold text-black">
                                  {item.title}
                                </div>

                                <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-black/45">
                                  <span>Артикул: {item.article || "—"}</span>
                                  <span>Кол-во: {itemQty}</span>
                                  {itemPrice > 0 ? (
                                    <span className="font-semibold text-black/70">
                                      {formatPrice(
                                        itemPrice * itemQty,
                                        currency,
                                      )}
                                    </span>
                                  ) : null}
                                </div>
                              </div>

                              <div
                                className={cn(
                                  "grid h-5 w-5 shrink-0 place-items-center rounded-full border",
                                  active
                                    ? "border-black bg-black text-white"
                                    : "border-black/20 bg-white text-transparent",
                                )}
                              >
                                <Check className="h-3 w-3" />
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>
              ) : null}

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
