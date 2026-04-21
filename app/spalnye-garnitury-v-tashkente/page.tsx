import type { Metadata } from "next";
import Link from "next/link";

const SITE_URL = "https://lioneto.com";
const PAGE_URL = `${SITE_URL}/spalnye-garnitury-v-tashkente`;

export const metadata: Metadata = {
  title: "Спальные гарнитуры в Ташкенте — Lioneto",
  description:
    "Спальные гарнитуры в Ташкенте от Lioneto: кровати, шкафы, комоды, тумбы и цельные интерьерные решения для спальни. Смотрите коллекции, каталог и адреса салонов.",
  keywords: [
    "спальные гарнитуры в Ташкенте",
    "спальный гарнитур Ташкент",
    "купить спальный гарнитур в Ташкенте",
    "мебель для спальни Ташкент",
    "спальни в Ташкенте",
    "кровати в Ташкенте",
    "Lioneto спальни",
    "Lioneto Ташкент",
  ],
  alternates: {
    canonical: PAGE_URL,
  },
  openGraph: {
    title: "Спальные гарнитуры в Ташкенте — Lioneto",
    description:
      "Спальные гарнитуры Lioneto в Ташкенте: цельные интерьерные решения для современной спальни.",
    url: PAGE_URL,
    type: "website",
    locale: "ru_RU",
    siteName: "Lioneto",
    images: [
      {
        url: `${SITE_URL}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: "Спальные гарнитуры в Ташкенте — Lioneto",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Спальные гарнитуры в Ташкенте — Lioneto",
    description:
      "Спальные гарнитуры Lioneto в Ташкенте: кровати, шкафы, комоды, тумбы и интерьерные решения.",
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
  name: "Спальные гарнитуры в Ташкенте — Lioneto",
  url: PAGE_URL,
  description:
    "Спальные гарнитуры в Ташкенте от Lioneto: кровати, шкафы, комоды, тумбы и цельные интерьерные решения.",
  inLanguage: "ru",
};

const faqItems = [
  {
    q: "Что входит в спальный гарнитур?",
    a: "Обычно в спальный гарнитур входят кровать, прикроватные тумбы, шкаф, комод и иногда зеркало. У Lioneto основной акцент сделан на цельные интерьерные коллекции.",
  },
  {
    q: "Чем спальный гарнитур отличается от просто спальни?",
    a: "Спальный гарнитур — это готовое решение, где ключевые предметы мебели подобраны в одном стиле и воспринимаются как единый комплект.",
  },
  {
    q: "Где посмотреть спальные гарнитуры Lioneto в Ташкенте?",
    a: "На сайте можно перейти к каталогу и открыть страницу контактов с адресами салонов Lioneto в Ташкенте.",
  },
];

export default function BedroomSetsInTashkentPage() {
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
          <span className="text-black/80">СПАЛЬНЫЕ ГАРНИТУРЫ В ТАШКЕНТЕ</span>
        </nav>

        <header className="mt-6 max-w-4xl md:mt-10">
          <h1 className="text-balance text-[32px] font-semibold leading-[1.02] tracking-[-0.03em] md:text-[56px]">
            Спальные гарнитуры в Ташкенте
          </h1>

          <p className="mt-5 text-[15px] leading-7 text-black/75 md:text-[18px] md:leading-8">
            Lioneto предлагает спальные гарнитуры в Ташкенте для современных
            интерьеров. Это цельные решения для спальни, где кровати, шкафы,
            тумбы, комоды и другие элементы выдержаны в одном стиле.
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
              СТРАНИЦА СПАЛЕН
            </Link>
          </div>
        </header>

        <section className="mt-12 max-w-5xl">
          <h2 className="text-[26px] font-semibold tracking-[-0.02em] md:text-[36px]">
            Готовые решения для спальни
          </h2>

          <div className="mt-5 space-y-5 text-[15px] leading-7 text-black/75 md:text-[17px] md:leading-8">
            <p>
              Если вы ищете спальный гарнитур в Ташкенте, удобнее выбирать не
              случайный набор мебели, а готовое решение, где все элементы
              сочетаются между собой по стилю, материалам и пропорциям. Именно
              такой подход использует Lioneto в своих интерьерных коллекциях.
            </p>
            <p>
              Спальные гарнитуры подходят тем, кто хочет сразу получить единый
              образ спальни без долгого подбора каждой позиции по отдельности.
              Это особенно удобно, когда важно сохранить цельность интерьера и
              быстро собрать мебель в одном визуальном ключе.
            </p>
            <p>
              На сайте можно посмотреть коллекции, перейти к кроватям, спальням
              и другим категориям мебели. Такая структура помогает выбрать
              готовый спальный гарнитур в Ташкенте и оценить, как разные
              предметы мебели работают вместе.
            </p>
          </div>
        </section>

        <section className="mt-12">
          <h2 className="text-[26px] font-semibold tracking-[-0.02em] md:text-[36px]">
            Что входит в спальный гарнитур
          </h2>

          <div className="mt-6 grid gap-4 md:grid-cols-5">
            {["Кровать", "Шкаф", "Тумбы", "Комод", "Зеркало"].map((item) => (
              <div
                key={item}
                className="rounded-3xl border border-black/10 p-5 text-center text-[15px] font-medium text-black/80"
              >
                {item}
              </div>
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

        <section className="mt-12 grid gap-4 md:grid-cols-3 md:gap-6">
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
              Откройте страницу со спальнями Lioneto в Ташкенте.
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
            href="/mebel-dlya-spalni-v-tashkente"
            className="rounded-3xl border border-black/10 p-6 transition hover:border-black/20"
          >
            <div className="text-[12px] tracking-[0.18em] text-black/45">
              МЕБЕЛЬ ДЛЯ СПАЛЬНИ
            </div>
            <h3 className="mt-3 text-[22px] font-semibold tracking-[-0.02em]">
              Мебель для спальни
            </h3>
            <p className="mt-3 text-[15px] leading-7 text-black/70">
              Посмотрите отдельную страницу по мебели для спальни в Ташкенте.
            </p>
          </Link>
        </section>

        <div className="h-14 md:h-20" />
      </div>
    </main>
  );
}
