"use client";

import { X } from "lucide-react";
import { useEffect, useState } from "react";

type Props = {
  open: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onConfirm: (hours: number) => void;
};

export default function ReserveOrderModal({
  open,
  isSubmitting = false,
  onClose,
  onConfirm,
}: Props) {
  const [hours, setHours] = useState(24);

  useEffect(() => {
    if (open) {
      setHours(24);
    }
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-[560px] rounded-[28px] bg-white p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.35)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[26px] font-semibold leading-none text-black">
              Забронировать заказ
            </div>
            <p className="mt-3 text-[14px] leading-6 text-black/60">
              Выберите срок брони от 1 до 48 часов.
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

        <div className="mt-5 rounded-[20px] border border-black/10 bg-[#fafaf8] p-4">
          <div className="text-[14px] font-medium text-black/70">
            Часы брони
          </div>

          <div className="mt-4 flex items-center gap-3">
            <input
              type="range"
              min={1}
              max={48}
              value={hours}
              onChange={(e) => setHours(Number(e.target.value))}
              className="w-full cursor-pointer"
            />
            <div className="min-w-[72px] rounded-[14px] border border-black/10 bg-white px-3 py-2 text-center text-[18px] font-semibold text-black">
              {hours}ч
            </div>
          </div>

          <div className="mt-3 grid grid-cols-4 gap-2">
            {[1, 6, 12, 24, 36, 48].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setHours(value)}
                className={[
                  "inline-flex min-h-[42px] cursor-pointer items-center justify-center rounded-full border px-3 text-sm font-medium transition",
                  hours === value
                    ? "border-black bg-black text-white"
                    : "border-black/10 bg-white text-black hover:border-black/20",
                ].join(" ")}
              >
                {value}ч
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5">
          <button
            type="button"
            onClick={() => onConfirm(hours)}
            disabled={isSubmitting}
            className="inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-[14px] border border-black bg-black px-4 text-[14px] font-semibold text-white transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? "Бронируем..." : "Подтвердить бронь"}
          </button>
        </div>
      </div>
    </div>
  );
}
