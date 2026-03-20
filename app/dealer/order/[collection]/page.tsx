"use client";

import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft } from "lucide-react";

import {
  dealerCollections,
  dealerProducts,
  type DealerCountryCode,
  type DealerProduct,
} from "../data";
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
  loadCountry,
  loadGlobalMarkup,
  loadDrafts,
  prependOrder,
  saveAddonDrafts,
  saveCartProductIds,
  saveCountry,
  saveDrafts,
  saveGlobalMarkup,
} from "./storage";
import type { AddonDraft, CartEntry, DealerOrder, ProductDraft } from "./types";
import { cn, getFinalPrice } from "./utils";

export default function DealerCollectionPage() {
  const routeParams = useParams();
  const collectionSlug = Array.isArray(routeParams.collection)
    ? routeParams.collection[0]
    : routeParams.collection;

  const collection = dealerCollections.find(
    (item) => item.slug === collectionSlug,
  );

  const [country, setCountry] = useState<DealerCountryCode>("RU");
  const [globalMarkupPercent, setGlobalMarkupPercent] = useState(0);
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

  if (!collectionSlug || !collection) {
    notFound();
  }
  const safeCollection = collection;
  useEffect(() => {
    setCartProductIds(loadCartProductIds());
    setDrafts(loadDrafts());
    setAddonDrafts(loadAddonDrafts());
    setGlobalMarkupPercent(loadGlobalMarkup());

    const savedCountry = loadCountry();
    if (savedCountry) {
      setCountry(savedCountry);
    }

    setIsHydrated(true);
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

  useEffect(() => {
    if (!isHydrated) return;
    saveGlobalMarkup(globalMarkupPercent);
  }, [globalMarkupPercent, isHydrated]);

  useEffect(() => {
    if (!isHydrated) return;
    saveCountry(country);
  }, [country, isHydrated]);

  const currentCollectionProducts = dealerProducts.filter(
    (product) => product.collectionSlug === collection.slug,
  );

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

  function handleMarkupChange(productId: string, value: number) {
    updateDraft(productId, (prev) => ({
      ...prev,
      markupPercent: value,
      isMarkupDirty: true,
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

  function handleAddonMarkupChange(addonId: string, value: number) {
    updateAddonDraft(addonId, (prev) => ({
      ...prev,
      markupPercent: value >= 0 ? value : 0,
    }));
  }

  function handleToggleCart(productId: string) {
    setCartProductIds((prev) =>
      prev.includes(productId)
        ? prev.filter((id) => id !== productId)
        : [...prev, productId],
    );
  }

  function handleToggleAddonCart(addonId: string) {
    updateAddonDraft(addonId, (prev) => ({
      ...prev,
      isInCart: !prev.isInCart,
    }));
  }

  function handleRemoveItem(itemId: string) {
    if (itemId.includes("::addon::")) {
      const addonId = itemId.split("::addon::")[1];
      if (addonId) {
        updateAddonDraft(addonId, (prev) => ({
          ...prev,
          isInCart: false,
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
        };
      });

      return next;
    });
  }

  const productCartItems = useMemo(() => {
    return cartProductIds
      .map((productId) => {
        const product = dealerProducts.find((item) => item.id === productId);
        if (!product) return null;

        const draft = getDraft(productId);
        const unitBasePrice = product.price[country];
        const unitFinalPrice = getFinalPrice(
          unitBasePrice,
          draft.markupPercent,
        );
        const totalBasePrice = unitBasePrice * draft.quantity;
        const totalFinalPrice = unitFinalPrice * draft.quantity;

        return {
          kind: "product" as const,
          id: productId,
          productId,
          collectionSlug: product.collectionSlug,
          title: product.title,
          article: product.article,
          color: getProductColor(product),
          quantity: draft.quantity,
          markupPercent: draft.markupPercent,
          unitBasePrice,
          unitFinalPrice,
          totalBasePrice,
          totalFinalPrice,
        };
      })
      .filter(Boolean) as CartEntry[];
  }, [cartProductIds, drafts, country]);

  const addonCartItems = useMemo(() => {
    const items: CartEntry[] = [];

    dealerProducts.forEach((product) => {
      const addons = product.addons ?? [];

      addons.forEach((addon) => {
        const addonDraft = getAddonDraft(addon.id);

        if (!addonDraft.isInCart) return;

        const quantity = addon.type === "checkbox" ? 1 : addonDraft.quantity;
        const unitBasePrice = addon.price[country] ?? 0;
        const unitFinalPrice = getFinalPrice(
          unitBasePrice,
          addonDraft.markupPercent,
        );
        const totalBasePrice = unitBasePrice * quantity;
        const totalFinalPrice = unitFinalPrice * quantity;

        items.push({
          kind: "addon",
          id: getAddonCartId(product.id, addon.id),
          parentProductId: product.id,
          addonId: addon.id,
          collectionSlug: product.collectionSlug,
          title: addon.title,
          article: `${product.article} / ${addon.id}`,
          color: getProductColor(product),
          quantity,
          markupPercent: addonDraft.markupPercent,
          unitBasePrice,
          unitFinalPrice,
          totalBasePrice,
          totalFinalPrice,
        });
      });
    });

    return items;
  }, [addonDrafts, country]);

  const cartItems = useMemo(() => {
    return [...productCartItems, ...addonCartItems];
  }, [productCartItems, addonCartItems]);

  const summary = useMemo(() => {
    const totalQty = cartItems.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = cartItems.reduce(
      (sum, item) => sum + item.totalBasePrice,
      0,
    );

    const totalWithItemMarkup = cartItems.reduce(
      (sum, item) => sum + item.totalFinalPrice,
      0,
    );

    const globalMarkupAmount = Math.round(
      totalWithItemMarkup * (globalMarkupPercent / 100),
    );

    const total = totalWithItemMarkup + globalMarkupAmount;

    return {
      totalQty,
      subtotal,
      totalWithItemMarkup,
      globalMarkupAmount,
      total,
    };
  }, [cartItems, globalMarkupPercent]);

  const selectedDraft = selectedProduct ? getDraft(selectedProduct.id) : null;

  const selectedProductAddonDrafts = useMemo(() => {
    if (!selectedProduct?.addons?.length) return {};

    return selectedProduct.addons.reduce<Record<string, AddonDraft>>(
      (acc, addon) => {
        acc[addon.id] = getAddonDraft(addon.id);
        return acc;
      },
      {},
    );
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
      collectionSlug: collectionSlugs[0] ?? collectionSlug,
      collectionSlugs,
      totalQty: summary.totalQty,
      visibleSubtotal: summary.subtotal,
      visibleItems: buildVisibleItems(cartItems),
      internalSubtotal: summary.subtotal,
      internalTotalWithItemMarkup: summary.totalWithItemMarkup,
      globalMarkupPercent,
      globalMarkupAmount: summary.globalMarkupAmount,
      internalTotal: summary.total,
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

  function handleConfirmOrder() {
    if (!confirmOrder) return;

    try {
      prependOrder(confirmOrder);
      handleClearCart();
      setSuccessOrder(confirmOrder);
      setConfirmOrder(null);
    } catch {
      alert("Не удалось сохранить заказ");
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
      summary.totalWithItemMarkup,
      globalMarkupPercent,
      summary.globalMarkupAmount,
      summary.total,
      false,
    );
  }

  function handlePrintMarkup() {
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
      summary.totalWithItemMarkup,
      globalMarkupPercent,
      summary.globalMarkupAmount,
      summary.total,
      true,
    );
  }

  return (
    <>
      <div className="mx-auto flex w-full max-w-[1460px] flex-col gap-3">
        <div className="rounded-[24px] border border-black/10 bg-white p-4 shadow-[0_10px_24px_-20px_rgba(0,0,0,0.18)]">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0">
              <Link
                href="/dealer/order"
                className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-black/10 px-3 py-1.5 text-[12px] font-medium text-black/60 transition hover:bg-black/[0.03] hover:text-black"
              >
                <ArrowLeft className="h-4 w-4" />
                Назад к коллекциям
              </Link>

              <h1 className="mt-3 text-[42px] font-semibold leading-none text-black md:text-[34px]">
                {collection.title}
              </h1>
              <p className="mt-1 text-[14px] text-black/55">коллекция</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {(["RU", "UZ", "KZ", "TJ"] as DealerCountryCode[]).map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => setCountry(item)}
                  className={cn(
                    "inline-flex h-8 cursor-pointer items-center justify-center rounded-full border px-3 text-[11px] font-semibold transition",
                    country === item
                      ? "border-amber-300 bg-amber-50 text-black"
                      : "border-black/10 bg-white text-black/60 hover:border-black/20",
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-3">
            {dealerCollections.map((item) => (
              <Link
                key={item.slug}
                href={`/dealer/order/${item.slug}`}
                className={cn(
                  "inline-flex min-w-[150px] cursor-pointer items-center justify-center rounded-[18px] border px-5 py-4 text-[18px] font-medium transition md:text-[15px]",
                  item.slug === collection.slug
                    ? "border-black bg-black text-white"
                    : "border-black/10 bg-[#fafaf8] text-black hover:border-black/20",
                )}
              >
                {item.title}
              </Link>
            ))}
          </div>
        </div>

        <div className="grid gap-3 xl:grid-cols-[minmax(0,1fr)_340px]">
          <div className="flex flex-col gap-[8px]">
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
                    onMarkupChange={handleMarkupChange}
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

          <OrderSidebar
            cartItems={cartItems}
            totalQty={summary.totalQty}
            subtotal={summary.subtotal}
            totalWithItemMarkup={summary.totalWithItemMarkup}
            globalMarkupPercent={globalMarkupPercent}
            globalMarkupAmount={summary.globalMarkupAmount}
            total={summary.total}
            country={country}
            onGlobalMarkupChange={setGlobalMarkupPercent}
            onClearCart={handleClearCart}
            onRemoveItem={handleRemoveItem}
            onCheckout={handleCheckout}
            onPrintBase={handlePrintBase}
            onPrintMarkup={handlePrintMarkup}
          />
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
        onMarkupChange={handleMarkupChange}
        onToggleCart={handleToggleCart}
        isInCart={
          selectedProduct ? cartProductIds.includes(selectedProduct.id) : false
        }
        addonDrafts={selectedProductAddonDrafts}
        onIncreaseAddonQty={handleIncreaseAddonQty}
        onDecreaseAddonQty={handleDecreaseAddonQty}
        onAddonMarkupChange={handleAddonMarkupChange}
        onToggleAddonCart={handleToggleAddonCart}
      />

      <OrderConfirmModal
        order={confirmOrder}
        onClose={() => setConfirmOrder(null)}
        onConfirm={handleConfirmOrder}
      />

      <OrderSuccessModal
        order={successOrder}
        onClose={() => setSuccessOrder(null)}
      />
    </>
  );
}
