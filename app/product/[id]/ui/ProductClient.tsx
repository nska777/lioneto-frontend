// app/product/[id]/ui/ProductClient.tsx
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

  variantSku?: string;

  priceDeltaRUB?: number;
  priceDeltaUZS?: number;
  priceDeltaKZ?: number;
  priceDeltaTJ?: number;

  dealerPriceRUB?: number;
  dealerPriceUZS?: number;
  dealerPriceKZ?: number;
  dealerPriceTJ?: number;

  image?: string;
  gallery?: string[];

  isActive?: boolean | null;
  isActiveUZ?: boolean | null;
  isActiveRU?: boolean | null;
  isDealerActive?: boolean | null;
};

type ProductSetItem = {
  id: string;
  title: string;
  article?: string;
  image?: string;

  price_rub?: number;
  price_uzs?: number;
  price_kz?: number;
  price_tj?: number;

  dealer_price_rub?: number;
  dealer_price_uzs?: number;
  dealer_price_kz?: number;
  dealer_price_tj?: number;

  href?: string;
  quantity?: number;

  groupKey?: string;
  groupTitle?: string;
  groupOrder?: number;
  sort_order?: number;

  selectionType?: string;
  isRequired?: boolean | null;
  itemKind?: string;

  addsToArticle?: boolean | null;
  articleJoinRule?: string;

  affectsImage?: boolean | null;
  assembledImage?: string;

  colorKey?: string;
  optionKey?: string;
  note?: string;

  isActive?: boolean | null;
  isActiveUZ?: boolean | null;
  isActiveRU?: boolean | null;
  isDealerActive?: boolean | null;
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
  price_kz: number;
  price_tj: number;

  old_price_rub?: number;
  old_price_uzs?: number;
  old_price_kz?: number;
  old_price_tj?: number;

  dealer_price_rub?: number;
  dealer_price_uzs?: number;
  dealer_price_kz?: number;
  dealer_price_tj?: number;

  isActive?: boolean | null;
  isActiveUZ?: boolean | null;
  isActiveRU?: boolean | null;

  description?: string;

  extra?: {
    article?: string;
    size?: string;
    color?: string;
    material?: string;
    module?: string;
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
    price_kz?: number;
    price_tj?: number;
    href: string;
    badge?: string;
    isActiveUZ?: boolean | null;
    isActiveRU?: boolean | null;
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
  hasDiscount?: boolean;
  collectionBadge?: string | null;
};

type Accent = "white" | "cappuccino" | "default";
type Region = "uz" | "ru" | "kz" | "tj";
type Currency = "RUB" | "UZS" | "KZT" | "TJS";
type LegacyCurrency = "RUB" | "UZS";

function getCurrencyByRegion(region: Region): Currency {
  if (region === "ru") return "RUB";
  if (region === "kz") return "KZT";
  if (region === "tj") return "TJS";
  return "UZS";
}

function getLegacyCurrency(currency: Currency): LegacyCurrency {
  return currency === "RUB" ? "RUB" : "UZS";
}

function formatRegionalPrice(value: number, currency: Currency) {
  const n = Number(value);

  if (!Number.isFinite(n) || n <= 0) return "Цена по запросу";

  if (currency === "RUB" || currency === "UZS") {
    return formatPrice(n, currency);
  }

  return new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency,
    currencyDisplay: "code",
    maximumFractionDigits: 0,
  }).format(n);
}

function getProductPrice(product: ProductPageModel, currency: Currency) {
  if (currency === "RUB") return getFiniteNumber(product.price_rub);
  if (currency === "KZT") return getFiniteNumber(product.price_kz);
  if (currency === "TJS") return getFiniteNumber(product.price_tj);
  return getFiniteNumber(product.price_uzs);
}

function getVariantFinalPrice(
  variant: ProductVariant | null,
  currency: Currency,
) {
  if (!variant) return null;

  const raw =
    currency === "RUB"
      ? variant.priceDeltaRUB
      : currency === "KZT"
        ? variant.priceDeltaKZ
        : currency === "TJS"
          ? variant.priceDeltaTJ
          : variant.priceDeltaUZS;

  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : null;
}

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

function getCompositeArticle(args: {
  baseArticle?: string | null;
  selectedColor?: string | null;
  selectedSetItems: ProductSetItem[];
}) {
  const base = String(args.baseArticle ?? "").trim();

  const setArticles = args.selectedSetItems
    .filter((item) => item.addsToArticle !== false)
    .map((item) => String(item.article ?? "").trim())
    .filter(Boolean);

  if (setArticles.length) {
    return [base || "—", ...setArticles].filter(Boolean).join(" + ");
  }

  return getDisplayArticle(base, args.selectedColor);
}

function getPositiveNumber(v: unknown) {
  const n = Number(v);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function getFiniteNumber(v: unknown) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function DiscountBadge({ percent }: { percent: number }) {
  return (
    <span className="inline-flex h-6 items-center rounded-[5px] bg-[#ffd7d7] px-2 text-[13px] font-medium leading-none text-[#ff4a4a]">
      -{percent}%
    </span>
  );
}

function FeatureBadge({ text }: { text: string }) {
  return (
    <span className="inline-flex h-6 items-center rounded-[5px] border border-[#c7e3ea] bg-[#eaf6f8] px-2 text-[12px] font-semibold leading-none text-[#5d8f9b]">
      {text}
    </span>
  );
}

function getSetItemOptionLabel(item?: ProductSetItem | null) {
  if (!item) return null;

  const title = String(item.title ?? "").trim();
  if (title) return title;

  const option = String(item.optionKey ?? "").trim();
  return option || null;
}

function getSetItemPrice(item: ProductSetItem, currency: Currency) {
  const raw =
    currency === "RUB"
      ? item.price_rub
      : currency === "KZT"
        ? item.price_kz
        : currency === "TJS"
          ? item.price_tj
          : item.price_uzs;

  const n = Number(raw);

  return Number.isFinite(n) ? n : 0;
}

function isSetItemAvailableForRegion(item: ProductSetItem, currency: Currency) {
  if (item.isActive === false) return false;

  if (currency === "RUB") {
    if (item.isActiveRU === false) return false;
    return true;
  }

  if (currency === "UZS") {
    if (item.isActiveUZ === false) return false;
    return true;
  }

  return true;
}

function parseVariantParam(raw: string) {
  const value = String(raw || "").trim();

  const result = {
    colorKey: "",
    setParts: [] as string[],
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
      result.setParts.push(val);
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

type SetItemGroup = {
  groupKey: string;
  groupTitle: string;
  groupOrder: number;
  items: ProductSetItem[];
};

function buildSetItemGroups(items: ProductSetItem[]) {
  const map = new Map<string, SetItemGroup>();

  for (const item of items) {
    const groupKey = String(item.groupKey || "default").trim() || "default";
    const groupTitle = String(item.groupTitle || groupKey).trim() || groupKey;
    const groupOrder = getFiniteNumber(item.groupOrder ?? 999);

    const current =
      map.get(groupKey) ??
      ({
        groupKey,
        groupTitle,
        groupOrder,
        items: [],
      } satisfies SetItemGroup);

    current.items.push(item);
    current.groupTitle = groupTitle;
    current.groupOrder = Math.min(current.groupOrder, groupOrder);

    map.set(groupKey, current);
  }

  return Array.from(map.values())
    .map((group) => ({
      ...group,
      items: [...group.items].sort((a, b) => {
        const sa = getFiniteNumber(a.sort_order ?? 999);
        const sb = getFiniteNumber(b.sort_order ?? 999);
        if (sa !== sb) return sa - sb;

        const qa = getFiniteNumber(a.quantity);
        const qb = getFiniteNumber(b.quantity);
        if (qa !== qb) return qa - qb;

        const pa = getFiniteNumber(a.price_uzs);
        const pb = getFiniteNumber(b.price_uzs);
        if (pa !== pb) return pa - pb;

        return String(a.title).localeCompare(String(b.title), "ru");
      }),
    }))
    .sort((a, b) => {
      if (a.groupOrder !== b.groupOrder) return a.groupOrder - b.groupOrder;
      return a.groupTitle.localeCompare(b.groupTitle, "ru");
    });
}

function getSceneSetItemMergeKey(item: ProductSetItem) {
  const title = normalizeKey(item.title);
  const article = normalizeKey(item.article);
  const groupKey = normalizeKey(item.groupKey || "scene");
  const optionKey = normalizeKey(item.optionKey);

  const priceUZS = getFiniteNumber(item.price_uzs);
  const priceRUB = getFiniteNumber(item.price_rub);

  return [groupKey, optionKey || title, article, priceUZS, priceRUB].join("__");
}

function mergeSceneSetItems(items: ProductSetItem[]) {
  const map = new Map<string, ProductSetItem & { sourceIds?: string[] }>();

  for (const item of items) {
    const key = getSceneSetItemMergeKey(item);
    const itemQty = Math.max(1, Number(item.quantity ?? 1));

    const existing = map.get(key);

    if (!existing) {
      map.set(key, {
        ...item,
        id: key,
        quantity: itemQty,
        sourceIds: [item.id],
      });
      continue;
    }

    existing.quantity = Math.max(1, Number(existing.quantity ?? 1)) + itemQty;

    existing.sourceIds = [...(existing.sourceIds ?? []), item.id];

    if (!existing.image && item.image) existing.image = item.image;
    if (!existing.assembledImage && item.assembledImage) {
      existing.assembledImage = item.assembledImage;
    }

    if (!existing.href && item.href) existing.href = item.href;
    if (!existing.note && item.note) existing.note = item.note;
  }

  return Array.from(map.values()).sort((a, b) => {
    const ga = getFiniteNumber(a.groupOrder ?? 999);
    const gb = getFiniteNumber(b.groupOrder ?? 999);
    if (ga !== gb) return ga - gb;

    const sa = getFiniteNumber(a.sort_order ?? 999);
    const sb = getFiniteNumber(b.sort_order ?? 999);
    if (sa !== sb) return sa - sb;

    return String(a.title).localeCompare(String(b.title), "ru");
  });
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

  const { region } = useRegionLang() as { region: Region };
  const currency = getCurrencyByRegion(region);
  const optionCurrency = getLegacyCurrency(currency);

  const shop = useShopState();
  const { isFav, toggleFav, isInCart, addToCart, removeFromCart } = shop;

  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [collapsedSetItemIds, setCollapsedSetItemIds] = useState<string[]>([]);
  const [hoveredSetItemId, setHoveredSetItemId] = useState<string | null>(null);
  const [setItemsOpen, setSetItemsOpen] = useState(false);
  const [selectedSetItemByGroup, setSelectedSetItemByGroup] = useState<
    Record<string, string>
  >({});

  const allSetItems = useMemo(() => product.setItems ?? [], [product.setItems]);

  const regionSetItems = useMemo(() => {
    return allSetItems.filter((item) =>
      isSetItemAvailableForRegion(item, currency),
    );
  }, [allSetItems, currency]);

  const { selectedByGroup, setSelectedByGroup, selectedVariants, groupsForUI } =
    useProductVariants(product, optionCurrency);

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
    if (!regionSetItems.length) return [];

    const hasColorBoundItems = regionSetItems.some((item) =>
      String(item.colorKey ?? "").trim(),
    );

    const list =
      !hasColorBoundItems || !selectedColorKey
        ? regionSetItems
        : regionSetItems.filter((item) => {
            const itemColorKey = normalizeKey(item.colorKey);
            if (!itemColorKey) return true;
            return itemColorKey === selectedColorKey;
          });

    return [...list].sort((a, b) => {
      const ga = getFiniteNumber(a.groupOrder ?? 999);
      const gb = getFiniteNumber(b.groupOrder ?? 999);
      if (ga !== gb) return ga - gb;

      const sa = getFiniteNumber(a.sort_order ?? 999);
      const sb = getFiniteNumber(b.sort_order ?? 999);
      if (sa !== sb) return sa - sb;

      const qa = getFiniteNumber(a.quantity);
      const qb = getFiniteNumber(b.quantity);
      if (qa !== qb) return qa - qb;

      return String(a.title).localeCompare(String(b.title), "ru");
    });
  }, [regionSetItems, selectedColorKey]);

  const isSceneProduct = useMemo(() => {
    const id = normalizeKey(product.id);
    const sku = normalizeKey(product.sku);
    const article = normalizeKey(product.extra?.article);
    const module = normalizeKey(product.extra?.module);

    return (
      product.isCollection === true ||
      id.startsWith("scene-") ||
      sku.startsWith("scene-") ||
      article.startsWith("scene-") ||
      module === "scene"
    );
  }, [
    product.id,
    product.sku,
    product.extra?.article,
    product.extra?.module,
    product.isCollection,
  ]);

  const sceneDisplaySetItems = useMemo(() => {
    if (!isSceneProduct) return visibleSetItems;
    return mergeSceneSetItems(visibleSetItems);
  }, [isSceneProduct, visibleSetItems]);

  const setItemGroups = useMemo(
    () =>
      buildSetItemGroups(
        isSceneProduct ? sceneDisplaySetItems : visibleSetItems,
      ),
    [isSceneProduct, sceneDisplaySetItems, visibleSetItems],
  );

  const hasSetItems = visibleSetItems.length > 0;

  useEffect(() => {
    setCollapsedSetItemIds([]);
    setHoveredSetItemId(null);
    setSetItemsOpen(false);
    setSelectedSetItemByGroup({});
  }, [product.id]);

  useEffect(() => {
    if (!setItemGroups.length) {
      setSelectedSetItemByGroup({});
      return;
    }

    setSelectedSetItemByGroup((current) => {
      const next: Record<string, string> = {};

      for (const group of setItemGroups) {
        const currentId = current[group.groupKey];
        const stillExists = group.items.some((item) => item.id === currentId);

        if (currentId && stillExists) {
          next[group.groupKey] = currentId;
          continue;
        }

        const requestedFromUrl = initialVariantSelection.setParts.find((part) =>
          group.items.some(
            (item) =>
              normalizeKey(item.optionKey) === normalizeKey(part) ||
              normalizeKey(item.id) === normalizeKey(part),
          ),
        );

        if (requestedFromUrl) {
          const fromUrl = group.items.find(
            (item) =>
              normalizeKey(item.optionKey) === normalizeKey(requestedFromUrl) ||
              normalizeKey(item.id) === normalizeKey(requestedFromUrl),
          );

          if (fromUrl) {
            next[group.groupKey] = fromUrl.id;
            continue;
          }
        }

        const first = group.items[0];
        if (first) {
          next[group.groupKey] = first.id;
        }
      }

      return next;
    });
  }, [setItemGroups, initialVariantSelection.setParts]);

  const selectedSetItems = useMemo(() => {
    const out: ProductSetItem[] = [];

    for (const group of setItemGroups) {
      const selectedId = selectedSetItemByGroup[group.groupKey];
      const item =
        group.items.find((x) => x.id === selectedId) ?? group.items[0] ?? null;

      if (item) out.push(item);
    }

    return out;
  }, [setItemGroups, selectedSetItemByGroup]);

  const collapsedSet = useMemo(
    () => new Set(collapsedSetItemIds),
    [collapsedSetItemIds],
  );

  const activeSceneSetItems = useMemo(() => {
    if (!isSceneProduct) return [];
    return sceneDisplaySetItems.filter((item) => !collapsedSet.has(item.id));
  }, [isSceneProduct, sceneDisplaySetItems, collapsedSet]);

  const excludedSceneSetItems = useMemo(() => {
    if (!isSceneProduct) return [];
    return sceneDisplaySetItems.filter((item) => collapsedSet.has(item.id));
  }, [isSceneProduct, sceneDisplaySetItems, collapsedSet]);

  const sceneTotalCount = useMemo(() => {
    if (!isSceneProduct) return 0;

    return sceneDisplaySetItems.reduce((sum, item) => {
      const itemQty = Math.max(1, Number(item.quantity ?? 1));
      return sum + itemQty;
    }, 0);
  }, [isSceneProduct, sceneDisplaySetItems]);

  const sceneActiveCount = useMemo(() => {
    if (!isSceneProduct) return 0;

    return activeSceneSetItems.reduce((sum, item) => {
      const itemQty = Math.max(1, Number(item.quantity ?? 1));
      return sum + itemQty;
    }, 0);
  }, [isSceneProduct, activeSceneSetItems]);

  const sceneExcludedCount = useMemo(() => {
    if (!isSceneProduct) return 0;

    return excludedSceneSetItems.reduce((sum, item) => {
      const itemQty = Math.max(1, Number(item.quantity ?? 1));
      return sum + itemQty;
    }, 0);
  }, [isSceneProduct, excludedSceneSetItems]);

  const selectedSetItemLabel = useMemo(() => {
    if (isSceneProduct) {
      if (!sceneTotalCount) return null;
      return `В комплекте: ${sceneActiveCount} из ${sceneTotalCount}`;
    }

    if (!selectedSetItems.length) return null;

    return selectedSetItems
      .map((item) => getSetItemOptionLabel(item))
      .filter(Boolean)
      .join(", ");
  }, [isSceneProduct, sceneTotalCount, sceneActiveCount, selectedSetItems]);

  const setItemKey = useMemo(() => {
    const itemsForKey = isSceneProduct
      ? sceneDisplaySetItems.filter(
          (item) => !collapsedSetItemIds.includes(item.id),
        )
      : selectedSetItems;

    if (!itemsForKey.length) return "no-set";

    return itemsForKey
      .map((item) => {
        const group = normalizeKey(item.groupKey || "set");
        const option = normalizeKey(item.optionKey || item.id);
        return `set:${group}-${option}`;
      })
      .join("|");
  }, [
    isSceneProduct,
    sceneDisplaySetItems,
    collapsedSetItemIds,
    selectedSetItems,
  ]);

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

  const baseArticleForDisplay = useMemo(() => {
    const variantSku = String(selectedColorVariant?.variantSku ?? "").trim();
    if (variantSku) return variantSku;

    return product.extra?.article || product.sku || "—";
  }, [selectedColorVariant?.variantSku, product.extra?.article, product.sku]);

  const displayArticle = useMemo(() => {
    return getCompositeArticle({
      baseArticle: baseArticleForDisplay,
      selectedColor: selectedColorVariant?.variantSku ? null : displayColor,
      selectedSetItems: isSceneProduct ? activeSceneSetItems : selectedSetItems,
    });
  }, [
    baseArticleForDisplay,
    selectedColorVariant?.variantSku,
    displayColor,
    selectedSetItems,
    isSceneProduct,
    activeSceneSetItems,
  ]);

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
    const withImage = [...selectedSetItems]
      .reverse()
      .find((item) => item.image);

    if (withImage?.image) return [withImage.image];

    return null;
  }, [selectedSetItems]);

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

  const baseUnitPrice = getProductPrice(product, currency);

  const selectedVariantFinalPrice = useMemo(() => {
    return getVariantFinalPrice(selectedColorVariant, currency);
  }, [selectedColorVariant, currency]);

  const selectedSetItemsSum = useMemo(() => {
    return selectedSetItems.reduce((sum, item) => {
      const itemPrice = getSetItemPrice(item, currency);
      const itemQty = Math.max(1, Number(item.quantity ?? 1));
      return sum + itemPrice * itemQty;
    }, 0);
  }, [selectedSetItems, currency]);

  const corpusUnitPrice = selectedVariantFinalPrice ?? baseUnitPrice;

  const excludedOneSetSum = useMemo(() => {
    if (!isSceneProduct) return 0;

    return excludedSceneSetItems.reduce((sum, item) => {
      const itemPrice = getSetItemPrice(item, currency);
      const itemQty = Math.max(1, Number(item.quantity ?? 1));
      return sum + itemPrice * itemQty;
    }, 0);
  }, [excludedSceneSetItems, currency, isSceneProduct]);

  const unitPrice = isSceneProduct
    ? Math.max(0, corpusUnitPrice - excludedOneSetSum)
    : corpusUnitPrice + selectedSetItemsSum;

  const displayUnitPrice = unitPrice;
  const displayTotalPrice = displayUnitPrice * qty;

  const finalUZS = useMemo(() => {
    const variantUZS = getPositiveNumber(selectedColorVariant?.priceDeltaUZS);
    const corpus = variantUZS > 0 ? variantUZS : product.price_uzs;

    if (isSceneProduct) {
      const excludedSum = excludedSceneSetItems.reduce((sum, item) => {
        const price = getSetItemPrice(item, "UZS");
        const itemQty = Math.max(1, Number(item.quantity ?? 1));
        return sum + price * itemQty;
      }, 0);

      return Math.max(0, corpus - excludedSum);
    }

    const setSum = selectedSetItems.reduce((sum, item) => {
      const price = getSetItemPrice(item, "UZS");
      const itemQty = Math.max(1, Number(item.quantity ?? 1));
      return sum + price * itemQty;
    }, 0);

    return corpus + setSum;
  }, [
    selectedColorVariant,
    selectedSetItems,
    product.price_uzs,
    isSceneProduct,
    excludedSceneSetItems,
  ]);

  const finalRUB = useMemo(() => {
    const variantRUB = getPositiveNumber(selectedColorVariant?.priceDeltaRUB);
    const corpus = variantRUB > 0 ? variantRUB : product.price_rub;

    if (isSceneProduct) {
      const excludedSum = excludedSceneSetItems.reduce((sum, item) => {
        const price = getSetItemPrice(item, "RUB");
        const itemQty = Math.max(1, Number(item.quantity ?? 1));
        return sum + price * itemQty;
      }, 0);

      return Math.max(0, corpus - excludedSum);
    }

    const setSum = selectedSetItems.reduce((sum, item) => {
      const price = getSetItemPrice(item, "RUB");
      const itemQty = Math.max(1, Number(item.quantity ?? 1));
      return sum + price * itemQty;
    }, 0);

    return corpus + setSum;
  }, [
    selectedColorVariant,
    selectedSetItems,
    product.price_rub,
    isSceneProduct,
    excludedSceneSetItems,
  ]);

  const finalKZ = useMemo(() => {
    const variantKZ = getPositiveNumber(selectedColorVariant?.priceDeltaKZ);
    const corpus = variantKZ > 0 ? variantKZ : product.price_kz;

    if (isSceneProduct) {
      const excludedSum = excludedSceneSetItems.reduce((sum, item) => {
        const price = getSetItemPrice(item, "KZT");
        const itemQty = Math.max(1, Number(item.quantity ?? 1));
        return sum + price * itemQty;
      }, 0);

      return Math.max(0, corpus - excludedSum);
    }

    const setSum = selectedSetItems.reduce((sum, item) => {
      const price = getSetItemPrice(item, "KZT");
      const itemQty = Math.max(1, Number(item.quantity ?? 1));
      return sum + price * itemQty;
    }, 0);

    return corpus + setSum;
  }, [
    selectedColorVariant,
    selectedSetItems,
    product.price_kz,
    isSceneProduct,
    excludedSceneSetItems,
  ]);

  const finalTJ = useMemo(() => {
    const variantTJ = getPositiveNumber(selectedColorVariant?.priceDeltaTJ);
    const corpus = variantTJ > 0 ? variantTJ : product.price_tj;

    if (isSceneProduct) {
      const excludedSum = excludedSceneSetItems.reduce((sum, item) => {
        const price = getSetItemPrice(item, "TJS");
        const itemQty = Math.max(1, Number(item.quantity ?? 1));
        return sum + price * itemQty;
      }, 0);

      return Math.max(0, corpus - excludedSum);
    }

    const setSum = selectedSetItems.reduce((sum, item) => {
      const price = getSetItemPrice(item, "TJS");
      const itemQty = Math.max(1, Number(item.quantity ?? 1));
      return sum + price * itemQty;
    }, 0);

    return corpus + setSum;
  }, [
    selectedColorVariant,
    selectedSetItems,
    product.price_tj,
    isSceneProduct,
    excludedSceneSetItems,
  ]);

  const finalImage = useMemo(() => {
    const imageFromSetItem =
      [...selectedSetItems]
        .reverse()
        .find((item) => item.affectsImage !== false && item.assembledImage)
        ?.assembledImage ||
      [...selectedSetItems]
        .reverse()
        .find((item) => item.affectsImage !== false && item.image)?.image ||
      "";

    const imageFromVariant =
      Array.isArray(variantGallery) && variantGallery.length > 0
        ? variantGallery[0]
        : "";

    return imageFromSetItem || imageFromVariant || product.image || null;
  }, [selectedSetItems, variantGallery, product.image]);

  const oldRubRaw = getPositiveNumber(product.old_price_rub);
  const oldUzsRaw = getPositiveNumber(product.old_price_uzs);
  const oldKzRaw = getPositiveNumber(product.old_price_kz);
  const oldTjRaw = getPositiveNumber(product.old_price_tj);

  const priceRubRaw = getPositiveNumber(product.price_rub);
  const priceUzsRaw = getPositiveNumber(product.price_uzs);
  const priceKzRaw = getPositiveNumber(product.price_kz);
  const priceTjRaw = getPositiveNumber(product.price_tj);

  const oldRubFallback = useMemo(() => {
    if (oldRubRaw > priceRubRaw && priceRubRaw > 0) return oldRubRaw;

    if (priceRubRaw > 0 && priceUzsRaw > 0 && oldUzsRaw > priceUzsRaw) {
      const multiplier = oldUzsRaw / priceUzsRaw;
      return Math.round(priceRubRaw * multiplier);
    }

    return 0;
  }, [oldRubRaw, oldUzsRaw, priceRubRaw, priceUzsRaw]);

  const oldUzsFallback = useMemo(() => {
    if (oldUzsRaw > priceUzsRaw && priceUzsRaw > 0) return oldUzsRaw;

    if (priceUzsRaw > 0 && priceRubRaw > 0 && oldRubRaw > priceRubRaw) {
      const multiplier = oldRubRaw / priceRubRaw;
      return Math.round(priceUzsRaw * multiplier);
    }

    return 0;
  }, [oldRubRaw, oldUzsRaw, priceRubRaw, priceUzsRaw]);

  const oldKzFallback = oldKzRaw > priceKzRaw && priceKzRaw > 0 ? oldKzRaw : 0;
  const oldTjFallback = oldTjRaw > priceTjRaw && priceTjRaw > 0 ? oldTjRaw : 0;

  const oldCorpusUnitPrice =
    currency === "RUB"
      ? oldRubFallback
      : currency === "KZT"
        ? oldKzFallback
        : currency === "TJS"
          ? oldTjFallback
          : oldUzsFallback;

  const hasProductDiscount =
    oldCorpusUnitPrice > 0 && oldCorpusUnitPrice > corpusUnitPrice;

  const displayOldUnitPrice = hasProductDiscount
    ? isSceneProduct
      ? Math.max(0, oldCorpusUnitPrice - excludedOneSetSum)
      : Math.max(0, oldCorpusUnitPrice + selectedSetItemsSum)
    : 0;

  const displayOldTotalPrice = displayOldUnitPrice * qty;

  const discountPercent =
    hasProductDiscount && oldCorpusUnitPrice > corpusUnitPrice
      ? Math.max(
          1,
          Math.min(
            99,
            Math.round((1 - corpusUnitPrice / oldCorpusUnitPrice) * 100),
          ),
        )
      : 0;

  const hoveredSetItem = useMemo(() => {
    const sourceItems = isSceneProduct ? sceneDisplaySetItems : visibleSetItems;
    return sourceItems.find((item) => item.id === hoveredSetItemId) ?? null;
  }, [isSceneProduct, sceneDisplaySetItems, visibleSetItems, hoveredSetItemId]);

  const toggleSetItemCollapsed = (itemId: string) => {
    setCollapsedSetItemIds((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId],
    );
  };

  function saveCartMeta() {
    const cartSetItems = isSceneProduct
      ? activeSceneSetItems
      : selectedSetItems;

    const selectedSetItemsTitle = cartSetItems
      .map((item) => {
        const itemQty = Math.max(1, Number(item.quantity ?? 1));
        return itemQty > 1 ? `${item.title} × ${itemQty}` : item.title;
      })
      .filter(Boolean)
      .join(", ");

    const selectedSetItemsArticle = cartSetItems
      .filter((item) => item.addsToArticle !== false)
      .map((item) => item.article)
      .filter(Boolean)
      .join(" + ");

    const variantTitle =
      [
        ...selectedVariants.map((v) => v.title).filter(Boolean),
        selectedSetItemsTitle,
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
      price_kz: finalKZ,
      price_tj: finalTJ,

      selectedColor: displayColor,
      selectedVariantKey: selectedColorVariant?.id ?? null,

      selectedSetItemId: cartSetItems.map((item) => item.id).join("|"),
      selectedSetItemTitle: selectedSetItemsTitle || null,
      selectedSetItemOptionKey: cartSetItems
        .map((item) => item.optionKey || item.id)
        .filter(Boolean)
        .join("|"),
      selectedSetItemColorKey:
        cartSetItems.find((item) => item.colorKey)?.colorKey ??
        selectedColorKey ??
        null,
      selectedSetItemArticle: selectedSetItemsArticle || null,
      selectedSetItemNote:
        cartSetItems
          .map((item) => item.note)
          .filter(Boolean)
          .join(", ") || null,

      optionTitle: selectedSetItemsTitle || null,
      optionKey: cartSetItems
        .map((item) => item.optionKey || item.id)
        .filter(Boolean)
        .join("|"),
      colorKey:
        cartSetItems.find((item) => item.colorKey)?.colorKey ??
        selectedColorKey ??
        null,

      quantity: qty,

      selectedSetItems: cartSetItems.map((item) => ({
        id: item.id,
        title: item.title,
        article: item.article ?? null,
        groupKey: item.groupKey ?? null,
        groupTitle: item.groupTitle ?? null,
        optionKey: item.optionKey ?? null,
        colorKey: item.colorKey ?? null,
        quantity: item.quantity ?? 1,
        price_uzs: item.price_uzs ?? null,
        price_rub: item.price_rub ?? null,
        price_kz: item.price_kz ?? null,
        price_tj: item.price_tj ?? null,
        image: item.image ?? null,
        assembledImage: item.assembledImage ?? null,
        addsToArticle: item.addsToArticle ?? true,
        affectsImage: item.affectsImage ?? true,
      })),
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

  const collectionName = String(product.brand || product.collectionLabel || "")
    .trim()
    .toUpperCase();

  const collectionBadge = String(product.collectionBadge || "").trim();

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
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {collectionName ? (
                <div className="inline-flex h-6 items-center rounded-[5px] border border-black/10 bg-white px-2 text-[11px] font-medium tracking-[0.14em] uppercase text-black/55">
                  Коллекция: {collectionName}
                </div>
              ) : null}

              {collectionBadge ? <FeatureBadge text={collectionBadge} /> : null}
            </div>

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
                currency={optionCurrency}
              />
            </div>

            {hasSetItems ? (
              <div className="mt-3 rounded-2xl border border-black/10 bg-white p-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-[10px] tracking-[0.18em] uppercase text-black/40">
                      Комплектация
                    </div>
                    <div className="mt-1 line-clamp-2 text-[13px] font-semibold text-black">
                      {selectedSetItemLabel || "Выберите исполнение"}
                    </div>
                  </div>

                  {isSceneProduct ? (
                    sceneExcludedCount > 0 ? (
                      <button
                        type="button"
                        onClick={() => setCollapsedSetItemIds([])}
                        className="inline-flex h-9 shrink-0 cursor-pointer items-center justify-center rounded-full bg-black px-3 text-[12px] font-semibold text-white transition hover:bg-black/85"
                      >
                        Вернуть все
                      </button>
                    ) : (
                      <div className="inline-flex h-9 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-emerald-50 px-3 text-[12px] font-semibold text-emerald-700">
                        Полный комплект
                      </div>
                    )
                  ) : (
                    <button
                      type="button"
                      onClick={() => setSetItemsOpen((v) => !v)}
                      className="inline-flex h-9 shrink-0 cursor-pointer items-center justify-center rounded-full border border-black/10 bg-white px-3 text-[12px] font-medium text-black/70 transition hover:border-black/20 hover:text-black"
                    >
                      {setItemsOpen ? "Скрыть" : "Изменить"}
                    </button>
                  )}
                </div>
              </div>
            ) : null}

            <div className="mt-3 flex items-start justify-between gap-6">
              <div>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
                  <div className="text-[28px] font-semibold text-black">
                    {formatRegionalPrice(displayTotalPrice, currency)}
                  </div>

                  {discountPercent > 0 ? (
                    <DiscountBadge percent={discountPercent} />
                  ) : null}

                  {displayOldTotalPrice > displayTotalPrice ? (
                    <div className="text-[18px] font-medium text-black/30 line-through">
                      {formatRegionalPrice(displayOldTotalPrice, currency)}
                    </div>
                  ) : null}
                </div>

                {hasSetItems ? (
                  <div className="mt-1 text-[12px] text-black/45">
                    {isSceneProduct
                      ? sceneExcludedCount > 0
                        ? `Цена пересчитана: исключено ${sceneExcludedCount} поз.`
                        : "Цена указана за полный комплект"
                      : `Корпус: ${formatRegionalPrice(corpusUnitPrice, currency)} + выбранная комплектация`}
                  </div>
                ) : null}
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

            {isSceneProduct && hasSetItems ? (
              <section className="relative mt-6">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[10px] tracking-[0.18em] uppercase text-black/40">
                      Комплектация
                    </div>
                    <h2 className="mt-1 text-[18px] font-semibold leading-tight text-black">
                      Что входит в комплект
                    </h2>
                  </div>

                  {collapsedSetItemIds.length > 0 ? (
                    <div className="text-[12px] text-black/45">
                      Исключено: {sceneExcludedCount}
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
                  {sceneDisplaySetItems.map((item) => {
                    const itemPrice = getSetItemPrice(item, currency);
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
                          "overflow-hidden rounded-[20px] border bg-white transition-all duration-300 ease-out",
                          collapsed
                            ? "border-black/10 bg-black/[0.025] opacity-75"
                            : "border-emerald-100 bg-emerald-50/35 hover:border-emerald-200 hover:shadow-[0_12px_30px_-24px_rgba(0,0,0,0.22)]",
                          "px-3 py-3 sm:px-4",
                        )}
                      >
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={() => toggleSetItemCollapsed(item.id)}
                            className={cn(
                              "inline-flex h-9 shrink-0 items-center justify-center gap-1.5 rounded-full border px-3 text-[12px] font-semibold transition",
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
                              <>
                                <Plus className="h-4 w-4 stroke-[2.5]" />
                                Вернуть
                              </>
                            ) : (
                              <>
                                <Minus className="h-4 w-4 stroke-[2.5]" />
                                Убрать
                              </>
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
                              {itemPrice !== 0
                                ? formatRegionalPrice(
                                    itemPrice * itemQty,
                                    currency,
                                  )
                                : "Без доплаты"}
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
                          ? "mt-3 max-h-[1400px] opacity-100"
                          : "max-h-0 opacity-0",
                      )}
                    >
                      <div className="space-y-4">
                        {setItemGroups.map((group) => (
                          <div key={group.groupKey}>
                            <div className="mb-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-black/45">
                              {group.groupTitle}
                            </div>

                            <div className="space-y-2">
                              {group.items.map((item) => {
                                const active =
                                  selectedSetItemByGroup[group.groupKey] ===
                                  item.id;

                                const itemQty = Math.max(
                                  1,
                                  Number(item.quantity ?? 1),
                                );

                                const itemPrice = getSetItemPrice(
                                  item,
                                  currency,
                                );

                                return (
                                  <button
                                    key={item.id}
                                    type="button"
                                    onClick={() =>
                                      setSelectedSetItemByGroup((prev) => ({
                                        ...prev,
                                        [group.groupKey]: item.id,
                                      }))
                                    }
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
                                        {itemQty > 1 ? ` × ${itemQty}` : ""}
                                      </div>

                                      <div className="mt-0.5 flex flex-wrap gap-x-3 gap-y-1 text-[12px] text-black/45">
                                        <span>
                                          Артикул: {item.article || "—"}
                                        </span>
                                        <span>Кол-во: {itemQty}</span>
                                        <span className="font-semibold text-black/70">
                                          {itemPrice !== 0
                                            ? `+ ${formatRegionalPrice(
                                                itemPrice * itemQty,
                                                currency,
                                              )}`
                                            : "Без доплаты"}
                                        </span>
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
                        ))}
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
          currency={optionCurrency}
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
