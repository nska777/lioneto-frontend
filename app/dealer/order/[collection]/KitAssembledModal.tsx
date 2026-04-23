"use client";

import { ShoppingBag, X } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  onContinue: () => void;
};

export default function KitAssembledModal({
  open,
  onClose,
  onContinue,
}: Props) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[140] flex items-center justify-center bg-black/40 p-4"
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
          <div className="text-[28px] font-semibold leading-none text-black">
            Комплект собран
          </div>

          <p className="mt-3 text-[15px] leading-6 text-black/60">
            Товар успешно собран и добавлен. Теперь можно продолжить покупки.
          </p>
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={onContinue}
            className="inline-flex min-h-[52px] w-full cursor-pointer items-center justify-center gap-2 rounded-[16px] border border-black/10 bg-white px-5 text-[15px] font-semibold text-black transition hover:bg-black/[0.03]"
          >
            <ShoppingBag className="h-4 w-4" />
            Продолжить покупки
          </button>
        </div>
      </div>
    </div>
  );
}
