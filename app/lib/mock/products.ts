// app/lib/mock/products.ts
import { BRANDS, CATALOG_MOCK } from "./catalog-products";

export type ProductMock = {
  id: string;
  title: string;
  href: string;
  image: string;
  sku?: string;
  badge?: string;

  // ✅ коллекция
  brand?: string; // slug: "scandi"
  collectionLabel?: string; // "SCANDI"

  price: {
    rub: number;
    uzs: number;
  };
};

export const PRODUCTS_MOCK: ProductMock[] = (CATALOG_MOCK as any[]).map((p) => {
  const id = String(p.id);

  const brandSlug = String(p.brand ?? "").trim().toLowerCase();
  const collectionLabel =
    BRANDS.find((b) => String(b.slug).toLowerCase() === brandSlug)?.title ??
    (brandSlug ? brandSlug.toUpperCase() : "");

  return {
    id,
    title: String(p.title ?? ""),

    // ✅ ВАЖНО: товар всегда открываем на /product/[id]
    // Если вдруг где-то вручную задан p.href — используем его, иначе дефолт.
    href: String(p.href ?? `/product/${id}`),

    image: String(p.image ?? ""),

    sku: p.sku ? String(p.sku) : p.skuLabel ? String(p.skuLabel) : undefined,
    badge: p.badge ? String(p.badge) : undefined,

    brand: brandSlug || undefined,
    collectionLabel: collectionLabel || undefined,

    price: {
      rub: Number(p.price_rub ?? p.priceRUB ?? 0),
      uzs: Number(p.price_uzs ?? p.priceUZS ?? 0),
    },
  };
});

export const byId = new Map<string, ProductMock>(
  PRODUCTS_MOCK.map((p) => [p.id, p]),
);
