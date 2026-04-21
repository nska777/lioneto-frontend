import type { Metadata } from "next";
import Link from "next/link";

const SITE_URL = "https://lioneto.com";
const PAGE_URL = `${SITE_URL}/mebel-dlya-spalni-v-tashkente`;

export const metadata: Metadata = {
  title: "Мебель для спальни в Ташкенте — Lioneto",
  description:
    "Мебель для спальни в Ташкенте от Lioneto: кровати, шкафы, комоды, тумбы и интерьерные коллекции. Смотрите спальни, гарнитуры и каталог.",
  keywords: [
    "мебель для спальни в Ташкенте",
    "мебель для спальни Ташкент",
    "спальни в Ташкенте",
    "кровати в Ташкенте",
    "шкафы в Ташкенте",
    "спальные гарнитуры в Ташкенте",
    "Lioneto спальни",
  ],
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: "Мебель для спальни в Ташкенте — Lioneto",
    description:
      "Мебель для спальни в Ташкенте от Lioneto: кровати, шкафы, комоды, тумбы и интерьерные коллекции.",
    url: PAGE_URL,
    type: "website",
    locale: "ru_RU",
    siteName: "Lioneto",
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Мебель для спальни в Ташкенте — Lioneto",
      },
    ],
  },
};

const pageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Мебель для спальни в Ташкенте — Lioneto",
  url: PAGE_URL,
  description:
    "Мебель для спальни в Ташкенте от Lioneto: кровати, шкафы, комоды, тумбы и интерьерные коллекции.",
  inLanguage: "ru",
};

export default function BedroomFurnitureInTashkentPage() {
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
          <span className="text-black/80">МЕБЕЛЬ ДЛЯ СПАЛЬНИ В ТАШКЕНТЕ</span>
        </nav>

        <header className="mt-6 max-w-4xl md:mt-10">
          <h1 className="text-balance text-[32px] font-semibold leading-[1.02] tracking-[-0.03em] md:text-[56px]">
            Мебель для спальни в Ташкенте
          </h1>

          <p className="mt-5 text-[15px] leading-7 text-black/75 md:text-[18px] md:leading-8">
            Lioneto предлагает мебель для спальни в Ташкенте: кровати, шкафы,
            тумбы, комоды и другие элементы, которые можно сочетать в рамках
            одной интерьерной коллекции.
          </p>
        </header>

        <section className="mt-12 max-w-5xl">
          <div className="space-y-5 text-[15px] leading-7 text-black/75 md:text-[17px] md:leading-8">
            <p>
              Если вы ищете мебель для спальни в Ташкенте, удобнее рассматривать
              не отдельные предметы, а готовую систему выбора, где все элементы
              сочетаются между собой. Lioneto делает акцент именно на таком
              подходе.
            </p>
            <p>
              На сайте можно посмотреть спальни, кровати, спальные гарнитуры и
              другие категории мебели, а затем подобрать комбинацию, которая
              подходит под размеры комнаты и желаемый стиль интерьера.
            </p>
            <p>
              Такой формат удобен для тех, кто хочет собрать спальню в одном
              стиле и избежать визуально случайных сочетаний мебели.
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
              Откройте спальни Lioneto и мебель для спальни.
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
              Перейдите к отдельной странице кроватей.
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
        </section>

        <div className="h-14 md:h-20" />
      </div>
    </main>
  );
}
