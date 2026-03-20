"use client";

import Link from "next/link";
import { Printer, ShoppingCart, Trash2, X } from "lucide-react";

import type { CartEntry } from "./types";
import { formatMoney } from "./utils";

type Props = {
  cartItems: CartEntry[];
  totalQty: number;
  subtotal: number;
  totalWithItemMarkup: number;
  globalMarkupPercent: number;
  globalMarkupAmount: number;
  total: number;
  country: "RU" | "UZ" | "KZ" | "TJ";
  onGlobalMarkupChange: (value: number) => void;
  onClearCart: () => void;
  onRemoveItem: (itemId: string) => void;
  onCheckout: () => void;
  onPrintBase: () => void;
  onPrintMarkup: () => void;
};

export default function OrderSidebar({
  cartItems,
  totalQty,
  subtotal,
  totalWithItemMarkup,
  globalMarkupPercent,
  globalMarkupAmount,
  total,
  country,
  onGlobalMarkupChange,
  onClearCart,
  onRemoveItem,
  onCheckout,
  onPrintBase,
  onPrintMarkup,
}: Props) {
  return (
    <aside className="h-fit rounded-[24px] border border-black/10 bg-white p-4 shadow-[0_10px_24px_-20px_rgba(0,0,0,0.18)] xl:sticky xl:top-6">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-[14px] bg-amber-50">
            <ShoppingCart className="h-5 w-5 text-amber-700" />
          </div>

          <div>
            <h2 className="text-[18px] font-semibold leading-none text-black">
              Корзина
            </h2>
            <p className="mt-1 text-[12px] text-black/45">
              {totalQty} ед. в заказе
            </p>
          </div>
        </div>

        {cartItems.length > 0 ? (
          <button
            type="button"
            onClick={onClearCart}
            className="inline-flex h-9 cursor-pointer items-center justify-center rounded-[12px] border border-black/10 px-3 text-[12px] font-medium text-black/65 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Очистить
          </button>
        ) : null}
      </div>

      <div className="mt-3 rounded-[18px] border border-black/10 bg-[#fafaf8] p-3">
        <label className="block">
          <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-black/45">
            Наценка на весь заказ
          </div>
          <input
            type="number"
            min={0}
            value={globalMarkupPercent}
            onChange={(event) => {
              const next = Number(event.target.value);
              onGlobalMarkupChange(
                Number.isFinite(next) && next >= 0 ? next : 0,
              );
            }}
            className="mt-2 h-10 w-full rounded-[14px] border border-black/10 bg-white px-3 text-[14px] font-semibold outline-none transition focus:border-amber-300"
          />
        </label>

        <p className="mt-2 text-[11px] leading-5 text-black/45">
          Применяется только к общему итогу корзины.
        </p>
      </div>

      <div className="mt-3 grid gap-2">
        {cartItems.length > 0 ? (
          cartItems.map((item) => (
            <div
              key={item.id}
              className="rounded-[18px] border border-black/10 bg-[#fafaf8] p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate text-[16px] font-semibold leading-none text-black">
                    {item.title}
                  </div>
                  <div className="mt-1 text-[11px] text-black/45">
                    {item.article}
                    {item.color ? ` • ${item.color}` : ""}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onRemoveItem(item.id)}
                  className="flex h-8 w-8 cursor-pointer shrink-0 items-center justify-center rounded-full border border-black/10 bg-white text-black/60 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <div className="mt-3 grid gap-1 text-[12px] text-black/65">
                <div className="flex items-center justify-between gap-3">
                  <span>Количество</span>
                  <span>{item.quantity}</span>
                </div>

                <div className="flex items-center justify-between gap-3">
                  <span>Итог без наценки</span>
                  <span className="font-semibold text-black">
                    {formatMoney(item.totalBasePrice, country)}
                  </span>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[18px] border border-dashed border-black/15 p-4 text-[13px] text-black/45">
            Пока пусто. Добавь модули в заказ.
          </div>
        )}
      </div>

      <div className="mt-3 space-y-3 rounded-[18px] border border-black/10 bg-[#fafaf8] p-4">
        <div className="flex items-center justify-between gap-3 text-[13px]">
          <span className="text-black/45">Без наценки</span>
          <span className="font-semibold text-black">
            {formatMoney(subtotal, country)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 text-[13px]">
          <span className="text-black/45">Товары с наценкой</span>
          <span className="font-semibold text-black">
            {formatMoney(totalWithItemMarkup, country)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 text-[13px]">
          <span className="text-black/45">
            Общая наценка {globalMarkupPercent}%
          </span>
          <span className="font-semibold text-[#e05b2b]">
            {formatMoney(globalMarkupAmount, country)}
          </span>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-black/10 pt-3">
          <span className="text-[13px] text-black/60">Итого</span>
          <span className="text-[22px] font-semibold leading-none text-black">
            {formatMoney(total, country)}
          </span>
        </div>
      </div>

      <div className="mt-3 grid gap-2.5">
        <button
          type="button"
          onClick={onCheckout}
          className="inline-flex h-11 cursor-pointer items-center justify-center rounded-[14px] border border-black bg-black px-4 text-[13px] font-semibold text-white transition hover:opacity-95"
        >
          Оформить заказ
        </button>

        <button
          type="button"
          onClick={onPrintBase}
          className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-[14px] border border-black/10 bg-white px-4 text-[13px] font-semibold text-black transition hover:border-black/20"
        >
          <Printer className="h-4 w-4" />
          Без наценки
        </button>

        <button
          type="button"
          onClick={onPrintMarkup}
          className="inline-flex h-11 cursor-pointer items-center justify-center gap-2 rounded-[14px] border border-amber-300 bg-amber-50 px-4 text-[13px] font-semibold text-black transition hover:bg-amber-100"
        >
          <Printer className="h-4 w-4" />С наценкой
        </button>
      </div>

      <div className="mt-6 border-t border-black/10 pt-4">
        <Link
          href="/dealer/orders"
          className="inline-flex h-12 w-full items-center justify-center rounded-[14px] border border-black/10 bg-white px-4 text-[14px] font-semibold text-black transition hover:border-black/20"
        >
          Мои заказы
        </Link>
      </div>
    </aside>
  );
}
