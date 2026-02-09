// app/sale/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import SaleClient from "../sale/SaleClient";

export const metadata: Metadata = {
  title: "Акции — Lioneto",
  description:
    "Акции Lioneto: распродажи, специальные предложения и подборки по коллекциям.",
  openGraph: {
    title: "Акции — Lioneto",
    description: "Расппродажи и специальные предложения Lioneto.",
    type: "website",
    locale: "ru_RU",
  },
  robots: { index: true, follow: true },
};

export default function SalePage() {
  return (
    <main className="bg-white text-black">
      <div className="mx-auto w-full max-w-[1200px] px-4">
        {/* ✅ меньше отступ сверху */}
        <nav className="pt-2 md:pt-4 text-[12px] tracking-[0.18em] text-black/50">
          <Link className="hover:text-black/80" href="/">
            ГЛАВНАЯ
          </Link>
          <span className="px-2">/</span>
          <span className="text-black/80">АКЦИИ</span>
        </nav>

        <header className="mt-5 md:mt-8">
          <h1 className="text-balance text-[28px] font-semibold leading-[1.06] tracking-[-0.02em] md:text-[44px]">
            Акции
          </h1>
          <p className="mt-4 max-w-3xl text-[14px] leading-7 text-black/70 md:text-[16px]">
            Сдержанные предложения, понятные условия. Выбирайте подборку и
            переходите в каталог.
          </p>
        </header>

        <div className="mt-7 md:mt-9">
          <SaleClient />
        </div>

        <div className="h-14 md:h-20" />
      </div>
    </main>
  );
}
