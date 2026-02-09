import { notFound } from "next/navigation";
import ProductClient from "./ui/ProductClient";

// ✅ единый источник правды (моки каталога)
import { BRANDS, CATALOG_MOCK } from "@/app/lib/mock/catalog-products";

function norm(v: any) {
  return String(v ?? "")
    .trim()
    .toLowerCase();
}

function pickRandomUnique<T>(arr: T[], n: number) {
  const a = [...arr];

  // Fisher–Yates
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }

  return a.slice(0, n);
}

/** ================= Strapi fetch: price-entry ================= */

type StrapiPriceEntry = {
  productId?: string | null;
  title?: string | null;

  priceUZS?: number | null;
  priceRUB?: number | null;

  oldPriceUZS?: number | null;
  oldPriceRUB?: number | null;

  hasDiscount?: boolean | null;
  collectionBadge?: string | null;
  isActive?: boolean | null;
};

async function getPriceEntryByProductId(
  productId: string,
): Promise<StrapiPriceEntry | null> {
  // ✅ ЖЕЛЕЗНЫЙ base, чтобы локально точно работало
  const base =
    process.env.NEXT_PUBLIC_STRAPI_URL ||
    process.env.STRAPI_URL ||
    "http://localhost:1337";

  const url =
    `${base.replace(/\/$/, "")}` +
    `/api/price-entries?filters[productId][$eq]=${encodeURIComponent(productId)}`;

  try {
    const res = await fetch(url, { cache: "no-store" });

    // ✅ смотри это в терминале где `npm run dev`
    console.log("[price-entry] GET", url, "->", res.status);

    if (!res.ok) return null;

    const json = await res.json();
    const item = json?.data?.[0];
    if (!item) return null;

    // ✅ у тебя данные прямо в item (без attributes)
    const a = item;

    const toNum = (v: any) => {
      const n = Number(v);
      return Number.isFinite(n) ? n : null;
    };

    return {
      productId: a?.productId ?? null,
      title: a?.title ?? null,

      priceUZS: a?.priceUZS !== undefined ? toNum(a.priceUZS) : null,
      priceRUB: a?.priceRUB !== undefined ? toNum(a.priceRUB) : null,

      oldPriceUZS: a?.oldPriceUZS !== undefined ? toNum(a.oldPriceUZS) : null,
      oldPriceRUB: a?.oldPriceRUB !== undefined ? toNum(a.oldPriceRUB) : null,

      hasDiscount: typeof a?.hasDiscount === "boolean" ? a.hasDiscount : null,
      collectionBadge:
        a?.collectionBadge !== undefined ? String(a.collectionBadge) : null,
      isActive: typeof a?.isActive === "boolean" ? a.isActive : null,
    };
  } catch (e) {
    console.log("[price-entry] ERROR", url, e);
    return null;
  }
}

/** ================= Page ================= */

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const p = (CATALOG_MOCK as any[]).find((x) => String(x.id) === String(id));
  if (!p) return notFound();

  // ✅ подтягиваем Strapi по productId = params.id
  const s = await getPriceEntryByProductId(String(id)).catch(() => null);

  // ✅ нормализуем галерею (база)
  const galleryBase = (
    Array.isArray(p.gallery) && p.gallery.length
      ? p.gallery
      : [p.image, p.image, p.image, p.image]
  )
    .map(String)
    .filter(Boolean);

  // ✅ нормализуем variants (если есть)
  const variants = Array.isArray(p.variants)
    ? (p.variants as any[])
        .map((v) => ({
          id: String(v?.id ?? ""),
          title: String(v?.title ?? ""),
          kind: v?.kind === "color" || v?.kind === "option" ? v.kind : "option",
          priceDeltaRUB:
            v?.priceDeltaRUB !== undefined
              ? Number(v.priceDeltaRUB)
              : undefined,
          priceDeltaUZS:
            v?.priceDeltaUZS !== undefined
              ? Number(v.priceDeltaUZS)
              : undefined,
          image: v?.image ? String(v.image) : undefined,
          gallery: Array.isArray(v?.gallery)
            ? v.gallery.map(String).filter(Boolean)
            : undefined,
        }))
        .filter((v) => v.id && v.title)
    : [];

  // ✅ коллекция (бренд)
  const brandSlug = norm(p.brand);
  const brandLabel =
    BRANDS.find((b) => norm(b.slug) === brandSlug)?.title ??
    (brandSlug ? brandSlug.toUpperCase() : "");

  // ✅ УМНЫЕ "С ЭТИМ ТОВАРОМ ПОКУПАЮТ"
  const poolAll = (CATALOG_MOCK as any[]).filter(
    (x) => String(x.id) !== String(p.id),
  );

  const room0 = norm(
    p.menu ?? p.room ?? p.section ?? p.category ?? p.room_slug,
  );
  const type0 = norm(p.type ?? p.module ?? p.kind ?? p.item_type);

  const sameBrand = poolAll.filter((x) => norm(x.brand) === brandSlug);
  const sameType = poolAll.filter(
    (x) => norm(x.type ?? x.module ?? x.kind ?? x.item_type) === type0,
  );
  const sameRoom = poolAll.filter(
    (x) =>
      norm(x.menu ?? x.room ?? x.section ?? x.category ?? x.room_slug) ===
      room0,
  );

  let relatedPool = [...sameBrand, ...sameType, ...sameRoom];

  // убрали дубли
  const uniq = new Map<string, any>();
  for (const x of relatedPool) uniq.set(String(x.id), x);
  relatedPool = Array.from(uniq.values());

  // берем до 4 похожих
  let picked = pickRandomUnique(relatedPool, 4);

  // добиваем рандомом, если не хватило
  if (picked.length < 4) {
    const used = new Set(picked.map((x) => String(x.id)));
    const rest = poolAll.filter((x) => !used.has(String(x.id)));
    picked = [...picked, ...pickRandomUnique(rest, 4 - picked.length)];
  }

  const fallbackSku = p.sku || `T${String(p.id).padStart(4, "0")}`;

  // ✅ финальная модель: база из моков + price-entry из Strapi
  const product = {
    id: String(p.id),

    title: (s?.title ?? p.title) || "—",

    badge: String(p.badge ?? ""),
    collectionBadge: s?.collectionBadge ?? null,
    hasDiscount: s?.hasDiscount ?? null,

    href: p.href || `/product/${p.id}`,
    sku: String(fallbackSku),

    image: String(p.image || ""),
    gallery: galleryBase,

    price_rub:
      typeof s?.priceRUB === "number"
        ? s.priceRUB
        : Number(p.price_rub ?? p.priceRUB ?? 0),
    price_uzs:
      typeof s?.priceUZS === "number"
        ? s.priceUZS
        : Number(p.price_uzs ?? p.priceUZS ?? 0),

    old_price_rub:
      typeof s?.oldPriceRUB === "number" ? s.oldPriceRUB : undefined,
    old_price_uzs:
      typeof s?.oldPriceUZS === "number" ? s.oldPriceUZS : undefined,

    variants,

    brand: brandSlug,
    collectionLabel: brandLabel,

    description:
      p.description ||
      "Компактная и практичная модель. Удобная тумба с выдвижными ящиками. Для изготовления используются качественные материалы.",

    extra: {
      article: String(p.sku ?? fallbackSku),
      size: String(p.size ?? "500 × 450 × 523"),
      color: String(p.color ?? "орех матовый / мокко"),
      material: String(p.material ?? "мдф, шпон ясень, массив ясень"),
    },

    related: picked.map((x) => ({
      id: String(x.id),
      title: x.title,
      image: x.image,
      price_rub: Number(x.price_rub ?? x.priceRUB ?? 0),
      price_uzs: Number(x.price_uzs ?? x.priceUZS ?? 0),
      href: `/product/${x.id}`,
      badge: x.badge || "",
    })),
  };

  return <ProductClient product={product} />;
}
