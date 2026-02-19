// app/page.tsx
import GSAPHeroSlider from "./components/home/GSAPHeroSlider";
import BestSellers, {
  type FeaturedProduct,
} from "./components/home/BestSellers";
import BestPrice from "./components/home/BestPrice";
import AboutCompany from "./components/home/AboutCompany";
import CollectionsSlider from "./components/home/CollectionsSlider";

import SupplyNewsSection from "./components/home/SupplyNewsSection";
import { supplyNewsMock } from "./mocks/supplyNews";
import NewsletterCta from "./components/home/NewsletterCta";

import { COLLECTIONS_SLIDER_MOCK } from "./lib/mock/collections-slider";
import { fetchNews } from "./lib/strapi/news";

function getStrapiBase() {
  return (
    process.env.NEXT_PUBLIC_STRAPI_URL ||
    process.env.STRAPI_URL ||
    "http://localhost:1337"
  );
}

function absUrl(base: string, url: string) {
  const u = String(url ?? "").trim();
  if (!u) return "";
  if (u.startsWith("http://") || u.startsWith("https://")) return u;
  if (u.startsWith("//")) return `https:${u}`;
  if (u.startsWith("/")) return `${base}${u}`;
  return `${base}/${u}`;
}

function pickMediaUrl(base: string, mediaAny: any): string {
  // поддержка разных shape:
  // v4: { data: { attributes: { url } } }
  // v5: иногда { url } или { attributes: { url } }
  const m = mediaAny?.data?.attributes ?? mediaAny?.attributes ?? mediaAny;
  const url = String(m?.url ?? "").trim();
  return absUrl(base, url);
}

function pickGalleryUrls(base: string, galleryAny: any): string[] {
  const arr = Array.isArray(galleryAny?.data)
    ? galleryAny.data
    : Array.isArray(galleryAny)
      ? galleryAny
      : [];

  return arr
    .map((x: any) => {
      const a = x?.attributes ?? x?.data?.attributes ?? x;
      return absUrl(base, String(a?.url ?? "").trim());
    })
    .filter(Boolean);
}

// ✅ берём featured продукты прямо из Strapi "product"
async function fetchFeaturedProducts(
  badge: "Хит продаж" | "Лучшая цена",
): Promise<FeaturedProduct[]> {
  const base = getStrapiBase();

  try {
    const qs = new URLSearchParams();

    // фильтры
    qs.set("filters[isActive][$eq]", "true");
    qs.set("filters[collectionBadge][$eq]", badge);

    // пагинация/сортировка
    qs.set("pagination[page]", "1");
    qs.set("pagination[pageSize]", "12");
    qs.set("sort[0]", "sortOrder:asc");

    // populate медиа
    qs.set("populate[0]", "media");
    qs.set("populate[1]", "gallery");

    const url = `${base}/api/products?${qs.toString()}`;

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      console.error(
        "products fetch failed:",
        badge,
        res.status,
        res.statusText,
      );
      return [];
    }

    const json = await res.json();
    const data = Array.isArray(json?.data) ? json.data : [];

    return data
      .map((item: any) => {
        const src = item?.attributes ?? item;

        const slug = String(src?.slug ?? "").trim();
        if (!slug) return null;

        const mediaUrl = pickMediaUrl(base, src?.media);
        const galleryUrls = pickGalleryUrls(base, src?.gallery);

        const image = mediaUrl || galleryUrls[0] || "";

        const out: FeaturedProduct = {
          // ✅ у тебя сейчас ключом везде должен быть slug (Strapi-only)
          id: slug,
          slug,
          title: String(src?.title ?? "").trim() || slug,
          href: `/product/${slug}`,

          image,

          priceUZS: Number(src?.priceUZS ?? 0),
          priceRUB: Number(src?.priceRUB ?? 0),

          oldPriceUZS:
            src?.oldPriceUZS != null ? Number(src?.oldPriceUZS) : undefined,
          oldPriceRUB:
            src?.oldPriceRUB != null ? Number(src?.oldPriceRUB) : undefined,

          collectionBadge: String(src?.collectionBadge ?? "").trim() || badge,
          isActive: Boolean(src?.isActive),

          brand: src?.brand ?? null,
          collection: src?.collection ?? null,
        };

        return out;
      })
      .filter(Boolean) as FeaturedProduct[];
  } catch (e) {
    console.error("products fetch error:", badge, e);
    return [];
  }
}

export default async function Page() {
  const [hitProducts, bestProducts] = await Promise.all([
    fetchFeaturedProducts("Хит продаж"),
    fetchFeaturedProducts("Лучшая цена"),
  ]);

  // ✅ новости из Strapi (для секции на главной)
  const newsFromStrapi = await fetchNews({ limit: 6 });
  const newsItems =
    newsFromStrapi.length > 0
      ? (newsFromStrapi as any)
      : (supplyNewsMock as any);

  console.log("HIT products:", hitProducts.length);
  console.log("BEST products:", bestProducts.length);

  return (
    <main>
      <GSAPHeroSlider />

      {/* ✅ priceEntries больше НЕ используем */}
      <BestSellers products={hitProducts} />
      <BestPrice products={bestProducts} />

      <AboutCompany />

      <CollectionsSlider collections={COLLECTIONS_SLIDER_MOCK} />

      <SupplyNewsSection items={newsItems} />

      <NewsletterCta backgroundUrl="/images/home/newsletter-bg.jpg" />
    </main>
  );
}
