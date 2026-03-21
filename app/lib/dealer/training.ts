import "server-only";

export type DealerTrainingCategory = "presentation" | "sales" | "interior";
export type DealerTrainingType = "pptx" | "pdf" | "doc" | "video";

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

type StrapiTrainingItem = {
  id: number;
  documentId?: string;
  title?: string;
  slug?: string;
  category?: string;
  type?: string;
  description?: string | null;
  collectionTitle?: string | null;
  sortOrder?: number | null;
  isActive?: boolean | null;
  label?: string | null;
  tags?: string | null;
  fileUrl?: string | null;
  file?: StrapiMediaField;
  cover?: StrapiMediaField;
};

type StrapiListResponse<T> = {
  data?: T[];
};

export type DealerTrainingItem = {
  id: number;
  documentId: string | null;
  title: string;
  slug: string;
  category: DealerTrainingCategory;
  type: DealerTrainingType;
  resolvedType: DealerTrainingType;
  description: string | null;
  collectionTitle: string | null;
  sortOrder: number;
  isActive: boolean;
  label: string | null;
  tags: string[];
  fileUrl: string | null;
  fileName: string | null;
  fileSizeLabel: string | null;
  mime: string | null;
  downloadUrl: string | null;
  coverUrl: string | null;
};

export type DealerTrainingData = {
  presentations: DealerTrainingItem[];
  sales: DealerTrainingItem[];
  interior: DealerTrainingItem[];
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

function formatFileSizeLabel(size: number | null): string | null {
  if (size === null) return null;

  // Strapi media size usually comes in KB
  if (size < 1024) {
    return `${Number(size).toFixed(size >= 100 ? 0 : 1)} KB`;
  }

  const mb = size / 1024;
  return `${mb.toFixed(mb >= 10 ? 0 : 1)} MB`;
}

function normalizeCategory(value: string | null): DealerTrainingCategory | null {
  if (value === "presentation" || value === "sales" || value === "interior") {
    return value;
  }
  return null;
}

function normalizeType(value: string | null): DealerTrainingType | null {
  if (value === "pptx" || value === "pdf" || value === "doc" || value === "video") {
    return value;
  }
  return null;
}

function resolveTrainingType(params: {
  explicitType: DealerTrainingType;
  mime: string | null;
  fileName: string | null;
  fileUrl: string | null;
}): DealerTrainingType {
  const { explicitType, mime, fileName, fileUrl } = params;

  const lowerMime = mime?.toLowerCase() ?? "";
  const lowerName = fileName?.toLowerCase() ?? "";
  const lowerUrl = fileUrl?.toLowerCase() ?? "";

  const source = `${lowerName} ${lowerUrl}`;

  if (
    lowerMime.includes("presentation") ||
    lowerMime.includes("powerpoint") ||
    source.includes(".pptx") ||
    source.includes(".ppt")
  ) {
    return "pptx";
  }

  if (lowerMime.includes("pdf") || source.includes(".pdf")) {
    return "pdf";
  }

  if (
    lowerMime.includes("word") ||
    lowerMime.includes("officedocument.wordprocessingml") ||
    source.includes(".docx") ||
    source.includes(".doc")
  ) {
    return "doc";
  }

  if (
    lowerMime.startsWith("video/") ||
    source.includes(".mp4") ||
    source.includes(".mov") ||
    source.includes(".webm")
  ) {
    return "video";
  }

  return explicitType;
}

function normalizeTrainingItem(raw: StrapiTrainingItem): DealerTrainingItem | null {
  const title = asString(raw.title);
  const slug = asString(raw.slug) ?? "";
  const category = normalizeCategory(asString(raw.category));
  const type = normalizeType(asString(raw.type));

  if (!title || !category || !type) {
    return null;
  }

  const fileMedia = normalizeMedia(raw.file);
  const coverMedia = normalizeMedia(raw.cover);

  const fileSourceUrl = toAbsoluteUrl(asString(fileMedia?.url));
  const directFileUrl = asString(raw.fileUrl);
  const fileName = asString(fileMedia?.name);
  const mime = asString(fileMedia?.mime);

  const resolvedType = resolveTrainingType({
    explicitType: type,
    mime,
    fileName,
    fileUrl: directFileUrl,
  });

  // fileUrl only for external links, mainly video
  const resolvedFileUrl =
    resolvedType === "video" ? directFileUrl ?? fileSourceUrl : fileSourceUrl;

  return {
    id: raw.id,
    documentId: asString(raw.documentId),
    title,
    slug,
    category,
    type,
    resolvedType,
    description: asString(raw.description),
    collectionTitle: asString(raw.collectionTitle),
    sortOrder: asNumber(raw.sortOrder) ?? 0,
    isActive: asBoolean(raw.isActive) ?? true,
    label: asString(raw.label),
    tags: parseTags(asString(raw.tags)),
    fileUrl: resolvedFileUrl,
    fileName,
    fileSizeLabel: formatFileSizeLabel(asNumber(fileMedia?.size)),
    mime,
    downloadUrl: fileSourceUrl ? buildDownloadUrl(fileSourceUrl) : null,
    coverUrl: toAbsoluteUrl(asString(coverMedia?.url)),
  };
}

async function fetchDealerTrainingRaw(): Promise<StrapiTrainingItem[]> {
  const params = new URLSearchParams();

  params.set("status", "published");
  params.set("pagination[pageSize]", "100");
  params.set("sort[0]", "sortOrder:asc");
  params.set("sort[1]", "title:asc");
  params.set("filters[isActive][$eq]", "true");

  params.set("fields[0]", "title");
  params.set("fields[1]", "slug");
  params.set("fields[2]", "category");
  params.set("fields[3]", "type");
  params.set("fields[4]", "description");
  params.set("fields[5]", "collectionTitle");
  params.set("fields[6]", "sortOrder");
  params.set("fields[7]", "isActive");
  params.set("fields[8]", "label");
  params.set("fields[9]", "tags");
  params.set("fields[10]", "fileUrl");
  params.set("fields[11]", "documentId");

  params.set("populate[file][fields][0]", "url");
  params.set("populate[file][fields][1]", "name");
  params.set("populate[file][fields][2]", "mime");
  params.set("populate[file][fields][3]", "size");

  params.set("populate[cover][fields][0]", "url");

  const res = await fetch(`${STRAPI_URL}/api/dealer-trainings?${params.toString()}`, {
    headers: STRAPI_TOKEN
      ? {
          Authorization: `Bearer ${STRAPI_TOKEN}`,
        }
      : undefined,
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch dealer training: ${res.status}`);
  }

  const json = (await res.json()) as StrapiListResponse<StrapiTrainingItem>;
  return Array.isArray(json.data) ? json.data : [];
}

export async function getDealerTrainingData(): Promise<DealerTrainingData> {
  const raw = await fetchDealerTrainingRaw();

  const items = raw
    .map(normalizeTrainingItem)
    .filter((item): item is DealerTrainingItem => Boolean(item))
    .filter((item) => item.isActive);

  return {
    presentations: items.filter((item) => item.category === "presentation"),
    sales: items.filter((item) => item.category === "sales"),
    interior: items.filter((item) => item.category === "interior"),
  };
}