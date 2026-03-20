"use client";

import Image from "next/image";
import { Minus, Plus } from "lucide-react";

import type { DealerCountryCode, DealerProduct } from "../data";
import type { ProductDraft } from "./types";
import { cn, formatMoney, getFinalPrice } from "./utils";

type ProductRowProps = {
  product: DealerProduct;
  country: DealerCountryCode;
  draft: ProductDraft;
  isInCart: boolean;
  onIncreaseQty: (productId: string) => void;
  onDecreaseQty: (productId: string) => void;
  onMarkupChange: (productId: string, value: number) => void;
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
  onMarkupChange,
  onOpenModal,
  onToggleCart,
}: ProductRowProps) {
  const basePrice = product.price[country];
  const finalUnitPrice = getFinalPrice(basePrice, draft.markupPercent);

  return (
    <div className="h-[200px] rounded-[20px] border border-black/10 bg-white px-4 py-3 shadow-[0_10px_24px_-20px_rgba(0,0,0,0.18)]">
      <div className="flex h-full flex-col">
        <button
          type="button"
          onClick={() => onOpenModal(product)}
          className="mb-2 inline-flex cursor-pointer text-[11px] font-semibold uppercase tracking-[0.08em] text-black transition hover:text-amber-700"
        >
          Подробнее
        </button>

        <div className="flex items-start gap-4">
          <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[14px] bg-[#f1f1ed]">
            <Image
              src={product.image}
              alt={product.title}
              fill
              className="object-cover"
              sizes="72px"
            />
          </div>

          <div className="flex min-w-0 flex-1 items-start justify-between gap-5">
            <div className="min-w-0 flex-1 pt-1">
              <div className="truncate text-[17px] font-semibold leading-tight text-black">
                {product.title}
              </div>

              <div className="mt-1 text-[12px] text-black/45">Артикул</div>
              <div className="truncate text-[14px] text-black/60">
                {product.article}
              </div>
            </div>

            <div className="flex shrink-0 items-start gap-6">
              <div className="w-[88px]">
                <div className="mb-1 text-center text-[12px] font-semibold text-black">
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

                  <div className="flex h-full min-w-[38px] items-center justify-center border-x border-black/10 text-[14px] font-semibold text-black">
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

              <div className="w-[145px]">
                <div className="mb-1 text-[12px] font-semibold text-black">
                  Цена
                </div>

                <div className="text-[15px] font-semibold leading-none text-black">
                  {formatMoney(basePrice, country)}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-auto rounded-[16px] bg-[#f5f5f3] px-3 py-2.5">
          <div className="flex items-center justify-between gap-4">
            <div className="flex min-w-0 flex-wrap items-center gap-3">
              <label className="flex items-center gap-2 text-[13px] font-semibold text-black">
                <span>Наценка %</span>
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
                  className="h-8 w-16 rounded-[10px] border border-black/10 bg-white px-2 text-[13px] font-semibold outline-none focus:border-amber-300"
                />
              </label>

              <div className="text-[14px] font-semibold text-black">
                цена с наценкой :{" "}
                <span className="text-red-600">
                  {formatMoney(finalUnitPrice, country)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onToggleCart(product.id)}
              className={cn(
                "inline-flex h-10 min-w-[126px] cursor-pointer items-center justify-center rounded-[14px] border px-4 text-[13px] font-semibold transition",
                isInCart
                  ? "border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700 hover:border-emerald-700"
                  : "border-black/10 bg-white text-black hover:border-amber-300 hover:bg-amber-50",
              )}
            >
              {isInCart ? "добавлено" : "в корзину"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
