"use client";

import Image from "next/image";
import { useEffect, useMemo } from "react";

import type {
  DealerAddon,
  DealerCountryCode,
  DealerProductVariant,
} from "@/app/lib/dealer/shop";
import type { AddonDraftState } from "./product-modal.types";
import QtyControl from "./QtyControl";
import { getDisplayArticle } from "./order-utils";
import { cn, formatMoney } from "./utils";

type Props = {
  addon: DealerAddon;
  country: DealerCountryCode;
  addonState: AddonDraftState;
  onIncreaseAddonQty?: (addonId: string) => void;
  onDecreaseAddonQty?: (addonId: string) => void;
  onToggleAddonCart?: (addonId: string) => void;
  onSelectAddonVariant?: (
    addonId: string,
    variantKey: string,
    color: string,
  ) => void;
  onOpenRelatedProduct?: (productId: string) => void;
};

function getVariantPrice(
  variant: DealerProductVariant | null | undefined,
  country: DealerCountryCode,
): number {
  return variant?.priceDelta?.[country] ?? 0;
}

export default function RecommendedQuickAddCard({
  addon,
  country,
  addonState,
  onIncreaseAddonQty,
  onDecreaseAddonQty,
  onToggleAddonCart,
  onSelectAddonVariant,
  onOpenRelatedProduct,
}: Props) {
  const colorVariants = useMemo(
    () => (addon.variants ?? []).filter((item) => item.type === "color"),
    [addon.variants],
  );

  useEffect(() => {
    if (!colorVariants.length || !onSelectAddonVariant) return;

    const currentKey = addonState.selectedVariantKey ?? "";
    const hasCurrent = colorVariants.some(
      (variant) => variant.variantKey === currentKey,
    );

    if (hasCurrent) return;

    const firstVariant = colorVariants[0];
    if (!firstVariant) return;

    onSelectAddonVariant(addon.id, firstVariant.variantKey, firstVariant.title);
  }, [
    addon.id,
    addonState.selectedVariantKey,
    colorVariants,
    onSelectAddonVariant,
  ]);

  const selectedVariant =
    colorVariants.find(
      (variant) => variant.variantKey === addonState.selectedVariantKey,
    ) ??
    colorVariants[0] ??
    null;

  const selectedColor =
    addonState.selectedColor || selectedVariant?.title || addon.color || "";

  const displayArticle = getDisplayArticle(addon.article, selectedColor);

  const unitPrice =
    getVariantPrice(selectedVariant, country) || addon.price[country] || 0;

  const qty = Math.max(
    addon.minQuantity ?? 1,
    addonState.quantity || addon.defaultQuantity || 1,
  );

  const totalPrice = unitPrice * qty;

  const previewImage =
    selectedVariant?.image && selectedVariant.image.trim().length > 0
      ? selectedVariant.image
      : addon.image || "";

  return (
    <div className="flex h-full flex-col rounded-[20px] border border-black/8 bg-white p-4">
      <div className="flex min-w-0 gap-3">
        <button
          type="button"
          onClick={() => onOpenRelatedProduct?.(addon.id)}
          className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[14px] bg-[#f5f5f2]"
        >
          {previewImage ? (
            <Image
              src={previewImage}
              alt={addon.title}
              fill
              className="object-cover"
              sizes="72px"
            />
          ) : (
            <div className="flex h-full items-center justify-center px-2 text-center text-[10px] font-medium text-black/25">
              {addon.title}
            </div>
          )}
        </button>

        <div className="min-w-0 flex-1">
          <button
            type="button"
            onClick={() => onOpenRelatedProduct?.(addon.id)}
            className="cursor-pointer text-left text-[14px] font-semibold leading-5 text-black transition hover:text-black/70 sm:text-[15px]"
          >
            {addon.title}
          </button>

          <div className="mt-1 text-[12px] text-black/45">
            Артикул: {displayArticle || "—"}
          </div>

          <div className="mt-1 text-[12px] font-medium text-black">
            {formatMoney(unitPrice, country)}
          </div>

          {selectedColor ? (
            <div className="mt-1 text-[12px] text-black/45">
              Цвет: {selectedColor}
            </div>
          ) : null}
        </div>
      </div>

      {colorVariants.length > 0 ? (
        <div className="mt-3 flex flex-wrap gap-2">
          {colorVariants.map((variant) => {
            const isSelected =
              variant.variantKey === selectedVariant?.variantKey;

            return (
              <button
                key={variant.id || variant.variantKey}
                type="button"
                onClick={() =>
                  onSelectAddonVariant?.(
                    addon.id,
                    variant.variantKey,
                    variant.title,
                  )
                }
                className={cn(
                  "inline-flex h-7 items-center gap-2 rounded-full border px-2.5 text-[11px] font-semibold transition",
                  isSelected
                    ? "border-black bg-black text-white"
                    : "border-black/10 bg-white text-black hover:border-black/20",
                )}
              >
                <span
                  className={cn(
                    "h-3 w-3 rounded-full border",
                    isSelected
                      ? "border-white bg-white/80"
                      : "border-black/15 bg-[#d9c4ac]",
                  )}
                />
                <span>{variant.title}</span>
              </button>
            );
          })}
        </div>
      ) : null}

      <div className="mt-4">
        <div className="flex justify-end">
          <QtyControl
            compact
            value={qty}
            onMinus={() => onDecreaseAddonQty?.(addon.id)}
            onPlus={() => onIncreaseAddonQty?.(addon.id)}
          />
        </div>

        <div className="mt-3 flex items-end justify-between gap-3">
          <div className="min-w-0">
            <div className="text-[12px] text-black/45">Сумма</div>
            <div className="mt-1 text-[16px] font-semibold text-black">
              {formatMoney(totalPrice, country)}
            </div>
          </div>

          <button
            type="button"
            onClick={() => onToggleAddonCart?.(addon.id)}
            className={cn(
              "inline-flex h-9 min-w-[110px] shrink-0 cursor-pointer items-center justify-center rounded-[10px] px-3 text-[12px] font-semibold transition",
              addonState.isInCart
                ? "border border-emerald-600 bg-emerald-600 text-white hover:border-emerald-700 hover:bg-emerald-700"
                : "border border-black/10 bg-[#f6f4ef] text-black hover:bg-[#ece8df]",
            )}
          >
            {addonState.isInCart ? "Добавлено" : "В корзину"}
          </button>
        </div>
      </div>
    </div>
  );
}
