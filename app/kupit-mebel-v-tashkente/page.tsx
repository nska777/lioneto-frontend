import type { Metadata } from "next";
import Link from "next/link";

const SITE_URL = "https://lioneto.com";
const PAGE_URL = `${SITE_URL}/kupit-mebel-v-tashkente`;

export const metadata: Metadata = {
  title: "Купить мебель в Ташкенте — премиальная мебель Lioneto",
  description:
    "Купить мебель в Ташкенте от Lioneto: спальни, кровати, шкафы, комоды и интерьерные коллекции для современного дома. Смотрите каталог, коллекции и адреса салонов.",
  keywords: [
    "купить мебель в Ташкенте",
    "мебель в Ташкенте",
    "магазин мебели Ташкент",
    "премиальная мебель Ташкент",
    "элитная мебель Ташкент",
    "спальни в Ташкенте",
    "кровати в Ташкенте",
    "шкафы в Ташкенте",
    "комоды в Ташкенте",
    "Lioneto",
    "Lioneto Ташкент",
  ],
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: "Купить мебель в Ташкенте — премиальная мебель Lioneto",
    description:
      "Премиальная мебель Lioneto в Ташкенте: спальни, кровати, шкафы, комоды и интерьерные коллекции для современного дома.",
    url: PAGE_URL,
    type: "website",
    locale: "ru_RU",
    siteName: "Lioneto",
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Купить мебель в Ташкенте — Lioneto",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Купить мебель в Ташкенте — премиальная мебель Lioneto",
    description:
      "Премиальная мебель Lioneto в Ташкенте: спальни, кровати, шкафы, комоды и интерьерные коллекции.",
    images: [`${SITE_URL}/og-image.jpg`],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const pageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Купить мебель в Ташкенте — премиальная мебель Lioneto",
  url: PAGE_URL,
  description:
    "Купить мебель в Ташкенте от Lioneto: спальни, кровати, шкафы, комоды и интерьерные коллекции для современного дома.",
  inLanguage: "ru",
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    {
      "@type": "ListItem",
      position: 1,
      name: "Главная",
      item: SITE_URL,
    },
    {
      "@type": "ListItem",
      position: 2,
      name: "Купить мебель в Ташкенте",
      item: PAGE_URL,
    },
  ],
};

const collectionLinks = [
  {
    label: "AMBER",
    text: "Коллекция мебели AMBER",
    href: "/catalog?menu=bedrooms&collections=amber&hero=1",
  },
  {
    label: "SCANDI",
    text: "Коллекция мебели SCANDI",
    href: "/catalog?menu=living&collections=scandi&hero=1",
  },
  {
    label: "ELIZABETH",
    text: "Коллекция мебели ELIZABETH",
    href: "/catalog?menu=bedrooms&collections=elizabeth&hero=1",
  },
  {
    label: "SALVADOR",
    text: "Коллекция мебели SALVADOR",
    href: "/catalog?menu=bedrooms&collections=salvador&hero=1",
  },
];

const faqItems = [
  {
    q: "Где купить мебель Lioneto в Ташкенте?",
    a: "На сайте Lioneto можно посмотреть коллекции, перейти в каталог и открыть страницу контактов с адресами салонов в Ташкенте.",
  },
  {
    q: "Какая мебель представлена у Lioneto?",
    a: "В каталоге представлены спальни, кровати, шкафы, комоды, тумбы и другие предметы мебели для дома и спальни.",
  },
  {
    q: "Можно ли подобрать мебель в одном стиле?",
    a: "Да, Lioneto делает акцент на интерьерных коллекциях, где разные элементы мебели сочетаются между собой по стилю и оформлению.",
  },
];

export default function BuyFurnitureInTashkentPage() {
  return (
    <main className="bg-white text-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <div className="mx-auto w-full max-w-[1200px] px-4 py-8 md:py-12">
        <nav className="text-[12px] tracking-[0.18em] text-black/50">
          <Link className="hover:text-black/80" href="/">
            ГЛАВНАЯ
          </Link>
          <span className="px-2">/</span>
          <span className="text-black/80">КУПИТЬ МЕБЕЛЬ В ТАШКЕНТЕ</span>
        </nav>

        <header className="mt-6 max-w-4xl md:mt-10">
          <h1 className="text-balance text-[32px] font-semibold leading-[1.02] tracking-[-0.03em] md:text-[56px]">
            Купить мебель в Ташкенте
          </h1>

          <p className="mt-5 text-[15px] leading-7 text-black/75 md:text-[18px] md:leading-8">
            Lioneto предлагает купить мебель в Ташкенте для спальни, дома и
            современных интерьеров. На сайте можно посмотреть коллекции, перейти
            в каталог и подобрать премиальную мебель в едином стиле.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-[13px] font-medium tracking-[0.12em] text-white transition hover:opacity-90"
            >
              ПЕРЕЙТИ В КАТАЛОГ
            </Link>
            <Link
              href="/contacts"
              className="inline-flex items-center justify-center rounded-full border border-black/10 px-6 py-3 text-[13px] font-medium tracking-[0.12em] text-black transition hover:border-black/20"
            >
              АДРЕСА САЛОНОВ
            </Link>
          </div>
        </header>

        <section className="mt-12 max-w-5xl">
          <h2 className="text-[26px] font-semibold tracking-[-0.02em] md:text-[36px]">
            Премиальная мебель Lioneto в Ташкенте
          </h2>

          <div className="mt-5 space-y-5 text-[15px] leading-7 text-black/75 md:text-[17px] md:leading-8">
            <p>
              Если вы хотите купить мебель в Ташкенте, важно смотреть не только
              на отдельный товар, но и на общий интерьер. Lioneto делает акцент
              на коллекциях, где кровати, шкафы, тумбы, комоды и другие предметы
              мебели сочетаются между собой по стилю, пропорциям и визуальному
              характеру.
            </p>
            <p>
              На сайте можно выбрать мебель для спальни, перейти к отдельным
              категориям и открыть интерьерные коллекции. Такой формат удобен
              для тех, кто хочет подобрать цельное решение для квартиры, дома
              или дизайнерского интерьера в Ташкенте.
            </p>
            <p>
              Lioneto подходит тем, кто ищет премиальную мебель в Ташкенте с
              акцентом на внешний вид, материалы и целостную подачу интерьера. В
              каталоге представлены спальни, кровати, гарнитуры, шкафы, комоды и
              другие решения для современного дома.
            </p>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-[26px] font-semibold tracking-[-0.02em] md:text-[36px]">
            Почему выбирают Lioneto
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {[
              "Цельные интерьерные коллекции",
              "Премиальный внешний вид мебели",
              "Удобный выбор через каталог и категории",
              "Решения для спальни и дома",
              "Современный и классический стиль",
              "Салоны и контакты в Ташкенте",
            ].map((item) => (
              <div
                key={item}
                className="rounded-3xl border border-black/10 p-6 text-[15px] leading-7 text-black/75"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-[26px] font-semibold tracking-[-0.02em] md:text-[36px]">
            Коллекции мебели
          </h2>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {collectionLinks.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="rounded-3xl border border-black/10 bg-white p-5 transition hover:border-black/20"
              >
                <div className="text-[12px] tracking-[0.18em] text-black/45">
                  КОЛЛЕКЦИЯ
                </div>
                <div className="mt-2 text-[20px] font-semibold tracking-[-0.02em]">
                  {item.label}
                </div>
                <div className="mt-2 text-[14px] leading-6 text-black/70">
                  {item.text}
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-[26px] font-semibold tracking-[-0.02em] md:text-[36px]">
            Частые вопросы
          </h2>

          <div className="mt-6 space-y-4">
            {faqItems.map((item) => (
              <div
                key={item.q}
                className="rounded-3xl border border-black/10 p-6"
              >
                <h3 className="text-[18px] font-semibold tracking-[-0.02em]">
                  {item.q}
                </h3>
                <p className="mt-3 text-[15px] leading-7 text-black/70">
                  {item.a}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-[26px] font-semibold tracking-[-0.02em] md:text-[36px]">
            Смотрите также
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-3 md:gap-6">
            <Link
              href="/spalni-v-tashkente"
              className="rounded-3xl border border-black/10 p-6 transition hover:border-black/20"
            >
              <div className="text-[12px] tracking-[0.18em] text-black/45">
                СПАЛЬНИ
              </div>
              <h3 className="mt-3 text-[22px] font-semibold tracking-[-0.02em]">
                Спальни в Ташкенте
              </h3>
              <p className="mt-3 text-[15px] leading-7 text-black/70">
                Откройте страницу со спальнями Lioneto и мебелью для спальни.
              </p>
            </Link>

            <Link
              href="/krovati-v-tashkente"
              className="rounded-3xl border border-black/10 p-6 transition hover:border-black/20"
            >
              <div className="text-[12px] tracking-[0.18em] text-black/45">
                КРОВАТИ
              </div>
              <h3 className="mt-3 text-[22px] font-semibold tracking-[-0.02em]">
                Кровати в Ташкенте
              </h3>
              <p className="mt-3 text-[15px] leading-7 text-black/70">
                Перейдите к странице кроватей Lioneto для спальни.
              </p>
            </Link>

            <Link
              href="/shkafy-v-tashkente"
              className="rounded-3xl border border-black/10 p-6 transition hover:border-black/20"
            >
              <div className="text-[12px] tracking-[0.18em] text-black/45">
                ШКАФЫ
              </div>
              <h3 className="mt-3 text-[22px] font-semibold tracking-[-0.02em]">
                Шкафы в Ташкенте
              </h3>
              <p className="mt-3 text-[15px] leading-7 text-black/70">
                Посмотрите страницу со шкафами и мебелью для спальни.
              </p>
            </Link>
          </div>
        </section>

        <div className="h-14 md:h-20" />
      </div>
    </main>
  );
}
