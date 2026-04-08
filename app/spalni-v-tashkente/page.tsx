import type { Metadata } from "next";
import Link from "next/link";

const SITE_URL = "https://lioneto.com";
const PAGE_URL = `${SITE_URL}/spalni-v-tashkente`;

export const metadata: Metadata = {
  title: "Спальни в Ташкенте — мебель для спальни Lioneto",
  description:
    "Спальни в Ташкенте от Lioneto: мебель для спальни, кровати, шкафы, комоды и интерьерные коллекции. Смотрите каталог, актуальные модели и адреса салонов.",
  keywords: [
    "спальни в Ташкенте",
    "мебель для спальни Ташкент",
    "спальня Ташкент",
    "спальный гарнитур Ташкент",
    "кровати в Ташкенте",
    "шкафы в Ташкенте",
    "Lioneto спальни",
    "Lioneto Ташкент",
  ],
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: "Спальни в Ташкенте — мебель для спальни Lioneto",
    description:
      "Спальни Lioneto в Ташкенте: кровати, шкафы, комоды и интерьерные коллекции для современной спальни.",
    url: PAGE_URL,
    type: "website",
    locale: "ru_RU",
    siteName: "Lioneto",
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Спальни в Ташкенте — Lioneto",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Спальни в Ташкенте — мебель для спальни Lioneto",
    description:
      "Спальни Lioneto в Ташкенте: кровати, шкафы, комоды и интерьерные коллекции.",
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
  name: "Спальни в Ташкенте — мебель для спальни Lioneto",
  url: PAGE_URL,
  description:
    "Спальни в Ташкенте от Lioneto: мебель для спальни, кровати, шкафы, комоды и интерьерные коллекции.",
  inLanguage: "ru",
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Главная", item: SITE_URL },
    {
      "@type": "ListItem",
      position: 2,
      name: "Спальни в Ташкенте",
      item: PAGE_URL,
    },
  ],
};

const bedroomCollections = [
  {
    label: "AMBER",
    text: "Коллекция AMBER для спальни",
    href: "/catalog?menu=bedrooms&collections=amber&hero=1",
  },
  {
    label: "ELIZABETH",
    text: "Коллекция ELIZABETH для спальни",
    href: "/catalog?menu=bedrooms&collections=elizabeth&hero=1",
  },
  {
    label: "SALVADOR",
    text: "Коллекция SALVADOR для спальни",
    href: "/catalog?menu=bedrooms&collections=salvador&hero=1",
  },
  {
    label: "PITTI",
    text: "Коллекция PITTI для спальни",
    href: "/catalog?menu=bedrooms&collections=pitti&hero=1",
  },
];

export default function BedroomsInTashkentPage() {
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
          <span className="text-black/80">СПАЛЬНИ В ТАШКЕНТЕ</span>
        </nav>

        <header className="mt-6 max-w-4xl md:mt-10">
          <h1 className="text-balance text-[32px] font-semibold leading-[1.02] tracking-[-0.03em] md:text-[56px]">
            Спальни в Ташкенте
          </h1>

          <p className="mt-5 text-[15px] leading-7 text-black/75 md:text-[18px] md:leading-8">
            Lioneto предлагает спальни в Ташкенте для современных интерьеров:
            кровати, шкафы, комоды, тумбы и другие элементы спальни в рамках
            цельных интерьерных коллекций.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-[13px] font-medium tracking-[0.12em] text-white transition hover:opacity-90"
            >
              СМОТРЕТЬ КАТАЛОГ
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
            Мебель для спальни Lioneto
          </h2>

          <div className="mt-5 space-y-5 text-[15px] leading-7 text-black/75 md:text-[17px] md:leading-8">
            <p>
              Если вы ищете спальни в Ташкенте, важно смотреть не только на
              отдельные товары, но и на всю композицию спальни. Lioneto
              предлагает решения, где кровать, шкафы, тумбы, комоды и зеркала
              собраны в едином стиле и создают цельный интерьер.
            </p>
            <p>
              На сайте можно перейти в каталог, открыть спальни по коллекциям и
              посмотреть актуальные модели. Эта страница подходит тем, кто ищет
              мебель для спальни в Ташкенте, современные спальни и премиальные
              интерьерные решения.
            </p>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-[26px] font-semibold tracking-[-0.02em] md:text-[36px]">
            Коллекции для спальни
          </h2>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {bedroomCollections.map((item) => (
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

        <section className="mt-12 grid gap-4 md:grid-cols-3 md:gap-6">
          <Link
            href="/krovati-v-tashkente"
            className="rounded-3xl border border-black/10 p-6 transition hover:border-black/20"
          >
            <div className="text-[12px] tracking-[0.18em] text-black/45">
              КРОВАТИ
            </div>
            <h2 className="mt-3 text-[22px] font-semibold tracking-[-0.02em]">
              Кровати в Ташкенте
            </h2>
            <p className="mt-3 text-[15px] leading-7 text-black/70">
              Откройте отдельную страницу с кроватями Lioneto для спальни.
            </p>
          </Link>

          <Link
            href="/spalnye-garnitury-v-tashkente"
            className="rounded-3xl border border-black/10 p-6 transition hover:border-black/20"
          >
            <div className="text-[12px] tracking-[0.18em] text-black/45">
              ГАРНИТУРЫ
            </div>
            <h2 className="mt-3 text-[22px] font-semibold tracking-[-0.02em]">
              Спальные гарнитуры
            </h2>
            <p className="mt-3 text-[15px] leading-7 text-black/70">
              Посмотрите страницу со спальными гарнитурами Lioneto.
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
              Откройте адреса салонов Lioneto в Ташкенте.
            </p>
          </Link>
        </section>

        <div className="h-14 md:h-20" />
      </div>
    </main>
  );
}
