// app/cart/CartClient.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Trash2, ArrowRight, ShoppingBag, ChevronLeft } from "lucide-react";

import { useRegionLang } from "../context/region-lang";
import { useShopState } from "../context/shop-state";
import {
  CATALOG_BY_ID,
  CATALOG_MOCK,
  BRANDS,
} from "../lib/mock/catalog-products";

import { fetchProductsMap, type LiteProduct } from "@/app/lib/strapi/products";

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

type Region = "uz" | "ru";
type CatalogProduct = (typeof CATALOG_MOCK)[number];

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function isString(v: unknown): v is string {
  return typeof v === "string";
}

function asString(v: unknown): string {
  return isString(v) ? v : "";
}

function getStr(p: unknown, key: string): string {
  if (!isRecord(p)) return "";
  return asString(p[key]);
}

function formatMoney(n: number, region: Region) {
  if (region === "uz") return new Intl.NumberFormat("ru-RU").format(n) + " сум";
  return new Intl.NumberFormat("ru-RU").format(n) + " ₽";
}

function labelByBrandSlug(slug: string | null | undefined) {
  const s = String(slug ?? "")
    .trim()
    .toLowerCase();
  if (!s) return null;
  const found = BRANDS.find((b) => String(b.slug).toLowerCase() === s);
  return found ? found.title : s.toUpperCase();
}

function SafeImg({ src, alt }: { src: string; alt: string }) {
  const [broken, setBroken] = React.useState(false);

  if (!src || broken) {
    return (
      <div className="absolute inset-0 grid place-items-center bg-black/5">
        <div className="text-[11px] tracking-[0.22em] text-black/35">
          NO IMAGE
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className="absolute inset-0 h-full w-full object-contain"
      onError={() => setBroken(true)}
      loading="lazy"
    />
  );
}

type VariantAny = {
  id: string;
  title?: string;
  group?: string;
  priceDeltaRUB?: number;
  priceDeltaUZS?: number;
  image?: string | null;
  gallery?: string[];
};

type CartItem = {
  key: string;
  productId: string;
  variantId: string;
  variantTitle: string | null;
  displayArticle: string;
  product: CatalogProduct | LiteProduct;
  qty: number;
  unit: number;
  sum: number;
  image: string;
  collectionLabel: string | null;
};

function toNum(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function normalizeArticleColor(color?: string | null) {
  const value = String(color ?? "").trim();
  if (!value) return "";
  return value.charAt(0).toLowerCase() + value.slice(1);
}

function getDisplayArticle(baseArticle?: string | null, color?: string | null) {
  const article = String(baseArticle ?? "").trim();
  const normalizedColor = normalizeArticleColor(color);

  if (!article) return "—";
  if (!normalizedColor) return article;

  return `${article} (${normalizedColor})`;
}

function flattenVariantsForCart(product: unknown): VariantAny[] {
  if (!isRecord(product)) return [];
  const raw = product.variants;
  if (!Array.isArray(raw)) return [];

  const first = raw[0];
  const looksGrouped =
    isRecord(first) && Array.isArray((first as Record<string, unknown>).items);

  if (looksGrouped) {
    const out: VariantAny[] = [];
    for (const g of raw) {
      if (!isRecord(g)) continue;

      const group = String(g.group ?? "").trim();
      const itemsRaw = g.items;
      const items = Array.isArray(itemsRaw) ? itemsRaw : [];

      for (const it of items) {
        if (!isRecord(it)) continue;

        const id = String(it.id ?? "").trim();
        if (!id) continue;

        const localGroup =
          String(it.group ?? group ?? "").trim() || (group ? group : undefined);

        out.push({
          id,
          title: isString(it.title) ? it.title : undefined,
          group: localGroup,
          priceDeltaRUB: toNum(it.priceDeltaRUB),
          priceDeltaUZS: toNum(it.priceDeltaUZS),
          image: isString(it.image) ? it.image : null,
          gallery: Array.isArray(it.gallery)
            ? (it.gallery.filter(
                (x): x is string => typeof x === "string",
              ) as string[])
            : undefined,
        });
      }
    }
    return out;
  }

  return raw
    .map((v): VariantAny | null => {
      if (!isRecord(v)) return null;

      const id = String(v.id ?? "").trim();
      if (!id) return null;

      const title = isString(v.title) ? v.title : undefined;
      const group = isString(v.group) ? v.group.trim() : undefined;

      const priceDeltaRUB = toNum(v.priceDeltaRUB);
      const priceDeltaUZS = toNum(v.priceDeltaUZS);

      const image = isString(v.image) ? v.image : null;

      const gallery = Array.isArray(v.gallery)
        ? v.gallery.filter((x): x is string => typeof x === "string")
        : undefined;

      return {
        id,
        title,
        group,
        priceDeltaRUB,
        priceDeltaUZS,
        image,
        gallery,
      };
    })
    .filter((x): x is VariantAny => x !== null);
}

function findVariantForPart(
  part: string,
  variants: VariantAny[],
): VariantAny | undefined {
  const p = String(part ?? "").trim();
  if (!p) return undefined;

  const hasColon = p.includes(":");
  const group = hasColon ? String(p.split(":")[0] ?? "").trim() : "";
  const val = hasColon ? String(p.split(":")[1] ?? "").trim() : p;

  let found =
    variants.find((v) => String(v.id) === p) ||
    variants.find((v) => String(v.id) === val);

  if (found) return found;

  if (group) {
    found = variants.find(
      (v) =>
        String(v.group ?? "").trim() === group && String(v.id).trim() === val,
    );
    if (found) return found;
  }

  if (group) {
    found = variants.find((v) => {
      const vid = String(v.id ?? "").trim();
      if (!vid.includes(":")) return false;
      const [vg, vv] = vid.split(":");
      return String(vg).trim() === group && String(vv).trim() === val;
    });
    if (found) return found;
  }

  found = variants.find((v) => {
    const vid = String(v.id ?? "").trim();
    if (!vid.includes(":")) return false;
    const tail = vid.split(":").pop();
    return String(tail ?? "").trim() === val;
  });

  return found;
}

function parseCompositeVariantForCart(
  variantId: string,
  variants: VariantAny[],
) {
  const raw = String(variantId ?? "").trim();
  if (!raw || raw === "base") {
    return { title: null as string | null, image: null as string | null };
  }

  const parts = raw
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);

  const picked: VariantAny[] = [];
  for (const part of parts) {
    const found = findVariantForPart(part, variants);
    if (found) picked.push(found);
  }

  const title = picked
    .map((v) => (v.title ? String(v.title).trim() : ""))
    .filter(Boolean)
    .join(", ");

  const image =
    picked.find((v) => Array.isArray(v.gallery) && v.gallery.length)
      ?.gallery?.[0] ??
    picked.find((v) => !!v.image)?.image ??
    null;

  return { title: title || null, image };
}

function itSafeTitle(p: unknown) {
  const t = isRecord(p) ? p.title : undefined;
  return typeof t === "string" ? t : "";
}

function readPriceFromObj(obj: unknown, region: Region) {
  if (!isRecord(obj)) return 0;

  const uz = obj.priceUZS ?? obj.price_uzs ?? obj.priceUzs ?? null;
  const ru = obj.priceRUB ?? obj.price_rub ?? obj.priceRub ?? null;

  const raw = region === "uz" ? uz : ru;
  const n = typeof raw === "number" ? raw : Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

function readBrandSlug(p: unknown): string {
  if (!isRecord(p)) return "";
  return asString(p.brand);
}

function readFirstImage(p: unknown): string {
  if (!isRecord(p)) return "";
  const img = p.image;
  if (typeof img === "string") return img;

  const g = p.gallery;
  if (Array.isArray(g)) {
    const first = g.find(
      (x): x is string => typeof x === "string" && !!x.trim(),
    );
    return first ? first : "";
  }

  return "";
}

function readArticle(p: unknown): string {
  if (!isRecord(p)) return "";
  return (
    asString(p.sku).trim() ||
    asString(p.article).trim() ||
    asString(p.id).trim()
  );
}

export default function CartClient() {
  const router = useRouter();
  const { region } = useRegionLang();
  const shop = useShopState();

  const goBack = () => {
    if (typeof window === "undefined") return;
    if (window.history.length > 1) router.back();
    else router.push("/catalog");
  };

  const keys = useMemo(() => {
    return Object.keys(shop.cart).filter((k) => (shop.cart[k] ?? 0) > 0);
  }, [shop.cart]);

  const productIds = useMemo(() => {
    return keys
      .map((key) => String(shop.parseKey(key).productId))
      .filter(Boolean);
  }, [keys, shop]);

  const [productsMap, setProductsMap] = useState<Record<string, LiteProduct>>(
    {},
  );

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const ids = Array.from(new Set(productIds.filter(Boolean)));
        const m = await fetchProductsMap(ids);
        if (alive) setProductsMap(m);
      } catch {
        if (alive) setProductsMap({});
      }
    })();
    return () => {
      alive = false;
    };
  }, [productIds.join("|")]);

  const items = useMemo((): CartItem[] => {
    return keys
      .map((key) => {
        const parsedKey = shop.parseKey(key);
        const pid = String(parsedKey.productId);
        const vidRaw = String(parsedKey.variantId || "base");

        const pMockUnknown = CATALOG_BY_ID.get(pid) as unknown;
        const pMock = (pMockUnknown ?? undefined) as unknown;

        const pStrapi = productsMap[pid] as LiteProduct | undefined;

        const pDisplay: unknown = (pMockUnknown ?? pStrapi) as unknown;
        if (!pDisplay) return null;

        const pForCalc: unknown = (pStrapi ??
          pMockUnknown ??
          pDisplay) as unknown;

        const qty = Math.max(1, Math.floor(Number(shop.cart[key] ?? 1)));

        const variants: VariantAny[] = flattenVariantsForCart(pForCalc);

        const parsedVariant = parseCompositeVariantForCart(vidRaw, variants);

        const baseFromStrapi = readPriceFromObj(pStrapi, region);
        const baseFromMocks = readPriceFromObj(pMockUnknown, region);
        const baseUnit = baseFromStrapi || baseFromMocks || 0;

        const pickedForDelta: VariantAny[] = [];
        const raw = String(vidRaw).trim();
        if (raw && raw !== "base") {
          const parts = raw
            .split("|")
            .map((s) => s.trim())
            .filter(Boolean);

          for (const part of parts) {
            const found = findVariantForPart(part, variants);
            if (found) pickedForDelta.push(found);
          }
        }

        const delta = pickedForDelta.reduce((acc, v) => {
          const d =
            region === "uz"
              ? toNum(v.priceDeltaUZS ?? 0)
              : toNum(v.priceDeltaRUB ?? 0);
          return acc + d;
        }, 0);

        const unit = baseUnit + delta;

        const image =
          (parsedVariant.image ? String(parsedVariant.image) : "") ||
          readFirstImage(pStrapi) ||
          readFirstImage(pDisplay);

        const brandSlug = readBrandSlug(pDisplay) || readBrandSlug(pStrapi);
        const collectionLabel = labelByBrandSlug(brandSlug);

        const title = itSafeTitle(pStrapi) || itSafeTitle(pDisplay) || "Товар";
        const baseArticle =
          readArticle(pStrapi) || readArticle(pMock) || readArticle(pDisplay);
        const displayArticle = getDisplayArticle(
          baseArticle,
          parsedVariant.title,
        );

        const productForUI: CatalogProduct | LiteProduct = isRecord(pDisplay)
          ? ({
              ...(pDisplay as Record<string, unknown>),
              title,
            } as unknown as CatalogProduct | LiteProduct)
          : (pStrapi ?? ({} as LiteProduct));

        return {
          key,
          productId: pid,
          variantId: vidRaw,
          variantTitle: parsedVariant.title,
          displayArticle,
          product: productForUI,
          qty,
          unit,
          sum: unit * qty,
          image: String(image || ""),
          collectionLabel,
        };
      })
      .filter((x): x is CartItem => !!x);
  }, [keys, shop, shop.cart, region, productsMap]);

  const total = useMemo(
    () => items.reduce((acc, it) => acc + (Number(it.sum) || 0), 0),
    [items],
  );

  const remove = (productId: string, variantId: string) => {
    shop.removeFromCart(productId, variantId);
  };

  const clear = () => {
    shop.clearCart();
  };

  const changeQty = (productId: string, variantId: string, nextQty: number) => {
    shop.setCartQty(productId, nextQty, variantId);
  };

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-10">
      <div className="flex items-end justify-between gap-4">
        <div>
          <button
            type="button"
            onClick={goBack}
            className={cn(
              "cursor-pointer inline-flex items-center gap-2 rounded-full",
              "border border-black/10 bg-white px-4 py-2 text-sm text-black/70",
              "hover:text-black hover:border-black/20 transition",
            )}
            aria-label="Назад"
            title="Назад"
          >
            <ChevronLeft className="h-4 w-4" />
            Назад
          </button>

          <div className="mt-4 text-[12px] tracking-[0.28em] text-black/45">
            LIONETO
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">
            Корзина
          </h1>
          <p className="mt-2 text-sm text-black/55">
            {items.length
              ? `Товаров: ${items.length}`
              : "Пока пусто — добавь товары из каталога."}
          </p>
        </div>

        {items.length > 0 && (
          <button
            onClick={clear}
            className="cursor-pointer inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm text-black/75 hover:text-black hover:border-black/20 transition"
          >
            <Trash2 className="h-4 w-4" />
            Очистить
          </button>
        )}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_360px]">
        <div className="space-y-4">
          {items.length === 0 ? (
            <div className="rounded-3xl border border-black/10 bg-white p-8">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-black/5">
                  <ShoppingBag className="h-6 w-6 text-black/60" />
                </div>
                <div>
                  <div className="text-base font-medium">Корзина пустая</div>
                  <div className="text-sm text-black/55">
                    Перейди в каталог и добавь товары.
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <Link
                  href="/catalog"
                  className="cursor-pointer inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-medium text-white hover:opacity-90 transition"
                >
                  В каталог <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ) : (
            items.map((it) => (
              <div
                key={it.key}
                className="rounded-3xl border border-black/10 bg-white p-4 md:p-5"
              >
                <div className="flex gap-4">
                  <Link
                    href={`/product/${it.productId}`}
                    className="cursor-pointer relative h-24 w-24 shrink-0 overflow-hidden rounded-2xl bg-black/5"
                  >
                    <SafeImg
                      src={it.image}
                      alt={getStr(it.product, "title") || "Товар"}
                    />
                  </Link>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={`/product/${it.productId}`}
                          className="cursor-pointer block truncate text-base font-medium tracking-[-0.01em] hover:underline"
                        >
                          {it.collectionLabel ? (
                            <span className="text-black/55">
                              {it.collectionLabel} /{" "}
                            </span>
                          ) : null}
                          {getStr(it.product, "title") || "Товар"}
                        </Link>

                        <div className="mt-1 text-[12px] text-black/45">
                          Артикул: {it.displayArticle}
                        </div>

                        {it.variantTitle && it.variantId !== "base" ? (
                          <div className="mt-1 text-[12px] text-black/55">
                            Вариант:{" "}
                            <span className="font-semibold text-black/75">
                              {it.variantTitle}
                            </span>
                          </div>
                        ) : null}

                        <div className="mt-1 text-xs text-black/45">
                          ID: {it.productId}
                        </div>
                      </div>

                      <button
                        onClick={() => remove(it.productId, it.variantId)}
                        className="cursor-pointer inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white text-black/65 hover:text-black hover:border-black/20 transition"
                        aria-label="Удалить"
                        title="Удалить"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                      <div className="inline-flex items-center rounded-full border border-black/10 bg-white p-1">
                        <button
                          className="cursor-pointer h-9 w-9 rounded-full text-black/70 hover:text-black transition"
                          onClick={() =>
                            changeQty(it.productId, it.variantId, it.qty - 1)
                          }
                          aria-label="Уменьшить количество"
                          title="Уменьшить"
                        >
                          −
                        </button>
                        <div className="min-w-[44px] text-center text-sm font-medium">
                          {it.qty}
                        </div>
                        <button
                          className="cursor-pointer h-9 w-9 rounded-full text-black/70 hover:text-black transition"
                          onClick={() =>
                            changeQty(it.productId, it.variantId, it.qty + 1)
                          }
                          aria-label="Увеличить количество"
                          title="Увеличить"
                        >
                          +
                        </button>
                      </div>

                      <div className="text-right">
                        <div className="text-sm text-black/55">
                          {formatMoney(it.unit, region)} × {it.qty}
                        </div>
                        <div className="text-lg font-semibold tracking-[-0.02em]">
                          {formatMoney(it.sum, region)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <aside className="h-fit rounded-3xl border border-black/10 bg-white p-5">
          <div className="text-base font-semibold tracking-[-0.01em]">
            Итого
          </div>
          <div className="mt-3 flex items-center justify-between text-sm text-black/60">
            <span>Сумма</span>
            <span className="font-medium text-black/80">
              {formatMoney(total, region)}
            </span>
          </div>

          <div className="mt-5 h-px bg-black/10" />

          <div className="mt-5 space-y-3">
            <Link
              href="/checkout"
              className={cn(
                "cursor-pointer inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition",
                items.length
                  ? "bg-black text-white hover:opacity-90"
                  : "bg-black/10 text-black/40 pointer-events-none",
              )}
            >
              Оформить заказ <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/catalog"
              className="cursor-pointer inline-flex w-full items-center justify-center rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-medium text-black/75 hover:text-black hover:border-black/20 transition"
            >
              Продолжить покупки
            </Link>
          </div>

          <p className="mt-4 text-xs leading-relaxed text-black/45">
            * Доставка и сборка считаются на этапе оформления.
          </p>
        </aside>
      </div>
    </main>
  );
}
