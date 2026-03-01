import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.DEALER_JWT_SECRET || "dev_secret"
);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // ❗ НЕ защищаем login страницу
  if (pathname.startsWith("/dealer/login")) {
    return NextResponse.next();
  }

  // Защищаем только dealer раздел
  if (!pathname.startsWith("/dealer")) {
    return NextResponse.next();
  }

  const token = req.cookies.get("dealer_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/dealer/login", req.url));
  }

  try {
    await jwtVerify(token, SECRET);
    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/dealer/login", req.url));
  }
}

export const config = {
  matcher: ["/dealer/:path*"],
};