"use client";

import { X } from "lucide-react";

import type { DealerOrder } from "./types";
import { formatMoney } from "./utils";

type Props = {
  order: DealerOrder | null;
  onClose: () => void;
  onConfirm: () => void;
};

export default function OrderConfirmModal({
  order,
  onClose,
  onConfirm,
}: Props) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-[860px] rounded-[28px] bg-white p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.35)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[26px] font-semibold leading-none text-black">
              Подтверждение заказа
            </div>

            <p className="mt-3 text-[14px] leading-6 text-black/60">
              Ниже показана версия заказа без наценки. Дилер видит только ее.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-black/10 bg-white text-black/60 transition hover:border-black/20 hover:text-black"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 rounded-[18px] border border-black/10 bg-[#fafaf8] p-4">
          <div className="grid gap-2 text-[13px] sm:grid-cols-3">
            <div>
              <div className="text-black/45">Номер заказа</div>
              <div className="mt-1 font-semibold text-black">
                {order.orderNumber}
              </div>
            </div>

            <div>
              <div className="text-black/45">Дата</div>
              <div className="mt-1 font-semibold text-black">
                {new Date(order.createdAt).toLocaleString("ru-RU")}
              </div>
            </div>

            <div>
              <div className="text-black/45">Позиций</div>
              <div className="mt-1 font-semibold text-black">
                {order.totalQty}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 max-h-[340px] overflow-auto rounded-[18px] border border-black/10">
          <table className="min-w-full border-collapse">
            <thead className="bg-[#fafaf8]">
              <tr className="text-left text-[12px] uppercase tracking-[0.06em] text-black/45">
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
                  <td className="px-4 py-3 font-medium text-black">
                    {item.title}
                  </td>
                  <td className="px-4 py-3 text-black/60">{item.article}</td>
                  <td className="px-4 py-3 text-black/60">
                    {item.color ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-black">{item.quantity}</td>
                  <td className="px-4 py-3 text-black">
                    {formatMoney(item.unitPrice, order.country)}
                  </td>
                  <td className="px-4 py-3 font-semibold text-black">
                    {formatMoney(item.totalPrice, order.country)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 rounded-[18px] border border-black/10 bg-[#fafaf8] p-4">
          <span className="text-[14px] text-black/60">Итого без наценки</span>
          <span className="text-[22px] font-semibold leading-none text-black">
            {formatMoney(order.visibleSubtotal, order.country)}
          </span>
        </div>

        <div className="mt-5">
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-[14px] border border-black bg-black px-4 text-[14px] font-semibold text-white transition hover:opacity-95"
          >
            Заказать
          </button>
        </div>
      </div>
    </div>
  );
}
