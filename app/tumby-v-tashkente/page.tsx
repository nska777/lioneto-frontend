import type { Metadata } from "next";
import Link from "next/link";

const SITE_URL = "https://lioneto.com";
const PAGE_URL = `${SITE_URL}/tumby-v-tashkente`;

export const metadata: Metadata = {
  title: "Тумбы в Ташкенте — тумбы Lioneto для спальни",
  description:
    "Тумбы в Ташкенте от Lioneto: прикроватные тумбы, мебель для спальни и интерьерные коллекции. Смотрите каталог, спальни и актуальные решения.",
  keywords: [
    "тумбы в Ташкенте",
    "прикроватные тумбы Ташкент",
    "купить тумбу в Ташкенте",
    "тумба Ташкент",
    "мебель для спальни Ташкент",
    "спальни в Ташкенте",
    "Lioneto тумбы",
  ],
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: "Тумбы в Ташкенте — тумбы Lioneto для спальни",
    description:
      "Тумбы в Ташкенте от Lioneto: прикроватные тумбы, мебель для спальни и интерьерные коллекции.",
    url: PAGE_URL,
    type: "website",
    locale: "ru_RU",
    siteName: "Lioneto",
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Тумбы в Ташкенте — Lioneto",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Тумбы в Ташкенте — тумбы Lioneto для спальни",
    description:
      "Тумбы в Ташкенте от Lioneto: прикроватные тумбы, мебель для спальни и интерьерные коллекции.",
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
  name: "Тумбы в Ташкенте — тумбы Lioneto для спальни",
  url: PAGE_URL,
  description:
    "Тумбы в Ташкенте от Lioneto: прикроватные тумбы, мебель для спальни и интерьерные коллекции.",
  inLanguage: "ru",
};

export default function NightstandsInTashkentPage() {
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
          <span className="text-black/80">ТУМБЫ В ТАШКЕНТЕ</span>
        </nav>

        <header className="mt-6 max-w-4xl md:mt-10">
          <h1 className="text-balance text-[32px] font-semibold leading-[1.02] tracking-[-0.03em] md:text-[56px]">
            Тумбы в Ташкенте
          </h1>

          <p className="mt-5 text-[15px] leading-7 text-black/75 md:text-[18px] md:leading-8">
            Lioneto предлагает тумбы в Ташкенте для спальни и современных
            интерьеров. На сайте можно посмотреть прикроватные тумбы в составе
            цельных коллекций мебели для спальни.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-[13px] font-medium tracking-[0.12em] text-white transition hover:opacity-90"
            >
              ПЕРЕЙТИ В КАТАЛОГ
            </Link>
            <Link
              href="/mebel-dlya-spalni-v-tashkente"
              className="inline-flex items-center justify-center rounded-full border border-black/10 px-6 py-3 text-[13px] font-medium tracking-[0.12em] text-black transition hover:border-black/20"
            >
              МЕБЕЛЬ ДЛЯ СПАЛЬНИ
            </Link>
          </div>
        </header>

        <section className="mt-12 max-w-5xl">
          <h2 className="text-[26px] font-semibold tracking-[-0.02em] md:text-[36px]">
            Прикроватные тумбы Lioneto
          </h2>

          <div className="mt-5 space-y-5 text-[15px] leading-7 text-black/75 md:text-[17px] md:leading-8">
            <p>
              Если вы ищете тумбы в Ташкенте для спальни, лучше рассматривать их
              как часть общего интерьерного решения. В Lioneto тумбы сочетаются
              с кроватями, шкафами, комодами и другими элементами спальни внутри
              одной коллекции.
            </p>
            <p>
              Такой подход помогает собрать гармоничное пространство, где каждая
              деталь поддерживает общий стиль комнаты. Прикроватные тумбы
              особенно важны для завершенного образа спальни, потому что они
              работают рядом с кроватью и влияют на визуальный баланс интерьера.
            </p>
            <p>
              На сайте Lioneto можно перейти к спальням, кроватям и другой
              мебели для спальни, чтобы посмотреть решения в едином стиле и
              быстрее подобрать подходящую композицию для дома.
            </p>
          </div>
        </section>

        <section className="mt-12 grid gap-4 md:grid-cols-3">
          <Link
            href="/krovati-v-tashkente"
            className="rounded-3xl border border-black/10 p-6 transition hover:border-black/20"
          >
            <h2 className="text-[22px] font-semibold tracking-[-0.02em]">
              Кровати в Ташкенте
            </h2>
            <p className="mt-3 text-[15px] leading-7 text-black/70">
              Перейдите к странице кроватей Lioneto.
            </p>
          </Link>
          <Link
            href="/shkafy-v-tashkente"
            className="rounded-3xl border border-black/10 p-6 transition hover:border-black/20"
          >
            <h2 className="text-[22px] font-semibold tracking-[-0.02em]">
              Шкафы в Ташкенте
            </h2>
            <p className="mt-3 text-[15px] leading-7 text-black/70">
              Посмотрите страницу шкафов Lioneto для спальни.
            </p>
          </Link>
          <Link
            href="/komody-v-tashkente"
            className="rounded-3xl border border-black/10 p-6 transition hover:border-black/20"
          >
            <h2 className="text-[22px] font-semibold tracking-[-0.02em]">
              Комоды в Ташкенте
            </h2>
            <p className="mt-3 text-[15px] leading-7 text-black/70">
              Откройте страницу с комодами Lioneto для спальни.
            </p>
          </Link>
        </section>

        <div className="h-14 md:h-20" />
      </div>
    </main>
  );
}
