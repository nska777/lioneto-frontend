import { NextResponse } from "next/server";
import { getSessionUser } from "@/app/lib/auth/session";
import { STRAPI_API_TOKEN, STRAPI_URL } from "@/app/lib/auth/config";

function getAuthHeaders(): Record<string, string> {
  if (!STRAPI_API_TOKEN) return {};
  return {
    Authorization: `Bearer ${STRAPI_API_TOKEN}`,
  };
}

function toStrapiUrl(path: string) {
  return `${String(STRAPI_URL).replace(/\/$/, "")}${path}`;
}

export async function GET() {
  try {
    const sessionUser = await getSessionUser();
    const customerId = sessionUser?.id;

    if (!customerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const url = toStrapiUrl(
      `/api/customer-orders?filters[customer][documentId][$eq]=${customerId}&sort[0]=createdAt:desc`
    );

    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        ...getAuthHeaders(),
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: "Failed to load orders", details: text },
        { status: 500 }
      );
    }

    const json = await res.json();
    const rows = Array.isArray(json?.data) ? json.data : [];

    const orders = rows.map((item: any) => {
      const src = item?.attributes ?? item;

      return {
        id: String(item?.id ?? src?.id ?? src?.documentId ?? ""),
        orderNumber: src?.orderNumber ?? "",
        orderStatus: src?.orderStatus ?? "new",
        totalAmount: Number(src?.totalAmount ?? 0),
        currency: src?.currency ?? "UZS",
        createdAt: src?.createdAt ?? null,
        items: Array.isArray(src?.items) ? src.items : [],
      };
    });

    return NextResponse.json({ orders });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Internal server error",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}