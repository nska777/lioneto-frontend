const STRAPI_URL =
  process.env.STRAPI_URL ||
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  "http://localhost:1337";

const STRAPI_TOKEN =
  process.env.STRAPI_DEALER_TOKEN ||
  process.env.STRAPI_API_TOKEN ||
  "";

export type DealerCountryCode = "RU" | "UZ" | "KZ" | "TJ";

export type DealerCategory =
  | "Спальни"
  | "Гостиные"
  | "Молодежные"
  | "Прихожие"
  | "Столы и стулья";

export type DealerCollection = {
  id: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  moduleCount: number;
  categories: DealerCategory[];
};

export type DealerProductPriceMap = Record<DealerCountryCode, number>;

export type DealerAddonKind = "required" | "recommended";
export type DealerAddonSelectionType = "toggle" | "quantity";
export type DealerProductVariantType = "color";

export type DealerProductVariant = {
  id: string;
  title: string;
  type: DealerProductVariantType;
  variantKey: string;
  image?: string;
  priceDelta: DealerProductPriceMap;
};

export type DealerFileAsset = {
  url: string;
  name?: string;
};

export type DealerAddon = {
  id: string;
  title: string;
  article?: string;
  articleShort?: string;
  description?: string;
  image?: string;
  kind: DealerAddonKind;
  selectionType: DealerAddonSelectionType;
  price: DealerProductPriceMap;
  defaultQuantity?: number;
  minQuantity?: number;
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
};

type StrapiMediaFormat = {
  url?: string;
};

type StrapiMedia = {
  id?: number;
  url?: string;
  name?: string;
  formats?: Record<string, StrapiMediaFormat>;
};

type StrapiMediaField =
  | StrapiMedia
  | { data?: StrapiMedia | null }
  | null
  | undefined;

type StrapiCollection = {
  id?: number;
  documentId?: string;
  title?: string;
  slug?: string;
  sortOrder?: number;
  isActive?: boolean;
  cover?: StrapiMediaField;
};

type StrapiVariant = {
  id?: number;
  documentId?: string;
  title?: string;
  type?: string;
  variantKey?: string;
  priceDeltaRUB?: number;
  priceDeltaUZS?: number;
  priceDeltaKZT?: number;
  priceDeltaTJS?: number;
  media?: StrapiMediaField;
  image?: StrapiMediaField;
};

type StrapiProduct = {
  id?: number;
  documentId?: string;
  title?: string;
  article?: string;
  articleShort?: string;
  slug?: string;
  description?: string;
  color?: string;
  size?: string;
  material?: string;
  assemblyInstructionTitle?: string;
  assemblyInstructionFile?: StrapiMediaField;
  image?: StrapiMediaField;
  gallery?: StrapiMediaField;
  category?: string;
  sortOrder?: number;
  isActive?: boolean;
  priceRU?: number;
  priceUZ?: number;
  priceKZ?: number;
  priceTJ?: number;
  variants?: StrapiVariant[];
  collection?:
    | StrapiCollection
    | { data?: StrapiCollection | null }
    | null;
};

type StrapiAddonRelation = {
  id?: number;
  documentId?: string;
  kind?: string;
  defaultQty?: number;
  sortOrder?: number;
  isActive?: boolean;
  parentProduct?:
    | StrapiProduct
    | { data?: StrapiProduct | null }
    | null;
  addonProduct?:
    | StrapiProduct
    | { data?: StrapiProduct | null }
    | null;
};

function getAuthHeaders(): HeadersInit {
  const headers: Record<string, string> = {};

  if (STRAPI_TOKEN) {
    headers.Authorization = `Bearer ${STRAPI_TOKEN}`;
  }

  return headers;
}

function toAbsoluteUrl(url?: string | null) {
  if (!url) return "/images/placeholder-product.jpg";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${STRAPI_URL}${url}`;
}

function toAbsoluteOptionalUrl(url?: string | null) {
  if (!url) return "";
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `${STRAPI_URL}${url}`;
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

function extractMediaUrl(media?: StrapiMediaField) {
  const actual = unwrapRelation(media);
  if (!actual) return "/images/placeholder-product.jpg";

  const preferred =
    actual.formats?.medium?.url ||
    actual.formats?.small?.url ||
    actual.url;

  return toAbsoluteUrl(preferred);
}

function extractMediaFile(media?: StrapiMediaField): DealerFileAsset | null {
  const actual = unwrapRelation(media);
  if (!actual?.url) return null;

  return {
    url: toAbsoluteOptionalUrl(actual.url),
    name: actual.name ?? "",
  };
}

function normalizeCategory(value?: string | null): DealerCategory {
  switch ((value ?? "").toLowerCase()) {
    case "bedroom":
      return "Спальни";
    case "living-room":
      return "Гостиные";
    case "youth":
      return "Молодежные";
    case "hallway":
      return "Прихожие";
    case "tables-chairs":
      return "Столы и стулья";
    default:
      return "Спальни";
  }
}

function mapPrices(product?: StrapiProduct | null): DealerProductPriceMap {
  return {
    RU: Number(product?.priceRU ?? 0),
    UZ: Number(product?.priceUZ ?? 0),
    KZ: Number(product?.priceKZ ?? 0),
    TJ: Number(product?.priceTJ ?? 0),
  };
}

function mapVariantPrices(
  variant?: StrapiVariant | null,
): DealerProductPriceMap {
  return {
    RU: Number(variant?.priceDeltaRUB ?? 0),
    UZ: Number(variant?.priceDeltaUZS ?? 0),
    KZ: Number(variant?.priceDeltaKZT ?? 0),
    TJ: Number(variant?.priceDeltaTJS ?? 0),
  };
}

function normalizeCollection(
  raw: StrapiCollection,
  products: DealerProduct[] = [],
): DealerCollection {
  const categories = Array.from(
    new Set(products.map((item) => item.category)),
  ) as DealerCategory[];

  return {
    id: String(raw.documentId ?? raw.id ?? ""),
    slug: raw.slug ?? "",
    title: raw.title ?? "",
    description: "",
    image: extractMediaUrl(raw.cover),
    moduleCount: products.length,
    categories,
  };
}

function normalizeVariant(raw: StrapiVariant): DealerProductVariant | null {
  const type = (raw.type ?? "").toLowerCase();

  if (type !== "color") return null;

  const variantMedia = raw.media ?? raw.image;

  return {
    id: String(raw.documentId ?? raw.id ?? raw.variantKey ?? raw.title ?? ""),
    title: raw.title ?? "",
    type: "color",
    variantKey: raw.variantKey ?? "",
    image: variantMedia ? extractMediaUrl(variantMedia) : undefined,
    priceDelta: mapVariantPrices(raw),
  };
}

function normalizeAddon(
  relation: StrapiAddonRelation,
  addonProduct: StrapiProduct,
): DealerAddon {
  const kind: DealerAddonKind =
    relation.kind === "required" ? "required" : "recommended";

  const variants = Array.isArray(addonProduct.variants)
    ? addonProduct.variants
        .map(normalizeVariant)
        .filter(Boolean) as DealerProductVariant[]
    : [];

  return {
    id: String(addonProduct.documentId ?? addonProduct.id ?? ""),
    title: addonProduct.title ?? "",
    article: addonProduct.article ?? "",
    articleShort: addonProduct.articleShort ?? "",
    description: addonProduct.description ?? "",
    image: extractMediaUrl(addonProduct.image),
    kind,
    selectionType: "quantity",
    defaultQuantity: Math.max(1, Number(relation.defaultQty ?? 1)),
    minQuantity: 1,
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
    ? raw.variants
        .map(normalizeVariant)
        .filter(Boolean) as DealerProductVariant[]
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
    .sort((a, b) => Number(a.sortOrder ?? 999) - Number(b.sortOrder ?? 999))
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

  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
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

export async function getDealerCollections(): Promise<DealerCollection[]> {
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
}

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

  const parentIds = visibleProducts.map((item) => item.id).filter(Boolean);

  let addonRelations: StrapiAddonRelation[] = [];

  if (parentIds.length > 0) {
    const addonParams = new URLSearchParams();
    addonParams.set("filters[isActive][$eq]", "true");
    addonParams.set("sort[0]", "sortOrder:asc");
    addonParams.set("populate[0]", "parentProduct");
    addonParams.set("populate[1]", "addonProduct");
    addonParams.set("populate[2]", "addonProduct.image");
    addonParams.set("populate[3]", "addonProduct.variants");
    addonParams.set("populate[4]", "addonProduct.variants.media");
    addonParams.set("pagination[pageSize]", "2000");

    parentIds.forEach((id, index) => {
      addonParams.set(
        `filters[$or][${index}][parentProduct][documentId][$eq]`,
        id,
      );
    });

    const addonJson = await strapiFetch<{ data?: StrapiAddonRelation[] }>(
      `/api/dealer-product-addons?${addonParams.toString()}`,
    );

    addonRelations = Array.isArray(addonJson?.data) ? addonJson.data : [];
  }

  addonRelations.forEach((relation) => {
    const addonProduct = unwrapRelation(relation.addonProduct);
    const addonId = String(addonProduct?.documentId ?? addonProduct?.id ?? "");
    if (addonId && addonProduct && !productById.has(addonId)) {
      productById.set(addonId, addonProduct);
    }
  });

  const relationsByParent = new Map<string, StrapiAddonRelation[]>();

  addonRelations.forEach((relation) => {
    const parent = unwrapRelation(relation.parentProduct);
    const parentId = String(parent?.documentId ?? parent?.id ?? "");
    if (!parentId) return;

    const list = relationsByParent.get(parentId) ?? [];
    list.push(relation);
    relationsByParent.set(parentId, list);
  });

  const allProducts = visibleProducts.map((product) =>
    withAddons(product, relationsByParent.get(product.id) ?? [], productById),
  );

  const currentCollectionProducts = allProducts.filter(
    (product) => product.collectionSlug === collectionSlug,
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