// app/news/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import NewsPageClient from "./NewsPageClient";
import { fetchNews } from "../lib/strapi/news";

export const dynamic = "force-dynamic";

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
    <main className="min-h-screen bg-[#f3f3f3] text-black">
      <section className="mx-auto w-full max-w-[1200px] px-4 pb-20 pt-6 md:px-6 md:pb-28 md:pt-10">
        <nav className="text-[12px] font-semibold uppercase tracking-[0.18em] text-black/45">
          <Link className="transition hover:text-black/80" href="/">
            Главная
          </Link>
          <span className="px-2">/</span>
          <span className="text-black/80">Новости</span>
        </nav>

        <header className="mt-8 md:mt-12">
          <h1 className="text-balance text-[36px] font-semibold leading-[1.02] tracking-[-0.03em] md:text-[64px]">
            Новости
          </h1>

          <p className="mt-5 max-w-3xl text-[15px] font-medium leading-7 text-black/65 md:text-[17px]">
            Поступления, обновления коллекций, события и аккуратные анонсы — без
            шума, только важное.
          </p>
        </header>

        <div className="mt-10 md:mt-12">
          <NewsPageClient items={items} />
        </div>
      </section>
    </main>
  );
}
