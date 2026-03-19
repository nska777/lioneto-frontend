import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";
import bcrypt from "bcryptjs";

import { writeDealerActivity } from "@/app/lib/dealer/activity";
import {
  getRequestIp,
  getRequestUserAgent,
} from "@/app/lib/dealer/request-meta";

type DealerRole = "dealer" | "admin" | "owner";

type StrapiDealer = {
  id: number;
  documentId?: string;
  title?: string;
  slug?: string;
  login?: string;
  passwordHash?: string;
  email?: string;
  phone?: string;
  city?: string;
  address?: string;
  region?: string;
  countryCode?: string;
  isActive?: boolean;
  mustChangePassword?: boolean;
  role?: DealerRole;
  managerName?: string;
  notes?: string;
};

type StrapiListResponse = {
  data?: StrapiDealer[];
};

const secretStr = process.env.DEALER_JWT_SECRET;

if (!secretStr) {
  throw new Error("DEALER_JWT_SECRET is required");
}

const STRAPI_URL =
  process.env.STRAPI_URL ||
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  "http://localhost:1337";

const STRAPI_TOKEN = process.env.STRAPI_TOKEN || "";
const SECRET = new TextEncoder().encode(secretStr);

function esc(value: string) {
  return encodeURIComponent(value);
}

function normalizeRole(value: unknown): DealerRole {
  if (value === "dealer" || value === "admin" || value === "owner") {
    return value;
  }

  return "dealer";
}

function normalizeCountryCode(value: unknown): string {
  if (
    value === "RU" ||
    value === "UZ" ||
    value === "KZ" ||
    value === "TJ" ||
    value === "KG" ||
    value === "AM" ||
    value === "BY" ||
    value === "AZ"
  ) {
    return value;
  }

  return "RU";
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      login?: unknown;
      email?: unknown;
      password?: unknown;
      rememberMe?: unknown;
    };

    const email =
      typeof body.email === "string"
        ? body.email.trim().toLowerCase()
        : typeof body.login === "string"
          ? body.login.trim().toLowerCase()
          : "";

    const password = typeof body.password === "string" ? body.password : "";
    const rememberMe = Boolean(body.rememberMe);

    if (!email || !password) {
      return NextResponse.json(
        { error: "Введите email и пароль" },
        { status: 400 }
      );
    }

    const url =
      `${STRAPI_URL}/api/dealers` +
      `?filters[email][$eq]=${esc(email)}` +
      `&pagination[pageSize]=1` +
      `&sort[0]=createdAt:desc`;

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (STRAPI_TOKEN) {
      headers.Authorization = `Bearer ${STRAPI_TOKEN}`;
    }

    const strapiRes = await fetch(url, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!strapiRes.ok) {
      const text = await strapiRes.text().catch(() => "");
      return NextResponse.json(
        { error: `Strapi dealers request failed (${strapiRes.status}) ${text}` },
        { status: 500 }
      );
    }

    const json = (await strapiRes.json()) as StrapiListResponse;
    const dealer = Array.isArray(json.data) ? json.data[0] : undefined;

    if (!dealer || !dealer.email) {
      return NextResponse.json(
        { error: "Неверный email или пароль" },
        { status: 401 }
      );
    }

    if (!dealer.isActive) {
      return NextResponse.json(
        { error: "Аккаунт дилера отключен" },
        { status: 403 }
      );
    }

    const storedPasswordHash =
      typeof dealer.passwordHash === "string" ? dealer.passwordHash : "";

    if (!storedPasswordHash) {
      return NextResponse.json(
        { error: "Пароль дилера не настроен" },
        { status: 500 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, storedPasswordHash);

    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Неверный email или пароль" },
        { status: 401 }
      );
    }

    const token = await new SignJWT({
      role: normalizeRole(dealer.role),
      dealerId: dealer.id,
      documentId: dealer.documentId || "",
      login: dealer.login || "",
      title: dealer.title || "",
      email: dealer.email || "",
      phone: dealer.phone || "",
      city: dealer.city || "",
      address: dealer.address || "",
      region: dealer.region || "",
      countryCode: normalizeCountryCode(dealer.countryCode),
      managerName: dealer.managerName || "",
      mustChangePassword: Boolean(dealer.mustChangePassword),
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime(rememberMe ? "30d" : "1d")
      .sign(SECRET);

    try {
      await writeDealerActivity({
        dealerId: dealer.id,
        actionType: "login_success",
        entityType: "auth",
        entityId: String(dealer.id),
        entityTitle:
          dealer.login || dealer.title || dealer.email || "dealer-login",
        url: "/dealer/login",
        ip: getRequestIp(req),
        userAgent: getRequestUserAgent(req),
        payload: {
          dealerLogin: dealer.login || "",
          dealerEmail: dealer.email || "",
          dealerRole: normalizeRole(dealer.role),
          dealerCountryCode: normalizeCountryCode(dealer.countryCode),
        },
      });
    } catch (activityError) {
      console.error("[dealer-login] activity log failed", activityError);
    }

    const res = NextResponse.json({ success: true });

    res.cookies.set("dealer_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: rememberMe ? 60 * 60 * 24 * 30 : 60 * 60 * 24,
    });

    return res;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Dealer login failed";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}