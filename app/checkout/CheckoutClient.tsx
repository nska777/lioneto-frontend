"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft } from "lucide-react";

import { useRegionLang } from "@/app/context/region-lang";
import { useShopState } from "@/app/context/shop-state";
import { CATALOG_BY_ID, BRANDS } from "@/app/lib/mock/catalog-products";
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
 * ✅ Разбираем composite variantId (как в CartClient)
 * - "base"
 * - "color:white"
 * - "color:white|option:lift"
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
    if (part.includes(":")) {
      const [g, id] = part.split(":");
      const group = String(g ?? "").trim();
      const vid = String(id ?? "").trim();
      if (!vid) continue;

      const found =
        variants.find(
          (v) =>
            String(v.id) === vid &&
            (group ? String(v.group ?? "") === group : true),
        ) ?? variants.find((v) => String(v.id) === vid);

      if (found) picked.push(found);
      continue;
    }

    const found = variants.find((v) => String(v.id) === part);
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

/** ================= Strapi price-entry (client) ================= */

type PriceEntry = {
  productId: string;
  variantKey?: string | null;
  title?: string | null;
  priceUZS?: number | null;
  priceRUB?: number | null;
  oldPriceUZS?: number | null;
  oldPriceRUB?: number | null;
  hasDiscount?: boolean | null;
  collectionBadge?: string | null;
  isActive?: boolean | null;
};

const toNum = (v: any) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

async function fetchPriceMap(productIds: string[]) {
  const ids = Array.from(new Set(productIds.filter(Boolean)));
  if (!ids.length) return {} as Record<string, PriceEntry>;

  const base =
    process.env.NEXT_PUBLIC_STRAPI_URL ||
    process.env.STRAPI_URL ||
    "http://localhost:1337";

  const params = new URLSearchParams();
  ids.forEach((id, i) => params.set(`filters[productId][$in][${i}]`, id));
  params.set("pagination[pageSize]", String(Math.min(100, ids.length)));

  const url = `${base.replace(/\/$/, "")}/api/price-entries?${params.toString()}`;

  const res = await fetch(url, { cache: "no-store" });
  if (!res.ok) return {} as Record<string, PriceEntry>;

  const json = await res.json();
  const data: any[] = Array.isArray(json?.data) ? json.data : [];

  const map: Record<string, PriceEntry> = {};
  for (const item of data) {
    const a = item?.attributes ? item.attributes : item;
    const pid = String(a?.productId ?? "");
    if (!pid) continue;

    const vk =
      a?.variantKey !== undefined &&
      a?.variantKey !== null &&
      String(a.variantKey).trim()
        ? String(a.variantKey).trim()
        : "base";

    const key = `${pid}::${vk}`;

    map[key] = {
      productId: pid,
      variantKey: vk === "base" ? null : vk,
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
  }

  return map;
}

/**
 * ✅ Нормализация variantKey для цены (как в CartClient)
 */
function canonicalPriceKey(pid: string, vid: string, variants: VariantAny[]) {
  const raw = String(vid || "base").trim();

  if (!raw || raw === "base") {
    return {
      primary: `${pid}::base`,
      fallbacks: buildFallbacksForBase(pid, variants),
    };
  }

  if (raw.includes(":")) {
    return { primary: `${pid}::${raw}`, fallbacks: [`${pid}::base`] };
  }

  const v = variants.find((x) => String(x.id) === raw);
  const grouped = v?.group ? `${String(v.group).trim()}:${raw}` : raw;

  const fallbacks: string[] = [];
  if (grouped !== raw) fallbacks.push(`${pid}::${grouped}`);
  fallbacks.push(`${pid}::${raw}`);
  fallbacks.push(`${pid}::base`);
  if (raw === "white") fallbacks.unshift(`${pid}::color:white`);

  return { primary: `${pid}::${raw}`, fallbacks };
}

function buildFallbacksForBase(pid: string, variants: VariantAny[]) {
  const fallbacks: string[] = [];

  const white =
    variants.find(
      (v) => String(v.id) === "white" && String(v.group ?? "") === "color",
    ) || variants.find((v) => String(v.id) === "white");

  if (white) {
    const key = white.group ? `${white.group}:${white.id}` : String(white.id);
    fallbacks.push(`${pid}::${key}`);
  } else {
    const firstColor = variants.find((v) => String(v.group ?? "") === "color");
    if (firstColor) {
      const key = firstColor.group
        ? `${firstColor.group}:${firstColor.id}`
        : String(firstColor.id);
      fallbacks.push(`${pid}::${key}`);
    }
  }

  return fallbacks;
}

const LS_CUSTOMER = "lioneto:checkout:customer:v2";

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export default function CheckoutClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const mode = String(sp?.get("mode") ?? "").toLowerCase(); // "" | "oneclick"

  const { region } = useRegionLang(); // "uz" | "ru"
  const shop = useShopState();

  const goBack = () => {
    if (typeof window === "undefined") return;
    if (window.history.length > 1) router.back();
    else router.push("/cart");
  };

  /** ✅ keys from cart or oneclick */
  const keys = useMemo(() => {
    if (mode === "oneclick" && shop.oneClick?.id) return [shop.oneClick.id];
    return Object.keys(shop.cart).filter((k) => (shop.cart[k] ?? 0) > 0);
  }, [mode, shop.cart, shop.oneClick]);

  const productIds = useMemo(() => {
    return keys
      .map((key) => String(shop.parseKey(key).productId))
      .filter(Boolean);
  }, [keys, shop]);

  /** ✅ Strapi products map (ВАЖНО: как в Cart — фетим для ВСЕХ, иначе цены 0 из моков) */
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

  /** ✅ price-entry map */
  const [priceMap, setPriceMap] = useState<Record<string, PriceEntry>>({});
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const map = await fetchPriceMap(productIds);
        if (alive) setPriceMap(map);
      } catch {
        if (alive) setPriceMap({});
      }
    })();
    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productIds.join("|")]);

  /** ✅ items */
  const items = useMemo(() => {
    return keys
      .map((key) => {
        const { productId, variantId } = shop.parseKey(key);

        const pid = String(productId);
        const vid = String(variantId || "base");

        const qty =
          mode === "oneclick"
            ? Math.max(1, Math.floor(Number(shop.oneClick?.qty ?? 1)))
            : Math.max(1, Math.floor(Number(shop.cart[key] ?? 1)));

        const pMock = CATALOG_BY_ID.get(pid) as any | undefined;
        const pStrapi = productsMap[pid] as LiteProduct | undefined;

        // display fallback (как у тебя было)
        const p = (pMock ?? pStrapi) as any;
        if (!p) return null;

        const variants: VariantAny[] = Array.isArray((p as any).variants)
          ? ((p as any).variants as VariantAny[])
          : [];

        const parsed = parseCompositeVariantForCart(vid, variants);

        const { primary, fallbacks } = canonicalPriceKey(pid, vid, variants);
        const pe =
          priceMap[primary] ||
          fallbacks.map((k) => priceMap[k]).find(Boolean) ||
          undefined;

        function readPriceAny(obj: any, region: "uz" | "ru") {
          if (!obj) return 0;

          const uz = obj?.priceUZS ?? obj?.price_uzs ?? obj?.priceUzs ?? null;
          const ru = obj?.priceRUB ?? obj?.price_rub ?? obj?.priceRub ?? null;

          const raw = region === "uz" ? uz : ru;
          const n = Number(raw);
          return Number.isFinite(n) && n > 0 ? n : 0;
        }

        // ✅ ВАЖНО: чтобы совпадало с CartClient
        // 1) Strapi Product (главный приоритет)
        const baseFromStrapi = readPriceAny(pStrapi, region);

        // 2) price-entry (второй приоритет, если вдруг Strapi Product пустой)
        const baseFromPriceEntry = readPriceAny(pe, region);

        // 3) mocks (последний fallback)
        const baseFromMocks = readPriceAny(pMock, region);

        const baseUnit =
          baseFromStrapi || baseFromPriceEntry || baseFromMocks || 0;

        // delta из variants (если используешь priceDelta)
        const pickedForDelta: VariantAny[] = [];
        const raw = String(vid).trim();
        if (raw && raw !== "base") {
          const parts = raw
            .split("|")
            .map((s) => s.trim())
            .filter(Boolean);
          for (const part of parts) {
            const pure = part.includes(":")
              ? String(part.split(":")[1] ?? "").trim()
              : part;
            const found = variants.find((v) => String(v.id) === pure);
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

        const brandSlug = String((p as any).brand ?? pStrapi?.brand ?? "");
        const collectionLabel = labelByBrandSlug(brandSlug);

        const title = String(pe?.title ?? (p as any).title ?? "Товар");

        return {
          key,
          productId: pid,
          variantId: vid,
          qty,
          unit,
          sum: unit * qty,
          title,
          collectionLabel,
          variantTitle: parsed.title,
        };
      })
      .filter(Boolean) as Array<{
      key: string;
      productId: string;
      variantId: string;
      qty: number;
      unit: number;
      sum: number;
      title: string;
      collectionLabel: string | null;
      variantTitle: string | null;
    }>;
  }, [
    keys,
    mode,
    productsMap,
    priceMap,
    region,
    shop,
    shop.cart,
    shop.oneClick,
  ]);

  const total = useMemo(
    () => items.reduce((acc, it) => acc + (Number(it.sum) || 0), 0),
    [items],
  );

  /** ✅ form */
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [comment, setComment] = useState("");
  const [phoneDigits, setPhoneDigits] = useState(""); // UZ: 9 digits after +998

  useEffect(() => {
    const cached = safeParse<any>(localStorage.getItem(LS_CUSTOMER), {});
    setName(String(cached?.name ?? ""));
    setAddress(String(cached?.address ?? ""));
    setComment(String(cached?.comment ?? ""));
    setPhoneDigits(String(cached?.phoneDigits ?? ""));
  }, []);

  useEffect(() => {
    localStorage.setItem(
      LS_CUSTOMER,
      JSON.stringify({ name, address, comment, phoneDigits }),
    );
  }, [name, address, comment, phoneDigits]);

  const isPhoneValid = useMemo(() => {
    if (region === "uz") return /^\d{9}$/.test(phoneDigits);
    return String(phoneDigits).trim().length >= 7;
  }, [region, phoneDigits]);

  const canSubmit = items.length > 0 && isPhoneValid;

  const phoneValue = useMemo(() => {
    if (region === "uz") return `+998${phoneDigits}`;
    return phoneDigits;
  }, [region, phoneDigits]);

  const submit = async () => {
    if (!canSubmit) return;

    const payload = {
      mode: mode === "oneclick" ? "oneclick" : "cart",
      region,
      customer: {
        name: name.trim(),
        phone: phoneValue.trim(),
        address: address.trim(),
        comment: comment.trim(),
      },
      items: items.map((it) => ({
        productId: it.productId,
        variantId: it.variantId,
        qty: it.qty,
        title: it.title,
        unit: it.unit,
        sum: it.sum,
      })),
      total,
    };

    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        alert("Не удалось отправить заказ. Попробуйте ещё раз.");
        return;
      }

      if (mode === "oneclick") shop.clearOneClick();
      else shop.clearCart();

      router.push("/checkout?success=1");
    } catch {
      alert("Ошибка сети. Попробуйте ещё раз.");
    }
  };

  const orderTitle = useMemo(() => {
    if (!items.length) return "Ваш заказ";
    const it = items[0];
    const left = it.collectionLabel ? `${it.collectionLabel} / ` : "";
    return `${left}${it.title}`;
  }, [items]);

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-10">
      <div className="mb-6">
        <button
          type="button"
          onClick={goBack}
          className={cn(
            "cursor-pointer inline-flex items-center gap-2 rounded-full",
            "border border-black/10 bg-white px-4 py-2 text-sm text-black/70",
            "hover:text-black hover:border-black/20 transition",
          )}
        >
          <ChevronLeft className="h-4 w-4" />
          Назад
        </button>

        <div className="mt-4 text-[12px] tracking-[0.28em] text-black/45">
          LIONETO
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">
          Оформление заказа
        </h1>
        <p className="mt-2 text-sm text-black/55">
          Введите данные, проверьте заказ и подтвердите.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_420px]">
        {/* LEFT: FORM */}
        <section className="rounded-3xl border border-black/10 bg-white p-6">
          <div className="text-base font-semibold tracking-[-0.01em]">
            Данные клиента
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* phone */}
            <div className="sm:col-span-1">
              <div className="mb-1 text-[12px] font-medium text-black/55">
                Телефон *
              </div>

              {region === "uz" ? (
                <div className="flex items-center overflow-hidden rounded-2xl border border-black/10 bg-white">
                  <div className="px-4 py-3 text-sm font-semibold text-black/60">
                    +998
                  </div>
                  <input
                    value={phoneDigits}
                    onChange={(e) => {
                      const only = e.target.value
                        .replace(/\D/g, "")
                        .slice(0, 9);
                      setPhoneDigits(only);
                    }}
                    inputMode="numeric"
                    placeholder="9 цифр"
                    className="w-full px-4 py-3 text-sm outline-none"
                  />
                </div>
              ) : (
                <input
                  value={phoneDigits}
                  onChange={(e) => setPhoneDigits(e.target.value)}
                  placeholder="+7..."
                  className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/20"
                />
              )}
            </div>

            {/* name */}
            <div className="sm:col-span-1">
              <div className="mb-1 text-[12px] font-medium text-black/55">
                Имя
              </div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Введите имя"
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/20"
              />
            </div>

            {/* address */}
            <div className="sm:col-span-2">
              <div className="mb-1 text-[12px] font-medium text-black/55">
                Адрес
              </div>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="Город, улица, дом, квартира"
                className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/20"
              />
            </div>

            {/* comment */}
            <div className="sm:col-span-2">
              <div className="mb-1 text-[12px] font-medium text-black/55">
                Комментарий
              </div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                placeholder="Пожелания по доставке, этаж, время..."
                className="h-28 w-full resize-none rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/20"
              />
            </div>
          </div>
        </section>

        {/* RIGHT: ORDER SUMMARY */}
        <aside className="h-fit rounded-3xl border border-black/10 bg-white p-6">
          <div className="text-base font-semibold tracking-[-0.01em]">
            Ваш заказ
          </div>

          <div className="mt-4">
            {items.length ? (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="text-sm font-medium text-black/85">
                      {items[0].collectionLabel ? (
                        <span className="text-black/55">
                          {items[0].collectionLabel} /{" "}
                        </span>
                      ) : null}
                      {items[0].title}
                    </div>

                    <div className="mt-1 text-xs text-black/45">
                      {items[0].qty} × {formatMoney(items[0].unit, region)}
                      {items[0].variantTitle && items[0].variantId !== "base"
                        ? ` • ${items[0].variantTitle}`
                        : ""}
                    </div>
                  </div>

                  <div className="text-sm font-semibold text-black">
                    {formatMoney(items[0].sum, region)}
                  </div>
                </div>

                {items.length > 1 ? (
                  <div className="mt-3 space-y-2">
                    {items.slice(1).map((it) => (
                      <div
                        key={it.key}
                        className="flex items-start justify-between gap-4"
                      >
                        <div className="min-w-0 text-xs text-black/60">
                          {it.qty} × {it.title}
                        </div>
                        <div className="text-xs font-medium text-black/75">
                          {formatMoney(it.sum, region)}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </>
            ) : (
              <div className="text-sm text-black/50">Корзина пустая.</div>
            )}
          </div>

          <div className="mt-4 h-px bg-black/10" />

          <div className="mt-4 flex items-center justify-between text-sm text-black/60">
            <span>Итого</span>
            <span className="font-semibold text-black">
              {formatMoney(total, region)}
            </span>
          </div>

          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            className={cn(
              "mt-5 w-full rounded-full px-5 py-3 text-sm font-semibold transition",
              canSubmit
                ? "bg-black text-white hover:opacity-90 cursor-pointer"
                : "bg-black/10 text-black/40 cursor-not-allowed",
            )}
          >
            Подтвердить заказ →
          </button>

          <Link
            href="/cart"
            className={cn(
              "mt-3 inline-flex w-full items-center justify-center rounded-full",
              "border border-black/10 bg-white px-5 py-3 text-sm font-medium text-black/75",
              "hover:text-black hover:border-black/20 transition cursor-pointer",
            )}
          >
            Вернуться в корзину
          </Link>

          <p className="mt-4 text-xs leading-relaxed text-black/45">
            * Оплаты нет — заказ улетает менеджеру в Telegram.
          </p>
        </aside>
      </div>
    </main>
  );
}
