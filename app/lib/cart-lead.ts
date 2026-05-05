"use client";

export const CART_LEAD_DONE_KEY = "lioneto:cart-lead:capture:v1";
export const CART_LEAD_DATA_KEY = "lioneto:cart-lead:data:v1";
export const CART_LINE_META_KEY = "lioneto:cart-line-meta:v1";
export const CART_ABANDONED_SENT_SIG_KEY =
  "lioneto:abandoned-cart:sent-sig:v1";
export const CART_ACTIVITY_TS_KEY = "lioneto:abandoned-cart:activity-ts:v1";

export type CartLeadData = {
  name: string;
  phone: string;
  createdAt: number;
};

export type CartLineConstructorItem = {
  id: string | null;
  title: string | null;
  article: string | null;
  groupKey: string | null;
  groupTitle: string | null;
  optionKey: string | null;
  colorKey: string | null;
  quantity: number | null;
  price_uzs: number | null;
  price_rub: number | null;
  image: string | null;
};

export type CartLineMeta = {
  productId: string;
  variantId: string;

  title?: string | null;
  href?: string | null;
  imageUrl?: string | null;
  sku?: string | null;

  price_uzs?: number | null;
  price_rub?: number | null;

  variantTitle?: string | null;

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

  quantity?: number | null;

  selectedSetItems?: CartLineConstructorItem[] | null;
};

export type CartLineMetaMap = Record<string, CartLineMeta>;

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function cleanString(v: unknown): string | null {
  const s = typeof v === "string" ? v.trim() : "";
  return s ? s : null;
}

function cleanNumber(v: unknown): number | null {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : null;
}

function cleanConstructorItems(v: unknown): CartLineConstructorItem[] | null {
  if (!Array.isArray(v)) return null;

  const out: CartLineConstructorItem[] = [];

  for (const raw of v) {
    if (!raw || typeof raw !== "object") continue;

    const item = raw as Record<string, unknown>;

    const normalized: CartLineConstructorItem = {
      id: cleanString(item.id),
      title: cleanString(item.title),
      article: cleanString(item.article),
      groupKey: cleanString(item.groupKey),
      groupTitle: cleanString(item.groupTitle),
      optionKey: cleanString(item.optionKey),
      colorKey: cleanString(item.colorKey),
      quantity: cleanNumber(item.quantity),
      price_uzs: cleanNumber(item.price_uzs),
      price_rub: cleanNumber(item.price_rub),
      image: cleanString(item.image),
    };

    if (
      normalized.id ||
      normalized.title ||
      normalized.article ||
      normalized.groupKey ||
      normalized.optionKey
    ) {
      out.push(normalized);
    }
  }

  return out.length ? out : null;
}

export function makeItemKey(productId: string, variantId?: string) {
  const pid = String(productId ?? "").trim();
  const vid = String(variantId ?? "base").trim() || "base";

  return `${pid}::${vid}`;
}

export function hasCartLeadCapture(): boolean {
  if (typeof window === "undefined") return false;

  try {
    return localStorage.getItem(CART_LEAD_DONE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setCartLeadCaptureDone() {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(CART_LEAD_DONE_KEY, "1");
  } catch {}
}

export function saveCartLeadData(data: { name: string; phone: string }) {
  if (typeof window === "undefined") return;

  const payload: CartLeadData = {
    name: String(data.name ?? "").trim(),
    phone: String(data.phone ?? "").trim(),
    createdAt: Date.now(),
  };

  try {
    localStorage.setItem(CART_LEAD_DATA_KEY, JSON.stringify(payload));
    localStorage.setItem(CART_LEAD_DONE_KEY, "1");
  } catch {}
}

export function readCartLeadData(): CartLeadData | null {
  if (typeof window === "undefined") return null;

  try {
    const parsed = safeParse<CartLeadData | null>(
      localStorage.getItem(CART_LEAD_DATA_KEY),
      null,
    );

    if (!parsed) return null;

    const name = String(parsed.name ?? "").trim();
    const phone = String(parsed.phone ?? "").trim();
    const createdAt = Number(parsed.createdAt ?? 0);

    if (!name || !phone) return null;

    return {
      name,
      phone,
      createdAt: Number.isFinite(createdAt) ? createdAt : Date.now(),
    };
  } catch {
    return null;
  }
}

export function readCartLineMetaMap(): CartLineMetaMap {
  if (typeof window === "undefined") return {};

  try {
    return safeParse<CartLineMetaMap>(
      localStorage.getItem(CART_LINE_META_KEY),
      {},
    );
  } catch {
    return {};
  }
}

export function saveCartLineMetaMap(map: CartLineMetaMap) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(CART_LINE_META_KEY, JSON.stringify(map));
  } catch {}
}

export function readCartLineMeta(
  productId: string,
  variantId?: string,
): CartLineMeta | null {
  if (typeof window === "undefined") return null;

  const key = makeItemKey(productId, variantId);
  const map = readCartLineMetaMap();

  return map[key] ?? null;
}

export function upsertCartLineMeta(meta: CartLineMeta) {
  if (typeof window === "undefined") return;

  const productId = String(meta.productId ?? "").trim();
  const variantId = String(meta.variantId ?? "base").trim() || "base";

  if (!productId) return;

  const key = makeItemKey(productId, variantId);
  const prev = readCartLineMetaMap();
  const prevItem = prev[key];

  const selectedSetItems =
    cleanConstructorItems(meta.selectedSetItems) ??
    cleanConstructorItems(prevItem?.selectedSetItems);

  const normalized: CartLineMeta = {
    ...prevItem,
    ...meta,

    productId,
    variantId,

    title: cleanString(meta.title) ?? cleanString(prevItem?.title),
    href: cleanString(meta.href) ?? cleanString(prevItem?.href),
    imageUrl: cleanString(meta.imageUrl) ?? cleanString(prevItem?.imageUrl),
    sku: cleanString(meta.sku) ?? cleanString(prevItem?.sku),

    price_uzs:
      cleanNumber(meta.price_uzs) ?? cleanNumber(prevItem?.price_uzs) ?? null,
    price_rub:
      cleanNumber(meta.price_rub) ?? cleanNumber(prevItem?.price_rub) ?? null,

    variantTitle:
      cleanString(meta.variantTitle) ?? cleanString(prevItem?.variantTitle),

    selectedColor:
      cleanString(meta.selectedColor) ?? cleanString(prevItem?.selectedColor),

    selectedVariantKey:
      cleanString(meta.selectedVariantKey) ??
      cleanString(prevItem?.selectedVariantKey),

    selectedSetItemId:
      cleanString(meta.selectedSetItemId) ??
      cleanString(prevItem?.selectedSetItemId),

    selectedSetItemTitle:
      cleanString(meta.selectedSetItemTitle) ??
      cleanString(prevItem?.selectedSetItemTitle),

    selectedSetItemOptionKey:
      cleanString(meta.selectedSetItemOptionKey) ??
      cleanString(prevItem?.selectedSetItemOptionKey),

    selectedSetItemColorKey:
      cleanString(meta.selectedSetItemColorKey) ??
      cleanString(prevItem?.selectedSetItemColorKey),

    selectedSetItemArticle:
      cleanString(meta.selectedSetItemArticle) ??
      cleanString(prevItem?.selectedSetItemArticle),

    selectedSetItemNote:
      cleanString(meta.selectedSetItemNote) ??
      cleanString(prevItem?.selectedSetItemNote),

    optionTitle:
      cleanString(meta.optionTitle) ?? cleanString(prevItem?.optionTitle),

    optionKey: cleanString(meta.optionKey) ?? cleanString(prevItem?.optionKey),

    colorKey: cleanString(meta.colorKey) ?? cleanString(prevItem?.colorKey),

    quantity:
      cleanNumber(meta.quantity) ?? cleanNumber(prevItem?.quantity) ?? null,

    selectedSetItems,
  };

  prev[key] = normalized;

  saveCartLineMetaMap(prev);
}

export function removeCartLineMeta(productId: string, variantId?: string) {
  if (typeof window === "undefined") return;

  const key = makeItemKey(productId, variantId);
  const prev = readCartLineMetaMap();

  delete prev[key];

  saveCartLineMetaMap(prev);
}

export function pruneCartLineMeta(cart: Record<string, number>) {
  if (typeof window === "undefined") return;

  const next: CartLineMetaMap = {};
  const prev = readCartLineMetaMap();

  for (const [key, qty] of Object.entries(cart)) {
    if ((qty ?? 0) > 0 && prev[key]) {
      next[key] = prev[key];
    }
  }

  saveCartLineMetaMap(next);
}

export function touchCartActivity() {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(CART_ACTIVITY_TS_KEY, String(Date.now()));
  } catch {}
}

export function readCartActivityTs(): number {
  if (typeof window === "undefined") return 0;

  try {
    const raw = Number(localStorage.getItem(CART_ACTIVITY_TS_KEY) ?? 0);
    return Number.isFinite(raw) ? raw : 0;
  } catch {
    return 0;
  }
}

export function makeAbandonedSignature(args: {
  cart: Record<string, number>;
  metaMap: CartLineMetaMap;
  lead: CartLeadData | null;
}) {
  const entries = Object.entries(args.cart)
    .filter(([, qty]) => (qty ?? 0) > 0)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, qty]) => {
      const m = args.metaMap[key];

      return {
        key,
        qty,
        title: m?.title ?? "",
        variantTitle: m?.variantTitle ?? "",
        selectedColor: m?.selectedColor ?? "",
        selectedSetItemTitle: m?.selectedSetItemTitle ?? "",
        selectedSetItemOptionKey: m?.selectedSetItemOptionKey ?? "",
        selectedSetItemColorKey: m?.selectedSetItemColorKey ?? "",
        selectedSetItemArticle: m?.selectedSetItemArticle ?? "",
        optionTitle: m?.optionTitle ?? "",
        optionKey: m?.optionKey ?? "",
        colorKey: m?.colorKey ?? "",
        price_uzs: m?.price_uzs ?? 0,
        price_rub: m?.price_rub ?? 0,
        selectedSetItems:
          m?.selectedSetItems?.map((item) => ({
            id: item.id ?? "",
            title: item.title ?? "",
            article: item.article ?? "",
            groupKey: item.groupKey ?? "",
            groupTitle: item.groupTitle ?? "",
            optionKey: item.optionKey ?? "",
            colorKey: item.colorKey ?? "",
            quantity: item.quantity ?? 0,
            price_uzs: item.price_uzs ?? 0,
            price_rub: item.price_rub ?? 0,
          })) ?? [],
      };
    });

  return JSON.stringify({
    leadPhone: args.lead?.phone ?? "",
    items: entries,
  });
}

export function readLastAbandonedSignature(): string {
  if (typeof window === "undefined") return "";

  try {
    return localStorage.getItem(CART_ABANDONED_SENT_SIG_KEY) ?? "";
  } catch {
    return "";
  }
}

export function writeLastAbandonedSignature(sig: string) {
  if (typeof window === "undefined") return;

  try {
    localStorage.setItem(CART_ABANDONED_SENT_SIG_KEY, sig);
  } catch {}
}

export function clearAbandonedSignature() {
  if (typeof window === "undefined") return;

  try {
    localStorage.removeItem(CART_ABANDONED_SENT_SIG_KEY);
  } catch {}
}

export function buildAbandonedPayload(args: {
  cart: Record<string, number>;
  region: "ru" | "uz";
  pathname?: string;
}) {
  const lead = readCartLeadData();
  const metaMap = readCartLineMetaMap();

  const items = Object.entries(args.cart)
    .filter(([, qty]) => (qty ?? 0) > 0)
    .map(([key, qty]) => {
      const meta = metaMap[key];

      const rawProductId = key.split("::")[0] ?? "";
      const rawVariantId = key.split("::").slice(1).join("::") || "base";

      const productId = String(meta?.productId ?? rawProductId ?? "").trim();
      const variantId = String(meta?.variantId ?? rawVariantId ?? "base").trim();

      const unit =
        args.region === "uz"
          ? Number(meta?.price_uzs ?? 0)
          : Number(meta?.price_rub ?? 0);

      const safeUnit = Number.isFinite(unit) ? unit : 0;
      const safeQty = Number(qty ?? 0);

      return {
        productId,
        variantId,

        variantTitle: meta?.variantTitle ?? null,

        selectedColor: meta?.selectedColor ?? null,
        selectedVariantKey: meta?.selectedVariantKey ?? null,

        selectedSetItemId: meta?.selectedSetItemId ?? null,
        selectedSetItemTitle:
          meta?.selectedSetItemTitle ?? meta?.optionTitle ?? null,
        selectedSetItemOptionKey:
          meta?.selectedSetItemOptionKey ?? meta?.optionKey ?? null,
        selectedSetItemColorKey:
          meta?.selectedSetItemColorKey ?? meta?.colorKey ?? null,
        selectedSetItemArticle: meta?.selectedSetItemArticle ?? null,
        selectedSetItemNote: meta?.selectedSetItemNote ?? null,

        selectedSetItems: meta?.selectedSetItems ?? null,

        optionTitle: meta?.optionTitle ?? null,
        optionKey: meta?.optionKey ?? null,
        colorKey: meta?.colorKey ?? null,

        title: meta?.title ?? "Товар",
        imageUrl: meta?.imageUrl ?? null,
        href: meta?.href ?? null,
        sku: meta?.sku ?? null,

        qty: safeQty,
        unit: safeUnit,
        sum: safeUnit * safeQty,
      };
    })
    .filter((it) => it.qty > 0);

  const total = items.reduce((acc, it) => acc + (it.sum || 0), 0);

  const signature = makeAbandonedSignature({
    cart: args.cart,
    metaMap,
    lead,
  });

  return {
    lead,
    items,
    total,
    signature,
    pathname: args.pathname ?? "",
    region: args.region.toUpperCase(),
    createdAt: new Date().toISOString(),
  };
}