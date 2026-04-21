"use client";

import Link from "next/link";
import { Printer, ShoppingCart, Trash2, X } from "lucide-react";

import type { DealerCountryCode } from "@/app/lib/dealer/shop";
import type { CartEntry } from "./types";
import { formatMoney } from "./utils";

type Props = {
  cartItems: CartEntry[];
  totalQty: number;
  subtotal: number;
  country: DealerCountryCode;
  onClearCart: () => void;
  onRemoveItem: (itemId: string) => void;
  onCheckout: () => void;
  onPrintBase: () => void;
};

function formatReservationDate(value?: string) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("ru-RU");
}

function groupCartItems(items: CartEntry[]) {
  const products = items.filter(
    (item): item is Extract<CartEntry, { kind: "product" }> =>
      item.kind === "product",
  );

  const addons = items.filter(
    (item): item is Extract<CartEntry, { kind: "addon" }> =>
      item.kind === "addon",
  );

  return products.map((product) => ({
    product,
    addons: addons.filter(
      (addon) => addon.parentProductId === product.productId,
    ),
  }));
}

export default function OrderSidebar({
  cartItems,
  totalQty,
  subtotal,
  country,
  onClearCart,
  onRemoveItem,
  onCheckout,
  onPrintBase,
}: Props) {
  const groupedItems = groupCartItems(cartItems);
  const isEmpty = cartItems.length === 0;

  return (
    <aside className="rounded-[24px] border border-black/10 bg-white shadow-[0_10px_24px_-20px_rgba(0,0,0,0.18)]">
      <div className="flex items-center justify-between gap-3 border-b border-black/10 px-5 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-black text-white">
            <ShoppingCart className="h-6 w-6" />
          </div>

          <div className="min-w-0">
            <div className="text-[18px] font-semibold text-black">Корзина</div>
            <div className="text-[13px] text-black/45">
              {totalQty} поз. / {cartItems.length} ед.
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClearCart}
          disabled={isEmpty}
          className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-black/10 px-4 py-2 text-[14px] font-medium text-black transition hover:bg-black/[0.03] disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Trash2 className="h-4 w-4" />
          Очистить
        </button>
      </div>

      <div className="px-5 py-5">
        {isEmpty ? (
          <div className="rounded-[28px] border border-dashed border-black/10 px-6 py-14 text-center">
            <div className="text-[18px] font-semibold text-black/85">
              Корзина пока пустая
            </div>
            <div className="mx-auto mt-3 max-w-[280px] text-[14px] leading-7 text-black/45">
              Добавьте основной товар и соберите комплект из обязательных и
              рекомендованных элементов.
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {groupedItems.map(({ product, addons }) => (
              <div
                key={product.id}
                className="rounded-[28px] border border-black/10 bg-[#fafaf8] p-3"
              >
                <div className="relative rounded-[22px] border border-black/8 bg-white p-4 shadow-[0_8px_20px_-20px_rgba(0,0,0,0.2)]">
                  <button
                    type="button"
                    onClick={() => onRemoveItem(product.id)}
                    className="absolute right-3 top-3 inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border border-black/10 text-black/45 transition hover:bg-black/[0.04] hover:text-black"
                    aria-label="Удалить товар"
                  >
                    <X className="h-4 w-4" />
                  </button>

                  <div className="flex flex-wrap gap-2 pr-10">
                    <span className="inline-flex rounded-full border border-black/10 bg-[#f6f4ee] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-black/55">
                      Основной товар
                    </span>

                    {product.collectionSlug ? (
                      <span className="inline-flex rounded-full border border-black/10 bg-[#f6f4ee] px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-black/35">
                        {product.collectionSlug}
                      </span>
                    ) : null}

                    {product.isReserved ? (
                      <span className="inline-flex rounded-full border border-red-200 bg-red-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-red-700">
                        Забронировано
                      </span>
                    ) : null}
                  </div>

                  <div className="mt-4">
                    <div className="text-[15px] font-semibold leading-5 text-black">
                      {product.title}
                    </div>

                    {product.article ? (
                      <div className="mt-2 text-[13px] text-black/45">
                        {product.article}
                      </div>
                    ) : null}

                    {product.color ? (
                      <div className="mt-1 text-[13px] text-black/45">
                        Цвет:{" "}
                        <span className="font-medium text-black/65">
                          {product.color}
                        </span>
                      </div>
                    ) : null}

                    {product.isReserved && product.reservedUntil ? (
                      <div className="mt-2 text-[12px] text-red-600">
                        Бронь до: {formatReservationDate(product.reservedUntil)}
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-4 rounded-[18px] bg-[#f6f4ee] px-4 py-3">
                    <div className="grid grid-cols-[56px_minmax(90px,1fr)_minmax(90px,1fr)] gap-3 text-[11px] uppercase tracking-[0.08em] text-black/28">
                      <div>Кол-во</div>
                      <div className="text-center">Цена</div>
                      <div className="text-right">Сумма</div>
                    </div>

                    <div className="mt-1 grid grid-cols-[56px_minmax(90px,1fr)_minmax(90px,1fr)] gap-3 text-[14px] font-semibold text-black">
                      <div>{product.quantity}</div>

                      <div className="text-center leading-tight">
                        <div className="break-words">
                          {formatMoney(product.unitFinalPrice, country)}
                        </div>
                      </div>

                      <div className="text-right leading-tight">
                        <div className="break-words">
                          {formatMoney(product.totalFinalPrice, country)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {addons.length > 0 ? (
                    <div className="mt-4 space-y-3 border-t border-dashed border-black/10 pt-4">
                      {addons.map((addon) => (
                        <div
                          key={addon.id}
                          className="relative ml-3 rounded-[18px] border border-emerald-100 bg-emerald-50/60 p-3"
                        >
                          <div className="absolute -left-3 top-1/2 h-[1px] w-3 bg-emerald-300" />

                          <button
                            type="button"
                            onClick={() => onRemoveItem(addon.id)}
                            className="absolute right-3 top-3 inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border border-black/10 bg-white text-black/45 transition hover:bg-black/[0.04] hover:text-black"
                            aria-label="Удалить комплектующий товар"
                          >
                            <X className="h-4 w-4" />
                          </button>

                          <div className="flex flex-wrap gap-2 pr-9">
                            <span className="inline-flex rounded-full border border-emerald-200 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-emerald-700">
                              {addon.addonKind === "required"
                                ? "Обязательный"
                                : "Рекомендуемый"}
                            </span>

                            {addon.parentProductTitle ? (
                              <span className="inline-flex rounded-full border border-black/10 bg-white px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.08em] text-black/35">
                                Для: {addon.parentProductTitle}
                              </span>
                            ) : null}
                          </div>

                          <div className="mt-3 text-[14px] font-semibold leading-5 text-black">
                            {addon.title}
                          </div>

                          {addon.article ? (
                            <div className="mt-1 text-[12px] text-black/45">
                              {addon.article}
                            </div>
                          ) : null}

                          {addon.color ? (
                            <div className="mt-1 text-[12px] text-black/45">
                              Цвет:{" "}
                              <span className="font-medium text-black/65">
                                {addon.color}
                              </span>
                            </div>
                          ) : null}

                          <div className="mt-3 rounded-[14px] bg-white px-3 py-2">
                            <div className="grid grid-cols-[52px_minmax(80px,1fr)_minmax(80px,1fr)] gap-2 text-[10px] uppercase tracking-[0.08em] text-black/28">
                              <div>Кол-во</div>
                              <div className="text-center">Цена</div>
                              <div className="text-right">Сумма</div>
                            </div>

                            <div className="mt-1 grid grid-cols-[52px_minmax(80px,1fr)_minmax(80px,1fr)] gap-2 text-[13px] font-semibold text-black">
                              <div>{addon.quantity}</div>

                              <div className="text-center leading-tight">
                                <div className="break-words">
                                  {formatMoney(addon.unitFinalPrice, country)}
                                </div>
                              </div>

                              <div className="text-right leading-tight">
                                <div className="break-words">
                                  {formatMoney(addon.totalFinalPrice, country)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 rounded-[26px] bg-[#f6f4ee] px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[15px] font-medium text-black/45">Итого</span>
            <span className="text-[18px] font-semibold text-black">
              {formatMoney(subtotal, country)}
            </span>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <button
            type="button"
            onClick={onCheckout}
            disabled={isEmpty}
            className="inline-flex min-h-[58px] w-full cursor-pointer items-center justify-center rounded-[18px] bg-black px-5 text-[18px] font-semibold text-white transition hover:bg-black/90 disabled:cursor-not-allowed disabled:bg-black/20"
          >
            Заказать
          </button>

          <button
            type="button"
            onClick={onPrintBase}
            disabled={isEmpty}
            className="inline-flex min-h-[54px] w-full cursor-pointer items-center justify-center gap-2 rounded-[18px] border border-black/10 bg-white px-5 text-[18px] font-medium text-black transition hover:bg-black/[0.03] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Printer className="h-5 w-5" />
            Печать
          </button>

          <Link
            href="/dealer/orders"
            className="inline-flex min-h-[54px] w-full cursor-pointer items-center justify-center rounded-[18px] border border-black/10 bg-white px-5 text-[18px] font-medium text-black transition hover:bg-black/[0.03]"
          >
            Мои заказы
          </Link>
        </div>
      </div>
    </aside>
  );
}
