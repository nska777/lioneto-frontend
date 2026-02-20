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

function formatMoney(n: number, region: "uz" | "ru") {
  if (region === "uz") return new Intl.NumberFormat("ru-RU").format(n) + " сум";
  return new Intl.NumberFormat("ru-RU").format(n) + " ₽";
}

/** ✅ Лейбл коллекции по slug (brand) */
function labelByBrandSlug(slug: string | null | undefined) {
  const s = String(slug ?? "")
    .trim()
    .toLowerCase();
  if (!s) return null;
  const found = BRANDS.find((b) => String(b.slug).toLowerCase() === s);
  return found ? found.title : s.toUpperCase();
}

/** ✅ <img> вместо next/image (Strapi/localhost/remote) */
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
    // eslint-disable-next-line @next/next/no-img-element
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

/**
 * ✅ Приводим variants к ПЛОСКОМУ списку:
 * - либо variants уже плоский массив VariantAny[]
 * - либо это группы: [{group, items:[VariantAny]}]
 */
function flattenVariantsForCart(product: any): VariantAny[] {
  const raw = product?.variants;
  if (!Array.isArray(raw)) return [];

  const looksGrouped =
    raw.length > 0 &&
    typeof raw[0] === "object" &&
    raw[0] &&
    Array.isArray((raw[0] as any).items);

  if (looksGrouped) {
    const out: VariantAny[] = [];
    for (const g of raw) {
      const group = String((g as any)?.group ?? "").trim();
      const items = Array.isArray((g as any)?.items) ? (g as any).items : [];
      for (const it of items) {
        if (!it) continue;
        out.push({
          ...(it as any),
          id: String((it as any).id ?? ""),
          group:
            String((it as any).group ?? group ?? "").trim() ||
            group ||
            undefined,
        });
      }
    }
    return out.filter((v) => v && v.id);
  }

  return raw
    .map((v: any) => ({
      ...(v as any),
      id: String(v?.id ?? ""),
      group: v?.group ? String(v.group) : undefined,
    }))
    .filter((v: any) => v && v.id);
}

/**
 * ✅ Умный поиск варианта по "part" из variantId корзины.
 */
function findVariantForPart(part: string, variants: VariantAny[]) {
  const p = String(part ?? "").trim();
  if (!p) return null;

  const hasColon = p.includes(":");
  const group = hasColon ? String(p.split(":")[0] ?? "").trim() : "";
  const val = hasColon ? String(p.split(":")[1] ?? "").trim() : p;

  // 1) прямое совпадение по id
  let found =
    variants.find((v) => String(v.id) === p) ||
    variants.find((v) => String(v.id) === val);

  if (found) return found;

  // 2) совпадение по group + val (если у варианта group отдельно)
  if (group) {
    found =
      variants.find(
        (v) =>
          String(v.group ?? "").trim() === group && String(v.id).trim() === val,
      ) || null;
    if (found) return found;
  }

  // 3) если id варианта хранит "group:val" внутри
  if (group) {
    found =
      variants.find((v) => {
        const vid = String(v.id ?? "").trim();
        if (!vid.includes(":")) return false;
        const [vg, vv] = vid.split(":");
        return String(vg).trim() === group && String(vv).trim() === val;
      }) || null;
    if (found) return found;
  }

  // 4) fallback: если val совпадает с концом "something:val"
  found =
    variants.find((v) => {
      const vid = String(v.id ?? "").trim();
      if (!vid.includes(":")) return false;
      const tail = vid.split(":").pop();
      return String(tail ?? "").trim() === val;
    }) || null;

  return found;
}

/**
 * ✅ Разбираем composite variantId из корзины:
 */
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

function itSafeTitle(p: any) {
  const t = p?.title;
  if (typeof t === "string") return t;
  return "";
}

function readPriceFromObj(obj: any, region: "uz" | "ru") {
  if (!obj) return 0;

  const uz = obj?.priceUZS ?? obj?.price_uzs ?? obj?.priceUzs ?? null;
  const ru = obj?.priceRUB ?? obj?.price_rub ?? obj?.priceRub ?? null;

  const raw = region === "uz" ? uz : ru;
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : 0;
}

export default function CartClient() {
  const router = useRouter();
  const { region } = useRegionLang(); // "uz" | "ru"
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productIds.join("|")]);

  const items = useMemo(() => {
    return keys
      .map((key) => {
        const { productId, variantId } = shop.parseKey(key);

        const pid = String(productId);
        const vidRaw = String(variantId || "base");

        const pMock = CATALOG_BY_ID.get(pid) as any | undefined;
        const pStrapi = productsMap[pid] as LiteProduct | undefined;

        // ✅ ДЛЯ ВИДА можно оставить как было
        const pDisplay = (pMock ?? pStrapi) as any;
        if (!pDisplay) return null;

        // ✅ ВОТ ГЛАВНЫЙ ФИКС:
        // для цены + variants берём Strapi (если есть), иначе моки
        const pForCalc = (pStrapi ?? pMock ?? pDisplay) as any;

        const qty = shop.cart[key] ?? 1;

        // ✅ variants — строго из pForCalc (Strapi приоритет)
        const variants: VariantAny[] = flattenVariantsForCart(pForCalc);

        const parsed = parseCompositeVariantForCart(vidRaw, variants);

        // ✅ БАЗОВАЯ ЦЕНА: Strapi Product -> потом моки
        const baseFromStrapi = readPriceFromObj(pStrapi, region);
        const baseFromMocks = readPriceFromObj(pMock, region);
        const baseUnit = baseFromStrapi || baseFromMocks || 0;

        // ✅ delta из variants (Strapi приоритет)
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
              ? Number(v?.priceDeltaUZS ?? 0)
              : Number(v?.priceDeltaRUB ?? 0);
          return acc + (Number(d ?? 0) || 0);
        }, 0);

        const unit = baseUnit + delta;

        // ✅ картинка: вариант -> Strapi product -> display fallback
        const image =
          (parsed.image ? String(parsed.image) : "") ||
          String(pStrapi?.image || (pStrapi as any)?.gallery?.[0] || "") ||
          String(pDisplay?.image || pDisplay?.gallery?.[0] || "");

        const brandSlug = String(pDisplay?.brand ?? pStrapi?.brand ?? "");
        const collectionLabel = labelByBrandSlug(brandSlug);

        const title = String(
          itSafeTitle(pStrapi) || itSafeTitle(pDisplay) || "",
        );

        return {
          key,
          productId: pid,
          variantId: vidRaw,
          variantTitle: parsed.title,
          product: { ...(pDisplay as any), title } as any,
          qty,
          unit,
          sum: unit * qty,
          image: String(image || ""),
          collectionLabel,
        };
      })
      .filter(Boolean) as Array<{
      key: string;
      productId: string;
      variantId: string;
      variantTitle: string | null;
      product: (typeof CATALOG_MOCK)[number] | any;
      qty: number;
      unit: number;
      sum: number;
      image: string;
      collectionLabel: string | null;
    }>;
  }, [keys, shop, shop.cart, region, productsMap]);

  const total = useMemo(
    () => items.reduce((acc, it) => acc + it.sum, 0),
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
                    <SafeImg src={it.image} alt={it.product.title} />
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
                          {it.product.title}
                        </Link>

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
