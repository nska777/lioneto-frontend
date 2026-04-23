"use client";

import { Clock3, X } from "lucide-react";

type Props = {
  open: boolean;
  hours: number;
  maxHours: number;
  remainingHours: number;
  isSubmitting?: boolean;
  onChangeHours: (value: number) => void;
  onClose: () => void;
  onConfirm: () => void;
};

export default function ExtendReservationModal({
  open,
  hours,
  maxHours,
  remainingHours,
  isSubmitting = false,
  onChangeHours,
  onClose,
  onConfirm,
}: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[160] flex items-center justify-center bg-black/45 p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-[520px] rounded-[28px] bg-white p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.35)]"
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-black/10 bg-white text-black/55 transition hover:border-black/20 hover:text-black"
          aria-label="Закрыть"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="pr-10">
          <div className="flex items-center gap-2 text-[28px] font-semibold leading-none text-black">
            <Clock3 className="h-6 w-6" />
            Продлить бронь
          </div>

          <p className="mt-3 text-[15px] leading-6 text-black/60">
            Укажите, на сколько часов продлить бронь.
          </p>
        </div>

        <div className="mt-5 rounded-[18px] border border-black/8 bg-[#faf9f6] p-4">
          <div className="flex items-center justify-between gap-3 text-[14px]">
            <span className="text-black/55">Доступно для продления</span>
            <span className="font-semibold text-black">
              {remainingHours} ч.
            </span>
          </div>

          <div className="mt-2 flex items-center justify-between gap-3 text-[14px]">
            <span className="text-black/55">Максимальный лимит</span>
            <span className="font-semibold text-black">{maxHours} ч.</span>
          </div>
        </div>

        <div className="mt-5">
          <label className="mb-2 block text-[13px] font-medium text-black/70">
            Часы продления
          </label>

          <div className="inline-flex h-[48px] items-center rounded-[16px] border border-black/10 bg-[#fafaf8] px-2">
            <button
              type="button"
              onClick={() => onChangeHours(Math.max(1, hours - 1))}
              className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-lg text-black transition hover:bg-black/5"
              aria-label="Уменьшить количество часов"
              disabled={isSubmitting}
            >
              −
            </button>

            <div className="min-w-[64px] text-center text-[16px] font-semibold text-black">
              {hours}
            </div>

            <button
              type="button"
              onClick={() => onChangeHours(Math.min(remainingHours, hours + 1))}
              className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full text-lg text-black transition hover:bg-black/5"
              aria-label="Увеличить количество часов"
              disabled={isSubmitting}
            >
              +
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-[52px] w-full cursor-pointer items-center justify-center rounded-[16px] border border-black/10 bg-white px-5 text-[15px] font-semibold text-black transition hover:bg-black/[0.03]"
            disabled={isSubmitting}
          >
            Отмена
          </button>

          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex min-h-[52px] w-full cursor-pointer items-center justify-center rounded-[16px] border border-black bg-black px-5 text-[15px] font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={isSubmitting || remainingHours <= 0}
          >
            {isSubmitting ? "Продлеваем..." : `Продлить на ${hours} ч.`}
          </button>
        </div>
      </div>
    </div>
  );
}
