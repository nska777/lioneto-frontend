import type { AddonDraft, DealerOrder, ProductDraft } from "./types";

export const STORAGE_KEYS = {
  cart: "dealer-order-cart-product-ids",
  drafts: "dealer-order-product-drafts",
  addonDrafts: "dealer-order-addon-drafts",
  globalMarkup: "dealer-order-global-markup",
  country: "dealer-order-country",
  orders: "dealer-orders",
} as const;

export function loadCartProductIds(): string[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.cart);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];

    return parsed.filter((item): item is string => typeof item === "string");
  } catch {
    return [];
  }
}

export function saveCartProductIds(value: string[]) {
  localStorage.setItem(STORAGE_KEYS.cart, JSON.stringify(value));
}

export function loadDrafts(): Record<string, ProductDraft> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.drafts);
    if (!raw) return {};

    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};

    return parsed as Record<string, ProductDraft>;
  } catch {
    return {};
  }
}

export function saveDrafts(value: Record<string, ProductDraft>) {
  localStorage.setItem(STORAGE_KEYS.drafts, JSON.stringify(value));
}

export function loadAddonDrafts(): Record<string, AddonDraft> {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.addonDrafts);
    if (!raw) return {};

    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== "object") return {};

    return parsed as Record<string, AddonDraft>;
  } catch {
    return {};
  }
}

export function saveAddonDrafts(value: Record<string, AddonDraft>) {
  localStorage.setItem(STORAGE_KEYS.addonDrafts, JSON.stringify(value));
}

export function loadGlobalMarkup(): number {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.globalMarkup);
    if (!raw) return 0;

    const parsed = Number(raw);
    return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
  } catch {
    return 0;
  }
}

export function saveGlobalMarkup(value: number) {
  localStorage.setItem(STORAGE_KEYS.globalMarkup, String(value));
}

export function loadCountry():
  | "RU"
  | "UZ"
  | "KZ"
  | "TJ"
  | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.country);
    if (raw === "RU" || raw === "UZ" || raw === "KZ" || raw === "TJ") {
      return raw;
    }
    return null;
  } catch {
    return null;
  }
}

export function saveCountry(value: "RU" | "UZ" | "KZ" | "TJ") {
  localStorage.setItem(STORAGE_KEYS.country, value);
}

export function loadOrders(): DealerOrder[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.orders);
    if (!raw) return [];

    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as DealerOrder[]) : [];
  } catch {
    return [];
  }
}

export function saveOrders(value: DealerOrder[]) {
  localStorage.setItem(STORAGE_KEYS.orders, JSON.stringify(value));
}

export function prependOrder(order: DealerOrder) {
  const prev = loadOrders();
  saveOrders([order, ...prev]);
}