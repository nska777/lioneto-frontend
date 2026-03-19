type DealerNewsKind = "news" | "promo";

export type DealerNewsItem = {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  kind: DealerNewsKind;
  isPinned: boolean;
  viewsCount: number;
  likesCount: number;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  coverUrl: string | null;
  hashtags: string[];
};

type StrapiMedia = {
  url?: string;
};

type StrapiDealerNews = {
  id: number;
  documentId?: string;
  title?: string;
  slug?: string;
  excerpt?: string;
  content?: string;
  kind?: "news" | "promo";
  isPinned?: boolean;
  viewsCount?: number;
  likesCount?: number;
  publishedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  cover?: StrapiMedia | null;
  hashtags?: unknown;
};

type StrapiListResponse<T> = {
  data?: T[];
};

const STRAPI_URL =
  process.env.STRAPI_URL ||
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  "http://127.0.0.1:1337";

const STRAPI_TOKEN =
  process.env.STRAPI_API_TOKEN || process.env.STRAPI_DEALER_TOKEN || "";

function getMediaUrl(url?: string): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${STRAPI_URL}${url}`;
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function normalizeHashtags(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .filter(isString)
      .map((tag) => tag.trim().replace(/^#/, ""))
      .filter(Boolean);
  }

  if (isString(value)) {
    return value
      .split(",")
      .map((tag) => tag.trim().replace(/^#/, ""))
      .filter(Boolean);
  }

  return [];
}

function mapDealerNewsItem(item: StrapiDealerNews): DealerNewsItem {
  return {
    id: item.id,
    documentId: item.documentId || "",
    title: item.title || "",
    slug: item.slug || "",
    excerpt: item.excerpt || "",
    content: item.content || "",
    kind: item.kind === "promo" ? "promo" : "news",
    isPinned: Boolean(item.isPinned),
    viewsCount: typeof item.viewsCount === "number" ? item.viewsCount : 0,
    likesCount: typeof item.likesCount === "number" ? item.likesCount : 0,
    publishedAt: item.publishedAt || "",
    createdAt: item.createdAt || "",
    updatedAt: item.updatedAt || "",
    coverUrl: getMediaUrl(item.cover?.url),
    hashtags: normalizeHashtags(item.hashtags),
  };
}

export async function getDealerNews(): Promise<DealerNewsItem[]> {
  const params = new URLSearchParams();
  params.set("sort[0]", "isPinned:desc");
  params.set("sort[1]", "publishedAt:desc");
  params.set("pagination[pageSize]", "100");
  params.set("fields[0]", "title");
  params.set("fields[1]", "slug");
  params.set("fields[2]", "excerpt");
  params.set("fields[3]", "content");
  params.set("fields[4]", "kind");
  params.set("fields[5]", "isPinned");
  params.set("fields[6]", "viewsCount");
  params.set("fields[7]", "likesCount");
  params.set("fields[8]", "publishedAt");
  params.set("fields[9]", "createdAt");
  params.set("fields[10]", "updatedAt");
  params.set("fields[11]", "hashtags");
  params.set("populate[cover][fields][0]", "url");

  const url = `${STRAPI_URL}/api/dealer-newses?${params.toString()}`;

  const res = await fetch(url, {
    headers: STRAPI_TOKEN
      ? {
          Authorization: `Bearer ${STRAPI_TOKEN}`,
        }
      : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to load dealer news: ${text || res.status}`);
  }

  const json = (await res.json()) as StrapiListResponse<StrapiDealerNews>;

  return (json.data || []).map(mapDealerNewsItem);
}

export async function getDealerNewsBySlug(
  slug: string,
): Promise<DealerNewsItem | null> {
  const safeSlug = slug.trim();

  if (!safeSlug) return null;

  const params = new URLSearchParams();
  params.set("filters[slug][$eq]", safeSlug);
  params.set("pagination[pageSize]", "1");
  params.set("fields[0]", "title");
  params.set("fields[1]", "slug");
  params.set("fields[2]", "excerpt");
  params.set("fields[3]", "content");
  params.set("fields[4]", "kind");
  params.set("fields[5]", "isPinned");
  params.set("fields[6]", "viewsCount");
  params.set("fields[7]", "likesCount");
  params.set("fields[8]", "publishedAt");
  params.set("fields[9]", "createdAt");
  params.set("fields[10]", "updatedAt");
  params.set("fields[11]", "hashtags");
  params.set("populate[cover][fields][0]", "url");

  const url = `${STRAPI_URL}/api/dealer-newses?${params.toString()}`;

  const res = await fetch(url, {
    headers: STRAPI_TOKEN
      ? {
          Authorization: `Bearer ${STRAPI_TOKEN}`,
        }
      : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Failed to load dealer news by slug: ${text || res.status}`);
  }

  const json = (await res.json()) as StrapiListResponse<StrapiDealerNews>;
  const item = json.data?.[0];

  if (!item) return null;

  return mapDealerNewsItem(item);
}