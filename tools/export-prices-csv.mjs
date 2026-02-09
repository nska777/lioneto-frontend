import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ⬇️ путь от tools/ до catalog-products
const mod = await import("../app/lib/mock/catalog-products.js");
const CATALOG_MOCK = mod.CATALOG_MOCK ?? [];

function num(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

const header = [
  "productId",
  "price_uzs",
  "old_price_uzs",
  "price_rub",
  "old_price_rub",
];

const rows = [header.join(",")];

for (const p of CATALOG_MOCK) {
  const productId = String(p.id);

  const price_uzs = num(p.price_uzs ?? p.priceUZS ?? 0);
  const price_rub = num(p.price_rub ?? p.priceRUB ?? 0);

  rows.push([
    productId,
    price_uzs,
    "",
    price_rub,
    "",
  ].join(","));
}

const outPath = path.join(process.cwd(), "prices.csv");
fs.writeFileSync(outPath, rows.join("\n"), "utf8");

console.log("✅ prices.csv created");
