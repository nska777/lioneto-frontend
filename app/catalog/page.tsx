import type { Metadata } from "next";
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
  }
> = {
  amber: {
    title: "Коллекция AMBER | Спальни Lioneto в Ташкенте",
    description:
      "Коллекция AMBER от Lioneto в Ташкенте — современная мебель для спальни: фото, модели, характеристики и актуальный ассортимент.",
    menu: "bedrooms",
  },
  scandi: {
    title: "Коллекция SCANDI | Мебель Lioneto в Ташкенте",
    description:
      "Коллекция SCANDI от Lioneto в Ташкенте — мебель в скандинавском стиле: фото, характеристики и актуальные модели для интерьера.",
    menu: "living",
  },
  elizabeth: {
    title: "Коллекция ELIZABETH | Мебель Lioneto в Ташкенте",
    description:
      "Коллекция ELIZABETH от Lioneto в Ташкенте — премиальная мебель Lioneto: фото, модели, характеристики и актуальный ассортимент.",
    menu: "bedrooms",
  },
  salvador: {
    title: "Коллекция SALVADOR | Мебель Lioneto в Ташкенте",
    description:
      "Коллекция SALVADOR от Lioneto в Ташкенте — мебель Lioneto для современного интерьера: фото, характеристики и актуальные модели.",
    menu: "bedrooms",
  },
  pitti: {
    title: "Коллекция PITTI | Мебель Lioneto в Ташкенте",
    description:
      "Коллекция PITTI от Lioneto в Ташкенте — премиальная мебель для дома: фото, модели, характеристики и актуальный ассортимент.",
    menu: "bedrooms",
  },
  buongiorno: {
    title: "Коллекция BUONGIORNO | Мебель Lioneto в Ташкенте",
    description:
      "Коллекция BUONGIORNO от Lioneto в Ташкенте — мебель Lioneto для спальни и интерьера: фото, характеристики и актуальные модели.",
    menu: "bedrooms",
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
      <CatalogClient initialBrand={brand} initialCategory={category} />
    </>
  );
}
