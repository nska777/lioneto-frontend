import type { Metadata } from "next";
import Link from "next/link";

const SITE_URL = "https://lioneto.com";
const PAGE_URL = `${SITE_URL}/krovati-v-tashkente`;

export const metadata: Metadata = {
  title: "Кровати в Ташкенте — кровати Lioneto для спальни",
  description:
    "Кровати в Ташкенте от Lioneto: современные кровати для спальни, интерьерные коллекции и мебель для дома. Смотрите каталог, спальни и адреса салонов.",
  keywords: [
    "кровати в Ташкенте",
    "купить кровать в Ташкенте",
    "кровать Ташкент",
    "мебель для спальни Ташкент",
    "спальни в Ташкенте",
    "спальный гарнитур Ташкент",
    "Lioneto кровати",
    "Lioneto Ташкент",
  ],
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: "Кровати в Ташкенте — кровати Lioneto для спальни",
    description:
      "Кровати Lioneto в Ташкенте: современные кровати для спальни и интерьерные коллекции.",
    url: PAGE_URL,
    type: "website",
    locale: "ru_RU",
    siteName: "Lioneto",
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Кровати в Ташкенте — Lioneto",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Кровати в Ташкенте — кровати Lioneto для спальни",
    description:
      "Кровати Lioneto в Ташкенте: современные кровати для спальни и интерьерные коллекции.",
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
  name: "Кровати в Ташкенте — кровати Lioneto для спальни",
  url: PAGE_URL,
  description:
    "Кровати в Ташкенте от Lioneto: современные кровати для спальни, интерьерные коллекции и мебель для дома.",
  inLanguage: "ru",
};

export default function BedsInTashkentPage() {
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
          <span className="text-black/80">КРОВАТИ В ТАШКЕНТЕ</span>
        </nav>

        <header className="mt-6 max-w-4xl md:mt-10">
          <h1 className="text-balance text-[32px] font-semibold leading-[1.02] tracking-[-0.03em] md:text-[56px]">
            Кровати в Ташкенте
          </h1>

          <p className="mt-5 text-[15px] leading-7 text-black/75 md:text-[18px] md:leading-8">
            Lioneto предлагает кровати в Ташкенте для современных спальней и
            цельных интерьерных решений. На сайте можно посмотреть коллекции
            мебели, перейти к спальням и выбрать подходящий стиль для дома.
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
            Современные кровати Lioneto
          </h2>

          <div className="mt-5 space-y-5 text-[15px] leading-7 text-black/75 md:text-[17px] md:leading-8">
            <p>
              Если вы ищете кровати в Ташкенте, важно смотреть не только на
              внешний вид, но и на то, как кровать вписывается в общий интерьер
              спальни. Lioneto делает ставку на цельные коллекции, где кровати
              гармонично сочетаются со шкафами, тумбами, комодами и другими
              элементами спальни.
            </p>
            <p>
              На сайте можно перейти к спальням, открыть коллекции и посмотреть
              каталог мебели. Эта страница подходит тем, кто ищет современные
              кровати в Ташкенте, мебель для спальни и интерьерные решения
              премиального уровня.
            </p>
          </div>
        </section>

        <section className="mt-12 grid gap-4 md:grid-cols-3 md:gap-6">
          <Link
            href="/spalni-v-tashkente"
            className="rounded-3xl border border-black/10 p-6 transition hover:border-black/20"
          >
            <div className="text-[12px] tracking-[0.18em] text-black/45">
              СПАЛЬНИ
            </div>
            <h2 className="mt-3 text-[22px] font-semibold tracking-[-0.02em]">
              Спальни в Ташкенте
            </h2>
            <p className="mt-3 text-[15px] leading-7 text-black/70">
              Откройте спальни Lioneto и перейдите к коллекциям мебели.
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
