// app/lib/strapi/news.ts

export type StrapiNewsItem = {
  id: string | number;
  type?: string; // arrival / update / sale / event
  title: string;
  subtitle?: string;
  slug: string;
  dateLabel?: string;
  isActive?: boolean;
  sortOrder?: number;
  cover?: { url: string; alternativeText?: string | null } | null;
};

const STRAPI_BASE =
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  process.env.STRAPI_URL ||
  "http://localhost:1337";

// ✅ всегда делаем absolute URL
function toAbsolute(url?: string | null): string {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/")) return `${STRAPI_BASE}${url}`;
  return url;
}

function normalizeItem(raw: any): StrapiNewsItem | null {
  const src = raw?.attributes ?? raw;

  const id = raw?.id ?? src?.id ?? src?.documentId ?? src?.slug;
  const title = String(src?.title ?? "").trim();
  const slug = String(src?.slug ?? "").trim();

  if (!id || !title || !slug) return null;

  const coverSrc = src?.cover?.data?.attributes ?? src?.cover ?? null;

  const rawCoverUrl =
    coverSrc?.formats?.large?.url ||
    coverSrc?.formats?.medium?.url ||
    coverSrc?.url ||
    null;

  const coverUrl = toAbsolute(rawCoverUrl);

  return {
    id,
    type: src?.type ?? undefined,
    title,
    subtitle: src?.subtitle ?? src?.excerpt ?? undefined,
    slug,
    dateLabel: src?.dateLabel ?? undefined,
    isActive: src?.isActive ?? undefined,
    sortOrder:
      src?.sortOrder != null ? Number(src.sortOrder) : undefined,
    cover: coverUrl
      ? {
          url: coverUrl,
          alternativeText: coverSrc?.alternativeText ?? null,
        }
      : null,
  };
}

export async function fetchNews({
  limit,
}: {
  limit?: number;
} = {}): Promise<StrapiNewsItem[]> {
  const qs = new URLSearchParams();

  if (limit) qs.set("pagination[limit]", String(limit));

  qs.set("populate", "cover");

  // ✅ сначала ручной порядок, потом свежие
  qs.set("sort", "sortOrder:asc,publishedAt:desc");

  // ✅ только активные
  qs.set("filters[isActive][$eq]", "true");

  const url = `${STRAPI_BASE}/api/news-items?${qs.toString()}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];

    const json = await res.json();
    const data = Array.isArray(json?.data) ? json.data : [];

    return data
      .map(normalizeItem)
      .filter(Boolean) as StrapiNewsItem[];
  } catch {
    return [];
  }
}
