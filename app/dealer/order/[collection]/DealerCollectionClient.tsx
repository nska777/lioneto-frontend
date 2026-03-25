"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";

import type {
  DealerCollection,
  DealerCountryCode,
  DealerProduct,
} from "@/app/lib/dealer/shop";
import ProductDetailsModal from "./ProductDetailsModal";
import ProductRow from "./ProductRow";
import OrderConfirmModal from "./OrderConfirmModal";
import OrderSidebar from "./OrderSidebar";
import OrderSuccessModal from "./OrderSuccessModal";
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
  const [isHydrated, setIsHydrated] = useState(false);
  const [confirmOrder, setConfirmOrder] = useState<DealerOrder | null>(null);
  const [successOrder, setSuccessOrder] = useState<DealerOrder | null>(null);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  useEffect(() => {
    setCartProductIds(loadCartProductIds());
    setDrafts(loadDrafts());
    setAddonDrafts(loadAddonDrafts());
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
      } catch {
        // fallback остается UZ
      }
    }

    loadDealerMe();

    return () => {
      cancelled = true;
    };
  }, []);

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

  const currentCollectionProducts = useMemo(() => {
    return allProducts.filter(
      (product) => product.collectionSlug === safeCollection.slug,
    );
  }, [allProducts, safeCollection.slug]);

  const allProductsById = useMemo(() => {
    return new Map(allProducts.map((product) => [product.id, product]));
  }, [allProducts]);

  const allAddonsIndex = useMemo(() => {
    const map = new Map<
      string,
      {
        parentProduct: DealerProduct;
        addon: ReturnType<typeof getProductOptions>[number];
      }
    >();

    allProducts.forEach((product) => {
      getProductOptions(product).forEach((addon) => {
        map.set(addon.id, {
          parentProduct: product,
          addon,
        });
      });
    });

    return map;
  }, [allProducts]);

  function getDraft(productId: string): ProductDraft {
    return drafts[productId] ?? getDefaultDraft();
  }

  function getAddonDraft(addonId: string): AddonDraft {
    return addonDrafts[addonId] ?? getDefaultAddonDraft();
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

  function updateAddonDraft(
    addonId: string,
    updater: (prev: AddonDraft) => AddonDraft,
  ) {
    setAddonDrafts((prev) => {
      const current = prev[addonId] ?? getDefaultAddonDraft();

      return {
        ...prev,
        [addonId]: updater(current),
      };
    });
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

  function handleIncreaseAddonQty(addonId: string) {
    updateAddonDraft(addonId, (prev) => ({
      ...prev,
      quantity: prev.quantity + 1,
    }));
  }

  function handleDecreaseAddonQty(addonId: string) {
    updateAddonDraft(addonId, (prev) => ({
      ...prev,
      quantity: prev.quantity > 1 ? prev.quantity - 1 : 1,
    }));
  }

  function handleToggleCart(productId: string) {
    const product = allProductsById.get(productId);

    if (product) {
      const requiredItems = product.requiredItems ?? [];
      const hasRequired = requiredItems.length > 0;

      if (hasRequired) {
        const hasAnyRequiredSelected = requiredItems.some((item) => {
          const state = getAddonDraft(item.id);

          if (!state?.isInCart) return false;

          return Math.max(0, state.quantity) >= (item.minQuantity ?? 1);
        });

        if (!hasAnyRequiredSelected) {
          setSelectedProduct(product);
          return;
        }
      }
    }

    setCartProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  }

  function handleToggleAddonCart(addonId: string) {
    const entry = allAddonsIndex.get(addonId);
    const addon = entry?.addon ?? null;

    updateAddonDraft(addonId, (prev) => {
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

  function handleRemoveItem(itemId: string) {
    if (itemId.includes("::addon::")) {
      const addonId = itemId.split("::addon::")[1];
      if (addonId) {
        updateAddonDraft(addonId, (prev) => ({
          ...prev,
          isInCart: false,
          markupPercent: 0,
        }));
      }
      return;
    }

    setCartProductIds((prev) => prev.filter((id) => id !== itemId));
  }

  function handleClearCart() {
    setCartProductIds([]);

    setAddonDrafts((prev) => {
      const next: Record<string, AddonDraft> = {};

      Object.entries(prev).forEach(([addonId, value]) => {
        next[addonId] = {
          ...value,
          isInCart: false,
          markupPercent: 0,
        };
      });

      return next;
    });
  }

  const productCartItems = useMemo(() => {
    return cartProductIds
      .map((productId) => {
        const product = allProductsById.get(productId);
        if (!product) return null;

        const draft = getDraft(productId);
        const unitBasePrice = product.price[country] ?? 0;
        const totalBasePrice = unitBasePrice * draft.quantity;

        return {
          kind: "product" as const,
          id: productId,
          productId,
          collectionSlug: product.collectionSlug,
          title: product.title,
          article: product.article,
          color: getProductColor(product),
          quantity: draft.quantity,
          markupPercent: 0,
          unitBasePrice,
          unitFinalPrice: unitBasePrice,
          totalBasePrice,
          totalFinalPrice: totalBasePrice,
        };
      })
      .filter(Boolean) as CartEntry[];
  }, [cartProductIds, drafts, country, allProductsById]);

  const addonCartItems = useMemo(() => {
    const items: CartEntry[] = [];

    allProducts.forEach((product) => {
      const addons = getProductOptions(product);

      addons.forEach((addon) => {
        const addonDraft = getAddonDraft(addon.id);

        if (!addonDraft.isInCart) return;

        const quantity = Math.max(
          addon.minQuantity ?? 1,
          addonDraft.quantity || addon.defaultQuantity || 1,
        );

        const unitBasePrice = addon.price[country] ?? 0;
        const totalBasePrice = unitBasePrice * quantity;

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
          article: addon.article ?? `${product.article} / ${addon.id}`,
          color: getProductColor(product),
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
  }, [addonDrafts, country, allProducts]);

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
      acc[addon.id] = getAddonDraft(addon.id);
      return acc;
    }, {});
  }, [selectedProduct, addonDrafts]);

  function buildCurrentOrder(): DealerOrder {
    const collectionSlugs = Array.from(
      new Set(cartItems.map((item) => item.collectionSlug)),
    );

    return {
      id: generateOrderId(),
      orderNumber: generateOrderNumber(),
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

    setConfirmOrder(buildCurrentOrder());
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

    openCartPrintWindow(
      cartItems,
      country,
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
                    onToggleCart={handleToggleCart}
                  />
                );
              })
            ) : (
              <div className="rounded-[20px] border border-dashed border-black/15 bg-white p-6 text-[13px] text-black/45">
                В этой коллекции пока нет модулей.
              </div>
            )}
          </div>

          <div className="min-w-0">
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

      <ProductDetailsModal
        product={selectedProduct}
        country={country}
        draft={selectedDraft}
        isOpen={Boolean(selectedProduct)}
        onClose={() => setSelectedProduct(null)}
        onIncreaseQty={handleIncreaseQty}
        onDecreaseQty={handleDecreaseQty}
        onToggleCart={handleToggleCart}
        isInCart={
          selectedProduct ? cartProductIds.includes(selectedProduct.id) : false
        }
        addonDrafts={selectedProductAddonDrafts}
        onIncreaseAddonQty={handleIncreaseAddonQty}
        onDecreaseAddonQty={handleDecreaseAddonQty}
        onToggleAddonCart={handleToggleAddonCart}
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
    </>
  );
}
