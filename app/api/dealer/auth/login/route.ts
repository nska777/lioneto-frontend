import { NextResponse } from "next/server";
import { SignJWT } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.DEALER_JWT_SECRET || "dev_secret"
);

export async function POST(req: Request) {
  const body = await req.json();
  const { email, password } = body;

  // ТЕСТОВЫЙ дилер
  if (email !== "dealer@test.com" || password !== "123456") {
    return NextResponse.json(
      { error: "Invalid credentials" },
      { status: 401 }
    );
  }

  const token = await new SignJWT({ role: "dealer", email })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("1d")
    .sign(SECRET);

  const res = NextResponse.json({ success: true });

  res.cookies.set("dealer_token", token, {
    httpOnly: true,
    path: "/",
  });

  return res;
}