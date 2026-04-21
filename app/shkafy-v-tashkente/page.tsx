import type { Metadata } from "next";
import Link from "next/link";

const SITE_URL = "https://lioneto.com";
const PAGE_URL = `${SITE_URL}/shkafy-v-tashkente`;

export const metadata: Metadata = {
  title: "Шкафы в Ташкенте — шкафы Lioneto для спальни",
  description:
    "Шкафы в Ташкенте от Lioneto: шкафы для спальни, интерьерные коллекции и мебель для дома. Смотрите каталог, спальни и адреса салонов.",
  keywords: [
    "шкафы в Ташкенте",
    "купить шкаф в Ташкенте",
    "шкаф Ташкент",
    "шкафы для спальни Ташкент",
    "мебель для спальни Ташкент",
    "спальни в Ташкенте",
    "Lioneto шкафы",
  ],
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: "Шкафы в Ташкенте — шкафы Lioneto для спальни",
    description:
      "Шкафы Lioneto в Ташкенте: решения для спальни и интерьерных коллекций.",
    url: PAGE_URL,
    type: "website",
    locale: "ru_RU",
    siteName: "Lioneto",
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Шкафы в Ташкенте — Lioneto",
      },
    ],
  },
};

const pageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Шкафы в Ташкенте — шкафы Lioneto для спальни",
  url: PAGE_URL,
  description:
    "Шкафы в Ташкенте от Lioneto: шкафы для спальни, интерьерные коллекции и мебель для дома.",
  inLanguage: "ru",
};

export default function WardrobesInTashkentPage() {
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
          <span className="text-black/80">ШКАФЫ В ТАШКЕНТЕ</span>
        </nav>

        <header className="mt-6 max-w-4xl md:mt-10">
          <h1 className="text-balance text-[32px] font-semibold leading-[1.02] tracking-[-0.03em] md:text-[56px]">
            Шкафы в Ташкенте
          </h1>

          <p className="mt-5 text-[15px] leading-7 text-black/75 md:text-[18px] md:leading-8">
            Lioneto предлагает шкафы в Ташкенте для спальни, дома и современных
            интерьеров. На сайте можно посмотреть коллекции мебели и подобрать
            шкафы в сочетании с кроватями, тумбами и комодами.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-[13px] font-medium tracking-[0.12em] text-white transition hover:opacity-90"
            >
              ПЕРЕЙТИ В КАТАЛОГ
            </Link>
            <Link
              href="/spalni-v-tashkente"
              className="inline-flex items-center justify-center rounded-full border border-black/10 px-6 py-3 text-[13px] font-medium tracking-[0.12em] text-black transition hover:border-black/20"
            >
              СПАЛЬНИ В ТАШКЕНТЕ
            </Link>
          </div>
        </header>

        <section className="mt-12 max-w-5xl">
          <h2 className="text-[26px] font-semibold tracking-[-0.02em] md:text-[36px]">
            Шкафы Lioneto для спальни
          </h2>

          <div className="mt-5 space-y-5 text-[15px] leading-7 text-black/75 md:text-[17px] md:leading-8">
            <p>
              Если вы ищете шкафы в Ташкенте для спальни, гардеробной или
              современного интерьера, важно учитывать не только вместительность,
              но и то, как шкаф будет смотреться вместе с остальной мебелью.
            </p>
            <p>
              В Lioneto шкафы воспринимаются как часть цельной интерьерной
              коллекции. Благодаря этому их удобно сочетать с кроватями,
              прикроватными тумбами, комодами и другими элементами спальни.
            </p>
            <p>
              Такой подход помогает собрать гармоничное пространство в одном
              стиле и подобрать мебель без случайных сочетаний по форме,
              материалам и подаче.
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
            href="/spalnye-garnitury-v-tashkente"
            className="rounded-3xl border border-black/10 p-6 transition hover:border-black/20"
          >
            <h2 className="text-[22px] font-semibold tracking-[-0.02em]">
              Спальные гарнитуры
            </h2>
            <p className="mt-3 text-[15px] leading-7 text-black/70">
              Посмотрите готовые решения для спальни.
            </p>
          </Link>
          <Link
            href="/mebel-dlya-spalni-v-tashkente"
            className="rounded-3xl border border-black/10 p-6 transition hover:border-black/20"
          >
            <h2 className="text-[22px] font-semibold tracking-[-0.02em]">
              Мебель для спальни
            </h2>
            <p className="mt-3 text-[15px] leading-7 text-black/70">
              Откройте страницу с мебелью для спальни в Ташкенте.
            </p>
          </Link>
        </section>

        <div className="h-14 md:h-20" />
      </div>
    </main>
  );
}
