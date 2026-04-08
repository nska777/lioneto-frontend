// app/kupit-mebel-v-tashkente/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

const SITE_URL = "https://lioneto.com";
const PAGE_URL = `${SITE_URL}/kupit-mebel-v-tashkente`;

export const metadata: Metadata = {
  title: "Купить мебель в Ташкенте — премиальная мебель Lioneto",
  description:
    "Купить мебель в Ташкенте от Lioneto: спальни, кровати, шкафы и интерьерные коллекции для современного дома. Каталог мебели, адреса салонов, контакты и актуальные модели.",
  keywords: [
    "купить мебель в Ташкенте",
    "мебель в Ташкенте",
    "магазин мебели Ташкент",
    "премиальная мебель Ташкент",
    "элитная мебель Ташкент",
    "спальни в Ташкенте",
    "кровати в Ташкенте",
    "шкафы в Ташкенте",
    "Lioneto",
    "Lioneto Ташкент",
  ],
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: "Купить мебель в Ташкенте — премиальная мебель Lioneto",
    description:
      "Премиальная мебель Lioneto в Ташкенте: спальни, кровати, шкафы и интерьерные коллекции для современного дома.",
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
      "Премиальная мебель Lioneto в Ташкенте: спальни, кровати, шкафы и интерьерные коллекции.",
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
    "Купить мебель в Ташкенте от Lioneto: спальни, кровати, шкафы и интерьерные коллекции для современного дома.",
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
    href: `${SITE_URL}/catalog?menu=bedrooms&collections=amber&hero=1`,
  },
  {
    label: "SCANDI",
    text: "Коллекция мебели SCANDI",
    href: `${SITE_URL}/catalog?menu=living&collections=scandi&hero=1`,
  },
  {
    label: "ELIZABETH",
    text: "Коллекция мебели ELIZABETH",
    href: `${SITE_URL}/catalog?menu=bedrooms&collections=elizabeth&hero=1`,
  },
  {
    label: "SALVADOR",
    text: "Коллекция мебели SALVADOR",
    href: `${SITE_URL}/catalog?menu=bedrooms&collections=salvador&hero=1`,
  },
];

export default function BuyFurnitureInTashkentPage() {
  return (
    <main className="bg-white text-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(pageJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
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
            Lioneto — премиальная мебель в Ташкенте для современных интерьеров.
            На сайте представлены спальни, кровати, шкафы и интерьерные
            коллекции для дома. Если вы хотите купить мебель в Ташкенте, начните
            с каталога Lioneto и выберите подходящую коллекцию.
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
              КОНТАКТЫ И САЛОНЫ
            </Link>
          </div>
        </header>

        <section className="mt-12 max-w-5xl">
          <h2 className="text-[26px] font-semibold tracking-[-0.02em] md:text-[36px]">
            Премиальная мебель Lioneto в Ташкенте
          </h2>

          <div className="mt-5 space-y-5 text-[15px] leading-7 text-black/75 md:text-[17px] md:leading-8">
            <p>
              Если вы ищете, где купить мебель в Ташкенте, важно выбирать не
              только дизайн, но и уровень исполнения. Lioneto предлагает
              интерьерные решения для спальни и жилых пространств, где важны
              качество, актуальный стиль, материалы и визуальная цельность
              коллекции.
            </p>
            <p>
              На сайте можно посмотреть каталог мебели, открыть популярные
              коллекции, изучить характеристики товаров и перейти к контактам
              салонов в Ташкенте. Это удобная страница входа для тех, кто ищет
              мебель в Ташкенте, магазин мебели в Ташкенте или премиальную
              мебель для современного дома.
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
              Перейдите в каталог Lioneto и посмотрите актуальные модели мебели
              для спальни и интерьера.
            </p>
          </Link>

          <Link
            href="/contacts"
            className="rounded-3xl border border-black/10 p-6 transition hover:border-black/20"
          >
            <div className="text-[12px] tracking-[0.18em] text-black/45">
              КОНТАКТЫ
            </div>
            <h2 className="mt-3 text-[22px] font-semibold tracking-[-0.02em]">
              Салоны в Ташкенте
            </h2>
            <p className="mt-3 text-[15px] leading-7 text-black/70">
              Откройте адреса магазинов Lioneto в Ташкенте, телефоны и карту
              салонов.
            </p>
          </Link>

          <Link
            href="/news"
            className="rounded-3xl border border-black/10 p-6 transition hover:border-black/20"
          >
            <div className="text-[12px] tracking-[0.18em] text-black/45">
              НОВОСТИ
            </div>
            <h2 className="mt-3 text-[22px] font-semibold tracking-[-0.02em]">
              Новости и материалы
            </h2>
            <p className="mt-3 text-[15px] leading-7 text-black/70">
              Следите за новыми коллекциями, материалами и обновлениями Lioneto.
            </p>
          </Link>
        </section>

        <section className="mt-12">
          <h2 className="text-[26px] font-semibold tracking-[-0.02em] md:text-[36px]">
            Популярные коллекции
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

        <section className="mt-12 max-w-4xl">
          <h2 className="text-[26px] font-semibold tracking-[-0.02em] md:text-[36px]">
            Частые вопросы
          </h2>

          <div className="mt-6 space-y-4">
            <div className="rounded-3xl border border-black/10 p-5">
              <h3 className="text-[18px] font-semibold">
                Где купить мебель Lioneto в Ташкенте?
              </h3>
              <p className="mt-2 text-[15px] leading-7 text-black/70">
                На сайте Lioneto можно открыть каталог мебели, а на странице
                контактов посмотреть адреса салонов в Ташкенте.
              </p>
            </div>

            <div className="rounded-3xl border border-black/10 p-5">
              <h3 className="text-[18px] font-semibold">
                Какие коллекции мебели доступны?
              </h3>
              <p className="mt-2 text-[15px] leading-7 text-black/70">
                На сайте представлены коллекции AMBER, SCANDI, ELIZABETH,
                SALVADOR, PITTI и другие интерьерные решения Lioneto.
              </p>
            </div>

            <div className="rounded-3xl border border-black/10 p-5">
              <h3 className="text-[18px] font-semibold">
                Где посмотреть адреса магазинов в Ташкенте?
              </h3>
              <p className="mt-2 text-[15px] leading-7 text-black/70">
                Перейдите на страницу контактов Lioneto, чтобы открыть адреса,
                телефоны, карту и режим работы салонов.
              </p>
            </div>
          </div>
        </section>

        <div className="h-14 md:h-20" />
      </div>
    </main>
  );
}
