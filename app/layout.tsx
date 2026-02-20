// app/layout.tsx
export const dynamic = "force-dynamic";

import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

import { RegionLangProvider } from "./context/region-lang";
import { ShopStateProvider } from "./context/shop-state";
import BackToTop from "./components/ui/BackToTop";

import Header from "./components/Header";
import Footer from "./components/sections/Footer";

import { getGlobal } from "./lib/strapi";

// ✅ Jivo
import JivoProvider from "./components/chat/JivoProvider";

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

            <main className="flex-1">{children}</main>

            <Footer />
          </ShopStateProvider>
        </RegionLangProvider>

        <BackToTop />

        {/* ✅ Jivo */}
        {jivoId ? <JivoProvider widgetId={jivoId} /> : null}

        {/* ✅ Yandex.Metrika (только production) */}
        {process.env.NODE_ENV === "production" && (
          <>
            <Script id="yandex-metrika" strategy="afterInteractive">
              {`
                (function(m,e,t,r,i,k,a){
                  m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                  m[i].l=1*new Date();
                  for (var j = 0; j < document.scripts.length; j++) {
                    if (document.scripts[j].src === r) { return; }
                  }
                  k=e.createElement(t),
                  a=e.getElementsByTagName(t)[0],
                  k.async=1,
                  k.src=r,
                  a.parentNode.insertBefore(k,a)
                })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=106932425','ym');

                ym(106932425, 'init', {
                  ssr:true,
                  webvisor:true,
                  clickmap:true,
                  ecommerce:"dataLayer",
                  accurateTrackBounce:true,
                  trackLinks:true
                });
              `}
            </Script>

            <noscript>
              <div>
                <img
                  src="https://mc.yandex.ru/watch/106932425"
                  style={{ position: "absolute", left: "-9999px" }}
                  alt=""
                />
              </div>
            </noscript>
          </>
        )}
      </body>
    </html>
  );
}
