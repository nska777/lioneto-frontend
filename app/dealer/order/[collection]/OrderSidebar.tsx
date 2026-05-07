"use client";

import Link from "next/link";
import { Archive, Printer, ShoppingCart, Trash2, X } from "lucide-react";

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
  onReserveOrder: () => void;
};

function formatReservationDate(value?: string) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("ru-RU");
}

function formatDealerMoney(value: number, country: DealerCountryCode) {
  const formatted = formatMoney(value, country);

  if (country === "UZ") {
    return formatted.replace("UZS", "сум");
  }

  return formatted;
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

function PriceRow({
  qty,
  unitPrice,
  totalPrice,
  country,
}: {
  qty: number;
  unitPrice: number;
  totalPrice: number;
  country: DealerCountryCode;
}) {
  return (
    <div className="mt-3 rounded-[16px] bg-[#f6f4ee] p-3">
      <div className="grid grid-cols-[54px_minmax(0,1fr)_minmax(0,1fr)] gap-2 text-[10px] font-semibold uppercase tracking-[0.08em] text-black/30">
        <div>Кол-во</div>
        <div className="text-center">Цена</div>
        <div className="text-right">Сумма</div>
      </div>

      <div className="mt-1 grid grid-cols-[54px_minmax(0,1fr)_minmax(0,1fr)] gap-2 text-[13px] font-semibold leading-tight text-black">
        <div>{qty}</div>

        <div className="min-w-0 text-center">
          <span className="break-words">
            {formatDealerMoney(unitPrice, country)}
          </span>
        </div>

        <div className="min-w-0 text-right">
          <span className="break-words">
            {formatDealerMoney(totalPrice, country)}
          </span>
        </div>
      </div>
    </div>
  );
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
  onReserveOrder,
}: Props) {
  const groupedItems = groupCartItems(cartItems);
  const isEmpty = cartItems.length === 0;

  return (
    <aside className="rounded-[24px] border border-black/10 bg-white shadow-[0_10px_24px_-20px_rgba(0,0,0,0.18)]">
      <div className="flex items-center justify-between gap-3 border-b border-black/10 px-4 py-4">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-black text-white">
            <ShoppingCart className="h-5 w-5" />
          </div>

          <div className="min-w-0">
            <div className="text-[17px] font-semibold text-black">Корзина</div>
            <div className="text-[12px] text-black/45">
              {cartItems.length} поз. / {totalQty} ед.
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onClearCart}
          disabled={isEmpty}
          className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-full border border-black/10 px-3 text-[13px] font-medium text-black transition hover:bg-black/[0.03] disabled:cursor-not-allowed disabled:opacity-45"
        >
          <Trash2 className="h-4 w-4" />
          Очистить
        </button>
      </div>

      <div className="p-4">
        {isEmpty ? (
          <div className="rounded-[24px] border border-dashed border-black/10 px-5 py-12 text-center">
            <div className="text-[17px] font-semibold text-black/85">
              Корзина пока пустая
            </div>
            <div className="mx-auto mt-3 max-w-[280px] text-[13px] leading-6 text-black/45">
              Добавьте основной товар и соберите комплект из обязательных и
              рекомендованных элементов.
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {groupedItems.map(({ product, addons }) => (
              <div
                key={product.id}
                className="rounded-[22px] border border-black/10 bg-[#fafaf8] p-3"
              >
                <div className="relative rounded-[18px] border border-black/8 bg-white p-4 shadow-[0_8px_20px_-20px_rgba(0,0,0,0.2)]">
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

                  <div className="mt-4 pr-2">
                    <div className="text-[14px] font-semibold leading-5 text-black">
                      {product.title}
                    </div>

                    {product.article ? (
                      <div className="mt-2 text-[12px] text-black/45">
                        Артикул:{" "}
                        <span className="font-medium text-black/65">
                          {product.article}
                        </span>
                      </div>
                    ) : null}

                    {product.color ? (
                      <div className="mt-1 text-[12px] text-black/45">
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

                  <PriceRow
                    qty={product.quantity}
                    unitPrice={product.unitFinalPrice}
                    totalPrice={product.totalFinalPrice}
                    country={country}
                  />

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
                          </div>

                          <div className="mt-3 pr-8 text-[13px] font-semibold leading-5 text-black">
                            {addon.title}
                          </div>

                          {addon.article ? (
                            <div className="mt-1 text-[12px] text-black/45">
                              Артикул:{" "}
                              <span className="font-medium text-black/65">
                                {addon.article}
                              </span>
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

                          <PriceRow
                            qty={addon.quantity}
                            unitPrice={addon.unitFinalPrice}
                            totalPrice={addon.totalFinalPrice}
                            country={country}
                          />
                        </div>
                      ))}
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-5 rounded-[22px] bg-[#f6f4ee] px-5 py-4">
          <div className="flex items-center justify-between gap-4">
            <span className="text-[15px] font-medium text-black/45">Итого</span>
            <span className="text-[18px] font-semibold text-black">
              {formatDealerMoney(subtotal, country)}
            </span>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <button
            type="button"
            onClick={onCheckout}
            disabled={isEmpty}
            className="inline-flex min-h-[56px] w-full cursor-pointer items-center justify-center rounded-[18px] bg-black px-5 text-[17px] font-semibold text-white transition hover:bg-black/90 disabled:cursor-not-allowed disabled:bg-black/20"
          >
            Оформить заказ
          </button>

          <button
            type="button"
            onClick={onReserveOrder}
            disabled={isEmpty}
            className="inline-flex min-h-[52px] w-full cursor-pointer items-center justify-center gap-2 rounded-[18px] border border-red-200 bg-red-50 px-5 text-[16px] font-medium text-red-700 transition hover:bg-red-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Archive className="h-5 w-5" />
            Забронировать заказ
          </button>

          <button
            type="button"
            onClick={onPrintBase}
            disabled={isEmpty}
            className="inline-flex min-h-[52px] w-full cursor-pointer items-center justify-center gap-2 rounded-[18px] border border-black/10 bg-white px-5 text-[16px] font-medium text-black transition hover:bg-black/[0.03] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Printer className="h-5 w-5" />
            Печать
          </button>

          <Link
            href="/dealer/orders"
            className="inline-flex min-h-[52px] w-full cursor-pointer items-center justify-center rounded-[18px] border border-black/10 bg-white px-5 text-[16px] font-medium text-black transition hover:bg-black/[0.03]"
          >
            Мои заказы
          </Link>
        </div>
      </div>
    </aside>
  );
}
