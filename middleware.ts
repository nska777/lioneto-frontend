import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

type DealerJwtPayload = {
  role?: string;
  login?: string;
};

const SECRET = new TextEncoder().encode(
  process.env.DEALER_JWT_SECRET || "dev_secret"
);

function getAdminLogins(): string[] {
  return (process.env.DEALER_ADMIN_LOGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith("/dealer/login")) {
    return NextResponse.next();
  }

  if (
    !pathname.startsWith("/dealer") &&
    !pathname.startsWith("/dealer-admin")
  ) {
    return NextResponse.next();
  }

  const token = req.cookies.get("dealer_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/dealer/login", req.url));
  }

  try {
    const verified = await jwtVerify(token, SECRET);
    const payload = verified.payload as DealerJwtPayload;

    if (payload.role !== "dealer") {
      return NextResponse.redirect(new URL("/dealer/login", req.url));
    }

    if (pathname.startsWith("/dealer-admin")) {
      const adminLogins = getAdminLogins();
      const login = typeof payload.login === "string" ? payload.login : "";

      if (!login || !adminLogins.includes(login)) {
        return NextResponse.redirect(new URL("/dealer/dashboard", req.url));
      }
    }

    return NextResponse.next();
  } catch {
    return NextResponse.redirect(new URL("/dealer/login", req.url));
  }
}

export const config = {
  matcher: ["/dealer/:path*", "/dealer-admin/:path*"],
};