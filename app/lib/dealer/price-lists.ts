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

export type DealerFileType = "price" | "tech_catalog" | "instruction";

export type DealerCollectionSlug =
  | "amber"
  | "scandy"
  | "elizabeth"
  | "salvador"
  | "pitti"
  | "buongiorno"
  | "request-form";

export type DealerFileItem = {
  id: number;
  documentId: string;
  title: string;
  type: DealerFileType;
  countryCode: DealerCountryCode | null;
  collectionSlug: DealerCollectionSlug;
  collectionTitle: string;
  description: string;
  isActive: boolean;
  sortOrder: number;
  fileName: string;
  fileUrl: string;
  fileExt: string;
  mimeType: string;
  sizeKb: number | null;
};

export type DealerPriceListItem = DealerFileItem;
export type DealerTechCatalogItem = DealerFileItem;
export type DealerInstructionItem = DealerFileItem;

export type DealerInstructionCollection = {
  slug: DealerCollectionSlug;
  title: string;
  count: number;
};

type StrapiMediaItem = {
  id?: unknown;
  name?: unknown;
  url?: unknown;
  ext?: unknown;
  mime?: unknown;
  size?: unknown;
};

type StrapiDealerFileItem = {
  id?: unknown;
  documentId?: unknown;
  title?: unknown;
  type?: unknown;
  countryCode?: unknown;
  collectionSlug?: unknown;
  collectionTitle?: unknown;
  description?: unknown;
  isActive?: unknown;
  sortOrder?: unknown;
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
  slug: DealerCollectionSlug | string,
): string {
  switch (slug) {
    case "amber":
      return "AMBER";
    case "scandy":
      return "SCANDY";
    case "elizabeth":
      return "ELIZABETH";
    case "salvador":
      return "SALVADOR";
    case "pitti":
      return "PITTI";
    case "buongiorno":
      return "BUONGIORNO";
    case "request-form":
      return "Форма заявки";
    default:
      return String(slug || "").toUpperCase();
  }
}

function normalizeCountryCode(value: unknown): DealerCountryCode | null {
  const code = getString(value).trim().toUpperCase();

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
      return null;
  }
}

function normalizeCollectionSlug(value: unknown): DealerCollectionSlug {
  const slug = getString(value).trim().toLowerCase();

  switch (slug) {
    case "amber":
    case "scandy":
    case "elizabeth":
    case "salvador":
    case "pitti":
    case "buongiorno":
    case "request-form":
      return slug;
    default:
      return "amber";
  }
}

function normalizeFileType(value: unknown): DealerFileType | null {
  const type = getString(value).trim().toLowerCase();

  switch (type) {
    case "price":
    case "tech_catalog":
    case "instruction":
      return type;
    default:
      return null;
  }
}

function normalizeFile(
  rawFile: StrapiMediaItem | null | undefined,
): Pick<
  DealerFileItem,
  "fileName" | "fileUrl" | "fileExt" | "mimeType" | "sizeKb"
> {
  if (!rawFile) {
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

function normalizeDealerFileItem(
  item: StrapiDealerFileItem,
): DealerFileItem | null {
  const id = typeof item.id === "number" ? item.id : 0;
  const documentId = getString(item.documentId);
  const title = getString(item.title).trim();
  const type = normalizeFileType(item.type);
  const description = getString(item.description);
  const isActive = getBoolean(item.isActive, false);
  const countryCode = normalizeCountryCode(item.countryCode);
  const collectionSlug = normalizeCollectionSlug(item.collectionSlug);
  const collectionTitleRaw = getString(item.collectionTitle).trim();
  const sortOrder = getNumber(item.sortOrder) ?? 0;
  const file = normalizeFile(item.file);

  if (!id || !documentId || !title || !type || !file.fileUrl) {
    return null;
  }

  return {
    id,
    documentId,
    title,
    type,
    countryCode,
    collectionSlug,
    collectionTitle: collectionTitleRaw || getCollectionTitle(collectionSlug),
    description,
    isActive,
    sortOrder,
    fileName: file.fileName,
    fileUrl: file.fileUrl,
    fileExt: file.fileExt,
    mimeType: file.mimeType,
    sizeKb: file.sizeKb,
  };
}

async function fetchDealerFiles(
  params: URLSearchParams,
): Promise<DealerFileItem[]> {
  const response = await fetch(
    `${STRAPI_URL}/api/dealer-files?${params.toString()}`,
    {
      headers: {
        ...(STRAPI_TOKEN ? { Authorization: `Bearer ${STRAPI_TOKEN}` } : {}),
      },
      cache: "no-store",
      next: { revalidate: 0 },
    },
  );

  if (!response.ok) {
    throw new Error(`Failed to load dealer files: ${response.status}`);
  }

  const json = (await response.json()) as StrapiListResponse<StrapiDealerFileItem>;
  const items = Array.isArray(json.data) ? json.data : [];

  return items
    .map(normalizeDealerFileItem)
    .filter((item): item is DealerFileItem => item !== null);
}

function appendCommonFields(params: URLSearchParams): void {
  params.set("fields[0]", "title");
  params.set("fields[1]", "type");
  params.set("fields[2]", "countryCode");
  params.set("fields[3]", "collectionSlug");
  params.set("fields[4]", "description");
  params.set("fields[5]", "isActive");
  params.set("fields[6]", "documentId");
  params.set("fields[7]", "collectionTitle");
  params.set("fields[8]", "sortOrder");

  params.set("populate[file][fields][0]", "name");
  params.set("populate[file][fields][1]", "url");
  params.set("populate[file][fields][2]", "ext");
  params.set("populate[file][fields][3]", "mime");
  params.set("populate[file][fields][4]", "size");
}

export async function getDealerPriceListsByCountry(
  countryCode: string,
): Promise<DealerPriceListItem[]> {
  const normalizedCountryCode =
    normalizeCountryCode(countryCode?.trim().toUpperCase()) ?? "RU";

  const params = new URLSearchParams();
  params.set("status", "published");
  params.set("sort[0]", "sortOrder:asc");
  params.set("sort[1]", "collectionSlug:asc");
  params.set("sort[2]", "title:asc");
  params.set("pagination[pageSize]", "100");

  params.set("filters[type][$eq]", "price");
  params.set("filters[isActive][$eq]", "true");

  // Важно:
  // показываем прайсы конкретного региона дилера
  // + общие прайсы без countryCode, например "Форма заявки".
  params.set("filters[$or][0][countryCode][$eq]", normalizedCountryCode);
  params.set("filters[$or][1][countryCode][$null]", "true");

  appendCommonFields(params);

  return fetchDealerFiles(params);
}

export async function getDealerTechCatalogs(): Promise<DealerTechCatalogItem[]> {
  const params = new URLSearchParams();
  params.set("status", "published");
  params.set("sort[0]", "collectionSlug:asc");
  params.set("pagination[pageSize]", "100");

  params.set("filters[type][$eq]", "tech_catalog");
  params.set("filters[isActive][$eq]", "true");

  appendCommonFields(params);

  return fetchDealerFiles(params);
}

export async function getDealerInstructions(): Promise<DealerInstructionItem[]> {
  const params = new URLSearchParams();
  params.set("status", "published");
  params.set("sort[0]", "collectionSlug:asc");
  params.set("sort[1]", "sortOrder:asc");
  params.set("sort[2]", "title:asc");
  params.set("pagination[pageSize]", "500");

  params.set("filters[type][$eq]", "instruction");
  params.set("filters[isActive][$eq]", "true");

  appendCommonFields(params);

  return fetchDealerFiles(params);
}

export async function getDealerInstructionCollections(): Promise<
  DealerInstructionCollection[]
> {
  const items = await getDealerInstructions();

  const map = new Map<DealerCollectionSlug, DealerInstructionCollection>();

  for (const item of items) {
    const existing = map.get(item.collectionSlug);

    if (existing) {
      existing.count += 1;
      continue;
    }

    map.set(item.collectionSlug, {
      slug: item.collectionSlug,
      title: item.collectionTitle || getCollectionTitle(item.collectionSlug),
      count: 1,
    });
  }

  return Array.from(map.values()).sort((a, b) =>
    a.title.localeCompare(b.title, "ru"),
  );
}

export async function getDealerInstructionsByCollection(
  collectionSlug: string,
): Promise<DealerInstructionItem[]> {
  const normalizedSlug = normalizeCollectionSlug(collectionSlug);

  const items = await getDealerInstructions();

  return items
    .filter((item) => item.collectionSlug === normalizedSlug)
    .sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder;
      }

      return a.title.localeCompare(b.title, "ru");
    });
}