import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

import {
  createDealerReservation,
  getActiveReservationsByProductIds,
  getMyActiveReservations,
  isReservationExpired,
  releaseExpiredReservations,
  syncProductReservedQty,
} from "@/app/lib/dealer/reservations";
import {
  getDealerCollectionPageData,
  type DealerCountryCode,
} from "@/app/lib/dealer/shop";

const secretStr = process.env.DEALER_JWT_SECRET;

if (!secretStr) {
  throw new Error("DEALER_JWT_SECRET is required");
}

const SECRET = new TextEncoder().encode(secretStr);

type JwtPayloadShape = {
  documentId?: string;
  login?: string;
  countryCode?: DealerCountryCode;
  region?: string;
};

function normalizeCountryCode(value: unknown): DealerCountryCode {
  if (value === "RU" || value === "UZ" || value === "KZ" || value === "TJ") {
    return value;
  }
  return "UZ";
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("dealer_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, SECRET);
    const dealerDocumentId = String(
      (payload as JwtPayloadShape)?.documentId ?? "",
    ).trim();

    if (!dealerDocumentId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await releaseExpiredReservations();

    const reservations = await getMyActiveReservations(dealerDocumentId);

    return NextResponse.json({
      ok: true,
      reservations,
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("dealer_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, SECRET);
    const dealerPayload = payload as JwtPayloadShape;

    const dealerDocumentId = String(dealerPayload.documentId ?? "").trim();
    const countryCode = normalizeCountryCode(dealerPayload.countryCode);

    if (!dealerDocumentId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      productId?: string;
      quantity?: number;
      collectionSlug?: string;
    };

    const productId = String(body?.productId ?? "").trim();
    const quantity = Math.max(1, Number(body?.quantity ?? 1));
    const collectionSlug = String(body?.collectionSlug ?? "").trim();

    if (!productId || !collectionSlug) {
      return NextResponse.json(
        { error: "productId and collectionSlug are required" },
        { status: 400 },
      );
    }

    await releaseExpiredReservations();

    const pageData = await getDealerCollectionPageData(collectionSlug);
    const product = (pageData.products ?? []).find((item) => item.id === productId);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const stockQty = Math.max(0, Number(product.stockQty ?? 0));
    const isStockTracked = Boolean(product.isStockTracked);

    if (isStockTracked) {
      const reservationsMap = await getActiveReservationsByProductIds([productId]);
      const activeReservations = reservationsMap.get(productId) ?? [];
      const activeReservedQty = activeReservations
        .filter((item) => !isReservationExpired(item.reservedUntil))
        .reduce((sum, item) => sum + item.quantity, 0);

      const availableQty = Math.max(0, stockQty - activeReservedQty);

      if (availableQty < quantity) {
        return NextResponse.json(
          {
            error: "Недостаточно товара в остатке",
            stockQty,
            reservedQty: activeReservedQty,
            availableQty,
          },
          { status: 409 },
        );
      }

      await syncProductReservedQty(productId, activeReservedQty + quantity);
    }

    const reservation = await createDealerReservation({
      dealerDocumentId,
      productId: product.id,
      productTitle: product.title,
      productArticle: product.article,
      collectionTitle: collectionSlug,
      quantity,
      snapshotPrice: Number(product.price?.[countryCode] ?? 0),
      currency: countryCode,
    });

    const reservationsMap = await getActiveReservationsByProductIds([productId]);
    const activeReservedQty = (reservationsMap.get(productId) ?? []).reduce(
      (sum, item) => sum + item.quantity,
      0,
    );

    return NextResponse.json({
      ok: true,
      reservation,
      stock: {
        stockQty: Math.max(0, Number(product.stockQty ?? 0)),
        reservedQty: activeReservedQty,
        availableQty: Math.max(
          0,
          Math.max(0, Number(product.stockQty ?? 0)) - activeReservedQty,
        ),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to create reservation",
      },
      { status: 500 },
    );
  }
}