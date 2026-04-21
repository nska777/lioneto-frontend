import type { Metadata } from "next";
import Link from "next/link";

const SITE_URL = "https://lioneto.com";
const PAGE_URL = `${SITE_URL}/komody-v-tashkente`;

export const metadata: Metadata = {
  title: "Комоды в Ташкенте — комоды Lioneto для спальни",
  description:
    "Комоды в Ташкенте от Lioneto: комоды для спальни, интерьерные коллекции и мебель для дома. Смотрите каталог, спальни и актуальные решения.",
  keywords: [
    "комоды в Ташкенте",
    "купить комод в Ташкенте",
    "комод Ташкент",
    "комоды для спальни Ташкент",
    "мебель для спальни Ташкент",
    "спальни в Ташкенте",
    "Lioneto комоды",
  ],
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: "Комоды в Ташкенте — комоды Lioneto для спальни",
    description:
      "Комоды Lioneto в Ташкенте: решения для спальни и интерьерных коллекций.",
    url: PAGE_URL,
    type: "website",
    locale: "ru_RU",
    siteName: "Lioneto",
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Комоды в Ташкенте — Lioneto",
      },
    ],
  },
};

const pageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Комоды в Ташкенте — комоды Lioneto для спальни",
  url: PAGE_URL,
  description:
    "Комоды в Ташкенте от Lioneto: комоды для спальни, интерьерные коллекции и мебель для дома.",
  inLanguage: "ru",
};

export default function DressersInTashkentPage() {
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
          <span className="text-black/80">КОМОДЫ В ТАШКЕНТЕ</span>
        </nav>

        <header className="mt-6 max-w-4xl md:mt-10">
          <h1 className="text-balance text-[32px] font-semibold leading-[1.02] tracking-[-0.03em] md:text-[56px]">
            Комоды в Ташкенте
          </h1>

          <p className="mt-5 text-[15px] leading-7 text-black/75 md:text-[18px] md:leading-8">
            Lioneto предлагает комоды в Ташкенте для спальни и современных
            интерьеров. На сайте можно подобрать комоды в сочетании с кроватями,
            шкафами, тумбами и другими элементами мебели.
          </p>
        </header>

        <section className="mt-12 max-w-5xl">
          <div className="space-y-5 text-[15px] leading-7 text-black/75 md:text-[17px] md:leading-8">
            <p>
              Если вы ищете комоды в Ташкенте, важно учитывать не только размер
              и функциональность, но и то, как комод будет смотреться в составе
              всей спальни.
            </p>
            <p>
              В Lioneto комоды являются частью интерьерных коллекций, где каждый
              предмет мебели поддерживает общий стиль спальни и помогает собрать
              цельное визуальное решение.
            </p>
            <p>
              Такой формат удобен для тех, кто хочет подобрать мебель для
              спальни в едином характере и не тратить время на случайный подбор
              разных предметов по отдельности.
            </p>
          </div>
        </section>

        <section className="mt-12 grid gap-4 md:grid-cols-3">
          <Link
            href="/spalni-v-tashkente"
            className="rounded-3xl border border-black/10 p-6 transition hover:border-black/20"
          >
            <h2 className="text-[22px] font-semibold tracking-[-0.02em]">
              Спальни в Ташкенте
            </h2>
            <p className="mt-3 text-[15px] leading-7 text-black/70">
              Откройте спальни Lioneto и интерьерные коллекции.
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
              Посмотрите шкафы Lioneto для спальни.
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
              Перейдите к странице кроватей Lioneto.
            </p>
          </Link>
        </section>

        <div className="h-14 md:h-20" />
      </div>
    </main>
  );
}
