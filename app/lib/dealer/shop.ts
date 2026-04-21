import { cache } from "react";

export type DealerCountryCode = "RU" | "UZ" | "KZ" | "TJ";
export type DealerCategory =
  | "bedroom"
  | "living"
  | "children"
  | "cabinet"
  | "mattress"
  | "decor"
  | "addon"
  | "other";

export type DealerProductPriceMap = Record<DealerCountryCode, number>;

export type DealerFileAsset = {
  name: string;
  url: string;
};

export type DealerProductVariant = {
  key: string;
  label: string;
  color?: string;
  image?: string;
  price?: Partial<DealerProductPriceMap>;
};

export type DealerAddon = {
  id: string;
  title: string;
  article: string;
  articleShort?: string;
  description: string;
  image: string;
  kind: "required" | "recommended";
  selectionType: "toggle" | "quantity";
  defaultQuantity: number;
  minQuantity: number;
  price: DealerProductPriceMap;
  color?: string;
  size?: string;
  material?: string;
  variants?: DealerProductVariant[];
};

export type DealerProduct = {
  id: string;
  collectionSlug: string;
  category: DealerCategory;
  title: string;
  article: string;
  articleShort?: string;
  image: string;
  description: string;
  price: DealerProductPriceMap;
  color?: string;
  size?: string;
  material?: string;
  assemblyInstructionTitle?: string;
  assemblyInstructionFile?: DealerFileAsset | null;
  variants?: DealerProductVariant[];
  requiredItems?: DealerAddon[];
  recommendedItems?: DealerAddon[];
  addons?: DealerAddon[];

  stockQty?: number;
  reservedQty?: number;
  isStockTracked?: boolean;
};

export type DealerCollection = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  coverImage?: string;
  sortOrder?: number;
  products?: DealerProduct[];
};

type StrapiMedia = {
  id?: number;
  documentId?: string;
  url?: string;
  name?: string;
};

type StrapiCollection = {
  id?: number;
  documentId?: string;
  slug?: string;
  title?: string;
  description?: string;
  sortOrder?: number;
  coverImage?: StrapiMedia | { data?: StrapiMedia | null } | null;
  isActive?: boolean;
};

type StrapiVariant = {
  id?: number;
  documentId?: string;
  key?: string;
  label?: string;
  color?: string;
  media?: StrapiMedia | { data?: StrapiMedia | null } | null;
  priceRU?: number | string | null;
  priceUZ?: number | string | null;
  priceKZ?: number | string | null;
  priceTJ?: number | string | null;
};

type StrapiProduct = {
  id?: number;
  documentId?: string;
  title?: string;
  article?: string;
  articleShort?: string;
  description?: string;
  category?: string;
  color?: string;
  size?: string;
  material?: string;
  image?: StrapiMedia | { data?: StrapiMedia | null } | null;
  gallery?: StrapiMedia[] | { data?: StrapiMedia[] | null } | null;
  collection?: StrapiCollection | { data?: StrapiCollection | null } | null;
  variants?: StrapiVariant[];
  assemblyInstructionTitle?: string;
  assemblyInstructionFile?:
    | StrapiMedia
    | { data?: StrapiMedia | null }
    | null;
  priceRU?: number | string | null;
  priceUZ?: number | string | null;
  priceKZ?: number | string | null;
  priceTJ?: number | string | null;
  isActive?: boolean;

  stockQty?: number;
  reservedQty?: number;
  isStockTracked?: boolean;
};

type StrapiAddonRelation = {
  id?: number;
  documentId?: string;
  parentProduct?: StrapiProduct | { data?: StrapiProduct | null } | null;
  addonProduct?: StrapiProduct | { data?: StrapiProduct | null } | null;
  addonKind?: "required" | "recommended" | string | null;
  selectionType?: "toggle" | "quantity" | string | null;
  defaultQty?: number | string | null;
  minQty?: number | string | null;
  sortOrder?: number | string | null;
  isActive?: boolean;
};

const STRAPI_URL =
  process.env.STRAPI_URL ||
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  "http://localhost:1337";

function getAuthHeaders(): { Authorization?: string } {
  const token =
    process.env.STRAPI_DEALER_TOKEN ||
    process.env.STRAPI_API_TOKEN ||
    process.env.STRAPI_READONLY_TOKEN ||
    "";

  return token ? { Authorization: `Bearer ${token}` } : {};
}

function unwrapRelation<T>(
  value?: T | { data?: T | null } | null,
): T | null {
  if (!value) return null;

  if (typeof value === "object" && value !== null && "data" in value) {
    return value.data ?? null;
  }

  return value as T;
}

function normalizeCategory(value?: string | null): DealerCategory {
  const normalized = String(value ?? "").trim().toLowerCase();

  if (
    normalized === "bedroom" ||
    normalized === "living" ||
    normalized === "children" ||
    normalized === "cabinet" ||
    normalized === "mattress" ||
    normalized === "decor" ||
    normalized === "addon"
  ) {
    return normalized;
  }

  return "other";
}

function toNumber(value: unknown) {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
}

function mapPrices(raw: {
  priceRU?: number | string | null;
  priceUZ?: number | string | null;
  priceKZ?: number | string | null;
  priceTJ?: number | string | null;
}): DealerProductPriceMap {
  return {
    RU: toNumber(raw.priceRU),
    UZ: toNumber(raw.priceUZ),
    KZ: toNumber(raw.priceKZ),
    TJ: toNumber(raw.priceTJ),
  };
}

function withAbsoluteUrl(url?: string | null) {
  const clean = String(url ?? "").trim();
  if (!clean) return "";

  if (clean.startsWith("http://") || clean.startsWith("https://")) {
    return clean;
  }

  return `${STRAPI_URL}${clean}`;
}

function extractMediaUrl(
  value?: StrapiMedia | { data?: StrapiMedia | null } | null,
) {
  const media = unwrapRelation(value);
  return withAbsoluteUrl(media?.url);
}

function extractMediaFile(
  value?: StrapiMedia | { data?: StrapiMedia | null } | null,
): DealerFileAsset | null {
  const media = unwrapRelation(value);

  if (!media?.url) return null;

  return {
    name: media.name ?? "file",
    url: withAbsoluteUrl(media.url),
  };
}

function normalizeCollection(
  raw: StrapiCollection,
  products?: DealerProduct[],
): DealerCollection {
  return {
    id: String(raw.documentId ?? raw.id ?? ""),
    slug: raw.slug ?? "",
    title: raw.title ?? "",
    description: raw.description ?? "",
    coverImage: extractMediaUrl(raw.coverImage),
    sortOrder: toNumber(raw.sortOrder),
    products: products ?? [],
  };
}

function normalizeVariant(
  raw: StrapiVariant | null | undefined,
): DealerProductVariant | null {
  if (!raw) return null;

  const key = String(raw.key ?? raw.documentId ?? raw.id ?? "").trim();
  if (!key) return null;

  return {
    key,
    label: raw.label ?? key,
    color: raw.color ?? "",
    image: extractMediaUrl(raw.media),
    price: {
      RU: toNumber(raw.priceRU),
      UZ: toNumber(raw.priceUZ),
      KZ: toNumber(raw.priceKZ),
      TJ: toNumber(raw.priceTJ),
    },
  };
}

function normalizeAddon(
  relation: StrapiAddonRelation,
  addonProduct: StrapiProduct,
): DealerAddon {
  const kind =
    relation.addonKind === "required" ? "required" : "recommended";

  const selectionType =
    relation.selectionType === "toggle" ? "toggle" : "quantity";

  const variants = Array.isArray(addonProduct.variants)
    ? (addonProduct.variants
        .map(normalizeVariant)
        .filter(Boolean) as DealerProductVariant[])
    : [];

  return {
    id: String(addonProduct.documentId ?? addonProduct.id ?? ""),
    title: addonProduct.title ?? "",
    article: addonProduct.article ?? "",
    articleShort: addonProduct.articleShort ?? "",
    description: addonProduct.description ?? "",
    image: extractMediaUrl(addonProduct.image),
    kind,
    selectionType,
    defaultQuantity: Math.max(1, toNumber(relation.defaultQty || 1)),
    minQuantity: Math.max(1, toNumber(relation.minQty || 1)),
    price: mapPrices(addonProduct),
    color: addonProduct.color ?? "",
    size: addonProduct.size ?? "",
    material: addonProduct.material ?? "",
    variants,
  };
}

function normalizeProductBase(raw: StrapiProduct): DealerProduct {
  const collection = unwrapRelation(raw.collection);
  const variants = Array.isArray(raw.variants)
    ? (raw.variants.map(normalizeVariant).filter(Boolean) as DealerProductVariant[])
    : [];

  return {
    id: String(raw.documentId ?? raw.id ?? ""),
    collectionSlug: collection?.slug ?? "",
    category: normalizeCategory(raw.category),
    title: raw.title ?? "",
    article: raw.article ?? "",
    articleShort: raw.articleShort ?? "",
    image: extractMediaUrl(raw.image),
    description: raw.description ?? "",
    price: mapPrices(raw),
    color: raw.color ?? "",
    size: raw.size ?? "",
    material: raw.material ?? "",
    assemblyInstructionTitle: raw.assemblyInstructionTitle ?? "",
    assemblyInstructionFile: extractMediaFile(raw.assemblyInstructionFile),
    variants,
    requiredItems: [],
    recommendedItems: [],
    addons: [],

    stockQty: Math.max(0, toNumber(raw.stockQty)),
    reservedQty: Math.max(0, toNumber(raw.reservedQty)),
    isStockTracked: Boolean(raw.isStockTracked),
  };
}

function withAddons(
  product: DealerProduct,
  addonRelations: StrapiAddonRelation[],
  productById: Map<string, StrapiProduct>,
): DealerProduct {
  const requiredItems: DealerAddon[] = [];
  const recommendedItems: DealerAddon[] = [];

  addonRelations
    .sort((a, b) => toNumber(a.sortOrder) - toNumber(b.sortOrder))
    .forEach((relation) => {
      const addonRef = unwrapRelation(relation.addonProduct);
      const addonId = String(addonRef?.documentId ?? addonRef?.id ?? "");

      if (!addonId) return;

      const fullAddonProduct = productById.get(addonId) ?? addonRef;
      if (!fullAddonProduct) return;

      const normalized = normalizeAddon(relation, fullAddonProduct);

      if (normalized.kind === "required") {
        requiredItems.push(normalized);
      } else {
        recommendedItems.push(normalized);
      }
    });

  return {
    ...product,
    requiredItems,
    recommendedItems,
    addons: [...requiredItems, ...recommendedItems],
  };
}

async function strapiFetch<T>(path: string): Promise<T> {
  const url = `${STRAPI_URL}${path}`;

  const headers = new Headers({
    "Content-Type": "application/json",
  });

  const authHeaders = getAuthHeaders();

  if (
    "Authorization" in authHeaders &&
    typeof authHeaders.Authorization === "string" &&
    authHeaders.Authorization.length > 0
  ) {
    headers.set("Authorization", authHeaders.Authorization);
  }

  const response = await fetch(url, {
    headers,
    next: { revalidate: 60 },
  });

  if (!response.ok) {
    const text = await response.text().catch(() => "");
    throw new Error(
      `Strapi request failed (${response.status}) ${url}\n${text}`,
    );
  }

  return response.json();
}

export const getDealerCollections = cache(
  async (): Promise<DealerCollection[]> => {
    const params = new URLSearchParams();
    params.set("filters[isActive][$eq]", "true");
    params.set("sort[0]", "sortOrder:asc");
    params.set("sort[1]", "title:asc");
    params.set("populate", "*");
    params.set("pagination[pageSize]", "100");

    const json = await strapiFetch<{ data?: StrapiCollection[] }>(
      `/api/dealer-collections?${params.toString()}`,
    );

    const rows = Array.isArray(json?.data) ? json.data : [];
    return rows.map((item) => normalizeCollection(item));
  },
);

export async function getDealerCollectionPageData(
  collectionSlug: string,
): Promise<{
  collections: DealerCollection[];
  collection: DealerCollection | null;
  products: DealerProduct[];
}> {
  const collectionsParams = new URLSearchParams();
  collectionsParams.set("filters[isActive][$eq]", "true");
  collectionsParams.set("sort[0]", "sortOrder:asc");
  collectionsParams.set("sort[1]", "title:asc");
  collectionsParams.set("populate", "*");
  collectionsParams.set("pagination[pageSize]", "100");

  const collectionsJson = await strapiFetch<{ data?: StrapiCollection[] }>(
    `/api/dealer-collections?${collectionsParams.toString()}`,
  );

  const rawCollections = Array.isArray(collectionsJson?.data)
    ? collectionsJson.data
    : [];

  const currentRawCollection =
    rawCollections.find((item) => item.slug === collectionSlug) ?? null;

  const baseCollections = rawCollections.map((item) => normalizeCollection(item));
  const currentCollection =
    baseCollections.find((item) => item.slug === collectionSlug) ?? null;

  if (!currentRawCollection || !currentCollection) {
    return {
      collections: baseCollections,
      collection: null,
      products: [],
    };
  }

  const productsParams = new URLSearchParams();
  productsParams.set("filters[isActive][$eq]", "true");
  productsParams.set("sort[0]", "sortOrder:asc");
  productsParams.set("sort[1]", "title:asc");
  productsParams.set("populate[0]", "image");
  productsParams.set("populate[1]", "gallery");
  productsParams.set("populate[2]", "collection");
  productsParams.set("populate[3]", "variants");
  productsParams.set("populate[4]", "variants.media");
  productsParams.set("populate[5]", "assemblyInstructionFile");
  productsParams.set("pagination[pageSize]", "1000");

  const productsJson = await strapiFetch<{ data?: StrapiProduct[] }>(
    `/api/dealer-products?${productsParams.toString()}`,
  );

  const rawProducts = Array.isArray(productsJson?.data) ? productsJson.data : [];

  const productById = new Map<string, StrapiProduct>();
  rawProducts.forEach((item) => {
    const id = String(item.documentId ?? item.id ?? "");
    if (id) {
      productById.set(id, item);
    }
  });

  const baseProducts = rawProducts.map(normalizeProductBase);

  const visibleProducts = baseProducts.filter((item, index) => {
    const raw = rawProducts[index];
    return (raw.category ?? "").toLowerCase() !== "addon";
  });

  const addonParams = new URLSearchParams();
  addonParams.set("filters[isActive][$eq]", "true");
  addonParams.set("sort[0]", "sortOrder:asc");
  addonParams.set("populate[0]", "parentProduct");
  addonParams.set("populate[1]", "addonProduct");
  addonParams.set("populate[2]", "addonProduct.image");
  addonParams.set("populate[3]", "addonProduct.variants");
  addonParams.set("populate[4]", "addonProduct.variants.media");
  addonParams.set("pagination[pageSize]", "2000");

  const addonJson = await strapiFetch<{ data?: StrapiAddonRelation[] }>(
    `/api/dealer-product-addons?${addonParams.toString()}`,
  );

  const addonRelations = Array.isArray(addonJson?.data) ? addonJson.data : [];

  addonRelations.forEach((relation) => {
    const addonProduct = unwrapRelation(relation.addonProduct);
    const addonId = String(addonProduct?.documentId ?? addonProduct?.id ?? "");
    if (addonId && addonProduct && !productById.has(addonId)) {
      productById.set(addonId, addonProduct);
    }
  });

  const visibleProductIds = new Set(visibleProducts.map((item) => item.id));

  const relationsByParent = new Map<string, StrapiAddonRelation[]>();

  addonRelations.forEach((relation) => {
    const parent = unwrapRelation(relation.parentProduct);
    const parentId = String(parent?.documentId ?? parent?.id ?? "");
    if (!parentId) return;
    if (!visibleProductIds.has(parentId)) return;

    const list = relationsByParent.get(parentId) ?? [];
    list.push(relation);
    relationsByParent.set(parentId, list);
  });

  const allProducts = visibleProducts.map((product) =>
    withAddons(product, relationsByParent.get(product.id) ?? [], productById),
  );

  const finalCollections = rawCollections.map((item) => {
    const itemSlug = item.slug ?? "";

    const collectionProducts = allProducts.filter(
      (product) => product.collectionSlug === itemSlug,
    );

    return normalizeCollection(item, collectionProducts);
  });

  const finalCurrentCollection =
    finalCollections.find((item) => item.slug === collectionSlug) ?? null;

  return {
    collections: finalCollections,
    collection: finalCurrentCollection,
    products: allProducts,
  };
}