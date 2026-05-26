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
    "Ecobazar Atlas Mebel Ташкент",
    "мебель в Ташкенте адрес",
  ],
  openGraph: {
    title: "Контакты Lioneto — адреса магазинов мебели в Ташкенте",
    description:
      "Адреса магазинов Lioneto в Ташкенте, телефоны, режим работы и карта.",
    url: PAGE_URL,
    type: "website",
    locale: "ru_RU",
    siteName: "Lioneto",
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
        telephone: "+998900426817",
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
      name: "Lioneto — Ecobazar Atlas Mebel",
      url: PAGE_URL,
      telephone: "+998900426817",
      address: {
        "@type": "PostalAddress",
        streetAddress: "улица Тимура Малика, 3А",
        addressLocality: "Ташкент",
        addressRegion: "Мирзо-Улугбекский район",
        addressCountry: "UZ",
      },
      openingHours: "Mo-Su 09:00-18:00",
    },
  ],
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Где посмотреть мебель Lioneto в Ташкенте?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "На странице контактов Lioneto доступны адреса салонов в Ташкенте, телефоны, карта и режим работы магазинов.",
      },
    },
    {
      "@type": "Question",
      name: "Какие магазины Lioneto есть в Ташкенте?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "На странице контактов представлены точки Rich House, Arca Mebel и Ecobazar Atlas Mebel в Ташкенте.",
      },
    },
    {
      "@type": "Question",
      name: "Можно ли открыть маршрут до магазина Lioneto?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Да, на странице контактов можно выбрать салон и открыть карту для построения маршрута.",
      },
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
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(faqJsonLd),
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

        <section className="mt-12 max-w-5xl">
          <h2 className="text-[26px] font-semibold tracking-[-0.02em] md:text-[36px]">
            Магазины мебели Lioneto в Ташкенте, России и Казахстане
          </h2>

          <div className="mt-5 space-y-5 text-[15px] leading-7 text-black/75 md:text-[17px] md:leading-8">
            <p>
              На этой странице собраны актуальные контакты Lioneto: адреса
              магазинов, телефоны, режим работы и карта салонов. Если вы ищете
              мебель и хотите посмотреть коллекции вживую, страница контактов
              помогает быстро выбрать ближайшую точку и построить маршрут.
            </p>
            <p>
              В салонах Lioneto можно ознакомиться с мебелью для спальни,
              интерьерными коллекциями и актуальными решениями для современного
              дома. Контакты и карта вынесены в удобный формат, чтобы
              пользователь мог сразу увидеть нужный магазин и перейти к нему на
              карте.
            </p>
            <p>
              Для выбора моделей и коллекций вы также можете перейти в{" "}
              <Link href="/catalog" className="underline underline-offset-4">
                каталог мебели
              </Link>
              , а для просмотра актуальных материалов бренда — в раздел{" "}
              <Link href="/news" className="underline underline-offset-4">
                новостей
              </Link>
              .
            </p>
          </div>
        </section>

        <section className="mt-12 grid gap-4 md:grid-cols-3 md:gap-6">
          <Link
            href="/catalog"
            className="rounded-3xl border border-black/10 p-6 transition hover:border-black/20"
          >
            <div className="text-[12px] tracking-[0.18em] text-black/45">
              КАТАЛОГ
            </div>
            <h2 className="mt-3 text-[22px] font-semibold tracking-[-0.02em]">
              Каталог мебели
            </h2>
            <p className="mt-3 text-[15px] leading-7 text-black/70">
              Посмотрите коллекции Lioneto и перейдите к товарам с фото и
              характеристиками.
            </p>
          </Link>

          <Link
            href="/catalog?menu=bedrooms&collections=amber&hero=1"
            className="rounded-3xl border border-black/10 p-6 transition hover:border-black/20"
          >
            <div className="text-[12px] tracking-[0.18em] text-black/45">
              КОЛЛЕКЦИЯ
            </div>
            <h2 className="mt-3 text-[22px] font-semibold tracking-[-0.02em]">
              AMBER
            </h2>
            <p className="mt-3 text-[15px] leading-7 text-black/70">
              Откройте одну из популярных коллекций Lioneto внутри каталога.
            </p>
          </Link>

          <Link
            href="/catalog?menu=living&collections=scandi&hero=1"
            className="rounded-3xl border border-black/10 p-6 transition hover:border-black/20"
          >
            <div className="text-[12px] tracking-[0.18em] text-black/45">
              КОЛЛЕКЦИЯ
            </div>
            <h2 className="mt-3 text-[22px] font-semibold tracking-[-0.02em]">
              SCANDY
            </h2>
            <p className="mt-3 text-[15px] leading-7 text-black/70">
              Перейдите к коллекции SCANDY и посмотрите актуальные модели.
            </p>
          </Link>
        </section>

        <section className="mt-12 max-w-4xl">
          <h2 className="text-[26px] font-semibold tracking-[-0.02em] md:text-[36px]">
            Частые вопросы
          </h2>

          <div className="mt-6 space-y-4">
            <div className="rounded-3xl border border-black/10 p-5">
              <h3 className="text-[18px] font-semibold">
                Где находятся магазины Lioneto?
              </h3>
              <p className="mt-2 text-[15px] leading-7 text-black/70">
                На странице контактов показаны салоны Lioneto, их адреса,
                телефоны и карта.
              </p>
            </div>

            <div className="rounded-3xl border border-black/10 p-5">
              <h3 className="text-[18px] font-semibold">
                Можно ли посмотреть маршрут до магазина?
              </h3>
              <p className="mt-2 text-[15px] leading-7 text-black/70">
                Да, вы можете выбрать магазин и открыть карту, чтобы построить
                маршрут до нужного салона.
              </p>
            </div>

            <div className="rounded-3xl border border-black/10 p-5">
              <h3 className="text-[18px] font-semibold">
                Где посмотреть мебель Lioneto перед визитом в салон?
              </h3>
              <p className="mt-2 text-[15px] leading-7 text-black/70">
                Перед посещением магазина можно открыть каталог Lioneto и
                посмотреть коллекции, товары, фотографии и характеристики.
              </p>
            </div>
          </div>
        </section>

        <div className="h-14 md:h-20" />
      </div>
    </main>
  );
}
