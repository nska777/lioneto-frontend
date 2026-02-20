"use client";

import React from "react";
import { Heart, ShoppingCart, ListChecks } from "lucide-react";
import { useShopState } from "../context/shop-state";
import { supabase } from "@/app/lib/supabase/client";
import { wishlistUpsert, wishlistRemove } from "../lib/wishlist";

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

function IconBtn({
  title,
  active,
  tone = "neutral",
  onClick,
  children,
}: {
  title: string;
  active?: boolean;
  tone?: "neutral" | "danger";
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      title={title}
      onClick={onClick}
      className={cn(
        "cursor-pointer rounded-full border p-2 backdrop-blur transition",
        "border-black/10 bg-white/80 hover:bg-white",
        active
          ? tone === "danger"
            ? "text-rose-600"
            : "text-black"
          : "text-black/75",
      )}
      type="button"
    >
      {children}
    </button>
  );
}

type WishlistSnapshot = {
  title?: string | null;
  href?: string | null;
  imageUrl?: string | null;
  sku?: string | null;
  price_uzs?: number | null;
  price_rub?: number | null;

  // ✅ вариант
  variantId?: string | null;
  variantTitle?: string | null;
};

export default function ProductActions({
  id,
  variantId, // сюда передаём variantKey ("color:white|option:lift")
  variantTitle,
  onOpenSpecs,
  snapshot,
}: {
  id: string;
  variantId?: string | null;
  variantTitle?: string | null;
  onOpenSpecs?: () => void;
  snapshot?: WishlistSnapshot;
}) {
  const shop = useShopState();
  const { isFav, toggleFav, isInCart, toggleCart } = shop;

  // ✅ FIX: если variantId не пришёл, пробуем взять из snapshot
  const vid =
    String(variantId ?? snapshot?.variantId ?? "base").trim() || "base";

  const vTitle =
    String(variantTitle ?? snapshot?.variantTitle ?? "").trim() || null;

  const fav = isFav(id, vid);
  const inCart = isInCart(id, vid);

  async function toggleFavAndSync() {
    const nextFav = !fav;

    // ✅ локально — С УЧЁТОМ ВАРИАНТА
    toggleFav(id, vid);

    // ✅ если не залогинен — просто выходим (локально уже ок)
    const { data } = await supabase.auth.getSession();
    if (!data.session) return;

    // ✅ snapshot с вариантом
    const snap: WishlistSnapshot = {
      ...(snapshot ?? {}),
      variantId: vid === "base" ? null : vid,
      variantTitle: vTitle,
    };

    const key = `${id}::${vid}`;

    if (nextFav) {
      await wishlistUpsert(key, snap as any);
    } else {
      await wishlistRemove(key);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {/* избранное */}
      <IconBtn
        title="В избранное"
        active={fav}
        tone="danger"
        onClick={toggleFavAndSync}
      >
        <Heart className={cn("h-4 w-4", fav && "fill-current")} />
      </IconBtn>

      {/* характеристики */}
      <IconBtn title="Характеристики" onClick={() => onOpenSpecs?.()}>
        <ListChecks className="h-4 w-4" />
      </IconBtn>

      {/* корзина */}
      <IconBtn
        title={inCart ? "Убрать из корзины" : "Добавить в корзину"}
        active={inCart}
        onClick={() => toggleCart(id, vid)} // ✅ всегда variant-aware
      >
        <ShoppingCart className={cn("h-4 w-4", inCart && "fill-current")} />
      </IconBtn>
    </div>
  );
}
