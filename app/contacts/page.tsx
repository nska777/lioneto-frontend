// app/contacts/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import ContactsClient from "../contacts/ContactsClient";

const SITE_URL = "https://lioneto.com";
const PAGE_URL = `${SITE_URL}/contacts`;

export const metadata: Metadata = {
  title: "Контакты Lioneto — адреса магазинов мебели в Ташкенте",
  description:
    "Контакты Lioneto: адреса магазинов мебели в Ташкенте, телефоны, режим работы и карта. Выберите салон и откройте маршрут.",
  alternates: {
    canonical: "/contacts",
  },
  keywords: [
    "контакты Lioneto",
    "адрес Lioneto",
    "магазин мебели Ташкент адрес",
    "мебель Ташкент контакты",
    "Lioneto Ташкент",
    "салон мебели Ташкент",
    "Rich House Ташкент",
    "Arca Mebel Ташкент",
    "Arca Premium Ташкент",
  ],
  openGraph: {
    title: "Контакты Lioneto — адреса магазинов мебели в Ташкенте",
    description:
      "Адреса магазинов Lioneto в Ташкенте, телефоны, режим работы и карта.",
    url: PAGE_URL,
    type: "website",
    locale: "ru_RU",
  },
  twitter: {
    card: "summary_large_image",
    title: "Контакты Lioneto — адреса магазинов мебели в Ташкенте",
    description:
      "Адреса магазинов Lioneto в Ташкенте, телефоны, режим работы и карта.",
  },
  robots: { index: true, follow: true },
};

const contactsPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: "Контакты Lioneto",
  url: PAGE_URL,
  description:
    "Контакты Lioneto: адреса магазинов мебели в Ташкенте, телефоны, режим работы и карта.",
  inLanguage: "ru",
  mainEntity: {
    "@type": "Organization",
    name: "Lioneto",
    url: SITE_URL,
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+998909256006",
        contactType: "sales",
        areaServed: "UZ",
        availableLanguage: ["ru"],
      },
      {
        "@type": "ContactPoint",
        telephone: "+998900038008",
        contactType: "sales",
        areaServed: "UZ",
        availableLanguage: ["ru"],
      },
      {
        "@type": "ContactPoint",
        telephone: "+998909274004",
        contactType: "sales",
        areaServed: "UZ",
        availableLanguage: ["ru"],
      },
      {
        "@type": "ContactPoint",
        telephone: "+998900021230",
        contactType: "sales",
        areaServed: "UZ",
        availableLanguage: ["ru"],
      },
    ],
  },
};

const storesJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "FurnitureStore",
      name: "Lioneto — Rich House",
      url: PAGE_URL,
      telephone: "+998909256006",
      additionalProperty: [
        {
          "@type": "PropertyValue",
          name: "Дополнительный телефон",
          value: "+998900038008",
        },
      ],
      address: {
        "@type": "PostalAddress",
        streetAddress: "ул. Мирзо-Улугбека, 18",
        addressLocality: "Ташкент",
        addressCountry: "UZ",
      },
      openingHours: "Mo-Su 09:00-18:00",
    },
    {
      "@type": "FurnitureStore",
      name: "Lioneto — Arca Mebel",
      url: PAGE_URL,
      telephone: "+998909274004",
      address: {
        "@type": "PostalAddress",
        streetAddress: "улица Махтумкули, 75",
        addressLocality: "Ташкент",
        addressRegion: "Яшнабадский район",
        addressCountry: "UZ",
      },
      openingHours: "Mo-Su 09:00-18:00",
    },
    {
      "@type": "FurnitureStore",
      name: "Lioneto — Arca Premium",
      url: PAGE_URL,
      telephone: "+998900021230",
      address: {
        "@type": "PostalAddress",
        streetAddress: "улица Махтумкули, 75/4",
        addressLocality: "Ташкент",
        addressRegion: "Яшнабадский район",
        addressCountry: "UZ",
      },
      openingHours: "Mo-Su 09:00-18:00",
    },
  ],
};

export default function ContactsPage() {
  return (
    <main className="bg-white text-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(contactsPageJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(storesJsonLd),
        }}
      />

      <div className="mx-auto w-full max-w-[1200px] px-4">
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
            Адреса магазинов Lioneto, телефоны, режим работы и карта. Выберите
            регион — список салонов и карта обновятся автоматически.
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
