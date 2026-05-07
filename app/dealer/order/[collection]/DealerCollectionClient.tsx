"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from "react";
import { ArrowLeft, Search, ShoppingCart, X } from "lucide-react";

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
import ReserveOrderModal from "./ReserveOrderModal";
import MyReservationsModal from "./MyReservationsModal";
import ExtendReservationModal from "./ExtendReservationModal";
import ReservationExtendedSuccessModal from "./ReservationExtendedSuccessModal";
import ReservationExtendLimitModal from "./ReservationExtendLimitModal";
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
import type {
  AddonDraft,
  CartEntry,
  DealerOrder,
  ProductDraft,
  ReservationOrder,
} from "./types";
import { cn } from "./utils";

type Props = {
  initialCollection: DealerCollection;
  initialCollections: DealerCollection[];
  initialProducts: DealerProduct[];
};

type LooseModalProps = Record<string, unknown>;

const ProductDetailsModalLoose =
  ProductDetailsModal as ComponentType<LooseModalProps>;
const OrderConfirmModalLoose =
  OrderConfirmModal as ComponentType<LooseModalProps>;
const OrderSuccessModalLoose =
  OrderSuccessModal as ComponentType<LooseModalProps>;
const ReserveOrderModalLoose =
  ReserveOrderModal as ComponentType<LooseModalProps>;
const MyReservationsModalLoose =
  MyReservationsModal as ComponentType<LooseModalProps>;
const ExtendReservationModalLoose =
  ExtendReservationModal as ComponentType<LooseModalProps>;
const ReservationExtendedSuccessModalLoose =
  ReservationExtendedSuccessModal as ComponentType<LooseModalProps>;
const ReservationExtendLimitModalLoose =
  ReservationExtendLimitModal as ComponentType<LooseModalProps>;

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
  productTitle: string;
  productArticle?: string;
  quantity: number;
  reservationStatus: "active" | "expired" | "converted" | "cancelled";
  reservedUntil: string;
  orderNumber?: string;
  snapshotPrice?: number;
  currency?: string;
  collectionTitle?: string;
  notes?: string;
};

type ReservationMap = Record<
  string,
  {
    quantity: number;
    reservedUntil?: string;
    reservationId?: string;
  }
>;

type ReservationExtendMeta = {
  reservationNumber: string;
  reservedUntil: string;
  initialHours: number;
  extendedHours: number;
  maxExtendHours: number;
};

type DealerProductVariantWithMeta = {
  variantSku?: string;
  article?: string;
  articleShort?: string;
  size?: string;
  material?: string;
};

type DealerProductWithCatalogMeta = DealerProduct & {
  moduleSlug?: string;
  moduleTitle?: string;
  categorySlug?: string;
  cat?: string;
  module?: string;
};

const MODULE_LABELS: Record<string, string> = {
  krovat: "Кровати",
  krovati: "Кровати",
  shkaf: "Шкафы",
  shkafy: "Шкафы",
  tumba: "Тумбы",
  tumby: "Тумбы",
  komod: "Комоды",
  komody: "Комоды",
  zerkalo: "Зеркала",
  zerkala: "Зеркала",
  stol: "Столы",
  stoli: "Столы",
  stellaj: "Стеллажи",
  stellaji: "Стеллажи",
  puf: "Пуфы",
  pufi: "Пуфы",
  vitrina: "Витрины",
  vitrini: "Витрины",
  polka: "Полки",
  polki: "Полки",
  fasadi: "Фасады",
  decor: "Декор",
  dekor: "Декор",
  other: "Другое",
};

const MODULE_ORDER = [
  "krovati",
  "shkafy",
  "tumby",
  "komody",
  "zerkala",
  "stoli",
  "stellaji",
  "vitrini",
  "pufi",
  "polki",
  "fasadi",
  "decor",
  "other",
];

const MODULE_ICONS: Record<string, string> = {
  krovati: "▱",
  shkafy: "▥",
  tumby: "▣",
  komody: "▤",
  zerkala: "◯",
  stoli: "━",
  stellaji: "▦",
  vitrini: "▥",
  pufi: "●",
  polki: "▭",
  fasadi: "▧",
  decor: "✦",
  other: "▧",
};

function normalizeCatalogSlug(value?: string | null) {
  const normalized = String(value ?? "")
    .trim()
    .toLowerCase()
    .replace(/ё/g, "е")
    .replace(/[\s_]+/g, "-")
    .replace(/-+/g, "-");

  if (normalized === "scandy") return "scandi";
  if (normalized === "tumbi" || normalized === "tumba") return "tumby";
  if (normalized === "shkaf") return "shkafy";
  if (normalized === "zerkalo") return "zerkala";
  if (normalized === "komod") return "komody";
  if (normalized === "stol") return "stoli";
  if (normalized === "vitrina") return "vitrini";
  if (normalized === "puf") return "pufi";
  if (normalized === "polka") return "polki";
  if (normalized === "stellaj") return "stellaji";
  if (normalized === "dekor") return "decor";

  return normalized;
}

function getProductOptions(product: DealerProduct) {
  const required = product.requiredItems ?? [];
  const recommended = product.recommendedItems ?? [];
  const legacy = product.addons ?? [];

  if (required.length || recommended.length) {
    return [...required, ...recommended];
  }

  return legacy;
}

function getProductModuleSlug(product: DealerProduct) {
  const item = product as DealerProductWithCatalogMeta;

  const direct = normalizeCatalogSlug(
    item.moduleSlug || item.categorySlug || item.module || item.cat || "",
  );

  if (direct && direct !== "other") return direct;

  const haystack =
    `${product.title} ${product.article} ${product.articleShort ?? ""}`.toLowerCase();

  if (haystack.includes("кровать") || haystack.includes("krovat")) {
    return "krovati";
  }

  if (haystack.includes("шкаф") || haystack.includes("shkaf")) {
    return "shkafy";
  }

  if (haystack.includes("тумб") || haystack.includes("tumb")) {
    return "tumby";
  }

  if (haystack.includes("комод") || haystack.includes("komod")) {
    return "komody";
  }

  if (haystack.includes("зеркал") || haystack.includes("zerkal")) {
    return "zerkala";
  }

  if (haystack.includes("стеллаж") || haystack.includes("stell")) {
    return "stellaji";
  }

  if (haystack.includes("стол") || haystack.includes("stol")) {
    return "stoli";
  }

  if (haystack.includes("пуф") || haystack.includes("puf")) {
    return "pufi";
  }

  if (haystack.includes("витрин") || haystack.includes("vitr")) {
    return "vitrini";
  }

  return "other";
}

function getProductModuleLabel(product: DealerProduct) {
  const item = product as DealerProductWithCatalogMeta;
  const moduleSlug = getProductModuleSlug(product);
  const explicitTitle = String(item.moduleTitle ?? "").trim();

  return explicitTitle || MODULE_LABELS[moduleSlug] || "Другое";
}

function getSearchableProductText(product: DealerProduct) {
  const addons = getProductOptions(product)
    .map(
      (addon) => `${addon.title} ${addon.article} ${addon.articleShort ?? ""}`,
    )
    .join(" ");

  return `${product.title} ${product.article} ${product.articleShort ?? ""} ${
    product.color ?? ""
  } ${product.size ?? ""} ${product.material ?? ""} ${addons}`.toLowerCase();
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

function getVariantMeta(
  variant:
    | {
        variantSku?: string;
        article?: string;
        articleShort?: string;
        size?: string;
        material?: string;
      }
    | null
    | undefined,
): DealerProductVariantWithMeta | null {
  return variant ? (variant as DealerProductVariantWithMeta) : null;
}

function getVariantArticle(
  variant:
    | {
        variantSku?: string;
        article?: string;
      }
    | null
    | undefined,
  fallback: string,
) {
  const meta = getVariantMeta(variant);
  return String(meta?.variantSku || meta?.article || fallback || "").trim();
}

function getVariantArticleShort(
  variant:
    | {
        variantSku?: string;
        article?: string;
        articleShort?: string;
      }
    | null
    | undefined,
  fallback: string,
) {
  const meta = getVariantMeta(variant);
  return String(
    meta?.articleShort || meta?.variantSku || meta?.article || fallback || "",
  ).trim();
}

function getVariantSize(
  variant:
    | {
        size?: string;
      }
    | null
    | undefined,
  fallback?: string,
) {
  const meta = getVariantMeta(variant);
  return String(meta?.size || fallback || "").trim() || undefined;
}

function getVariantColor(
  variant:
    | {
        color?: string;
        label?: string;
      }
    | null
    | undefined,
  fallback?: string,
) {
  return String(variant?.color || variant?.label || fallback || "").trim();
}

function getSelectedProductVariant(
  product: DealerProduct,
  draft: ProductDraft | null | undefined,
) {
  const variants = product.variants ?? [];
  const variantKey = draft?.selectedVariantKey ?? "";

  if (!variants.length) return null;

  if (!variantKey) return variants[0] ?? null;

  return (
    variants.find((variant) => variant.key === variantKey) ??
    variants[0] ??
    null
  );
}

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

function parseReservationNotes(row: ReservationRecord) {
  try {
    return row.notes ? JSON.parse(row.notes) : {};
  } catch {
    return {};
  }
}

function formatDateTime(value?: string) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("ru-RU", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function buildReservationExtendMeta(rows: ReservationRecord[]) {
  const map = new Map<string, ReservationExtendMeta>();

  rows.forEach((row) => {
    if (!row.orderNumber) return;

    const notes = parseReservationNotes(row);

    const initialHours = Math.max(1, Number(notes.initialHours ?? 24));
    const extendedHours = Math.max(0, Number(notes.extendedHours ?? 0));
    const maxExtendHours = Math.max(
      initialHours,
      Number(notes.maxExtendHours ?? initialHours),
    );

    const current = map.get(row.orderNumber);

    if (!current) {
      map.set(row.orderNumber, {
        reservationNumber: row.orderNumber,
        reservedUntil: row.reservedUntil,
        initialHours,
        extendedHours,
        maxExtendHours,
      });
      return;
    }

    const currentTime = new Date(current.reservedUntil).getTime();
    const rowTime = new Date(row.reservedUntil).getTime();

    map.set(row.orderNumber, {
      reservationNumber: row.orderNumber,
      reservedUntil:
        Number.isFinite(rowTime) && rowTime > currentTime
          ? row.reservedUntil
          : current.reservedUntil,
      initialHours: Math.max(current.initialHours, initialHours),
      extendedHours: Math.max(current.extendedHours, extendedHours),
      maxExtendHours: Math.max(current.maxExtendHours, maxExtendHours),
    });
  });

  return map;
}

function groupReservationOrders(rows: ReservationRecord[]): ReservationOrder[] {
  const grouped = new Map<string, ReservationOrder>();

  rows
    .filter((row) => row.reservationStatus === "active")
    .forEach((row) => {
      const reservationNumber =
        row.orderNumber || row.documentId || row.id || "reservation";

      const current = grouped.get(reservationNumber);

      const item = {
        kind: "product" as const,
        id: row.documentId || row.id,
        productId: row.productId,
        collectionSlug: "",
        title: row.productTitle,
        article: row.productArticle || "",
        quantity: Math.max(1, Number(row.quantity ?? 1)),
        markupPercent: 0,
        unitBasePrice: Math.max(0, Number(row.snapshotPrice ?? 0)),
        unitFinalPrice: Math.max(0, Number(row.snapshotPrice ?? 0)),
        totalBasePrice:
          Math.max(1, Number(row.quantity ?? 1)) *
          Math.max(0, Number(row.snapshotPrice ?? 0)),
        totalFinalPrice:
          Math.max(1, Number(row.quantity ?? 1)) *
          Math.max(0, Number(row.snapshotPrice ?? 0)),
        isReserved: true,
        reservationId: row.documentId || row.id,
        reservedUntil: row.reservedUntil,
      };

      if (!current) {
        grouped.set(reservationNumber, {
          reservationNumber,
          createdAt: new Date().toISOString(),
          reservedUntil: row.reservedUntil,
          items: [item],
          totalQty: item.quantity,
          subtotal: item.totalFinalPrice,
        });

        return;
      }

      current.items.push(item);
      current.totalQty += item.quantity;
      current.subtotal += item.totalFinalPrice;

      const currentUntil = new Date(current.reservedUntil).getTime();
      const rowUntil = new Date(row.reservedUntil).getTime();

      if (Number.isFinite(rowUntil) && rowUntil > currentUntil) {
        current.reservedUntil = row.reservedUntil;
      }
    });

  return Array.from(grouped.values()).sort((a, b) => {
    return (
      new Date(a.reservedUntil).getTime() - new Date(b.reservedUntil).getTime()
    );
  });
}

export default function DealerCollectionClient({
  initialCollection,
  initialCollections,
  initialProducts,
}: Props) {
  const safeCollection = initialCollection;
  const cartSidebarRef = useRef<HTMLDivElement | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const [country, setCountry] = useState<DealerCountryCode>("UZ");
  const [productQuery, setProductQuery] = useState("");
  const [activeModuleSlug, setActiveModuleSlug] = useState("all");
  const [isCartDrawerOpen, setIsCartDrawerOpen] = useState(false);
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
  const [draftOrderNumber, setDraftOrderNumber] = useState("");

  const [reservationsMap, setReservationsMap] = useState<ReservationMap>({});
  const [reservationOrders, setReservationOrders] = useState<
    ReservationOrder[]
  >([]);
  const [reservationExtendMeta, setReservationExtendMeta] = useState<
    Map<string, ReservationExtendMeta>
  >(new Map());

  const [reservationModalOpen, setReservationModalOpen] = useState(false);
  const [reservationsModalOpen, setReservationsModalOpen] = useState(false);
  const [isLoadingReservations, setIsLoadingReservations] = useState(false);
  const [isSubmittingReservation, setIsSubmittingReservation] = useState(false);
  const [confirmingReservationNumber, setConfirmingReservationNumber] =
    useState<string>("");

  const [extendModalOpen, setExtendModalOpen] = useState(false);
  const [extendLimitModalOpen, setExtendLimitModalOpen] = useState(false);
  const [extendSuccessModalOpen, setExtendSuccessModalOpen] = useState(false);
  const [extendReservationNumber, setExtendReservationNumber] = useState("");
  const [extendHours, setExtendHours] = useState(1);
  const [extendRemainingHours, setExtendRemainingHours] = useState(0);
  const [extendMaxHours, setExtendMaxHours] = useState(0);
  const [extendUntilText, setExtendUntilText] = useState("");
  const [extendedSuccessHours, setExtendedSuccessHours] = useState(0);
  const [isSubmittingExtend, setIsSubmittingExtend] = useState(false);

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
    try {
      window.localStorage.setItem(
        "dealer-current-order-collection",
        safeCollection.slug,
      );
    } catch {
      // ignore
    }
  }, [safeCollection.slug]);

  useEffect(() => {
    if (searchParams.get("reservations") !== "1") return;

    setReservationsModalOpen(true);
    router.replace(pathname, { scroll: false });
  }, [pathname, router, searchParams]);

  async function syncReservations() {
    try {
      setIsLoadingReservations(true);

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

      const rows = Array.isArray(data.reservations) ? data.reservations : [];

      setReservationsMap(buildReservationMap(rows));
      setReservationOrders(groupReservationOrders(rows));
      setReservationExtendMeta(buildReservationExtendMeta(rows));
    } catch {
      // ignore
    } finally {
      setIsLoadingReservations(false);
    }
  }

  useEffect(() => {
    syncReservations();
  }, []);

  useEffect(() => {
    async function loadDealerMe() {
      try {
        const res = await fetch("/api/dealer/me", {
          cache: "no-store",
          credentials: "include",
        });

        if (!res.ok) return;

        const data = (await res.json()) as DealerMeResponse;
        const dealer = data.dealer ?? null;

        setDealerMe(dealer);
        setCountry(
          normalizeDealerCountryCode(dealer?.countryCode, dealer?.region),
        );
      } catch {
        // ignore
      }
    }

    loadDealerMe();
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

  const allProducts = useMemo(() => initialProducts, [initialProducts]);

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

  const currentCollectionAllProducts = useMemo(() => {
    const activeSlug = normalizeCatalogSlug(safeCollection.slug);

    return allProductsWithStock.filter((product) => {
      return normalizeCatalogSlug(product.collectionSlug) === activeSlug;
    });
  }, [allProductsWithStock, safeCollection.slug]);

  const moduleTabs = useMemo(() => {
    const map = new Map<
      string,
      { slug: string; label: string; count: number }
    >();

    currentCollectionAllProducts.forEach((product) => {
      const slug = getProductModuleSlug(product);
      const label = getProductModuleLabel(product);
      const current = map.get(slug);

      map.set(slug, {
        slug,
        label,
        count: (current?.count ?? 0) + 1,
      });
    });

    return Array.from(map.values()).sort((a, b) => {
      const orderA = MODULE_ORDER.indexOf(a.slug);
      const orderB = MODULE_ORDER.indexOf(b.slug);

      if (orderA !== -1 || orderB !== -1) {
        return (orderA === -1 ? 999 : orderA) - (orderB === -1 ? 999 : orderB);
      }

      return a.label.localeCompare(b.label, "ru");
    });
  }, [currentCollectionAllProducts]);

  useEffect(() => {
    if (activeModuleSlug === "all") return;

    const exists = moduleTabs.some((tab) => tab.slug === activeModuleSlug);
    if (!exists) setActiveModuleSlug("all");
  }, [activeModuleSlug, moduleTabs]);

  const currentCollectionProducts = useMemo(() => {
    const query = productQuery.trim().toLowerCase();

    return currentCollectionAllProducts.filter((product) => {
      if (activeModuleSlug !== "all") {
        if (getProductModuleSlug(product) !== activeModuleSlug) return false;
      }

      if (query) {
        if (!getSearchableProductText(product).includes(query)) return false;
      }

      return true;
    });
  }, [activeModuleSlug, currentCollectionAllProducts, productQuery]);

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
    parentProductId: string,
    addonId: string,
    updater: (prev: AddonDraft) => AddonDraft,
  ) {
    const draftKey = getAddonDraftKey(parentProductId, addonId);

    setAddonDrafts((prev) => {
      const current = prev[draftKey] ?? getDefaultAddonDraft();

      return {
        ...prev,
        [draftKey]: updater(current),
      };
    });
  }

  function handleSelectProductVariant(
    productId: string,
    variantKey: string,
    color: string,
  ) {
    updateDraft(productId, (prev) => ({
      ...prev,
      selectedVariantKey: variantKey,
      selectedColor: color,
    }));
  }

  function handleSelectedProductSelectAddonVariant(
    addonId: string,
    variantKey: string,
    color: string,
  ) {
    if (!selectedProduct) return;

    updateAddonDraft(selectedProduct.id, addonId, (prev) => ({
      ...prev,
      selectedVariantKey: variantKey,
      selectedColor: color,
    }));
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
      quantity: Math.max(1, prev.quantity - 1),
    }));
  }

  function handleSelectedProductIncreaseAddonQty(addonId: string) {
    if (!selectedProduct) return;

    updateAddonDraft(selectedProduct.id, addonId, (prev) => ({
      ...prev,
      quantity: prev.quantity + 1,
      isInCart: true,
    }));
  }

  function handleSelectedProductDecreaseAddonQty(addonId: string) {
    if (!selectedProduct) return;

    updateAddonDraft(selectedProduct.id, addonId, (prev) => ({
      ...prev,
      quantity: Math.max(1, prev.quantity - 1),
    }));
  }

  function handleSelectedProductToggleAddon(addonId: string, checked: boolean) {
    if (!selectedProduct) return;

    updateAddonDraft(selectedProduct.id, addonId, (prev) => ({
      ...prev,
      isInCart: checked,
      quantity: Math.max(1, prev.quantity),
    }));
  }

  function handleSelectedProductToggleAddonCart(addonId: string) {
    if (!selectedProduct) return;

    const draftKey = getAddonDraftKey(selectedProduct.id, addonId);
    const currentDraft = addonDrafts[draftKey] ?? getDefaultAddonDraft();

    handleSelectedProductToggleAddon(addonId, !currentDraft.isInCart);
  }

  function handleToggleCart(productId: string) {
    setCartProductIds((prev) => {
      if (prev.includes(productId)) {
        return prev.filter((item) => item !== productId);
      }

      return [...prev, productId];
    });
  }

  function handleOpenProductModal(product: DealerProduct) {
    setSelectedProduct(product);
  }

  function handleOpenImagePreview(product: DealerProduct) {
    if (!product.image) return;

    setPreviewImage({
      src: product.image,
      title: product.title,
    });
  }

  function handleOpenRelatedProduct(productId: string) {
    const product = allProductsById.get(productId);
    if (!product) return;

    setSelectedProduct(product);
  }

  function handleClearCart() {
    setCartProductIds([]);
    setAddonDrafts((prev) => {
      const next = { ...prev };

      Object.keys(next).forEach((key) => {
        if (key.includes("::")) {
          next[key] = {
            ...next[key],
            isInCart: false,
          };
        }
      });

      return next;
    });
  }

  function handleRemoveItem(itemId: string) {
    if (itemId.startsWith("addon:")) {
      const parts = itemId.split(":");
      const parentProductId = parts[1] ?? "";
      const addonId = parts.slice(2).join(":");
      const draftKey = getAddonDraftKey(parentProductId, addonId);

      setAddonDrafts((prev) => ({
        ...prev,
        [draftKey]: {
          ...(prev[draftKey] ?? getDefaultAddonDraft()),
          isInCart: false,
        },
      }));

      return;
    }

    setCartProductIds((prev) => prev.filter((id) => id !== itemId));
  }

  const cartItems = useMemo<CartEntry[]>(() => {
    const productItems: CartEntry[] = cartProductIds
      .map((productId) => {
        const product = allProductsById.get(productId);
        if (!product) return null;

        const draft = getDraft(product.id);
        const selectedVariant = getSelectedProductVariant(product, draft);
        const variantPrice = selectedVariant?.price?.[country];
        const unitBasePrice =
          typeof variantPrice === "number" && variantPrice > 0
            ? variantPrice
            : (product.price[country] ?? 0);

        const quantity = Math.max(1, Number(draft.quantity ?? 1));
        const markupPercent = Math.max(0, Number(draft.markupPercent ?? 0));
        const unitFinalPrice = Math.round(
          unitBasePrice * (1 + markupPercent / 100),
        );

        return {
          kind: "product" as const,
          id: product.id,
          productId: product.id,
          collectionSlug: product.collectionSlug,
          title: product.title,
          article:
            getVariantArticle(selectedVariant, product.article) ||
            product.article,
          articleShort:
            getVariantArticleShort(
              selectedVariant,
              product.articleShort || "",
            ) || product.articleShort,
          color:
            draft.selectedColor ||
            getVariantColor(selectedVariant, getProductColor(product)),
          size: getVariantSize(selectedVariant, product.size),
          quantity,
          markupPercent,
          unitBasePrice,
          unitFinalPrice,
          totalBasePrice: unitBasePrice * quantity,
          totalFinalPrice: unitFinalPrice * quantity,
          isReserved: Boolean(reservationsMap[product.id]),
          reservationId: reservationsMap[product.id]?.reservationId,
          reservedUntil: reservationsMap[product.id]?.reservedUntil,
        };
      })
      .filter(Boolean) as CartEntry[];

    const addonItems: CartEntry[] = Object.entries(addonDrafts)
      .filter(([, draft]) => draft.isInCart)
      .map(([draftKey, draft]) => {
        const record = allAddonsIndex.get(draftKey);
        if (!record) return null;

        const { parentProduct, addon } = record;

        const selectedVariant =
          addon.variants?.find(
            (variant) => variant.key === draft.selectedVariantKey,
          ) ?? null;

        const variantPrice = selectedVariant?.price?.[country];
        const unitBasePrice =
          typeof variantPrice === "number" && variantPrice > 0
            ? variantPrice
            : (addon.price[country] ?? 0);

        const quantity = Math.max(1, Number(draft.quantity ?? 1));
        const markupPercent = Math.max(0, Number(draft.markupPercent ?? 0));
        const unitFinalPrice = Math.round(
          unitBasePrice * (1 + markupPercent / 100),
        );

        return {
          kind: "addon" as const,
          id: getAddonCartId(parentProduct.id, addon.id),
          parentProductId: parentProduct.id,
          addonId: addon.id,
          addonKind: addon.kind,
          addonSelectionType: addon.selectionType,
          parentProductTitle: parentProduct.title,
          collectionSlug: parentProduct.collectionSlug,
          title: addon.title,
          article:
            getVariantArticle(selectedVariant, addon.article) || addon.article,
          articleShort:
            getVariantArticleShort(selectedVariant, addon.articleShort || "") ||
            addon.articleShort,
          color:
            draft.selectedColor ||
            getVariantColor(
              selectedVariant,
              addon.color || parentProduct.color,
            ),
          size: getVariantSize(selectedVariant, addon.size),
          quantity,
          markupPercent,
          unitBasePrice,
          unitFinalPrice,
          totalBasePrice: unitBasePrice * quantity,
          totalFinalPrice: unitFinalPrice * quantity,
          isReserved: false,
        };
      })
      .filter(Boolean) as CartEntry[];

    return [...productItems, ...addonItems];
  }, [
    addonDrafts,
    allAddonsIndex,
    allProductsById,
    cartProductIds,
    country,
    drafts,
    reservationsMap,
  ]);

  const selectedDraft = selectedProduct ? getDraft(selectedProduct.id) : null;

  const selectedProductAddonDrafts = useMemo(() => {
    if (!selectedProduct) return {};

    const result: Record<string, AddonDraft> = {};

    getProductOptions(selectedProduct).forEach((addon) => {
      const draftKey = getAddonDraftKey(selectedProduct.id, addon.id);
      result[addon.id] = addonDrafts[draftKey] ?? getDefaultAddonDraft();
    });

    return result;
  }, [addonDrafts, selectedProduct]);

  const summary = useMemo(() => {
    const totalQty = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const subtotal = cartItems.reduce(
      (acc, item) => acc + item.totalFinalPrice,
      0,
    );

    return {
      totalQty,
      subtotal,
    };
  }, [cartItems]);

  function buildOrder(): DealerOrder | null {
    if (!cartItems.length) return null;

    const collectionSlugs = Array.from(
      new Set(cartItems.map((item) => item.collectionSlug)),
    );

    const totalQty = cartItems.reduce((acc, item) => acc + item.quantity, 0);
    const visibleItems = buildVisibleItems(cartItems);
    const internalItems = buildInternalItems(cartItems);

    const visibleSubtotal = visibleItems.reduce(
      (acc, item) => acc + item.totalPrice,
      0,
    );

    const internalSubtotal = internalItems.reduce(
      (acc, item) => acc + item.totalBasePrice,
      0,
    );

    const internalTotalWithItemMarkup = internalItems.reduce(
      (acc, item) => acc + item.totalFinalPrice,
      0,
    );

    const globalMarkupPercent = 0;
    const globalMarkupAmount = 0;
    const internalTotal = internalTotalWithItemMarkup + globalMarkupAmount;

    const orderNumber =
      draftOrderNumber || generateOrderNumber(dealerMe?.login ?? null);

    if (!draftOrderNumber) {
      setDraftOrderNumber(orderNumber);
    }

    return {
      id: generateOrderId(),
      orderNumber,
      createdAt: new Date().toISOString(),
      country,
      collectionSlug: safeCollection.slug,
      collectionSlugs,
      totalQty,
      visibleSubtotal,
      visibleItems,
      internalSubtotal,
      internalTotalWithItemMarkup,
      globalMarkupPercent,
      globalMarkupAmount,
      internalTotal,
      internalItems,
    };
  }

  function handleCheckout() {
    const order = buildOrder();
    if (!order) return;

    setConfirmOrder(order);
  }

  async function handleConfirmOrder() {
    if (!confirmOrder) return;

    try {
      const res = await fetch("/api/dealer/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(confirmOrder),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Не удалось оформить заказ");
      }

      setSuccessOrder(confirmOrder);
      setConfirmOrder(null);
      setCartProductIds([]);
      setAddonDrafts({});
      resetDraftOrderNumber(dealerMe?.login ?? null);
      setDraftOrderNumber("");
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Не удалось оформить заказ",
      );
    }
  }

  function handlePrintBase() {
    if (!cartItems.length) return;

    const order = buildOrder();
    if (!order) return;

    openCartPrintWindow(
      cartItems,
      country,
      order.orderNumber,
      safeCollection.title,
      order.totalQty,
      order.visibleSubtotal,
      order.internalTotalWithItemMarkup,
      order.globalMarkupPercent,
      order.globalMarkupAmount,
      order.internalTotal,
      false,
    );
  }

  async function handleReserveOrderConfirm(hours: number) {
    if (!cartItems.length) return;

    try {
      setIsSubmittingReservation(true);

      const res = await fetch("/api/dealer/reservations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          hours,
          items: cartItems,
          collectionSlug: safeCollection.slug,
          country,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        throw new Error(data?.error || "Не удалось забронировать заказ");
      }

      setConfirmingReservationNumber(
        data?.reservationNumber || data?.orderNumber || "",
      );
      setReservationModalOpen(false);
      setCartProductIds([]);
      setAddonDrafts({});
      await syncReservations();
      setReservationsModalOpen(true);
    } catch (error) {
      alert(
        error instanceof Error
          ? error.message
          : "Не удалось забронировать заказ",
      );
    } finally {
      setIsSubmittingReservation(false);
    }
  }

  function handleOpenExtendReservation(reservationNumber: string) {
    const meta = reservationExtendMeta.get(reservationNumber);

    const maxExtendHours = Math.max(0, meta?.maxExtendHours ?? 24);
    const alreadyExtended = Math.max(0, meta?.extendedHours ?? 0);
    const remaining = Math.max(0, maxExtendHours - alreadyExtended);

    setExtendReservationNumber(reservationNumber);
    setExtendMaxHours(maxExtendHours);
    setExtendRemainingHours(remaining);
    setExtendHours(Math.max(1, Math.min(remaining || 1, 1)));
    setExtendUntilText(formatDateTime(meta?.reservedUntil));

    if (remaining <= 0) {
      setExtendLimitModalOpen(true);
      return;
    }

    setExtendModalOpen(true);
  }

  async function handleConfirmExtendReservation() {
    if (!extendReservationNumber) return;

    try {
      setIsSubmittingExtend(true);

      const res = await fetch("/api/dealer/reservations", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          orderNumber: extendReservationNumber,
          hours: extendHours,
          action: "extend",
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        const errorText = String(data?.error || "");

        if (
          errorText.toLowerCase().includes("limit") ||
          errorText.toLowerCase().includes("лимит")
        ) {
          setExtendModalOpen(false);
          setExtendLimitModalOpen(true);
          return;
        }

        throw new Error(data?.error || "Не удалось продлить бронь");
      }

      const newReservedUntil =
        data?.reservedUntil ||
        data?.reservation?.reservedUntil ||
        data?.data?.reservedUntil ||
        "";

      setExtendUntilText(formatDateTime(newReservedUntil));
      setExtendedSuccessHours(extendHours);

      setExtendModalOpen(false);
      await syncReservations();
      setExtendSuccessModalOpen(true);
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Не удалось продлить бронь",
      );
    } finally {
      setIsSubmittingExtend(false);
    }
  }

  return (
    <>
      <div className="mx-auto flex w-full max-w-[1680px] flex-col gap-3 px-0 2xl:max-w-[1760px]">
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

        <div className="grid grid-cols-1 gap-3">
          <div className="min-w-0">
            <div className="mb-3 rounded-[20px] border border-black/10 bg-white p-3 shadow-[0_10px_24px_-22px_rgba(0,0,0,0.18)] sm:rounded-[24px] sm:p-4">
              <div className="flex flex-col gap-3 xl:flex-row xl:items-center xl:justify-between">
                <div className="min-w-0">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-black/35">
                    Модули коллекции
                  </p>
                  <p className="mt-1 text-[13px] text-black/50">
                    {currentCollectionProducts.length} из{" "}
                    {currentCollectionAllProducts.length} товаров
                  </p>
                </div>

                <label className="relative block w-full xl:max-w-[360px]">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-black/35" />
                  <input
                    value={productQuery}
                    onChange={(event) => setProductQuery(event.target.value)}
                    placeholder="Поиск по названию или артикулу"
                    className="h-11 w-full rounded-full border border-black/10 bg-[#fafaf8] pl-10 pr-4 text-[13px] font-medium text-black outline-none transition placeholder:text-black/35 focus:border-black/25 focus:bg-white"
                  />
                </label>
              </div>

              <div className="relative mt-3">
                <div className="pointer-events-none absolute left-0 top-0 z-10 h-[calc(100%-8px)] w-6 bg-gradient-to-r from-white to-transparent" />
                <div className="pointer-events-none absolute right-0 top-0 z-10 h-[calc(100%-8px)] w-8 bg-gradient-to-l from-white to-transparent" />

                <div className="dealer-module-scroll flex max-w-full cursor-grab gap-2 overflow-x-auto pb-2 pr-8 active:cursor-grabbing">
                  <button
                    type="button"
                    onClick={() => setActiveModuleSlug("all")}
                    className={cn(
                      "inline-flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-full border px-3.5 text-[12px] font-semibold transition",
                      activeModuleSlug === "all"
                        ? "border-black bg-black text-white"
                        : "border-black/10 bg-white text-black/60 hover:border-black/20 hover:bg-black/[0.03] hover:text-black",
                    )}
                  >
                    <span className="text-[14px] leading-none">▦</span>
                    Все
                    <span className="rounded-full bg-current/10 px-1.5 py-0.5 text-[10px]">
                      {currentCollectionAllProducts.length}
                    </span>
                  </button>

                  {moduleTabs.map((tab) => (
                    <button
                      key={tab.slug}
                      type="button"
                      onClick={() => setActiveModuleSlug(tab.slug)}
                      className={cn(
                        "inline-flex h-9 shrink-0 cursor-pointer items-center gap-2 rounded-full border px-3.5 text-[12px] font-semibold transition",
                        activeModuleSlug === tab.slug
                          ? "border-black bg-black text-white"
                          : "border-black/10 bg-white text-black/60 hover:border-black/20 hover:bg-black/[0.03] hover:text-black",
                      )}
                    >
                      <span className="text-[14px] leading-none">
                        {MODULE_ICONS[tab.slug] ?? "▧"}
                      </span>
                      {tab.label}
                      <span className="rounded-full bg-current/10 px-1.5 py-0.5 text-[10px]">
                        {tab.count}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {currentCollectionProducts.length > 0 ? (
              <div className="grid min-w-0 grid-cols-1 gap-3 lg:grid-cols-2">
                {currentCollectionProducts.map((product) => {
                  const draft = getDraft(product.id);

                  return (
                    <ProductRow
                      key={product.id}
                      product={product}
                      country={country}
                      draft={draft}
                      isInCart={cartProductIds.includes(product.id)}
                      myReservedQty={reservationsMap[product.id]?.quantity ?? 0}
                      onIncreaseQty={handleIncreaseQty}
                      onDecreaseQty={handleDecreaseQty}
                      onOpenModal={handleOpenProductModal}
                      onOpenImagePreview={handleOpenImagePreview}
                      onToggleCart={handleToggleCart}
                    />
                  );
                })}
              </div>
            ) : (
              <div className="rounded-[20px] border border-dashed border-black/15 bg-white p-6 text-[13px] text-black/45">
                По выбранным фильтрам товары не найдены.
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={() => setIsCartDrawerOpen(true)}
        className={cn(
          "fixed bottom-5 right-[128px] z-[70] inline-flex h-14 cursor-pointer items-center gap-3 rounded-full px-5 text-[14px] font-semibold shadow-[0_18px_44px_-20px_rgba(0,0,0,0.55)] transition hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98] max-sm:bottom-5 max-sm:right-[96px]",
          summary.totalQty > 0
            ? "bg-black text-white hover:bg-black/90"
            : "bg-white text-black ring-1 ring-black/10 hover:bg-black/[0.03]",
        )}
      >
        <span className="relative inline-flex h-9 w-9 items-center justify-center rounded-full bg-white/12">
          <ShoppingCart className="h-5 w-5" />

          {summary.totalQty > 0 ? (
            <span className="absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
              {summary.totalQty}
            </span>
          ) : null}
        </span>

        <span className="hidden sm:inline">Корзина</span>
      </button>

      {isCartDrawerOpen ? (
        <button
          type="button"
          aria-label="Закрыть корзину"
          onClick={() => setIsCartDrawerOpen(false)}
          className="fixed inset-0 z-[80] cursor-default bg-black/25 backdrop-blur-[2px]"
        />
      ) : null}

      <aside
        ref={cartSidebarRef}
        className={cn(
          "fixed right-0 top-0 z-[90] flex h-dvh w-full max-w-[460px] flex-col bg-[#f7f6f2] shadow-[-28px_0_70px_-44px_rgba(0,0,0,0.65)] transition-transform duration-300",
          isCartDrawerOpen ? "translate-x-0" : "translate-x-full",
        )}
      >
        <div className="flex shrink-0 items-center justify-between border-b border-black/10 bg-white px-4 py-3">
          <div>
            <div className="text-[15px] font-semibold text-black">Корзина</div>
            <div className="mt-0.5 text-[12px] text-black/45">
              {cartItems.length} поз. / {summary.totalQty} ед.
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsCartDrawerOpen(false)}
            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-black/10 bg-white text-black transition hover:bg-black hover:text-white"
            aria-label="Закрыть корзину"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-3">
          <OrderSidebar
            cartItems={cartItems}
            totalQty={summary.totalQty}
            subtotal={summary.subtotal}
            country={country}
            onClearCart={handleClearCart}
            onRemoveItem={handleRemoveItem}
            onCheckout={handleCheckout}
            onPrintBase={handlePrintBase}
            onReserveOrder={() => setReservationModalOpen(true)}
          />
        </div>
      </aside>

      <ImagePreviewModal
        image={previewImage}
        onClose={() => setPreviewImage(null)}
      />

      <ProductDetailsModalLoose
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
        onContinueShopping={() => {
          setSelectedProduct(null);
        }}
      />

      <OrderConfirmModalLoose
        order={confirmOrder}
        onClose={() => setConfirmOrder(null)}
        onConfirm={handleConfirmOrder}
      />

      <OrderSuccessModalLoose
        order={successOrder}
        onClose={() => setSuccessOrder(null)}
      />

      <ReserveOrderModalLoose
        open={reservationModalOpen}
        cartItems={cartItems}
        totalQty={summary.totalQty}
        subtotal={summary.subtotal}
        country={country}
        isSubmitting={isSubmittingReservation}
        onClose={() => {
          if (isSubmittingReservation) return;
          setReservationModalOpen(false);
        }}
        onConfirm={handleReserveOrderConfirm}
      />

      <MyReservationsModalLoose
        open={reservationsModalOpen}
        orders={reservationOrders}
        reservations={reservationOrders}
        country={country}
        loading={isLoadingReservations}
        isLoading={isLoadingReservations}
        confirmingReservationNumber={confirmingReservationNumber}
        onClose={() => {
          setReservationsModalOpen(false);
          setConfirmingReservationNumber("");
        }}
        onRefresh={syncReservations}
        onExtendReservation={handleOpenExtendReservation}
        onExtend={handleOpenExtendReservation}
      />

      <ExtendReservationModalLoose
        open={extendModalOpen}
        reservationNumber={extendReservationNumber}
        untilText={extendUntilText}
        hours={extendHours}
        maxHours={extendMaxHours}
        remainingHours={extendRemainingHours}
        isSubmitting={isSubmittingExtend}
        onChangeHours={(value: number) =>
          setExtendHours(
            Math.max(1, Math.min(extendRemainingHours, Number(value || 1))),
          )
        }
        onClose={() => {
          if (isSubmittingExtend) return;
          setExtendModalOpen(false);
        }}
        onConfirm={handleConfirmExtendReservation}
      />

      <ReservationExtendedSuccessModalLoose
        open={extendSuccessModalOpen}
        hours={extendedSuccessHours}
        untilText={extendUntilText}
        onClose={() => setExtendSuccessModalOpen(false)}
      />

      <ReservationExtendLimitModalLoose
        open={extendLimitModalOpen}
        onClose={() => setExtendLimitModalOpen(false)}
      />
    </>
  );
}
