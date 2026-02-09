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
console.log("ENV STRAPI URL:", process.env.NEXT_PUBLIC_STRAPI_URL);

export const metadata: Metadata = {
  title: "Lioneto",
  description: "Lioneto furniture",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const global = await getGlobal();

  console.log("GLOBAL:", global?.topLinks?.length, global?.updatedAt);

  return (
    <html lang="ru">
      <body className="antialiased bg-white text-black">
        <RegionLangProvider>
          <ShopStateProvider>
            <Header global={global} />
            {children}
            <Footer />
          </ShopStateProvider>
        </RegionLangProvider>

        <BackToTop />
      </body>
    </html>
  );
}
