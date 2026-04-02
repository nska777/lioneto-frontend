import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

type DealerJwtPayload = {
  role?: string;
  login?: string;
};

type Region = "ru" | "uz";

const SECRET = new TextEncoder().encode(
  process.env.DEALER_JWT_SECRET || "dev_secret"
);

function getAdminLogins(): string[] {
  return (process.env.DEALER_ADMIN_LOGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function isPublicDealerRoute(pathname: string) {
  return (
    pathname === "/dealer/login" ||
    pathname === "/dealer/forgot-password" ||
    pathname === "/dealer/reset-password"
  );
}

function detectRegionFromHeaders(req: NextRequest): Region {
  const cfCountry = req.headers.get("cf-ipcountry")?.toUpperCase();
  const vercelCountry = req.headers.get("x-vercel-ip-country")?.toUpperCase();
  const forwardedCountry = req.headers
    .get("x-country-code")
    ?.toUpperCase();

  const country = cfCountry || vercelCountry || forwardedCountry || "";

  if (country === "RU") return "ru";
  return "uz";
}

function applyRegionCookie(req: NextRequest, res: NextResponse) {
  const manual = req.cookies.get("region_manual")?.value;
  const currentRegion = req.cookies.get("region")?.value;

  if (manual === "1") {
    return;
  }

  const detected = detectRegionFromHeaders(req);

  if (currentRegion !== detected) {
    res.cookies.set("region", detected, {
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
      sameSite: "lax",
    });
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isDealerRoute =
    pathname.startsWith("/dealer") || pathname.startsWith("/dealer-admin");

  if (!isDealerRoute) {
    const res = NextResponse.next();
    applyRegionCookie(req, res);
    return res;
  }

  if (isPublicDealerRoute(pathname)) {
    const res = NextResponse.next();
    applyRegionCookie(req, res);
    return res;
  }

  const token = req.cookies.get("dealer_token")?.value;

  if (!token) {
    const res = NextResponse.redirect(new URL("/dealer/login", req.url));
    applyRegionCookie(req, res);
    return res;
  }

  try {
    const verified = await jwtVerify(token, SECRET);
    const payload = verified.payload as DealerJwtPayload;

    if (payload.role !== "dealer") {
      const res = NextResponse.redirect(new URL("/dealer/login", req.url));
      applyRegionCookie(req, res);
      return res;
    }

    if (pathname.startsWith("/dealer-admin")) {
      const adminLogins = getAdminLogins();
      const login = typeof payload.login === "string" ? payload.login : "";

      if (!login || !adminLogins.includes(login)) {
        const res = NextResponse.redirect(new URL("/dealer/dashboard", req.url));
        applyRegionCookie(req, res);
        return res;
      }
    }

    const res = NextResponse.next();
    applyRegionCookie(req, res);
    return res;
  } catch {
    const res = NextResponse.redirect(new URL("/dealer/login", req.url));
    applyRegionCookie(req, res);
    return res;
  }
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
  ],
};