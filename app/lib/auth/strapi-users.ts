import { STRAPI_API_TOKEN, STRAPI_URL } from "./config";

export type StrapiCustomer = {
  id: number | string;
  documentId?: string;
  firstName?: string | null;
  lastName?: string | null;
  countryCode?: string | null;
  phone?: string | null;
  passwordHash?: string | null;
  isActive?: boolean | null;
};

function getHeaders() {
  return {
    "Content-Type": "application/json",
    ...(STRAPI_API_TOKEN
      ? { Authorization: `Bearer ${STRAPI_API_TOKEN}` }
      : {}),
  };
}

function normalizeCustomer(item: any): StrapiCustomer | null {
  const src = item?.attributes ?? item;
  if (!src) return null;

  return {
    id: item?.id ?? src?.id,
    documentId: src?.documentId ?? item?.documentId,
    firstName: src?.firstName ?? null,
    lastName: src?.lastName ?? null,
    countryCode: src?.countryCode ?? null,
    phone: src?.phone ?? null,
    passwordHash: src?.passwordHash ?? null,
    isActive: src?.isActive ?? true,
  };
}

export async function findCustomerByPhone(phone: string) {
  const url =
    `${STRAPI_URL.replace(/\/$/, "")}/api/customers` +
    `?filters[phone][$eq]=${encodeURIComponent(phone)}` +
    `&pagination[pageSize]=1`;

  const res = await fetch(url, {
    method: "GET",
    headers: getHeaders(),
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Не удалось получить пользователя из Strapi.");
  }

  const json = await res.json();
  const item = json?.data?.[0];
  return normalizeCustomer(item);
}

export async function createCustomer(input: {
  firstName: string;
  lastName: string;
  countryCode: string;
  phone: string;
  passwordHash: string;
}) {
  const url = `${STRAPI_URL.replace(/\/$/, "")}/api/customers`;

  const res = await fetch(url, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      data: {
        firstName: input.firstName,
        lastName: input.lastName,
        countryCode: input.countryCode,
        phone: input.phone,
        passwordHash: input.passwordHash,
        isActive: true,
      },
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Не удалось создать пользователя в Strapi. ${text}`);
  }

  const json = await res.json();
  return normalizeCustomer(json?.data);
}

export async function updateCustomerProfile(
  documentIdOrId: string | number,
  input: { firstName?: string; lastName?: string },
) {
  const url = `${STRAPI_URL.replace(/\/$/, "")}/api/customers/${documentIdOrId}`;

  const res = await fetch(url, {
    method: "PUT",
    headers: getHeaders(),
    body: JSON.stringify({
      data: {
        ...(input.firstName !== undefined ? { firstName: input.firstName } : {}),
        ...(input.lastName !== undefined ? { lastName: input.lastName } : {}),
      },
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Не удалось обновить профиль в Strapi. ${text}`);
  }

  const json = await res.json();
  return normalizeCustomer(json?.data);
}