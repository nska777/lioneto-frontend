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
};

export default function ProductActions({
  id,
  onOpenSpecs,
  snapshot,
}: {
  id: string;
  onOpenSpecs?: () => void;
  snapshot?: WishlistSnapshot; // ✅ передаём из карточки
}) {
  const { isFav, toggleFav, isInCart, toggleCart } = useShopState();

  const fav = isFav(id);
  const inCart = isInCart(id);

  async function toggleFavAndSync() {
    // каким станет состояние после клика
    const nextFav = !fav;

    // 1) локально как было
    toggleFav(id);

    // 2) если не залогинен — ничего не делаем
    const { data } = await supabase.auth.getSession();
    if (!data.session) return;

    // 3) синк в Supabase
    if (nextFav) {
      await wishlistUpsert(id, snapshot ?? {});
    } else {
      await wishlistRemove(id);
    }
  }

  return (
    <div className="flex flex-col items-end gap-2">
      {/*  избранное */}
      <IconBtn
        title="В избранное"
        active={fav}
        tone="danger"
        onClick={toggleFavAndSync}
      >
        <Heart className={cn("h-4 w-4", fav && "fill-current")} />
      </IconBtn>

      {/*  характеристики */}
      <IconBtn title="Характеристики" onClick={() => onOpenSpecs?.()}>
        <ListChecks className="h-4 w-4" />
      </IconBtn>

      {/* 🛒 корзина */}
      <IconBtn
        title={inCart ? "Убрать из корзины" : "Добавить в корзину"}
        active={inCart}
        onClick={() => toggleCart(id)}
      >
        <ShoppingCart className={cn("h-4 w-4", inCart && "fill-current")} />
      </IconBtn>
    </div>
  );
}
