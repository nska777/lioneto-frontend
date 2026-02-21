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
 * ✅ Плоский список вариантов:
 * - либо variants плоский VariantAny[]
 * - либо это группы: [{group, items:[VariantAny]}]
 */
function flattenVariantsForCheckout(product: any): VariantAny[] {
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
        const id = String((it as any).id ?? "").trim();
        if (!id) continue;

        out.push({
          ...(it as any),
          id,
          group:
            String((it as any).group ?? group ?? "").trim() ||
            group ||
            undefined,
        });
      }
    }
    return out;
  }

  return raw
    .map((v: any) => ({
      ...(v as any),
      id: String(v?.id ?? "").trim(),
      group: v?.group ? String(v.group).trim() : undefined,
    }))
    .filter((v: any) => v && v.id);
}

/**
 * ✅ Поиск варианта по part из composite variantId:
 * part может быть "color:white" или "white"
 *
 * ВАЖНО: возвращаем VariantAny | undefined (НЕ null),
 * иначе TS падает в build.
 */
function findVariantForPart(
  part: string,
  variants: VariantAny[],
): VariantAny | undefined {
  const p = String(part ?? "").trim();
  if (!p) return undefined;

  const hasColon = p.includes(":");
  const group = hasColon ? String(p.split(":")[0] ?? "").trim() : "";
  const val = hasColon ? String(p.split(":")[1] ?? "").trim() : p;

  // 1) прямые совпадения
  let found =
    variants.find((v) => String(v.id) === p) ||
    variants.find((v) => String(v.id) === val);

  if (found) return found;

  // 2) group + id (если group отдельно)
  if (group) {
    found = variants.find(
      (v) =>
        String(v.group ?? "").trim() === group && String(v.id).trim() === val,
    );
    if (found) return found;
  }

  // 3) если id хранит "group:val" внутри
  if (group) {
    found = variants.find((v) => {
      const vid = String(v.id ?? "").trim();
      if (!vid.includes(":")) return false;
      const [vg, vv] = vid.split(":");
      return String(vg).trim() === group && String(vv).trim() === val;
    });
    if (found) return found;
  }

  // 4) fallback: хвост "something:val"
  found = variants.find((v) => {
    const vid = String(v.id ?? "").trim();
    if (!vid.includes(":")) return false;
    const tail = vid.split(":").pop();
    return String(tail ?? "").trim() === val;
  });

  return found;
}

/**
 * ✅ Парсим composite variantId → title/image (если variants совпали)
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

/** ✅ Красивый fallback для id-шников вариантов (white/cappuccino и т.п.) */
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

function resolveVariantTitle(variantId: string, variants: VariantAny[]) {
  const parsed = parseCompositeVariantForCart(variantId, variants);
  return parsed.title || fallbackVariantTitleFromId(variantId);
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
  const isSuccess = String(sp?.get("success") ?? "") === "1";

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

  /** ✅ Strapi products map */
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

  /** ✅ items */
  const items = useMemo(() => {
    function readPriceAny(obj: any, region: "uz" | "ru") {
      if (!obj) return 0;
      const uz = obj?.priceUZS ?? obj?.price_uzs ?? obj?.priceUzs ?? null;
      const ru = obj?.priceRUB ?? obj?.price_rub ?? obj?.priceRub ?? null;
      const raw = region === "uz" ? uz : ru;
      const n = Number(raw);
      return Number.isFinite(n) && n > 0 ? n : 0;
    }

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
        const p = (pStrapi ?? pMock) as any;
        if (!p) return null;

        const variants: VariantAny[] = flattenVariantsForCheckout(p);

        const variantTitle = resolveVariantTitle(vid, variants);

        // ✅ базовая цена: Strapi Product -> mocks
        const baseFromStrapi = readPriceAny(pStrapi, region);
        const baseFromMocks = readPriceAny(pMock, region);
        const baseUnit = baseFromStrapi || baseFromMocks || 0;

        // ✅ delta из variants
        const pickedForDelta: VariantAny[] = [];
        const raw = String(vid).trim();
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

        const brandSlug = String((p as any).brand ?? "");
        const collectionLabel = labelByBrandSlug(brandSlug);

        const title = String((p as any).title ?? "Товар");

        return {
          key,
          productId: pid,
          variantId: vid,
          qty,
          unit,
          sum: unit * qty,
          title,
          collectionLabel,
          variantTitle,
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
  }, [keys, mode, productsMap, region, shop, shop.cart, shop.oneClick]);

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
        variantTitle: it.variantTitle,
        qty: it.qty,
        title: it.title,
        unit: it.unit,
        sum: it.sum,
        // ✅ на будущее (для TG фото) можно будет добавить imageUrl, но сейчас НЕ трогаем
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
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black text-white text-2xl">
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
              className="inline-flex items-center justify-center rounded-full bg-black px-6 py-3 text-sm font-semibold text-white hover:opacity-90 transition"
            >
              Перейти в каталог
            </Link>

            <Link
              href="/"
              className="inline-flex items-center justify-center rounded-full border border-black/10 bg-white px-6 py-3 text-sm font-semibold text-black/80 hover:border-black/20 transition"
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
