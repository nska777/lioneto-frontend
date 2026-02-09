// app/page.tsx
import GSAPHeroSlider from "./components/home/GSAPHeroSlider";
import BestSellers from "./components/home/BestSellers";
import BestPrice from "./components/home/BestPrice";
import AboutCompany from "./components/home/AboutCompany";
import CollectionsSlider from "./components/home/CollectionsSlider";

// ✅ секция поставок/новостей
import SupplyNewsSection from "./components/home/SupplyNewsSection";
import { supplyNewsMock } from "./mocks/supplyNews";
import NewsletterCta from "./components/home/NewsletterCta";

import { getGlobal } from "../app/lib/strapi";

// ✅ НОВЫЕ моки только для CollectionsSlider
import { COLLECTIONS_SLIDER_MOCK } from "./lib/mock/collections-slider";

// ✅ новости из Strapi (единый источник)
import { fetchNews } from "./lib/strapi/news";

export type PriceEntry = {
  id?: number;
  productId: string | number; // ✅ теперь поддерживаем slug и number
  title?: string;

  priceUZS: number;
  priceRUB: number;

  oldPriceUZS?: number;
  oldPriceRUB?: number;

  hasDiscount?: boolean;
  collectionBadge?: string;
  isActive?: boolean;
};

async function fetchPriceEntries(): Promise<PriceEntry[]> {
  const base =
    process.env.NEXT_PUBLIC_STRAPI_URL ||
    process.env.STRAPI_URL ||
    "http://localhost:1337";

  try {
    const res = await fetch(`${base}/api/price-entries`, { cache: "no-store" });

    if (!res.ok) {
      console.error("price-entries fetch failed:", res.status, res.statusText);
      return [];
    }

    const json = await res.json();
    const data = Array.isArray(json?.data) ? json.data : [];

    return data
      .map((item: any) => {
        // ✅ поддержка ОБОИХ форматов Strapi: attributes / без attributes
        const src = item?.attributes ?? item;

        const rawProductId = src?.productId;
        const productId =
          rawProductId == null ? "" : String(rawProductId).trim();

        if (!productId) return null;

        return {
          id: item?.id ?? src?.id,
          productId,

          title: src?.title ?? undefined,

          // ✅ поля как у тебя в админке: priceUZS/priceRUB/oldPriceUZS/oldPriceRUB
          // + на всякий: snake_case
          priceUZS: Number(src?.priceUZS ?? src?.price_uzs ?? 0),
          priceRUB: Number(src?.priceRUB ?? src?.price_rub ?? 0),

          oldPriceUZS:
            src?.oldPriceUZS != null
              ? Number(src?.oldPriceUZS)
              : src?.old_price_uzs != null
                ? Number(src?.old_price_uzs)
                : undefined,

          oldPriceRUB:
            src?.oldPriceRUB != null
              ? Number(src?.oldPriceRUB)
              : src?.old_price_rub != null
                ? Number(src?.old_price_rub)
                : undefined,

          hasDiscount:
            src?.hasDiscount != null ? Boolean(src?.hasDiscount) : undefined,

          collectionBadge: src?.collectionBadge ?? undefined,
          isActive: src?.isActive != null ? Boolean(src?.isActive) : false,
        } as PriceEntry;
      })
      .filter(Boolean) as PriceEntry[];
  } catch (e) {
    console.error("price-entries fetch error:", e);
    return [];
  }
}

export default async function Page() {
  const global = await getGlobal();
  const priceEntries = await fetchPriceEntries();

  // ✅ новости из Strapi (для секции на главной)
  const newsFromStrapi = await fetchNews({ limit: 6 });
  const newsItems =
    newsFromStrapi.length > 0
      ? (newsFromStrapi as any)
      : (supplyNewsMock as any);

  console.log("PRICE ENTRIES (home page):", priceEntries.length);
  console.log("NEWS (home page):", newsFromStrapi.length);

  return (
    <main>
      <GSAPHeroSlider />

      <BestSellers priceEntries={priceEntries} />
      <BestPrice priceEntries={priceEntries} />

      <AboutCompany />

      <CollectionsSlider collections={COLLECTIONS_SLIDER_MOCK} />

      {/* ✅ было: supplyNewsMock — стало: newsItems (Strapi -> fallback mock) */}
      <SupplyNewsSection items={newsItems} />

      <NewsletterCta backgroundUrl="/images/home/newsletter-bg.jpg" />
    </main>
  );
}
