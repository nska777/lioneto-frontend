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

export type ReservationBadge = {
  isReserved?: boolean;
  reservationId?: string;
  reservedUntil?: string;
};

export type CartEntry =
  | ({
      kind: "product";
      id: string;
      productId: string;
      collectionSlug: string;

      title: string;
      article: string;
      articleShort?: string;

      selectedVariantKey?: string;
      selectedColor?: string;

      color?: string;
      size?: string;
      material?: string;
      image?: string;

      quantity: number;
      markupPercent: number;

      unitBasePrice: number;
      unitFinalPrice: number;
      totalBasePrice: number;
      totalFinalPrice: number;
    } & ReservationBadge)
  | ({
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

      selectedVariantKey?: string;
      selectedColor?: string;

      color?: string;
      size?: string;
      material?: string;
      image?: string;

      quantity: number;
      markupPercent: number;

      unitBasePrice: number;
      unitFinalPrice: number;
      totalBasePrice: number;
      totalFinalPrice: number;
    } & ReservationBadge);

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

  selectedVariantKey?: string;
  selectedColor?: string;

  color?: string;
  size?: string;
  material?: string;
  image?: string;

  quantity: number;
  unitPrice: number;
  totalPrice: number;

  isReserved?: boolean;
  reservedUntil?: string;
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

  selectedVariantKey?: string;
  selectedColor?: string;

  color?: string;
  size?: string;
  material?: string;
  image?: string;

  quantity: number;
  markupPercent: number;

  unitBasePrice: number;
  unitFinalPrice: number;
  totalBasePrice: number;
  totalFinalPrice: number;

  isReserved?: boolean;
  reservedUntil?: string;
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

export type ReservationOrderItem = CartEntry;

export type ReservationOrder = {
  reservationNumber: string;
  createdAt: string;
  reservedUntil: string;
  items: ReservationOrderItem[];
  totalQty: number;
  subtotal: number;
};