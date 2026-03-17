import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

import { writeDealerActivity } from "@/app/lib/dealer/activity";
import {
  getRequestIp,
  getRequestUserAgent,
} from "@/app/lib/dealer/request-meta";

type DealerJwtPayload = {
  role?: string;
  dealerId?: number;
  login?: string;
};

const secretStr = process.env.DEALER_JWT_SECRET;

if (!secretStr) {
  throw new Error("DEALER_JWT_SECRET is required");
}

const SECRET = new TextEncoder().encode(secretStr);

export async function POST(req: NextRequest) {
  try {
    const token = req.cookies.get("dealer_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const verified = await jwtVerify(token, SECRET);
    const dealer = verified.payload as DealerJwtPayload;

    if (dealer.role !== "dealer" || !dealer.dealerId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = (await req.json().catch(() => ({}))) as {
      actionType?: unknown;
      entityType?: unknown;
      entityId?: unknown;
      entityTitle?: unknown;
      url?: unknown;
      payload?: unknown;
    };

    const actionType =
      typeof body.actionType === "string" ? body.actionType.trim() : "";

    if (!actionType) {
      return NextResponse.json(
        { error: "actionType is required" },
        { status: 400 }
      );
    }

    await writeDealerActivity({
      dealerId: dealer.dealerId,
      actionType,
      entityType:
        typeof body.entityType === "string" ? body.entityType : "page",
      entityId: typeof body.entityId === "string" ? body.entityId : "",
      entityTitle:
        typeof body.entityTitle === "string" ? body.entityTitle : "",
      url: typeof body.url === "string" ? body.url : "",
      ip: getRequestIp(req),
      userAgent: getRequestUserAgent(req),
      payload:
        body.payload && typeof body.payload === "object"
          ? (body.payload as Record<string, unknown>)
          : {
              dealerLogin: dealer.login || "",
            },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Activity logging failed";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}