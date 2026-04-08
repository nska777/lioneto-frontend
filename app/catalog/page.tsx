import type { Metadata } from "next";
import Link from "next/link";
import CatalogClient from "./ui/CatalogClient";

const BASE_URL = "https://lioneto.com";

type SearchParams = Record<string, string | string[] | undefined>;

function getSingleParam(value: string | string[] | undefined): string {
  return typeof value === "string" ? value.trim() : "";
}

function normalize(value: string | string[] | undefined): string {
  return getSingleParam(value).toLowerCase();
}

const SEO_COLLECTIONS: Record<
  string,
  {
    title: string;
    description: string;
    menu?: string;
    label: string;
  }
> = {
  amber: {
    title: "Коллекция AMBER | Спальни Lioneto в Ташкенте",
    description:
      "Коллекция AMBER от Lioneto в Ташкенте — современная мебель для спальни: фото, модели, характеристики и актуальный ассортимент.",
    menu: "bedrooms",
    label: "AMBER",
  },
  scandi: {
    title: "Коллекция SCANDI | Мебель Lioneto в Ташкенте",
    description:
      "Коллекция SCANDI от Lioneto в Ташкенте — мебель в скандинавском стиле: фото, характеристики и актуальные модели для интерьера.",
    menu: "living",
    label: "SCANDI",
  },
  elizabeth: {
    title: "Коллекция ELIZABETH | Мебель Lioneto в Ташкенте",
    description:
      "Коллекция ELIZABETH от Lioneto в Ташкенте — премиальная мебель Lioneto: фото, модели, характеристики и актуальный ассортимент.",
    menu: "bedrooms",
    label: "ELIZABETH",
  },
  salvador: {
    title: "Коллекция SALVADOR | Мебель Lioneto в Ташкенте",
    description:
      "Коллекция SALVADOR от Lioneto в Ташкенте — мебель Lioneto для современного интерьера: фото, характеристики и актуальные модели.",
    menu: "bedrooms",
    label: "SALVADOR",
  },
  pitti: {
    title: "Коллекция PITTI | Мебель Lioneto в Ташкенте",
    description:
      "Коллекция PITTI от Lioneto в Ташкенте — премиальная мебель для дома: фото, модели, характеристики и актуальный ассортимент.",
    menu: "bedrooms",
    label: "PITTI",
  },
  buongiorno: {
    title: "Коллекция BUONGIORNO | Мебель Lioneto в Ташкенте",
    description:
      "Коллекция BUONGIORNO от Lioneto в Ташкенте — мебель Lioneto для спальни и интерьера: фото, характеристики и актуальные модели.",
    menu: "bedrooms",
    label: "BUONGIORNO",
  },
};

function buildSeoCollectionUrl(collection: string, menu?: string) {
  const params = new URLSearchParams();
  if (menu) params.set("menu", menu);
  params.set("collections", collection);
  params.set("hero", "1");
  return `${BASE_URL}/catalog?${params.toString()}`;
}

function isSeoCollectionPage(searchParams: SearchParams) {
  const collection = normalize(searchParams.collections);
  return Boolean(collection && SEO_COLLECTIONS[collection]);
}

function hasNonSeoFilters(searchParams: SearchParams) {
  const brand = getSingleParam(searchParams.brand);
  const category = getSingleParam(searchParams.category);

  return Boolean(brand || category);
}

function shouldNoindex(searchParams: SearchParams) {
  const isSeoCollection = isSeoCollectionPage(searchParams);
  if (isSeoCollection) return false;

  return hasNonSeoFilters(searchParams);
}

function getCatalogSeo(searchParams: SearchParams) {
  const collection = normalize(searchParams.collections);
  const seoCollection = SEO_COLLECTIONS[collection];

  if (seoCollection) {
    const canonical = buildSeoCollectionUrl(collection, seoCollection.menu);
    return {
      title: seoCollection.title,
      description: seoCollection.description,
      canonical,
      keywords: [
        `${collection} Lioneto`,
        `${collection} мебель`,
        `${collection} Ташкент`,
        `${collection} купить в Ташкенте`,
        "мебель в Ташкенте",
        "премиальная мебель Ташкент",
        "Lioneto",
      ],
      pageName: `Коллекция ${collection.toUpperCase()} Lioneto`,
    };
  }

  return {
    title: "Каталог мебели в Ташкенте | Lioneto",
    description:
      "Каталог мебели Lioneto в Ташкенте: спальни, гостиные, молодежные, прихожие и другие интерьерные коллекции. Смотрите фото, модели, характеристики и актуальный ассортимент.",
    canonical: `${BASE_URL}/catalog`,
    keywords: [
      "каталог мебели Ташкент",
      "мебель в Ташкенте",
      "каталог мебели Lioneto",
      "спальни в Ташкенте",
      "гостиные в Ташкенте",
      "премиальная мебель Ташкент",
      "Lioneto каталог",
      "Lioneto Ташкент",
    ],
    pageName: "Каталог мебели Lioneto",
  };
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const seo = getCatalogSeo(sp);
  const noindex = shouldNoindex(sp);

  return {
    title: seo.title,
    description: seo.description,
    keywords: seo.keywords,
    alternates: {
      canonical: seo.canonical,
    },
    robots: noindex
      ? {
          index: false,
          follow: true,
          googleBot: {
            index: false,
            follow: true,
          },
        }
      : {
          index: true,
          follow: true,
          googleBot: {
            index: true,
            follow: true,
          },
        },
    openGraph: {
      type: "website",
      url: seo.canonical,
      title: seo.title,
      description: seo.description,
      siteName: "Lioneto",
      locale: "ru_RU",
      images: [
        {
          url: `${BASE_URL}/og-image.jpg`,
          alt: seo.pageName,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.title,
      description: seo.description,
      images: [`${BASE_URL}/og-image.jpg`],
    },
  };
}

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const brand = getSingleParam(sp.brand);
  const category = getSingleParam(sp.category);
  const seo = getCatalogSeo(sp);

  const collectionPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: seo.pageName,
    url: seo.canonical,
    description: seo.description,
    inLanguage: "ru",
    isPartOf: {
      "@type": "WebSite",
      name: "Lioneto",
      url: BASE_URL,
    },
  };

  const breadcrumbJsonLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Главная",
        item: BASE_URL,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Каталог",
        item: `${BASE_URL}/catalog`,
      },
      ...(seo.canonical !== `${BASE_URL}/catalog`
        ? [
            {
              "@type": "ListItem",
              position: 3,
              name: seo.pageName,
              item: seo.canonical,
            },
          ]
        : []),
    ],
  };

  const itemListJsonLd = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: seo.pageName,
    url: seo.canonical,
    description: seo.description,
  };

  const seoLinks = [
    {
      href: buildSeoCollectionUrl("amber", SEO_COLLECTIONS.amber.menu),
      label: SEO_COLLECTIONS.amber.label,
      text: "Коллекция мебели AMBER",
    },
    {
      href: buildSeoCollectionUrl("scandi", SEO_COLLECTIONS.scandi.menu),
      label: SEO_COLLECTIONS.scandi.label,
      text: "Коллекция мебели SCANDI",
    },
    {
      href: buildSeoCollectionUrl("elizabeth", SEO_COLLECTIONS.elizabeth.menu),
      label: SEO_COLLECTIONS.elizabeth.label,
      text: "Коллекция мебели ELIZABETH",
    },
    {
      href: buildSeoCollectionUrl("salvador", SEO_COLLECTIONS.salvador.menu),
      label: SEO_COLLECTIONS.salvador.label,
      text: "Коллекция мебели SALVADOR",
    },
    {
      href: buildSeoCollectionUrl("pitti", SEO_COLLECTIONS.pitti.menu),
      label: SEO_COLLECTIONS.pitti.label,
      text: "Коллекция мебели PITTI",
    },
    {
      href: buildSeoCollectionUrl(
        "buongiorno",
        SEO_COLLECTIONS.buongiorno.menu,
      ),
      label: SEO_COLLECTIONS.buongiorno.label,
      text: "Коллекция мебели BUONGIORNO",
    },
  ];

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionPageJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbJsonLd),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(itemListJsonLd),
        }}
      />

      <main className="bg-white text-black">
        <CatalogClient initialBrand={brand} initialCategory={category} />

        <section className="border-t border-black/10">
          <div className="mx-auto w-full max-w-[1200px] px-4 py-10 md:py-14">
            <div className="max-w-4xl">
              <h2 className="text-[24px] font-semibold tracking-[-0.02em] md:text-[34px]">
                Популярные коллекции Lioneto
              </h2>
              <p className="mt-4 text-[15px] leading-7 text-black/70 md:text-[17px]">
                Откройте популярные коллекции мебели Lioneto в Ташкенте. Эти
                ссылки ведут на актуальные подборки внутри каталога и помогают
                быстрее перейти к нужному стилю и модели.
              </p>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {seoLinks.map((item) => (
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

            <div className="mt-10 max-w-4xl">
              <h2 className="text-[24px] font-semibold tracking-[-0.02em] md:text-[34px]">
                Каталог мебели в Ташкенте
              </h2>
              <div className="mt-4 space-y-4 text-[15px] leading-7 text-black/70 md:text-[17px]">
                <p>
                  В каталоге Lioneto представлены коллекции мебели для спальни,
                  гостиной и других интерьерных зон. Здесь можно посмотреть
                  актуальные модели, фото, характеристики, материалы и выбрать
                  подходящую коллекцию под стиль интерьера.
                </p>
                <p>
                  Если вы ищете мебель в Ташкенте, каталог Lioneto помогает
                  быстро перейти к нужному направлению: от классических решений
                  до более современных и премиальных коллекций. Для удобства
                  выбора используйте подборки по коллекциям и переходите в
                  карточки товаров для просмотра деталей.
                </p>
                <p>
                  Также вы можете перейти на страницу{" "}
                  <Link
                    href="/contacts"
                    className="underline underline-offset-4"
                  >
                    контактов
                  </Link>
                  , чтобы посмотреть адреса салонов Lioneto в Ташкенте, или
                  открыть конкретные товары из каталога для более детального
                  просмотра.
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
