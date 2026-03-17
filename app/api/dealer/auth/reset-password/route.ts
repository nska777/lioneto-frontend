import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import bcrypt from "bcryptjs";

type ResetPayload = {
  role?: string;
  dealerId?: number;
  login?: string;
  phone?: string;
  region?: string;
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

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      token?: unknown;
      password?: unknown;
    };

    const token = typeof body.token === "string" ? body.token : "";
    const password = typeof body.password === "string" ? body.password : "";

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

    if (payload.role !== "dealer_reset" || !payload.dealerId) {
      return NextResponse.json(
        { error: "Недействительный токен восстановления" },
        { status: 401 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (STRAPI_TOKEN) {
      headers.Authorization = `Bearer ${STRAPI_TOKEN}`;
    }

    const res = await fetch(`${STRAPI_URL}/api/dealers/${payload.dealerId}`, {
      method: "PUT",
      headers,
      cache: "no-store",
      body: JSON.stringify({
        data: {
          passwordHash,
          mustChangePassword: false,
        },
      }),
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `Strapi update failed (${res.status}) ${text}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Reset password failed";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}