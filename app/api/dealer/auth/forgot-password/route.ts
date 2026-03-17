import { NextRequest, NextResponse } from "next/server";
import { SignJWT } from "jose";

type DealerRegion = "russia" | "uzbekistan" | "kazakhstan" | "tajikistan" | "";

type StrapiDealer = {
  id: number;
  login?: string;
  phone?: string;
  region?: DealerRegion;
  isActive?: boolean;
};

type StrapiListResponse = {
  data?: StrapiDealer[];
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

function esc(value: string) {
  return encodeURIComponent(value);
}

function normalizeDigits(value: string) {
  return value.replace(/\D/g, "");
}

function normalizePhoneByRegion(value: string, region: DealerRegion) {
  const digits = normalizeDigits(value);

  switch (region) {
    case "russia":
    case "kazakhstan": {
      if (digits.length === 11 && digits.startsWith("8")) {
        return `7${digits.slice(1)}`;
      }
      if (digits.length === 10) {
        return `7${digits}`;
      }
      if (digits.length === 11 && digits.startsWith("7")) {
        return digits;
      }
      return digits;
    }

    case "uzbekistan": {
      if (digits.length === 9) return `998${digits}`;
      if (digits.length === 12 && digits.startsWith("998")) return digits;
      return digits;
    }

    case "tajikistan": {
      if (digits.length === 9) return `992${digits}`;
      if (digits.length === 12 && digits.startsWith("992")) return digits;
      return digits;
    }

    default:
      return digits;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => ({}))) as {
      login?: unknown;
      phone?: unknown;
    };

    const login = typeof body.login === "string" ? body.login.trim() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";

    if (!login || !phone) {
      return NextResponse.json(
        { error: "Введите логин и телефон" },
        { status: 400 }
      );
    }

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (STRAPI_TOKEN) {
      headers.Authorization = `Bearer ${STRAPI_TOKEN}`;
    }

    const url =
      `${STRAPI_URL}/api/dealers` +
      `?filters[login][$eq]=${esc(login)}` +
      `&pagination[pageSize]=1`;

    const res = await fetch(url, {
      method: "GET",
      headers,
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { error: `Strapi dealers request failed (${res.status}) ${text}` },
        { status: 500 }
      );
    }

    const json = (await res.json()) as StrapiListResponse;
    const dealer = Array.isArray(json.data) ? json.data[0] : undefined;

    if (!dealer || !dealer.isActive) {
      return NextResponse.json(
        { error: "Логин не найден или аккаунт недоступен" },
        { status: 404 }
      );
    }

    const region = dealer.region || "";
    const storedPhone = normalizePhoneByRegion(dealer.phone || "", region);
    const incomingPhone = normalizePhoneByRegion(phone, region);

    if (!storedPhone || !incomingPhone || storedPhone !== incomingPhone) {
      return NextResponse.json(
        {
          error: "Телефон не совпадает с аккаунтом",
          region,
        },
        { status: 401 }
      );
    }

    const resetToken = await new SignJWT({
      role: "dealer_reset",
      dealerId: dealer.id,
      login: dealer.login || "",
      phone: storedPhone,
      region,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setExpirationTime("15m")
      .sign(SECRET);

    return NextResponse.json({
      success: true,
      resetToken,
      region,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Forgot password failed";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}