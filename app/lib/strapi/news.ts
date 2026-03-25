// app/lib/strapi/news.ts

export type StrapiNewsItem = {
  id: string | number;
  type?: string; // arrival / update / sale / event
  title: string;
  subtitle?: string;
  excerpt?: string;
  description?: string;
  content?: string;
  slug: string;
  dateLabel?: string;
  isActive?: boolean;
  sortOrder?: number;
  updatedAt?: string;
  publishedAt?: string;
  createdAt?: string;
  cover?: { url: string; alternativeText?: string | null } | null;
  image?: { url: string; alternativeText?: string | null } | null;
  coverImage?: string;
};

const STRAPI_BASE =
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  process.env.STRAPI_URL ||
  "http://localhost:1337";

function toAbsolute(url?: string | null): string {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("//")) return `https:${url}`;
  if (url.startsWith("/")) return `${STRAPI_BASE}${url}`;
  return `${STRAPI_BASE}/${url}`;
}

function getMedia(raw: any) {
  const media = raw?.data?.attributes ?? raw?.attributes ?? raw ?? null;
  if (!media) return null;

  const rawUrl =
    media?.formats?.large?.url ||
    media?.formats?.medium?.url ||
    media?.formats?.small?.url ||
    media?.formats?.thumbnail?.url ||
    media?.url ||
    null;

  const url = toAbsolute(rawUrl);
  if (!url) return null;

  return {
    url,
    alternativeText: media?.alternativeText ?? null,
  };
}

function normalizeItem(raw: any): StrapiNewsItem | null {
  const src = raw?.attributes ?? raw;

  const id = raw?.id ?? src?.id ?? src?.documentId ?? src?.slug;
  const title = String(src?.title ?? "").trim();
  const slug = String(src?.slug ?? "").trim();

  if (!id || !title || !slug) return null;

  const cover = getMedia(src?.cover);
  const image = getMedia(src?.image) || cover;

  return {
    id,
    type: src?.type ?? undefined,
    title,
    subtitle: src?.subtitle ?? undefined,
    excerpt: src?.excerpt ?? src?.subtitle ?? undefined,
    description: src?.description ?? src?.excerpt ?? src?.subtitle ?? undefined,
    content:
      typeof src?.content === "string"
        ? src.content
        : typeof src?.body === "string"
          ? src.body
          : typeof src?.text === "string"
            ? src.text
            : undefined,
    slug,
    dateLabel: src?.dateLabel ?? undefined,
    isActive: src?.isActive ?? undefined,
    sortOrder: src?.sortOrder != null ? Number(src.sortOrder) : undefined,
    updatedAt: src?.updatedAt ?? undefined,
    publishedAt: src?.publishedAt ?? undefined,
    createdAt: src?.createdAt ?? undefined,
    cover,
    image,
    coverImage: cover?.url || image?.url || undefined,
  };
}

export async function fetchNews({
  limit,
}: {
  limit?: number;
} = {}): Promise<StrapiNewsItem[]> {
  const qs = new URLSearchParams();

  if (limit) qs.set("pagination[limit]", String(limit));

  qs.set("populate[0]", "cover");
  qs.set("populate[1]", "image");

  qs.set("sort[0]", "sortOrder:asc");
  qs.set("sort[1]", "publishedAt:desc");

  qs.set("filters[isActive][$eq]", "true");

  const url = `${STRAPI_BASE}/api/news-items?${qs.toString()}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];

    const json = await res.json();
    const data = Array.isArray(json?.data) ? json.data : [];

    return data.map(normalizeItem).filter(Boolean) as StrapiNewsItem[];
  } catch {
    return [];
  }
}

export async function fetchNewsBySlug(
  slug: string,
): Promise<StrapiNewsItem | null> {
  const cleanSlug = String(slug ?? "").trim();
  if (!cleanSlug) return null;

  const qs = new URLSearchParams();
  qs.set("populate[0]", "cover");
  qs.set("populate[1]", "image");
  qs.set("filters[slug][$eq]", cleanSlug);
  qs.set("filters[isActive][$eq]", "true");
  qs.set("pagination[limit]", "1");

  const url = `${STRAPI_BASE}/api/news-items?${qs.toString()}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return null;

    const json = await res.json();
    const data = Array.isArray(json?.data) ? json.data : [];
    const item = data[0];

    return normalizeItem(item);
  } catch {
    return null;
  }
}