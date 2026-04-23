const STRAPI_URL =
  process.env.STRAPI_URL ||
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  "http://localhost:1337";

const STRAPI_TOKEN =
  process.env.STRAPI_DEALER_TOKEN ||
  process.env.STRAPI_API_TOKEN ||
  "";

export type DealerReservationStatus =
  | "active"
  | "expired"
  | "converted"
  | "cancelled";

export type DealerReservation = {
  id: string;
  documentId?: string;
  dealerDocumentId: string;
  dealerLogin?: string;
  productId: string;
  productTitle: string;
  productArticle?: string;
  collectionTitle?: string;
  quantity: number;
  reservationStatus: DealerReservationStatus;
  reservedUntil: string;
  snapshotPrice?: number;
  currency?: string;
  orderNumber?: string;
  notes?: string;
};

type StrapiRelationValue<T> =
  | T
  | { data?: T | null }
  | null
  | undefined;

type StrapiDealer = {
  id?: number;
  documentId?: string;
  login?: string;
};

type StrapiProduct = {
  id?: number;
  documentId?: string;
  title?: string;
  article?: string;
  stockQty?: number;
  reservedQty?: number;
  isStockTracked?: boolean;
};

type StrapiReservation = {
  id?: number;
  documentId?: string;
  quantity?: number;
  reservationStatus?: DealerReservationStatus;
  reservedUntil?: string;
  productTitle?: string;
  productArticle?: string;
  collectionTitle?: string;
  snapshotPrice?: number;
  currency?: string;
  orderNumber?: string;
  notes?: string;
  dealer?: StrapiRelationValue<StrapiDealer>;
  product?: StrapiRelationValue<StrapiProduct>;
};

function getAuthHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (STRAPI_TOKEN) {
    headers.Authorization = `Bearer ${STRAPI_TOKEN}`;
  }

  return headers;
}

function unwrapRelation<T>(
  value?: T | { data?: T | null } | null,
): T | null {
  if (!value) return null;

  if (typeof value === "object" && value !== null && "data" in value) {
    return value.data ?? null;
  }

  return value as T;
}

async function strapiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${STRAPI_URL}${path}`, {
    ...init,
    headers: {
      ...getAuthHeaders(),
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Strapi request failed (${res.status}) ${path}\n${text}`);
  }

  return res.json();
}

function normalizeReservation(raw: StrapiReservation): DealerReservation {
  const dealer = unwrapRelation(raw.dealer);
  const product = unwrapRelation(raw.product);

  return {
    id: String(raw.documentId ?? raw.id ?? ""),
    documentId: raw.documentId ? String(raw.documentId) : undefined,
    dealerDocumentId: String(dealer?.documentId ?? dealer?.id ?? ""),
    dealerLogin: dealer?.login ?? "",
    productId: String(product?.documentId ?? product?.id ?? ""),
    productTitle: raw.productTitle ?? product?.title ?? "",
    productArticle: raw.productArticle ?? product?.article ?? "",
    collectionTitle: raw.collectionTitle ?? "",
    quantity: Math.max(1, Number(raw.quantity ?? 1)),
    reservationStatus: raw.reservationStatus ?? "active",
    reservedUntil: raw.reservedUntil ?? "",
    snapshotPrice: Number(raw.snapshotPrice ?? 0),
    currency: raw.currency ?? "",
    orderNumber: raw.orderNumber ?? "",
    notes: raw.notes ?? "",
  };
}

export function getReservationExpiresAt(hours = 24) {
  const date = new Date();
  date.setHours(date.getHours() + hours);
  return date.toISOString();
}

export function isReservationExpired(reservedUntil?: string | null) {
  if (!reservedUntil) return true;
  return new Date(reservedUntil).getTime() <= Date.now();
}

export async function getDealerProductsByIds(productIds: string[]) {
  const uniqueIds = Array.from(new Set(productIds.filter(Boolean)));
  if (!uniqueIds.length) return new Map<string, StrapiProduct>();

  const params = new URLSearchParams();
  params.set("pagination[pageSize]", "500");

  uniqueIds.forEach((id, index) => {
    params.set(`filters[$or][${index}][documentId][$eq]`, id);
  });

  const json = await strapiFetch<{ data?: StrapiProduct[] }>(
    `/api/dealer-products?${params.toString()}`,
  );

  const rows = Array.isArray(json?.data) ? json.data : [];
  return new Map(
    rows.map((item) => [String(item.documentId ?? item.id ?? ""), item]),
  );
}

export async function getActiveReservationsByProductIds(
  productIds: string[],
): Promise<Map<string, DealerReservation[]>> {
  const result = new Map<string, DealerReservation[]>();

  if (!productIds.length) return result;

  const params = new URLSearchParams();
  params.set("pagination[pageSize]", "500");
  params.set("populate[0]", "dealer");
  params.set("populate[1]", "product");
  params.set("filters[reservationStatus][$eq]", "active");

  productIds.forEach((productId, index) => {
    params.set(`filters[$or][${index}][product][documentId][$eq]`, productId);
  });

  const json = await strapiFetch<{ data?: StrapiReservation[] }>(
    `/api/dealer-reservations?${params.toString()}`,
  );

  const rows = Array.isArray(json?.data) ? json.data : [];

  rows.map(normalizeReservation).forEach((reservation) => {
    const list = result.get(reservation.productId) ?? [];
    list.push(reservation);
    result.set(reservation.productId, list);
  });

  return result;
}

export async function getMyActiveReservations(
  dealerDocumentId: string,
): Promise<DealerReservation[]> {
  const params = new URLSearchParams();
  params.set("pagination[pageSize]", "500");
  params.set("populate[0]", "dealer");
  params.set("populate[1]", "product");
  params.set("filters[reservationStatus][$eq]", "active");
  params.set("filters[dealer][documentId][$eq]", dealerDocumentId);

  const json = await strapiFetch<{ data?: StrapiReservation[] }>(
    `/api/dealer-reservations?${params.toString()}`,
  );

  return (Array.isArray(json?.data) ? json.data : []).map(normalizeReservation);
}

export async function expireReservationsByIds(documentIds: string[]) {
  await Promise.all(
    documentIds
      .filter(Boolean)
      .map((documentId) =>
        strapiFetch(`/api/dealer-reservations/${documentId}`, {
          method: "PUT",
          body: JSON.stringify({
            data: {
              reservationStatus: "expired",
            },
          }),
        }),
      ),
  );
}

export async function releaseExpiredReservations() {
  const params = new URLSearchParams();
  params.set("pagination[pageSize]", "500");
  params.set("populate[0]", "dealer");
  params.set("populate[1]", "product");
  params.set("filters[reservationStatus][$eq]", "active");

  const json = await strapiFetch<{ data?: StrapiReservation[] }>(
    `/api/dealer-reservations?${params.toString()}`,
  );

  const rows = Array.isArray(json?.data) ? json.data : [];
  const expired = rows
    .map(normalizeReservation)
    .filter((item) => isReservationExpired(item.reservedUntil));

  if (!expired.length) {
    return { expiredCount: 0, expiredIds: [] as string[] };
  }

  await expireReservationsByIds(
    expired.map((item) => item.documentId || item.id).filter(Boolean),
  );

  return {
    expiredCount: expired.length,
    expiredIds: expired.map((item) => item.id),
  };
}

export async function createDealerReservation(input: {
  dealerDocumentId: string;
  productId: string;
  productTitle: string;
  productArticle?: string;
  collectionTitle?: string;
  quantity: number;
  snapshotPrice?: number;
  currency?: string;
  notes?: string;
  hours?: number;
  orderNumber?: string;
}) {
  const reservedUntil = getReservationExpiresAt(
    Math.min(48, Math.max(1, Number(input.hours ?? 24))),
  );

  const json = await strapiFetch<{ data?: StrapiReservation }>(
    `/api/dealer-reservations`,
    {
      method: "POST",
      body: JSON.stringify({
        data: {
          dealer: input.dealerDocumentId,
          product: input.productId,
          productTitle: input.productTitle,
          productArticle: input.productArticle ?? "",
          collectionTitle: input.collectionTitle ?? "",
          quantity: Math.max(1, Number(input.quantity ?? 1)),
          reservationStatus: "active",
          reservedUntil,
          snapshotPrice: Number(input.snapshotPrice ?? 0),
          currency: input.currency ?? "",
          notes: input.notes ?? "",
          orderNumber: input.orderNumber ?? "",
        },
      }),
    },
  );

  if (!json?.data) {
    throw new Error("Reservation was not created");
  }

  return normalizeReservation(json.data);
}

export async function extendReservationsByOrderNumber(
  dealerDocumentId: string,
  orderNumber: string,
  hours: number,
) {
  const reservations = await getMyActiveReservations(dealerDocumentId);
  const grouped = reservations.filter(
    (item) =>
      item.orderNumber === orderNumber && item.reservationStatus === "active",
  );

  if (!grouped.length) {
    throw new Error("Reservation group not found");
  }

  const currentMax = grouped.reduce((max, item) => {
    const value = new Date(item.reservedUntil).getTime();
    return value > max ? value : max;
  }, Date.now());

  const nextDate = new Date(currentMax);
  nextDate.setHours(
    nextDate.getHours() + Math.min(48, Math.max(1, Number(hours || 1))),
  );

  await Promise.all(
    grouped.map((item) =>
      strapiFetch(`/api/dealer-reservations/${item.documentId || item.id}`, {
        method: "PUT",
        body: JSON.stringify({
          data: {
            reservedUntil: nextDate.toISOString(),
          },
        }),
      }),
    ),
  );

  return nextDate.toISOString();
}

export async function markReservationsConvertedByOrderNumber(
  dealerDocumentId: string,
  orderNumber: string,
) {
  const reservations = await getMyActiveReservations(dealerDocumentId);
  const grouped = reservations.filter(
    (item) =>
      item.orderNumber === orderNumber && item.reservationStatus === "active",
  );

  await Promise.all(
    grouped.map((item) =>
      strapiFetch(`/api/dealer-reservations/${item.documentId || item.id}`, {
        method: "PUT",
        body: JSON.stringify({
          data: {
            reservationStatus: "converted",
          },
        }),
      }),
    ),
  );

  return grouped.length;
}

export async function syncProductReservedQty(
  productDocumentId: string,
  activeReservedQty: number,
) {
  await strapiFetch(`/api/dealer-products/${productDocumentId}`, {
    method: "PUT",
    body: JSON.stringify({
      data: {
        reservedQty: Math.max(0, Number(activeReservedQty || 0)),
      },
    }),
  });
}