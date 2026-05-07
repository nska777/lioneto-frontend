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

  /**
   * Новые поля из общего Excel/Strapi каталога.
   * Они не ломают старую логику, но позволяют дилерскому shop
   * автоматически подтягивать артикул/размер/материал варианта.
   */
  variantSku?: string;
  article?: string;
  articleShort?: string;
  size?: string;
  material?: string;
};

export type DealerAddonGroupSelection = "single" | "multiple";

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

  groupKey?: string;
  groupTitle?: string;
  groupSelection?: DealerAddonGroupSelection;
  groupOrder?: number;
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

type UnknownRecord = Record<string, unknown>;

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
  cover?: StrapiMedia | { data?: StrapiMedia | null } | null;
  isActive?: boolean;
};

type StrapiProductVariant = {
  id?: number;
  documentId?: string;

  key?: string;
  label?: string;
  color?: string;
  media?: StrapiMedia | { data?: StrapiMedia | null } | null;
  image?: StrapiMedia | { data?: StrapiMedia | null } | null;

  variantKey?: string;
  variantSku?: string;
  variantSkuRaw?: string;
  title?: string;
  size?: string;
  material?: string;
  description?: string;

  priceRU?: number | string | null;
  priceUZ?: number | string | null;
  priceKZ?: number | string | null;
  priceTJ?: number | string | null;

  priceRUB?: number | string | null;
  priceUZS?: number | string | null;
  priceKZT?: number | string | null;
  priceTJS?: number | string | null;

  price_rub?: number | string | null;
  price_uzs?: number | string | null;

  dealerPriceRUB?: number | string | null;
  dealerPriceUZS?: number | string | null;
  dealerPriceKZ?: number | string | null;
  dealerPriceTJ?: number | string | null;

  dealer_price_rub?: number | string | null;
  dealer_price_uzs?: number | string | null;

  priceDeltaRUB?: number | string | null;
  priceDeltaUZS?: number | string | null;

  isActive?: boolean;
  isActiveUZ?: boolean;
  isActiveRU?: boolean;
  isDealerActive?: boolean;
};

type StrapiSetItem = {
  id?: string | number;
  itemSku?: string;
  sku?: string;
  title?: string;
  slug?: string;
  article?: string;
  articleShort?: string;
  description?: string;
  note?: string;

  quantity?: number | string | null;

  priceUZS?: number | string | null;
  priceRUB?: number | string | null;
  priceKZ?: number | string | null;
  priceTJ?: number | string | null;

  price_uzs?: number | string | null;
  price_rub?: number | string | null;

  dealerPriceUZS?: number | string | null;
  dealerPriceRUB?: number | string | null;
  dealerPriceKZ?: number | string | null;
  dealerPriceTJ?: number | string | null;

  dealer_price_uzs?: number | string | null;
  dealer_price_rub?: number | string | null;

  groupKey?: string;
  groupTitle?: string;
  groupOrder?: number | string | null;

  selectionType?: string;
  isRequired?: boolean | string | number | null;
  itemKind?: string;

  addsToArticle?: boolean | string | number | null;
  articleJoinRule?: string | null;
  affectsImage?: boolean | string | number | null;

  color?: string;
  colorKey?: string;
  size?: string;
  material?: string;
  optionKey?: string;

  image?: string | StrapiMedia | { data?: StrapiMedia | null } | null;
  imageFile?: string | null;

  assembledImage?: string | StrapiMedia | { data?: StrapiMedia | null } | null;
  assembledImageFile?: string | null;

  sortOrder?: number | string | null;

  isActive?: boolean;
  isActiveUZ?: boolean;
  isActiveRU?: boolean;
  isDealerActive?: boolean;
};

type StrapiProduct = {
  id?: number;
  documentId?: string;

  title?: string;
  slug?: string;
  sku?: string;
  article?: string;
  articleShort?: string;
  description?: string;

  category?: string;
  cat?: string;
  module?: string;
  brand?: string;
  collection?:
    | string
    | StrapiCollection
    | { data?: StrapiCollection | null }
    | null;

  color?: string;
  size?: string;
  material?: string;

  image?: StrapiMedia | { data?: StrapiMedia | null } | null;
  media?: StrapiMedia | { data?: StrapiMedia | null } | null;
  gallery?: StrapiMedia[] | { data?: StrapiMedia[] | null } | null;

  variants?: StrapiProductVariant[];

  set_items_json?: unknown;
  setItemsJson?: unknown;

  assemblyInstructionTitle?: string;
  assemblyInstructionFile?:
    | StrapiMedia
    | { data?: StrapiMedia | null }
    | null;

  priceRU?: number | string | null;
  priceUZ?: number | string | null;
  priceKZ?: number | string | null;
  priceTJ?: number | string | null;

  priceRUB?: number | string | null;
  priceUZS?: number | string | null;
  priceKZT?: number | string | null;
  priceTJS?: number | string | null;

  price_rub?: number | string | null;
  price_uzs?: number | string | null;

  dealerPriceRUB?: number | string | null;
  dealerPriceUZS?: number | string | null;
  dealerPriceKZ?: number | string | null;
  dealerPriceTJ?: number | string | null;

  dealer_price_rub?: number | string | null;
  dealer_price_uzs?: number | string | null;

  isActive?: boolean;
  isActiveUZ?: boolean;
  isActiveRU?: boolean;
  isDealerActive?: boolean;
  publishedAt?: string | null;

  stockQty?: number | string | null;
  reservedQty?: number | string | null;
  isStockTracked?: boolean;
};

const STRAPI_URL = (
  process.env.STRAPI_URL ||
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  "http://localhost:1337"
).replace(/\/+$/, "");

function getAuthHeaders(): { Authorization?: string } {
  const token =
    process.env.STRAPI_DEALER_TOKEN ||
    process.env.STRAPI_API_TOKEN ||
    process.env.STRAPI_READONLY_TOKEN ||
    "";

  return token ? { Authorization: `Bearer ${token}` } : {};
}

function isRecord(value: unknown): value is UnknownRecord {
  return typeof value === "object" && value !== null;
}

function unwrapAttributes<T extends UnknownRecord>(value: T): T {
  const attrs = value.attributes;

  if (isRecord(attrs)) {
    return {
      ...value,
      ...attrs,
    } as T;
  }

  return value;
}

function unwrapRelation<T>(value?: T | { data?: T | null } | null): T | null {
  if (!value) return null;

  if (typeof value === "object" && value !== null && "data" in value) {
    return value.data ?? null;
  }

  return value as T;
}

function getString(value: unknown) {
  return String(value ?? "").trim();
}

function normalizeSlug(value: unknown) {
  const raw = getString(value)
    .toLowerCase()
    .replace(/ё/g, "e")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-")
    .trim();

  if (raw === "scandy") return "scandi";
  return raw;
}

function normalizeBrandForDealer(value: unknown) {
  const slug = normalizeSlug(value);

  if (slug === "scandy") return "scandi";
  if (slug === "scandi") return "scandi";

  return slug;
}

function toNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string") {
    const clean = value
      .replace(/\u00A0/g, " ")
      .replace(/\u202F/g, " ")
      .replace(/\s+/g, "")
      .trim();

    if (!clean) return 0;

    if (/^\d{1,3}(,\d{3})+$/.test(clean)) {
      const n = Number(clean.replace(/,/g, ""));
      return Number.isFinite(n) ? n : 0;
    }

    if (/^\d{1,3}(\.\d{3})+$/.test(clean)) {
      const n = Number(clean.replace(/\./g, ""));
      return Number.isFinite(n) ? n : 0;
    }

    const n = Number(clean.replace(/,/g, "."));
    return Number.isFinite(n) ? n : 0;
  }

  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
}

function toBool(value: unknown, fallback = false) {
  if (typeof value === "boolean") return value;

  if (typeof value === "number") {
    if (value === 1) return true;
    if (value === 0) return false;
  }

  const s = getString(value).toLowerCase();

  if (["true", "yes", "y", "1", "да", "истина"].includes(s)) return true;
  if (["false", "no", "n", "0", "нет", "ложь"].includes(s)) return false;

  return fallback;
}

function mapDealerPrices(raw: {
  priceRU?: unknown;
  priceUZ?: unknown;
  priceKZ?: unknown;
  priceTJ?: unknown;

  priceRUB?: unknown;
  priceUZS?: unknown;
  priceKZT?: unknown;
  priceTJS?: unknown;

  price_rub?: unknown;
  price_uzs?: unknown;

  dealerPriceRUB?: unknown;
  dealerPriceUZS?: unknown;
  dealerPriceKZ?: unknown;
  dealerPriceTJ?: unknown;

  dealer_price_rub?: unknown;
  dealer_price_uzs?: unknown;
}): DealerProductPriceMap {
  const retailRU = toNumber(raw.priceRU ?? raw.priceRUB ?? raw.price_rub);
  const retailUZ = toNumber(raw.priceUZ ?? raw.priceUZS ?? raw.price_uzs);
  const retailKZ = toNumber(raw.priceKZ ?? raw.priceKZT);
  const retailTJ = toNumber(raw.priceTJ ?? raw.priceTJS);

  const dealerRU = toNumber(raw.dealerPriceRUB ?? raw.dealer_price_rub);
  const dealerUZ = toNumber(raw.dealerPriceUZS ?? raw.dealer_price_uzs);
  const dealerKZ = toNumber(raw.dealerPriceKZ);
  const dealerTJ = toNumber(raw.dealerPriceTJ);

  /**
   * Сейчас по твоей задаче:
   * dealerPriceUZS может быть пустой.
   * Российские дилерские цены должны подтянуться из dealerPriceRUB.
   *
   * Поэтому:
   * - если dealerPrice есть — берём его;
   * - если dealerPrice пустой — временно fallback на retail price,
   *   чтобы магазин не вставал.
   */
  return {
    RU: dealerRU > 0 ? dealerRU : retailRU,
    UZ: dealerUZ > 0 ? dealerUZ : retailUZ,
    KZ: dealerKZ > 0 ? dealerKZ : retailKZ,
    TJ: dealerTJ > 0 ? dealerTJ : retailTJ,
  };
}

function hasAnyPrice(price: DealerProductPriceMap) {
  return price.RU > 0 || price.UZ > 0 || price.KZ > 0 || price.TJ > 0;
}

function withAbsoluteUrl(url?: string | null) {
  const clean = String(url ?? "").trim();
  if (!clean) return "";

  if (clean.startsWith("http://") || clean.startsWith("https://")) {
    return clean;
  }

  if (clean.startsWith("/")) {
    return `${STRAPI_URL}${clean}`;
  }

  return `${STRAPI_URL}/${clean}`;
}

function extractMediaUrl(
  value?: string | StrapiMedia | { data?: StrapiMedia | null } | null,
) {
  if (typeof value === "string") {
    return withAbsoluteUrl(value);
  }

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

function normalizeCategory(value?: string | null): DealerCategory {
  const normalized = normalizeSlug(value);

  if (normalized === "bedroom" || normalized === "bedrooms") return "bedroom";
  if (normalized === "living") return "living";

  if (
    normalized === "children" ||
    normalized === "childrens" ||
    normalized === "youth"
  ) {
    return "children";
  }

  if (normalized === "cabinet") return "cabinet";

  if (normalized === "mattress" || normalized === "mattresses") {
    return "mattress";
  }

  if (normalized === "decor" || normalized === "fasadi") return "decor";
  if (normalized === "addon") return "addon";

  return "other";
}

function normalizeCollection(
  rawInput: StrapiCollection,
  products?: DealerProduct[],
): DealerCollection {
  const raw = unwrapAttributes(
    rawInput as unknown as UnknownRecord,
  ) as StrapiCollection;

  return {
    id: String(raw.documentId ?? raw.id ?? ""),
    slug: normalizeBrandForDealer(raw.slug ?? ""),
    title: raw.title ?? "",
    description: raw.description ?? "",
    coverImage: extractMediaUrl(raw.cover),
    sortOrder: toNumber(raw.sortOrder),
    products: products ?? [],
  };
}

function normalizeVariant(
  rawInput: StrapiProductVariant | null | undefined,
): DealerProductVariant | null {
  if (!rawInput) return null;

  const raw = unwrapAttributes(
    rawInput as unknown as UnknownRecord,
  ) as StrapiProductVariant;

  if (raw.isActive === false) return null;
  if (raw.isDealerActive === false) return null;

  const key = getString(raw.variantKey ?? raw.key ?? raw.documentId ?? raw.id);

  if (!key) return null;

  const label = getString(raw.label ?? raw.color ?? raw.title ?? key);
  const image = extractMediaUrl(raw.image) || extractMediaUrl(raw.media);
  const price = mapDealerPrices(raw);

  const variantSku = getString(raw.variantSku || raw.variantSkuRaw || "");
  const article = variantSku || getString(raw.title || key);
  const articleShort = variantSku || article;

  return {
    key,
    label,
    color: getString(raw.color || label),
    image,
    price,
    variantSku,
    article,
    articleShort,
    size: getString(raw.size),
    material: getString(raw.material),
  };
}

function normalizeSetItemsJson(value: unknown): StrapiSetItem[] {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value.filter(isRecord) as StrapiSetItem[];
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter(isRecord) : [];
    } catch {
      return [];
    }
  }

  return [];
}

function isSceneProduct(raw: StrapiProduct) {
  const moduleSlug = normalizeSlug(raw.module);
  const slug = normalizeSlug(raw.slug);

  return moduleSlug === "scene" || slug.startsWith("scene-");
}

function getProductCollectionSlug(raw: StrapiProduct) {
  const brand = normalizeBrandForDealer(raw.brand);

  if (brand) return brand;

  if (typeof raw.collection === "string") {
    return normalizeBrandForDealer(raw.collection);
  }

  const collection = unwrapRelation(raw.collection);

  if (collection?.slug) {
    return normalizeBrandForDealer(collection.slug);
  }

  return "";
}

function getProductCategory(raw: StrapiProduct): DealerCategory {
  return normalizeCategory(raw.category || raw.cat || raw.module);
}

function getProductArticle(raw: StrapiProduct) {
  return getString(raw.article || raw.articleShort || raw.sku || raw.slug);
}

function getProductImage(raw: StrapiProduct) {
  return extractMediaUrl(raw.image) || extractMediaUrl(raw.media);
}

function normalizeSetItemAsAddon(
  rawItem: StrapiSetItem,
  index: number,
): DealerAddon | null {
  if (rawItem.isActive === false) return null;
  if (rawItem.isDealerActive === false) return null;

  const id =
    getString(rawItem.id) ||
    getString(rawItem.itemSku) ||
    getString(rawItem.sku) ||
    getString(rawItem.article) ||
    `set-item-${index}`;

  if (!id) return null;

  const isRequired = toBool(rawItem.isRequired, false);
  const kind: "required" | "recommended" = isRequired
    ? "required"
    : "recommended";

  const rawSelection = normalizeSlug(rawItem.selectionType || "");
  const selectionType: "toggle" | "quantity" =
    rawSelection === "quantity" ? "quantity" : "toggle";

  const groupSelection: DealerAddonGroupSelection =
    rawSelection === "multiple" || rawSelection === "quantity"
      ? "multiple"
      : "single";

  const quantity = Math.max(1, toNumber(rawItem.quantity || 1));

  const image =
    extractMediaUrl(rawItem.image) ||
    withAbsoluteUrl(rawItem.imageFile || "") ||
    extractMediaUrl(rawItem.assembledImage) ||
    withAbsoluteUrl(rawItem.assembledImageFile || "");

  const price = mapDealerPrices(rawItem);

  return {
    id,
    title: getString(rawItem.title || rawItem.itemSku || rawItem.article || id),
    article: getString(rawItem.article || rawItem.itemSku || rawItem.sku || id),
    articleShort: getString(
      rawItem.articleShort || rawItem.article || rawItem.itemSku || id,
    ),
    description: getString(rawItem.description || rawItem.note),
    image,
    kind,
    selectionType,
    defaultQuantity: quantity,
    minQuantity: 1,
    price,
    color: getString(rawItem.color || rawItem.colorKey),
    size: getString(rawItem.size),
    material: getString(rawItem.material),
    variants: [],
    groupKey: getString(rawItem.groupKey) || undefined,
    groupTitle: getString(rawItem.groupTitle) || undefined,
    groupSelection,
    groupOrder: toNumber(rawItem.groupOrder),
  };
}

function normalizeProductBase(rawInput: StrapiProduct): DealerProduct | null {
  const raw = unwrapAttributes(
    rawInput as unknown as UnknownRecord,
  ) as StrapiProduct;

  if (raw.isActive === false) return null;
  if (raw.isDealerActive === false) return null;
  if (raw.publishedAt === null) return null;

  /**
   * Scene-карточки нужны публичному каталогу,
   * но в dealer shop дилер заказывает конкретные модули.
   */
  if (isSceneProduct(raw)) return null;

  const price = mapDealerPrices(raw);
  if (!hasAnyPrice(price)) return null;

  const collectionSlug = getProductCollectionSlug(raw);
  if (!collectionSlug) return null;

  const variants = Array.isArray(raw.variants)
    ? (raw.variants
        .map(normalizeVariant)
        .filter(Boolean) as DealerProductVariant[])
    : [];

  const setItems = normalizeSetItemsJson(raw.set_items_json ?? raw.setItemsJson);

  const requiredItems: DealerAddon[] = [];
  const recommendedItems: DealerAddon[] = [];

  setItems
    .map(normalizeSetItemAsAddon)
    .filter(Boolean)
    .sort((a, b) => {
      const ga = toNumber(a?.groupOrder);
      const gb = toNumber(b?.groupOrder);

      if (ga !== gb) return ga - gb;

      const ta = a?.title ?? "";
      const tb = b?.title ?? "";

      return ta.localeCompare(tb, "ru");
    })
    .forEach((addon) => {
      if (!addon) return;

      if (addon.kind === "required") {
        requiredItems.push(addon);
      } else {
        recommendedItems.push(addon);
      }
    });

  return {
    id: String(raw.documentId ?? raw.id ?? raw.slug ?? ""),
    collectionSlug,
    category: getProductCategory(raw),
    title: raw.title ?? "",
    article: getProductArticle(raw),
    articleShort: getString(raw.articleShort || raw.sku || raw.article),
    image: getProductImage(raw),
    description: raw.description ?? "",
    price,
    color: raw.color ?? "",
    size: raw.size ?? "",
    material: raw.material ?? "",
    assemblyInstructionTitle: raw.assemblyInstructionTitle ?? "",
    assemblyInstructionFile: extractMediaFile(raw.assemblyInstructionFile),
    variants,
    requiredItems,
    recommendedItems,
    addons: [...requiredItems, ...recommendedItems],
    stockQty: Math.max(0, toNumber(raw.stockQty)),
    reservedQty: Math.max(0, toNumber(raw.reservedQty)),
    isStockTracked: Boolean(raw.isStockTracked),
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
    cache: "no-store",
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

async function getDealerProductsFromCatalog(): Promise<DealerProduct[]> {
  const params = new URLSearchParams();

  /**
   * Новый источник дилерского shop:
   * общий Excel-driven catalog.
   */
  params.set("filters[isActive][$eq]", "true");
  params.set("sort[0]", "sortOrder:asc");
  params.set("sort[1]", "title:asc");
  params.set("populate", "*");
  params.set("pagination[pageSize]", "1000");

  const json = await strapiFetch<{ data?: StrapiProduct[] }>(
    `/api/products?${params.toString()}`,
  );

  const rows = Array.isArray(json?.data) ? json.data : [];

  return rows
    .map(normalizeProductBase)
    .filter(Boolean) as DealerProduct[];
}

export async function getDealerCollectionPageData(
  collectionSlug: string,
): Promise<{
  collections: DealerCollection[];
  collection: DealerCollection | null;
  products: DealerProduct[];
}> {
  const baseCollections = await getDealerCollections();

  const normalizedCollectionSlug = normalizeBrandForDealer(collectionSlug);

  const currentCollection =
    baseCollections.find(
      (item) => normalizeBrandForDealer(item.slug) === normalizedCollectionSlug,
    ) ?? null;

  if (!currentCollection) {
    return {
      collections: baseCollections,
      collection: null,
      products: [],
    };
  }

  const allProducts = await getDealerProductsFromCatalog();

  const productsForCurrentCollection = allProducts.filter(
    (product) =>
      normalizeBrandForDealer(product.collectionSlug) ===
      normalizedCollectionSlug,
  );

  const finalCollections = baseCollections.map((collection) => {
    const collectionSlugNormalized = normalizeBrandForDealer(collection.slug);

    const collectionProducts = allProducts.filter(
      (product) =>
        normalizeBrandForDealer(product.collectionSlug) ===
        collectionSlugNormalized,
    );

    return {
      ...collection,
      products: collectionProducts,
    };
  });

  const finalCurrentCollection =
    finalCollections.find(
      (item) => normalizeBrandForDealer(item.slug) === normalizedCollectionSlug,
    ) ?? null;

  return {
    collections: finalCollections,
    collection: finalCurrentCollection,
    products: productsForCurrentCollection,
  };
}