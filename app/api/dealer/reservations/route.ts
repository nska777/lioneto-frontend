import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { jwtVerify } from "jose";

import {
  createDealerReservation,
  extendReservationsByOrderNumber,
  getActiveReservationsByProductIds,
  getDealerProductsByIds,
  getMyActiveReservations,
  isReservationExpired,
  markReservationsConvertedByOrderNumber,
  releaseExpiredReservations,
  syncProductReservedQty,
} from "@/app/lib/dealer/reservations";
import type { CartEntry } from "@/app/dealer/order/[collection]/types";
import type { DealerCountryCode } from "@/app/lib/dealer/shop";

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
      items?: CartEntry[];
      hours?: number;
      reservationNumber?: string;
    };

    const items = Array.isArray(body.items) ? body.items : [];
    const hours = Math.min(48, Math.max(1, Number(body.hours ?? 24)));
    const reservationNumber = String(body.reservationNumber ?? "").trim();

    if (!items.length || !reservationNumber) {
      return NextResponse.json(
        { error: "items and reservationNumber are required" },
        { status: 400 },
      );
    }

    await releaseExpiredReservations();

    const reserveTargets = items.map((item) => ({
      item,
      productId: item.kind === "product" ? item.productId : item.addonId,
    }));

    const productIds = reserveTargets.map((item) => item.productId);
    const productsMap = await getDealerProductsByIds(productIds);
    const reservationsMap = await getActiveReservationsByProductIds(productIds);

    for (const target of reserveTargets) {
      const product = productsMap.get(target.productId);
      if (!product) {
        return NextResponse.json(
          { error: `Product not found: ${target.productId}` },
          { status: 404 },
        );
      }

      const stockQty = Math.max(0, Number(product.stockQty ?? 0));
      const isStockTracked = Boolean(product.isStockTracked);

      if (!isStockTracked) continue;

      const activeReservations = reservationsMap.get(target.productId) ?? [];
      const activeReservedQty = activeReservations
        .filter((item) => !isReservationExpired(item.reservedUntil))
        .reduce((sum, item) => sum + item.quantity, 0);

      const availableQty = Math.max(0, stockQty - activeReservedQty);

      if (availableQty < target.item.quantity) {
        return NextResponse.json(
          {
            error: `Недостаточно остатка для ${target.item.title}`,
            stockQty,
            reservedQty: activeReservedQty,
            availableQty,
          },
          { status: 409 },
        );
      }
    }

    const created = [];

    for (const target of reserveTargets) {
      const product = productsMap.get(target.productId);
      const activeReservations = reservationsMap.get(target.productId) ?? [];
      const activeReservedQty = activeReservations
        .filter((item) => !isReservationExpired(item.reservedUntil))
        .reduce((sum, item) => sum + item.quantity, 0);

      if (product?.isStockTracked) {
        await syncProductReservedQty(
          target.productId,
          activeReservedQty + target.item.quantity,
        );
      }

      const reservation = await createDealerReservation({
        dealerDocumentId,
        productId: target.productId,
        productTitle: target.item.title,
        productArticle: target.item.article,
        collectionTitle: target.item.collectionSlug,
        quantity: Math.max(1, Number(target.item.quantity ?? 1)),
        snapshotPrice: Number(target.item.unitBasePrice ?? 0),
        currency: countryCode,
        hours,
        orderNumber: reservationNumber,
        notes: JSON.stringify({
          kind: target.item.kind,
          addonKind: target.item.kind === "addon" ? target.item.addonKind : undefined,
          addonSelectionType:
            target.item.kind === "addon"
              ? target.item.addonSelectionType
              : undefined,
          parentProductId:
            target.item.kind === "addon" ? target.item.parentProductId : undefined,
          parentProductTitle:
            target.item.kind === "addon"
              ? target.item.parentProductTitle
              : undefined,
          color: target.item.color ?? "",
          size: target.item.size ?? "",
          articleShort: target.item.articleShort ?? "",
          unitBasePrice: target.item.unitBasePrice,
          unitFinalPrice: target.item.unitFinalPrice,
          totalBasePrice: target.item.totalBasePrice,
          totalFinalPrice: target.item.totalFinalPrice,
        }),
      });

      created.push(reservation);
    }

    return NextResponse.json({
      ok: true,
      reservations: created,
      reservationNumber,
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

export async function PATCH(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("dealer_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, SECRET);
    const dealerPayload = payload as JwtPayloadShape;
    const dealerDocumentId = String(dealerPayload.documentId ?? "").trim();

    if (!dealerDocumentId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json()) as {
      orderNumber?: string;
      hours?: number;
      action?: "extend" | "convert";
    };

    const orderNumber = String(body.orderNumber ?? "").trim();
    const hours = Math.min(48, Math.max(1, Number(body.hours ?? 1)));
    const action = body.action ?? "extend";

    if (!orderNumber) {
      return NextResponse.json(
        { error: "orderNumber is required" },
        { status: 400 },
      );
    }

    if (action === "convert") {
      const count = await markReservationsConvertedByOrderNumber(
        dealerDocumentId,
        orderNumber,
      );

      return NextResponse.json({
        ok: true,
        convertedCount: count,
      });
    }

    const reservedUntil = await extendReservationsByOrderNumber(
      dealerDocumentId,
      orderNumber,
      hours,
    );

    return NextResponse.json({
      ok: true,
      reservedUntil,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update reservation",
      },
      { status: 500 },
    );
  }
}