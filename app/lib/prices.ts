// app/lib/prices.ts
export type PriceEntry = {
  id?: number;
  documentId?: string;

  productId: string | number;

  title?: string;

  priceUZS?: number;
  priceRUB?: number;

  oldPriceUZS?: number;
  oldPriceRUB?: number;

  hasDiscount?: boolean;
  collectionBadge?: string;
  isActive?: boolean;

  cardImage?: any;

  createdAt?: string;
  updatedAt?: string;
  publishedAt?: string;
};

function getStrapiBase(): string {
  const raw = (process.env.NEXT_PUBLIC_STRAPI_URL || "").trim();

  // dev fallback (локально)
  if (!raw && process.env.NODE_ENV !== "production") {
    return "http://localhost:1337";
  }

  return raw ? raw.replace(/\/$/, "") : "";
}

function asStr(v: any) {
  return String(v ?? "").trim();
}

function addToMap(map: Map<string, PriceEntry>, key: any, row: PriceEntry) {
  const k = asStr(key);
  if (!k) return;
  map.set(k, row);
  map.set(k.toLowerCase(), row);
  if (/^\d+$/.test(k)) {
    map.set(String(Number(k)), row);
  }
}

// TEST_MODE:
// - false (prod): берём только isActive=true
// - true  (local): берём ВСЁ, но если есть isActive=false (тестовые) — они имеют приоритет
const TEST_MODE = process.env.NEXT_PUBLIC_STRAPI_TEST_MODE === "true";

async function fetchAllPriceEntries(): Promise<PriceEntry[]> {
  const base = getStrapiBase();
  if (!base) return [];

  // pageSize можно большой — у тебя total=98, это точно влезает
  const pageSize = 250;

  const filters = TEST_MODE ? "" : "&filters[isActive][$eq]=true";
  const url = `${base}/api/price-entries?pagination[page]=1&pagination[pageSize]=${pageSize}${filters}`;

  try {
    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) return [];

    const json = await res.json();
    const data = Array.isArray(json?.data) ? json.data : [];
    return data as PriceEntry[];
  } catch {
    return [];
  }
}

export async function fetchPricesMap(): Promise<Map<string, PriceEntry>> {
  const list = await fetchAllPriceEntries();

  // сортировка, чтобы в TEST_MODE “тестовые” (isActive=false) могли переопределять активные
  const sorted = [...list].sort((a: any, b: any) => {
    if (TEST_MODE) {
      const aTest = a?.isActive === false ? 0 : 1;
      const bTest = b?.isActive === false ? 0 : 1;
      if (aTest !== bTest) return aTest - bTest;
    }
    const au = Date.parse(a?.updatedAt || a?.createdAt || "") || 0;
    const bu = Date.parse(b?.updatedAt || b?.createdAt || "") || 0;
    return bu - au;
  });

  const map = new Map<string, PriceEntry>();

  for (const item of sorted) {
    const row: PriceEntry = item; // у тебя формат “без attributes”

    // ключи, по которым будем находить
    addToMap(map, row.productId, row);
    addToMap(map, row.id, row);
    addToMap(map, (row as any).slug, row);
    addToMap(map, (row as any).handle, row);
    addToMap(map, (row as any).sku, row);
  }

  return map;
}
