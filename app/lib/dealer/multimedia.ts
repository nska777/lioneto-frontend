const STRAPI_URL =
  process.env.STRAPI_URL ||
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  "http://localhost:1337";

const STRAPI_TOKEN =
  process.env.STRAPI_DEALER_TOKEN ||
  process.env.STRAPI_API_TOKEN ||
  "";

export type DealerMultimediaCollectionSlug =
  | "amber"
  | "scandy"
  | "elizabeth"
  | "salvador"
  | "pitti"
  | "buongiorno";

export type DealerMultimediaType = "photo" | "video";

export const DEALER_MULTIMEDIA_COLLECTIONS: Array<{
  slug: DealerMultimediaCollectionSlug;
  title: string;
}> = [
  { slug: "amber", title: "AMBER" },
  { slug: "scandy", title: "SCANDY" },
  { slug: "elizabeth", title: "ELIZABETH" },
  { slug: "salvador", title: "SALVADOR" },
  { slug: "pitti", title: "PITTI" },
  { slug: "buongiorno", title: "BUONGIORNO" },
];

export type DealerMultimediaItem = {
  id: number;
  documentId?: string;
  title: string;
  slug: string;
  collectionSlug: DealerMultimediaCollectionSlug;
  type: DealerMultimediaType;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
  imageUrl: string | null;
  coverUrl: string | null;
  videoFileUrl: string | null;
  videoUrl: string | null;
};

export type DealerMultimediaCollectionCard = {
  slug: DealerMultimediaCollectionSlug;
  title: string;
  photosCount: number;
  coverUrl: string | null;
};

type StrapiMedia = {
  url?: string | null;
};

type StrapiItem = {
  id: number;
  documentId?: string;
  title?: string | null;
  slug?: string | null;
  collectionSlug?: string | null;
  type?: string | null;
  description?: string | null;
  sortOrder?: number | null;
  isActive?: boolean | null;
  image?: StrapiMedia | null;
  cover?: StrapiMedia | null;
  videoFile?: StrapiMedia | null;
  videoUrl?: string | null;
};

type StrapiListResponse<T> = {
  data?: T[];
};

function isCollectionSlug(
  value: string | null | undefined,
): value is DealerMultimediaCollectionSlug {
  return DEALER_MULTIMEDIA_COLLECTIONS.some((item) => item.slug === value);
}

function toAbsoluteMediaUrl(url?: string | null): string | null {
  if (!url) return null;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${STRAPI_URL}${url}`;
}

function mapMultimediaItem(item: StrapiItem): DealerMultimediaItem | null {
  const title = item.title?.trim();
  const slug = item.slug?.trim();
  const collectionSlug = item.collectionSlug?.trim();
  const type = item.type?.trim();

  if (!title || !slug || !isCollectionSlug(collectionSlug)) return null;
  if (type !== "photo" && type !== "video") return null;

  return {
    id: item.id,
    documentId: item.documentId,
    title,
    slug,
    collectionSlug,
    type,
    description: item.description ?? null,
    sortOrder: typeof item.sortOrder === "number" ? item.sortOrder : 9999,
    isActive: item.isActive !== false,
    imageUrl: toAbsoluteMediaUrl(item.image?.url),
    coverUrl: toAbsoluteMediaUrl(item.cover?.url),
    videoFileUrl: toAbsoluteMediaUrl(item.videoFile?.url),
    videoUrl: item.videoUrl ?? null,
  };
}

async function fetchDealerMultimedia(
  params: Record<string, string>,
): Promise<DealerMultimediaItem[]> {
  const search = new URLSearchParams({
    "status": "published",
    "pagination[pageSize]": "200",
    "sort[0]": "sortOrder:asc",
    "sort[1]": "title:asc",
    "fields[0]": "title",
    "fields[1]": "slug",
    "fields[2]": "collectionSlug",
    "fields[3]": "type",
    "fields[4]": "description",
    "fields[5]": "sortOrder",
    "fields[6]": "isActive",
    "populate[image][fields][0]": "url",
    "populate[cover][fields][0]": "url",
    "populate[videoFile][fields][0]": "url",
    ...params,
  });

  const res = await fetch(
    `${STRAPI_URL}/api/dealer-multimedias?${search.toString()}`,
    {
      headers: STRAPI_TOKEN
        ? {
            Authorization: `Bearer ${STRAPI_TOKEN}`,
          }
        : undefined,
      next: { revalidate: 60 },
    },
  );

  if (!res.ok) {
    return [];
  }

  const json = (await res.json()) as StrapiListResponse<StrapiItem>;
  const rawItems = Array.isArray(json.data) ? json.data : [];

  return rawItems
    .map(mapMultimediaItem)
    .filter((item): item is DealerMultimediaItem => item !== null)
    .filter((item) => item.isActive);
}

export async function getDealerPhotoCollections(): Promise<
  DealerMultimediaCollectionCard[]
> {
  const photos = await fetchDealerMultimedia({
    "filters[type][$eq]": "photo",
    "filters[isActive][$eq]": "true",
  });

  return DEALER_MULTIMEDIA_COLLECTIONS.map((collection) => {
    const items = photos.filter(
      (item) => item.collectionSlug === collection.slug && item.imageUrl,
    );

    return {
      slug: collection.slug,
      title: collection.title,
      photosCount: items.length,
      coverUrl: items[0]?.imageUrl ?? null,
    };
  });
}

export async function getDealerPhotosByCollection(
  collectionSlug: DealerMultimediaCollectionSlug,
): Promise<DealerMultimediaItem[]> {
  const items = await fetchDealerMultimedia({
    "filters[type][$eq]": "photo",
    "filters[collectionSlug][$eq]": collectionSlug,
    "filters[isActive][$eq]": "true",
  });

  return items.filter((item) => item.imageUrl);
}

export function getDealerCollectionTitle(
  slug: DealerMultimediaCollectionSlug,
): string {
  return (
    DEALER_MULTIMEDIA_COLLECTIONS.find((item) => item.slug === slug)?.title ??
    slug.toUpperCase()
  );
}