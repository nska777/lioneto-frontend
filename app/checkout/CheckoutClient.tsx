"use client";

import React, {
  useEffect,
  useMemo,
  useState,
  type SyntheticEvent,
} from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Download, X } from "lucide-react";

import { useRegionLang } from "@/app/context/region-lang";
import { useShopState } from "@/app/context/shop-state";
import { CATALOG_BY_ID, BRANDS } from "@/app/lib/mock/catalog-products";
import { fetchProductsMap, type LiteProduct } from "@/app/lib/strapi/products";

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

type Region = "uz" | "ru" | "kz";
type OfferConsent = "accepted" | "declined" | null;

function formatMoney(n: number, region: Region) {
  const v = Number.isFinite(Number(n)) ? Number(n) : 0;

  if (region === "kz") {
    if (v <= 0) return "Цена по запросу";

    try {
      return new Intl.NumberFormat("ru-RU", {
        style: "currency",
        currency: "KZT",
        maximumFractionDigits: 0,
      }).format(v);
    } catch {
      return `${Math.round(v).toLocaleString("ru-RU")} ₸`;
    }
  }

  if (region === "uz") return new Intl.NumberFormat("ru-RU").format(v) + " сум";
  return new Intl.NumberFormat("ru-RU").format(v) + " ₽";
}

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
  priceDeltaKZT?: number;
  priceDeltaKZ?: number;
  image?: string | null;
  gallery?: string[];
};

type CartLineMeta = {
  productId?: string;
  variantId?: string;
  variantTitle?: string | null;
  title?: string;
  href?: string;
  imageUrl?: string | null;
  sku?: string;
  price_uzs?: number;
  price_rub?: number;
  price_kzt?: number;
  priceKZT?: number;
  price_kz?: number;
  priceKZ?: number;

  selectedColor?: string | null;
  selectedVariantKey?: string | null;

  selectedSetItemId?: string | null;
  selectedSetItemTitle?: string | null;
  selectedSetItemOptionKey?: string | null;
  selectedSetItemColorKey?: string | null;
  selectedSetItemArticle?: string | null;
  selectedSetItemNote?: string | null;

  optionTitle?: string | null;
  optionKey?: string | null;
  colorKey?: string | null;

  quantity?: number;
};

type CheckoutItem = {
  key: string;
  productId: string;
  variantId: string;
  article: string;
  qty: number;
  unit: number;
  sum: number;
  title: string;
  collectionLabel: string | null;
  variantTitle: string | null;
  selectedColor: string | null;
  selectedSetItemTitle: string | null;
  selectedSetItemOptionKey: string | null;
  selectedSetItemColorKey: string | null;
  imageUrl: string | null;
};

function metaString(v: unknown): string | null {
  const s = typeof v === "string" ? v.trim() : "";

  return s ? s : null;
}

function asMetaRecord(v: unknown): CartLineMeta | null {
  if (!isRecord(v)) return null;

  return v as CartLineMeta;
}

function metaMatches(
  meta: CartLineMeta | null,
  productId: string,
  variantId: string,
) {
  if (!meta) return false;

  const mp = String(meta.productId ?? "").trim();
  const mv = String(meta.variantId ?? "base").trim() || "base";

  return mp === productId && mv === variantId;
}

function findMetaInValue(
  value: unknown,
  productId: string,
  variantId: string,
): CartLineMeta | null {
  if (!value) return null;

  if (Array.isArray(value)) {
    for (const item of value) {
      const meta = asMetaRecord(item);

      if (metaMatches(meta, productId, variantId)) return meta;
    }

    return null;
  }

  if (!isRecord(value)) return null;

  const directKeys = [
    `${productId}::${variantId}`,
    `${productId}|${variantId}`,
    `${productId}:${variantId}`,
    `${productId}__${variantId}`,
    `${productId}-${variantId}`,
  ];

  for (const key of directKeys) {
    const direct = asMetaRecord(value[key]);
    if (direct) return direct;
  }

  const nested = value[productId];

  if (isRecord(nested)) {
    const byVariant =
      asMetaRecord(nested[variantId]) ||
      asMetaRecord(nested[`variant:${variantId}`]) ||
      asMetaRecord(nested["base"]);

    if (byVariant) return byVariant;
  }

  for (const item of Object.values(value)) {
    const meta = asMetaRecord(item);

    if (metaMatches(meta, productId, variantId)) return meta;

    const nestedMeta = findMetaInValue(item, productId, variantId);
    if (nestedMeta) return nestedMeta;
  }

  return null;
}

function readCartLineMeta(
  productId: string,
  variantId: string,
): CartLineMeta | null {
  if (typeof window === "undefined") return null;

  const preferredKeys = [
    "lioneto:cart-line-meta:v1",
    "lioneto:cart:line-meta:v1",
    "lioneto:cart-line-meta",
    "lioneto:cart:meta",
    "cart-line-meta",
  ];

  for (const key of preferredKeys) {
    const raw = window.localStorage.getItem(key);
    if (!raw) continue;

    try {
      const parsed: unknown = JSON.parse(raw);
      const found = findMetaInValue(parsed, productId, variantId);

      if (found) return found;
    } catch {
      // ignore
    }
  }

  for (let i = 0; i < window.localStorage.length; i += 1) {
    const key = window.localStorage.key(i);
    if (!key) continue;

    const lower = key.toLowerCase();

    if (
      !lower.includes("cart") &&
      !lower.includes("lead") &&
      !lower.includes("meta")
    ) {
      continue;
    }

    const raw = window.localStorage.getItem(key);
    if (!raw) continue;

    try {
      const parsed: unknown = JSON.parse(raw);
      const found = findMetaInValue(parsed, productId, variantId);

      if (found) return found;
    } catch {
      // ignore
    }
  }

  return null;
}

function readMetaPrice(meta: CartLineMeta | null, region: Region): number {
  if (!meta) return 0;

  const raw =
    region === "kz"
      ? (meta.price_kzt ?? meta.priceKZT ?? meta.price_kz ?? meta.priceKZ)
      : region === "uz"
        ? meta.price_uzs
        : meta.price_rub;

  const n = Number(raw);

  return Number.isFinite(n) && n > 0 ? n : 0;
}

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

        out.push({
          id,
          title: title || undefined,
          group: mergedGroup,
          image,
          gallery,
          priceDeltaRUB: toNumSafe(getProp(it, "priceDeltaRUB")),
          priceDeltaUZS: toNumSafe(getProp(it, "priceDeltaUZS")),
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

    out.push({
      id,
      title: title || undefined,
      group: group || undefined,
      image,
      gallery,
      priceDeltaRUB: toNumSafe(getProp(v, "priceDeltaRUB")),
      priceDeltaUZS: toNumSafe(getProp(v, "priceDeltaUZS")),
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
    "gluhie-fasady": "Глухие фасады",
    "zerkalnye-fasady": "Зеркальные фасады",
    "bez-paspartu": "Без паспарту",
    "s-paspartu": "С паспарту",
    "bez-ramki": "Без рамки паспарту",
    "s-ramkoy": "С рамкой паспарту",
  };

  return map[t] ?? token;
}

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

function parseCompositeVariantForCheckout(
  variantId: string,
  variants: VariantLite[],
) {
  const raw = String(variantId ?? "").trim();

  if (!raw || raw === "base") {
    return {
      title: null as string | null,
      image: null as string | null,
      finalPriceUZS: 0,
      finalPriceRUB: 0,
      finalPriceKZT: 0,
    };
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

  const title =
    picked
      .map((v) => {
        const t = v.title ? String(v.title).trim() : "";
        if (t) return t;

        return prettyVariantToken(String(v.id ?? "").trim());
      })
      .filter(Boolean)
      .join(", ") || fallbackVariantTitleFromId(raw);

  const image =
    picked.find((v) => Array.isArray(v.gallery) && v.gallery.length)
      ?.gallery?.[0] ??
    picked.find((v) => !!v.image)?.image ??
    null;

  const finalPriceUZS =
    picked.map((v) => toNumSafe(v.priceDeltaUZS)).find((price) => price > 0) ||
    0;

  const finalPriceRUB =
    picked.map((v) => toNumSafe(v.priceDeltaRUB)).find((price) => price > 0) ||
    0;

  const finalPriceKZT =
    picked
      .map((v) => toNumSafe(v.priceDeltaKZT ?? v.priceDeltaKZ))
      .find((price) => price > 0) || 0;

  return {
    title: title || null,
    image,
    finalPriceUZS,
    finalPriceRUB,
    finalPriceKZT,
  };
}

function resolveVariantTitle(variantId: string, variants: VariantLite[]) {
  const parsed = parseCompositeVariantForCheckout(variantId, variants);

  return parsed.title || fallbackVariantTitleFromId(variantId);
}

function resolveVariantImage(variantId: string, variants: VariantLite[]) {
  const parsed = parseCompositeVariantForCheckout(variantId, variants);

  return parsed.image || null;
}

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

  const mediaRaw = getProp(p, "media");
  const media = toStringSafe(mediaRaw).trim();

  if (media) return media;

  return null;
}

function toAbsoluteUrlClient(urlLike: string | null) {
  const raw = String(urlLike ?? "").trim();

  if (!raw) return null;
  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;

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

  const kz =
    getProp(obj, "priceKZT") ??
    getProp(obj, "price_kzt") ??
    getProp(obj, "priceKZ") ??
    getProp(obj, "price_kz");

  const raw = region === "kz" ? kz : region === "uz" ? uz : ru;
  const n = toNumSafe(raw);

  return n > 0 ? n : 0;
}

function readArticleAny(obj: unknown): string {
  return (
    toStringSafe(getProp(obj, "sku")).trim() ||
    toStringSafe(getProp(obj, "article")).trim() ||
    toStringSafe(getProp(obj, "id")).trim()
  );
}

function joinArticles(
  baseArticle?: string | null,
  childArticle?: string | null,
) {
  const base = String(baseArticle ?? "").trim();
  const child = String(childArticle ?? "").trim();

  if (base && child) return `${base} + ${child}`;
  if (base) return base;
  if (child) return child;

  return "—";
}

function buildArticle(args: {
  metaSku?: string | null;
  baseArticle?: string | null;
  selectedSetItemArticle?: string | null;
}) {
  const metaSku = String(args.metaSku ?? "").trim();

  if (metaSku) return metaSku;

  return joinArticles(args.baseArticle, args.selectedSetItemArticle);
}

function OfferAgreementWindow({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open || typeof document === "undefined") return null;

  const stopAll = (e: SyntheticEvent) => {
    e.stopPropagation();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/55 px-4 py-6"
      onClick={stopAll}
      onMouseDown={stopAll}
      onPointerDown={stopAll}
      onTouchStart={stopAll}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-[920px] flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-5 border-b border-black/10 px-5 py-5 sm:px-7">
          <div>
            <p className="text-[12px] uppercase tracking-[0.22em] text-black/45">
              LIONETO
            </p>

            <h2 className="mt-2 text-[20px] font-semibold leading-tight text-black sm:text-[24px]">
              Договор оферты / Условия продажи товаров
            </h2>

            <p className="mt-2 text-[13px] leading-6 text-black/55">
              Публичная оферта, условия оформления заказа, оплаты, доставки,
              возврата и обработки персональных данных.
            </p>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="shrink-0 cursor-pointer rounded-full p-2 text-black/45 transition hover:bg-black/5 hover:text-black"
            aria-label="Закрыть"
          >
            <X size={22} />
          </button>
        </div>

        <div
          className="overflow-y-auto px-5 py-6 text-[14px] leading-7 text-black/70 sm:px-7"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <div className="mb-6 rounded-[22px] bg-black/[0.03] px-5 py-4">
            <h3 className="text-[18px] font-semibold leading-tight text-black">
              Договор оферты или Условия продажи товаров
            </h3>

            <p className="mt-2 text-[13px] leading-6 text-black/55">
              Данный документ, расположенный на сайте https://lioneto.com/,
              является публичной офертой Продавца и содержит все существенные
              условия продажи, оплаты, доставки, возврата и обмена товаров.
            </p>
          </div>

          <section className="space-y-4">
            <h3 className="text-[17px] font-semibold text-black">
              1. Общие положения
            </h3>

            <p>
              Данный документ является публичной офертой Продавца и содержит все
              существенные условия продажи, оплаты, доставки, возврата и обмена
              товаров, представленных на сайте Продавца.
            </p>

            <p>
              В случае принятия изложенных условий и оформления заказа лицо,
              производящее акцепт оферты, становится Покупателем, а Продавец и
              Покупатель совместно — сторонами договора.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h3 className="text-[17px] font-semibold text-black">
              2. Термины и определения
            </h3>

            <p>
              Покупатель — физическое или юридическое лицо, оформляющее заказы
              на сайте https://lioneto.com/.
            </p>

            <p>
              Интернет-магазин — сайт, где представлены товары, условия
              доставки, оплаты, возврата и обмена.
            </p>

            <p>
              Заказ — запрос Покупателя на покупку товаров, размещенный
              Покупателем самостоятельно на сайте или по телефону.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h3 className="text-[17px] font-semibold text-black">3. Предмет</h3>

            <p>
              Предметом настоящего договора является продажа Покупателю товаров
              и услуг, представленных на сайте Продавца, согласно оформленному
              заказу Покупателя.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h3 className="text-[17px] font-semibold text-black">
              4. Информация о товарах
            </h3>

            <p>
              Товары представлены на сайте через фото-образцы, рендеры и
              описания. Все информационные материалы носят справочный характер.
            </p>

            <p>
              В изделиях могут применяться натуральные материалы природного
              происхождения. Различия тонов, сучки и природные особенности
              материалов не являются дефектами.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h3 className="text-[17px] font-semibold text-black">
              5. Доставка и сборка
            </h3>

            <p>
              Доставка товара осуществляется способом, указанным в заказе или
              согласованным с Покупателем.
            </p>

            <p>
              Продавец считается надлежащим образом выполнившим обязанность по
              передаче товара с момента подписания документа приема-передачи.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h3 className="text-[17px] font-semibold text-black">
              6. Персональная информация
            </h3>

            <p>
              При оформлении заказа Покупатель предоставляет персональные
              данные: имя, номер телефона, адрес доставки и иные необходимые
              сведения.
            </p>

            <p>
              Оформляя заказ, Покупатель подтверждает согласие на обработку
              переданных персональных данных в целях исполнения заказа.
            </p>
          </section>

          <div className="mt-8 flex flex-col gap-3 border-t border-black/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[12px] leading-5 text-black/45">
              Полная версия договора доступна для скачивания в формате Word.
            </p>

            <a
              href="/docs/offer-agreement.docx"
              download="offer-agreement.docx"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-black px-5 py-3 text-[13px] font-medium text-white transition hover:opacity-90"
            >
              <Download size={16} />
              Скачать договор
            </a>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

export default function CheckoutClient() {
  const router = useRouter();
  const sp = useSearchParams();

  const isSuccess = String(sp?.get("success") ?? "") === "1";
  const mode = String(sp?.get("mode") ?? "").toLowerCase();

  const { region } = useRegionLang();
  const shop = useShopState();

  const [offerOpen, setOfferOpen] = useState(false);
  const [offerConsent, setOfferConsent] = useState<OfferConsent>(null);

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

      const meta = readCartLineMeta(pid, vid);

      const qty =
        mode === "oneclick"
          ? Math.max(1, Math.floor(toNumSafe(shop.oneClick?.qty ?? 1)))
          : Math.max(1, Math.floor(toNumSafe(shop.cart[key] ?? 1)));

      const pMockUnknown: unknown = CATALOG_BY_ID.get(pid);
      const pStrapi: LiteProduct | undefined = productsMap[pid];

      const p: unknown = pStrapi ?? pMockUnknown;
      if (!p) continue;

      const variants = flattenVariantsForCheckout(p);
      const parsedVariant = parseCompositeVariantForCheckout(vid, variants);

      const selectedColor = metaString(meta?.selectedColor);

      const selectedSetItemTitle =
        metaString(meta?.selectedSetItemTitle) || metaString(meta?.optionTitle);

      const selectedSetItemOptionKey =
        metaString(meta?.selectedSetItemOptionKey) ||
        metaString(meta?.optionKey);

      const selectedSetItemColorKey =
        metaString(meta?.selectedSetItemColorKey) || metaString(meta?.colorKey);

      const variantTitle =
        [selectedColor, selectedSetItemTitle].filter(Boolean).join(", ") ||
        metaString(meta?.variantTitle) ||
        resolveVariantTitle(vid, variants);

      const baseFromStrapi = readPriceAny(pStrapi, region);
      const baseFromMocks = readPriceAny(pMockUnknown, region);
      const baseUnit = baseFromStrapi || baseFromMocks || 0;

      const selectedVariantFinalPrice =
        region === "uz"
          ? parsedVariant.finalPriceUZS
          : region === "kz"
            ? parsedVariant.finalPriceKZT
            : parsedVariant.finalPriceRUB;

      const metaUnit = readMetaPrice(meta, region);

      const unit =
        metaUnit > 0
          ? metaUnit
          : selectedVariantFinalPrice > 0
            ? selectedVariantFinalPrice
            : baseUnit;

      const brandSlug = toStringSafe(getProp(p, "brand")).trim();
      const collectionLabel = labelByBrandSlug(brandSlug);

      const title =
        metaString(meta?.title) ||
        toStringSafe(getProp(p, "title")).trim() ||
        "Товар";

      const baseArticle =
        readArticleAny(pStrapi) ||
        readArticleAny(pMockUnknown) ||
        readArticleAny(p);

      const article = buildArticle({
        metaSku: metaString(meta?.sku),
        baseArticle,
        selectedSetItemArticle: metaString(meta?.selectedSetItemArticle),
      });

      const imageRaw =
        metaString(meta?.imageUrl) || resolveProductImage(p, vid, variants);

      const imageUrl = toAbsoluteUrlClient(imageRaw);

      out.push({
        key,
        productId: pid,
        variantId: vid,
        article,
        qty,
        unit,
        sum: unit * qty,
        title,
        collectionLabel,
        variantTitle,
        selectedColor,
        selectedSetItemTitle,
        selectedSetItemOptionKey,
        selectedSetItemColorKey,
        imageUrl,
      });
    }

    return out;
  }, [keys, mode, productsMap, region, shop, shop.cart, shop.oneClick]);

  const total = useMemo(
    () => items.reduce((acc, it) => acc + (Number(it.sum) || 0), 0),
    [items],
  );

  const cachedCustomer = useMemo<Record<string, unknown>>(() => {
    if (typeof window === "undefined") return {};

    return safeParseRecord(window.localStorage.getItem(LS_CUSTOMER)) ?? {};
  }, []);

  const [name, setName] = useState(() =>
    toStringSafe(cachedCustomer["name"] ?? ""),
  );
  const [address, setAddress] = useState(() =>
    toStringSafe(cachedCustomer["address"] ?? ""),
  );
  const [comment, setComment] = useState(() =>
    toStringSafe(cachedCustomer["comment"] ?? ""),
  );
  const [phoneDigits, setPhoneDigits] = useState(() =>
    toStringSafe(cachedCustomer["phoneDigits"] ?? ""),
  );

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(
      LS_CUSTOMER,
      JSON.stringify({ name, address, comment, phoneDigits }),
    );
  }, [name, address, comment, phoneDigits]);

  const isPhoneValid = useMemo(() => {
    if (region === "uz") return /^\d{9}$/.test(phoneDigits);

    return String(phoneDigits).trim().length >= 7;
  }, [region, phoneDigits]);

  const hasAcceptedOffer = offerConsent === "accepted";

  const canSubmit = items.length > 0 && isPhoneValid && hasAcceptedOffer;

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
        collectionLabel: it.collectionLabel,
        imageUrl: it.imageUrl,

        variantId: it.variantId,
        variantTitle: it.variantTitle,

        selectedColor: it.selectedColor,
        selectedSetItemTitle: it.selectedSetItemTitle,
        selectedSetItemOptionKey: it.selectedSetItemOptionKey,
        selectedSetItemColorKey: it.selectedSetItemColorKey,

        article: it.article,
        qty: it.qty,
        title: it.title,
        unit: it.unit,
        sum: it.sum,
      })),
      total,
      agreements: {
        offerAccepted: true,
        personalDataAccepted: true,
        acceptedAt: new Date().toISOString(),
      },
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

      setOfferConsent(null);
      setOfferOpen(false);

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
    <>
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
                        Артикул: {items[0].article}
                      </div>

                      <div className="mt-1 text-xs text-black/45">
                        {items[0].qty} × {formatMoney(items[0].unit, region)}
                      </div>

                      {items[0].selectedColor ? (
                        <div className="mt-1 text-xs text-black/45">
                          Цвет:{" "}
                          <span className="font-semibold text-black/70">
                            {items[0].selectedColor}
                          </span>
                        </div>
                      ) : null}

                      {items[0].selectedSetItemTitle ? (
                        <div className="mt-1 text-xs text-black/45">
                          Комплектация:{" "}
                          <span className="font-semibold text-black/70">
                            {items[0].selectedSetItemTitle}
                          </span>
                        </div>
                      ) : items[0].variantTitle &&
                        items[0].variantId !== "base" ? (
                        <div className="mt-1 text-xs text-black/45">
                          Вариант:{" "}
                          <span className="font-semibold text-black/70">
                            {items[0].variantTitle}
                          </span>
                        </div>
                      ) : null}
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
                            <div>
                              {it.collectionLabel ? (
                                <span className="text-black/55">
                                  {it.collectionLabel} /{" "}
                                </span>
                              ) : null}
                              {it.title}
                            </div>

                            <div className="mt-0.5 text-black/45">
                              Артикул: {it.article}
                            </div>

                            <div className="mt-0.5">
                              {it.qty} × {formatMoney(it.unit, region)}
                            </div>

                            {it.selectedColor ? (
                              <div className="mt-0.5 text-black/45">
                                Цвет: {it.selectedColor}
                              </div>
                            ) : null}

                            {it.selectedSetItemTitle ? (
                              <div className="mt-0.5 text-black/45">
                                Комплектация: {it.selectedSetItemTitle}
                              </div>
                            ) : it.variantTitle && it.variantId !== "base" ? (
                              <div className="mt-0.5 text-black/45">
                                Вариант: {it.variantTitle}
                              </div>
                            ) : null}
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

            <div className="mt-5 rounded-[20px] border border-black/10 bg-black/[0.02] px-4 py-4">
              <p className="text-[12px] leading-5 text-black/55">
                Перед подтверждением заказа необходимо ознакомиться с договором
                оферты и дать согласие на обработку персональных данных.
                Подробные условия доступны в{" "}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setOfferOpen(true);
                  }}
                  className="cursor-pointer font-medium text-black underline underline-offset-4 transition hover:text-black/60"
                >
                  договоре оферты
                </button>
                .
              </p>

              <div className="mt-3 space-y-2">
                <label
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-2xl bg-white px-3 py-3 text-[12px] leading-5 text-black/70 ring-1 transition",
                    offerConsent === "accepted"
                      ? "bg-white ring-black"
                      : "ring-black/10 hover:ring-black/20",
                  )}
                >
                  <input
                    type="radio"
                    name="offerConsent"
                    checked={offerConsent === "accepted"}
                    onChange={() => setOfferConsent("accepted")}
                    className="mt-1 h-4 w-4 accent-black"
                  />

                  <span>
                    Я ознакомился с договором оферты, принимаю условия продажи
                    товаров и даю согласие на обработку персональных данных.
                  </span>
                </label>

                <label
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-2xl bg-white px-3 py-3 text-[12px] leading-5 text-black/70 ring-1 transition",
                    offerConsent === "declined"
                      ? "bg-red-50 ring-red-300"
                      : "ring-black/10 hover:ring-black/20",
                  )}
                >
                  <input
                    type="radio"
                    name="offerConsent"
                    checked={offerConsent === "declined"}
                    onChange={() => setOfferConsent("declined")}
                    className="mt-1 h-4 w-4 accent-black"
                  />

                  <span>
                    Я отказываюсь принять договор оферты и понимаю, что
                    оформление заказа будет недоступно.
                  </span>
                </label>
              </div>

              {offerConsent === "declined" ? (
                <p className="mt-3 rounded-2xl bg-red-50 px-3 py-2 text-[12px] leading-5 text-red-700 ring-1 ring-red-100">
                  Без принятия договора оферты и согласия на обработку
                  персональных данных мы не сможем оформить заказ через сайт.
                </p>
              ) : null}
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

      <OfferAgreementWindow
        open={offerOpen}
        onClose={() => setOfferOpen(false)}
      />
    </>
  );
}
