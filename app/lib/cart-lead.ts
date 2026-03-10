"use client";

export const CART_LEAD_DONE_KEY = "lioneto:cart-lead:capture:v1";
export const CART_LEAD_DATA_KEY = "lioneto:cart-lead:data:v1";
export const CART_LINE_META_KEY = "lioneto:cart-line-meta:v1";
export const CART_ABANDONED_SENT_SIG_KEY = "lioneto:abandoned-cart:sent-sig:v1";
export const CART_ACTIVITY_TS_KEY = "lioneto:abandoned-cart:activity-ts:v1";

export type CartLeadData = {
  name: string;
  phone: string;
  createdAt: number;
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

export function upsertCartLineMeta(meta: CartLineMeta) {
  if (typeof window === "undefined") return;

  const productId = String(meta.productId ?? "").trim();
  const variantId = String(meta.variantId ?? "base").trim() || "base";
  if (!productId) return;

  const key = makeItemKey(productId, variantId);
  const prev = readCartLineMetaMap();

  prev[key] = {
    ...prev[key],
    ...meta,
    productId,
    variantId,
  };

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
    if ((qty ?? 0) > 0 && prev[key]) next[key] = prev[key];
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
        price_uzs: m?.price_uzs ?? 0,
        price_rub: m?.price_rub ?? 0,
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
      const productId = String(meta?.productId ?? key.split("::")[0] ?? "");
      const variantId = String(meta?.variantId ?? key.split("::")[1] ?? "base");

      const unit =
        args.region === "uz"
          ? Number(meta?.price_uzs ?? 0)
          : Number(meta?.price_rub ?? 0);

      return {
        productId,
        variantId,
        variantTitle: meta?.variantTitle ?? null,
        title: meta?.title ?? "Товар",
        imageUrl: meta?.imageUrl ?? null,
        href: meta?.href ?? null,
        qty: Number(qty ?? 0),
        unit: Number.isFinite(unit) ? unit : 0,
        sum: (Number.isFinite(unit) ? unit : 0) * Number(qty ?? 0),
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