"use client";

import Image from "next/image";
import { AlertCircle, Download, PackageCheck, X, ZoomIn } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type {
  DealerCountryCode,
  DealerProduct,
  DealerProductVariant,
} from "@/app/lib/dealer/shop";
import type { ProductDraft } from "./types";
import type { AddonDraftState } from "./product-modal.types";
import ColorVariantButton from "./ColorVariantButton";
import ImagePreviewModal from "./ImagePreviewModal";
import QtyControl from "./QtyControl";
import RecommendedQuickAddCard from "./RecommendedQuickAddCard";
import RequiredStepRow from "./RequiredStepRow";
import { getDisplayArticle } from "./order-utils";
import { formatMoney, cn } from "./utils";

type ProductModalProps = {
  product: DealerProduct | null;
  country: DealerCountryCode;
  draft: ProductDraft | null;
  isOpen: boolean;
  onClose: () => void;
  onIncreaseQty: (productId: string) => void;
  onDecreaseQty: (productId: string) => void;
  onToggleCart: (productId: string) => void;
  onSelectVariant: (
    productId: string,
    variantKey: string,
    color: string,
  ) => void;
  onSelectAddonVariant?: (
    addonId: string,
    variantKey: string,
    color: string,
  ) => void;
  onOpenRelatedProduct?: (productId: string) => void;
  isInCart: boolean;
  addonDrafts?: Record<string, AddonDraftState>;
  onIncreaseAddonQty?: (addonId: string) => void;
  onDecreaseAddonQty?: (addonId: string) => void;
  onToggleAddonCart?: (addonId: string) => void;
};

function getVariantPrice(
  variant: DealerProductVariant | null | undefined,
  country: DealerCountryCode,
): number {
  return variant?.price?.[country] ?? 0;
}

function getInstructionLabel(product: DealerProduct | null): string {
  const title = product?.assemblyInstructionTitle?.trim();
  if (title) return title;

  const fileName = product?.assemblyInstructionFile?.name?.trim();
  if (fileName) return fileName;

  return "Скачать PDF";
}

function getInstructionDownloadHref(product: DealerProduct | null): string {
  const rawUrl = product?.assemblyInstructionFile?.url?.trim();
  if (!rawUrl) return "";

  const fileName =
    product?.assemblyInstructionFile?.name?.trim() ||
    `${product?.title || "assembly-instruction"}.pdf`;

  const params = new URLSearchParams({
    url: rawUrl,
    name: fileName,
  });

  return `/api/dealer/download?${params.toString()}`;
}

export default function ProductDetailsModal({
  product,
  country,
  draft,
  isOpen,
  onClose,
  onIncreaseQty,
  onDecreaseQty,
  onToggleCart,
  onSelectVariant,
  onSelectAddonVariant,
  onOpenRelatedProduct,
  isInCart,
  addonDrafts,
  onIncreaseAddonQty,
  onDecreaseAddonQty,
  onToggleAddonCart,
}: ProductModalProps) {
  const [previewImage, setPreviewImage] = useState<{
    src: string;
    title: string;
  } | null>(null);

  const [selectedVariantKey, setSelectedVariantKey] = useState<string>("");

  const safeProduct = product;
  const safeDraft = draft;

  const colorVariants = useMemo(
    () => safeProduct?.variants ?? [],
    [safeProduct],
  );

  useEffect(() => {
    if (!safeProduct) {
      setSelectedVariantKey((prev) => (prev === "" ? prev : ""));
      return;
    }

    const draftVariantKey = draft?.selectedVariantKey ?? "";
    const hasDraftVariant = colorVariants.some(
      (item) => item.key === draftVariantKey,
    );

    if (hasDraftVariant) {
      setSelectedVariantKey((prev) =>
        prev === draftVariantKey ? prev : draftVariantKey,
      );
      return;
    }

    const firstVariant = colorVariants[0] ?? null;
    const firstVariantKey = firstVariant?.key ?? "";

    setSelectedVariantKey((prev) =>
      prev === firstVariantKey ? prev : firstVariantKey,
    );

    if (
      safeProduct.id &&
      firstVariant &&
      draft?.selectedVariantKey !== firstVariant.key
    ) {
      onSelectVariant(safeProduct.id, firstVariant.key, firstVariant.label);
    }
  }, [
    safeProduct?.id,
    colorVariants,
    draft?.selectedVariantKey,
    onSelectVariant,
  ]);

  const selectedVariant = useMemo(() => {
    if (!colorVariants.length) return null;

    return (
      colorVariants.find((item) => item.key === selectedVariantKey) ??
      colorVariants[0] ??
      null
    );
  }, [colorVariants, selectedVariantKey]);

  const selectedImage =
    selectedVariant?.image && selectedVariant.image.trim().length > 0
      ? selectedVariant.image
      : safeProduct?.image || "";

  const selectedColorLabel = selectedVariant?.label || safeProduct?.color || "";

  const displayArticle = getDisplayArticle(
    safeProduct?.article,
    safeProduct?.articleShort,
    selectedColorLabel,
  );

  const requiredItems = safeProduct?.requiredItems ?? [];
  const recommendedItems = safeProduct?.recommendedItems ?? [];
  const legacyItems = safeProduct?.addons ?? [];

  const fallbackRequired = legacyItems.filter(
    (item) => item.kind === "required",
  );
  const fallbackRecommended = legacyItems.filter(
    (item) => item.kind === "recommended",
  );

  const finalRequiredItems =
    requiredItems.length > 0 ? requiredItems : fallbackRequired;
  const finalRecommendedItems =
    recommendedItems.length > 0 ? recommendedItems : fallbackRecommended;

  const basePrice = safeProduct ? (safeProduct.price[country] ?? 0) : 0;
  const variantPrice = selectedVariant
    ? getVariantPrice(selectedVariant, country)
    : 0;

  const effectivePrice = selectedVariant ? variantPrice : basePrice;
  const mainTotal = effectivePrice * (safeDraft?.quantity ?? 1);

  const instructionHref = getInstructionDownloadHref(safeProduct);
  const instructionLabel = getInstructionLabel(safeProduct);

  const requiredProgress = useMemo(() => {
    if (!finalRequiredItems.length) {
      return {
        total: 0,
        completed: 0,
        hasAnySelected: true,
        done: true,
        remaining: 0,
      };
    }

    let completed = 0;

    finalRequiredItems.forEach((item) => {
      const state = addonDrafts?.[item.id];
      const minQty = item.minQuantity ?? 1;
      const qty = Math.max(0, state?.quantity ?? 0);

      if (state?.isInCart && qty >= minQty) {
        completed += 1;
      }
    });

    return {
      total: finalRequiredItems.length,
      completed,
      hasAnySelected: completed > 0,
      done: completed === finalRequiredItems.length,
      remaining: Math.max(finalRequiredItems.length - completed, 0),
    };
  }, [finalRequiredItems, addonDrafts]);

  const hasRequiredItems = finalRequiredItems.length > 0;
  const canAddMainProduct = requiredProgress.done;
  const isKitAssembled = hasRequiredItems && requiredProgress.done && isInCart;

  if (!isOpen || !safeProduct || !safeDraft) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/50 p-0 sm:p-2 md:p-4"
      onClick={onClose}
    >
      <div className="flex min-h-full items-end justify-center sm:items-center">
        <div
          className="relative w-full max-w-[1240px] rounded-t-[24px] bg-white shadow-[0_30px_90px_-30px_rgba(0,0,0,0.35)] sm:rounded-[28px]"
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-3 z-20 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-black/10 bg-white text-black/60 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600 sm:right-4 sm:top-4"
          >
            <X className="h-5 w-5" />
          </button>

          <div
            className={cn(
              "max-h-[92vh] overflow-x-hidden overflow-y-auto px-3 pb-3 pt-3 sm:px-4 sm:pb-4 sm:pt-4 md:px-6 md:pb-6 md:pt-6",
              "[scrollbar-width:thin]",
              "[scrollbar-color:rgba(0,0,0,0.22)_transparent]",
              "[&::-webkit-scrollbar]:w-[6px]",
              "[&::-webkit-scrollbar-track]:bg-transparent",
              "[&::-webkit-scrollbar-thumb]:rounded-full",
              "[&::-webkit-scrollbar-thumb]:bg-black/20",
            )}
          >
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
              <div className="min-w-0">
                <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)] xl:grid-cols-[280px_minmax(0,1fr)]">
                  <button
                    type="button"
                    onClick={() =>
                      setPreviewImage({
                        src: selectedImage,
                        title: safeProduct.title,
                      })
                    }
                    className="group relative h-[220px] w-full overflow-hidden rounded-[20px] bg-[#f1f1ed] text-left sm:h-[260px] md:h-[300px] md:rounded-[24px]"
                  >
                    <Image
                      src={selectedImage}
                      alt={safeProduct.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-[1.02]"
                      sizes="(max-width: 1024px) 100vw, 280px"
                      priority
                    />

                    <div className="pointer-events-none absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full border border-black/10 bg-white/90 text-black/65 shadow-sm">
                      <ZoomIn className="h-4 w-4" />
                    </div>
                  </button>

                  <div className="rounded-[20px] border border-black/8 bg-white p-4 md:rounded-[24px] md:p-5">
                    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <div className="text-[22px] font-semibold leading-[1.08] tracking-[-0.03em] text-black sm:text-[26px] md:text-[30px]">
                          {safeProduct.title}
                        </div>

                        <div className="mt-3 space-y-2 text-[13px] sm:text-[14px]">
                          <div className="flex flex-wrap items-baseline gap-x-1.5">
                            <span className="text-black/45">Артикул:</span>
                            <span className="font-medium text-black">
                              {displayArticle}
                            </span>
                          </div>

                          {selectedColorLabel ? (
                            <div className="flex flex-wrap items-baseline gap-x-1.5">
                              <span className="text-black/45">Цвет:</span>
                              <span className="font-medium text-black">
                                {selectedColorLabel}
                              </span>
                            </div>
                          ) : null}

                          {safeProduct.size ? (
                            <div className="flex flex-wrap items-baseline gap-x-1.5">
                              <span className="text-black/45">Габариты:</span>
                              <span className="font-medium text-black">
                                {safeProduct.size}
                              </span>
                            </div>
                          ) : null}

                          {safeProduct.material ? (
                            <div className="flex flex-wrap items-baseline gap-x-1.5">
                              <span className="text-black/45">Материал:</span>
                              <span className="font-medium text-black">
                                {safeProduct.material}
                              </span>
                            </div>
                          ) : null}

                          {instructionHref ? (
                            <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1">
                              <span className="text-black/45">Инструкция:</span>
                              <a
                                href={instructionHref}
                                className="inline-flex items-center gap-1.5 rounded-[10px] border border-black/10 bg-[#f7f5f0] px-3 py-1.5 font-medium text-black transition hover:border-black/20 hover:bg-[#f1eee8]"
                              >
                                <Download className="h-4 w-4 shrink-0" />
                                <span>{instructionLabel}</span>
                              </a>
                            </div>
                          ) : null}
                        </div>
                      </div>

                      {requiredProgress.total > 0 ? (
                        <div
                          className={cn(
                            "inline-flex w-fit items-center gap-2 rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em]",
                            isKitAssembled
                              ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border border-red-200 bg-red-50 text-red-700",
                          )}
                        >
                          {isKitAssembled ? (
                            <PackageCheck className="h-4 w-4" />
                          ) : (
                            <AlertCircle className="h-4 w-4" />
                          )}
                          {isKitAssembled
                            ? "Комплект собран"
                            : "Соберите комплект"}
                        </div>
                      ) : (
                        <div className="inline-flex w-fit items-center gap-2 rounded-full border border-black/10 bg-[#f5f5f3] px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em] text-black/55">
                          Без обязательного комплекта
                        </div>
                      )}
                    </div>

                    {colorVariants.length > 0 ? (
                      <div className="mt-5 rounded-[18px] bg-[#f7f5f0] p-3 sm:p-4">
                        <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                          <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-black/45">
                            Цвет
                          </div>
                          <div className="text-[12px] text-black/40">
                            Выберите оттенок
                          </div>
                        </div>

                        <div className="mt-3 flex flex-wrap gap-2">
                          {colorVariants.map((variant) => (
                            <ColorVariantButton
                              key={variant.key}
                              variant={variant}
                              selected={variant.key === selectedVariantKey}
                              country={country}
                              onClick={() => {
                                setSelectedVariantKey(variant.key);
                                onSelectVariant(
                                  safeProduct.id,
                                  variant.key,
                                  variant.label,
                                );
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    ) : null}

                    {safeProduct.description ? (
                      <p className="mt-4 text-[14px] leading-6 text-black/60">
                        {safeProduct.description}
                      </p>
                    ) : null}

                    {requiredProgress.total > 0 ? (
                      <div className="mt-4 rounded-[18px] bg-[#f6f5f2] p-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-[13px] font-semibold text-black">
                            Сборка комплекта
                          </div>
                          <div className="text-[12px] text-black/50">
                            {requiredProgress.completed} из{" "}
                            {requiredProgress.total}
                          </div>
                        </div>

                        <div className="mt-2 h-2 overflow-hidden rounded-full bg-black/8">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all",
                              requiredProgress.done
                                ? "bg-emerald-500"
                                : "bg-amber-400",
                            )}
                            style={{
                              width: `${
                                requiredProgress.total === 0
                                  ? 100
                                  : (requiredProgress.completed /
                                      requiredProgress.total) *
                                    100
                              }%`,
                            }}
                          />
                        </div>

                        <div
                          className={cn(
                            "mt-2 text-[12px]",
                            requiredProgress.done
                              ? "text-emerald-700"
                              : "text-amber-700",
                          )}
                        >
                          {requiredProgress.done
                            ? isInCart
                              ? "Все обязательные элементы выбраны. Комплект собран."
                              : "Все обязательные элементы выбраны. Нажмите «Собрать комплект»."
                            : "Необходимо добавить еще комплектующие."}
                        </div>
                      </div>
                    ) : null}
                  </div>
                </div>

                <section className="mt-5 rounded-[20px] border border-black/8 bg-[#fbfaf7] p-4 md:rounded-[24px] md:p-5">
                  <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
                    <div>
                      <div className="text-[18px] font-semibold tracking-[-0.02em] text-black sm:text-[20px]">
                        Обязательная комплектация
                      </div>
                      <div className="mt-1 text-[13px] text-black/55">
                        Для сборки основного товара необходимо выбрать все
                        обязательные комплектующие.
                      </div>
                    </div>

                    {requiredProgress.total > 0 ? (
                      <div
                        className={cn(
                          "inline-flex w-fit rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em]",
                          requiredProgress.done
                            ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
                            : "border border-amber-200 bg-amber-50 text-amber-700",
                        )}
                      >
                        {requiredProgress.done ? "Готово" : "Нужно выбрать"}
                      </div>
                    ) : null}
                  </div>

                  {finalRequiredItems.length > 0 ? (
                    <div className="mt-4 space-y-3">
                      {finalRequiredItems.map((addon) => {
                        const addonState = addonDrafts?.[addon.id] ?? {
                          quantity: addon.defaultQuantity ?? 1,
                          isInCart: false,
                          markupPercent: 0,
                          selectedVariantKey: "",
                          selectedColor: "",
                        };

                        return (
                          <RequiredStepRow
                            key={addon.id}
                            addon={addon}
                            country={country}
                            addonState={addonState}
                            onIncreaseAddonQty={onIncreaseAddonQty}
                            onDecreaseAddonQty={onDecreaseAddonQty}
                            onToggleAddonCart={onToggleAddonCart}
                            onOpenImage={(src, title) =>
                              setPreviewImage({ src, title })
                            }
                          />
                        );
                      })}
                    </div>
                  ) : (
                    <div className="mt-4 rounded-[18px] border border-dashed border-black/12 bg-white px-4 py-5 text-[14px] text-black/50">
                      Для этого товара обязательные комплектующие пока не
                      заданы.
                    </div>
                  )}
                </section>
              </div>

              <div className="min-w-0">
                <div className="rounded-[20px] border border-black/8 bg-[#f5f2eb] p-4 md:rounded-[24px] md:p-5 xl:sticky xl:top-4">
                  <div className="text-[18px] font-semibold tracking-[-0.02em] text-black">
                    Основной товар
                  </div>

                  <div className="mt-4 rounded-[18px] bg-white p-4">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[12px] text-black/45">Цена</span>
                      <span className="text-[20px] font-semibold leading-none text-black sm:text-[22px]">
                        {formatMoney(effectivePrice, country)}
                      </span>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                      <span className="text-[14px] font-medium text-black/70">
                        Кол-во
                      </span>

                      <QtyControl
                        value={safeDraft.quantity}
                        onMinus={() => onDecreaseQty(safeProduct.id)}
                        onPlus={() => onIncreaseQty(safeProduct.id)}
                      />
                    </div>

                    <div className="mt-4 border-t border-black/8 pt-4">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[12px] text-black/45">Сумма</span>
                        <span className="text-[18px] font-semibold leading-none text-black">
                          {formatMoney(mainTotal, country)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {hasRequiredItems &&
                  requiredProgress.total > 0 &&
                  !requiredProgress.done ? (
                    <div className="mt-4 rounded-[16px] border border-amber-200 bg-amber-50 px-4 py-3">
                      <div className="flex items-start gap-3">
                        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                        <div>
                          <div className="text-[13px] font-semibold text-black">
                            Не все обязательные комплектующие выбраны
                          </div>
                          <div className="mt-1 text-[12px] leading-5 text-black/55">
                            Добавьте все обязательные позиции, после этого
                            кнопка «Собрать комплект» станет активной.
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : null}

                  <button
                    type="button"
                    onClick={() => {
                      if (hasRequiredItems && !canAddMainProduct) return;
                      onToggleCart(safeProduct.id);
                    }}
                    disabled={hasRequiredItems ? !canAddMainProduct : false}
                    className={cn(
                      "mt-4 inline-flex h-11 w-full items-center justify-center rounded-[12px] px-4 text-[14px] font-semibold transition",
                      hasRequiredItems
                        ? canAddMainProduct
                          ? isInCart
                            ? "cursor-pointer border border-emerald-600 bg-emerald-600 text-white hover:border-emerald-700 hover:bg-emerald-700"
                            : "cursor-pointer border border-black bg-black text-white hover:opacity-95"
                          : "cursor-not-allowed border border-black/10 bg-black/10 text-black/40"
                        : isInCart
                          ? "cursor-pointer border border-emerald-600 bg-emerald-600 text-white hover:border-emerald-700 hover:bg-emerald-700"
                          : "cursor-pointer border border-black bg-black text-white hover:opacity-95",
                    )}
                  >
                    {hasRequiredItems
                      ? !canAddMainProduct
                        ? "Собрать комплект"
                        : isInCart
                          ? "Комплект собран"
                          : "Собрать комплект"
                      : isInCart
                        ? "Товар добавлен"
                        : "Добавить в корзину"}
                  </button>
                </div>
              </div>
            </div>

            <section className="mt-5 rounded-[20px] border border-black/8 bg-white p-4 md:rounded-[24px] md:p-5">
              <div className="flex flex-col gap-1">
                <div className="text-[18px] font-semibold tracking-[-0.02em] text-black">
                  Рекомендуемые товары
                </div>
                <div className="text-[13px] text-black/50">
                  Дополнительные позиции для расширения комплекта.
                </div>
              </div>

              {finalRecommendedItems.length > 0 ? (
                <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
                  {finalRecommendedItems.map((addon) => {
                    const addonState = addonDrafts?.[addon.id] ?? {
                      quantity: addon.defaultQuantity ?? 1,
                      isInCart: false,
                      markupPercent: 0,
                      selectedVariantKey: "",
                      selectedColor: "",
                    };

                    return (
                      <RecommendedQuickAddCard
                        key={addon.id}
                        addon={addon}
                        country={country}
                        addonState={addonState}
                        onIncreaseAddonQty={onIncreaseAddonQty}
                        onDecreaseAddonQty={onDecreaseAddonQty}
                        onToggleAddonCart={onToggleAddonCart}
                        onSelectAddonVariant={onSelectAddonVariant}
                        onOpenRelatedProduct={onOpenRelatedProduct}
                      />
                    );
                  })}
                </div>
              ) : (
                <div className="mt-4 rounded-[18px] border border-dashed border-black/12 bg-[#faf9f6] px-4 py-5 text-[14px] text-black/50">
                  Для этого товара пока нет рекомендованных элементов.
                </div>
              )}
            </section>
          </div>

          <ImagePreviewModal
            image={previewImage}
            onClose={() => setPreviewImage(null)}
          />
        </div>
      </div>
    </div>
  );
}
