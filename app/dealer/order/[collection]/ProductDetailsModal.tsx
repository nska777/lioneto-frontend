"use client";

import Image from "next/image";
import {
  AlertCircle,
  Check,
  Download,
  PackageCheck,
  X,
  ZoomIn,
} from "lucide-react";
import { useMemo, useState } from "react";

import type {
  DealerAddon,
  DealerCountryCode,
  DealerProduct,
  DealerProductVariant,
} from "@/app/lib/dealer/shop";
import type { ProductDraft } from "./types";
import type { AddonDraftState } from "./product-modal.types";
import ColorVariantButton from "./ColorVariantButton";
import ImagePreviewModal from "./ImagePreviewModal";
import KitAssembledModal from "./KitAssembledModal";
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
  onChooseSingleAddonInGroup?: (groupKey: string, addonId: string) => void;
  onGoToCart?: () => void;
  onContinueShopping?: () => void;
};

type ConstructorGroup = {
  key: string;
  title: string;
  order: number;
  selection: "single" | "multiple";
  items: DealerAddon[];
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

function getAddonUnitPrice(
  addon: DealerAddon,
  addonState: AddonDraftState | undefined,
  country: DealerCountryCode,
): number {
  const selectedVariant =
    (addon.variants ?? []).find(
      (variant) => variant.key === addonState?.selectedVariantKey,
    ) ?? null;

  return selectedVariant?.price?.[country] ?? addon.price[country] ?? 0;
}

function getAddonQty(
  addon: DealerAddon,
  addonState: AddonDraftState | undefined,
) {
  return Math.max(
    addon.minQuantity ?? 1,
    addonState?.quantity ?? addon.defaultQuantity ?? 1,
  );
}

function getAddonTotal(
  addon: DealerAddon,
  addonState: AddonDraftState | undefined,
  country: DealerCountryCode,
) {
  return (
    getAddonUnitPrice(addon, addonState, country) *
    getAddonQty(addon, addonState)
  );
}

function normalizeChoiceText(value?: string | null) {
  return String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/ё/g, "е");
}

function getDoorType(addon?: DealerAddon | null): "mirror" | "solid" | "" {
  const text = normalizeChoiceText(
    [
      addon?.title,
      addon?.article,
      addon?.articleShort,
      addon?.description,
      addon?.color,
      addon?.material,
    ]
      .filter(Boolean)
      .join(" "),
  );

  if (
    text.includes("зерк") ||
    text.includes("mirror") ||
    text.includes("отраж")
  ) {
    return "mirror";
  }

  if (
    text.includes("глух") ||
    text.includes("solid") ||
    text.includes("дсп") ||
    text.includes("лдсп")
  ) {
    return "solid";
  }

  return "";
}

function isFillingGroup(group: ConstructorGroup) {
  const key = normalizeChoiceText(group.key);
  const title = normalizeChoiceText(group.title);

  return (
    key.includes("filling") ||
    key.includes("napolnen") ||
    key.includes("fill") ||
    key.includes("content") ||
    title.includes("тип шкафа") ||
    title.includes("наполн")
  );
}

function isLeftDoorGroup(group: ConstructorGroup) {
  const key = normalizeChoiceText(group.key);
  const title = normalizeChoiceText(group.title);

  return (
    key.includes("left") ||
    key.includes("left-door") ||
    key.includes("lev") ||
    key.includes("leva") ||
    title.includes("левая")
  );
}

function isRightDoorGroup(group: ConstructorGroup) {
  const key = normalizeChoiceText(group.key);
  const title = normalizeChoiceText(group.title);

  return (
    key.includes("right") ||
    key.includes("right-door") ||
    key.includes("prav") ||
    key.includes("prava") ||
    title.includes("правая")
  );
}

function getSelectedAddonInGroup(
  group: ConstructorGroup | null,
  addonDrafts?: Record<string, AddonDraftState>,
) {
  if (!group) return null;

  return (
    group.items.find((item) => {
      const state = addonDrafts?.[item.id];
      return Boolean(state?.isInCart);
    }) ?? null
  );
}

function getManualWardrobeImage({
  fillingAddon,
  leftDoorAddon,
  rightDoorAddon,
}: {
  fillingAddon: DealerAddon | null;
  leftDoorAddon: DealerAddon | null;
  rightDoorAddon: DealerAddon | null;
}) {
  if (!fillingAddon) return "";

  const leftDoorType = getDoorType(leftDoorAddon);
  const rightDoorType = getDoorType(rightDoorAddon);

  const basePath = "/dealer/constructor/salvador/wardrobe";

  if (leftDoorType === "mirror" && rightDoorType === "mirror") {
    return `${basePath}/both-mirror.jpg`;
  }

  if (leftDoorType === "solid" && rightDoorType === "solid") {
    return `${basePath}/both-solid.jpg`;
  }

  if (leftDoorType === "mirror" && rightDoorType === "solid") {
    return `${basePath}/left-mirror-right-solid.png`;
  }

  if (leftDoorType === "solid" && rightDoorType === "mirror") {
    return `${basePath}/left-solid-right-mirror.png`;
  }

  if (leftDoorType === "mirror" && !rightDoorType) {
    return `${basePath}/left-mirror.png`;
  }

  if (leftDoorType === "solid" && !rightDoorType) {
    return `${basePath}/left-solid.png`;
  }

  if (!leftDoorType && rightDoorType === "mirror") {
    return `${basePath}/right-mirror.png`;
  }

  if (!leftDoorType && rightDoorType === "solid") {
    return `${basePath}/right-solid.png`;
  }

  return "";
}

function ConstructorChoiceCard({
  addon,
  country,
  addonState,
  isSelected,
  groupKey,
  onChoose,
  onOpenImage,
  cardWidthClass,
}: {
  addon: DealerAddon;
  country: DealerCountryCode;
  addonState: AddonDraftState;
  isSelected: boolean;
  groupKey: string;
  onChoose?: (groupKey: string, addonId: string) => void;
  onOpenImage: (src: string, title: string) => void;
  cardWidthClass?: string;
}) {
  const unitPrice = getAddonUnitPrice(addon, addonState, country);

  const handleChoose = () => {
    onChoose?.(groupKey, addon.id);
  };

  const handleOpenImage = () => {
    if (!addon.image) return;
    onOpenImage(addon.image, addon.title);
  };

  return (
    <div
      className={cn(
        "flex h-[345px] shrink-0 flex-col overflow-hidden rounded-[16px] border bg-white transition",
        cardWidthClass ?? "w-[170px] sm:w-[180px] md:w-[190px]",
        isSelected
          ? "border-emerald-400 shadow-[0_12px_24px_-20px_rgba(0,0,0,0.28)]"
          : "border-black/10 hover:border-black/20 hover:shadow-[0_10px_22px_-20px_rgba(0,0,0,0.35)]",
      )}
    >
      <button
        type="button"
        onClick={handleOpenImage}
        className="relative block h-[145px] w-full shrink-0 cursor-zoom-in border-b border-black/6 bg-[#f7f4ee]"
        aria-label={`Открыть фото: ${addon.title}`}
      >
        <div className="relative h-full w-full p-3">
          {addon.image ? (
            <Image
              src={addon.image}
              alt={addon.title}
              fill
              className="object-contain p-3 transition-transform duration-200 hover:scale-[1.03]"
              sizes="220px"
            />
          ) : null}
        </div>

        {isSelected ? (
          <div className="absolute left-2 top-2 inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-emerald-700">
            <Check className="h-3 w-3" />
            Выбрано
          </div>
        ) : null}
      </button>

      <button
        type="button"
        onClick={handleChoose}
        className={cn(
          "flex min-h-0 flex-1 cursor-pointer flex-col p-3 text-left transition",
          isSelected ? "bg-emerald-50/45" : "bg-white hover:bg-black/[0.025]",
        )}
      >
        <div className="min-h-[62px]">
          <div className="line-clamp-3 text-[13px] font-semibold leading-4 text-black">
            {addon.title}
          </div>

          {addon.article ? (
            <div className="mt-2 inline-flex rounded-full bg-black/5 px-2 py-0.5 text-[10px] font-medium text-black/50">
              {addon.articleShort || addon.article}
            </div>
          ) : null}
        </div>

        <div className="mt-2 min-h-[34px] text-[12px] leading-4 text-black/55">
          Цена:{" "}
          <span className="font-semibold text-black">
            {formatMoney(unitPrice, country)}
          </span>
        </div>

        <div className="mt-auto pt-2">
          <span
            className={cn(
              "inline-flex h-9 w-full items-center justify-center rounded-[10px] border px-2 text-[12px] font-semibold transition",
              isSelected
                ? "border-red-500 bg-red-50 text-red-600"
                : "border-black bg-black text-white",
            )}
          >
            {isSelected ? "Отменить выбор" : "Выбрать"}
          </span>
        </div>
      </button>
    </div>
  );
}

function ConstructorStepBlock({
  stepNumber,
  group,
  addonDrafts,
  country,
  onChooseSingleAddonInGroup,
  onOpenImage,
  cardWidthClass,
  rowClass,
  fitContent,
}: {
  stepNumber: number;
  group: ConstructorGroup;
  addonDrafts?: Record<string, AddonDraftState>;
  country: DealerCountryCode;
  onChooseSingleAddonInGroup?: (groupKey: string, addonId: string) => void;
  onOpenImage: (src: string, title: string) => void;
  cardWidthClass?: string;
  rowClass?: string;
  fitContent?: boolean;
}) {
  const selectedItem =
    group.items.find((item) => addonDrafts?.[item.id]?.isInCart) ?? null;

  return (
    <div className="rounded-[20px] border border-black/8 bg-[#fbfaf7] p-4 md:rounded-[20px] md:p-5">
      <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <div className="text-[12px] font-semibold uppercase tracking-[0.08em] text-black/40">
            Шаг {stepNumber}
          </div>
          <div className="mt-1 text-[20px] font-semibold tracking-[-0.02em] text-black">
            {group.title}
          </div>
          <div className="mt-1 text-[13px] text-black/55">
            Выберите один вариант для этого этапа сборки.
          </div>
        </div>

        <div
          className={cn(
            "inline-flex w-fit rounded-full px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.08em]",
            selectedItem
              ? "border border-emerald-200 bg-emerald-50 text-emerald-700"
              : "border border-amber-200 bg-amber-50 text-amber-700",
          )}
        >
          {selectedItem ? "Выбрано" : "Не выбрано"}
        </div>
      </div>

      <div
        className={cn(
          "mt-4",
          fitContent
            ? "overflow-hidden"
            : "overflow-x-auto overflow-y-hidden pb-1",
        )}
      >
        <div
          className={cn(
            fitContent
              ? "flex items-stretch gap-3"
              : "flex w-max items-stretch gap-3",
            rowClass ?? "flex-nowrap",
          )}
        >
          {group.items.map((addon) => {
            const addonState = addonDrafts?.[addon.id] ?? {
              quantity: addon.defaultQuantity ?? 1,
              isInCart: false,
              markupPercent: 0,
              selectedVariantKey: "",
              selectedColor: "",
            };

            const isSelected = Boolean(addonState.isInCart);

            return (
              <ConstructorChoiceCard
                key={addon.id}
                addon={addon}
                country={country}
                addonState={addonState}
                isSelected={isSelected}
                groupKey={group.key}
                onChoose={onChooseSingleAddonInGroup}
                onOpenImage={onOpenImage}
                cardWidthClass={cardWidthClass}
              />
            );
          })}
        </div>
      </div>
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
  onSelectVariant,
  onSelectAddonVariant,
  onOpenRelatedProduct,
  isInCart,
  addonDrafts,
  onIncreaseAddonQty,
  onDecreaseAddonQty,
  onToggleAddonCart,
  onChooseSingleAddonInGroup,
  onContinueShopping,
}: ProductModalProps) {
  const [previewImage, setPreviewImage] = useState<{
    src: string;
    title: string;
  } | null>(null);

  const [selectedVariantKey, setSelectedVariantKey] = useState<string>("");
  const [kitAssembledModalOpen, setKitAssembledModalOpen] = useState(false);

  const safeProduct = product;
  const safeDraft = draft;

  const colorVariants = useMemo(
    () => safeProduct?.variants ?? [],
    [safeProduct],
  );

  const selectedVariant = useMemo(() => {
    if (!colorVariants.length) return null;
    if (!selectedVariantKey) return null;

    return (
      colorVariants.find((item) => item.key === selectedVariantKey) ?? null
    );
  }, [colorVariants, selectedVariantKey]);

  const selectedProductVariantImage =
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

  const hasStructuredConstructor = finalRequiredItems.some((item) =>
    Boolean(item.groupKey),
  );

  const constructorGroups = useMemo<ConstructorGroup[]>(() => {
    if (!hasStructuredConstructor) return [];

    const map = new Map<string, ConstructorGroup>();

    finalRequiredItems.forEach((item, index) => {
      const key = item.groupKey?.trim() || `group-${index + 1}`;

      const existing = map.get(key);
      if (existing) {
        existing.items.push(item);
        return;
      }

      map.set(key, {
        key,
        title: item.groupTitle?.trim() || "Выберите вариант",
        order: item.groupOrder ?? index + 1,
        selection: item.groupSelection ?? "multiple",
        items: [item],
      });
    });

    return Array.from(map.values()).sort((a, b) => a.order - b.order);
  }, [finalRequiredItems, hasStructuredConstructor]);

  const constructorSingleGroups = useMemo(
    () => constructorGroups.filter((group) => group.selection === "single"),
    [constructorGroups],
  );

  const extraGroups = useMemo(
    () => constructorGroups.filter((group) => group.selection !== "single"),
    [constructorGroups],
  );

  const stepOneGroup = constructorSingleGroups[0] ?? null;
  const secondaryStepGroups = constructorSingleGroups.slice(1);

  const fillingGroup = useMemo(() => {
    return constructorSingleGroups.find(isFillingGroup) || stepOneGroup || null;
  }, [constructorSingleGroups, stepOneGroup]);

  const leftDoorGroup = useMemo(() => {
    return constructorSingleGroups.find(isLeftDoorGroup) || null;
  }, [constructorSingleGroups]);

  const rightDoorGroup = useMemo(() => {
    return constructorSingleGroups.find(isRightDoorGroup) || null;
  }, [constructorSingleGroups]);

  const selectedFillingAddon = useMemo(() => {
    return getSelectedAddonInGroup(fillingGroup, addonDrafts);
  }, [fillingGroup, addonDrafts]);

  const selectedLeftDoorAddon = useMemo(() => {
    return getSelectedAddonInGroup(leftDoorGroup, addonDrafts);
  }, [leftDoorGroup, addonDrafts]);

  const selectedRightDoorAddon = useMemo(() => {
    return getSelectedAddonInGroup(rightDoorGroup, addonDrafts);
  }, [rightDoorGroup, addonDrafts]);

  const manualWardrobeImage = useMemo(() => {
    return getManualWardrobeImage({
      fillingAddon: selectedFillingAddon,
      leftDoorAddon: selectedLeftDoorAddon,
      rightDoorAddon: selectedRightDoorAddon,
    });
  }, [selectedFillingAddon, selectedLeftDoorAddon, selectedRightDoorAddon]);

  const selectedImage = useMemo(() => {
    if (manualWardrobeImage) {
      return manualWardrobeImage;
    }

    const fillingImage = selectedFillingAddon?.image?.trim();

    if (fillingImage) {
      return fillingImage;
    }

    return selectedProductVariantImage;
  }, [manualWardrobeImage, selectedFillingAddon, selectedProductVariantImage]);

  const basePrice = safeProduct ? (safeProduct.price[country] ?? 0) : 0;
  const variantPrice = selectedVariant
    ? getVariantPrice(selectedVariant, country)
    : 0;

  const effectiveBasePrice = selectedVariant ? variantPrice : basePrice;
  const productQty = Math.max(1, safeDraft?.quantity ?? 1);

  const selectedRequiredAndExtrasUnitTotal = useMemo(() => {
    return finalRequiredItems.reduce((sum, addon) => {
      const state = addonDrafts?.[addon.id];
      if (!state?.isInCart) return sum;
      return sum + getAddonTotal(addon, state, country);
    }, 0);
  }, [finalRequiredItems, addonDrafts, country]);

  const selectedRequiredAndExtrasTotal =
    selectedRequiredAndExtrasUnitTotal * productQty;

  const modalGrandTotal =
    (effectiveBasePrice + selectedRequiredAndExtrasUnitTotal) * productQty;

  const instructionHref = getInstructionDownloadHref(safeProduct);
  const instructionLabel = getInstructionLabel(safeProduct);

  const requiredProgress = useMemo(() => {
    if (hasStructuredConstructor) {
      if (!constructorSingleGroups.length) {
        return {
          total: 0,
          completed: 0,
          hasAnySelected: true,
          done: true,
          remaining: 0,
        };
      }

      let completed = 0;

      constructorSingleGroups.forEach((group) => {
        const hasSelected = group.items.some((item) => {
          const state = addonDrafts?.[item.id];
          const minQty = item.minQuantity ?? 1;
          const qty = Math.max(0, state?.quantity ?? 0);

          return Boolean(state?.isInCart) && qty >= minQty;
        });

        if (hasSelected) completed += 1;
      });

      return {
        total: constructorSingleGroups.length,
        completed,
        hasAnySelected: completed > 0,
        done: completed === constructorSingleGroups.length,
        remaining: Math.max(constructorSingleGroups.length - completed, 0),
      };
    }

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
  }, [
    finalRequiredItems,
    addonDrafts,
    hasStructuredConstructor,
    constructorSingleGroups,
  ]);

  const selectedConstructorSummary = useMemo(() => {
    if (!hasStructuredConstructor) return [];

    return constructorSingleGroups.map((group) => {
      const selectedItem =
        group.items.find((item) => {
          const state = addonDrafts?.[item.id];
          const minQty = item.minQuantity ?? 1;
          const qty = Math.max(0, state?.quantity ?? 0);

          return Boolean(state?.isInCart) && qty >= minQty;
        }) ?? null;

      return {
        key: group.key,
        title: group.title,
        selectedItem,
      };
    });
  }, [hasStructuredConstructor, constructorSingleGroups, addonDrafts]);

  const selectedExtrasTitles = useMemo(() => {
    return extraGroups.flatMap((group) =>
      group.items
        .filter((item) => Boolean(addonDrafts?.[item.id]?.isInCart))
        .map((item) => item.title)
        .filter(Boolean),
    );
  }, [extraGroups, addonDrafts]);

  const hasRequiredItems = hasStructuredConstructor
    ? constructorSingleGroups.length > 0
    : finalRequiredItems.length > 0;

  const canAddMainProduct = requiredProgress.done;
  const isKitAssembled = hasRequiredItems && requiredProgress.done && isInCart;

  if (!isOpen || !safeProduct || !safeDraft) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 bg-black/50 p-0 sm:p-2 md:p-4"
        onClick={onClose}
      >
        <div className="flex min-h-full items-end justify-center sm:items-center">
          <div
            className="relative w-full max-w-[1320px] rounded-t-[24px] bg-white shadow-[0_30px_90px_-30px_rgba(0,0,0,0.35)] sm:rounded-[28px]"
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
                      onClick={() => {
                        if (!selectedImage) return;

                        setPreviewImage({
                          src: selectedImage,
                          title:
                            selectedLeftDoorAddon?.title ||
                            selectedRightDoorAddon?.title ||
                            selectedFillingAddon?.title ||
                            safeProduct.title,
                        });
                      }}
                      className="group relative h-[220px] w-full cursor-pointer overflow-hidden rounded-[20px] bg-[#f1f1ed] text-left sm:h-[260px] md:h-[300px] md:rounded-[24px]"
                    >
                      {selectedImage ? (
                        <Image
                          src={selectedImage}
                          alt={
                            selectedLeftDoorAddon?.title ||
                            selectedRightDoorAddon?.title ||
                            selectedFillingAddon?.title ||
                            safeProduct.title
                          }
                          fill
                          className="object-contain p-4 transition-transform duration-300 group-hover:scale-[1.02]"
                          sizes="(max-width: 1024px) 100vw, 280px"
                          priority
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-[13px] text-black/35">
                          Нет фото
                        </div>
                      )}

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
                                <span className="text-black/45">
                                  Инструкция:
                                </span>
                                <a
                                  href={instructionHref}
                                  className="inline-flex cursor-pointer items-center gap-1.5 rounded-[10px] border border-black/10 bg-[#f7f5f0] px-3 py-1.5 font-medium text-black transition hover:border-black/20 hover:bg-[#f1eee8]"
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
                              ? "Конструктор собран"
                              : "Соберите шкаф"}
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
                              Сборка шкафа
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
                                ? "Все обязательные части выбраны. Шкаф собран."
                                : "Все обязательные части выбраны. Нажмите «Собрать комплект»."
                              : "Сначала выберите наполнение и створки."}
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {hasStructuredConstructor ? (
                    <section className="mt-5 space-y-4">
                      {stepOneGroup ? (
                        <ConstructorStepBlock
                          stepNumber={1}
                          group={stepOneGroup}
                          addonDrafts={addonDrafts}
                          country={country}
                          cardWidthClass="w-[180px] sm:w-[200px] md:w-[210px]"
                          rowClass="flex-nowrap"
                          fitContent
                          onChooseSingleAddonInGroup={
                            onChooseSingleAddonInGroup
                          }
                          onOpenImage={(src, title) =>
                            setPreviewImage({ src, title })
                          }
                        />
                      ) : null}

                      {secondaryStepGroups.length > 0 ? (
                        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_1px_minmax(0,1fr)] xl:items-stretch">
                          {secondaryStepGroups[0] ? (
                            <ConstructorStepBlock
                              stepNumber={2}
                              group={secondaryStepGroups[0]}
                              addonDrafts={addonDrafts}
                              country={country}
                              cardWidthClass="w-[140px] sm:w-[150px] md:w-[160px]"
                              rowClass="flex-nowrap"
                              fitContent
                              onChooseSingleAddonInGroup={
                                onChooseSingleAddonInGroup
                              }
                              onOpenImage={(src, title) =>
                                setPreviewImage({ src, title })
                              }
                            />
                          ) : (
                            <div />
                          )}

                          <div className="hidden xl:block self-stretch rounded-full bg-black/8" />

                          {secondaryStepGroups[1] ? (
                            <ConstructorStepBlock
                              stepNumber={3}
                              group={secondaryStepGroups[1]}
                              addonDrafts={addonDrafts}
                              country={country}
                              cardWidthClass="w-[140px] sm:w-[150px] md:w-[160px]"
                              rowClass="flex-nowrap"
                              fitContent
                              onChooseSingleAddonInGroup={
                                onChooseSingleAddonInGroup
                              }
                              onOpenImage={(src, title) =>
                                setPreviewImage({ src, title })
                              }
                            />
                          ) : (
                            <div />
                          )}
                        </div>
                      ) : null}

                      {secondaryStepGroups.length > 2 ? (
                        <div className="space-y-4">
                          {secondaryStepGroups.slice(2).map((group, idx) => (
                            <ConstructorStepBlock
                              key={group.key}
                              stepNumber={idx + 4}
                              group={group}
                              addonDrafts={addonDrafts}
                              country={country}
                              onChooseSingleAddonInGroup={
                                onChooseSingleAddonInGroup
                              }
                              onOpenImage={(src, title) =>
                                setPreviewImage({ src, title })
                              }
                            />
                          ))}
                        </div>
                      ) : null}

                      {extraGroups.length > 0 ? (
                        <div className="rounded-[20px] border border-black/8 bg-[#fbfaf7] p-4 md:rounded-[24px] md:p-5">
                          <div className="flex flex-col gap-1">
                            <div className="text-[20px] font-semibold tracking-[-0.02em] text-black">
                              Прочее
                            </div>
                            <div className="text-[13px] text-black/55">
                              Дополнительные позиции. Их можно добавить по
                              желанию.
                            </div>
                          </div>

                          <div className="mt-4 space-y-5">
                            {extraGroups.map((group) => (
                              <div key={group.key}>
                                {group.title ? (
                                  <div className="mb-3 text-[14px] font-semibold text-black/75">
                                    {group.title}
                                  </div>
                                ) : null}

                                <div className="space-y-3">
                                  {group.items.map((addon) => {
                                    const addonState = addonDrafts?.[
                                      addon.id
                                    ] ?? {
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
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : null}
                    </section>
                  ) : (
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
                  )}
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
                          {formatMoney(modalGrandTotal, country)}
                        </span>
                      </div>

                      <div className="mt-4 flex items-center justify-between gap-3">
                        <span className="text-[14px] font-medium text-black/70">
                          Кол-во
                        </span>

                        <QtyControl
                          value={productQty}
                          onMinus={() => onDecreaseQty(safeProduct.id)}
                          onPlus={() => onIncreaseQty(safeProduct.id)}
                        />
                      </div>

                      <div className="mt-4 border-t border-black/8 pt-4">
                        <div className="flex items-center justify-between gap-3">
                          <span className="text-[12px] text-black/45">
                            Комплектация
                          </span>
                          <span className="text-[16px] font-semibold leading-none text-black">
                            {formatMoney(
                              selectedRequiredAndExtrasTotal,
                              country,
                            )}
                          </span>
                        </div>

                        <div className="mt-4 flex items-center justify-between gap-3 border-t border-black/8 pt-4">
                          <span className="text-[12px] text-black/45">
                            Итого
                          </span>
                          <span className="text-[18px] font-semibold leading-none text-black">
                            {formatMoney(modalGrandTotal, country)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {hasStructuredConstructor ? (
                      <div className="mt-4 rounded-[18px] bg-white p-4">
                        <div className="text-[14px] font-semibold text-black">
                          Сводка сборки
                        </div>

                        <div className="mt-3 space-y-2.5">
                          {selectedConstructorSummary.map((row) => (
                            <div
                              key={row.key}
                              className="flex items-start justify-between gap-3"
                            >
                              <span className="text-[12px] text-black/50">
                                {row.title}
                              </span>
                              <span
                                className={cn(
                                  "max-w-[180px] text-right text-[12px] font-medium",
                                  row.selectedItem
                                    ? "text-black"
                                    : "text-amber-700",
                                )}
                              >
                                {row.selectedItem?.title || "Не выбрано"}
                              </span>
                            </div>
                          ))}

                          {extraGroups.length > 0 ? (
                            <div className="flex items-start justify-between gap-3 border-t border-black/8 pt-2.5">
                              <span className="text-[12px] text-black/50">
                                Прочее
                              </span>
                              <span className="max-w-[180px] text-right text-[12px] font-medium text-black">
                                {selectedExtrasTitles.length > 0
                                  ? selectedExtrasTitles.join(", ")
                                  : "Не добавлено"}
                              </span>
                            </div>
                          ) : null}
                        </div>
                      </div>
                    ) : null}

                    {hasRequiredItems &&
                    requiredProgress.total > 0 &&
                    !requiredProgress.done ? (
                      <div className="mt-4 rounded-[16px] border border-amber-200 bg-amber-50 px-4 py-3">
                        <div className="flex items-start gap-3">
                          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-700" />
                          <div>
                            <div className="text-[13px] font-semibold text-black">
                              Не все обязательные части выбраны
                            </div>
                            <div className="mt-1 text-[12px] leading-5 text-black/55">
                              Сначала выберите наполнение, левую и правую
                              створку, после этого кнопка сборки станет
                              активной.
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}

                    <button
                      type="button"
                      onClick={() => {
                        if (hasRequiredItems && !canAddMainProduct) return;

                        const willAddToCart = !isInCart;
                        onToggleCart(safeProduct.id);

                        if (
                          hasRequiredItems &&
                          canAddMainProduct &&
                          willAddToCart
                        ) {
                          setKitAssembledModalOpen(true);
                        }
                      }}
                      disabled={hasRequiredItems ? !canAddMainProduct : false}
                      className={cn(
                        "mt-4 inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-[12px] px-4 text-[14px] font-semibold transition",
                        hasRequiredItems
                          ? canAddMainProduct
                            ? isInCart
                              ? "border border-emerald-600 bg-emerald-600 text-white hover:border-emerald-700 hover:bg-emerald-700"
                              : "border border-black bg-black text-white hover:opacity-95"
                            : "cursor-not-allowed border border-black/10 bg-black/10 text-black/40"
                          : isInCart
                            ? "border border-emerald-600 bg-emerald-600 text-white hover:border-emerald-700 hover:bg-emerald-700"
                            : "border border-black bg-black text-white hover:opacity-95",
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

      <KitAssembledModal
        open={kitAssembledModalOpen}
        onClose={() => setKitAssembledModalOpen(false)}
        onContinue={() => {
          setKitAssembledModalOpen(false);
          onClose();
          onContinueShopping?.();
        }}
      />
    </>
  );
}
