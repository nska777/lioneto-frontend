import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

import { writeDealerActivity } from "@/app/lib/dealer/activity";
import { getRequestIp, getRequestUserAgent } from "@/app/lib/dealer/request-meta";

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
  const token = req.cookies.get("dealer_token")?.value;

  if (token) {
    try {
      const verified = await jwtVerify(token, SECRET);
      const dealer = verified.payload as unknown as DealerJwtPayload;

      if (dealer.role === "dealer" && dealer.dealerId) {
        await writeDealerActivity({
          dealerId: dealer.dealerId,
          actionType: "logout",
          entityType: "auth",
          entityId: String(dealer.dealerId),
          entityTitle: dealer.login || "dealer-logout",
          url: "/dealer/logout",
          ip: getRequestIp(req),
          userAgent: getRequestUserAgent(req),
          payload: {
            dealerLogin: dealer.login || "",
          },
        });
      }
    } catch {
      // ignore logout logging errors from invalid/expired cookie
    }
  }

  const res = NextResponse.json({ success: true });

  res.cookies.set("dealer_token", "", {
    httpOnly: true,
    expires: new Date(0),
    path: "/",
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });

  return res;
}