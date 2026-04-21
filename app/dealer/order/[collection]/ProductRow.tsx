"use client";

import Image from "next/image";

import type { DealerCountryCode, DealerProduct } from "@/app/lib/dealer/shop";
import { getDisplayArticle } from "./order-utils";
import type { ProductDraft } from "./types";
import { formatMoney } from "./utils";

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

type ProductRowProps = {
  product: DealerProduct;
  country: DealerCountryCode;
  draft: ProductDraft;
  isInCart: boolean;
  onIncreaseQty: (productId: string) => void;
  onDecreaseQty: (productId: string) => void;
  onOpenModal: (product: DealerProduct) => void;
  onOpenImagePreview: (product: DealerProduct) => void;
  onToggleCart: (productId: string) => void;
  onReserve: (product: DealerProduct) => void;
  isReserving?: boolean;
};

export default function ProductRow({
  product,
  country,
  draft,
  isInCart,
  onIncreaseQty,
  onDecreaseQty,
  onOpenModal,
  onOpenImagePreview,
  onToggleCart,
  onReserve,
  isReserving = false,
}: ProductRowProps) {
  const selectedVariant =
    product.variants?.find(
      (variant) => variant.key === draft.selectedVariantKey,
    ) ?? null;

  const selectedColor =
    draft.selectedColor?.trim() ||
    selectedVariant?.color?.trim() ||
    product.color?.trim() ||
    "";

  const variantPrice =
    selectedVariant?.price?.[country] != null
      ? Number(selectedVariant.price[country] ?? 0)
      : null;

  const unitBasePrice =
    variantPrice != null ? variantPrice : Number(product.price[country] ?? 0);

  const displayArticle = getDisplayArticle(
    product.article,
    product.articleShort,
    selectedColor,
  );

  const stockQty = Math.max(0, Number(product.stockQty ?? 0));
  const reservedQty = Math.max(0, Number(product.reservedQty ?? 0));
  const availableQty = Math.max(0, stockQty - reservedQty);
  const showStock = Boolean(product.isStockTracked);

  const disableReserve =
    isReserving || (showStock && availableQty < Math.max(1, draft.quantity));

  return (
    <div className="rounded-[20px] border border-black/10 bg-white p-3 shadow-[0_10px_24px_-20px_rgba(0,0,0,0.18)] sm:rounded-[24px] sm:p-4">
      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          onClick={() => onOpenImagePreview(product)}
          className="group relative block h-[180px] w-full cursor-pointer overflow-hidden rounded-[18px] bg-[#f6f4ee] sm:h-[170px] sm:w-[210px] sm:flex-none"
        >
          {product.image ? (
            <Image
              src={product.image}
              alt={product.title}
              fill
              className="object-cover transition duration-300 group-hover:scale-[1.03]"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center text-sm text-black/35">
              Нет фото
            </div>
          )}
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
            <div className="min-w-0">
              <button
                type="button"
                onClick={() => onOpenModal(product)}
                className="cursor-pointer text-left"
              >
                <h3 className="text-[18px] font-semibold leading-[1.15] text-black transition hover:text-black/75 sm:text-[20px]">
                  {product.title}
                </h3>
              </button>

              {displayArticle ? (
                <div className="mt-1 text-[12px] text-black/55 sm:text-[13px]">
                  Артикул: {displayArticle}
                </div>
              ) : null}

              {product.size ? (
                <div className="mt-1 text-[12px] text-black/55 sm:text-[13px]">
                  Размер: {product.size}
                </div>
              ) : null}

              {product.material ? (
                <div className="mt-1 text-[12px] text-black/55 sm:text-[13px]">
                  Материал: {product.material}
                </div>
              ) : null}

              {selectedColor ? (
                <div className="mt-1 text-[12px] text-black/55 sm:text-[13px]">
                  Цвет: {selectedColor}
                </div>
              ) : null}

              {showStock ? (
                <div className="mt-2 flex flex-wrap gap-2">
                  <span className="inline-flex rounded-full border border-black/10 bg-[#f6f4ee] px-2.5 py-1 text-[10px] font-medium text-black/75">
                    Всего: {stockQty}
                  </span>
                  <span className="inline-flex rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[10px] font-medium text-emerald-700">
                    В наличии: {availableQty}
                  </span>
                  <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-2.5 py-1 text-[10px] font-medium text-red-700">
                    Забронировано: {reservedQty}
                  </span>
                </div>
              ) : null}
            </div>

            <div className="shrink-0 text-left sm:text-right">
              <div className="text-[20px] font-semibold leading-none text-black sm:text-[24px]">
                {formatMoney(unitBasePrice, country)}
              </div>
              <div className="mt-1 text-[12px] text-black/45">за 1 шт.</div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="inline-flex h-[42px] items-center rounded-full border border-black/10 bg-[#fafaf8] px-2">
              <button
                type="button"
                onClick={() => onDecreaseQty(product.id)}
                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-lg text-black transition hover:bg-black/5"
                aria-label="Уменьшить количество"
              >
                −
              </button>

              <div className="min-w-[36px] text-center text-[15px] font-semibold text-black">
                {Math.max(1, draft.quantity)}
              </div>

              <button
                type="button"
                onClick={() => onIncreaseQty(product.id)}
                className="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full text-lg text-black transition hover:bg-black/5"
                aria-label="Увеличить количество"
              >
                +
              </button>
            </div>

            <button
              type="button"
              onClick={() => onOpenModal(product)}
              className="inline-flex min-h-[42px] cursor-pointer items-center justify-center rounded-full border border-black/10 px-4 text-sm font-medium text-black transition hover:border-black/20 hover:bg-black/[0.03]"
            >
              Открыть товар
            </button>
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onToggleCart(product.id)}
              className={cn(
                "inline-flex min-h-[42px] cursor-pointer items-center justify-center rounded-full px-4 text-sm font-semibold transition",
                isInCart
                  ? "bg-black text-white"
                  : "border border-black/15 bg-white text-black hover:border-black/30",
              )}
            >
              {isInCart ? "Добавлено" : "В корзину"}
            </button>

            <button
              type="button"
              onClick={() => onReserve(product)}
              disabled={disableReserve}
              className={cn(
                "inline-flex min-h-[42px] items-center justify-center rounded-full px-4 text-sm font-semibold transition",
                disableReserve
                  ? "cursor-not-allowed bg-red-100 text-red-400"
                  : "cursor-pointer bg-red-600 text-white hover:bg-red-700",
              )}
            >
              {isReserving ? "Бронируем..." : "Забронировать"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
