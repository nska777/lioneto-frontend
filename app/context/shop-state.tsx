"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

/**
 * ✅ КАК РАНЬШЕ:
 * - Один и тот же товар может быть в корзине в разных вариантах.
 * - Ключ: productId::variantId
 * - addToCart(productId) без variant => добавляет "base"
 */

export type VariantRef = {
  id: string; // variantId
  title?: string;
};

export type ItemKey = string; // "productId::variantId"
type CartMap = Record<ItemKey, number>;
type OneClick = { id: ItemKey; qty: number } | null;

export type ShopState = {
  favorites: ItemKey[];
  isFav: (productId: string, variantId?: string) => boolean;
  toggleFav: (productId: string, variant?: VariantRef | string) => void;
  favCount: number;

  cart: CartMap;
  cartCount: number;
  isInCart: (productId: string, variantId?: string) => boolean;
  addToCart: (
    productId: string,
    qty?: number,
    variant?: VariantRef | string,
  ) => void;
  removeFromCart: (productId: string, variantId?: string) => void;
  toggleCart: (productId: string, variant?: VariantRef | string) => void;
  setCartQty: (productId: string, qty: number, variantId?: string) => void;
  clearCart: () => void;

  oneClick: OneClick;
  setOneClick: (
    productId: string,
    qty?: number,
    variant?: VariantRef | string,
  ) => void;
  clearOneClick: () => void;

  makeKey: (productId: string, variantId?: string) => ItemKey;
  parseKey: (key: ItemKey) => { productId: string; variantId: string };
};

const Ctx = createContext<ShopState | null>(null);

const LS_FAV = "lioneto:favorites:v1";
const LS_CART = "lioneto:cart:v1";
const LS_ONECLICK = "lioneto:oneclick:v1";

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

const DEFAULT_VARIANT_ID = "base";
const SEP = "::";

function normVariantId(v?: string) {
  const s = String(v ?? "").trim();
  return s ? s : DEFAULT_VARIANT_ID;
}

function makeKey(productId: string, variantId?: string): ItemKey {
  return `${String(productId)}${SEP}${normVariantId(variantId)}`;
}

function parseKey(key: ItemKey) {
  const raw = String(key);
  const idx = raw.indexOf(SEP);

  if (idx === -1) {
    return { productId: raw, variantId: DEFAULT_VARIANT_ID };
  }

  return {
    productId: raw.slice(0, idx),
    variantId: normVariantId(raw.slice(idx + SEP.length)),
  };
}

function pickVariantId(variant?: VariantRef | string) {
  if (!variant) return DEFAULT_VARIANT_ID;
  if (typeof variant === "string") return normVariantId(variant);
  return normVariantId(variant.id);
}

function migrateFavorites(raw: any): ItemKey[] {
  if (!Array.isArray(raw)) return [];

  return raw
    .map((x) => String(x))
    .filter(Boolean)
    .map((s) => (s.includes(SEP) ? s : makeKey(s, DEFAULT_VARIANT_ID)));
}

function migrateCart(raw: any): CartMap {
  if (!raw || typeof raw !== "object") return {};
  const out: CartMap = {};

  for (const [k0, v0] of Object.entries(raw)) {
    const qty = Math.max(0, Math.floor(Number(v0 || 0)));
    if (qty <= 0) continue;

    const k = String(k0);
    const key = k.includes(SEP) ? k : makeKey(k, DEFAULT_VARIANT_ID);
    out[key] = (out[key] ?? 0) + qty;
  }

  return out;
}

function migrateOneClick(raw: any): OneClick {
  if (!raw || typeof raw !== "object") return null;

  const id = raw?.id ? String(raw.id) : "";
  const qty = Math.max(1, Math.floor(Number(raw?.qty || 1)));

  if (!id) return null;

  const key = id.includes(SEP) ? id : makeKey(id, DEFAULT_VARIANT_ID);
  return { id: key, qty };
}

export function ShopStateProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<ItemKey[]>([]);
  const [cart, setCart] = useState<CartMap>({});
  const [oneClick, setOneClickState] = useState<OneClick>(null);

  useEffect(() => {
    const favRaw = safeParse<any>(localStorage.getItem(LS_FAV), []);
    const cartRaw = safeParse<any>(localStorage.getItem(LS_CART), {});
    const ocRaw = safeParse<any>(localStorage.getItem(LS_ONECLICK), null);

    setFavorites(migrateFavorites(favRaw));
    setCart(migrateCart(cartRaw));
    setOneClickState(migrateOneClick(ocRaw));
  }, []);

  useEffect(() => {
    localStorage.setItem(LS_FAV, JSON.stringify(favorites));
  }, [favorites]);

  useEffect(() => {
    localStorage.setItem(LS_CART, JSON.stringify(cart));
  }, [cart]);

  useEffect(() => {
    localStorage.setItem(LS_ONECLICK, JSON.stringify(oneClick));
  }, [oneClick]);

  const api = useMemo<ShopState>(() => {
    const isFav = (productId: string, variantId?: string) => {
      const key = makeKey(productId, variantId);
      return favorites.includes(key);
    };

    const toggleFav = (productId: string, variant?: VariantRef | string) => {
      const vid = pickVariantId(variant);
      const key = makeKey(productId, vid);

      setFavorites((prev) =>
        prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key],
      );
    };

    const isInCart = (productId: string, variantId?: string) => {
      const key = makeKey(productId, variantId);
      return (cart[key] ?? 0) > 0;
    };

    // ✅ как раньше: разные варианты = разные строки
    const addToCart = (
      productId: string,
      qty = 1,
      variant?: VariantRef | string,
    ) => {
      const q = Math.max(1, Math.floor(qty || 1));
      const vid = pickVariantId(variant);
      const key = makeKey(productId, vid);

      setCart((prev) => ({
        ...prev,
        [key]: (prev[key] ?? 0) + q,
      }));
    };

    const removeFromCart = (productId: string, variantId?: string) => {
      const key = makeKey(productId, variantId);
      setCart((prev) => {
        const n = { ...prev };
        delete n[key];
        return n;
      });
    };

    const toggleCart = (productId: string, variant?: VariantRef | string) => {
      const key = makeKey(productId, pickVariantId(variant));

      setCart((prev) => {
        const exists = (prev[key] ?? 0) > 0;

        if (exists) {
          const n = { ...prev };
          delete n[key];
          return n;
        }

        return { ...prev, [key]: 1 };
      });
    };

    const setCartQty = (productId: string, qty: number, variantId?: string) => {
      const key = makeKey(productId, variantId);

      setCart((prev) => {
        const q = Math.max(0, Math.floor(qty || 0));

        if (q <= 0) {
          const n = { ...prev };
          delete n[key];
          return n;
        }

        return { ...prev, [key]: q };
      });
    };

    const clearCart = () => setCart({});

    const setOneClick = (
      productId: string,
      qty = 1,
      variant?: VariantRef | string,
    ) => {
      const q = Math.max(1, Math.floor(qty || 1));
      const key = makeKey(productId, pickVariantId(variant));
      setOneClickState({ id: key, qty: q });
    };

    const clearOneClick = () => setOneClickState(null);

    const favCount = favorites.length;
    const cartCount = Object.values(cart).reduce((a, b) => a + (b || 0), 0);

    return {
      favorites,
      isFav,
      toggleFav,
      favCount,

      cart,
      cartCount,
      isInCart,
      addToCart,
      removeFromCart,
      toggleCart,
      setCartQty,
      clearCart,

      oneClick,
      setOneClick,
      clearOneClick,

      makeKey,
      parseKey,
    };
  }, [favorites, cart, oneClick]);

  return <Ctx.Provider value={api}>{children}</Ctx.Provider>;
}

export function useShopState() {
  const v = useContext(Ctx);
  if (!v) throw new Error("useShopState must be used within ShopStateProvider");
  return v;
}
