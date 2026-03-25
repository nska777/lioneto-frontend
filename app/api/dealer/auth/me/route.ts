import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretStr = process.env.DEALER_JWT_SECRET;

if (!secretStr) {
  throw new Error("DEALER_JWT_SECRET is required");
}

const SECRET = new TextEncoder().encode(secretStr);

type DealerRole = "dealer" | "admin" | "owner";
type DealerCountryCode = "RU" | "UZ" | "KZ" | "TJ" | "KG" | "AM" | "BY" | "AZ";

function normalizeRole(value: unknown): DealerRole | "" {
  if (value === "dealer" || value === "admin" || value === "owner") {
    return value;
  }

  return "";
}

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

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("dealer_token")?.value;

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { payload } = await jwtVerify(token, SECRET);

    return NextResponse.json({
      dealer: {
        dealerId: typeof payload.dealerId === "number" ? payload.dealerId : null,
        documentId:
          typeof payload.documentId === "string" ? payload.documentId : "",
        login: typeof payload.login === "string" ? payload.login : "",
        title: typeof payload.title === "string" ? payload.title : "",
        email: typeof payload.email === "string" ? payload.email : "",
        phone: typeof payload.phone === "string" ? payload.phone : "",
        city: typeof payload.city === "string" ? payload.city : "",
        address: typeof payload.address === "string" ? payload.address : "",
        region: typeof payload.region === "string" ? payload.region : "",
        countryCode: normalizeCountryCode(payload.countryCode),
        role: normalizeRole(payload.role),
        managerName:
          typeof payload.managerName === "string" ? payload.managerName : "",
        mustChangePassword: Boolean(payload.mustChangePassword),
      },
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}