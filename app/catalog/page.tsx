import type { Metadata } from "next";
import CatalogClient from "./ui/CatalogClient";

const BASE_URL = "https://lioneto.com";

type SearchParams = Record<string, string | string[] | undefined>;

function getSingleParam(value: string | string[] | undefined): string {
  return typeof value === "string" ? value : "";
}

function hasActiveCatalogFilters(searchParams: SearchParams) {
  const keys = ["brand", "category", "menu", "collections", "hero"];

  return keys.some((key) => {
    const value = searchParams[key];
    if (typeof value === "string") return value.trim().length > 0;
    if (Array.isArray(value)) return value.some((v) => v.trim().length > 0);
    return false;
  });
}

export async function generateMetadata({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}): Promise<Metadata> {
  const sp = await searchParams;
  const hasFilters = hasActiveCatalogFilters(sp);

  return {
    title: "Каталог мебели Lioneto | Спальни, гостиные, молодежные, прихожие",
    description:
      "Каталог мебели Lioneto: коллекции и товары для спальни, гостиной, молодежной комнаты, прихожей и обеденной зоны. Смотрите ассортимент, фото и актуальные модели.",
    alternates: {
      canonical: `${BASE_URL}/catalog`,
    },
    robots: hasFilters
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
      url: `${BASE_URL}/catalog`,
      title: "Каталог мебели Lioneto",
      description:
        "Каталог мебели Lioneto: коллекции и товары для спальни, гостиной, молодежной комнаты, прихожей и обеденной зоны.",
      siteName: "Lioneto",
      images: [
        {
          url: `${BASE_URL}/og-image.jpg`,
          alt: "Каталог мебели Lioneto",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: "Каталог мебели Lioneto",
      description:
        "Коллекции и товары Lioneto: спальни, гостиные, молодежные, прихожие и столовые решения.",
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

  const collectionPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Каталог мебели Lioneto",
    url: `${BASE_URL}/catalog`,
    description:
      "Каталог мебели Lioneto с коллекциями и товарами для разных зон интерьера.",
    isPartOf: {
      "@type": "WebSite",
      name: "Lioneto",
      url: BASE_URL,
    },
    breadcrumb: {
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
      ],
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(collectionPageJsonLd),
        }}
      />
      <CatalogClient initialBrand={brand} initialCategory={category} />
    </>
  );
}
