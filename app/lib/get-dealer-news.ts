type StrapiMediaFormat = {
  url?: string;
};

type StrapiMedia = {
  url?: string;
  formats?: {
    thumbnail?: StrapiMediaFormat;
    small?: StrapiMediaFormat;
    medium?: StrapiMediaFormat;
    large?: StrapiMediaFormat;
  };
};

type StrapiDealerNewsItem = {
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
};

type StrapiListResponse<T> = {
  data?: T[];
};

export type DealerNewsItem = {
  id: number;
  documentId: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  kind: "news" | "promo";
  isPinned: boolean;
  viewsCount: number;
  likesCount: number;
  publishedAt: string;
  coverUrl: string | null;
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

export async function getDealerNews(): Promise<DealerNewsItem[]> {
  const params = new URLSearchParams();
  params.set("sort[0]", "isPinned:desc");
  params.set("sort[1]", "publishedAt:desc");
  params.set("pagination[pageSize]", "20");
  params.set("fields[0]", "title");
  params.set("fields[1]", "slug");
  params.set("fields[2]", "excerpt");
  params.set("fields[3]", "content");
  params.set("fields[4]", "kind");
  params.set("fields[5]", "isPinned");
  params.set("fields[6]", "viewsCount");
  params.set("fields[7]", "likesCount");
  params.set("fields[8]", "publishedAt");
  params.set("populate[cover][fields][0]", "url");

  const res = await fetch(`${STRAPI_URL}/api/dealer-posts?${params.toString()}`, {
    headers: STRAPI_TOKEN
      ? {
          Authorization: `Bearer ${STRAPI_TOKEN}`,
        }
      : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    return [];
  }

  const json = (await res.json()) as StrapiListResponse<StrapiDealerNewsItem>;

  return (json.data || []).map((item) => ({
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
    publishedAt: item.publishedAt || item.createdAt || item.updatedAt || "",
    coverUrl: getMediaUrl(item.cover?.url),
  }));
}