// app/checkout/CheckoutClient.tsx
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

type Region = "uz" | "ru";

function formatMoney(n: number, region: Region) {
  if (region === "uz") return new Intl.NumberFormat("ru-RU").format(n) + " сум";
  return new Intl.NumberFormat("ru-RU").format(n) + " ₽";
}

/** --------- tiny type-guards (strict-safe) --------- */
function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}
function isString(v: unknown): v is string {
  return typeof v === "string";
}
function toStringSafe(v: unknown): string {
  return isString(v) ? v : String(v ?? "");
}
function toNumSafe(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}
function getProp(obj: unknown, key: string): unknown {
  if (!isRecord(obj)) return undefined;
  return obj[key];
}

function labelByBrandSlug(slug: string | null | undefined) {
  const s = String(slug ?? "")
    .trim()
    .toLowerCase();
  if (!s) return null;
  const found = BRANDS.find((b) => String(b.slug).toLowerCase() === s);
  return found ? found.title : s.toUpperCase();
}

type VariantLite = {
  id: string;
  title?: string;
  group?: string;
  priceDeltaRUB?: number;
  priceDeltaUZS?: number;
  image?: string | null;
  gallery?: string[];
};

type CheckoutItem = {
  key: string;
  productId: string;
  variantId: string;
  qty: number;
  unit: number;
  sum: number;
  title: string;
  collectionLabel: string | null;
  variantTitle: string | null;
  imageUrl: string | null; // ✅ для TG
};

function flattenVariantsForCheckout(product: unknown): VariantLite[] {
  const raw = getProp(product, "variants");
  if (!Array.isArray(raw)) return [];

  const looksGrouped =
    raw.length > 0 &&
    isRecord(raw[0]) &&
    Array.isArray(getProp(raw[0], "items"));

  if (looksGrouped) {
    const out: VariantLite[] = [];
    for (const g of raw) {
      if (!isRecord(g)) continue;

      const group = toStringSafe(getProp(g, "group")).trim();
      const itemsRaw = getProp(g, "items");
      const items = Array.isArray(itemsRaw) ? itemsRaw : [];

      for (const it of items) {
        if (!isRecord(it)) continue;

        const id = toStringSafe(getProp(it, "id")).trim();
        if (!id) continue;

        const itGroup = toStringSafe(getProp(it, "group")).trim();
        const mergedGroup = (itGroup || group || "").trim() || undefined;

        const title = toStringSafe(getProp(it, "title")).trim();
        const imageRaw = getProp(it, "image");
        const image = imageRaw == null ? null : toStringSafe(imageRaw);

        const galleryRaw = getProp(it, "gallery");
        const gallery = Array.isArray(galleryRaw)
          ? galleryRaw.map((x) => toStringSafe(x)).filter(Boolean)
          : undefined;

        const priceDeltaRUB = toNumSafe(getProp(it, "priceDeltaRUB"));
        const priceDeltaUZS = toNumSafe(getProp(it, "priceDeltaUZS"));

        out.push({
          id,
          title: title || undefined,
          group: mergedGroup,
          image,
          gallery,
          priceDeltaRUB,
          priceDeltaUZS,
        });
      }
    }
    return out;
  }

  const out: VariantLite[] = [];
  for (const v of raw) {
    if (!isRecord(v)) continue;

    const id = toStringSafe(getProp(v, "id")).trim();
    if (!id) continue;

    const group = toStringSafe(getProp(v, "group")).trim();
    const title = toStringSafe(getProp(v, "title")).trim();

    const imageRaw = getProp(v, "image");
    const image = imageRaw == null ? null : toStringSafe(imageRaw);

    const galleryRaw = getProp(v, "gallery");
    const gallery = Array.isArray(galleryRaw)
      ? galleryRaw.map((x) => toStringSafe(x)).filter(Boolean)
      : undefined;

    const priceDeltaRUB = toNumSafe(getProp(v, "priceDeltaRUB"));
    const priceDeltaUZS = toNumSafe(getProp(v, "priceDeltaUZS"));

    out.push({
      id,
      title: title || undefined,
      group: group || undefined,
      image,
      gallery,
      priceDeltaRUB,
      priceDeltaUZS,
    });
  }
  return out;
}

function findVariantForPart(
  part: string,
  variants: VariantLite[],
): VariantLite | undefined {
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

/**
 * variantId может быть "color:white|option:lift" и т.п.
 * Мы вытаскиваем человекочитаемый title и картинку (если есть).
 */
function parseCompositeVariantForCart(
  variantId: string,
  variants: VariantLite[],
) {
  const raw = String(variantId ?? "").trim();
  if (!raw || raw === "base") {
    return { title: null as string | null, image: null as string | null };
  }

  const parts = raw
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);

  const picked: VariantLite[] = [];
  for (const part of parts) {
    const found = findVariantForPart(part, variants);
    if (found) picked.push(found);
  }

  const title = picked
    .map((v) => {
      const t = v.title ? String(v.title).trim() : "";
      if (t) return t;
      const id = String(v.id ?? "").trim();
      if (id === "white") return "Белый";
      if (id === "cappuccino") return "Капучино";
      return id;
    })
    .filter(Boolean)
    .join(", ");

  const image =
    picked.find((v) => Array.isArray(v.gallery) && v.gallery.length)
      ?.gallery?.[0] ??
    picked.find((v) => !!v.image)?.image ??
    null;

  return { title: title || null, image };
}

function prettyVariantToken(token: string) {
  const t = String(token || "")
    .trim()
    .toLowerCase();

  const map: Record<string, string> = {
    white: "Белый",
    black: "Чёрный",
    beige: "Бежевый",
    gray: "Серый",
    grey: "Серый",
    cappuccino: "Капучино",
    capuccino: "Капучино",
    "beige-pink": "Бежевая роза",
    rose: "Роза",
    pink: "Розовый",
    walnut: "Орех",
    oak: "Дуб",
  };

  return map[t] ?? token;
}

/** ✅ Fallback: если variants не совпали — берём из variantId и приводим красиво */
function fallbackVariantTitleFromId(variantId: string) {
  const raw = String(variantId ?? "").trim();
  if (!raw || raw === "base") return null;

  const parts = raw
    .split("|")
    .map((s) => s.trim())
    .filter(Boolean);

  const labels = parts
    .map((p) => {
      const val = p.includes(":") ? p.split(":").slice(1).join(":") : p;
      return prettyVariantToken(String(val || "").trim());
    })
    .filter(Boolean);

  const title = labels.join(", ");
  return title || null;
}

function resolveVariantTitle(variantId: string, variants: VariantLite[]) {
  const parsed = parseCompositeVariantForCart(variantId, variants);
  return parsed.title || fallbackVariantTitleFromId(variantId);
}

function resolveVariantImage(variantId: string, variants: VariantLite[]) {
  const parsed = parseCompositeVariantForCart(variantId, variants);
  return parsed.image || null;
}

/** берём картинку товара: вариант -> галерея -> image */
function resolveProductImage(
  p: unknown,
  variantId: string,
  variants: VariantLite[],
) {
  const fromVariant = resolveVariantImage(variantId, variants);
  if (fromVariant) return String(fromVariant);

  const galleryRaw = getProp(p, "gallery");
  if (Array.isArray(galleryRaw)) {
    const first = galleryRaw.map((x) => toStringSafe(x)).find(Boolean);
    if (first) return first;
  }

  const imgRaw = getProp(p, "image");
  const img = toStringSafe(imgRaw).trim();
  if (img) return img;

  // иногда бывает "media" / "thumbnail"
  const mediaRaw = getProp(p, "media");
  const media = toStringSafe(mediaRaw).trim();
  if (media) return media;

  return null;
}

/** абсолютный URL для TG */
function toAbsoluteUrlClient(urlLike: string | null) {
  const raw = String(urlLike ?? "").trim();
  if (!raw) return null;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;

  // local/public path -> делаем абсолютным через origin
  if (raw.startsWith("/")) {
    if (typeof window !== "undefined" && window.location?.origin) {
      return `${window.location.origin}${raw}`;
    }
    return raw;
  }

  return raw;
}

const LS_CUSTOMER = "lioneto:checkout:customer:v2";

function safeParseRecord(raw: string | null): Record<string, unknown> {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    return isRecord(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function readPriceAny(obj: unknown, region: Region): number {
  if (!obj) return 0;

  const uz =
    getProp(obj, "priceUZS") ??
    getProp(obj, "price_uzs") ??
    getProp(obj, "priceUzs");
  const ru =
    getProp(obj, "priceRUB") ??
    getProp(obj, "price_rub") ??
    getProp(obj, "priceRub");

  const raw = region === "uz" ? uz : ru;
  const n = toNumSafe(raw);
  return n > 0 ? n : 0;
}

export default function CheckoutClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const isSuccess = String(sp?.get("success") ?? "") === "1";

  const mode = String(sp?.get("mode") ?? "").toLowerCase(); // "" | "oneclick"

  const { region } = useRegionLang(); // "uz" | "ru"
  const shop = useShopState();

  const goBack = () => {
    if (typeof window === "undefined") return;
    if (window.history.length > 1) router.back();
    else router.push("/cart");
  };

  const keys = useMemo(() => {
    if (mode === "oneclick" && shop.oneClick?.id) return [shop.oneClick.id];
    return Object.keys(shop.cart).filter((k) => (shop.cart[k] ?? 0) > 0);
  }, [mode, shop.cart, shop.oneClick]);

  const productIds = useMemo(() => {
    return keys
      .map((key) => toStringSafe(shop.parseKey(key).productId))
      .filter(Boolean);
  }, [keys, shop]);

  const idsKey = useMemo(() => {
    const ids = Array.from(new Set(productIds.filter(Boolean)));
    return ids.join("|");
  }, [productIds]);

  const [productsMap, setProductsMap] = useState<Record<string, LiteProduct>>(
    {},
  );

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const ids = idsKey ? idsKey.split("|").filter(Boolean) : [];
        if (ids.length === 0) {
          if (alive) setProductsMap({});
          return;
        }
        const m = await fetchProductsMap(ids);
        if (alive) setProductsMap(m);
      } catch {
        if (alive) setProductsMap({});
      }
    })();

    return () => {
      alive = false;
    };
  }, [idsKey]);

  const items = useMemo<CheckoutItem[]>(() => {
    const out: CheckoutItem[] = [];

    for (const key of keys) {
      const parsed = shop.parseKey(key);
      const pid = toStringSafe(parsed.productId);
      const vid = toStringSafe(parsed.variantId || "base") || "base";

      const qty =
        mode === "oneclick"
          ? Math.max(1, Math.floor(toNumSafe(shop.oneClick?.qty ?? 1)))
          : Math.max(1, Math.floor(toNumSafe(shop.cart[key] ?? 1)));

      const pMockUnknown: unknown = CATALOG_BY_ID.get(pid);
      const pStrapi: LiteProduct | undefined = productsMap[pid];

      const p: unknown = pStrapi ?? pMockUnknown;
      if (!p) continue;

      const variants = flattenVariantsForCheckout(p);

      const variantTitle = resolveVariantTitle(vid, variants);

      const baseFromStrapi = readPriceAny(pStrapi, region);
      const baseFromMocks = readPriceAny(pMockUnknown, region);
      const baseUnit = baseFromStrapi || baseFromMocks || 0;

      const pickedForDelta: VariantLite[] = [];
      if (vid && vid !== "base") {
        const parts = vid
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
            ? toNumSafe(v.priceDeltaUZS ?? 0)
            : toNumSafe(v.priceDeltaRUB ?? 0);
        return acc + d;
      }, 0);

      const unit = baseUnit + delta;

      const brandSlug = toStringSafe(getProp(p, "brand")).trim();
      const collectionLabel = labelByBrandSlug(brandSlug);

      const title = toStringSafe(getProp(p, "title")).trim() || "Товар";

      const imageRaw = resolveProductImage(p, vid, variants);
      const imageUrl = toAbsoluteUrlClient(imageRaw);

      out.push({
        key,
        productId: pid,
        variantId: vid,
        qty,
        unit,
        sum: unit * qty,
        title,
        collectionLabel,
        variantTitle,
        imageUrl,
      });
    }

    return out;
  }, [keys, mode, productsMap, region, shop, shop.cart, shop.oneClick]);

  const total = useMemo(
    () => items.reduce((acc, it) => acc + (Number(it.sum) || 0), 0),
    [items],
  );

  /** cached customer ONCE (no setState in useEffect — satisfies react-hooks/set-state-in-effect) */
  const cachedCustomer = useMemo(
    () => safeParseRecord(localStorage.getItem(LS_CUSTOMER)),
    [],
  );

  /**  form */
  const [name, setName] = useState(() =>
    toStringSafe(cachedCustomer.name ?? ""),
  );
  const [address, setAddress] = useState(() =>
    toStringSafe(cachedCustomer.address ?? ""),
  );
  const [comment, setComment] = useState(() =>
    toStringSafe(cachedCustomer.comment ?? ""),
  );
  const [phoneDigits, setPhoneDigits] = useState(() =>
    toStringSafe(cachedCustomer.phoneDigits ?? ""),
  ); // UZ: 9 digits after +998

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
        collectionLabel: it.collectionLabel, // ✅ теперь AMBER/SCANDY уйдёт в TG
        imageUrl: it.imageUrl, // ✅ фото для TG
        variantId: it.variantId,
        variantTitle: it.variantTitle,
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
        const txt = await res.text().catch(() => "");
        alert(
          "Не удалось отправить заказ. Попробуйте ещё раз.\n\n" +
            (txt ? txt.slice(0, 500) : ""),
        );
        return;
      }

      if (mode === "oneclick") shop.clearOneClick();
      else shop.clearCart();

      router.replace("/checkout?success=1");
    } catch {
      alert("Ошибка сети. Попробуйте ещё раз.");
    }
  };

  if (isSuccess) {
    return (
      <main className="mx-auto w-full max-w-[1000px] px-4 py-20">
        <div className="rounded-3xl border border-black/10 bg-white p-10 text-center">
          <div className="text-[12px] tracking-[0.28em] text-black/45">
            LIONETO
          </div>

          <div className="mt-6 flex justify-center">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black text-2xl text-white">
              ✓
            </div>
          </div>

          <h1 className="mt-6 text-3xl font-semibold tracking-[-0.02em]">
            Спасибо за заказ!
          </h1>

          <p className="mt-4 text-sm text-black/60">
            В ближайшее время с вами свяжется менеджер для подтверждения.
          </p>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-semibold text-white transition hover:opacity-90"
            >
              Перейти в каталог
            </Link>

            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-semibold text-black/80 transition hover:border-black/20"
            >
              На главную
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-10">
      <div className="mb-6">
        <button
          type="button"
          onClick={goBack}
          className={cn(
            "inline-flex cursor-pointer items-center gap-2 rounded-full",
            "border border-black/10 bg-white px-4 py-2 text-sm text-black/70",
            "transition hover:border-black/20 hover:text-black",
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
        <section className="rounded-3xl border borderblack/10 bg-white p-6">
          <div className="text-base font-semibold tracking-[-0.01em]">
            Данные клиента
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
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
                          {it.qty} ×{" "}
                          {it.collectionLabel ? (
                            <span className="text-black/55">
                              {it.collectionLabel} /{" "}
                            </span>
                          ) : null}
                          {it.title}
                          {it.variantTitle && it.variantId !== "base"
                            ? ` • ${it.variantTitle}`
                            : ""}
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
                ? "cursor-pointer bg-black text-white hover:opacity-90"
                : "cursor-not-allowed bg-black/10 text-black/40",
            )}
          >
            Подтвердить заказ →
          </button>

          <Link
            href="/cart"
            className={cn(
              "mt-3 inline-flex w-full cursor-pointer items-center justify-center rounded-full",
              "border border-black/10 bg-white px-5 py-3 text-sm font-medium text-black/75",
              "transition hover:border-black/20 hover:text-black",
            )}
          >
            Вернуться в корзину
          </Link>
        </aside>
      </div>
    </main>
  );
}
