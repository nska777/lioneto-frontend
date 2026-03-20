"use client";

import Link from "next/link";
import { X } from "lucide-react";

import type { DealerOrder } from "./types";
import { formatMoney } from "./utils";

type Props = {
  order: DealerOrder | null;
  onClose: () => void;
};

export default function OrderSuccessModal({ order, onClose }: Props) {
  if (!order) return null;

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-[760px] rounded-[28px] bg-white p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.35)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[26px] font-semibold leading-none text-black">
              Ваш заказ оформлен
            </div>

            <p className="mt-3 text-[14px] leading-6 text-black/60">
              Заказ сохранен. В разделе «Мои заказы» отображается версия без
              наценки.
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

        <div className="mt-4 flex items-center justify-between gap-3 rounded-[18px] border border-black/10 bg-[#fafaf8] p-4">
          <span className="text-[14px] text-black/60">Итого без наценки</span>
          <span className="text-[22px] font-semibold leading-none text-black">
            {formatMoney(order.visibleSubtotal, order.country)}
          </span>
        </div>

        <div className="mt-5">
          <Link
            href="/dealer/orders"
            className="inline-flex h-12 w-full items-center justify-center rounded-[14px] border border-black bg-black px-4 text-[14px] font-semibold text-white transition hover:opacity-95"
          >
            Мои заказы
          </Link>
        </div>
      </div>
    </div>
  );
}
