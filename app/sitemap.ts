import type { MetadataRoute } from "next";
import { megaCategories } from "@/app/lib/headerData";
import { fetchNews } from "./lib/strapi/news";

const BASE_URL = "https://lioneto.com";

// Не ставим new Date() на каждый рендер.
// Дай стабильную дату последнего крупного SEO-обновления.
const STATIC_LASTMOD = new Date("2026-04-21T00:00:00.000Z");

type SitemapProductItem = {
  slug: string;
  updatedAt?: string;
  createdAt?: string;
  publishedAt?: string;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

async function fetchProductsForSitemap(): Promise<SitemapProductItem[]> {
  const strapiBase =
    process.env.NEXT_PUBLIC_STRAPI_URL ||
    process.env.STRAPI_URL ||
    "http://localhost:1337";

  const url =
    `${String(strapiBase).replace(/\/$/, "")}` +
    `/api/products?pagination[pageSize]=500` +
    `&fields[0]=slug` +
    `&fields[1]=updatedAt` +
    `&fields[2]=createdAt` +
    `&fields[3]=publishedAt` +
    `&fields[4]=isActive` +
    `&filters[isActive][$eq]=true` +
    `&sort[0]=updatedAt:desc`;

  try {
    const res = await fetch(url, {
      next: { revalidate: 300 },
    });

    if (!res.ok) return [];

    const json: unknown = await res.json();
    const root = isRecord(json) ? json : null;
    const data = root && Array.isArray(root.data) ? root.data : [];

    return data
      .map((item): SitemapProductItem | null => {
        const it = isRecord(item) ? item : null;
        const src = it && isRecord(it.attributes) ? it.attributes : it;

        if (!src || !isRecord(src)) return null;

        const slug = typeof src.slug === "string" ? src.slug.trim() : "";
        if (!slug) return null;

        const updatedAt =
          typeof src.updatedAt === "string" ? src.updatedAt : undefined;
        const createdAt =
          typeof src.createdAt === "string" ? src.createdAt : undefined;
        const publishedAt =
          typeof src.publishedAt === "string" ? src.publishedAt : undefined;

        return {
          slug,
          updatedAt,
          createdAt,
          publishedAt,
        };
      })
      .filter((item): item is SitemapProductItem => item !== null);
  } catch (error) {
    console.error("fetchProductsForSitemap error:", error);
    return [];
  }
}

function uniqueByUrl(
  items: MetadataRoute.Sitemap,
): MetadataRoute.Sitemap {
  const seen = new Set<string>();

  return items.filter((item) => {
    if (!item.url || seen.has(item.url)) return false;
    seen.add(item.url);
    return true;
  });
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticPaths = [
    "/",
    "/catalog",
    "/contacts",
    "/cooperation",
    "/news",

    // SEO pages
    "/mebel-v-tashkente",
    "/kupit-mebel-v-tashkente",
    "/spalni-v-tashkente",
    "/spalnye-garnitury-v-tashkente",
    "/krovati-v-tashkente",
    "/shkafy-v-tashkente",
    "/mebel-dlya-spalni-v-tashkente",
    "/komody-v-tashkente",
    "/premium-mebel-v-tashkente",
    "/mebel-iz-massiva-v-tashkente",
    "/tumby-v-tashkente",

 
  ];

  const staticRoutes: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${BASE_URL}${path}`,
    lastModified: STATIC_LASTMOD,
    changeFrequency: path === "/" ? "weekly" : "monthly",
    priority:
      path === "/"
        ? 1
        : path === "/catalog"
          ? 0.9
          : path.startsWith("/product/")
            ? 0.85
            : path.includes("-v-tashkente")
              ? 0.85
              : 0.8,
  }));

  const [news, products] = await Promise.all([
    fetchNews(),
    fetchProductsForSitemap(),
  ]);

  const newsRoutes: MetadataRoute.Sitemap = news
    .filter((item) => item.slug)
    .map((item) => ({
      url: `${BASE_URL}/news/${item.slug}`,
      lastModified: item.updatedAt
        ? new Date(item.updatedAt)
        : item.publishedAt
          ? new Date(item.publishedAt)
          : item.createdAt
            ? new Date(item.createdAt)
            : STATIC_LASTMOD,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    }));

  const productRoutes: MetadataRoute.Sitemap = products.map((item) => ({
    url: `${BASE_URL}/product/${item.slug}`,
    lastModified: item.updatedAt
      ? new Date(item.updatedAt)
      : item.publishedAt
        ? new Date(item.publishedAt)
        : item.createdAt
          ? new Date(item.createdAt)
          : STATIC_LASTMOD,
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const catalogCollectionRoutes: MetadataRoute.Sitemap = megaCategories
    .flatMap((category) =>
      category.items.map((item) => ({
        href: typeof item.href === "string" ? item.href.trim() : "",
      })),
    )
    .filter((entry) => entry.href.startsWith("/catalog/"))
    .map((entry) => ({
      url: `${BASE_URL}${entry.href}`,
      lastModified: STATIC_LASTMOD,
      changeFrequency: "monthly" as const,
      priority: 0.75,
    }))
    .filter((item) => item.url !== `${BASE_URL}/catalog/`);

  return uniqueByUrl([
    ...staticRoutes,
    ...newsRoutes,
    ...productRoutes,
    ...catalogCollectionRoutes,
  ]);
}