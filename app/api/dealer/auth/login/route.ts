import { NextResponse } from "next/server";
import { SignJWT } from "jose";
import bcrypt from "bcryptjs";

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
  region?: string;
  isActive?: boolean;
  mustChangePassword?: boolean;
  roleLabel?: string;
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

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const login =
      typeof body?.login === "string"
        ? body.login.trim()
        : typeof body?.email === "string"
          ? body.email.trim()
          : "";

    const password = typeof body?.password === "string" ? body.password : "";

    if (!login || !password) {
      return NextResponse.json(
        { error: "Login and password are required" },
        { status: 400 }
      );
    }

    const url =
      `${STRAPI_URL}/api/dealers` +
      `?filters[login][$eq]=${esc(login)}` +
      `&pagination[pageSize]=1`;

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
        {
          error: `Strapi dealers request failed (${strapiRes.status}) ${text}`,
        },
        { status: 500 }
      );
    }

    const json = (await strapiRes.json()) as StrapiListResponse;
    const dealer = Array.isArray(json.data) ? json.data[0] : undefined;

    if (!dealer) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    if (!dealer.isActive) {
      return NextResponse.json(
        { error: "Dealer account is disabled" },
        { status: 403 }
      );
    }

    const storedPasswordHash =
      typeof dealer.passwordHash === "string" ? dealer.passwordHash : "";

    if (!storedPasswordHash) {
      return NextResponse.json(
        { error: "Dealer password is not configured" },
        { status: 500 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, storedPasswordHash);

    if (!isValidPassword) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    const token = await new SignJWT({
      role: "dealer",
      dealerId: dealer.id,
      login: dealer.login || "",
      title: dealer.title || "",
      email: dealer.email || "",
      phone: dealer.phone || "",
      city: dealer.city || "",
      region: dealer.region || "",
      roleLabel: dealer.roleLabel || "",
      managerName: dealer.managerName || "",
      mustChangePassword: Boolean(dealer.mustChangePassword),
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("1d")
      .sign(SECRET);

    const res = NextResponse.json({ success: true });

    res.cookies.set("dealer_token", token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
    });

    return res;
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Dealer login failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}