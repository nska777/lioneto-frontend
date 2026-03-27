import "server-only";

type StrapiMediaFormat = {
  url?: string;
};

type StrapiMediaAttributes = {
  url?: string;
  name?: string;
  alternativeText?: string | null;
  mime?: string | null;
  size?: number | null;
  formats?: Record<string, StrapiMediaFormat> | null;
};

type StrapiMediaData =
  | {
      id?: number;
      attributes?: StrapiMediaAttributes;
      url?: string;
      name?: string;
      alternativeText?: string | null;
      mime?: string | null;
      size?: number | null;
      formats?: Record<string, StrapiMediaFormat> | null;
    }
  | null
  | undefined;

type StrapiMediaField =
  | {
      data?: StrapiMediaData;
    }
  | StrapiMediaData;

type StrapiKnowledgePostRaw = {
  id: number;
  documentId?: string;
  title?: string;
  slug?: string;
  excerpt?: string | null;
  description?: string | null;
  content?: string | null;
  body?: string | null;
  summary?: string | null;
  kind?: string | null;
  type?: string | null;
  label?: string | null;
  tags?: string | null;
  tagsText?: unknown;
  viewsCount?: number | null;
  likesCount?: number | null;
  isActive?: boolean | null;
  isPinned?: boolean | null;
  sortOrder?: number | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  publishedAt?: string | null;
  fileUrl?: string | null;
  file?: StrapiMediaField;
  cover?: StrapiMediaField;
};

type StrapiSingleResponse<T> = {
  data?: T | null;
};

type StrapiListResponse<T> = {
  data?: T[];
};

export type DealerKnowledgePostKind = "news" | "note" | "article";

export type DealerKnowledgePost = {
  id: number;
  documentId: string | null;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  kind: DealerKnowledgePostKind;
  label: string | null;
  tags: string[];
  viewsCount: number;
  likesCount: number;
  isActive: boolean;
  isPinned: boolean;
  sortOrder: number;
  publishedAt: string | null;
  createdAt: string | null;
  updatedAt: string | null;
  coverUrl: string | null;
  coverAlt: string | null;
  fileUrl: string | null;
  fileName: string | null;
  fileMime: string | null;
  fileExtensionLabel: string | null;
  downloadUrl: string | null;
};

const STRAPI_URL =
  process.env.STRAPI_URL ||
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  "http://localhost:1337";

const STRAPI_TOKEN =
  process.env.STRAPI_DEALER_TOKEN ||
  process.env.STRAPI_API_TOKEN ||
  process.env.STRAPI_TOKEN ||
  "";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function asString(value: unknown): string | null {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function asBoolean(value: unknown): boolean | null {
  return typeof value === "boolean" ? value : null;
}

function normalizeMedia(field: StrapiMediaField): StrapiMediaAttributes | null {
  if (!field) return null;

  if (isRecord(field) && "data" in field) {
    const data = field.data;
    if (!data) return null;

    if (isRecord(data) && isRecord(data.attributes)) {
      return data.attributes as StrapiMediaAttributes;
    }

    if (isRecord(data)) {
      return data as StrapiMediaAttributes;
    }

    return null;
  }

  if (isRecord(field) && "attributes" in field && isRecord(field.attributes)) {
    return field.attributes as StrapiMediaAttributes;
  }

  if (isRecord(field)) {
    return field as StrapiMediaAttributes;
  }

  return null;
}

function toAbsoluteUrl(url: string | null): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${STRAPI_URL}${url}`;
}

function buildDownloadUrl(sourceUrl: string | null): string | null {
  if (!sourceUrl) return null;
  return `/api/dealer/download?url=${encodeURIComponent(sourceUrl)}`;
}

function parseTags(raw: string | null | undefined): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function parseTagsText(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "string" ? item.trim() : ""))
      .filter(Boolean);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];

    try {
      const parsed = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed
          .map((item) => (typeof item === "string" ? item.trim() : ""))
          .filter(Boolean);
      }
    } catch {
      return parseTags(trimmed);
    }

    return [];
  }

  return [];
}

function normalizeKind(value: string | null): DealerKnowledgePostKind {
  const normalized = value?.toLowerCase();

  if (
    normalized === "news" ||
    normalized === "note" ||
    normalized === "article"
  ) {
    return normalized;
  }

  if (normalized === "новость") return "news";
  if (normalized === "заметка") return "note";
  if (normalized === "статья") return "article";

  return "note";
}

function getFileExtensionLabel(params: {
  fileName: string | null;
  fileMime: string | null;
  fileUrl: string | null;
}): string | null {
  const { fileName, fileMime, fileUrl } = params;

  const source = `${fileName ?? ""} ${fileUrl ?? ""}`.toLowerCase();
  const mime = (fileMime ?? "").toLowerCase();

  if (mime.includes("pdf") || source.includes(".pdf")) return "PDF";
  if (
    mime.includes("word") ||
    mime.includes("officedocument.wordprocessingml") ||
    source.includes(".docx") ||
    source.includes(".doc")
  ) {
    return "DOCX";
  }
  if (
    mime.includes("presentation") ||
    mime.includes("powerpoint") ||
    source.includes(".pptx") ||
    source.includes(".ppt")
  ) {
    return "PPTX";
  }
  if (
    mime.startsWith("video/") ||
    source.includes(".mp4") ||
    source.includes(".mov")
  ) {
    return "VIDEO";
  }
  if (mime.startsWith("image/")) return "IMAGE";

  const match = source.match(/\.([a-z0-9]{2,5})(?:\?|$)/i);
  return match?.[1]?.toUpperCase() ?? null;
}

function normalizeKnowledgePost(
  raw: StrapiKnowledgePostRaw,
): DealerKnowledgePost | null {
  const title = asString(raw.title);
  if (!title) return null;

  const fileMedia = normalizeMedia(raw.file);
  const coverMedia = normalizeMedia(raw.cover);

  const fileSourceUrl = toAbsoluteUrl(asString(fileMedia?.url));
  const externalFileUrl = asString(raw.fileUrl);
  const resolvedFileUrl = externalFileUrl ?? fileSourceUrl;

  const fileName = asString(fileMedia?.name);
  const fileMime = asString(fileMedia?.mime);

  const excerpt =
    asString(raw.excerpt) ??
    asString(raw.summary) ??
    asString(raw.description);

  const content = asString(raw.content) ?? asString(raw.body);
  const isActive = asBoolean(raw.isActive);
  const isPinned = asBoolean(raw.isPinned);

  const tagsFromTags = parseTags(asString(raw.tags));
  const tagsFromTagsText = parseTagsText(raw.tagsText);
  const tags =
    tagsFromTagsText.length > 0
      ? tagsFromTagsText
      : tagsFromTags.length > 0
        ? tagsFromTags
        : [];

  return {
    id: raw.id,
    documentId: asString(raw.documentId),
    title,
    slug: asString(raw.slug) ?? String(raw.id),
    excerpt,
    content,
    kind: normalizeKind(asString(raw.kind) ?? asString(raw.type)),
    label: asString(raw.label),
    tags,
    viewsCount: asNumber(raw.viewsCount) ?? 0,
    likesCount: asNumber(raw.likesCount) ?? 0,
    isActive: isActive ?? true,
    isPinned: isPinned ?? false,
    sortOrder: asNumber(raw.sortOrder) ?? 0,
    publishedAt: asString(raw.publishedAt),
    createdAt: asString(raw.createdAt),
    updatedAt: asString(raw.updatedAt),
    coverUrl: toAbsoluteUrl(asString(coverMedia?.url)),
    coverAlt: asString(coverMedia?.alternativeText),
    fileUrl: resolvedFileUrl,
    fileName,
    fileMime,
    fileExtensionLabel: getFileExtensionLabel({
      fileName,
      fileMime,
      fileUrl: resolvedFileUrl,
    }),
    downloadUrl: fileSourceUrl ? buildDownloadUrl(fileSourceUrl) : null,
  };
}

function buildKnowledgeParams() {
  const params = new URLSearchParams();

  params.set("status", "published");
  params.set("pagination[pageSize]", "100");

  params.set("fields[0]", "title");
  params.set("fields[1]", "slug");
  params.set("fields[2]", "excerpt");
  params.set("fields[3]", "content");
  params.set("fields[4]", "type");
  params.set("fields[5]", "viewsCount");
  params.set("fields[6]", "likesCount");
  params.set("fields[7]", "isActive");
  params.set("fields[8]", "isPinned");
  params.set("fields[9]", "sortOrder");
  params.set("fields[10]", "publishedAt");
  params.set("fields[11]", "createdAt");
  params.set("fields[12]", "updatedAt");
  params.set("fields[13]", "tagsText");

  params.set("sort[0]", "isPinned:desc");
  params.set("sort[1]", "sortOrder:asc");
  params.set("sort[2]", "publishedAt:desc");
  params.set("sort[3]", "createdAt:desc");

  params.set("populate[file][fields][0]", "url");
  params.set("populate[file][fields][1]", "name");
  params.set("populate[file][fields][2]", "mime");

  params.set("populate[cover][fields][0]", "url");
  params.set("populate[cover][fields][1]", "alternativeText");

  return params.toString();
}

async function fetchDealerKnowledgeRaw(): Promise<StrapiKnowledgePostRaw[]> {
  const res = await fetch(
    `${STRAPI_URL}/api/dealer-knowledge-posts?${buildKnowledgeParams()}`,
    {
      headers: STRAPI_TOKEN
        ? {
            Authorization: `Bearer ${STRAPI_TOKEN}`,
          }
        : undefined,
      cache: "no-store",
    },
  );

  if (!res.ok) {
    throw new Error(`Failed to fetch dealer knowledge posts: ${res.status}`);
  }

  const json = (await res.json()) as StrapiListResponse<StrapiKnowledgePostRaw>;
  return Array.isArray(json.data) ? json.data : [];
}

export async function getDealerKnowledgePosts(): Promise<DealerKnowledgePost[]> {
  const raw = await fetchDealerKnowledgeRaw();

  return raw
    .map(normalizeKnowledgePost)
    .filter((item): item is DealerKnowledgePost => Boolean(item))
    .filter((item) => item.isActive);
}

export async function getDealerKnowledgePostBySlug(
  slug: string,
): Promise<DealerKnowledgePost | null> {
  const params = buildKnowledgeParams();
  const res = await fetch(
    `${STRAPI_URL}/api/dealer-knowledge-posts?${params}&filters[slug][$eq]=${encodeURIComponent(slug)}`,
    {
      headers: STRAPI_TOKEN
        ? {
            Authorization: `Bearer ${STRAPI_TOKEN}`,
          }
        : undefined,
      cache: "no-store",
    },
  );

  if (!res.ok) {
    throw new Error(
      `Failed to fetch dealer knowledge post by slug: ${res.status}`,
    );
  }

  const json = (await res.json()) as StrapiListResponse<StrapiKnowledgePostRaw>;
  const first = Array.isArray(json.data) ? json.data[0] : null;

  if (!first) return null;

  const normalized = normalizeKnowledgePost(first);
  if (!normalized || !normalized.isActive) return null;

  return normalized;
}