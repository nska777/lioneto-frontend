// app/news/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import NewsPageClient from "./NewsPageClient";
import { fetchNews } from "../lib/strapi/news";

export const metadata: Metadata = {
  title: "Новости Lioneto — коллекции, события и обновления",
  description:
    "Новости Lioneto: новые коллекции, поступления, обновления, акции и события бренда. Актуальные новости о премиальной мебели и интерьерных решениях.",
  alternates: {
    canonical: "/news",
  },
  openGraph: {
    title: "Новости Lioneto — коллекции, события и обновления",
    description:
      "Актуальные новости Lioneto: новые коллекции, поступления, акции и события бренда.",
    url: "https://lioneto.com/news",
    siteName: "Lioneto",
    type: "website",
    locale: "ru_RU",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Новости Lioneto",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Новости Lioneto — коллекции, события и обновления",
    description:
      "Актуальные новости Lioneto: новые коллекции, поступления, акции и события бренда.",
    images: ["/og-image.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function NewsPage() {
  const items = await fetchNews();

  return (
    <main className="bg-[#f3f3f3] text-black">
      <div className="mx-auto w-full max-w-[1200px] px-4">
        <nav className="pt-6 text-[12px] tracking-[0.18em] text-black/50">
          <Link className="hover:text-black/80" href="/">
            ГЛАВНАЯ
          </Link>
          <span className="px-2">/</span>
          <span className="text-black/80">НОВОСТИ</span>
        </nav>

        <header className="mt-6 md:mt-10">
          <h1 className="text-balance text-[28px] font-semibold leading-[1.06] tracking-[-0.02em] md:text-[44px]">
            Новости
          </h1>
          <p className="mt-4 max-w-3xl text-[14px] leading-7 text-black/70 md:text-[16px]">
            Поступления, обновления коллекций, события и аккуратные анонсы — без
            шума, только важное.
          </p>
        </header>

        <div className="mt-8 md:mt-10">
          <NewsPageClient items={items} />
        </div>

        <div className="h-14 md:h-20" />
      </div>
    </main>
  );
}
