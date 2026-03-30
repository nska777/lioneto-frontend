"use client";

import Image from "next/image";
import { Check, ChevronDown, ZoomIn } from "lucide-react";

import type { DealerAddon, DealerCountryCode } from "@/app/lib/dealer/shop";
import type { AddonDraftState } from "./product-modal.types";
import QtyControl from "./QtyControl";
import { formatMoney, cn } from "./utils";

type Props = {
  addon: DealerAddon;
  country: DealerCountryCode;
  addonState: AddonDraftState;
  onIncreaseAddonQty?: (addonId: string) => void;
  onDecreaseAddonQty?: (addonId: string) => void;
  onToggleAddonCart?: (addonId: string) => void;
  onOpenImage?: (src: string, title: string) => void;
};

function getAddonPrice(addon: DealerAddon, country: DealerCountryCode): number {
  return addon.price[country] ?? 0;
}

export default function RequiredStepRow({
  addon,
  country,
  addonState,
  onIncreaseAddonQty,
  onDecreaseAddonQty,
  onToggleAddonCart,
  onOpenImage,
}: Props) {
  const minQty = addon.minQuantity ?? 1;
  const qty = Math.max(
    minQty,
    addonState.quantity || addon.defaultQuantity || 1,
  );
  const unitPrice = getAddonPrice(addon, country);
  const totalPrice = unitPrice * qty;
  const isDone = addonState.isInCart && qty >= minQty;

  return (
    <div
      className={cn(
        "rounded-[18px] border px-3 py-3 transition sm:px-4",
        isDone
          ? "border-emerald-200 bg-emerald-50/60"
          : "border-black/8 bg-white",
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="shrink-0">
          {addon.image ? (
            <button
              type="button"
              onClick={() => onOpenImage?.(addon.image!, addon.title)}
              className={cn(
                "group relative block h-12 w-12 overflow-hidden rounded-[12px] border bg-white transition",
                isDone
                  ? "border-emerald-200"
                  : "border-black/10 hover:border-black/20",
              )}
              aria-label={`Увеличить изображение: ${addon.title}`}
            >
              <Image
                src={addon.image}
                alt={addon.title}
                fill
                className="object-cover"
                sizes="48px"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/20">
                <ZoomIn className="h-3.5 w-3.5 text-white opacity-0 transition group-hover:opacity-100" />
              </div>
            </button>
          ) : (
            <div
              className={cn(
                "mt-0.5 flex h-12 w-12 items-center justify-center rounded-[12px] border text-[12px] font-semibold",
                isDone
                  ? "border-emerald-300 bg-emerald-600 text-white"
                  : "border-black/12 bg-[#f5f4f1] text-black/55",
              )}
            >
              {isDone ? <Check className="h-4 w-4" /> : minQty}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-[14px] font-semibold leading-5 text-black sm:text-[15px]">
              {addon.title}
            </div>

            {addon.article ? (
              <span className="inline-flex rounded-full border border-black/10 bg-[#f5f5f3] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-black/45">
                {addon.article}
              </span>
            ) : null}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-black/50">
            <span>Мин. {minQty} шт.</span>
            <span>{formatMoney(unitPrice, country)}</span>
            <span className="text-black/65">
              Сумма: {formatMoney(totalPrice, country)}
            </span>
          </div>
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[190px] sm:items-end">
          <div className="flex justify-start sm:justify-end">
            <QtyControl
              compact
              value={qty}
              onMinus={() => onDecreaseAddonQty?.(addon.id)}
              onPlus={() => onIncreaseAddonQty?.(addon.id)}
            />
          </div>

          <button
            type="button"
            onClick={() => onToggleAddonCart?.(addon.id)}
            className={cn(
              "inline-flex h-9 w-full cursor-pointer items-center justify-center rounded-[10px] px-3 text-[12px] font-semibold transition sm:min-w-[110px]",
              addonState.isInCart
                ? "border border-emerald-600 bg-emerald-600 text-white hover:border-emerald-700 hover:bg-emerald-700"
                : "border border-black bg-black text-white hover:opacity-95",
            )}
          >
            {addonState.isInCart ? "Выбрано" : "Добавить"}
          </button>
        </div>
      </div>
    </div>
  );
}
