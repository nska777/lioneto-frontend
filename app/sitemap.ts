import type { MetadataRoute } from "next";
import { megaCategories } from "@/app/lib/headerData";
import { fetchNews } from "./lib/strapi/news";

const BASE_URL = "https://lioneto.com";

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

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${BASE_URL}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${BASE_URL}/cooperation`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/news`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${BASE_URL}/catalog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.9,
    },
  ];

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
            : new Date(),
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
          : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.8,
  }));

  const catalogCollectionRoutes: MetadataRoute.Sitemap = megaCategories
    .flatMap((category) =>
      category.items.map((item) => ({
        href: typeof item.href === "string" ? item.href : "",
      })),
    )
    .filter((entry) => entry.href.startsWith("/catalog/"))
    .map((entry) => ({
      url: `${BASE_URL}${entry.href}`,
      lastModified: new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }))
    .filter((item) => item.url !== `${BASE_URL}/catalog/`);

  return [
    ...staticRoutes,
    ...newsRoutes,
    ...productRoutes,
    ...catalogCollectionRoutes,
  ];
}