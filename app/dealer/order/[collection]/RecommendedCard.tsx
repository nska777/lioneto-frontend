"use client";

import Image from "next/image";
import { ZoomIn } from "lucide-react";

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

export default function RecommendedCard({
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

  return (
    <div className="flex h-full flex-col rounded-[20px] border border-black/8 bg-white p-4">
      <div className="flex min-w-0 gap-3">
        <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[14px] bg-white sm:h-[76px] sm:w-[76px]">
          {addon.image ? (
            <>
              <Image
                src={addon.image}
                alt={addon.title}
                fill
                className="object-cover"
                sizes="76px"
              />
              <button
                type="button"
                onClick={() => onOpenImage?.(addon.image!, addon.title)}
                className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/0 transition hover:bg-black/20"
                aria-label={`Увеличить изображение: ${addon.title}`}
              >
                <ZoomIn className="h-4 w-4 text-white opacity-0 transition hover:opacity-100" />
              </button>
            </>
          ) : (
            <div className="flex h-full items-center justify-center px-2 text-center text-[10px] font-medium text-black/25">
              {addon.title}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="line-clamp-2 text-[14px] font-semibold leading-5 text-black sm:text-[15px]">
            {addon.title}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-black/45">
            {addon.article ? <span>Артикул: {addon.article}</span> : null}
            <span>{formatMoney(unitPrice, country)}</span>
          </div>

          <div className="mt-2 text-[12px] text-black/45">
            {addon.selectionType === "quantity" ? "Выбор количества" : "1 шт."}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {addon.selectionType === "quantity" ? (
          <QtyControl
            compact
            value={qty}
            onMinus={() => onDecreaseAddonQty?.(addon.id)}
            onPlus={() => onIncreaseAddonQty?.(addon.id)}
          />
        ) : (
          <div className="text-[12px] text-black/45">1 шт.</div>
        )}

        <button
          type="button"
          onClick={() => onToggleAddonCart?.(addon.id)}
          className={cn(
            "inline-flex h-9 w-full cursor-pointer items-center justify-center rounded-[10px] px-3 text-[12px] font-semibold transition sm:w-auto",
            addonState.isInCart
              ? "border border-emerald-600 bg-emerald-600 text-white hover:border-emerald-700 hover:bg-emerald-700"
              : "border border-black/10 bg-[#f6f4ef] text-black hover:bg-[#ece8df]",
          )}
        >
          {addonState.isInCart ? "Добавлено" : "В корзину"}
        </button>
      </div>
    </div>
  );
}
