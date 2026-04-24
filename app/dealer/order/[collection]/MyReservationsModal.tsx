"use client";

import { Printer, X } from "lucide-react";
import type { DealerCountryCode } from "@/app/lib/dealer/shop";
import type { ReservationOrder } from "./types";
import { formatMoney } from "./utils";

type Props = {
  open: boolean;
  country: DealerCountryCode;
  reservations: ReservationOrder[];
  isLoading?: boolean;
  onClose: () => void;
  onPrint: (reservationNumber: string) => void;
  onCheckout: (reservationNumber: string) => void;
  onExtend: (reservationNumber: string) => void;
};

function formatReservationDate(value?: string) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("ru-RU");
}

function ReservationsLoadingState() {
  return (
    <div className="overflow-hidden rounded-[26px] border border-black/10 bg-[#fafaf8] p-4">
      <div className="flex items-center gap-3">
        <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-red-50">
          <div className="absolute h-11 w-11 animate-ping rounded-full bg-red-200/60" />
          <div className="relative h-5 w-5 animate-spin rounded-full border-2 border-red-200 border-t-red-600" />
        </div>

        <div className="min-w-0">
          <div className="text-[15px] font-semibold text-black">
            Загружаем ваши брони
          </div>
          <div className="mt-1 text-[13px] text-black/45">
            Проверяем активные забронированные заказы...
          </div>
        </div>
      </div>

      <div className="mt-5 space-y-3">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="rounded-[22px] border border-black/10 bg-white p-4"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="h-4 w-36 animate-pulse rounded-full bg-black/10" />
                <div className="mt-3 h-3 w-56 animate-pulse rounded-full bg-black/5" />
                <div className="mt-2 h-3 w-44 animate-pulse rounded-full bg-black/5" />
              </div>

              <div className="h-8 w-20 animate-pulse rounded-full bg-red-100" />
            </div>

            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="h-12 animate-pulse rounded-[16px] bg-black/5" />
              <div className="h-12 animate-pulse rounded-[16px] bg-black/5" />
              <div className="h-12 animate-pulse rounded-[16px] bg-black/5" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function MyReservationsModal({
  open,
  country,
  reservations,
  isLoading = false,
  onClose,
  onPrint,
  onCheckout,
  onExtend,
}: Props) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[145] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-[980px] rounded-[28px] bg-white p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.35)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[26px] font-semibold leading-none text-black">
              Мои брони
            </div>
            <p className="mt-3 text-[14px] leading-6 text-black/60">
              Здесь отображаются все активные забронированные заказы.
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

        <div className="mt-5 max-h-[70vh] space-y-4 overflow-y-auto">
          {isLoading ? (
            <ReservationsLoadingState />
          ) : reservations.length === 0 ? (
            <div className="rounded-[26px] border border-dashed border-black/10 bg-[#fafaf8] px-6 py-12 text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-black/[0.03]">
                <span className="text-[20px] text-black/40">—</span>
              </div>

              <div className="mt-4 text-[15px] font-semibold text-black/70">
                Активных броней пока нет
              </div>

              <div className="mx-auto mt-2 max-w-[360px] text-[13px] leading-6 text-black/45">
                Когда вы забронируете заказ, он появится здесь.
              </div>
            </div>
          ) : (
            reservations.map((reservation) => (
              <div
                key={reservation.reservationNumber}
                className="rounded-[22px] border border-black/10 bg-[#fafaf8] p-4"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <div className="text-[18px] font-semibold text-black">
                      {reservation.reservationNumber}
                    </div>

                    <div className="mt-1 text-[13px] text-black/55">
                      Бронь до:{" "}
                      {formatReservationDate(reservation.reservedUntil)}
                    </div>

                    <div className="mt-1 text-[13px] text-black/55">
                      Позиций: {reservation.totalQty}
                    </div>
                  </div>

                  <div className="text-[20px] font-semibold text-black">
                    {formatMoney(reservation.subtotal, country)}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  {reservation.items.map((item) => (
                    <div
                      key={item.id}
                      className="rounded-[16px] border border-black/8 bg-white px-4 py-3"
                    >
                      <div className="text-[14px] font-semibold text-black">
                        {item.title}
                      </div>

                      <div className="mt-1 text-[12px] text-black/50">
                        {item.article} {item.color ? `• ${item.color}` : ""}{" "}
                        {item.size ? `• ${item.size}` : ""}
                      </div>

                      <div className="mt-2 flex items-center justify-between gap-3 text-[13px]">
                        <span className="text-black/55">
                          Кол-во: {item.quantity}
                        </span>

                        <span className="font-semibold text-black">
                          {formatMoney(item.totalBasePrice, country)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 grid gap-2 sm:grid-cols-3">
                  <button
                    type="button"
                    onClick={() => onExtend(reservation.reservationNumber)}
                    className="inline-flex min-h-[46px] cursor-pointer items-center justify-center rounded-full border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-700 transition hover:bg-red-100"
                  >
                    Продлить бронь
                  </button>

                  <button
                    type="button"
                    onClick={() => onPrint(reservation.reservationNumber)}
                    className="inline-flex min-h-[46px] cursor-pointer items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 text-sm font-semibold text-black transition hover:bg-black/[0.03]"
                  >
                    <Printer className="h-4 w-4" />
                    Печать
                  </button>

                  <button
                    type="button"
                    onClick={() => onCheckout(reservation.reservationNumber)}
                    className="inline-flex min-h-[46px] cursor-pointer items-center justify-center rounded-full bg-black px-4 text-sm font-semibold text-white transition hover:bg-black/90"
                  >
                    Оформить заказ
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
