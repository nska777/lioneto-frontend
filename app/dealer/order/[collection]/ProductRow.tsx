"use client";

import Image from "next/image";
import { Check, ImageIcon, Minus, Plus, ShoppingCart } from "lucide-react";

import type {
  DealerCountryCode,
  DealerProduct,
  DealerProductPriceMap,
  DealerProductVariant,
} from "@/app/lib/dealer/shop";
import type { ProductDraft } from "./types";
import { formatMoney, cn } from "./utils";

type Props = {
  product: DealerProduct;
  country: DealerCountryCode;
  draft: ProductDraft;
  isInCart: boolean;
  myReservedQty?: number;
  onIncreaseQty: (productId: string) => void;
  onDecreaseQty: (productId: string) => void;
  onOpenModal: (product: DealerProduct) => void;
  onOpenImagePreview: (product: DealerProduct) => void;
  onToggleCart: (productId: string) => void;
};

type ProductVariantWithMeta = DealerProductVariant & {
  variantSku?: string;
  article?: string;
  articleShort?: string;
  size?: string;
  material?: string;
};

type ProductWithBadgeAndOldPrice = DealerProduct & {
  collectionBadge?: string;
  oldPrice?: Partial<DealerProductPriceMap>;
};

function formatDealerMoney(value: number, country: DealerCountryCode) {
  const formatted = formatMoney(value, country);

  if (country === "UZ") {
    return formatted.replace("UZS", "сум");
  }

  return formatted;
}

function getVariantMeta(
  variant: DealerProductVariant | null | undefined,
): ProductVariantWithMeta | null {
  return variant ? (variant as ProductVariantWithMeta) : null;
}

function getSelectedVariant(product: DealerProduct, draft: ProductDraft) {
  const variants = product.variants ?? [];

  if (!variants.length) return null;

  const selectedKey = draft.selectedVariantKey ?? "";

  if (selectedKey) {
    return (
      variants.find((variant) => variant.key === selectedKey) ?? variants[0]
    );
  }

  return variants[0];
}

function getDisplayArticle(product: DealerProduct, draft: ProductDraft) {
  const variant = getVariantMeta(getSelectedVariant(product, draft));

  return (
    variant?.variantSku ||
    variant?.article ||
    product.articleShort ||
    product.article ||
    "—"
  );
}

function getDisplayImage(product: DealerProduct, draft: ProductDraft) {
  const variant = getSelectedVariant(product, draft);

  return variant?.image || product.image || "";
}

function getUnitPrice(
  product: DealerProduct,
  draft: ProductDraft,
  country: DealerCountryCode,
) {
  const variant = getSelectedVariant(product, draft);
  const variantPrice = variant?.price?.[country];

  if (typeof variantPrice === "number" && variantPrice > 0) {
    return variantPrice;
  }

  return product.price[country] ?? 0;
}

function getOldUnitPrice(product: DealerProduct, country: DealerCountryCode) {
  const oldPrice = (product as ProductWithBadgeAndOldPrice).oldPrice?.[country];

  return typeof oldPrice === "number" && oldPrice > 0 ? oldPrice : 0;
}

function getDiscountPercent(currentPrice: number, oldPrice: number) {
  if (oldPrice <= 0) return 0;
  if (currentPrice <= 0) return 0;
  if (currentPrice >= oldPrice) return 0;

  return Math.round(((oldPrice - currentPrice) / oldPrice) * 100);
}

function getBadgeClasses(badge: string) {
  const normalized = badge.trim().toLowerCase();

  if (normalized.includes("хит")) {
    return "border-sky-200 bg-sky-50 text-sky-700";
  }

  if (normalized.includes("цена")) {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (
    normalized.includes("акция") ||
    normalized.includes("распрод") ||
    normalized.includes("супер")
  ) {
    return "border-red-200 bg-red-50 text-red-700";
  }

  return "border-amber-200 bg-amber-50 text-amber-700";
}

export default function ProductRow({
  product,
  country,
  draft,
  isInCart,
  myReservedQty = 0,
  onIncreaseQty,
  onDecreaseQty,
  onOpenModal,
  onOpenImagePreview,
  onToggleCart,
}: Props) {
  const quantity = Math.max(1, Number(draft.quantity ?? 1));

  const unitPrice = getUnitPrice(product, draft, country);
  const oldUnitPrice = getOldUnitPrice(product, country);

  const totalPrice = unitPrice * quantity;
  const oldTotalPrice = oldUnitPrice * quantity;

  const discountPercent = getDiscountPercent(unitPrice, oldUnitPrice);

  const article = getDisplayArticle(product, draft);
  const image = getDisplayImage(product, draft);
  const badge = String(
    (product as ProductWithBadgeAndOldPrice).collectionBadge ?? "",
  ).trim();

  const hasKit =
    (product.requiredItems?.length ?? 0) > 0 ||
    (product.recommendedItems?.length ?? 0) > 0 ||
    (product.addons?.length ?? 0) > 0;

  return (
    <article
      className={cn(
        "group relative overflow-hidden rounded-[18px] border bg-white shadow-[0_14px_34px_-30px_rgba(0,0,0,0.35)] transition",
        "hover:-translate-y-0.5 hover:border-black/20 hover:shadow-[0_18px_40px_-30px_rgba(0,0,0,0.42)]",
        isInCart
          ? "border-emerald-300 ring-1 ring-emerald-200"
          : "border-black/10",
      )}
    >
      <div className="relative h-[210px] w-full overflow-hidden bg-[#f5f3ef]">
        <button
          type="button"
          onClick={() => {
            if (image) onOpenImagePreview(product);
          }}
          className={cn(
            "relative block h-full w-full",
            image ? "cursor-zoom-in" : "cursor-default",
          )}
        >
          {image ? (
            <Image
              src={image}
              alt={product.title}
              fill
              className="object-contain p-3 transition duration-300 group-hover:scale-[1.03]"
              sizes="(max-width: 1024px) 100vw, 360px"
            />
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-black/30">
              <ImageIcon className="h-7 w-7" />
              <span className="text-[12px] font-medium">Нет фото</span>
            </div>
          )}
        </button>
      </div>

      <div className="p-4">
        <div className="mb-3 flex min-h-[26px] flex-wrap items-center gap-1.5">
          {discountPercent > 0 ? (
            <span className="inline-flex rounded-[8px] bg-red-100 px-2.5 py-1 text-[12px] font-bold leading-none text-red-600">
              -{discountPercent}%
            </span>
          ) : null}

          {badge ? (
            <span
              className={cn(
                "inline-flex max-w-full truncate rounded-[8px] border px-2.5 py-1 text-[11px] font-semibold leading-none",
                getBadgeClasses(badge),
              )}
            >
              {badge}
            </span>
          ) : null}

          {hasKit ? (
            <span className="inline-flex rounded-[8px] border border-amber-200 bg-amber-50 px-2.5 py-1 text-[11px] font-semibold leading-none text-amber-700">
              Комплект
            </span>
          ) : null}

          {isInCart ? (
            <span className="inline-flex items-center gap-1 rounded-[8px] border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-semibold leading-none text-emerald-700">
              <Check className="h-3 w-3" />В корзине
            </span>
          ) : null}
        </div>

        <h3 className="line-clamp-2 min-h-[38px] text-[15px] font-semibold leading-[1.25] tracking-[-0.02em] text-black">
          {product.title}
        </h3>

        <div className="mt-2 truncate text-[12px] font-medium text-black/50">
          Артикул:{" "}
          <span className="font-semibold text-black/70">{article}</span>
        </div>

        <div className="mt-3">
          <div className="flex flex-wrap items-end gap-x-2 gap-y-1">
            <div className="text-[21px] font-semibold leading-none tracking-[-0.04em] text-black">
              {formatDealerMoney(totalPrice, country)}
            </div>

            {discountPercent > 0 ? (
              <div className="pb-[1px] text-[14px] font-semibold leading-none text-black/45 line-through decoration-black/45 decoration-2">
                {formatDealerMoney(oldTotalPrice, country)}
              </div>
            ) : null}
          </div>
        </div>

        {myReservedQty > 0 ? (
          <div className="mt-2 inline-flex rounded-[8px] border border-red-200 bg-red-50 px-2.5 py-1 text-[11px] font-semibold leading-none text-red-700">
            Моя бронь: {myReservedQty}
          </div>
        ) : null}

        <div className="mt-4 grid grid-cols-[104px_minmax(0,1fr)] gap-2">
          <div className="flex h-10 items-center justify-between rounded-full border border-black/10 bg-white px-1.5">
            <button
              type="button"
              onClick={() => onDecreaseQty(product.id)}
              className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-black transition hover:bg-black/5"
              aria-label="Уменьшить количество"
            >
              <Minus className="h-3.5 w-3.5" />
            </button>

            <span className="min-w-[24px] text-center text-[13px] font-semibold text-black">
              {quantity}
            </span>

            <button
              type="button"
              onClick={() => onIncreaseQty(product.id)}
              className="inline-flex h-7 w-7 cursor-pointer items-center justify-center rounded-full text-black transition hover:bg-black/5"
              aria-label="Увеличить количество"
            >
              <Plus className="h-3.5 w-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => onOpenModal(product)}
            className="inline-flex h-10 cursor-pointer items-center justify-center rounded-full border border-black/10 bg-white px-3 text-[12px] font-semibold tracking-[0.04em] text-black transition hover:border-black/25 hover:bg-black/[0.03]"
          >
            Открыть товар
          </button>
        </div>

        <button
          type="button"
          onClick={() => onToggleCart(product.id)}
          className={cn(
            "mt-2 inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-full px-3 text-[12px] font-semibold tracking-[0.04em] transition",
            isInCart
              ? "border border-emerald-600 bg-emerald-600 text-white hover:bg-emerald-700"
              : "border border-black bg-black text-white hover:opacity-90",
          )}
        >
          <ShoppingCart className="h-3.5 w-3.5" />
          {isInCart ? "Убрать из корзины" : "Добавить в корзину"}
        </button>
      </div>
    </article>
  );
}
