import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretStr = process.env.DEALER_JWT_SECRET;

if (!secretStr) {
  throw new Error("DEALER_JWT_SECRET is required");
}

const SECRET = new TextEncoder().encode(secretStr);

type DealerRole = "dealer" | "admin" | "owner";

function normalizeRole(value: unknown): DealerRole | "" {
  if (value === "dealer" || value === "admin" || value === "owner") {
    return value;
  }

  return "";
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
        login: typeof payload.login === "string" ? payload.login : "",
        title: typeof payload.title === "string" ? payload.title : "",
        email: typeof payload.email === "string" ? payload.email : "",
        phone: typeof payload.phone === "string" ? payload.phone : "",
        city: typeof payload.city === "string" ? payload.city : "",
        region: typeof payload.region === "string" ? payload.region : "",
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