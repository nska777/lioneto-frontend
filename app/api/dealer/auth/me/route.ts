import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import { cookies } from "next/headers";

const secretStr = process.env.DEALER_JWT_SECRET;

if (!secretStr) {
  throw new Error("DEALER_JWT_SECRET is required");
}

const SECRET = new TextEncoder().encode(secretStr);

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
        dealerId: payload.dealerId ?? null,
        login: payload.login ?? "",
        title: payload.title ?? "",
        email: payload.email ?? "",
        phone: payload.phone ?? "",
        city: payload.city ?? "",
        region: payload.region ?? "",
        roleLabel: payload.roleLabel ?? "",
        managerName: payload.managerName ?? "",
        mustChangePassword: Boolean(payload.mustChangePassword),
      },
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}