// app/layout.tsx
export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import "./globals.css";

import { RegionLangProvider } from "./context/region-lang";
import { ShopStateProvider } from "./context/shop-state";
import BackToTop from "./components/ui/BackToTop";

import Header from "./components/Header";
import Footer from "./components/sections/Footer";

import { getGlobal } from "./lib/strapi";

// Jivo
import JivoProvider from "./components/chat/JivoProvider";

// Metrika
import YandexMetrika from "./components/analytics/YandexMetrika";
import UtmTracker from "./components/analytics/UtmTracker";

const SITE_URL = "https://lioneto.com";
const SITE_NAME = "Lioneto";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: "Мебель в Ташкенте — премиальная мебель Lioneto",
    template: "%s | Lioneto",
  },

  description:
    "Lioneto — премиальная мебель в Ташкенте для современных интерьеров. Спальни, кровати, шкафы и интерьерные коллекции для дома. Каталог, новости, контакты и сотрудничество для дилеров, дизайнеров и B2B.",

  keywords: [
    "Lioneto",
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
    "мебель Узбекистан",
    "премиальная мебель",
    "мебель для дома",
    "мебельный магазин Ташкент",
  ],

  applicationName: SITE_NAME,

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Мебель в Ташкенте — премиальная мебель Lioneto",
    description:
      "Lioneto — премиальная мебель в Ташкенте: спальни, кровати, шкафы и интерьерные решения для современного дома.",
    locale: "ru_RU",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Lioneto — премиальная мебель в Ташкенте",
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

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },

  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/icon.png", type: "image/png" }],
    shortcut: "/favicon.ico",
    apple: "/icon.png",
  },
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Lioneto",
  url: SITE_URL,
  logo: `${SITE_URL}/icon.png`,
  brand: "Lioneto",
  sameAs: [],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Lioneto",
  url: SITE_URL,
  inLanguage: "ru",
};

const localBusinessJsonLd = {
  "@context": "https://schema.org",
  "@type": "FurnitureStore",
  "@id": `${SITE_URL}/#furniture-store`,
  name: "Lioneto",
  url: SITE_URL,
  logo: `${SITE_URL}/icon.png`,
  image: `${SITE_URL}/og-image.jpg`,
  description:
    "Lioneto — премиальная мебель в Ташкенте. Спальни, кровати, шкафы и интерьерные коллекции для современного дома.",
  areaServed: [
    {
      "@type": "City",
      name: "Tashkent",
    },
    {
      "@type": "Country",
      name: "Uzbekistan",
    },
  ],
  address: {
    "@type": "PostalAddress",
    addressLocality: "Tashkent",
    addressCountry: "UZ",
  },
  priceRange: "$$$",
  brand: {
    "@type": "Brand",
    name: "Lioneto",
  },
  inLanguage: "ru",
  department: [
    {
      "@type": "FurnitureStore",
      name: "Lioneto — Rich House",
      telephone: "+998909256006",
      additionalProperty: [
        {
          "@type": "PropertyValue",
          name: "Дополнительный телефон",
          value: "+998900038008",
        },
      ],
      address: {
        "@type": "PostalAddress",
        streetAddress: "ул. Мирзо-Улугбека, 18",
        addressLocality: "Ташкент",
        addressCountry: "UZ",
      },
      openingHours: "Mo-Su 09:00-18:00",
    },
    {
      "@type": "FurnitureStore",
      name: "Lioneto — Arca Mebel",
      telephone: "+998909274004",
      address: {
        "@type": "PostalAddress",
        streetAddress: "улица Махтумкули, 75",
        addressLocality: "Ташкент",
        addressRegion: "Яшнабадский район",
        addressCountry: "UZ",
      },
      openingHours: "Mo-Su 09:00-18:00",
    },
    {
      "@type": "FurnitureStore",
      name: "Lioneto — Arca Premium",
      telephone: "+998900021230",
      address: {
        "@type": "PostalAddress",
        streetAddress: "улица Махтумкули, 75/4",
        addressLocality: "Ташкент",
        addressRegion: "Яшнабадский район",
        addressCountry: "UZ",
      },
      openingHours: "Mo-Su 09:00-18:00",
    },
  ],
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const global = await getGlobal();
  const jivoId = process.env.NEXT_PUBLIC_JIVO_WIDGET_ID || "";

  return (
    <html lang="ru">
      <body className="min-h-screen flex flex-col bg-white text-black antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(organizationJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(websiteJsonLd),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(localBusinessJsonLd),
          }}
        />

        <RegionLangProvider>
          <ShopStateProvider>
            <Header global={global} />
            <main className="flex-1">{children}</main>
            <Footer />
          </ShopStateProvider>
        </RegionLangProvider>

        <BackToTop />

        {/* Jivo */}
        {/* {jivoId ? <JivoProvider widgetId={jivoId} /> : null} */}
        <UtmTracker />
        <YandexMetrika />
      </body>
    </html>
  );
}
