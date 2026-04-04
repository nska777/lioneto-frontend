export type ProductDraft = {
  quantity: number;
  markupPercent: number;
  isMarkupDirty: boolean;
  selectedVariantKey?: string;
  selectedColor?: string;
};

export type AddonDraft = {
  quantity: number;
  markupPercent: number;
  isInCart: boolean;
  selectedVariantKey?: string;
  selectedColor?: string;
};

export type CartEntry =
  | {
      kind: "product";
      id: string;
      productId: string;
      collectionSlug: string;
      title: string;
      article: string;
      articleShort?: string;
      color?: string;
      size?: string;
      quantity: number;
      markupPercent: number;
      unitBasePrice: number;
      unitFinalPrice: number;
      totalBasePrice: number;
      totalFinalPrice: number;
    }
  | {
      kind: "addon";
      id: string;
      parentProductId: string;
      addonId: string;
      addonKind?: "required" | "recommended";
      addonSelectionType?: "toggle" | "quantity";
      parentProductTitle?: string;
      collectionSlug: string;
      title: string;
      article: string;
      articleShort?: string;
      color?: string;
      size?: string;
      quantity: number;
      markupPercent: number;
      unitBasePrice: number;
      unitFinalPrice: number;
      totalBasePrice: number;
      totalFinalPrice: number;
    };

export type DealerOrderVisibleItem = {
  id: string;
  kind: "product" | "addon";
  addonKind?: "required" | "recommended";
  parentProductId?: string;
  parentProductTitle?: string;
  collectionSlug: string;
  title: string;
  article: string;
  articleShort?: string;
  color?: string;
  size?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
};

export type DealerOrderInternalItem = {
  id: string;
  kind: "product" | "addon";
  addonKind?: "required" | "recommended";
  parentProductId?: string;
  parentProductTitle?: string;
  collectionSlug: string;
  title: string;
  article: string;
  articleShort?: string;
  color?: string;
  size?: string;
  quantity: number;
  markupPercent: number;
  unitBasePrice: number;
  unitFinalPrice: number;
  totalBasePrice: number;
  totalFinalPrice: number;
};

export type DealerOrder = {
  id: string;
  orderNumber: string;
  createdAt: string;
  country: "RU" | "UZ" | "KZ" | "TJ";
  collectionSlug: string;
  collectionSlugs: string[];
  totalQty: number;

  visibleSubtotal: number;
  visibleItems: DealerOrderVisibleItem[];

  internalSubtotal: number;
  internalTotalWithItemMarkup: number;
  globalMarkupPercent: number;
  globalMarkupAmount: number;
  internalTotal: number;
  internalItems: DealerOrderInternalItem[];
};