import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import bcrypt from "bcryptjs";

import { writeDealerActivity } from "@/app/lib/dealer/activity";
import {
  getRequestIp,
  getRequestUserAgent,
} from "@/app/lib/dealer/request-meta";

type ResetPayload = {
  role?: string;
  dealerDocumentId?: string;
  login?: string;
  phone?: string;
  region?: string;
};

type StrapiDealerItem = {
  id: number;
  documentId?: string;
  title?: string;
  email?: string;
  login?: string;
  phone?: string;
};

type StrapiSingleResponse<T> = {
  data?: T;
};

const secretStr = process.env.DEALER_JWT_SECRET;

if (!secretStr) {
  throw new Error("DEALER_JWT_SECRET is required");
}

const SECRET = new TextEncoder().encode(secretStr);

const STRAPI_URL =
  process.env.STRAPI_URL ||
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  "http://localhost:1337";

const STRAPI_TOKEN = process.env.STRAPI_TOKEN || "";

function getAuthHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (STRAPI_TOKEN) {
    headers.Authorization = `Bearer ${STRAPI_TOKEN}`;
  }

  return headers;
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      token?: unknown;
      password?: unknown;
    };

    const token = typeof body.token === "string" ? body.token : "";
    const password = typeof body.password === "string" ? body.password : "";

    console.log("[dealer-reset-password] request received", {
      hasToken: Boolean(token),
      passwordLength: password.length,
    });

    if (!token || !password) {
      return NextResponse.json(
        { error: "Токен и новый пароль обязательны" },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Пароль должен содержать минимум 6 символов" },
        { status: 400 }
      );
    }

    const verified = await jwtVerify(token, SECRET);
    const payload = verified.payload as ResetPayload;

    console.log("[dealer-reset-password] token ok", {
      role: payload.role || "",
      dealerDocumentId: payload.dealerDocumentId || "",
      login: payload.login || "",
    });

    if (payload.role !== "dealer_reset" || !payload.dealerDocumentId) {
      return NextResponse.json(
        { error: "Недействительный токен восстановления" },
        { status: 401 }
      );
    }

    const headers = getAuthHeaders();

    const dealerRes = await fetch(
      `${STRAPI_URL}/api/dealers/${payload.dealerDocumentId}`,
      {
        method: "GET",
        headers,
        cache: "no-store",
      }
    );

    if (!dealerRes.ok) {
      const text = await dealerRes.text().catch(() => "");
      console.error("[dealer-reset-password] dealer fetch failed", {
        status: dealerRes.status,
        text,
      });

      return NextResponse.json(
        { error: `Dealer fetch failed (${dealerRes.status}) ${text}` },
        { status: 500 }
      );
    }

    const dealerJson = (await dealerRes.json().catch(() => ({}))) as StrapiSingleResponse<StrapiDealerItem>;
    const dealer = dealerJson.data;

    console.log("[dealer-reset-password] dealer fetched", dealer);

    if (!dealer?.id) {
      console.error(
        "[dealer-reset-password] dealer not found in response",
        dealerJson
      );

      return NextResponse.json({ error: "Дилер не найден" }, { status: 404 });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const updateRes = await fetch(
      `${STRAPI_URL}/api/dealers/${payload.dealerDocumentId}`,
      {
        method: "PUT",
        headers,
        cache: "no-store",
        body: JSON.stringify({
          data: {
            passwordHash,
            mustChangePassword: false,
          },
        }),
      }
    );

    if (!updateRes.ok) {
      const text = await updateRes.text().catch(() => "");
      console.error("[dealer-reset-password] password update failed", {
        status: updateRes.status,
        text,
      });

      return NextResponse.json(
        { error: `Strapi update failed (${updateRes.status}) ${text}` },
        { status: 500 }
      );
    }

    console.log("[dealer-reset-password] password updated", {
      dealerId: dealer.id,
      dealerLogin: dealer.login || "",
      dealerEmail: dealer.email || "",
    });

    try {
      const activityPayload = {
        dealerId: dealer.id,
        actionType: "password_changed",
        entityType: "dealer_account",
        entityId: String(dealer.id),
        entityTitle:
          dealer.title ||
          dealer.email ||
          dealer.login ||
          payload.login ||
          `Dealer #${dealer.id}`,
        url: "/dealer/reset-password",
        ip: getRequestIp(req),
        userAgent: getRequestUserAgent(req),
        payload: {
          email: dealer.email || "",
          changedVia: "reset",
          status: "success",
          dealerDocumentId: payload.dealerDocumentId,
          dealerLogin: dealer.login || payload.login || "",
          dealerTitle: dealer.title || "",
        },
      };

      console.log("[dealer-reset-password] writing activity", activityPayload);

      await writeDealerActivity(activityPayload);

      console.log("[dealer-reset-password] activity written");
    } catch (activityError) {
      console.error(
        "[dealer-reset-password] activity log failed",
        activityError
      );
    }

    return NextResponse.json({
      success: true,
      debug: {
        dealerId: dealer.id,
        dealerLogin: dealer.login || "",
        dealerEmail: dealer.email || "",
        activityAttempted: true,
      },
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Reset password failed";

    console.error("[dealer-reset-password] fatal error", error);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}