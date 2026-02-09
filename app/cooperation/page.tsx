// app/cooperation/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import CooperationClient from "../cooperation/CooperationClient";

export const metadata: Metadata = {
  title: "Сотрудничество — Lioneto",
  description:
    "Сотрудничество с Lioneto: для дизайнеров, дилеров, застройщиков и B2B. Условия, форматы и заявка.",
  openGraph: {
    title: "Сотрудничество — Lioneto",
    description:
      "Программы сотрудничества Lioneto для дизайнеров, дилеров, застройщиков и B2B.",
    type: "website",
    locale: "ru_RU",
  },
  robots: { index: true, follow: true },
};

export default function CooperationPage() {
  return (
    <main className="bg-white text-black">
      <div className="mx-auto w-full max-w-[1200px] px-4">
        {/* Breadcrumbs */}
        <nav className="pt-6 text-[12px] tracking-[0.18em] text-black/50">
          <Link className="hover:text-black/80" href="/">
            ГЛАВНАЯ
          </Link>
          <span className="px-2">/</span>
          <span className="text-black/80">СОТРУДНИЧЕСТВО</span>
        </nav>

        <header className="mt-6 md:mt-10">
          <h1 className="text-balance text-[28px] font-semibold leading-[1.06] tracking-[-0.02em] md:text-[44px]">
            Сотрудничество
          </h1>
          <p className="mt-4 max-w-3xl text-[14px] leading-7 text-black/70 md:text-[16px]">
            Для дизайнеров, дилеров, застройщиков и корпоративных клиентов.
            Выберите формат — и оставьте заявку.
          </p>
        </header>

        <div className="mt-8 md:mt-10">
          <CooperationClient />
        </div>

        <div className="h-14 md:h-20" />
      </div>
    </main>
  );
}
