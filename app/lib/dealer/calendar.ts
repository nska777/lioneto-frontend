const STRAPI_URL =
  process.env.STRAPI_URL ||
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  "http://localhost:1337";

const STRAPI_TOKEN =
  process.env.STRAPI_DEALER_TOKEN ||
  process.env.STRAPI_API_TOKEN ||
  "";

export type DealerCalendarEventType =
  | "training"
  | "webinar"
  | "meeting"
  | "exhibition"
  | "important"
  | "industry";

export type DealerCalendarEventFormat = "offline" | "online" | "hybrid";

export type DealerCalendarEvent = {
  id: string;
  title: string;
  slug: string;
  type: DealerCalendarEventType;
  description?: string;
  dateISO: string;
  time?: string;
  durationMin?: number;
  format?: DealerCalendarEventFormat;
  location?: string;
  meetingUrl?: string;
  isRegistrationOpen: boolean;
  isActive: boolean;
  sortOrder: number;
};

type StrapiEventItem = {
  id: number;
  documentId?: string;
  title?: string | null;
  slug?: string | null;
  type?: DealerCalendarEventType | null;
  description?: string | null;
  eventDate?: string | null;
  endDate?: string | null;
  format?: DealerCalendarEventFormat | null;
  location?: string | null;
  meetingUrl?: string | null;
  isRegistrationOpen?: boolean | null;
  isActive?: boolean | null;
  sortOrder?: number | null;
};

type StrapiListResponse<T> = {
  data?: T[];
};

function toDateISO(iso: string): string {
  return iso.slice(0, 10);
}

function toTime(iso: string): string | undefined {
  const dt = new Date(iso);
  if (Number.isNaN(dt.getTime())) return undefined;

  const hh = String(dt.getHours()).padStart(2, "0");
  const mm = String(dt.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

function toDurationMin(
  startISO: string,
  endISO?: string | null,
): number | undefined {
  if (!endISO) return undefined;

  const start = new Date(startISO).getTime();
  const end = new Date(endISO).getTime();

  if (Number.isNaN(start) || Number.isNaN(end) || end <= start) {
    return undefined;
  }

  return Math.round((end - start) / 60000);
}

function normalizeEvent(item: StrapiEventItem): DealerCalendarEvent | null {
  if (!item.id || !item.title || !item.slug || !item.type || !item.eventDate) {
    return null;
  }

  return {
    id: String(item.id),
    title: item.title,
    slug: item.slug,
    type: item.type,
    description: item.description ?? undefined,
    dateISO: toDateISO(item.eventDate),
    time: toTime(item.eventDate),
    durationMin: toDurationMin(item.eventDate, item.endDate),
    format: item.format ?? undefined,
    location: item.location ?? undefined,
    meetingUrl: item.meetingUrl ?? undefined,
    isRegistrationOpen: Boolean(item.isRegistrationOpen),
    isActive: item.isActive ?? true,
    sortOrder: item.sortOrder ?? 0,
  };
}

function getHeaders(): HeadersInit {
  if (!STRAPI_TOKEN) return {};
  return {
    Authorization: `Bearer ${STRAPI_TOKEN}`,
  };
}

function getEventFieldsQuery(): string {
  return (
    `&fields[0]=title` +
    `&fields[1]=slug` +
    `&fields[2]=type` +
    `&fields[3]=description` +
    `&fields[4]=eventDate` +
    `&fields[5]=endDate` +
    `&fields[6]=format` +
    `&fields[7]=location` +
    `&fields[8]=meetingUrl` +
    `&fields[9]=isRegistrationOpen` +
    `&fields[10]=isActive` +
    `&fields[11]=sortOrder`
  );
}

export async function getDealerCalendarEvents(): Promise<DealerCalendarEvent[]> {
  const url =
    `${STRAPI_URL}/api/dealer-calendar-events` +
    `?status=published` +
    `&sort[0]=eventDate:asc` +
    `&sort[1]=sortOrder:asc` +
    `&pagination[pageSize]=100` +
    `&filters[isActive][$eq]=true` +
    getEventFieldsQuery();

  const res = await fetch(url, {
    headers: getHeaders(),
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch dealer calendar events: ${res.status}`);
  }

  const json = (await res.json()) as StrapiListResponse<StrapiEventItem>;
  const items = Array.isArray(json.data) ? json.data : [];

  return items
    .map(normalizeEvent)
    .filter((item): item is DealerCalendarEvent => item !== null);
}

export async function getDealerCalendarEventById(
  eventId: string,
): Promise<DealerCalendarEvent | null> {
  if (!eventId) return null;

  const numericId = Number(eventId);

  if (!Number.isFinite(numericId)) {
    return null;
  }

  const url =
    `${STRAPI_URL}/api/dealer-calendar-events` +
    `?status=published` +
    `&pagination[pageSize]=1` +
    `&filters[id][$eq]=${encodeURIComponent(String(numericId))}` +
    getEventFieldsQuery();

  const res = await fetch(url, {
    headers: getHeaders(),
    cache: "no-store",
  });

  if (!res.ok) {
    return null;
  }

  const json = (await res.json()) as StrapiListResponse<StrapiEventItem>;
  const item = Array.isArray(json.data) ? json.data[0] : null;

  return item ? normalizeEvent(item) : null;
}