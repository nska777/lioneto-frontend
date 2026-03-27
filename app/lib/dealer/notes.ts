import { STRAPI_URL } from "@/app/lib/auth/config";
import type { DealerKnowledgePost } from "@/app/lib/dealer/knowledge";

const STRAPI_TOKEN =
  process.env.STRAPI_DEALER_TOKEN ||
  process.env.STRAPI_API_TOKEN ||
  process.env.STRAPI_TOKEN ||
  "";

export type KnowledgeFeedItem = DealerKnowledgePost & {
  sourceType: "knowledge_post" | "dealer_note";
  authorLogin?: string | null;
  authorTitle?: string | null;
};

type StrapiMedia = {
  url?: string | null;
  alternativeText?: string | null;
  name?: string | null;
  mime?: string | null;
};

type StrapiDealerKnowledgeNoteRaw = {
  id?: number | string;
  documentId?: string;
  title?: string | null;
  slug?: string | null;
  excerpt?: string | null;
  content?: string | null;
  isActive?: boolean | null;
  dealerLogin?: string | null;
  dealerTitle?: string | null;
  viewsCount?: number | null;
  likesCount?: number | null;
  publishedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  cover?: StrapiMedia | null;
  file?: StrapiMedia | null;
};

type StrapiListResponse<T> = {
  data?: T[];
};

function getAuthHeaders(): Record<string, string> {
  return STRAPI_TOKEN
    ? {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
      }
    : {};
}

function toAbsoluteUrl(url?: string | null) {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${String(STRAPI_URL).replace(/\/$/, "")}${url}`;
}

function getFileExtensionLabel(file?: StrapiMedia | null) {
  const fileName = file?.name || "";
  const fromName = fileName.includes(".")
    ? fileName.split(".").pop()?.toUpperCase()
    : null;

  if (fromName) return fromName;

  const mime = file?.mime || "";
  if (mime.includes("pdf")) return "PDF";
  if (mime.includes("presentation")) return "PPTX";
  if (mime.includes("word")) return "DOC";
  if (mime.includes("sheet")) return "XLS";
  return null;
}

function normalizeNote(
  raw: StrapiDealerKnowledgeNoteRaw,
): KnowledgeFeedItem | null {
  const title = raw.title?.trim();
  const slug = raw.slug?.trim();

  if (!title || !slug) return null;
  if (raw.isActive === false) return null;

  const coverUrl = toAbsoluteUrl(raw.cover?.url);
  const fileUrl = toAbsoluteUrl(raw.file?.url);

  return {
    id: Number(raw.id ?? 0),
    documentId: raw.documentId ?? "",
    title,
    slug,
    excerpt: raw.excerpt ?? null,
    content: raw.content ?? null,
    kind: "note",
    label: raw.dealerTitle ?? "Заметка дилера",
    tags: ["Заметка"],
    viewsCount: Number(raw.viewsCount ?? 0),
    likesCount: Number(raw.likesCount ?? 0),
    isActive: raw.isActive ?? true,
    isPinned: false,
    sortOrder: 0,
    publishedAt: raw.publishedAt ?? null,
    createdAt: raw.createdAt ?? null,
    updatedAt: raw.updatedAt ?? null,
    coverUrl,
    coverAlt: raw.cover?.alternativeText ?? title,
    fileUrl,
    fileName: raw.file?.name ?? null,
    fileMime: raw.file?.mime ?? null,
    fileExtensionLabel: getFileExtensionLabel(raw.file),
    downloadUrl: fileUrl,
    sourceType: "dealer_note",
    authorLogin: raw.dealerLogin ?? null,
    authorTitle: raw.dealerTitle ?? null,
  };
}

export async function getDealerKnowledgeNotes(): Promise<KnowledgeFeedItem[]> {
  const baseUrl = String(STRAPI_URL).replace(/\/$/, "");

  try {
    const res = await fetch(
      `${baseUrl}/api/dealer-knowledge-notes?pagination[pageSize]=200&sort[0]=publishedAt:desc&sort[1]=createdAt:desc&status=published&populate[cover][fields][0]=url&populate[cover][fields][1]=alternativeText&populate[file][fields][0]=url&populate[file][fields][1]=name&populate[file][fields][2]=mime`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...getAuthHeaders(),
        },
        cache: "no-store",
      },
    );

    if (!res.ok) return [];

    const json =
      (await res.json()) as StrapiListResponse<StrapiDealerKnowledgeNoteRaw>;

    const items = Array.isArray(json.data) ? json.data : [];

    return items
      .map((item) => normalizeNote(item))
      .filter((item): item is KnowledgeFeedItem => Boolean(item));
  } catch {
    return [];
  }
}