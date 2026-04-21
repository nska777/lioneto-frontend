import type { Metadata } from "next";
import Link from "next/link";

const SITE_URL = "https://lioneto.com";
const PAGE_URL = `${SITE_URL}/premium-mebel-v-tashkente`;

export const metadata: Metadata = {
  title: "Премиальная мебель в Ташкенте — Lioneto",
  description:
    "Премиальная мебель в Ташкенте от Lioneto: спальни, кровати, шкафы, комоды и интерьерные коллекции для современного дома. Смотрите каталог и адреса салонов.",
  keywords: [
    "премиальная мебель в Ташкенте",
    "элитная мебель Ташкент",
    "дорогая мебель Ташкент",
    "мебель премиум Ташкент",
    "спальни Ташкент",
    "кровати Ташкент",
    "Lioneto",
    "Lioneto Ташкент",
  ],
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: "Премиальная мебель в Ташкенте — Lioneto",
    description:
      "Премиальная мебель Lioneto в Ташкенте: спальни, кровати, шкафы, комоды и интерьерные коллекции.",
    url: PAGE_URL,
    type: "website",
    locale: "ru_RU",
    siteName: "Lioneto",
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Премиальная мебель в Ташкенте — Lioneto",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Премиальная мебель в Ташкенте — Lioneto",
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
  name: "Премиальная мебель в Ташкенте — Lioneto",
  url: PAGE_URL,
  description:
    "Премиальная мебель в Ташкенте от Lioneto: спальни, кровати, шкафы, комоды и интерьерные коллекции.",
  inLanguage: "ru",
};

const faqItems = [
  {
    q: "Что значит премиальная мебель Lioneto?",
    a: "Lioneto делает акцент на цельных интерьерных коллекциях, визуальной подаче, сочетании предметов мебели между собой и более высоком уровне дизайна для спальни и дома.",
  },
  {
    q: "Какая мебель представлена у Lioneto?",
    a: "На сайте можно посмотреть спальни, кровати, шкафы, комоды, тумбы и другие предметы мебели для дома и спальни.",
  },
  {
    q: "Где посмотреть премиальную мебель Lioneto в Ташкенте?",
    a: "На сайте доступны каталог и страница контактов с адресами салонов Lioneto в Ташкенте.",
  },
];

export default function PremiumFurnitureInTashkentPage() {
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
          <span className="text-black/80">ПРЕМИАЛЬНАЯ МЕБЕЛЬ В ТАШКЕНТЕ</span>
        </nav>

        <header className="mt-6 max-w-4xl md:mt-10">
          <h1 className="text-balance text-[32px] font-semibold leading-[1.02] tracking-[-0.03em] md:text-[56px]">
            Премиальная мебель в Ташкенте
          </h1>

          <p className="mt-5 text-[15px] leading-7 text-black/75 md:text-[18px] md:leading-8">
            Lioneto предлагает премиальную мебель в Ташкенте для спальни, дома и
            современных интерьеров. На сайте можно посмотреть коллекции, перейти
            к категориям мебели и подобрать решения в едином стиле.
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
            Мебель Lioneto для премиального интерьера
          </h2>

          <div className="mt-5 space-y-5 text-[15px] leading-7 text-black/75 md:text-[17px] md:leading-8">
            <p>
              Если вы ищете премиальную мебель в Ташкенте, важно смотреть не
              только на отдельный предмет, но и на то, как вся мебель работает в
              одном пространстве. Lioneto делает акцент на цельных интерьерных
              коллекциях, где кровати, шкафы, тумбы, комоды и другие элементы
              сочетаются между собой по стилю, пропорциям и общей подаче.
            </p>
            <p>
              Такой подход удобен для тех, кто хочет оформить спальню или дом в
              едином визуальном характере. Вместо случайного подбора мебели по
              отдельности можно сразу посмотреть решения, где каждый элемент
              поддерживает общий образ интерьера.
            </p>
            <p>
              На сайте Lioneto можно перейти к спальням, кроватям, гарнитурам и
              другим категориям мебели. Это помогает быстрее подобрать
              премиальную мебель в Ташкенте для квартиры, дома или дизайнерского
              пространства.
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
            href="/kupit-mebel-v-tashkente"
            className="rounded-3xl border border-black/10 p-6 transition hover:border-black/20"
          >
            <h2 className="text-[22px] font-semibold tracking-[-0.02em]">
              Купить мебель в Ташкенте
            </h2>
            <p className="mt-3 text-[15px] leading-7 text-black/70">
              Перейдите к общей странице покупки мебели Lioneto.
            </p>
          </Link>
          <Link
            href="/mebel-iz-massiva-v-tashkente"
            className="rounded-3xl border border-black/10 p-6 transition hover:border-black/20"
          >
            <h2 className="text-[22px] font-semibold tracking-[-0.02em]">
              Мебель из массива
            </h2>
            <p className="mt-3 text-[15px] leading-7 text-black/70">
              Посмотрите отдельную страницу по мебели из массива в Ташкенте.
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
              Откройте страницу со спальнями Lioneto.
            </p>
          </Link>
        </section>

        <div className="h-14 md:h-20" />
      </div>
    </main>
  );
}
