// app/page.tsx
import type { Metadata } from "next";
import Link from "next/link";

import GSAPHeroSlider from "./components/home/GSAPHeroSlider";
import BestSellers, {
  type FeaturedProduct,
} from "./components/home/BestSellers";
import BestPrice from "./components/home/BestPrice";
import AboutCompany from "./components/home/AboutCompany";
import CollectionsSlider from "./components/home/CollectionsSlider";

import SupplyNewsSection from "./components/home/SupplyNewsSection";
import { supplyNewsMock } from "./mocks/supplyNews";
import NewsletterCta from "./components/home/NewsletterCta";

import IOSHeavySectionGate from "./components/system/IOSHeavySectionGate";
import IOSHomeDebugOnly from "./components/system/IOSHomeDebugOnly";

import { COLLECTIONS_SLIDER_MOCK } from "./lib/mock/collections-slider";
import { fetchNews } from "./lib/strapi/news";

const SITE_URL = "https://lioneto.com";
const SITE_NAME = "Lioneto";

export const metadata: Metadata = {
  title: "Мебель в Ташкенте — премиальная мебель Lioneto для спальни и дома",
  description:
    "Lioneto — премиальная мебель в Ташкенте. Спальни, кровати, шкафы и интерьерные коллекции для современного дома. Каталог мебели, новости, сотрудничество для дизайнеров, дилеров и B2B.",
  keywords: [
    "мебель в Ташкенте",
    "мебель Ташкент",
    "премиальная мебель Ташкент",
    "элитная мебель Ташкент",
    "спальни в Ташкенте",
    "кровати в Ташкенте",
    "шкафы в Ташкенте",
    "мебель для спальни Ташкент",
    "современная мебель Ташкент",
    "дизайнерская мебель Ташкент",
    "Lioneto",
    "Lioneto мебель",
    "премиальная мебель",
    "мебель для дома",
    "мебель Узбекистан",
  ],
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Мебель в Ташкенте — премиальная мебель Lioneto",
    description:
      "Премиальная мебель Lioneto в Ташкенте: спальни, кровати, шкафы и интерьерные решения для современного дома.",
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
    locale: "ru_RU",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Мебель Lioneto в Ташкенте",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Мебель в Ташкенте — премиальная мебель Lioneto",
    description:
      "Премиальная мебель Lioneto в Ташкенте: спальни, кровати, шкафы и интерьерные коллекции.",
    images: ["/og-image.jpg"],
  },
};

const homePageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: "Мебель в Ташкенте — премиальная мебель Lioneto",
  url: SITE_URL,
  description:
    "Lioneto — премиальная мебель в Ташкенте. Спальни, кровати, шкафы и интерьерные коллекции для современного дома.",
  inLanguage: "ru",
  about: {
    "@type": "Thing",
    name: "Премиальная мебель в Ташкенте",
  },
  breadcrumb: {
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Главная",
        item: SITE_URL,
      },
    ],
  },
};

function getStrapiBase() {
  return (
    process.env.NEXT_PUBLIC_STRAPI_URL ||
    process.env.STRAPI_URL ||
    "http://localhost:1337"
  );
}

function absUrl(base: string, url: string) {
  const u = String(url ?? "").trim();

  if (!u) return "";
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  if (u.startsWith("//")) return `https:${u}`;
  if (u.startsWith("/")) return `${base}${u}`;

  return `${base}/${u}`;
}

function pickMediaUrl(base: string, mediaAny: any): string {
  const m = mediaAny?.data?.attributes ?? mediaAny?.attributes ?? mediaAny;
  const url = String(m?.url ?? "").trim();

  return absUrl(base, url);
}

function pickGalleryUrls(base: string, galleryAny: any): string[] {
  const arr = Array.isArray(galleryAny?.data)
    ? galleryAny.data
    : Array.isArray(galleryAny)
      ? galleryAny
      : [];

  return arr
    .map((x: any) => {
      const a = x?.attributes ?? x?.data?.attributes ?? x;
      return absUrl(base, String(a?.url ?? "").trim());
    })
    .filter(Boolean);
}

async function fetchFeaturedProducts(
  badge: "Хит продаж" | "Лучшая цена",
): Promise<FeaturedProduct[]> {
  const base = getStrapiBase();

  try {
    const qs = new URLSearchParams();

    qs.set("filters[isActive][$eq]", "true");
    qs.set("filters[collectionBadge][$eq]", badge);

    qs.set("pagination[page]", "1");
    qs.set("pagination[pageSize]", "12");
    qs.set("sort[0]", "sortOrder:asc");

    qs.set("populate[0]", "media");
    qs.set("populate[1]", "gallery");

    const url = `${base}/api/products?${qs.toString()}`;

    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      console.error(
        "products fetch failed:",
        badge,
        res.status,
        res.statusText,
      );

      return [];
    }

    const json = await res.json();
    const data = Array.isArray(json?.data) ? json.data : [];

    return data
      .map((item: any) => {
        const src = item?.attributes ?? item;

        const slug = String(src?.slug ?? "").trim();
        if (!slug) return null;

        const mediaUrl = pickMediaUrl(base, src?.media);
        const galleryUrls = pickGalleryUrls(base, src?.gallery);

        const image = mediaUrl || galleryUrls[0] || "";

        const out: FeaturedProduct = {
          id: slug,
          slug,
          title: String(src?.title ?? "").trim() || slug,
          href: `/product/${slug}`,
          image,
          priceUZS: Number(src?.priceUZS ?? 0),
          priceRUB: Number(src?.priceRUB ?? 0),
          oldPriceUZS:
            src?.oldPriceUZS != null ? Number(src?.oldPriceUZS) : undefined,
          oldPriceRUB:
            src?.oldPriceRUB != null ? Number(src?.oldPriceRUB) : undefined,
          collectionBadge: String(src?.collectionBadge ?? "").trim() || badge,
          isActive: Boolean(src?.isActive),
          brand: src?.brand ?? null,
          collection: src?.collection ?? null,
        };

        return out;
      })
      .filter(Boolean) as FeaturedProduct[];
  } catch (e) {
    console.error("products fetch error:", badge, e);

    return [];
  }
}

const seoCollectionLinks = [
  {
    label: "AMBER",
    text: "Коллекция мебели AMBER",
    href: "/catalog?menu=bedrooms&collections=amber&hero=1",
  },
  {
    label: "SCANDI",
    text: "Коллекция мебели SCANDI",
    href: "/catalog?menu=living&collections=scandi&hero=1",
  },
  {
    label: "ELIZABETH",
    text: "Коллекция мебели ELIZABETH",
    href: "/catalog?menu=bedrooms&collections=elizabeth&hero=1",
  },
  {
    label: "SALVADOR",
    text: "Коллекция мебели SALVADOR",
    href: "/catalog?menu=bedrooms&collections=salvador&hero=1",
  },
  {
    label: "PITTI",
    text: "Коллекция мебели PITTI",
    href: "/catalog?menu=bedrooms&collections=pitti&hero=1",
  },
  {
    label: "BUONGIORNO",
    text: "Коллекция мебели BUONGIORNO",
    href: "/catalog?menu=bedrooms&collections=buongiorno&hero=1",
  },
];

export default async function Page() {
  const [hitProducts, bestProducts] = await Promise.all([
    fetchFeaturedProducts("Хит продаж"),
    fetchFeaturedProducts("Лучшая цена"),
  ]);

  const newsFromStrapi = await fetchNews({ limit: 6 });
  const newsItems =
    newsFromStrapi.length > 0
      ? (newsFromStrapi as any)
      : (supplyNewsMock as any);

  return (
    <IOSHomeDebugOnly>
      <>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(homePageJsonLd),
          }}
        />

        <main className="min-w-0 overflow-x-hidden">
          <GSAPHeroSlider />

          <IOSHeavySectionGate>
            <BestSellers products={hitProducts} />
            <BestPrice products={bestProducts} />
            <CollectionsSlider collections={COLLECTIONS_SLIDER_MOCK} />
            <SupplyNewsSection items={newsItems} />
          </IOSHeavySectionGate>

          <AboutCompany />

          <NewsletterCta backgroundUrl="/images/home/newsletter-bg.jpg" />

          <section className="border-t border-black/10 bg-white text-black">
            <div className="mx-auto w-full max-w-[1200px] px-4 py-12 md:py-16">
              <div className="max-w-4xl">
                <h2 className="text-[28px] font-semibold tracking-[-0.02em] md:text-[40px]">
                  Популярные коллекции Lioneto в Ташкенте
                </h2>

                <p className="mt-4 text-[15px] leading-7 text-black/70 md:text-[17px]">
                  Откройте популярные коллекции мебели Lioneto и перейдите к
                  актуальным подборкам внутри каталога. Эти страницы помогают
                  быстрее найти нужный стиль, коллекцию и мебель для спальни или
                  интерьера.
                </p>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {seoCollectionLinks.map((item) => (
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

              <div className="mt-12 grid gap-4 md:grid-cols-3 md:gap-6">
                <Link
                  href="/catalog"
                  className="rounded-3xl border border-black/10 p-6 transition hover:border-black/20"
                >
                  <div className="text-[12px] tracking-[0.18em] text-black/45">
                    КАТАЛОГ
                  </div>

                  <h3 className="mt-3 text-[22px] font-semibold tracking-[-0.02em]">
                    Каталог мебели
                  </h3>

                  <p className="mt-3 text-[15px] leading-7 text-black/70">
                    Откройте каталог Lioneto и посмотрите мебель для спальни,
                    гостиной и других интерьерных зон.
                  </p>
                </Link>

                <Link
                  href="/contacts"
                  className="rounded-3xl border border-black/10 p-6 transition hover:border-black/20"
                >
                  <div className="text-[12px] tracking-[0.18em] text-black/45">
                    КОНТАКТЫ
                  </div>

                  <h3 className="mt-3 text-[22px] font-semibold tracking-[-0.02em]">
                    Салоны в Ташкенте
                  </h3>

                  <p className="mt-3 text-[15px] leading-7 text-black/70">
                    Адреса магазинов, телефоны, режим работы и карта салонов
                    Lioneto.
                  </p>
                </Link>

                <Link
                  href="/news"
                  className="rounded-3xl border border-black/10 p-6 transition hover:border-black/20"
                >
                  <div className="text-[12px] tracking-[0.18em] text-black/45">
                    НОВОСТИ
                  </div>

                  <h3 className="mt-3 text-[22px] font-semibold tracking-[-0.02em]">
                    Новости и материалы
                  </h3>

                  <p className="mt-3 text-[15px] leading-7 text-black/70">
                    Следите за новостями Lioneto, новыми коллекциями и полезными
                    материалами по интерьеру.
                  </p>
                </Link>
              </div>

              <div className="mt-12 max-w-4xl">
                <h2 className="text-[28px] font-semibold tracking-[-0.02em] md:text-[40px]">
                  Мебель в Ташкенте
                </h2>

                <div className="mt-4 space-y-4 text-[15px] leading-7 text-black/70 md:text-[17px]">
                  <p>
                    Lioneto — премиальная мебель в Ташкенте для современных
                    интерьеров. На сайте представлены коллекции для спальни,
                    кровати, шкафы и другие интерьерные решения, которые
                    помогают собрать цельное и визуально сильное пространство.
                  </p>

                  <p>
                    Если вы ищете мебель в Ташкенте, каталог Lioneto позволяет
                    быстро перейти к нужным коллекциям, посмотреть фото,
                    характеристики и открыть карточки товаров. Для удобства
                    выбора мы также вынесли ссылки на популярные коллекции и
                    страницу контактов салонов.
                  </p>
                </div>
              </div>
            </div>
          </section>
        </main>
      </>
    </IOSHomeDebugOnly>
  );
}
