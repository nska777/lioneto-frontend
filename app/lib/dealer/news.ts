import { getDealerCalendarEvents } from "@/app/lib/dealer/calendar";
import { getDealerKnowledgePosts } from "@/app/lib/dealer/knowledge";
import {
  getDealerKnowledgeNotes,
  type KnowledgeFeedItem,
} from "@/app/lib/dealer/notes";

type DealerNewsKind = "news" | "promo" | "knowledge" | "note";
type DealerNewsSource = "news" | "calendar" | "knowledge_post" | "dealer_note";
type DealerCalendarNewsType =
  | "training"
  | "webinar"
  | "meeting"
  | "exhibition"
  | "important"
  | "industry";

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

  source: DealerNewsSource;
  eventType?: DealerCalendarNewsType;
  href: string;
  ctaLabel?: string;
  isRegistrationOpen: boolean;
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

type DealerKnowledgePostLike = {
  id: number | string;
  documentId?: string;
  title?: string;
  slug?: string;
  excerpt?: string | null;
  content?: string | null;
  viewsCount?: number;
  likesCount?: number;
  publishedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
  coverUrl?: string | null;
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

function toSafeTimestamp(value?: string | null) {
  if (!value) return 0;
  const ts = new Date(value).getTime();
  return Number.isFinite(ts) ? ts : 0;
}

function getSourcePriority(source: DealerNewsSource) {
  switch (source) {
    case "dealer_note":
      return 0;
    case "knowledge_post":
      return 1;
    case "news":
      return 2;
    case "calendar":
      return 3;
    default:
      return 9;
  }
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
    source: "news",
    href: `/dealer/news/${item.slug || ""}`,
    ctaLabel: "Читать подробнее",
    isRegistrationOpen: false,
  };
}

function getEventTypeLabel(type: DealerCalendarNewsType): string {
  switch (type) {
    case "training":
      return "обучение";
    case "webinar":
      return "вебинар";
    case "meeting":
      return "встреча";
    case "exhibition":
      return "событие";
    case "important":
      return "важное";
    case "industry":
      return "рынок";
    default:
      return "событие";
  }
}

function buildCalendarExcerpt(params: {
  description?: string;
  type: DealerCalendarNewsType;
  dateISO: string;
  time?: string;
  location?: string;
}): string {
  if (params.description?.trim()) {
    return params.description.trim();
  }

  const typeLabel = getEventTypeLabel(params.type);
  const parts = [`Анонс события: ${typeLabel}.`];

  if (params.time) {
    parts.push(`Начало в ${params.time}.`);
  }

  if (params.location) {
    parts.push(`Место: ${params.location}.`);
  }

  return parts.join(" ");
}

function buildCalendarHashtags(params: {
  type: DealerCalendarNewsType;
  format?: "offline" | "online" | "hybrid";
}): string[] {
  const tags = new Set<string>();

  tags.add(getEventTypeLabel(params.type));

  if (params.type === "training") tags.add("обучение");
  if (params.type === "webinar") tags.add("обучение");
  if (params.type === "exhibition") tags.add("мероприятия");
  if (params.type === "meeting") tags.add("встречи");
  if (params.type === "important") tags.add("важно");

  if (params.format === "online") tags.add("онлайн");
  if (params.format === "offline") tags.add("офлайн");
  if (params.format === "hybrid") tags.add("гибрид");

  return Array.from(tags);
}

function toEventPublishedAt(dateISO: string, time?: string): string {
  const safeTime =
    time && /^\d{2}:\d{2}$/.test(time) ? `${time}:00` : "00:00:00";
  return `${dateISO}T${safeTime}`;
}

function mapKnowledgePostToNews(item: DealerKnowledgePostLike): DealerNewsItem {
  const publishedAt = item.publishedAt || item.createdAt || "";
  const createdAt = item.createdAt || item.publishedAt || "";
  const updatedAt = item.updatedAt || publishedAt || createdAt;
  const safeSlug = item.slug || String(item.id || "");

  return {
    id: Number(item.id) || Math.floor(Math.random() * 1_000_000_000),
    documentId: item.documentId || `knowledge_post-${safeSlug}`,
    title: item.title || "",
    slug: safeSlug,
    excerpt: item.excerpt || "",
    content: item.content || item.excerpt || "",
    kind: "knowledge",
    isPinned: false,
    viewsCount: typeof item.viewsCount === "number" ? item.viewsCount : 0,
    likesCount: typeof item.likesCount === "number" ? item.likesCount : 0,
    publishedAt,
    createdAt,
    updatedAt,
    coverUrl: item.coverUrl || null,
    hashtags: [],
    source: "knowledge_post",
    href: `/dealer/training?knowledge=${encodeURIComponent(safeSlug)}&source=knowledge_post`,
    ctaLabel: "Открыть материал",
    isRegistrationOpen: false,
  };
}

function mapKnowledgeNoteToNews(item: KnowledgeFeedItem): DealerNewsItem {
  const publishedAt = item.publishedAt || item.createdAt || "";
  const createdAt = item.createdAt || item.publishedAt || "";
  const updatedAt = item.updatedAt || publishedAt || createdAt;

  return {
    id: Number(item.id) || Math.floor(Math.random() * 1_000_000_000),
    documentId: item.documentId || `dealer_note-${item.slug}`,
    title: item.title || "",
    slug: item.slug || "",
    excerpt: item.excerpt || "",
    content: item.content || item.excerpt || "",
    kind: "note",
    isPinned: false,
    viewsCount: typeof item.viewsCount === "number" ? item.viewsCount : 0,
    likesCount: typeof item.likesCount === "number" ? item.likesCount : 0,
    publishedAt,
    createdAt,
    updatedAt,
    coverUrl: item.coverUrl || null,
    hashtags: [],
    source: "dealer_note",
    href: `/dealer/training?knowledge=${encodeURIComponent(item.slug)}&source=dealer_note`,
    ctaLabel: "Открыть заметку",
    isRegistrationOpen: false,
  };
}

async function getDealerNewsOnly(): Promise<DealerNewsItem[]> {
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

async function getCalendarAsNewsItems(): Promise<DealerNewsItem[]> {
  const events = await getDealerCalendarEvents();

  return events.map((event) => {
    const publishedAt = toEventPublishedAt(event.dateISO, event.time);
    const excerpt = buildCalendarExcerpt({
      description: event.description,
      type: event.type,
      dateISO: event.dateISO,
      time: event.time,
      location: event.location,
    });

    return {
      id: 100000 + Number(event.id),
      documentId: `calendar-${event.id}`,
      title: event.title,
      slug: `calendar-${event.slug}`,
      excerpt,
      content: event.description || excerpt,
      kind: "news",
      isPinned: event.type === "important",
      viewsCount: 0,
      likesCount: 0,
      publishedAt,
      createdAt: publishedAt,
      updatedAt: publishedAt,
      coverUrl: null,
      hashtags: buildCalendarHashtags({
        type: event.type,
        format: event.format,
      }),
      source: "calendar",
      eventType: event.type,
      href: `/dealer/calendar?date=${event.dateISO}&eventId=${event.id}`,
      ctaLabel: "Перейти в календарь",
      isRegistrationOpen: event.isRegistrationOpen,
    };
  });
}

async function getKnowledgeAsNewsItems(): Promise<DealerNewsItem[]> {
  const [knowledgePosts, notePosts] = await Promise.all([
    getDealerKnowledgePosts(),
    getDealerKnowledgeNotes(),
  ]);

  const mappedNotes = notePosts.map(mapKnowledgeNoteToNews);
  const mappedPosts = (knowledgePosts as DealerKnowledgePostLike[]).map(
    mapKnowledgePostToNews,
  );

  return [...mappedNotes, ...mappedPosts];
}

export async function getDealerNews(): Promise<DealerNewsItem[]> {
  const [newsItems, calendarItems, knowledgeItems] = await Promise.all([
    getDealerNewsOnly(),
    getCalendarAsNewsItems(),
    getKnowledgeAsNewsItems(),
  ]);

  const merged = [...knowledgeItems, ...newsItems, ...calendarItems];

  merged.sort((a, b) => {
    const sourceDiff = getSourcePriority(a.source) - getSourcePriority(b.source);
    if (sourceDiff !== 0) return sourceDiff;

    if (a.isPinned !== b.isPinned) {
      return a.isPinned ? -1 : 1;
    }

    return (
      toSafeTimestamp(b.publishedAt || b.createdAt) -
      toSafeTimestamp(a.publishedAt || a.createdAt)
    );
  });

  return merged;
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
    throw new Error(
      `Failed to load dealer news by slug: ${text || res.status}`,
    );
  }

  const json = (await res.json()) as StrapiListResponse<StrapiDealerNews>;
  const item = json.data?.[0];

  if (!item) return null;

  return mapDealerNewsItem(item);
}