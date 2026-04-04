"use client";

import Image from "next/image";
import { Minus, Plus } from "lucide-react";

import type { DealerCountryCode, DealerProduct } from "@/app/lib/dealer/shop";
import type { ProductDraft } from "./types";
import { getDisplayArticle } from "./order-utils";
import { cn, formatMoney } from "./utils";

type ProductRowProps = {
  product: DealerProduct;
  country: DealerCountryCode;
  draft: ProductDraft;
  isInCart: boolean;
  onIncreaseQty: (productId: string) => void;
  onDecreaseQty: (productId: string) => void;
  onOpenModal: (product: DealerProduct) => void;
  onToggleCart: (productId: string) => void;
};

export default function ProductRow({
  product,
  country,
  draft,
  isInCart,
  onIncreaseQty,
  onDecreaseQty,
  onOpenModal,
  onToggleCart,
}: ProductRowProps) {
  const basePrice = product.price[country];
  const hasRequiredKit = (product.requiredItems?.length ?? 0) > 0;
  const hasRecommendedKit = (product.recommendedItems?.length ?? 0) > 0;

  const displayArticle = getDisplayArticle(
    product.article,
    product.articleShort,
    draft.selectedColor || product.color || "",
  );

  return (
    <div className="rounded-[18px] border border-black/10 bg-white px-3 py-3 shadow-[0_10px_24px_-20px_rgba(0,0,0,0.18)] sm:rounded-[20px] sm:px-4">
      <div className="flex h-full flex-col">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => onOpenModal(product)}
            className="inline-flex cursor-pointer text-[10px] font-semibold uppercase tracking-[0.08em] text-black transition hover:text-amber-700 sm:text-[11px]"
          >
            Подробнее
          </button>

          {hasRequiredKit ? (
            <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-red-700 sm:px-2.5 sm:text-[10px]">
              обязательная комплектация
            </span>
          ) : null}

          {!hasRequiredKit && hasRecommendedKit ? (
            <span className="inline-flex rounded-full border border-amber-200 bg-amber-50 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-amber-700 sm:px-2.5 sm:text-[10px]">
              есть рекомендации
            </span>
          ) : null}
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:gap-4">
          <div className="flex items-start gap-3 sm:flex-1 sm:gap-4">
            <div className="relative h-[64px] w-[64px] shrink-0 overflow-hidden rounded-[12px] bg-[#f1f1ed] sm:h-[72px] sm:w-[72px] sm:rounded-[14px]">
              <Image
                src={product.image}
                alt={product.title}
                fill
                className="object-cover"
                sizes="(max-width: 640px) 64px, 72px"
              />
            </div>

            <div className="min-w-0 flex-1 pt-0.5 sm:pt-1">
              <div className="break-words text-[15px] font-semibold leading-tight text-black sm:text-[17px]">
                {product.title}
              </div>

              <div className="mt-1 text-[11px] text-black/45 sm:text-[12px]">
                Артикул
              </div>
              <div className="break-words text-[13px] text-black/60 sm:text-[14px]">
                {displayArticle}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:flex sm:shrink-0 sm:items-start sm:gap-4 lg:gap-6">
            <div className="min-w-0 sm:w-[88px]">
              <div className="mb-1 text-[11px] font-semibold text-black sm:text-center sm:text-[12px]">
                Кол-во
              </div>

              <div className="flex h-9 items-center overflow-hidden rounded-[12px] border border-black/10 bg-[#fafaf8]">
                <button
                  type="button"
                  onClick={() => onDecreaseQty(product.id)}
                  className="flex h-full w-9 cursor-pointer items-center justify-center transition hover:bg-black/5"
                >
                  <Minus className="h-4 w-4" />
                </button>

                <div className="flex h-full min-w-[34px] flex-1 items-center justify-center border-x border-black/10 text-[14px] font-semibold text-black">
                  {draft.quantity}
                </div>

                <button
                  type="button"
                  onClick={() => onIncreaseQty(product.id)}
                  className="flex h-full w-9 cursor-pointer items-center justify-center transition hover:bg-black/5"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="min-w-0 sm:w-[145px]">
              <div className="mb-1 text-[11px] font-semibold text-black sm:text-[12px]">
                Цена
              </div>

              <div className="break-words text-[14px] font-semibold leading-tight text-black sm:text-[15px] sm:leading-none">
                {formatMoney(basePrice, country)}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-3 rounded-[14px] bg-[#f5f5f3] px-3 py-2.5 sm:rounded-[16px]">
          <div className="flex flex-col gap-3">
            <div className="text-[13px] font-semibold text-black sm:text-[14px]">
              Сумма:{" "}
              <span className="break-words">
                {formatMoney(basePrice * draft.quantity, country)}
              </span>
            </div>

            {hasRequiredKit ? (
              <button
                type="button"
                onClick={() => onOpenModal(product)}
                className="inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-[14px] border border-black bg-black px-4 text-[12px] font-semibold text-white transition hover:opacity-95 sm:min-w-[170px] sm:text-[13px]"
              >
                собрать комплект
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onToggleCart(product.id)}
                className={cn(
                  "inline-flex h-10 w-full cursor-pointer items-center justify-center rounded-[14px] border px-4 text-[12px] font-semibold transition sm:min-w-[126px] sm:text-[13px]",
                  isInCart
                    ? "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 hover:border-emerald-700"
                    : "border-black/10 bg-white text-black hover:border-amber-300 hover:bg-amber-50",
                )}
              >
                {isInCart ? "добавлено" : "в корзину"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
