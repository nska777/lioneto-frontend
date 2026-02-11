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

// ✅ Jivo
import JivoProvider from "./components/chat/JivoProvider";
import LionetoChatButton from "./components/chat/LionetoChatButton";

console.log("ENV STRAPI URL:", process.env.NEXT_PUBLIC_STRAPI_URL);

export const metadata: Metadata = {
  title: "Lioneto",
  description: "Lioneto furniture",
  icons: {
    icon: [{ url: "/favicon.ico" }, { url: "/icon.png", type: "image/png" }],
    shortcut: "/favicon.ico",
    apple: "/icon.png",
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const global = await getGlobal();
  console.log("GLOBAL:", global?.topLinks?.length, global?.updatedAt);

  const jivoId = process.env.NEXT_PUBLIC_JIVO_WIDGET_ID || "";

  return (
    <html lang="ru">
      <body className="min-h-screen antialiased bg-white text-black flex flex-col">
        <RegionLangProvider>
          <ShopStateProvider>
            <Header global={global} />

            {/*  ВАЖНО: контент растягивает страницу */}
            <main className="flex-1">{children}</main>

            <Footer />
          </ShopStateProvider>
        </RegionLangProvider>

        <BackToTop />

        {/*  Jivo подключение + кастомная кнопка (стандартную кнопку прячем внутри JivoProvider) */}
        {jivoId ? <JivoProvider widgetId={jivoId} /> : null}
        {jivoId ? <LionetoChatButton /> : null}
      </body>
    </html>
  );
}
