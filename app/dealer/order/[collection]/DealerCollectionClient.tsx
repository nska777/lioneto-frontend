"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";

import type {
  DealerCollection,
  DealerCountryCode,
  DealerProduct,
} from "@/app/lib/dealer/shop";
import ImagePreviewModal from "./ImagePreviewModal";
import ProductDetailsModal from "./ProductDetailsModal";
import ProductRow from "./ProductRow";
import OrderConfirmModal from "./OrderConfirmModal";
import OrderSidebar from "./OrderSidebar";
import OrderSuccessModal from "./OrderSuccessModal";
import ReservationSuccessModal from "@/app/dealer/components/ReservationSuccessModal";
import {
  buildInternalItems,
  buildVisibleItems,
  generateOrderId,
  generateOrderNumber,
  getAddonCartId,
  getDefaultAddonDraft,
  getDefaultDraft,
  getProductColor,
  openCartPrintWindow,
  resetDraftOrderNumber,
} from "./order-utils";
import {
  loadAddonDrafts,
  loadCartProductIds,
  loadDrafts,
  saveAddonDrafts,
  saveCartProductIds,
  saveDrafts,
} from "./storage";
import type { AddonDraft, CartEntry, DealerOrder, ProductDraft } from "./types";
import { cn } from "./utils";

type Props = {
  initialCollection: DealerCollection;
  initialCollections: DealerCollection[];
  initialProducts: DealerProduct[];
};

type DealerMe = {
  dealerId?: number | null;
  documentId?: string;
  login?: string;
  title?: string | null;
  managerName?: string | null;
  email?: string | null;
  phone?: string | null;
  city?: string | null;
  address?: string | null;
  region?: string | null;
  countryCode?: string | null;
  role?: string | null;
  mustChangePassword?: boolean;
};

type DealerMeResponse = {
  dealer?: DealerMe;
};

type ReservationRecord = {
  id: string;
  documentId?: string;
  productId: string;
  quantity: number;
  reservationStatus: "active" | "expired" | "converted" | "cancelled";
  reservedUntil: string;
};

type ReservationMap = Record<
  string,
  {
    quantity: number;
    reservedUntil?: string;
    reservationId?: string;
  }
>;

function getProductOptions(product: DealerProduct) {
  const required = product.requiredItems ?? [];
  const recommended = product.recommendedItems ?? [];
  const legacy = product.addons ?? [];

  if (required.length || recommended.length) {
    return [...required, ...recommended];
  }

  return legacy;
}

function normalizeDealerCountryCode(
  countryCode?: string | null,
  region?: string | null,
): DealerCountryCode {
  const cc = (countryCode ?? "").trim().toUpperCase();

  if (cc === "RU" || cc === "UZ" || cc === "KZ" || cc === "TJ") {
    return cc;
  }

  const normalizedRegion = (region ?? "").trim().toLowerCase();

  if (
    normalizedRegion.includes("uzbek") ||
    normalizedRegion.includes("узбек")
  ) {
    return "UZ";
  }

  if (normalizedRegion.includes("russia") || normalizedRegion.includes("рос")) {
    return "RU";
  }

  if (
    normalizedRegion.includes("kazakh") ||
    normalizedRegion.includes("казах")
  ) {
    return "KZ";
  }

  if (normalizedRegion.includes("tajik") || normalizedRegion.includes("тадж")) {
    return "TJ";
  }

  return "UZ";
}

function getAddonDraftKey(parentProductId: string, addonId: string) {
  return `${parentProductId}::${addonId}`;
}

function getSelectedProductVariant(
  product: DealerProduct,
  draft: ProductDraft | null | undefined,
) {
  const variantKey = draft?.selectedVariantKey ?? "";

  if (!variantKey) return null;

  return (
    (product.variants ?? []).find((variant) => variant.key === variantKey) ??
    null
  );
}

export default function DealerCollectionClient({
  initialCollection,
  initialCollections,
  initialProducts,
}: Props) {
  const safeCollection = initialCollection;

  const [country, setCountry] = useState<DealerCountryCode>("UZ");
  const [dealerMe, setDealerMe] = useState<DealerMe | null>(null);
  const [drafts, setDrafts] = useState<Record<string, ProductDraft>>({});
  const [addonDrafts, setAddonDrafts] = useState<Record<string, AddonDraft>>(
    {},
  );
  const [cartProductIds, setCartProductIds] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<DealerProduct | null>(
    null,
  );
  const [previewImage, setPreviewImage] = useState<{
    src: string;
    title: string;
  } | null>(null);
  const [isHydrated, setIsHydrated] = useState(false);
  const [confirmOrder, setConfirmOrder] = useState<DealerOrder | null>(null);
  const [successOrder, setSuccessOrder] = useState<DealerOrder | null>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [draftOrderNumber, setDraftOrderNumber] = useState("");

  const [reservationsMap, setReservationsMap] = useState<ReservationMap>({});
  const [reservingProductId, setReservingProductId] = useState("");
  const [reservationSuccess, setReservationSuccess] = useState<{
    open: boolean;
    productTitle: string;
  }>({
    open: false,
    productTitle: "",
  });

  function buildReservationMap(rows: ReservationRecord[]) {
    return rows.reduce<ReservationMap>((acc, row) => {
      if (row.reservationStatus !== "active") return acc;

      const current = acc[row.productId];

      acc[row.productId] = {
        quantity:
          (current?.quantity ?? 0) + Math.max(1, Number(row.quantity ?? 1)),
        reservedUntil: current?.reservedUntil || row.reservedUntil,
        reservationId: current?.reservationId || row.documentId || row.id,
      };

      return acc;
    }, {});
  }

  async function syncReservations() {
    try {
      await fetch("/api/dealer/reservations/release-expired", {
        method: "POST",
        credentials: "include",
      });

      const res = await fetch("/api/dealer/reservations", {
        method: "GET",
        credentials: "include",
        cache: "no-store",
      });

      if (!res.ok) return;

      const data = (await res.json()) as {
        reservations?: ReservationRecord[];
      };

      setReservationsMap(buildReservationMap(data.reservations ?? []));
    } catch {
      // ignore
    }
  }

  useEffect(() => {
    setCartProductIds(loadCartProductIds());
    setDrafts(loadDrafts());

    const rawAddonDrafts = loadAddonDrafts();
    const sanitizedAddonDrafts = Object.fromEntries(
      Object.entries(rawAddonDrafts).filter(([key]) => key.includes("::")),
    );

    setAddonDrafts(sanitizedAddonDrafts);
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    let cancelled = false;

    async function loadDealerMe() {
      try {
        const res = await fetch("/api/dealer/auth/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) return;

        const data = (await res.json()) as DealerMeResponse;
        const dealer = data?.dealer;

        if (!dealer || cancelled) return;

        setDealerMe(dealer);
        setCountry(
          normalizeDealerCountryCode(
            dealer.countryCode ?? null,
            dealer.region ?? null,
          ),
        );

        setDraftOrderNumber((prev) => {
          if (prev) return prev;
          return generateOrderNumber(dealer.login ?? "");
        });
      } catch {
        // fallback остается UZ
      }
    }

    loadDealerMe();
    syncReservations();

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!dealerMe?.documentId) return;
    syncReservations();
  }, [dealerMe?.documentId]);

  useEffect(() => {
    if (!isHydrated) return;
    saveCartProductIds(cartProductIds);
  }, [cartProductIds, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    saveDrafts(drafts);
  }, [drafts, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    saveAddonDrafts(addonDrafts);
  }, [addonDrafts, isHydrated]);

  const allProducts = useMemo(() => {
    return initialProducts;
  }, [initialProducts]);

  const allProductsWithStock = useMemo(() => {
    return allProducts.map((product) => {
      const reservedFromReservations = reservationsMap[product.id]?.quantity;
      const reservedQty =
        reservedFromReservations != null
          ? Math.max(0, Number(reservedFromReservations))
          : Math.max(0, Number(product.reservedQty ?? 0));

      return {
        ...product,
        reservedQty,
      };
    });
  }, [allProducts, reservationsMap]);

  const currentCollectionProducts = useMemo(() => {
    return allProductsWithStock.filter(
      (product) => product.collectionSlug === safeCollection.slug,
    );
  }, [allProductsWithStock, safeCollection.slug]);

  const allProductsById = useMemo(() => {
    return new Map(
      allProductsWithStock.map((product) => [product.id, product]),
    );
  }, [allProductsWithStock]);

  const allAddonsIndex = useMemo(() => {
    const map = new Map<
      string,
      {
        parentProduct: DealerProduct;
        addon: ReturnType<typeof getProductOptions>[number];
      }
    >();

    allProductsWithStock.forEach((product) => {
      getProductOptions(product).forEach((addon) => {
        const draftKey = getAddonDraftKey(product.id, addon.id);

        map.set(draftKey, {
          parentProduct: product,
          addon,
        });
      });
    });

    return map;
  }, [allProductsWithStock]);

  function getDraft(productId: string): ProductDraft {
    return drafts[productId] ?? getDefaultDraft();
  }

  function getAddonDraftByKey(draftKey: string): AddonDraft {
    return addonDrafts[draftKey] ?? getDefaultAddonDraft();
  }

  function getAddonDraft(parentProductId: string, addonId: string): AddonDraft {
    return getAddonDraftByKey(getAddonDraftKey(parentProductId, addonId));
  }

  function updateDraft(
    productId: string,
    updater: (prev: ProductDraft) => ProductDraft,
  ) {
    setDrafts((prev) => {
      const current = prev[productId] ?? getDefaultDraft();

      return {
        ...prev,
        [productId]: updater(current),
      };
    });
  }

  function handleSelectProductVariant(
    productId: string,
    variantKey: string,
    color: string,
  ) {
    setDrafts((prev) => {
      const current = prev[productId] ?? getDefaultDraft();

      if (
        current.selectedVariantKey === variantKey &&
        current.selectedColor === color
      ) {
        return prev;
      }

      return {
        ...prev,
        [productId]: {
          ...current,
          selectedVariantKey: variantKey,
          selectedColor: color,
        },
      };
    });
  }

  function updateAddonDraftByKey(
    draftKey: string,
    updater: (prev: AddonDraft) => AddonDraft,
  ) {
    setAddonDrafts((prev) => {
      const current = prev[draftKey] ?? getDefaultAddonDraft();

      return {
        ...prev,
        [draftKey]: updater(current),
      };
    });
  }

  function handleSelectAddonVariant(
    parentProductId: string,
    addonId: string,
    variantKey: string,
    color: string,
  ) {
    const draftKey = getAddonDraftKey(parentProductId, addonId);

    updateAddonDraftByKey(draftKey, (prev) => {
      if (
        prev.selectedVariantKey === variantKey &&
        prev.selectedColor === color
      ) {
        return prev;
      }

      return {
        ...prev,
        selectedVariantKey: variantKey,
        selectedColor: color,
      };
    });
  }

  function updateAddonDraft(
    parentProductId: string,
    addonId: string,
    updater: (prev: AddonDraft) => AddonDraft,
  ) {
    updateAddonDraftByKey(getAddonDraftKey(parentProductId, addonId), updater);
  }

  function handleIncreaseQty(productId: string) {
    updateDraft(productId, (prev) => ({
      ...prev,
      quantity: prev.quantity + 1,
    }));
  }

  function handleDecreaseQty(productId: string) {
    updateDraft(productId, (prev) => ({
      ...prev,
      quantity: prev.quantity > 1 ? prev.quantity - 1 : 1,
    }));
  }

  function handleIncreaseAddonQtyByKey(draftKey: string) {
    updateAddonDraftByKey(draftKey, (prev) => ({
      ...prev,
      quantity: prev.quantity + 1,
    }));
  }

  function handleDecreaseAddonQtyByKey(draftKey: string) {
    updateAddonDraftByKey(draftKey, (prev) => ({
      ...prev,
      quantity: prev.quantity > 1 ? prev.quantity - 1 : 1,
    }));
  }

  function handleToggleCart(productId: string) {
    const product = allProductsById.get(productId);

    if (product) {
      const requiredItems = product.requiredItems ?? [];
      const structuredSingleGroups = Array.from(
        new Set(
          requiredItems
            .filter(
              (item) =>
                item.groupKey &&
                (item.groupSelection ?? "multiple") === "single",
            )
            .map((item) => item.groupKey as string),
        ),
      );

      if (structuredSingleGroups.length > 0) {
        const areAllConstructorGroupsSelected = structuredSingleGroups.every(
          (groupKey) => {
            const groupItems = requiredItems.filter(
              (item) =>
                item.groupKey === groupKey &&
                (item.groupSelection ?? "multiple") === "single",
            );

            return groupItems.some((item) => {
              const state = getAddonDraft(product.id, item.id);
              const minQty = item.minQuantity ?? 1;
              const qty = Math.max(0, state?.quantity ?? 0);

              return Boolean(state?.isInCart) && qty >= minQty;
            });
          },
        );

        if (!areAllConstructorGroupsSelected) {
          setSelectedProduct(product);
          return;
        }
      } else {
        const hasRequired = requiredItems.length > 0;

        if (hasRequired) {
          const areAllRequiredSelected = requiredItems.every((item) => {
            const state = getAddonDraft(product.id, item.id);
            const minQty = item.minQuantity ?? 1;
            const qty = Math.max(0, state?.quantity ?? 0);

            return Boolean(state?.isInCart) && qty >= minQty;
          });

          if (!areAllRequiredSelected) {
            setSelectedProduct(product);
            return;
          }
        }
      }
    }

    setCartProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  }

  async function handleReserveProduct(product: DealerProduct) {
    const draft = getDraft(product.id);
    const quantity = Math.max(1, Number(draft.quantity ?? 1));

    if (!dealerMe?.documentId) {
      alert("Сначала войди как дилер");
      return;
    }

    const stockQty = Math.max(0, Number(product.stockQty ?? 0));
    const reservedQty = Math.max(0, Number(product.reservedQty ?? 0));
    const availableQty = Math.max(0, stockQty - reservedQty);

    if (product.isStockTracked && availableQty < quantity) {
      alert("Недостаточно товара в остатке");
      return;
    }

    try {
      setReservingProductId(product.id);

      const res = await fetch("/api/dealer/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          productId: product.id,
          quantity,
          collectionSlug: product.collectionSlug,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(data?.error || "Не удалось забронировать товар");
        return;
      }

      setCartProductIds((prev) =>
        prev.includes(product.id) ? prev : [...prev, product.id],
      );

      setReservationsMap((prev) => ({
        ...prev,
        [product.id]: {
          quantity: Math.max(
            0,
            Number(
              data?.stock?.reservedQty ??
                prev[product.id]?.quantity ??
                quantity,
            ),
          ),
          reservedUntil:
            data?.reservation?.reservedUntil ??
            prev[product.id]?.reservedUntil ??
            "",
          reservationId:
            data?.reservation?.documentId ??
            data?.reservation?.id ??
            prev[product.id]?.reservationId,
        },
      }));

      setReservationSuccess({
        open: true,
        productTitle: product.title,
      });
    } catch {
      alert("Ошибка бронирования");
    } finally {
      setReservingProductId("");
    }
  }

  function handleToggleAddonCartByKey(draftKey: string) {
    const entry = allAddonsIndex.get(draftKey);
    const addon = entry?.addon ?? null;

    updateAddonDraftByKey(draftKey, (prev) => {
      const nextInCart = !prev.isInCart;

      return {
        ...prev,
        isInCart: nextInCart,
        quantity: nextInCart
          ? Math.max(
              prev.quantity || 1,
              addon?.minQuantity ?? addon?.defaultQuantity ?? 1,
            )
          : prev.quantity,
        markupPercent: 0,
      };
    });
  }

  function handleChooseSingleAddonInGroup(
    parentProductId: string,
    groupKey: string,
    addonId: string,
  ) {
    const product = allProductsById.get(parentProductId);
    if (!product) return;

    const groupItems = (product.requiredItems ?? []).filter(
      (item) =>
        item.groupKey === groupKey &&
        (item.groupSelection ?? "multiple") === "single",
    );

    if (!groupItems.length) return;

    setAddonDrafts((prev) => {
      const next = { ...prev };

      groupItems.forEach((item) => {
        const key = getAddonDraftKey(parentProductId, item.id);
        const current = next[key] ?? getDefaultAddonDraft();

        if (item.id === addonId) {
          next[key] = {
            ...current,
            isInCart: true,
            quantity: Math.max(
              current.quantity || 1,
              item.minQuantity ?? item.defaultQuantity ?? 1,
            ),
            markupPercent: 0,
          };
        } else {
          next[key] = {
            ...current,
            isInCart: false,
            markupPercent: 0,
          };
        }
      });

      return next;
    });
  }

  function handleRemoveItem(itemId: string) {
    if (itemId.includes("::addon::")) {
      const [parentProductId, addonId] = itemId.split("::addon::");

      if (parentProductId && addonId) {
        updateAddonDraft(parentProductId, addonId, (prev) => ({
          ...prev,
          isInCart: false,
          markupPercent: 0,
        }));
      }

      return;
    }

    setCartProductIds((prev) => prev.filter((id) => id !== itemId));

    setAddonDrafts((prev) => {
      const next = { ...prev };

      Object.keys(next).forEach((draftKey) => {
        if (draftKey.startsWith(`${itemId}::`)) {
          delete next[draftKey];
        }
      });

      return next;
    });
  }

  function handleClearCart() {
    setCartProductIds([]);
    setAddonDrafts({});
    setDrafts({});
    setSelectedProduct(null);
    setConfirmOrder(null);

    saveCartProductIds([]);
    saveAddonDrafts({});
    saveDrafts({});
  }

  function handleOpenRelatedProduct(productId: string) {
    const product = allProductsById.get(productId);
    if (!product) return;
    setSelectedProduct(product);
  }

  function handleOpenImagePreview(product: DealerProduct) {
    if (!product.image) return;

    setPreviewImage({
      src: product.image,
      title: product.title,
    });
  }

  const productCartItems = useMemo<CartEntry[]>(() => {
    return cartProductIds
      .map((productId) => {
        const product = allProductsById.get(productId);
        if (!product) return null;

        const draft = getDraft(productId);
        const selectedVariant = getSelectedProductVariant(product, draft);
        const quantity = Math.max(1, draft.quantity || 1);

        const unitBasePrice =
          selectedVariant?.price?.[country] ?? product.price[country] ?? 0;

        const totalBasePrice = unitBasePrice * quantity;

        const selectedColor =
          draft.selectedColor ||
          selectedVariant?.label ||
          getProductColor(product);

        return {
          kind: "product" as const,
          id: productId,
          productId,
          collectionSlug: product.collectionSlug,
          title: product.title,
          article: product.article ?? "",
          articleShort: product.articleShort ?? "",
          color: selectedColor,
          size: product.size,
          quantity,
          markupPercent: 0,
          unitBasePrice,
          unitFinalPrice: unitBasePrice,
          totalBasePrice,
          totalFinalPrice: totalBasePrice,
          isReserved: Boolean(reservationsMap[product.id]),
          reservedUntil: reservationsMap[product.id]?.reservedUntil,
          reservationId: reservationsMap[product.id]?.reservationId,
        };
      })
      .filter(Boolean) as CartEntry[];
  }, [cartProductIds, drafts, country, allProductsById, reservationsMap]);

  const addonCartItems = useMemo<CartEntry[]>(() => {
    const items: CartEntry[] = [];

    allProductsWithStock.forEach((product) => {
      const addons = getProductOptions(product);

      addons.forEach((addon) => {
        const draftKey = getAddonDraftKey(product.id, addon.id);
        const addonDraft = getAddonDraftByKey(draftKey);

        if (!addonDraft.isInCart) return;

        const quantity = Math.max(
          addon.minQuantity ?? 1,
          addonDraft.quantity || addon.defaultQuantity || 1,
        );

        const addonSelectedVariant =
          (addon.variants ?? []).find(
            (variant) => variant.key === addonDraft.selectedVariantKey,
          ) ?? null;

        const unitBasePrice =
          addonSelectedVariant?.price?.[country] ?? addon.price[country] ?? 0;

        const totalBasePrice = unitBasePrice * quantity;

        const productDraft = getDraft(product.id);
        const selectedParentVariant = getSelectedProductVariant(
          product,
          productDraft,
        );

        const selectedColor =
          addonDraft.selectedColor ||
          addonSelectedVariant?.label ||
          addon.color ||
          productDraft.selectedColor ||
          selectedParentVariant?.label ||
          getProductColor(product);

        const baseAddonArticle =
          addon.article ?? `${product.article} / ${addon.id}`;
        const baseAddonArticleShort =
          addon.articleShort ??
          addon.article ??
          `${product.article} / ${addon.id}`;

        items.push({
          kind: "addon",
          id: getAddonCartId(product.id, addon.id),
          parentProductId: product.id,
          addonId: addon.id,
          addonKind: addon.kind,
          addonSelectionType: addon.selectionType,
          parentProductTitle: product.title,
          collectionSlug: product.collectionSlug,
          title: addon.title,
          article: baseAddonArticle,
          articleShort: baseAddonArticleShort,
          color: selectedColor,
          size: addon.size,
          quantity,
          markupPercent: 0,
          unitBasePrice,
          unitFinalPrice: unitBasePrice,
          totalBasePrice,
          totalFinalPrice: totalBasePrice,
        });
      });
    });

    return items;
  }, [addonDrafts, country, allProductsWithStock, drafts]);

  const cartItems = useMemo(() => {
    return [...productCartItems, ...addonCartItems];
  }, [productCartItems, addonCartItems]);

  const summary = useMemo(() => {
    const totalQty = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.totalBasePrice,
      0,
    );

    return {
      totalQty,
      subtotal,
    };
  }, [cartItems]);

  const selectedDraft = selectedProduct ? getDraft(selectedProduct.id) : null;

  const selectedProductAddonDrafts = useMemo(() => {
    if (!selectedProduct) return {};

    const options = getProductOptions(selectedProduct);
    if (!options.length) return {};

    return options.reduce<Record<string, AddonDraft>>((acc, addon) => {
      const draftKey = getAddonDraftKey(selectedProduct.id, addon.id);
      acc[addon.id] = getAddonDraftByKey(draftKey);
      return acc;
    }, {});
  }, [selectedProduct, addonDrafts]);

  function handleSelectedProductIncreaseAddonQty(addonId: string) {
    if (!selectedProduct) return;
    handleIncreaseAddonQtyByKey(getAddonDraftKey(selectedProduct.id, addonId));
  }

  function handleSelectedProductDecreaseAddonQty(addonId: string) {
    if (!selectedProduct) return;
    handleDecreaseAddonQtyByKey(getAddonDraftKey(selectedProduct.id, addonId));
  }

  function handleSelectedProductToggleAddonCart(addonId: string) {
    if (!selectedProduct) return;
    handleToggleAddonCartByKey(getAddonDraftKey(selectedProduct.id, addonId));
  }

  function handleSelectedProductSelectAddonVariant(
    addonId: string,
    variantKey: string,
    color: string,
  ) {
    if (!selectedProduct) return;

    handleSelectAddonVariant(selectedProduct.id, addonId, variantKey, color);
  }

  function handleSelectedProductChooseSingleAddonInGroup(
    groupKey: string,
    addonId: string,
  ) {
    if (!selectedProduct) return;
    handleChooseSingleAddonInGroup(selectedProduct.id, groupKey, addonId);
  }

  function getActiveOrderNumber() {
    if (draftOrderNumber) return draftOrderNumber;
    return generateOrderNumber(dealerMe?.login ?? "");
  }

  function buildCurrentOrder(orderNumberOverride?: string): DealerOrder {
    const collectionSlugs = Array.from(
      new Set(cartItems.map((item) => item.collectionSlug)),
    );

    return {
      id: generateOrderId(),
      orderNumber: orderNumberOverride ?? getActiveOrderNumber(),
      createdAt: new Date().toISOString(),
      country,
      collectionSlug: collectionSlugs[0] ?? safeCollection.slug,
      collectionSlugs,
      totalQty: summary.totalQty,
      visibleSubtotal: summary.subtotal,
      visibleItems: buildVisibleItems(cartItems),
      internalSubtotal: summary.subtotal,
      internalTotalWithItemMarkup: summary.subtotal,
      globalMarkupPercent: 0,
      globalMarkupAmount: 0,
      internalTotal: summary.subtotal,
      internalItems: buildInternalItems(cartItems),
    };
  }

  function handleCheckout() {
    if (cartItems.length === 0) {
      alert("Корзина пуста");
      return;
    }

    const orderNumber = getActiveOrderNumber();
    setDraftOrderNumber(orderNumber);
    setConfirmOrder(buildCurrentOrder(orderNumber));
  }

  async function handleConfirmOrder() {
    if (!confirmOrder || isSubmittingOrder) return;

    try {
      setIsSubmittingOrder(true);

      const res = await fetch("/api/dealer/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          orderNumber: confirmOrder.orderNumber,
          dealerTitle: dealerMe?.title ?? "",
          dealerEmail: dealerMe?.email ?? "",
          countryCode: confirmOrder.country,
          currency: confirmOrder.country,
          collectionTitles: confirmOrder.collectionSlugs,
          totalQty: confirmOrder.totalQty,
          subtotal: confirmOrder.visibleSubtotal,
          totalWithMarkup: confirmOrder.internalTotalWithItemMarkup,
          globalMarkupPercent: confirmOrder.globalMarkupPercent,
          globalMarkupAmount: confirmOrder.globalMarkupAmount,
          total: confirmOrder.internalTotal,
          items: confirmOrder.visibleItems,
          notes: "",
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Не удалось сохранить заказ");
      }

      handleClearCart();
      setSuccessOrder(confirmOrder);
      setConfirmOrder(null);

      resetDraftOrderNumber(dealerMe?.login ?? "");
      setDraftOrderNumber(generateOrderNumber(dealerMe?.login ?? ""));
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Не удалось сохранить заказ";

      alert(message);
    } finally {
      setIsSubmittingOrder(false);
    }
  }

  function handlePrintBase() {
    if (cartItems.length === 0) {
      alert("Корзина пуста");
      return;
    }

    const orderNumber = getActiveOrderNumber();
    setDraftOrderNumber(orderNumber);

    openCartPrintWindow(
      cartItems,
      country,
      orderNumber,
      safeCollection.title,
      summary.totalQty,
      summary.subtotal,
      summary.subtotal,
      0,
      0,
      summary.subtotal,
      false,
    );
  }

  return (
    <>
      <div className="mx-auto flex w-full max-w-[1460px] flex-col gap-3">
        <div className="rounded-[20px] border border-black/10 bg-white p-3 shadow-[0_10px_24px_-20px_rgba(0,0,0,0.18)] sm:rounded-[24px] sm:p-4">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <Link
                href="/dealer/order"
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-black/10 px-3 py-1.5 text-[11px] font-medium text-black/60 transition hover:bg-black/[0.03] hover:text-black sm:text-[12px]"
              >
                <ArrowLeft className="h-4 w-4" />
                Назад к коллекциям
              </Link>

              <h1 className="mt-3 break-words text-[28px] font-semibold leading-none text-black sm:text-[34px] xl:text-[42px]">
                {safeCollection.title}
              </h1>
              <p className="mt-1 text-[13px] text-black/55 sm:text-[14px]">
                коллекция
              </p>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2 sm:gap-3 lg:flex lg:flex-wrap">
            {initialCollections.map((item) => (
              <Link
                key={item.id}
                href={`/dealer/order/${item.slug}`}
                className={cn(
                  "inline-flex min-w-0 cursor-pointer items-center justify-center rounded-[16px] border px-3 py-3 text-center text-[14px] font-medium transition sm:rounded-[18px] sm:px-4 sm:py-3 sm:text-[15px] lg:min-w-[132px] lg:px-5 lg:py-4",
                  item.slug === safeCollection.slug
                    ? "border-black bg-black text-white"
                    : "border-black/10 bg-[#fafaf8] text-black hover:border-black/20",
                )}
              >
                <span className="truncate">{item.title}</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 xl:grid-cols-[minmax(0,1fr)_380px] 2xl:grid-cols-[minmax(0,1fr)_400px]">
          <div className="flex min-w-0 flex-col gap-2 sm:gap-[8px]">
            {currentCollectionProducts.length > 0 ? (
              currentCollectionProducts.map((product) => {
                const draft = getDraft(product.id);

                return (
                  <ProductRow
                    key={product.id}
                    product={product}
                    country={country}
                    draft={draft}
                    isInCart={cartProductIds.includes(product.id)}
                    onIncreaseQty={handleIncreaseQty}
                    onDecreaseQty={handleDecreaseQty}
                    onOpenModal={setSelectedProduct}
                    onOpenImagePreview={handleOpenImagePreview}
                    onToggleCart={handleToggleCart}
                    onReserve={handleReserveProduct}
                    isReserving={reservingProductId === product.id}
                  />
                );
              })
            ) : (
              <div className="rounded-[20px] border border-dashed border-black/15 bg-white p-6 text-[13px] text-black/45">
                В этой коллекции пока нет модулей.
              </div>
            )}
          </div>

          <div className="min-w-0 xl:sticky xl:top-3 xl:self-start">
            <OrderSidebar
              cartItems={cartItems}
              totalQty={summary.totalQty}
              subtotal={summary.subtotal}
              country={country}
              onClearCart={handleClearCart}
              onRemoveItem={handleRemoveItem}
              onCheckout={handleCheckout}
              onPrintBase={handlePrintBase}
            />
          </div>
        </div>
      </div>

      <ImagePreviewModal
        image={previewImage}
        onClose={() => setPreviewImage(null)}
      />

      <ProductDetailsModal
        product={selectedProduct}
        country={country}
        draft={selectedDraft}
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        onIncreaseQty={handleIncreaseQty}
        onDecreaseQty={handleDecreaseQty}
        onToggleCart={handleToggleCart}
        onSelectVariant={handleSelectProductVariant}
        onSelectAddonVariant={handleSelectedProductSelectAddonVariant}
        onOpenRelatedProduct={handleOpenRelatedProduct}
        isInCart={
          selectedProduct ? cartProductIds.includes(selectedProduct.id) : false
        }
        addonDrafts={selectedProductAddonDrafts}
        onIncreaseAddonQty={handleSelectedProductIncreaseAddonQty}
        onDecreaseAddonQty={handleSelectedProductDecreaseAddonQty}
        onToggleAddonCart={handleSelectedProductToggleAddonCart}
        onChooseSingleAddonInGroup={
          handleSelectedProductChooseSingleAddonInGroup
        }
      />

      <OrderConfirmModal
        order={confirmOrder}
        onClose={() => {
          if (isSubmittingOrder) return;
          setConfirmOrder(null);
        }}
        onConfirm={handleConfirmOrder}
      />

      <OrderSuccessModal
        order={successOrder}
        onClose={() => setSuccessOrder(null)}
      />

      <ReservationSuccessModal
        open={reservationSuccess.open}
        productTitle={reservationSuccess.productTitle}
        onClose={() =>
          setReservationSuccess({
            open: false,
            productTitle: "",
          })
        }
      />
    </>
  );
}
