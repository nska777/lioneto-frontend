"use client";

import { CheckCircle2, X } from "lucide-react";

type ReservationSuccessModalProps = {
  open: boolean;
  productTitle?: string;
  onClose: () => void;
};

export default function ReservationSuccessModal({
  open,
  productTitle,
  onClose,
}: ReservationSuccessModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-4">
      <div className="relative w-full max-w-[460px] rounded-[28px] bg-white p-6 shadow-[0_20px_80px_rgba(0,0,0,0.22)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-black/10 text-black/55 transition hover:bg-black/5 hover:text-black"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="flex flex-col items-center text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
            <CheckCircle2 className="h-9 w-9 text-emerald-600" />
          </div>

          <h3 className="mt-5 text-[24px] font-semibold tracking-[-0.02em] text-black">
            Товар забронирован
          </h3>

          <p className="mt-3 text-[15px] leading-7 text-black/65">
            Мы успешно забронировали товар на{" "}
            <span className="font-semibold text-emerald-700">24 часа</span>.
          </p>

          {productTitle ? (
            <div className="mt-4 rounded-2xl bg-[#f6f7f5] px-4 py-3 text-[14px] text-black/75">
              <span className="text-black/45">Товар:</span>{" "}
              <span className="font-medium text-black">{productTitle}</span>
            </div>
          ) : null}

          <div className="mt-6 w-full rounded-2xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-[14px] leading-6 text-black/70">
            Если заказ не будет оформлен в течение этого времени, бронь может
            быть автоматически снята.
          </div>

          <div className="mt-6 flex w-full">
            <button
              type="button"
              onClick={onClose}
              className="inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-xl bg-emerald-600 px-4 text-[14px] font-medium text-white transition hover:bg-emerald-700"
            >
              Продолжить
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
