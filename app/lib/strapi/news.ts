// app/lib/strapi/news.ts

import "server-only";

type RawStrapiItem = Record<string, any>;

export type StrapiNewsItem = {
  id: string | number;
  documentId?: string;
  type?: string;
  tag?: string;
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

const STRAPI_BASE = (
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  process.env.STRAPI_URL ||
  "http://localhost:1337"
).replace(/\/$/, "");

const STRAPI_TOKEN =
  process.env.STRAPI_READONLY_TOKEN ||
  process.env.STRAPI_API_TOKEN ||
  "";

function toAbsolute(url?: string | null): string {
  if (!url) return "";

  const clean = String(url).trim();
  if (!clean) return "";

  if (clean.startsWith("http://") || clean.startsWith("https://")) {
    return clean;
  }

  if (clean.startsWith("//")) {
    return `https:${clean}`;
  }

  if (clean.startsWith("/")) {
    return `${STRAPI_BASE}${clean}`;
  }

  return `${STRAPI_BASE}/${clean}`;
}

function getMedia(raw: any) {
  if (!raw) return null;

  const media = raw?.data?.attributes ?? raw?.data ?? raw?.attributes ?? raw;

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
    alternativeText: media?.alternativeText ?? media?.name ?? null,
  };
}

function escapeHtml(value: string): string {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function blocksToHtml(value: any): string | undefined {
  if (!value) return undefined;

  if (typeof value === "string") {
    return value;
  }

  if (!Array.isArray(value)) {
    return undefined;
  }

  return value
    .map((block: any) => {
      if (!block) return "";

      if (block.type === "paragraph") {
        const text = Array.isArray(block.children)
          ? block.children.map((child: any) => child?.text || "").join("")
          : "";

        return text.trim() ? `<p>${escapeHtml(text)}</p>` : "";
      }

      if (block.type === "heading") {
        const level = Math.min(Math.max(Number(block.level || 2), 2), 4);

        const text = Array.isArray(block.children)
          ? block.children.map((child: any) => child?.text || "").join("")
          : "";

        return text.trim()
          ? `<h${level}>${escapeHtml(text)}</h${level}>`
          : "";
      }

      if (block.type === "list") {
        const tag = block.format === "ordered" ? "ol" : "ul";

        const items = Array.isArray(block.children)
          ? block.children
              .map((li: any) => {
                const text = Array.isArray(li.children)
                  ? li.children.map((child: any) => child?.text || "").join("")
                  : "";

                return text.trim() ? `<li>${escapeHtml(text)}</li>` : "";
              })
              .join("")
          : "";

        return items ? `<${tag}>${items}</${tag}>` : "";
      }

      return "";
    })
    .filter((html: string) => Boolean(html))
    .join("");
}

function normalizeBoolean(value: any): boolean | undefined {
  if (value === true || value === "true" || value === 1 || value === "1") {
    return true;
  }

  if (value === false || value === "false" || value === 0 || value === "0") {
    return false;
  }

  return undefined;
}

function normalizeNumber(value: any): number | undefined {
  if (value === null || value === undefined || value === "") return undefined;

  const n = Number(value);

  return Number.isFinite(n) ? n : undefined;
}

function normalizeItem(raw: RawStrapiItem): StrapiNewsItem | null {
  if (!raw) return null;

  const src = raw?.attributes ?? raw;

  const id = raw?.id ?? src?.id ?? src?.documentId ?? src?.slug;
  const documentId = src?.documentId ?? raw?.documentId ?? undefined;

  const title = String(src?.title ?? "").trim();
  const slug = String(src?.slug ?? "").trim();

  if (!id || !title || !slug) return null;

  const cover = getMedia(src?.cover);
  const image = getMedia(src?.image) || cover;

  const content =
    blocksToHtml(src?.content) ||
    blocksToHtml(src?.body) ||
    blocksToHtml(src?.text) ||
    undefined;

  const excerpt = src?.excerpt ?? src?.subtitle ?? src?.description ?? undefined;

  return {
    id,
    documentId,
    type: src?.type ?? src?.category ?? undefined,
    tag: src?.tag ?? src?.type ?? src?.category ?? undefined,
    title,
    subtitle: src?.subtitle ?? undefined,
    excerpt,
    description: src?.description ?? excerpt,
    content,
    slug,
    dateLabel: src?.dateLabel ?? undefined,
    isActive: normalizeBoolean(src?.isActive),
    sortOrder: normalizeNumber(src?.sortOrder),
    updatedAt: src?.updatedAt ?? undefined,
    publishedAt: src?.publishedAt ?? undefined,
    createdAt: src?.createdAt ?? undefined,
    cover,
    image,
    coverImage: image?.url || cover?.url || undefined,
  };
}

function getHeaders(): HeadersInit {
  if (!STRAPI_TOKEN) return {};

  return {
    Authorization: `Bearer ${STRAPI_TOKEN}`,
  };
}

async function safeFetchJson(url: string): Promise<any | null> {
  try {
    console.log("News Strapi URL:", url);
    console.log("News token exists:", Boolean(STRAPI_TOKEN));

    const res = await fetch(url, {
      cache: "no-store",
      headers: getHeaders(),
    });

    if (!res.ok) {
      const text = await res.text();

      console.error("News Strapi fetch error:", res.status, url);
      console.error("News Strapi response:", text);

      return null;
    }

    return await res.json();
  } catch (error) {
    console.error("News Strapi fetch failed:", error);
    return null;
  }
}

function sortNews(items: StrapiNewsItem[]): StrapiNewsItem[] {
  return [...items].sort((a, b) => {
    const aSort =
      typeof a.sortOrder === "number" && Number.isFinite(a.sortOrder)
        ? a.sortOrder
        : 9999;

    const bSort =
      typeof b.sortOrder === "number" && Number.isFinite(b.sortOrder)
        ? b.sortOrder
        : 9999;

    if (aSort !== bSort) {
      return aSort - bSort;
    }

    const aTime = new Date(a.publishedAt || a.createdAt || 0).getTime();
    const bTime = new Date(b.publishedAt || b.createdAt || 0).getTime();

    return bTime - aTime;
  });
}

export async function fetchNews({
  limit,
}: {
  limit?: number;
} = {}): Promise<StrapiNewsItem[]> {
  const qs = new URLSearchParams();

  qs.set("populate", "*");
  qs.set("pagination[pageSize]", String(limit || 100));
  qs.set("pagination[page]", "1");

  const url = `${STRAPI_BASE}/api/news-items?${qs.toString()}`;

  const json = await safeFetchJson(url);

  const data: RawStrapiItem[] = Array.isArray(json?.data)
    ? (json.data as RawStrapiItem[])
    : [];

  const items: StrapiNewsItem[] = data.reduce<StrapiNewsItem[]>(
    (acc, rawItem) => {
      const item = normalizeItem(rawItem);

      if (item && item.isActive !== false) {
        acc.push(item);
      }

      return acc;
    },
    [],
  );

  return sortNews(items);
}

export async function fetchNewsBySlug(
  slug: string,
): Promise<StrapiNewsItem | null> {
  const cleanSlug = String(slug ?? "").trim();

  if (!cleanSlug) return null;

  const qs = new URLSearchParams();

  qs.set("populate", "*");
  qs.set("filters[slug][$eq]", cleanSlug);
  qs.set("pagination[pageSize]", "1");
  qs.set("pagination[page]", "1");

  const url = `${STRAPI_BASE}/api/news-items?${qs.toString()}`;

  const json = await safeFetchJson(url);

  const data: RawStrapiItem[] = Array.isArray(json?.data)
    ? (json.data as RawStrapiItem[])
    : [];

  const item = normalizeItem(data[0]);

  if (!item) return null;
  if (item.isActive === false) return null;

  return item;
}