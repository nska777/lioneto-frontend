"use client";

import Link from "next/link";
import { Fragment, useEffect, useState } from "react";
import { ArrowLeft, ChevronDown, Printer } from "lucide-react";

import { loadOrders } from "../order/[collection]/storage";
import { openSavedOrderPrintWindow } from "../order/[collection]/order-utils";
import type { DealerOrder } from "../order/[collection]/types";
import { formatMoney } from "../order/[collection]/utils";

function getOrderCollections(order: DealerOrder) {
  if (
    Array.isArray(order.collectionSlugs) &&
    order.collectionSlugs.length > 0
  ) {
    return order.collectionSlugs.join(", ");
  }

  if (typeof order.collectionSlug === "string" && order.collectionSlug) {
    return order.collectionSlug;
  }

  return "-";
}

export default function DealerOrdersPage() {
  const [orders, setOrders] = useState<DealerOrder[]>([]);
  const [openedOrderId, setOpenedOrderId] = useState<string | null>(null);

  useEffect(() => {
    setOrders(loadOrders());
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-[1460px] flex-col gap-4">
      <div className="rounded-[24px] border border-black/10 bg-white p-5 shadow-[0_10px_24px_-20px_rgba(0,0,0,0.18)]">
        <Link
          href="/dealer/order"
          className="inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-1.5 text-[12px] font-medium text-black/60 transition hover:bg-black/[0.03] hover:text-black"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад к заказу
        </Link>

        <h1 className="mt-4 text-[34px] font-semibold leading-none text-black">
          Мои заказы
        </h1>
        <p className="mt-2 text-[14px] text-black/55">
          Здесь отображаются сохраненные заказы и их состав.
        </p>
      </div>

      <div className="rounded-[24px] border border-black/10 bg-white shadow-[0_10px_24px_-20px_rgba(0,0,0,0.18)]">
        {orders.length === 0 ? (
          <div className="p-6 text-[14px] text-black/45">Заказов пока нет.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead className="bg-[#fafaf8]">
                <tr className="text-left text-[12px] uppercase tracking-[0.06em] text-black/45">
                  <th className="px-4 py-4">Дата</th>
                  <th className="px-4 py-4">Номер заказа</th>
                  <th className="px-4 py-4">Коллекции</th>
                  <th className="px-4 py-4">Позиций</th>
                  <th className="px-4 py-4">Итого без наценки</th>
                  <th className="px-4 py-4">Действия</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => {
                  const isOpen = openedOrderId === order.id;

                  return (
                    <Fragment key={order.id}>
                      <tr className="border-t border-black/10 text-[14px]">
                        <td className="px-4 py-4 text-black/65">
                          {new Date(order.createdAt).toLocaleString("ru-RU")}
                        </td>
                        <td className="px-4 py-4 font-semibold text-black">
                          {order.orderNumber}
                        </td>
                        <td className="px-4 py-4 text-black/65">
                          {getOrderCollections(order)}
                        </td>
                        <td className="px-4 py-4 text-black">
                          {order.totalQty}
                        </td>
                        <td className="px-4 py-4 font-semibold text-black">
                          {formatMoney(order.visibleSubtotal, order.country)}
                        </td>
                        <td className="px-4 py-4">
                          <div className="flex flex-wrap gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                setOpenedOrderId(isOpen ? null : order.id)
                              }
                              className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-[12px] border border-black/10 bg-white px-3 text-[13px] font-medium text-black transition hover:border-black/20"
                            >
                              <ChevronDown className="h-4 w-4" />
                              {isOpen ? "Скрыть" : "Открыть"}
                            </button>

                            <button
                              type="button"
                              onClick={() => openSavedOrderPrintWindow(order)}
                              className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-[12px] border border-black/10 bg-white px-3 text-[13px] font-medium text-black transition hover:border-black/20"
                            >
                              <Printer className="h-4 w-4" />
                              Печать
                            </button>
                          </div>
                        </td>
                      </tr>

                      {isOpen ? (
                        <tr className="border-t border-black/10 bg-[#fcfcfa]">
                          <td colSpan={6} className="px-4 py-4">
                            <div className="overflow-x-auto rounded-[18px] border border-black/10 bg-white">
                              <table className="min-w-full border-collapse">
                                <thead className="bg-[#fafaf8]">
                                  <tr className="text-left text-[12px] uppercase tracking-[0.06em] text-black/45">
                                    <th className="px-4 py-3">Коллекция</th>
                                    <th className="px-4 py-3">Наименование</th>
                                    <th className="px-4 py-3">Артикул</th>
                                    <th className="px-4 py-3">Цвет</th>
                                    <th className="px-4 py-3">Кол-во</th>
                                    <th className="px-4 py-3">Цена</th>
                                    <th className="px-4 py-3">Сумма</th>
                                  </tr>
                                </thead>

                                <tbody>
                                  {order.visibleItems.map((item) => (
                                    <tr
                                      key={item.id}
                                      className="border-t border-black/10 text-[14px]"
                                    >
                                      <td className="px-4 py-3 text-black/60">
                                        {typeof item.collectionSlug ===
                                          "string" && item.collectionSlug
                                          ? item.collectionSlug
                                          : order.collectionSlug || "-"}
                                      </td>
                                      <td className="px-4 py-3 font-medium text-black">
                                        {item.title}
                                      </td>
                                      <td className="px-4 py-3 text-black/60">
                                        {item.article}
                                      </td>
                                      <td className="px-4 py-3 text-black/60">
                                        {item.color ?? "-"}
                                      </td>
                                      <td className="px-4 py-3 text-black">
                                        {item.quantity}
                                      </td>
                                      <td className="px-4 py-3 text-black">
                                        {formatMoney(
                                          item.unitPrice,
                                          order.country,
                                        )}
                                      </td>
                                      <td className="px-4 py-3 font-semibold text-black">
                                        {formatMoney(
                                          item.totalPrice,
                                          order.country,
                                        )}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>

                            <div className="mt-3 flex items-center justify-between rounded-[18px] border border-black/10 bg-white p-4">
                              <span className="text-[14px] text-black/60">
                                Итого без наценки
                              </span>
                              <span className="text-[20px] font-semibold leading-none text-black">
                                {formatMoney(
                                  order.visibleSubtotal,
                                  order.country,
                                )}
                              </span>
                            </div>
                          </td>
                        </tr>
                      ) : null}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
