"use client";

import Image from "next/image";
import { ChevronDown, Minus, Plus, X } from "lucide-react";
import { useState } from "react";

import type { DealerAddon, DealerCountryCode, DealerProduct } from "../data";
import type { ProductDraft } from "./types";
import { formatMoney, getFinalPrice } from "./utils";

type AddonDraftState = {
  quantity: number;
  isInCart: boolean;
  markupPercent: number;
};

type ProductModalProps = {
  product: DealerProduct | null;
  country: DealerCountryCode;
  draft: ProductDraft | null;
  isOpen: boolean;
  onClose: () => void;
  onIncreaseQty: (productId: string) => void;
  onDecreaseQty: (productId: string) => void;
  onMarkupChange: (productId: string, value: number) => void;
  onToggleCart: (productId: string) => void;
  isInCart: boolean;

  addonDrafts?: Record<string, AddonDraftState>;
  onIncreaseAddonQty?: (addonId: string) => void;
  onDecreaseAddonQty?: (addonId: string) => void;
  onToggleAddonCart?: (addonId: string) => void;
  onAddonMarkupChange?: (addonId: string, value: number) => void;
};

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

function getAddonPrice(addon: DealerAddon, country: DealerCountryCode): number {
  return addon.price[country] ?? 0;
}

function QtyControl({
  value,
  onMinus,
  onPlus,
  compact = false,
}: {
  value: number;
  onMinus: () => void;
  onPlus: () => void;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center overflow-hidden rounded-[10px] border border-black/10 bg-white",
        compact ? "h-8" : "h-9",
      )}
    >
      <button
        type="button"
        onClick={onMinus}
        className={cn(
          "flex h-full items-center justify-center transition hover:bg-black/5",
          compact ? "w-8" : "w-9",
        )}
      >
        <Minus className="h-4 w-4" />
      </button>

      <div
        className={cn(
          "flex h-full items-center justify-center border-x border-black/10 font-semibold text-black",
          compact
            ? "min-w-[34px] px-2 text-[13px]"
            : "min-w-[42px] px-2 text-[14px]",
        )}
      >
        {value}
      </div>

      <button
        type="button"
        onClick={onPlus}
        className={cn(
          "flex h-full items-center justify-center transition hover:bg-black/5",
          compact ? "w-8" : "w-9",
        )}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

function AddonCard({
  addon,
  country,
  addonState,
  onIncreaseAddonQty,
  onDecreaseAddonQty,
  onToggleAddonCart,
  onAddonMarkupChange,
}: {
  addon: DealerAddon;
  country: DealerCountryCode;
  addonState: AddonDraftState;
  onIncreaseAddonQty?: (addonId: string) => void;
  onDecreaseAddonQty?: (addonId: string) => void;
  onToggleAddonCart?: (addonId: string) => void;
  onAddonMarkupChange?: (addonId: string, value: number) => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  const addonBasePrice = getAddonPrice(addon, country);
  const addonQty = Math.max(1, addonState.quantity);
  const addonFinalUnitPrice = getFinalPrice(
    addonBasePrice,
    addonState.markupPercent,
  );
  const addonTotalPrice = addonFinalUnitPrice * addonQty;

  return (
    <div className="overflow-hidden rounded-[18px] border border-black/8 bg-white shadow-[0_8px_20px_-18px_rgba(0,0,0,0.22)]">
      <div className="relative h-[150px] bg-[#f1f1ed]">
        <div className="flex h-full items-center justify-center px-4 text-center text-[13px] font-medium text-black/25">
          {addon.title}
        </div>

        {isExpanded ? (
          <div className="absolute inset-2 z-20 rounded-[14px] border border-black/10 bg-white/95 p-3 shadow-[0_20px_40px_-20px_rgba(0,0,0,0.28)] backdrop-blur-sm">
            <div className="flex h-full flex-col justify-between">
              <div className="space-y-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[13px] font-medium text-black/70">
                    Кол-во
                  </span>

                  <QtyControl
                    compact
                    value={addonQty}
                    onMinus={() => onDecreaseAddonQty?.(addon.id)}
                    onPlus={() => onIncreaseAddonQty?.(addon.id)}
                  />
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-[13px] font-medium text-black/70">
                    Наценка %
                  </span>

                  <input
                    type="number"
                    min={0}
                    value={addonState.markupPercent}
                    onChange={(event) => {
                      const next = Number(event.target.value);
                      onAddonMarkupChange?.(
                        addon.id,
                        Number.isFinite(next) && next >= 0 ? next : 0,
                      );
                    }}
                    className="h-8 w-[68px] rounded-[10px] border border-black/10 bg-white px-2 text-center text-[13px] font-semibold text-black outline-none transition focus:border-amber-300"
                  />
                </div>
              </div>

              <div className="mt-3 space-y-2 border-t border-black/8 pt-2">
                <div className="flex items-center justify-between gap-3">
                  <span className="text-[12px] text-black/45">
                    Цена с наценкой
                  </span>
                  <span className="text-[15px] font-semibold leading-none text-red-600">
                    {formatMoney(addonFinalUnitPrice, country)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span className="text-[12px] text-black/45">Сумма</span>
                  <span className="text-[15px] font-semibold leading-none text-black">
                    {formatMoney(addonTotalPrice, country)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : null}
      </div>

      <div className="p-3">
        <div className="line-clamp-2 min-h-[38px] text-[15px] font-semibold leading-5 text-black">
          {addon.title}
        </div>

        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-[12px] text-black/45">Цена</span>
          <span className="text-[16px] font-semibold leading-none text-black">
            {formatMoney(addonBasePrice, country)}
          </span>
        </div>

        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setIsExpanded((prev) => !prev)}
            className="inline-flex h-9 cursor-pointer items-center justify-center gap-2 rounded-[10px] border border-black/10 bg-[#f6f4ef] px-3 text-[13px] font-semibold text-black transition hover:bg-[#ece8df]"
          >
            {isExpanded ? "Скрыть" : "Подробнее"}
            <ChevronDown
              className={cn("h-4 w-4 transition", isExpanded && "rotate-180")}
            />
          </button>

          <button
            type="button"
            onClick={() => onToggleAddonCart?.(addon.id)}
            className={cn(
              "inline-flex h-9 cursor-pointer items-center justify-center rounded-[10px] px-3 text-[13px] font-semibold transition",
              addonState.isInCart
                ? "border border-emerald-600 bg-emerald-600 text-white hover:border-emerald-700 hover:bg-emerald-700"
                : "border border-black bg-black text-white hover:opacity-95",
            )}
          >
            {addonState.isInCart ? "Добавлено" : "В корзину"}
          </button>
        </div>
      </div>
    </div>
  );
}
export default function ProductDetailsModal({
  product,
  country,
  draft,
  isOpen,
  onClose,
  onIncreaseQty,
  onDecreaseQty,
  onMarkupChange,
  onToggleCart,
  isInCart,
  addonDrafts,
  onIncreaseAddonQty,
  onDecreaseAddonQty,
  onToggleAddonCart,
  onAddonMarkupChange,
}: ProductModalProps) {
  if (!isOpen || !product || !draft) return null;

  const addons = product.addons ?? [];
  const basePrice = product.price[country];
  const finalUnitPrice = getFinalPrice(basePrice, draft.markupPercent);
  const totalFinalPrice = finalUnitPrice * draft.quantity;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/45 p-2 md:p-4"
      onClick={onClose}
    >
      <div className="flex min-h-full items-center justify-center">
        <div
          className="relative w-full max-w-[940px] rounded-[24px] bg-[#fcfcfa] shadow-[0_30px_90px_-30px_rgba(0,0,0,0.35)]"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-20 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-black/10 bg-white text-black/60 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <X className="h-5 w-5" />
          </button>

          <div
            className={cn(
              "max-h-[88vh] overflow-x-visible overflow-y-auto px-4 pb-4 pt-4 md:px-5 md:pb-5 md:pt-5",
              "[scrollbar-width:thin]",
              "[scrollbar-color:rgba(0,0,0,0.22)_transparent]",
              "[&::-webkit-scrollbar]:w-[6px]",
              "[&::-webkit-scrollbar-track]:bg-transparent",
              "[&::-webkit-scrollbar-thumb]:rounded-full",
              "[&::-webkit-scrollbar-thumb]:bg-black/20",
            )}
          >
            <div className="grid items-start gap-4 lg:grid-cols-[520px_360px] lg:justify-between">
              <div className="relative h-[300px] overflow-hidden rounded-[22px] bg-[#f1f1ed] sm:h-[340px] lg:h-[455px]">
                <Image
                  src={product.image}
                  alt={product.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 520px"
                  priority
                />
              </div>

              <div className="min-w-0">
                <h2 className="pr-12 text-[24px] font-semibold leading-[1.05] tracking-[-0.03em] text-black md:text-[30px]">
                  {product.title}
                </h2>

                <div className="mt-2 text-[13px] text-black/45">
                  Артикул: {product.article}
                </div>

                {product.description ? (
                  <p className="mt-4 text-[14px] leading-6 text-black/65">
                    {product.description}
                  </p>
                ) : null}

                <div className="mt-4 rounded-[20px] bg-[#f3f0ea] p-4">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-[13px] text-black/45">
                      Текущая цена
                    </span>
                    <span className="text-right text-[20px] font-semibold leading-none text-black md:text-[22px]">
                      {formatMoney(basePrice, country)}
                    </span>
                  </div>

                  <div className="mt-4 flex items-center justify-between gap-3">
                    <span className="text-[14px] font-medium text-black/70">
                      Кол-во
                    </span>

                    <QtyControl
                      value={draft.quantity}
                      onMinus={() => onDecreaseQty(product.id)}
                      onPlus={() => onIncreaseQty(product.id)}
                    />
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <span className="text-[14px] font-medium text-black/70">
                      Наценка %
                    </span>

                    <input
                      type="number"
                      min={0}
                      value={draft.markupPercent}
                      onChange={(event) => {
                        const next = Number(event.target.value);
                        onMarkupChange(
                          product.id,
                          Number.isFinite(next) && next >= 0 ? next : 0,
                        );
                      }}
                      className="h-9 w-[74px] rounded-[10px] border border-black/10 bg-white px-3 text-center text-[14px] font-semibold text-black outline-none transition focus:border-amber-300"
                    />
                  </div>

                  <div className="mt-4 space-y-3 border-t border-black/8 pt-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[12px] text-black/45">
                        Цена с наценкой
                      </span>
                      <span className="text-[18px] font-semibold leading-none text-red-600">
                        {formatMoney(finalUnitPrice, country)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[12px] text-black/45">Сумма</span>
                      <span className="text-[18px] font-semibold leading-none text-black">
                        {formatMoney(totalFinalPrice, country)}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => onToggleCart(product.id)}
                    className={cn(
                      "mt-4 inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-[10px] px-4 text-[13px] font-semibold transition",
                      isInCart
                        ? "border border-emerald-600 bg-emerald-600 text-white hover:border-emerald-700 hover:bg-emerald-700"
                        : "border border-black bg-black text-white hover:opacity-95",
                    )}
                  >
                    {isInCart ? "Добавлено" : "В корзину"}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6">
              <div className="mb-3">
                <div className="text-[18px] font-semibold tracking-[-0.02em] text-black">
                  Дозаказать к этому товару
                </div>
                <div className="mt-1 text-[13px] text-black/45">
                  Дополнительные модули и комплектующие
                </div>
              </div>

              {addons.length > 0 ? (
                <div className="grid grid-cols-2 gap-3 overflow-visible md:grid-cols-3">
                  {addons.map((addon) => {
                    const addonState = addonDrafts?.[addon.id] ?? {
                      quantity: 1,
                      isInCart: false,
                      markupPercent: 0,
                    };

                    return (
                      <AddonCard
                        key={addon.id}
                        addon={addon}
                        country={country}
                        addonState={addonState}
                        onIncreaseAddonQty={onIncreaseAddonQty}
                        onDecreaseAddonQty={onDecreaseAddonQty}
                        onToggleAddonCart={onToggleAddonCart}
                        onAddonMarkupChange={onAddonMarkupChange}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-[18px] border border-dashed border-black/12 bg-[#f8f7f4] px-4 py-5 text-[14px] text-black/50">
                  Для этого товара пока нет комплектующих.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
