// app/contacts/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import ContactsClient from "../contacts/ContactsClient";

export const metadata: Metadata = {
  title: "Контакты — Lioneto",
  description:
    "Контакты Lioneto: адреса магазинов, телефоны, режим работы и карта.",
  openGraph: {
    title: "Контакты — Lioneto",
    description: "Адреса магазинов Lioneto, телефоны, режим работы и карта.",
    type: "website",
    locale: "ru_RU",
  },
  robots: { index: true, follow: true },
};

export default function ContactsPage() {
  return (
    <main className="bg-white text-black">
      <div className="mx-auto w-full max-w-[1200px] px-4">
        {/* Breadcrumbs */}
        <nav className="pt-6 text-[12px] tracking-[0.18em] text-black/50">
          <Link className="hover:text-black/80" href="/">
            ГЛАВНАЯ
          </Link>
          <span className="px-2">/</span>
          <span className="text-black/80">КОНТАКТЫ</span>
        </nav>

        <header className="mt-6 md:mt-10">
          <h1 className="text-balance text-[28px] font-semibold leading-[1.06] tracking-[-0.02em] md:text-[44px]">
            Контакты
          </h1>
          <p className="mt-4 max-w-3xl text-[14px] leading-7 text-black/70 md:text-[16px]">
            Выберите регион — список магазинов и карта обновятся автоматически.
          </p>
        </header>

        <div className="mt-8 md:mt-10">
          <ContactsClient />
        </div>

        <div className="h-14 md:h-20" />
      </div>
    </main>
  );
}
