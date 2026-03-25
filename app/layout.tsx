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

const SITE_URL = "https://lioneto.com";
const SITE_NAME = "Lioneto";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: "Lioneto — премиальная мебель для современных интерьеров",
    template: "%s | Lioneto",
  },

  description:
    "Lioneto — премиальная мебель для современных интерьеров. Коллекции для спальни, гостиной и других пространств. Каталог, новости, сотрудничество для дилеров, дизайнеров и B2B.",

  keywords: [
    "Lioneto",
    "премиальная мебель",
    "мебель Lioneto",
    "мебель для спальни",
    "мебель для гостиной",
    "современная мебель",
    "элитная мебель",
    "дизайнерская мебель",
    "мебель для интерьера",
    "мебель Ташкент",
    "премиальная мебель Ташкент",
    "мебель Узбекистан",
    "коллекции мебели",
    "мебель для дилеров",
    "мебель для дизайнеров",
    "B2B мебель",
  ],

  applicationName: SITE_NAME,

  alternates: {
    canonical: "/",
  },

  openGraph: {
    type: "website",
    url: SITE_URL,
    siteName: SITE_NAME,
    title: "Lioneto — премиальная мебель для современных интерьеров",
    description:
      "Коллекции премиальной мебели Lioneto: спальни, гостиные и интерьерные решения. Каталог, новости и сотрудничество для дилеров, дизайнеров и B2B.",
    locale: "ru_RU",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Lioneto — премиальная мебель",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "Lioneto — премиальная мебель для современных интерьеров",
    description:
      "Коллекции премиальной мебели Lioneto: каталог, новости и сотрудничество.",
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
  url: "https://lioneto.com",
  logo: "https://lioneto.com/icon.png",
  brand: "Lioneto",
  sameAs: [],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Lioneto",
  url: "https://lioneto.com",
  inLanguage: "ru",
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

        <YandexMetrika />
      </body>
    </html>
  );
}
