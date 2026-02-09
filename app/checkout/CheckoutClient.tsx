// app/checkout/CheckoutClient.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, CheckCircle2, ChevronLeft } from "lucide-react";

import { useRegionLang } from "../context/region-lang";
import { useShopState } from "../context/shop-state";
import { CATALOG_BY_ID, BRANDS } from "@/app/lib/mock/catalog-products";

import { supabase } from "@/app/lib/supabase/client";

function formatMoney(n: number, region: "uz" | "ru") {
  if (region === "uz") return new Intl.NumberFormat("ru-RU").format(n) + " сум";
  return new Intl.NumberFormat("ru-RU").format(n) + " ₽";
}

function makeOrderId() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const rand = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `LNT-${y}${m}${day}-${rand}`;
}

const LS_CUSTOMER = "lioneto:customer:v1";
const LS_ONECLICK = "lioneto:oneclick:v1";

type CustomerCache = {
  phone?: string;
  name?: string;
  address?: string;
  comment?: string;
};

type ProfileRow = {
  full_name: string | null;
  phone_e164: string | null;
  phone_verified: boolean;
};

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

type VariantAny = {
  id: string;
  title?: string;
  group?: string;
  priceDeltaRUB?: number;
  priceDeltaUZS?: number;
};

function labelByBrandSlug(slug: string | null | undefined) {
  const s = String(slug ?? "")
    .trim()
    .toLowerCase();
  if (!s) return null;
  const found = BRANDS.find((b) => String(b.slug).toLowerCase() === s);
  return found ? found.title : s.toUpperCase();
}

/** ====== UZ PHONE HELPERS ====== */
const UZ_PREFIX = "+998 ";
const UZ_DIGITS = 9;

function onlyDigits(s: string) {
  return String(s || "").replace(/\D/g, "");
}

function formatUzPhone(digits9: string) {
  const d = digits9.slice(0, 9);
  const p1 = d.slice(0, 2);
  const p2 = d.slice(2, 5);
  const p3 = d.slice(5, 7);
  const p4 = d.slice(7, 9);

  let out = UZ_PREFIX;
  if (p1) out += p1;
  if (p2) out += (p1 ? " " : "") + p2;
  if (p3) out += (p2 ? " " : p1 ? " " : "") + p3;
  if (p4) out += (p3 ? " " : p2 ? " " : p1 ? " " : "") + p4;

  return out;
}

function getUzDigitsFromInput(v: string) {
  const raw = String(v || "");
  const stripped = raw.startsWith(UZ_PREFIX)
    ? raw.slice(UZ_PREFIX.length)
    : raw;
  return onlyDigits(stripped).slice(0, UZ_DIGITS);
}

/** ================= Strapi price-entry (client) ================= */

type PriceEntry = {
  productId: string;
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
    const a = item;
    const pid = String(a?.productId ?? "");
    if (!pid) continue;

    map[pid] = {
      productId: pid,
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

/** ✅ composite variant: title + delta sum (как в корзине) */
function resolveCompositeVariant(
  variantId: string,
  variants: VariantAny[],
  region: "uz" | "ru",
) {
  const raw = String(variantId ?? "").trim();
  if (!raw || raw === "base") {
    return { title: null as string | null, delta: 0 };
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

  const delta = picked.reduce((acc, v) => {
    const d =
      region === "uz"
        ? Number(v?.priceDeltaUZS ?? 0)
        : Number(v?.priceDeltaRUB ?? 0);
    return acc + (Number(d ?? 0) || 0);
  }, 0);

  return { title: title || null, delta };
}

export default function CheckoutClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const mode = sp.get("mode"); // "oneclick" | null

  const { region } = useRegionLang();
  const shop = useShopState();

  const goBack = () => {
    if (typeof window === "undefined") return;
    if (window.history.length > 1) router.back();
    else router.push("/cart");
  };

  const [phone, setPhone] = useState(region === "uz" ? UZ_PREFIX : "+7 ");
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [comment, setComment] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [doneOrderId, setDoneOrderId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uzDigitsCount = useMemo(() => {
    if (region !== "uz") return 0;
    return getUzDigitsFromInput(phone).length;
  }, [phone, region]);

  const isPhoneValid = useMemo(() => {
    if (region === "uz") return uzDigitsCount === UZ_DIGITS;
    return phone.trim().length >= 7;
  }, [region, uzDigitsCount, phone]);

  useEffect(() => {
    const c = safeParse<CustomerCache>(localStorage.getItem(LS_CUSTOMER), {});
    if (c.phone) setPhone(c.phone);
    if (c.name) setName(c.name);
    if (c.address) setAddress(c.address);
    if (c.comment) setComment(c.comment);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (region !== "uz") return;
    setPhone((prev) => formatUzPhone(getUzDigitsFromInput(prev)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region]);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const userId = data.session?.user?.id;
        if (!userId) return;

        const { data: prof } = await supabase
          .from("profiles")
          .select("full_name, phone_e164, phone_verified")
          .eq("user_id", userId)
          .single();

        if (!alive) return;

        const p = prof as ProfileRow | null;
        if (p?.full_name && !name) setName(p.full_name);

        if (region !== "uz") {
          if (p?.phone_e164 && (!phone || phone.trim().length < 5)) {
            setPhone(p.phone_e164);
          }
        }
      } catch {
        // молча
      }
    })();

    return () => {
      alive = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region]);

  // ===== items source =====
  const cart = shop.cart ?? {};
  const cartKeys = useMemo(
    () => Object.keys(cart).filter((k) => (cart[k] ?? 0) > 0),
    [cart],
  );

  const oneClick = shop.oneClick ?? null;

  const oneClickFromLS = useMemo(() => {
    if (typeof window === "undefined") return null;
    const oc = safeParse<{ id: string; qty: number } | null>(
      localStorage.getItem(LS_ONECLICK),
      null,
    );
    if (!oc?.id) return null;
    return { id: String(oc.id), qty: Math.max(1, Math.floor(oc.qty || 1)) };
  }, []);

  const effectiveOneClick = oneClick?.id
    ? oneClick
    : oneClickFromLS?.id
      ? oneClickFromLS
      : null;

  // ✅ ids -> Strapi
  const productIds = useMemo(() => {
    const useOneClick = mode === "oneclick";
    const keys = useOneClick
      ? effectiveOneClick?.id
        ? [effectiveOneClick.id]
        : []
      : cartKeys;

    return keys
      .map((key) => {
        const k = String(key);
        const { productId } = shop.parseKey(k);
        return String(productId);
      })
      .filter(Boolean);
  }, [mode, effectiveOneClick, cartKeys, shop]);

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

  const items = useMemo(() => {
    const useOneClick = mode === "oneclick";

    const keys = useOneClick
      ? effectiveOneClick?.id
        ? [effectiveOneClick.id]
        : []
      : cartKeys;

    return keys
      .map((key) => {
        const k = String(key);
        const { productId, variantId } = shop.parseKey(k);

        const p = CATALOG_BY_ID.get(String(productId));
        if (!p) return null;

        const qty = useOneClick
          ? (effectiveOneClick?.qty ?? 1)
          : (cart[k] ?? 1);

        const pe = priceMap[String(productId)];

        const baseUnitFromStrapi =
          region === "uz"
            ? Number(pe?.priceUZS ?? 0)
            : Number(pe?.priceRUB ?? 0);

        const baseUnitFromMock =
          region === "uz"
            ? Number((p as any).price_uzs ?? (p as any).priceUZS ?? 0)
            : Number((p as any).price_rub ?? (p as any).priceRUB ?? 0);

        const baseUnit =
          Number.isFinite(baseUnitFromStrapi) && baseUnitFromStrapi > 0
            ? baseUnitFromStrapi
            : Number(baseUnitFromMock ?? 0) || 0;

        const variants: VariantAny[] = Array.isArray((p as any).variants)
          ? ((p as any).variants as VariantAny[])
          : [];

        const resolved = resolveCompositeVariant(
          String(variantId),
          variants,
          region,
        );

        const unit = baseUnit + resolved.delta;

        const brandSlug = String((p as any).brand ?? "");
        const collectionLabel = labelByBrandSlug(brandSlug);

        const title = String(pe?.title ?? (p as any).title ?? "");

        return {
          key: k,
          productId: String(productId),
          variantId: String(variantId),
          variantTitle: resolved.title,
          title,
          collectionSlug: brandSlug || null,
          collectionLabel,
          qty,
          unit,
          sum: unit * qty,
        };
      })
      .filter(Boolean) as Array<{
      key: string;
      productId: string;
      variantId: string;
      variantTitle: string | null;
      title: string;
      collectionSlug: string | null;
      collectionLabel: string | null;
      qty: number;
      unit: number;
      sum: number;
    }>;
  }, [mode, effectiveOneClick, cartKeys, cart, region, shop, priceMap]);

  const total = useMemo(() => items.reduce((a, b) => a + b.sum, 0), [items]);

  const canSubmit = isPhoneValid && items.length > 0 && !submitting;

  async function submit() {
    setError(null);
    if (!canSubmit) return;

    const orderId = makeOrderId();
    setSubmitting(true);

    try {
      const normalizedPhone =
        region === "uz"
          ? formatUzPhone(getUzDigitsFromInput(phone))
          : phone.trim();

      const cache: CustomerCache = {
        phone: normalizedPhone,
        name: name.trim(),
        address: address.trim(),
        comment: comment.trim(),
      };
      localStorage.setItem(LS_CUSTOMER, JSON.stringify(cache));

      const payload = {
        orderId,
        createdAt: new Date().toLocaleString("ru-RU"),
        region,
        mode: mode === "oneclick" ? "oneclick" : "cart",
        customer: {
          phone: normalizedPhone,
          name: name.trim() || undefined,
          address: address.trim() || undefined,
          comment: comment.trim() || undefined,
        },
        items: items.map((it) => ({
          id: it.productId,
          collection: it.collectionSlug || undefined,
          collectionLabel: it.collectionLabel || undefined,
          variantId: it.variantId,
          variantTitle: it.variantTitle || undefined,
          qty: it.qty,
          unit: it.unit,
          sum: it.sum,
          title: it.title,
        })),
        total,
        meta: { mode: mode === "oneclick" ? "oneclick" : "cart" },
      };

      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const j = await res.json().catch(() => ({}));
      if (!res.ok || !j?.ok) {
        throw new Error(j?.error || j?.details || "Ошибка отправки заказа");
      }

      setDoneOrderId(orderId);

      if (mode === "oneclick") shop.clearOneClick?.();
      else shop.clearCart?.();
    } catch (e: any) {
      setError(e?.message || "Ошибка");
    } finally {
      setSubmitting(false);
    }
  }

  if (doneOrderId) {
    return (
      <main className="mx-auto w-full max-w-[900px] px-4 py-14">
        <div className="rounded-3xl border border-black/10 bg-white p-8">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-black/5">
              <CheckCircle2 className="h-6 w-6 text-black/70" />
            </div>
            <div>
              <div className="text-xl font-semibold tracking-[-0.02em]">
                Ваш заказ оформлен
              </div>
              <div className="mt-1 text-sm text-black/60">
                Номер заказа:{" "}
                <span className="font-medium text-black">{doneOrderId}</span>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/catalog"
              className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-medium text-black/75 hover:text-black hover:border-black/20 transition cursor-pointer"
            >
              В каталог <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-full bg-black px-5 py-3 text-sm font-medium text-white hover:opacity-90 transition cursor-pointer"
            >
              На главную <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <p className="mt-5 text-xs text-black/45">
            Менеджер увидит заказ в Telegram и свяжется с вами.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-10">
      <button
        type="button"
        onClick={goBack}
        className="mb-5 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-black/70 hover:text-black hover:border-black/20 transition cursor-pointer"
      >
        <ChevronLeft className="h-4 w-4" />
        Назад
      </button>

      <div>
        <div className="text-[12px] tracking-[0.28em] text-black/45">
          LIONETO
        </div>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.02em]">
          Оформление заказа
        </h1>
        <p className="mt-2 text-sm text-black/55">
          Введите данные, проверьте заказ и подтвердите.
        </p>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
        <section className="rounded-3xl border border-black/10 bg-white p-5">
          <div className="text-base font-semibold">Данные клиента</div>

          <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
            <label className="block">
              <div className="text-xs text-black/50">Телефон *</div>

              <input
                value={phone}
                onChange={(e) => {
                  const v = e.target.value;

                  if (region !== "uz") {
                    setPhone(v);
                    return;
                  }

                  const digits = getUzDigitsFromInput(v);
                  setPhone(formatUzPhone(digits));
                }}
                onFocus={() => {
                  if (region === "uz") {
                    setPhone((prev) =>
                      formatUzPhone(getUzDigitsFromInput(prev)),
                    );
                  }
                }}
                onKeyDown={(e) => {
                  if (region !== "uz") return;

                  const input = e.currentTarget;
                  const start = input.selectionStart ?? 0;
                  const end = input.selectionEnd ?? 0;

                  if (
                    (e.key === "Backspace" || e.key === "Delete") &&
                    start <= UZ_PREFIX.length &&
                    end <= UZ_PREFIX.length
                  ) {
                    e.preventDefault();
                  }
                }}
                className="mt-1 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/25"
                placeholder={
                  region === "uz" ? "+998 91 123 45 67" : "+7 999 123 45 67"
                }
                inputMode="tel"
              />
            </label>

            <label className="block">
              <div className="text-xs text-black/50">Имя</div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/25"
                placeholder="Роман"
              />
            </label>

            <label className="block md:col-span-2">
              <div className="text-xs text-black/50">Адрес</div>
              <input
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="mt-1 w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/25"
                placeholder="Город, улица, дом"
              />
            </label>

            <label className="block md:col-span-2">
              <div className="text-xs text-black/50">Комментарий</div>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="mt-1 min-h-[96px] w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm outline-none focus:border-black/25"
                placeholder="Например: позвонить после 18:00"
              />
            </label>
          </div>

          {error && (
            <div className="mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {error}
            </div>
          )}
        </section>

        <aside className="h-fit rounded-3xl border border-black/10 bg-white p-5">
          <div className="text-base font-semibold">Ваш заказ</div>

          <div className="mt-4 space-y-3">
            {items.length ? (
              items.map((it) => (
                <div
                  key={it.key}
                  className="flex items-start justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">
                      {it.collectionLabel ? (
                        <span className="text-black/55">
                          {it.collectionLabel} /{" "}
                        </span>
                      ) : null}
                      {it.title}
                    </div>

                    {it.variantTitle && it.variantId !== "base" && (
                      <div className="mt-1 text-[12px] text-black/55">
                        Вариант:{" "}
                        <span className="font-semibold text-black/75">
                          {it.variantTitle}
                        </span>
                      </div>
                    )}

                    <div className="mt-1 text-xs text-black/45">
                      {it.qty} × {formatMoney(it.unit, region)}
                    </div>
                  </div>

                  <div className="text-sm font-semibold">
                    {formatMoney(it.sum, region)}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-black/55">Товар не выбран</div>
            )}
          </div>

          <div className="mt-5 h-px bg-black/10" />

          <div className="mt-4 flex items-center justify-between text-sm">
            <span className="text-black/60">Итого</span>
            <span className="font-semibold">{formatMoney(total, region)}</span>
          </div>

          <button
            type="button"
            onClick={submit}
            disabled={!canSubmit}
            className={`mt-5 inline-flex w-full items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-medium transition ${
              canSubmit
                ? "bg-black text-white hover:opacity-90 cursor-pointer"
                : "bg-black/10 text-black/40"
            }`}
          >
            {submitting ? "Оформляем..." : "Подтвердить заказ"}
            <ArrowRight className="h-4 w-4" />
          </button>

          <Link
            href="/cart"
            className="mt-3 inline-flex w-full items-center justify-center rounded-full border border-black/10 bg-white px-5 py-3 text-sm font-medium text-black/75 hover:text-black hover:border-black/20 transition cursor-pointer"
          >
            Вернуться в корзину
          </Link>

          <p className="mt-4 text-xs text-black/45">
            * Оплаты нет — заказ улетает менеджеру в Telegram.
          </p>
        </aside>
      </div>
    </main>
  );
}
