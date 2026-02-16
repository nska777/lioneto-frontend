// app/about/page.tsx
import type { Metadata } from "next";
import CatalogHeroSlider from "@/app/catalog/ui/CatalogHeroSlider";
import AboutClient from "./ui/AboutClient";

const HOME_HERO_SLIDES: string[] = []; // <-- заменить на как на главной

export const metadata: Metadata = {
  title: "О компании — Lioneto",
  description:
    "Lioneto — премиальный мебельный бренд. Узнайте о нашем подходе, ценностях и стандартах качества.",
  openGraph: {
    title: "О компании — Lioneto",
    description:
      "Lioneto — премиальный мебельный бренд. Подход, ценности и стандарты качества.",
    type: "website",
    locale: "ru_RU",
  },
  robots: { index: true, follow: true },
};

export default function AboutPage() {
  return (
    <div className="bg-#f3f3f3 text-black">
      {/* Slider (как на главной) */}
      {Array.isArray(HOME_HERO_SLIDES) && HOME_HERO_SLIDES.length > 0 ? (
        <section className="mx-auto w-full max-w-[1280px] px-4 pt-6">
          <div className="relative h-[460px]">
            <CatalogHeroSlider slides={HOME_HERO_SLIDES} />
          </div>
        </section>
      ) : null}

      {/* Premium About block */}
      <AboutClient />
    </div>
  );
}
