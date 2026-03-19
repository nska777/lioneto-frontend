import "server-only";

export type DealerCountryCode =
  | "RU"
  | "UZ"
  | "KZ"
  | "TJ"
  | "KG"
  | "AM"
  | "BY"
  | "AZ";

export type DealerFileType = "price" | "catalog";

export type DealerPriceListItem = {
  id: number;
  documentId: string;
  title: string;
  countryCode: DealerCountryCode;
  collectionSlug:
    | "amber"
    | "scandy"
    | "elizabeth"
    | "salvador"
    | "pitti"
    | "buongiorno";
  collectionTitle: string;
  description: string;
  isActive: boolean;
  fileName: string;
  fileUrl: string;
  fileExt: string;
  mimeType: string;
  sizeKb: number | null;
};

type StrapiMediaFormat = {
  url?: unknown;
};

type StrapiMediaItem = {
  id?: unknown;
  name?: unknown;
  url?: unknown;
  ext?: unknown;
  mime?: unknown;
  size?: unknown;
  formats?: unknown;
};

type StrapiDealerFileItem = {
  id?: unknown;
  documentId?: unknown;
  title?: unknown;
  countryCode?: unknown;
  collectionSlug?: unknown;
  description?: unknown;
  isActive?: unknown;
  file?: StrapiMediaItem | null;
};

type StrapiListResponse<T> = {
  data?: T[];
};

const STRAPI_URL =
  process.env.STRAPI_URL ||
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  "http://localhost:1337";

const STRAPI_TOKEN =
  process.env.STRAPI_DEALER_TOKEN ||
  process.env.STRAPI_API_TOKEN ||
  "";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function getString(value: unknown): string {
  return typeof value === "string" ? value : "";
}

function getBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function getNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function joinUrl(base: string, path: string): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://")) return path;

  const normalizedBase = base.endsWith("/") ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return `${normalizedBase}${normalizedPath}`;
}

export function getCollectionTitle(
  slug: DealerPriceListItem["collectionSlug"] | string,
): string {
  switch (slug) {
    case "amber":
      return "Amber";
    case "scandy":
      return "Scandy";
    case "elizabeth":
      return "Elizabeth";
    case "salvador":
      return "Salvador";
    case "pitti":
      return "Pitti";
    case "buongiorno":
      return "Buongiorno";
    default:
      return slug;
  }
}

function normalizeCountryCode(value: unknown): DealerCountryCode {
  const code = getString(value).toUpperCase();

  switch (code) {
    case "RU":
    case "UZ":
    case "KZ":
    case "TJ":
    case "KG":
    case "AM":
    case "BY":
    case "AZ":
      return code;
    default:
      return "RU";
  }
}

function normalizeCollectionSlug(
  value: unknown,
): DealerPriceListItem["collectionSlug"] {
  const slug = getString(value).toLowerCase();

  switch (slug) {
    case "amber":
    case "scandy":
    case "elizabeth":
    case "salvador":
    case "pitti":
    case "buongiorno":
      return slug;
    default:
      return "amber";
  }
}

function normalizeFile(
  rawFile: StrapiMediaItem | null | undefined,
): Pick<
  DealerPriceListItem,
  "fileName" | "fileUrl" | "fileExt" | "mimeType" | "sizeKb"
> {
  if (!rawFile || !isRecord(rawFile)) {
    return {
      fileName: "",
      fileUrl: "",
      fileExt: "",
      mimeType: "",
      sizeKb: null,
    };
  }

  const fileName = getString(rawFile.name);
  const fileUrl = joinUrl(STRAPI_URL, getString(rawFile.url));
  const fileExt = getString(rawFile.ext);
  const mimeType = getString(rawFile.mime);
  const sizeKb = getNumber(rawFile.size);

  return {
    fileName,
    fileUrl,
    fileExt,
    mimeType,
    sizeKb,
  };
}

function normalizeDealerPriceListItem(
  item: StrapiDealerFileItem,
): DealerPriceListItem | null {
  const id = typeof item.id === "number" ? item.id : 0;
  const documentId = getString(item.documentId);
  const title = getString(item.title);
  const description = getString(item.description);
  const isActive = getBoolean(item.isActive, false);
  const countryCode = normalizeCountryCode(item.countryCode);
  const collectionSlug = normalizeCollectionSlug(item.collectionSlug);
  const file = normalizeFile(item.file);

  if (!id || !documentId || !title || !file.fileUrl) {
    return null;
  }

  return {
    id,
    documentId,
    title,
    countryCode,
    collectionSlug,
    collectionTitle: getCollectionTitle(collectionSlug),
    description,
    isActive,
    fileName: file.fileName,
    fileUrl: file.fileUrl,
    fileExt: file.fileExt,
    mimeType: file.mimeType,
    sizeKb: file.sizeKb,
  };
}

export async function getDealerPriceListsByCountry(
  countryCode: string,
): Promise<DealerPriceListItem[]> {
  const normalizedCountryCode = normalizeCountryCode(countryCode);

  const params = new URLSearchParams();
  params.set("status", "published");
  params.set("sort[0]", "collectionSlug:asc");
  params.set("pagination[pageSize]", "100");

  params.set("filters[type][$eq]", "price");
  params.set("filters[countryCode][$eq]", normalizedCountryCode);
  params.set("filters[isActive][$eq]", "true");

  params.set("fields[0]", "title");
  params.set("fields[1]", "countryCode");
  params.set("fields[2]", "collectionSlug");
  params.set("fields[3]", "description");
  params.set("fields[4]", "isActive");
  params.set("fields[5]", "documentId");

  params.set("populate[file][fields][0]", "name");
  params.set("populate[file][fields][1]", "url");
  params.set("populate[file][fields][2]", "ext");
  params.set("populate[file][fields][3]", "mime");
  params.set("populate[file][fields][4]", "size");

  const response = await fetch(
    `${STRAPI_URL}/api/dealer-files?${params.toString()}`,
    {
      headers: {
        ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
      },
      next: { revalidate: 0 },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to load dealer price lists: ${response.status}`);
  }

  const json = (await response.json()) as StrapiListResponse<StrapiDealerFileItem>;
  const items = Array.isArray(json.data) ? json.data : [];

  return items
    .map(normalizeDealerPriceListItem)
    .filter((item): item is DealerPriceListItem => item !== null);
}