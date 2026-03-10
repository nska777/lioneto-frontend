"use client";

import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Heart, ShoppingCart, ListChecks, X } from "lucide-react";
import { useShopState } from "../context/shop-state";
import { supabase } from "@/app/lib/supabase/client";
import { wishlistUpsert, wishlistRemove } from "../lib/wishlist";
import { useRegionLang } from "@/app/context/region-lang";
import {
  hasCartLeadCapture,
  saveCartLeadData,
  setCartLeadCaptureDone,
  upsertCartLineMeta,
} from "@/app/lib/cart-lead";

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
  onClick: (e: React.MouseEvent<HTMLButtonElement>) => void;
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
  variantId?: string | null;
  variantTitle?: string | null;
};

function snapshotToRecord(s: WishlistSnapshot): Record<string, unknown> {
  return {
    title: s.title ?? null,
    href: s.href ?? null,
    imageUrl: s.imageUrl ?? null,
    sku: s.sku ?? null,
    price_uzs: s.price_uzs ?? null,
    price_rub: s.price_rub ?? null,
    variantId: s.variantId ?? null,
    variantTitle: s.variantTitle ?? null,
  };
}

type Region = "uz" | "ru";

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

export default function ProductActions({
  id,
  variantId,
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

  const [leadModalOpen, setLeadModalOpen] = useState(false);

  const vid =
    String(variantId ?? snapshot?.variantId ?? "base").trim() || "base";

  const vTitle =
    String(variantTitle ?? snapshot?.variantTitle ?? "").trim() || null;

  const fav = isFav(id, vid);
  const inCart = isInCart(id, vid);

  async function toggleFavAndSync() {
    const nextFav = !fav;

    toggleFav(id, vid);

    const { data } = await supabase.auth.getSession();
    if (!data.session) return;

    const snap: WishlistSnapshot = {
      ...(snapshot ?? {}),
      variantId: vid === "base" ? null : vid,
      variantTitle: vTitle,
    };

    const key = `${id}::${vid}`;

    if (nextFav) {
      await wishlistUpsert(key, snapshotToRecord(snap));
    } else {
      await wishlistRemove(key);
    }
  }

  function saveCartMeta() {
    upsertCartLineMeta({
      productId: id,
      variantId: vid,
      variantTitle: vTitle,
      title: snapshot?.title ?? "Товар",
      href: snapshot?.href ?? null,
      imageUrl: snapshot?.imageUrl ?? null,
      sku: snapshot?.sku ?? null,
      price_uzs: snapshot?.price_uzs ?? null,
      price_rub: snapshot?.price_rub ?? null,
    });
  }

  function handleCartClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();

    if (inCart) {
      toggleCart(id, vid);
      return;
    }

    if (hasCartLeadCapture()) {
      saveCartMeta();
      toggleCart(id, vid);
      return;
    }

    setLeadModalOpen(true);
  }

  function handleFavClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    void toggleFavAndSync();
  }

  function handleSpecsClick(e: React.MouseEvent<HTMLButtonElement>) {
    e.preventDefault();
    e.stopPropagation();
    onOpenSpecs?.();
  }

  function handleLeadSubmit(payload: { name: string; phone: string }) {
    saveCartLeadData(payload);
    setCartLeadCaptureDone();
    saveCartMeta();
    toggleCart(id, vid);
    setLeadModalOpen(false);
  }

  return (
    <>
      <div className="flex flex-col items-end gap-2">
        <IconBtn
          title="В избранное"
          active={fav}
          tone="danger"
          onClick={handleFavClick}
        >
          <Heart className={cn("h-4 w-4", fav && "fill-current")} />
        </IconBtn>

        <IconBtn title="Характеристики" onClick={handleSpecsClick}>
          <ListChecks className="h-4 w-4" />
        </IconBtn>

        <IconBtn
          title={inCart ? "Убрать из корзины" : "Добавить в корзину"}
          active={inCart}
          onClick={handleCartClick}
        >
          <ShoppingCart className={cn("h-4 w-4", inCart && "fill-current")} />
        </IconBtn>
      </div>

      <LeadBeforeCartModal
        open={leadModalOpen}
        onClose={() => setLeadModalOpen(false)}
        onSubmit={handleLeadSubmit}
      />
    </>
  );
}
