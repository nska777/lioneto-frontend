"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "lioneto-maintenance-notice-closed";

export default function MaintenanceNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const enabled = process.env.NEXT_PUBLIC_MAINTENANCE_MODE === "true";
    if (!enabled) return;

    const closed = window.sessionStorage.getItem(STORAGE_KEY);
    if (!closed) setVisible(true);
  }, []);

  if (!visible) return null;

  const close = () => {
    window.sessionStorage.setItem(STORAGE_KEY, "1");
    setVisible(false);
  };

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
      <div className="relative w-full max-w-[540px] overflow-hidden rounded-[28px] border border-white/20 bg-white shadow-2xl">
        <div className="absolute left-0 top-0 h-1.5 w-full bg-gradient-to-r from-[#8b5a2b] via-[#d8b071] to-[#8b5a2b]" />

        <div className="p-7 sm:p-9">
          <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#f4eadc] text-2xl">
            ⚙️
          </div>

          <h2 className="text-[25px] font-semibold leading-tight text-[#1f1b18] sm:text-[30px]">
            Техническое обслуживание
          </h2>

          <p className="mt-4 text-[15px] leading-7 text-[#5f5750] sm:text-[16px]">
            Сейчас на сайте проводятся технические работы. Некоторые товары,
            цены, фотографии или разделы могут временно отображаться
            некорректно.
          </p>

          <p className="mt-3 text-[15px] leading-7 text-[#5f5750] sm:text-[16px]">
            Мы обновляем каталог и скоро всё будет работать в обычном режиме.
          </p>

          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <button
              type="button"
              onClick={close}
              className="rounded-full bg-[#1f1b18] px-6 py-3 text-[14px] font-semibold text-white transition hover:bg-black"
            >
              Понятно, перейти на сайт
            </button>

            <a
              href="tel:+998909256006"
              className="rounded-full border border-black/15 px-6 py-3 text-center text-[14px] font-semibold text-[#1f1b18] transition hover:bg-black/5"
            >
              Связаться с нами
            </a>
          </div>

          <p className="mt-5 text-[12px] leading-5 text-[#9a8f86]">
            Если информация на сайте отличается от актуальной, пожалуйста,
            уточняйте наличие и цены у менеджера.
          </p>
        </div>
      </div>
    </div>
  );
}
