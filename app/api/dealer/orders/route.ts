import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretStr = process.env.DEALER_JWT_SECRET;

if (!secretStr) {
  throw new Error("DEALER_JWT_SECRET is required");
}

const SECRET = new TextEncoder().encode(secretStr);

const STRAPI_URL =
  process.env.STRAPI_URL ||
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  "http://localhost:1337";

const STRAPI_TOKEN =
  process.env.STRAPI_TOKEN ||
  process.env.STRAPI_API_TOKEN ||
  process.env.STRAPI_DEALER_TOKEN ||
  "";

type DealerCountryCode =
  | "RU"
  | "UZ"
  | "KZ"
  | "TJ"
  | "KG"
  | "AM"
  | "BY"
  | "AZ";

type JwtPayload = {
  dealerId?: number;
  documentId?: string;
  login?: string;
  title?: string;
  email?: string;
  phone?: string;
  city?: string;
  address?: string;
  region?: string;
  countryCode?: DealerCountryCode;
  managerName?: string;
  mustChangePassword?: boolean;
  role?: "dealer" | "admin" | "owner";
};

type CreateDealerOrderBody = {
  orderNumber?: string;
  dealerTitle?: string;
  dealerEmail?: string;
  countryCode?: string;
  currency?: string;
  collectionTitles?: string[] | string;
  totalQty?: number;
  subtotal?: number | string;
  totalWithMarkup?: number | string;
  globalMarkupPercent?: number;
  globalMarkupAmount?: number | string;
  total?: number | string;
  items?: unknown[];
  notes?: string;
};

function normalizeCountryCode(value: unknown): DealerCountryCode {
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

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }

  return fallback;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function asMoneyString(value: unknown, fallback = "0"): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  if (typeof value === "string") {
    const trimmed = value.trim();
    return trimmed || fallback;
  }

  return fallback;
}

function getStrapiHeaders() {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (STRAPI_TOKEN) {
    headers.Authorization = `Bearer ${STRAPI_TOKEN}`;
  }

  return headers;
}

function extractStrapiErrorMessage(payload: any): string {
  const candidates = [
    payload?.error?.message,
    payload?.message,
    payload?.details?.error?.message,
    payload?.details?.message,
  ];

  for (const candidate of candidates) {
    if (typeof candidate === "string" && candidate.trim()) {
      return candidate;
    }
  }

  return "Strapi returned an unknown error";
}

function isUniqueConstraintError(payload: any): boolean {
  const texts = [
    payload?.error?.message,
    payload?.message,
    payload?.details?.error?.message,
    payload?.details?.message,
    payload?.error?.details?.errors
      ?.map((item: any) => item?.message)
      .join(" "),
    payload?.error?.details?.errors
      ?.map((item: any) => item?.path?.join?.("."))
      .join(" "),
  ]
    .filter((value): value is string => typeof value === "string")
    .join(" ")
    .toLowerCase();

  return (
    texts.includes("must be unique") ||
    texts.includes("unique") ||
    texts.includes("already exists") ||
    texts.includes("already taken")
  );
}

function sanitizeOrderPart(value: string): string {
  return (
    value
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9_-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-|-$/g, "") || "DEALER"
  );
}

function pad2(value: number): string {
  return String(value).padStart(2, "0");
}

function generateUniqueOrderNumber(dealer: JwtPayload): string {
  const loginPart = sanitizeOrderPart(
    dealer.login || dealer.title || dealer.email || "dealer",
  );

  const now = new Date();

  const datePart = [
    now.getFullYear(),
    pad2(now.getMonth() + 1),
    pad2(now.getDate()),
  ].join("");

  const timePart = [
    pad2(now.getHours()),
    pad2(now.getMinutes()),
    pad2(now.getSeconds()),
  ].join("");

  const randomPart = Math.floor(Math.random() * 9000 + 1000);

  return `DLR-${loginPart}-${datePart}-${timePart}-${randomPart}`;
}

async function getDealerFromCookie(): Promise<JwtPayload> {
  const cookieStore = await cookies();
  const token = cookieStore.get("dealer_token")?.value;

  if (!token) {
    throw new Error("Unauthorized");
  }

  const { payload } = await jwtVerify(token, SECRET);

  return payload as JwtPayload;
}

function buildPayload(
  body: CreateDealerOrderBody,
  dealer: JwtPayload,
  orderNumber: string,
) {
  const collectionTitles = Array.isArray(body.collectionTitles)
    ? body.collectionTitles.filter(
        (item): item is string => typeof item === "string",
      )
    : typeof body.collectionTitles === "string" && body.collectionTitles.trim()
      ? body.collectionTitles
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean)
      : [];

  const items = Array.isArray(body.items) ? body.items : [];

  return {
    data: {
      orderNumber,
      orderStatus: "new",

      dealer: dealer.documentId,

      dealerTitle: asString(body.dealerTitle, dealer.title || ""),
      dealerEmail: asString(body.dealerEmail, dealer.email || ""),

      countryCode: asString(
        body.countryCode,
        normalizeCountryCode(dealer.countryCode),
      ),

      currency: asString(body.currency, ""),
      collectionTitles: collectionTitles.join(", "),

      totalQty: Math.trunc(asNumber(body.totalQty, 0)),

      subtotalText: asMoneyString(body.subtotal),
      totalWithMarkupText: asMoneyString(body.totalWithMarkup),
      globalMarkupPercent: asNumber(body.globalMarkupPercent, 0),
      globalMarkupAmountText: asMoneyString(body.globalMarkupAmount),
      totalText: asMoneyString(body.total),

      items,
      notes: asString(body.notes, ""),
      isArchived: false,
    },
  };
}

async function createOrderInStrapi(
  body: CreateDealerOrderBody,
  dealer: JwtPayload,
) {
  const requestedOrderNumber = asString(body.orderNumber).trim();

  let currentOrderNumber =
    requestedOrderNumber || generateUniqueOrderNumber(dealer);

  for (let attempt = 1; attempt <= 5; attempt += 1) {
    const payload = buildPayload(body, dealer, currentOrderNumber);

    console.log(
      `[dealer-orders][POST] sending payload, attempt ${attempt}:`,
      JSON.stringify(payload, null, 2),
    );

    const strapiRes = await fetch(`${STRAPI_URL}/api/dealer-orders`, {
      method: "POST",
      headers: getStrapiHeaders(),
      body: JSON.stringify(payload),
      cache: "no-store",
    });

    const strapiJson = await strapiRes.json().catch(() => null);

    if (strapiRes.ok) {
      return {
        ok: true,
        order: strapiJson?.data ?? null,
        orderNumber: currentOrderNumber,
      };
    }

    console.error(
      `[dealer-orders][POST] Strapi error on attempt ${attempt}:`,
      strapiRes.status,
      JSON.stringify(strapiJson, null, 2),
    );

    if (isUniqueConstraintError(strapiJson) && attempt < 5) {
      currentOrderNumber = generateUniqueOrderNumber(dealer);
      continue;
    }

    return {
      ok: false,
      status: strapiRes.status,
      error: extractStrapiErrorMessage(strapiJson),
      details: strapiJson,
    };
  }

  return {
    ok: false,
    status: 500,
    error: "Failed to generate a unique order number",
    details: null,
  };
}

export async function POST(req: NextRequest) {
  try {
    const dealer = await getDealerFromCookie();

    if (!dealer.documentId) {
      return NextResponse.json(
        { error: "Dealer documentId not found in token" },
        { status: 400 },
      );
    }

    const body = (await req.json().catch(() => ({}))) as CreateDealerOrderBody;

    const result = await createOrderInStrapi(body, dealer);

    if (!result.ok) {
      return NextResponse.json(
        {
          error: result.error,
          status: result.status,
          details: result.details,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      success: true,
      orderNumber: result.orderNumber,
      order: result.order,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to create dealer order";

    console.error("[dealer-orders][POST] route error:", error);

    const status = message === "Unauthorized" ? 401 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}

export async function GET() {
  try {
    const dealer = await getDealerFromCookie();

    if (!dealer.documentId) {
      return NextResponse.json(
        { error: "Dealer documentId not found in token" },
        { status: 400 },
      );
    }

    const qs = new URLSearchParams();

    qs.set("sort[0]", "createdAt:desc");
    qs.set("filters[dealer][documentId][$eq]", dealer.documentId);
    qs.set("pagination[pageSize]", "100");

    const strapiRes = await fetch(
      `${STRAPI_URL}/api/dealer-orders?${qs.toString()}`,
      {
        method: "GET",
        headers: getStrapiHeaders(),
        cache: "no-store",
      },
    );

    const strapiJson = await strapiRes.json().catch(() => null);

    if (!strapiRes.ok) {
      console.error(
        "[dealer-orders][GET] Strapi error:",
        strapiRes.status,
        JSON.stringify(strapiJson, null, 2),
      );

      return NextResponse.json(
        {
          error: extractStrapiErrorMessage(strapiJson),
          status: strapiRes.status,
          details: strapiJson,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      items: Array.isArray(strapiJson?.data) ? strapiJson.data : [],
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to fetch dealer orders";

    console.error("[dealer-orders][GET] route error:", error);

    const status = message === "Unauthorized" ? 401 : 500;

    return NextResponse.json({ error: message }, { status });
  }
}