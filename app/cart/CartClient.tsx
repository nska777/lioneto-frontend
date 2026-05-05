"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, ArrowRight, ShoppingBag, ChevronLeft } from "lucide-react";

import { useRegionLang } from "../context/region-lang";
import { useShopState } from "../context/shop-state";
import {
  CATALOG_BY_ID,
  CATALOG_MOCK,
  BRANDS,
} from "../lib/mock/catalog-products";

import { fetchProductsMap, type LiteProduct } from "@/app/lib/strapi/products";

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

type Region = "uz" | "ru";
type CatalogProduct = (typeof CATALOG_MOCK)[number];

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function isString(v: unknown): v is string {
  return typeof v === "string";
}

function asString(v: unknown): string {
  return isString(v) ? v : "";
}

function getStr(p: unknown, key: string): string {
  if (!isRecord(p)) return "";
  return asString(p[key]);
}

function formatMoney(n: number, region: Region) {
  const v = Number.isFinite(Number(n)) ? Number(n) : 0;

  if (region === "uz") return new Intl.NumberFormat("ru-RU").format(v) + " сум";
  return new Intl.NumberFormat("ru-RU").format(v) + " ₽";
}

function labelByBrandSlug(slug: string | null | undefined) {
  const s = String(slug ?? "")
    .trim()
    .toLowerCase();

  if (!s) return null;

  const found = BRANDS.find((b) => String(b.slug).toLowerCase() === s);

  return found ? found.title : s.toUpperCase();
}

function SafeImg({ src, alt }: { src: string; alt: string }) {
  const [broken, setBroken] = React.useState(false);

  if (!src || broken) {
    return (
      <div className="absolute inset-0 grid place-items-center bg-black/5">
        <div className="text-[11px] tracking-[0.22em] text-black/35">
          NO IMAGE
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="absolute inset-0 h-full w-full object-contain"
      onError={() => setBroken(true)}
      loading="lazy"
    />
  );
}

type VariantAny = {
  id: string;
  title?: string;
  group?: string;
  priceDeltaRUB?: number;
  priceDeltaUZS?: number;
  image?: string | null;
  gallery?: string[];
};

type CartLineMeta = {
  productId?: string;
  variantId?: string;
  variantTitle?: string | null;
  title?: string;
  href?: string;
  imageUrl?: string | null;
  sku?: string;
  price_uzs?: number;
  price_rub?: number;

  selectedColor?: string | null;
  selectedVariantKey?: string | null;

  selectedSetItemId?: string | null;
  selectedSetItemTitle?: string | null;
  selectedSetItemOptionKey?: string | null;
  selectedSetItemColorKey?: string | null;
  selectedSetItemArticle?: string | null;
  selectedSetItemNote?: string | null;

  optionTitle?: string | null;
  optionKey?: string | null;
  colorKey?: string | null;

  quantity?: number;
};

type CartItem = {
  key: string;
  productId: string;
  variantId: string;
  variantTitle: string | null;
  selectedColor: string | null;
  selectedSetItemTitle: string | null;
  selectedSetItemOptionKey: string | null;
  selectedSetItemColorKey: string | null;
  displayArticle: string;
  product: CatalogProduct | LiteProduct;
  qty: number;
  unit: number;
  sum: number;
  image: string;
  collectionLabel: string | null;
};

function toNum(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function normalizeArticleColor(color?: string | null) {
  const value = String(color ?? "").trim();

  if (!value) return "";
  return value.charAt(0).toLowerCase() + value.slice(1);
}

function joinArticles(
  baseArticle?: string | null,
  childArticle?: string | null,
) {
  const base = String(baseArticle ?? "").trim();
  const child = String(childArticle ?? "").trim();

  if (base && child) return `${base} + ${child}`;
  if (base) return base;
  if (child) return child;

  return "—";
}

function getDisplayArticle(args: {
  baseArticle?: string | null;
  color?: string | null;
  selectedSetItemArticle?: string | null;
  metaSku?: string | null;
}) {
  const metaSku = String(args.metaSku ?? "").trim();

  /**
   * Если ProductClient уже сохранил полный артикул в meta.sku,
   * используем его как главный источник.
   */
  if (metaSku) return metaSku;

  const baseArticle = String(args.baseArticle ?? "").trim();
  const setArticle = String(args.selectedSetItemArticle ?? "").trim();

  if (setArticle) {
    return joinArticles(baseArticle, setArticle);
  }

  const normalizedColor = normalizeArticleColor(args.color);

  if (!baseArticle) return "—";
  if (!normalizedColor) return baseArticle;

  return `${baseArticle} (${normalizedColor})`;
}

function metaString(v: unknown): string | null {
  const s = typeof v === "string" ? v.trim() : "";

  return s ? s : null;
}

function asMetaRecord(v: unknown): CartLineMeta | null {
  if (!isRecord(v)) return null;

  return v as CartLineMeta;
}

function metaMatches(
  meta: CartLineMeta | null,
  productId: string,
  variantId: string,
) {
  if (!meta) return false;

  const mp = String(meta.productId ?? "").trim();
  const mv = String(meta.variantId ?? "base").trim() || "base";

  return mp === productId && mv === variantId;
}

function findMetaInValue(
  value: unknown,
  productId: string,
  variantId: string,
): CartLineMeta | null {
  if (!value) return null;

  if (Array.isArray(value)) {
    for (const item of value) {
      const meta = asMetaRecord(item);

      if (metaMatches(meta, productId, variantId)) return meta;
    }

    return null;
  }

  if (!isRecord(value)) return null;

  const directKeys = [
    `${productId}::${variantId}`,
    `${productId}|${variantId}`,
    `${productId}:${variantId}`,
    `${productId}__${variantId}`,
    `${productId}-${variantId}`,
  ];

  for (const key of directKeys) {
    const direct = asMetaRecord(value[key]);
    if (direct) return direct;
  }

  const nested = value[productId];

  if (isRecord(nested)) {
    const byVariant =
      asMetaRecord(nested[variantId]) ||
      asMetaRecord(nested[`variant:${variantId}`]) ||
      asMetaRecord(nested["base"]);

    if (byVariant) return byVariant;
  }

  for (const item of Object.values(value)) {
    const meta = asMetaRecord(item);

    if (metaMatches(meta, productId, variantId)) return meta;

    const nestedMeta = findMetaInValue(item, productId, variantId);
    if (nestedMeta) return nestedMeta;
  }

  return null;
}

function readCartLineMeta(
  productId: string,
  variantId: string,
): CartLineMeta | null {
  if (typeof window === "undefined") return null;

  const preferredKeys = [
    "lioneto:cart-line-meta:v1",
    "lioneto:cart:line-meta:v1",
    "lioneto:cart-line-meta",
    "lioneto:cart:meta",
    "cart-line-meta",
  ];

  for (const key of preferredKeys) {
    const raw = window.localStorage.getItem(key);
    if (!raw) continue;

    try {
      const parsed: unknown = JSON.parse(raw);
      const found = findMetaInValue(parsed, productId, variantId);

      if (found) return found;
    } catch {
      // ignore
    }
  }

  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (!key) continue;

    const lower = key.toLowerCase();

    if (
      !lower.includes("cart") &&
      !lower.includes("lead") &&
      !lower.includes("meta")
    ) {
      continue;
    }

    const raw = window.localStorage.getItem(key);
    if (!raw) continue;

    try {
      const parsed: unknown = JSON.parse(raw);
      const found = findMetaInValue(parsed, productId, variantId);

      if (found) return found;
    } catch {
      // ignore
    }
  }

  return null;
}

function readMetaPrice(meta: CartLineMeta | null, region: Region): number {
  if (!meta) return 0;

  const raw = region === "uz" ? meta.price_uzs : meta.price_rub;
  const n = Number(raw);

  return Number.isFinite(n) && n > 0 ? n : 0;
}

function flattenVariantsForCart(product: unknown): VariantAny[] {
  if (!isRecord(product)) return [];

  const raw = product.variants;
  if (!Array.isArray(raw)) return [];

  const first = raw[0];

  const looksGrouped =
    isRecord(first) && Array.isArray((first as Record<string, unknown>).items);

  if (looksGrouped) {
    const out: VariantAny[] = [];

    for (const g of raw) {
      if (!isRecord(g)) continue;

      const group = String(g.group ?? "").trim();
      const itemsRaw = g.items;
      const items = Array.isArray(itemsRaw) ? itemsRaw : [];

      for (const it of items) {
        if (!isRecord(it)) continue;

        const id = String(it.id ?? "").trim();
        if (!id) continue;

        const localGroup =
          String(it.group ?? group ?? "").trim() || (group ? group : undefined);

        out.push({
          id,
          title: isString(it.title) ? it.title : undefined,
          group: localGroup,
          priceDeltaRUB: toNum(it.priceDeltaRUB),
          priceDeltaUZS: toNum(it.priceDeltaUZS),
          image: isString(it.image) ? it.image : null,
          gallery: Array.isArray(it.gallery)
            ? (it.gallery.filter(
                (x): x is string => typeof x === "string",
              ) as string[])
            : undefined,
        });
      }
    }

    return out;
  }

  return raw
    .map((v): VariantAny | null => {
      if (!isRecord(v)) return null;

      const id = String(v.id ?? "").trim();
      if (!id) return null;

      const title = isString(v.title) ? v.title : undefined;
      const group = isString(v.group) ? v.group.trim() : undefined;

      const priceDeltaRUB = toNum(v.priceDeltaRUB);
      const priceDeltaUZS = toNum(v.priceDeltaUZS);

      const image = isString(v.image) ? v.image : null;

      const gallery = Array.isArray(v.gallery)
        ? v.gallery.filter((x): x is string => typeof x === "string")
        : undefined;

      return {
        id,
        title,
        group,
        priceDeltaRUB,
        priceDeltaUZS,
        image,
        gallery,
      };
    })
    .filter((x): x is VariantAny => x !== null);
}

function findVariantForPart(
  part: string,
  variants: VariantAny[],
): VariantAny | undefined {
  const p = String(part ?? "").trim();
  if (!p) return undefined;

  const hasColon = p.includes(":");
  const group = hasColon ? String(p.split(":")[0] ?? "").trim() : "";
  const val = hasColon ? String(p.split(":")[1] ?? "").trim() : p;

  let found =
    variants.find((v) => String(v.id) === p) ||
    variants.find((v) => String(v.id) === val);

  if (found) return found;

  if (group) {
    found = variants.find(
      (v) =>
        String(v.group ?? "").trim() === group && String(v.id).trim() === val,
    );

    if (found) return found;
  }

  if (group) {
    found = variants.find((v) => {
      const vid = String(v.id ?? "").trim();

      if (!vid.includes(":")) return false;

      const [vg, vv] = vid.split(":");

      return String(vg).trim() === group && String(vv).trim() === val;
    });

    if (found) return found;
  }

  found = variants.find((v) => {
    const vid = String(v.id ?? "").trim();

    if (!vid.includes(":")) return false;

    const tail = vid.split(":").pop();

    return String(tail ?? "").trim() === val;
  });

  return found;
}

function prettyVariantToken(token: string) {
  const t = String(token || "")
    .trim()
    .toLowerCase();

  const map: Record<string, string> = {
    white: "Белый",
    black: "Чёрный",
    beige: "Бежевый",
    gray: "Серый",
    grey: "Серый",
    cappuccino: "Капучино",
    capuccino: "Капучино",
    "beige-pink": "Бежевая роза",
    rose: "Роза",
    pink: "Розовый",
    walnut: "Орех",
    oak: "Дуб",
    "gluhie-fasady": "Глухие фасады",
    "zerkalnye-fasady": "Зеркальные фасады",
    "bez-paspartu": "Без паспарту",
    "s-paspartu": "С паспарту",
    "bez-ramki": "Без рамки паспарту",
    "s-ramkoy": "С рамкой паспарту",
  };

  return map[t] ?? token;
}

function fallbackVariantTitleFromId(variantId: string) {
  const raw = String(variantId ?? "").trim();

  if (!raw || raw === "base") return null;

  const parts = raw
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);

  const labels = parts
    .map((p) => {
      const val = p.includes(":") ? p.split(":").slice(1).join(":") : p;

      return prettyVariantToken(String(val || "").trim());
    })
    .filter(Boolean);

  const title = labels.join(", ");

  return title || null;
}

function parseCompositeVariantForCart(
  variantId: string,
  variants: VariantAny[],
) {
  const raw = String(variantId ?? "").trim();

  if (!raw || raw === "base") {
    return {
      title: null as string | null,
      image: null as string | null,
      finalPriceUZS: 0,
      finalPriceRUB: 0,
    };
  }

  const parts = raw
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);

  const picked: VariantAny[] = [];

  for (const part of parts) {
    const found = findVariantForPart(part, variants);

    if (found) picked.push(found);
  }

  const title =
    picked
      .map((v) => (v.title ? String(v.title).trim() : ""))
      .filter(Boolean)
      .join(", ") || fallbackVariantTitleFromId(raw);

  const image =
    picked.find((v) => Array.isArray(v.gallery) && v.gallery.length)
      ?.gallery?.[0] ??
    picked.find((v) => !!v.image)?.image ??
    null;

  const finalPriceUZS =
    picked.map((v) => toNum(v.priceDeltaUZS)).find((price) => price > 0) || 0;

  const finalPriceRUB =
    picked.map((v) => toNum(v.priceDeltaRUB)).find((price) => price > 0) || 0;

  return {
    title: title || null,
    image,
    finalPriceUZS,
    finalPriceRUB,
  };
}

function itemSafeTitle(p: unknown) {
  const t = isRecord(p) ? p.title : undefined;

  return typeof t === "string" ? t : "";
}

function readPriceFromObj(obj: unknown, region: Region) {
  if (!isRecord(obj)) return 0;

  const uz = obj.priceUZS ?? obj.price_uzs ?? obj.priceUzs ?? null;
  const ru = obj.priceRUB ?? obj.price_rub ?? obj.priceRub ?? null;

  const raw = region === "uz" ? uz : ru;
  const n = typeof raw === "number" ? raw : Number(raw);

  return Number.isFinite(n) && n > 0 ? n : 0;
}

function readBrandSlug(p: unknown): string {
  if (!isRecord(p)) return "";

  return asString(p.brand);
}

function readFirstImage(p: unknown): string {
  if (!isRecord(p)) return "";

  const img = p.image;
  if (typeof img === "string") return img;

  const g = p.gallery;

  if (Array.isArray(g)) {
    const first = g.find(
      (x): x is string => typeof x === "string" && !!x.trim(),
    );

    return first ? first : "";
  }

  return "";
}

function readArticle(p: unknown): string {
  if (!isRecord(p)) return "";

  return (
    asString(p.sku).trim() ||
    asString(p.article).trim() ||
    asString(p.id).trim()
  );
}

export default function CartClient() {
  const router = useRouter();
  const { region } = useRegionLang();
  const shop = useShopState();

  const goBack = () => {
    if (typeof window === "undefined") return;

    if (window.history.length > 1) router.back();
    else router.push("/catalog");
  };

  const keys = useMemo(() => {
    return Object.keys(shop.cart).filter((k) => (shop.cart[k] ?? 0) > 0);
  }, [shop.cart]);

  const productIds = useMemo(() => {
    return keys
      .map((key) => String(shop.parseKey(key).productId))
      .filter(Boolean);
  }, [keys, shop]);

  const [productsMap, setProductsMap] = useState<Record<string, LiteProduct>>(
    {},
  );

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const ids = Array.from(new Set(productIds.filter(Boolean)));

        if (ids.length === 0) {
          if (alive) setProductsMap({});
          return;
        }

        const m = await fetchProductsMap(ids);

        if (alive) setProductsMap(m);
      } catch {
        if (alive) setProductsMap({});
      }
    })();

    return () => {
      alive = false;
    };
  }, [productIds.join("|")]);

  const items = useMemo((): CartItem[] => {
    return keys
      .map((key) => {
        const parsedKey = shop.parseKey(key);
        const pid = String(parsedKey.productId);
        const vidRaw = String(parsedKey.variantId || "base") || "base";

        const meta = readCartLineMeta(pid, vidRaw);

        const pMockUnknown = CATALOG_BY_ID.get(pid) as unknown;
        const pStrapi = productsMap[pid] as LiteProduct | undefined;

        const pDisplay: unknown = (pStrapi ?? pMockUnknown) as unknown;
        if (!pDisplay) return null;

        const pForCalc: unknown = (pStrapi ??
          pMockUnknown ??
          pDisplay) as unknown;

        const qty = Math.max(1, Math.floor(Number(shop.cart[key] ?? 1)));

        const variants: VariantAny[] = flattenVariantsForCart(pForCalc);
        const parsedVariant = parseCompositeVariantForCart(vidRaw, variants);

        const baseFromStrapi = readPriceFromObj(pStrapi, region);
        const baseFromMocks = readPriceFromObj(pMockUnknown, region);
        const baseUnit = baseFromStrapi || baseFromMocks || 0;

        const selectedVariantFinalPrice =
          region === "uz"
            ? parsedVariant.finalPriceUZS
            : parsedVariant.finalPriceRUB;

        const metaUnit = readMetaPrice(meta, region);

        const unit =
          metaUnit > 0
            ? metaUnit
            : selectedVariantFinalPrice > 0
              ? selectedVariantFinalPrice
              : baseUnit;

        const metaImage = metaString(meta?.imageUrl);

        const image =
          metaImage ||
          (parsedVariant.image ? String(parsedVariant.image) : "") ||
          readFirstImage(pStrapi) ||
          readFirstImage(pDisplay);

        const brandSlug = readBrandSlug(pDisplay) || readBrandSlug(pStrapi);
        const collectionLabel = labelByBrandSlug(brandSlug);

        const title =
          metaString(meta?.title) ||
          itemSafeTitle(pStrapi) ||
          itemSafeTitle(pDisplay) ||
          "Товар";

        const selectedColor = metaString(meta?.selectedColor);

        const selectedSetItemTitle =
          metaString(meta?.selectedSetItemTitle) ||
          metaString(meta?.optionTitle);

        const selectedSetItemOptionKey =
          metaString(meta?.selectedSetItemOptionKey) ||
          metaString(meta?.optionKey);

        const selectedSetItemColorKey =
          metaString(meta?.selectedSetItemColorKey) ||
          metaString(meta?.colorKey);

        const variantTitle =
          [selectedColor, selectedSetItemTitle].filter(Boolean).join(", ") ||
          metaString(meta?.variantTitle) ||
          parsedVariant.title;

        const baseArticle =
          readArticle(pStrapi) ||
          readArticle(pMockUnknown) ||
          readArticle(pDisplay);

        const displayArticle = getDisplayArticle({
          baseArticle,
          color: selectedColor || parsedVariant.title,
          selectedSetItemArticle: metaString(meta?.selectedSetItemArticle),
          metaSku: metaString(meta?.sku),
        });

        const productForUI: CatalogProduct | LiteProduct = isRecord(pDisplay)
          ? ({
              ...(pDisplay as Record<string, unknown>),
              title,
            } as unknown as CatalogProduct | LiteProduct)
          : (pStrapi ?? ({} as LiteProduct));

        return {
          key,
          productId: pid,
          variantId: vidRaw,
          variantTitle,
          selectedColor,
          selectedSetItemTitle,
          selectedSetItemOptionKey,
          selectedSetItemColorKey,
          displayArticle,
          product: productForUI,
          qty,
          unit,
          sum: unit * qty,
          image: String(image || ""),
          collectionLabel,
        };
      })
      .filter((x): x is CartItem => !!x);
  }, [keys, shop, shop.cart, region, productsMap]);

  const total = useMemo(
    () => items.reduce((acc, it) => acc + (Number(it.sum) || 0), 0),
    [items],
  );

  const remove = (productId: string, variantId: string) => {
    shop.removeFromCart(productId, variantId);
  };

  const clear = () => {
    shop.clearCart();
  };

  const changeQty = (productId: string, variantId: string, nextQty: number) => {
    shop.setCartQty(productId, nextQty, variantId);
  };

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={goBack}
            className={cn(
              "inline-flex cursor-pointer items-center gap-2 rounded-full",
              "border border-black/10 bg-white px-4 py-2 text-sm text-black/70",
              "transition hover:border-black/20 hover:text-black",
            )}
            aria-label="Назад"
            title="Назад"
          >
            <ChevronLeft className="h-4 w-4" />
            Назад
          </button>

          <div className="mt-4 text-[12px] tracking-[0.28em] text-black/45">
            LIONETO
          </div>

          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">
            Корзина
          </h1>

          <p className="mt-2 text-sm text-black/55">
            {items.length
              ? `Товаров: ${items.length}`
              : "Пока пусто — добавь товары из каталога."}
          </p>
        </div>

        {items.length > 0 ? (
          <button
            onClick={clear}
            className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-black/75 transition hover:border-black/20 hover:text-black"
            type="button"
          >
            <Trash2 className="h-4 w-4" />
            Очистить
          </button>
        ) : null}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="rounded-3xl border border-black/10 bg-white p-8">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-black/5">
                  <ShoppingBag className="h-6 w-6 text-black/60" />
                </div>

                <div>
                  <div className="text-base font-medium">Корзина пустая</div>
                  <div className="text-sm text-black/55">
                    Перейди в каталог и добавь товары.
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  href="/catalog"
                  className="inline-flex cursor-pointer items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-medium text-white transition hover:opacity-90"
                >
                  В каталог <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : (
            items.map((it) => {
              const productHref =
                it.variantId && it.variantId !== "base"
                  ? `/product/${encodeURIComponent(
                      it.productId,
                    )}?variant=${encodeURIComponent(it.variantId)}`
                  : `/product/${encodeURIComponent(it.productId)}`;

              return (
                <div
                  key={it.key}
                  className="rounded-3xl border border-black/10 bg-white p-4 md:p-5"
                >
                  <div className="flex gap-4">
                    <Link
                      href={productHref}
                      className="relative h-24 w-24 shrink-0 cursor-pointer overflow-hidden rounded-2xl bg-black/5"
                    >
                      <SafeImg
                        src={it.image}
                        alt={getStr(it.product, "title") || "Товар"}
                      />
                    </Link>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <Link
                            href={productHref}
                            className="block cursor-pointer truncate text-base font-medium tracking-[-0.01em] hover:underline"
                          >
                            {it.collectionLabel ? (
                              <span className="text-black/55">
                                {it.collectionLabel} /{" "}
                              </span>
                            ) : null}
                            {getStr(it.product, "title") || "Товар"}
                          </Link>

                          <div className="mt-1 text-[12px] text-black/45">
                            Артикул: {it.displayArticle}
                          </div>

                          {it.selectedColor ? (
                            <div className="mt-1 text-[12px] text-black/55">
                              Цвет:{" "}
                              <span className="font-semibold text-black/75">
                                {it.selectedColor}
                              </span>
                            </div>
                          ) : null}

                          {it.selectedSetItemTitle ? (
                            <div className="mt-1 text-[12px] text-black/55">
                              Комплектация:{" "}
                              <span className="font-semibold text-black/75">
                                {it.selectedSetItemTitle}
                              </span>
                            </div>
                          ) : it.variantTitle && it.variantId !== "base" ? (
                            <div className="mt-1 text-[12px] text-black/55">
                              Вариант:{" "}
                              <span className="font-semibold text-black/75">
                                {it.variantTitle}
                              </span>
                            </div>
                          ) : null}

                          {it.selectedSetItemOptionKey ? (
                            <div className="mt-1 text-[11px] text-black/35">
                              optionKey: {it.selectedSetItemOptionKey}
                            </div>
                          ) : null}

                          <div className="mt-1 text-xs text-black/35">
                            ID: {it.productId}
                          </div>
                        </div>

                        <button
                          onClick={() => remove(it.productId, it.variantId)}
                          className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full border border-black/10 bg-white text-black/65 transition hover:border-black/20 hover:text-black"
                          aria-label="Удалить"
                          title="Удалить"
                          type="button"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                        <div className="inline-flex items-center rounded-full border border-black/10 bg-white p-1">
                          <button
                            className="h-9 w-9 cursor-pointer rounded-full text-black/70 transition hover:text-black"
                            onClick={() =>
                              changeQty(it.productId, it.variantId, it.qty - 1)
                            }
                            aria-label="Уменьшить количество"
                            title="Уменьшить"
                            type="button"
                          >
                            −
                          </button>

                          <div className="min-w-[44px] text-center text-sm font-medium">
                            {it.qty}
                          </div>

                          <button
                            className="h-9 w-9 cursor-pointer rounded-full text-black/70 transition hover:text-black"
                            onClick={() =>
                              changeQty(it.productId, it.variantId, it.qty + 1)
                            }
                            aria-label="Увеличить количество"
                            title="Увеличить"
                            type="button"
                          >
                            +
                          </button>
                        </div>

                        <div className="text-right">
                          <div className="text-sm text-black/55">
                            {formatMoney(it.unit, region)} × {it.qty}
                          </div>

                          <div className="text-lg font-semibold tracking-[-0.02em]">
                            {formatMoney(it.sum, region)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <aside className="h-fit rounded-3xl border border-black/10 bg-white p-5">
          <div className="text-base font-semibold tracking-[-0.01em]">
            Итого
          </div>

          <div className="mt-3 flex items-center justify-between text-sm text-black/60">
            <span>Сумма</span>
            <span className="font-medium text-black/80">
              {formatMoney(total, region)}
            </span>
          </div>

          <div className="mt-5 h-px bg-black/10" />

          <div className="mt-5 space-y-3">
            <Link
              href="/checkout"
              className={cn(
                "inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition",
                items.length
                  ? "bg-black text-white hover:opacity-90"
                  : "pointer-events-none bg-black/10 text-black/40",
              )}
            >
              Оформить заказ <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/catalog"
              className="inline-flex w-full cursor-pointer items-center justify-center rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-medium text-black/75 transition hover:border-black/20 hover:text-black"
            >
              Продолжить покупки
            </Link>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-black/45">
            * Доставка и сборка считаются на этапе оформления.
          </p>
        </aside>
      </div>
    </main>
  );
}
