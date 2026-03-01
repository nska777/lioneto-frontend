"use client";

import { useRegionLang } from "@/app/context/region-lang";

export default function Page() {
  const { region } = useRegionLang();

  const regionLabel = region === "ru" ? "Россия" : "Узбекистан";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[34px] leading-[1.06] font-semibold tracking-[-0.02em]">
          Добро пожаловать 👋
        </h1>
        <p className="mt-2 text-[14px] text-black/60">
          Вы авторизованы в дилерском портале Lioneto.
        </p>
      </div>

      <div className="rounded-[18px] border border-black/10 bg-white shadow-[0_14px_40px_-26px_rgba(0,0,0,0.35)]">
        <div className="grid gap-4 p-6 sm:grid-cols-2">
          <div>
            <div className="text-[11px] uppercase tracking-[0.12em] text-black/40">
              Компания
            </div>
            <div className="mt-1 text-[15px] font-semibold text-black">
              Lioneto Dealer
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-[0.12em] text-black/40">
              Email
            </div>
            <div className="mt-1 text-[15px] font-semibold text-black">
              dealer@example.com
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-[0.12em] text-black/40">
              Регион
            </div>
            <div className="mt-1 text-[15px] font-semibold text-black">
              {regionLabel}
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-[0.12em] text-black/40">
              Роль
            </div>
            <div className="mt-1 text-[15px] font-semibold text-black">
              Официальный дилер
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
