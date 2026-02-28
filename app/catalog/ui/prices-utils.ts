export type PriceRow = {
  productId: string;
  price_uzs?: number | null;
  old_price_uzs?: number | null;
  price_rub?: number | null;
  old_price_rub?: number | null;
};

function discountPct(oldP: number, newP: number) {
  if (!oldP || !newP) return 0;
  if (oldP <= newP) return 0;
  return Math.round((1 - newP / oldP) * 100);
}

type UnknownRecord = Record<string, unknown>;

function isRecord(v: unknown): v is UnknownRecord {
  return typeof v === "object" && v !== null;
}

function getNumNullable(obj: UnknownRecord, key: string): number | null | undefined {
  const v = obj[key];
  if (v === null) return null;
  if (typeof v === "number") return v;
  return undefined;
}

function getNum(obj: UnknownRecord, key: string): number | undefined {
  const v = obj[key];
  return typeof v === "number" ? v : undefined;
}

function getStr(obj: UnknownRecord, key: string): string | undefined {
  const v = obj[key];
  return typeof v === "string" ? v : undefined;
}

export function applyPrices<T extends UnknownRecord>(
  items: T[],
  rows: PriceRow[]
): T[] {
  const map = new Map<string, PriceRow>();
  for (const r of rows) {
    const key = String(r.productId || "").trim();
    if (key) map.set(key, r);
  }

  return items.map((p) => {
    const id = getStr(p, "id");
    const r = map.get(String(id ?? ""));
    if (!r) return p;


    const p_price_uzs = getNumNullable(p, "price_uzs") ?? getNum(p, "priceUZS") ?? 0;
    const p_price_rub = getNumNullable(p, "price_rub") ?? getNum(p, "priceRUB") ?? 0;

    const p_old_uzs = getNumNullable(p, "old_price_uzs") ?? null;
    const p_old_rub = getNumNullable(p, "old_price_rub") ?? null;


    const next = {
      ...p,
      price_uzs: r.price_uzs ?? p_price_uzs,
      price_rub: r.price_rub ?? p_price_rub,
      old_price_uzs: r.old_price_uzs ?? p_old_uzs,
      old_price_rub: r.old_price_rub ?? p_old_rub,
    };


    const nextRec: UnknownRecord = isRecord(next) ? next : ({} as UnknownRecord);

    const cur =
      Number(getNumNullable(nextRec, "price_rub") ?? 0) ||
      Number(getNumNullable(nextRec, "price_uzs") ?? 0) ||
      0;

    const old =
      Number(getNumNullable(nextRec, "old_price_rub") ?? 0) ||
      Number(getNumNullable(nextRec, "old_price_uzs") ?? 0) ||
      0;

    const out = {
      ...next,
      discountPct: discountPct(old, cur),
    };


    return out as T;
  });
}