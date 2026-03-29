"use client";

import Image from "next/image";
import {
  AlertCircle,
  Check,
  ChevronDown,
  PackageCheck,
  Minus,
  Plus,
  X,
  ZoomIn,
} from "lucide-react";
import { useMemo, useState } from "react";

import type {
  DealerAddon,
  DealerCountryCode,
  DealerProduct,
} from "@/app/lib/dealer/shop";
import type { ProductDraft } from "./types";
import { formatMoney } from "./utils";

type AddonDraftState = {
  quantity: number;
  isInCart: boolean;
  markupPercent: number;
};

type ProductModalProps = {
  product: DealerProduct | null;
  country: DealerCountryCode;
  draft: ProductDraft | null;
  isOpen: boolean;
  onClose: () => void;
  onIncreaseQty: (productId: string) => void;
  onDecreaseQty: (productId: string) => void;
  onToggleCart: (productId: string) => void;
  isInCart: boolean;

  addonDrafts?: Record<string, AddonDraftState>;
  onIncreaseAddonQty?: (addonId: string) => void;
  onDecreaseAddonQty?: (addonId: string) => void;
  onToggleAddonCart?: (addonId: string) => void;
};

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

function getAddonPrice(addon: DealerAddon, country: DealerCountryCode): number {
  return addon.price[country] ?? 0;
}

function QtyControl({
  value,
  onMinus,
  onPlus,
  compact = false,
}: {
  value: number;
  onMinus: () => void;
  onPlus: () => void;
  compact?: boolean;
}) {
  return (
    <div
      className={cn(
        "flex items-center overflow-hidden rounded-[10px] border border-black/10 bg-white",
        compact ? "h-8" : "h-10",
      )}
    >
      <button
        type="button"
        onClick={onMinus}
        className={cn(
          "flex h-full cursor-pointer items-center justify-center transition hover:bg-black/5",
          compact ? "w-8" : "w-10",
        )}
      >
        <Minus className="h-4 w-4" />
      </button>

      <div
        className={cn(
          "flex h-full items-center justify-center border-x border-black/10 font-semibold text-black",
          compact
            ? "min-w-[34px] px-2 text-[13px]"
            : "min-w-[48px] px-3 text-[14px]",
        )}
      >
        {value}
      </div>

      <button
        type="button"
        onClick={onPlus}
        className={cn(
          "flex h-full cursor-pointer items-center justify-center transition hover:bg-black/5",
          compact ? "w-8" : "w-10",
        )}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}

function RequiredStepRow({
  addon,
  country,
  addonState,
  onIncreaseAddonQty,
  onDecreaseAddonQty,
  onToggleAddonCart,
  onOpenImage,
}: {
  addon: DealerAddon;
  country: DealerCountryCode;
  addonState: AddonDraftState;
  onIncreaseAddonQty?: (addonId: string) => void;
  onDecreaseAddonQty?: (addonId: string) => void;
  onToggleAddonCart?: (addonId: string) => void;
  onOpenImage?: (src: string, title: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const minQty = addon.minQuantity ?? 1;
  const qty = Math.max(
    minQty,
    addonState.quantity || addon.defaultQuantity || 1,
  );
  const unitPrice = getAddonPrice(addon, country);
  const totalPrice = unitPrice * qty;
  const isDone = addonState.isInCart && qty >= minQty;

  return (
    <div
      className={cn(
        "rounded-[18px] border px-3 py-3 transition sm:px-4",
        isDone
          ? "border-emerald-200 bg-emerald-50/60"
          : "border-black/8 bg-white",
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start">
        <div className="shrink-0">
          {addon.image ? (
            <button
              type="button"
              onClick={() => onOpenImage?.(addon.image!, addon.title)}
              className={cn(
                "group relative block h-12 w-12 overflow-hidden rounded-[12px] border bg-white transition",
                isDone
                  ? "border-emerald-200"
                  : "border-black/10 hover:border-black/20",
              )}
              aria-label={`Увеличить изображение: ${addon.title}`}
            >
              <Image
                src={addon.image}
                alt={addon.title}
                fill
                className="object-cover"
                sizes="48px"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition group-hover:bg-black/20">
                <ZoomIn className="h-3.5 w-3.5 text-white opacity-0 transition group-hover:opacity-100" />
              </div>
            </button>
          ) : (
            <div
              className={cn(
                "mt-0.5 flex h-12 w-12 items-center justify-center rounded-[12px] border text-[12px] font-semibold",
                isDone
                  ? "border-emerald-300 bg-emerald-600 text-white"
                  : "border-black/12 bg-[#f5f4f1] text-black/55",
              )}
            >
              {isDone ? <Check className="h-4 w-4" /> : minQty}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <div className="text-[14px] font-semibold leading-5 text-black sm:text-[15px]">
              {addon.title}
            </div>

            {addon.article ? (
              <span className="inline-flex rounded-full border border-black/10 bg-[#f5f5f3] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.08em] text-black/45">
                {addon.article}
              </span>
            ) : null}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-black/50">
            <span>Мин. {minQty} шт.</span>
            <span>{formatMoney(unitPrice, country)}</span>
            <span className="text-black/65">
              Сумма: {formatMoney(totalPrice, country)}
            </span>
          </div>

          {expanded && addon.description ? (
            <div className="mt-2 rounded-[12px] bg-[#f6f4ef] px-3 py-2 text-[12px] leading-5 text-black/60">
              {addon.description}
            </div>
          ) : null}
        </div>

        <div className="flex w-full flex-col gap-2 sm:w-auto sm:min-w-[190px] sm:items-end">
          <div className="flex justify-start sm:justify-end">
            <QtyControl
              compact
              value={qty}
              onMinus={() => onDecreaseAddonQty?.(addon.id)}
              onPlus={() => onIncreaseAddonQty?.(addon.id)}
            />
          </div>

          <button
            type="button"
            onClick={() => onToggleAddonCart?.(addon.id)}
            className={cn(
              "inline-flex h-9 w-full cursor-pointer items-center justify-center rounded-[10px] px-3 text-[12px] font-semibold transition sm:min-w-[110px]",
              addonState.isInCart
                ? "border border-emerald-600 bg-emerald-600 text-white hover:border-emerald-700 hover:bg-emerald-700"
                : "border border-black bg-black text-white hover:opacity-95",
            )}
          >
            {addonState.isInCart ? "Выбрано" : "Добавить"}
          </button>
        </div>
      </div>

      {(addon.description || addon.image) && (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="inline-flex cursor-pointer items-center gap-1 text-[12px] font-semibold text-black/50 transition hover:text-black"
          >
            {expanded ? "Скрыть" : "Подробнее"}
            <ChevronDown
              className={cn("h-4 w-4 transition", expanded && "rotate-180")}
            />
          </button>

          <div
            className={cn(
              "text-[12px] font-medium",
              isDone ? "text-emerald-700" : "text-black/45",
            )}
          >
            {isDone ? "Шаг выполнен" : "Нужно добавить"}
          </div>
        </div>
      )}
    </div>
  );
}

function RecommendedCard({
  addon,
  country,
  addonState,
  onIncreaseAddonQty,
  onDecreaseAddonQty,
  onToggleAddonCart,
  onOpenImage,
}: {
  addon: DealerAddon;
  country: DealerCountryCode;
  addonState: AddonDraftState;
  onIncreaseAddonQty?: (addonId: string) => void;
  onDecreaseAddonQty?: (addonId: string) => void;
  onToggleAddonCart?: (addonId: string) => void;
  onOpenImage?: (src: string, title: string) => void;
}) {
  const [expanded, setExpanded] = useState(false);

  const minQty = addon.minQuantity ?? 1;
  const qty = Math.max(
    minQty,
    addonState.quantity || addon.defaultQuantity || 1,
  );
  const unitPrice = getAddonPrice(addon, country);

  return (
    <div className="flex h-full flex-col rounded-[20px] border border-black/8 bg-white p-4">
      <div className="flex min-w-0 gap-3">
        <div className="relative h-[72px] w-[72px] shrink-0 overflow-hidden rounded-[14px] bg-white sm:h-[76px] sm:w-[76px]">
          {addon.image ? (
            <>
              <Image
                src={addon.image}
                alt={addon.title}
                fill
                className="object-cover"
                sizes="76px"
              />
              <button
                type="button"
                onClick={() => onOpenImage?.(addon.image!, addon.title)}
                className="absolute inset-0 flex cursor-pointer items-center justify-center bg-black/0 transition hover:bg-black/20"
                aria-label={`Увеличить изображение: ${addon.title}`}
              >
                <ZoomIn className="h-4 w-4 text-white opacity-0 transition hover:opacity-100" />
              </button>
            </>
          ) : (
            <div className="flex h-full items-center justify-center px-2 text-center text-[10px] font-medium text-black/25">
              {addon.title}
            </div>
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="line-clamp-2 text-[14px] font-semibold leading-5 text-black sm:text-[15px]">
            {addon.title}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-black/45">
            {addon.article ? <span>{addon.article}</span> : null}
            <span>{formatMoney(unitPrice, country)}</span>
          </div>

          <div className="mt-2 text-[12px] text-black/45">
            {addon.selectionType === "quantity" ? "Выбор количества" : "1 шт."}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        {addon.selectionType === "quantity" ? (
          <QtyControl
            compact
            value={qty}
            onMinus={() => onDecreaseAddonQty?.(addon.id)}
            onPlus={() => onIncreaseAddonQty?.(addon.id)}
          />
        ) : (
          <div className="text-[12px] text-black/45">1 шт.</div>
        )}

        <button
          type="button"
          onClick={() => onToggleAddonCart?.(addon.id)}
          className={cn(
            "inline-flex h-9 w-full cursor-pointer items-center justify-center rounded-[10px] px-3 text-[12px] font-semibold transition sm:w-auto",
            addonState.isInCart
              ? "border border-emerald-600 bg-emerald-600 text-white hover:border-emerald-700 hover:bg-emerald-700"
              : "border border-black/10 bg-[#f6f4ef] text-black hover:bg-[#ece8df]",
          )}
        >
          {addonState.isInCart ? "Добавлено" : "В корзину"}
        </button>
      </div>

      {(addon.description || addon.image) && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setExpanded((prev) => !prev)}
            className="inline-flex cursor-pointer items-center gap-1 text-[12px] font-semibold text-black/45 transition hover:text-black"
          >
            {expanded ? "Скрыть" : "Подробнее"}
            <ChevronDown
              className={cn("h-4 w-4 transition", expanded && "rotate-180")}
            />
          </button>

          {expanded && addon.description ? (
            <div className="mt-2 rounded-[12px] bg-[#f8f7f4] px-3 py-2 text-[12px] leading-5 text-black/60">
              {addon.description}
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
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

  const safeProduct = product;
  const safeDraft = draft;

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
  const mainTotal = basePrice * (safeDraft?.quantity ?? 1);

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

  const canAddMainProduct = requiredProgress.done;
  const isKitAssembled = requiredProgress.done && isInCart;

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
                        src: safeProduct.image,
                        title: safeProduct.title,
                      })
                    }
                    className="group relative h-[220px] w-full overflow-hidden rounded-[20px] bg-[#f1f1ed] text-left sm:h-[260px] md:h-[300px] md:rounded-[24px]"
                  >
                    <Image
                      src={safeProduct.image}
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
                              {safeProduct.article}
                            </span>
                          </div>

                          {safeProduct.color ? (
                            <div className="flex flex-wrap items-baseline gap-x-1.5">
                              <span className="text-black/45">Цвет:</span>
                              <span className="font-medium text-black">
                                {safeProduct.color}
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
                        {formatMoney(basePrice, country)}
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

                  {requiredProgress.total > 0 && !requiredProgress.done ? (
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
                      if (!canAddMainProduct) return;
                      onToggleCart(safeProduct.id);
                    }}
                    disabled={!canAddMainProduct}
                    className={cn(
                      "mt-4 inline-flex h-11 w-full items-center justify-center rounded-[12px] px-4 text-[14px] font-semibold transition",
                      canAddMainProduct
                        ? isInCart
                          ? "cursor-pointer border border-emerald-600 bg-emerald-600 text-white hover:border-emerald-700 hover:bg-emerald-700"
                          : "cursor-pointer border border-black bg-black text-white hover:opacity-95"
                        : "cursor-not-allowed border border-black/10 bg-black/10 text-black/40",
                    )}
                  >
                    {!canAddMainProduct
                      ? "Собрать комплект"
                      : isInCart
                        ? "Комплект собран"
                        : "Собрать комплект"}
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
                    };

                    return (
                      <RecommendedCard
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
                <div className="mt-4 rounded-[18px] border border-dashed border-black/12 bg-[#faf9f6] px-4 py-5 text-[14px] text-black/50">
                  Для этого товара пока нет рекомендованных элементов.
                </div>
              )}
            </section>
          </div>

          {previewImage ? (
            <div
              className="absolute inset-0 z-30 flex items-center justify-center rounded-t-[24px] bg-black/55 p-3 sm:rounded-[28px] sm:p-4"
              onClick={() => setPreviewImage(null)}
            >
              <div
                className="relative w-full max-w-[820px] rounded-[20px] bg-white p-3 shadow-[0_30px_90px_-30px_rgba(0,0,0,0.45)] sm:rounded-[24px]"
                onClick={(event) => event.stopPropagation()}
              >
                <button
                  type="button"
                  onClick={() => setPreviewImage(null)}
                  className="absolute right-3 top-3 z-10 flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-black/10 bg-white text-black/60 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
                >
                  <X className="h-5 w-5" />
                </button>

                <div className="mb-3 pr-12 pl-1 pt-1 text-[14px] font-semibold text-black sm:text-[15px]">
                  {previewImage.title}
                </div>

                <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[18px] bg-white">
                  <Image
                    src={previewImage.src}
                    alt={previewImage.title}
                    fill
                    className="object-contain"
                    sizes="(max-width: 1024px) 100vw, 820px"
                  />
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
