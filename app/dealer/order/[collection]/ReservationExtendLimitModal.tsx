"use client";

import { AlertTriangle, X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
};

export default function ReservationExtendLimitModal({ open, onClose }: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[170] flex items-center justify-center bg-black/45 p-4"
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
            <AlertTriangle className="h-6 w-6 text-amber-600" />
            Лимит исчерпан
          </div>

          <p className="mt-3 text-[15px] leading-6 text-black/60">
            Вы уже использовали весь доступный лимит продления для этой брони.
          </p>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={onClose}
            className="inline-flex min-h-[52px] w-full cursor-pointer items-center justify-center rounded-[16px] border border-black bg-black px-5 text-[15px] font-semibold text-white transition hover:opacity-95"
          >
            Понятно
          </button>
        </div>
      </div>
    </div>
  );
}
