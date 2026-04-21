import type { Metadata } from "next";
import Link from "next/link";

const SITE_URL = "https://lioneto.com";
const PAGE_URL = `${SITE_URL}/mebel-iz-massiva-v-tashkente`;

export const metadata: Metadata = {
  title: "Мебель из массива в Ташкенте — Lioneto",
  description:
    "Мебель из массива в Ташкенте от Lioneto: спальни, кровати, шкафы и интерьерные решения для дома. Смотрите каталог, коллекции и адреса салонов.",
  keywords: [
    "мебель из массива в Ташкенте",
    "массив дерева мебель Ташкент",
    "деревянная мебель Ташкент",
    "кровать из массива Ташкент",
    "спальни Ташкент",
    "Lioneto",
  ],
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: "Мебель из массива в Ташкенте — Lioneto",
    description:
      "Мебель из массива в Ташкенте от Lioneto: спальни, кровати, шкафы и интерьерные решения для дома.",
    url: PAGE_URL,
    type: "website",
    locale: "ru_RU",
    siteName: "Lioneto",
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Мебель из массива в Ташкенте — Lioneto",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Мебель из массива в Ташкенте — Lioneto",
    description:
      "Мебель из массива в Ташкенте от Lioneto: спальни, кровати, шкафы и интерьерные решения для дома.",
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
  name: "Мебель из массива в Ташкенте — Lioneto",
  url: PAGE_URL,
  description:
    "Мебель из массива в Ташкенте от Lioneto: спальни, кровати, шкафы и интерьерные решения для дома.",
  inLanguage: "ru",
};

const faqItems = [
  {
    q: "Что значит мебель из массива?",
    a: "Мебель из массива ассоциируется с более основательным, выразительным и статусным интерьером. Для покупателя это важный запрос, связанный с качеством, внешним видом и долговечностью мебели.",
  },
  {
    q: "Какая мебель Lioneto подходит под этот запрос?",
    a: "На сайте можно посмотреть спальни, кровати, шкафы и другие интерьерные решения, которые визуально подходят под сегмент мебели из массива и премиальной мебели для дома.",
  },
  {
    q: "Где посмотреть мебель Lioneto в Ташкенте?",
    a: "На сайте доступны каталог и страница контактов с адресами салонов Lioneto в Ташкенте.",
  },
];

export default function SolidWoodFurnitureInTashkentPage() {
  return (
    <main className="bg-white text-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageJsonLd) }}
      />

      <div className="mx-auto w-full max-w-[1200px] px-4 py-8 md:py-12">
        <nav className="text-[12px] tracking-[0.18em] text-black/50">
          <Link className="hover:text-black/80" href="/">
            ГЛАВНАЯ
          </Link>
          <span className="px-2">/</span>
          <span className="text-black/80">МЕБЕЛЬ ИЗ МАССИВА В ТАШКЕНТЕ</span>
        </nav>

        <header className="mt-6 max-w-4xl md:mt-10">
          <h1 className="text-balance text-[32px] font-semibold leading-[1.02] tracking-[-0.03em] md:text-[56px]">
            Мебель из массива в Ташкенте
          </h1>

          <p className="mt-5 text-[15px] leading-7 text-black/75 md:text-[18px] md:leading-8">
            Lioneto предлагает мебель для тех, кто ищет в Ташкенте более
            выразительные, статусные и цельные интерьерные решения для спальни и
            дома. На сайте можно посмотреть коллекции, категории мебели и
            перейти к каталогу.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-[13px] font-medium tracking-[0.12em] text-white transition hover:opacity-90"
            >
              ПЕРЕЙТИ В КАТАЛОГ
            </Link>
            <Link
              href="/premium-mebel-v-tashkente"
              className="inline-flex items-center justify-center rounded-full border border-black/10 px-6 py-3 text-[13px] font-medium tracking-[0.12em] text-black transition hover:border-black/20"
            >
              ПРЕМИАЛЬНАЯ МЕБЕЛЬ
            </Link>
          </div>
        </header>

        <section className="mt-12 max-w-5xl">
          <h2 className="text-[26px] font-semibold tracking-[-0.02em] md:text-[36px]">
            Интерьерные решения Lioneto
          </h2>

          <div className="mt-5 space-y-5 text-[15px] leading-7 text-black/75 md:text-[17px] md:leading-8">
            <p>
              Запрос “мебель из массива в Ташкенте” чаще всего связан с поиском
              мебели, которая выглядит основательно, дорого и визуально
              подчеркивает статус интерьера. Lioneto подходит под такой запрос
              за счет цельных коллекций, выраженного дизайна и акцента на
              гармоничное сочетание предметов мебели внутри одного пространства.
            </p>
            <p>
              На сайте можно посмотреть спальни, кровати, шкафы, комоды и другие
              элементы мебели, которые помогают собрать единый интерьер для
              квартиры или дома. Вместо случайного подбора отдельных предметов
              пользователь получает более цельное и продуманное решение.
            </p>
            <p>
              Если вам нужна мебель в Ташкенте с акцентом на внешний вид,
              композицию и премиальную подачу, страницы Lioneto помогут быстрее
              перейти к нужным категориям и посмотреть актуальные коллекции.
            </p>
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

        <section className="mt-12 grid gap-4 md:grid-cols-3">
          <Link
            href="/premium-mebel-v-tashkente"
            className="rounded-3xl border border-black/10 p-6 transition hover:border-black/20"
          >
            <h2 className="text-[22px] font-semibold tracking-[-0.02em]">
              Премиальная мебель
            </h2>
            <p className="mt-3 text-[15px] leading-7 text-black/70">
              Откройте страницу премиальной мебели Lioneto в Ташкенте.
            </p>
          </Link>
          <Link
            href="/krovati-v-tashkente"
            className="rounded-3xl border border-black/10 p-6 transition hover:border-black/20"
          >
            <h2 className="text-[22px] font-semibold tracking-[-0.02em]">
              Кровати в Ташкенте
            </h2>
            <p className="mt-3 text-[15px] leading-7 text-black/70">
              Посмотрите страницу кроватей Lioneto для спальни.
            </p>
          </Link>
          <Link
            href="/spalni-v-tashkente"
            className="rounded-3xl border border-black/10 p-6 transition hover:border-black/20"
          >
            <h2 className="text-[22px] font-semibold tracking-[-0.02em]">
              Спальни в Ташкенте
            </h2>
            <p className="mt-3 text-[15px] leading-7 text-black/70">
              Перейдите к спальням и интерьерным коллекциям Lioneto.
            </p>
          </Link>
        </section>

        <div className="h-14 md:h-20" />
      </div>
    </main>
  );
}
