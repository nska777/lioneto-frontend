import { NextRequest, NextResponse } from "next/server";

type Region = "ru" | "uz";

function normalizeCountry(value: string | null | undefined) {
  return (value || "").trim().toUpperCase();
}

function mapCountryToRegion(country: string): Region {
  return country === "RU" ? "ru" : "uz";
}

function getClientIp(req: NextRequest) {
  const xForwardedFor = req.headers.get("x-forwarded-for");
  if (xForwardedFor) {
    return xForwardedFor.split(",")[0]?.trim() || "";
  }

  const xRealIp = req.headers.get("x-real-ip");
  if (xRealIp) {
    return xRealIp.trim();
  }

  return "";
}

export async function GET(req: NextRequest) {
  const clientIp = getClientIp(req);

  try {
    const url = clientIp
      ? `https://api.country.is/${encodeURIComponent(clientIp)}`
      : "https://api.country.is/";

    const res = await fetch(url, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (!res.ok) {
      return NextResponse.json(
        {
          country: "",
          region: "uz",
          source: "fallback",
          error: `geo_http_${res.status}`,
        },
        { status: 200 },
      );
    }

    const data = (await res.json()) as { country?: string };
    const country = normalizeCountry(data?.country);
    const region = mapCountryToRegion(country);

    return NextResponse.json(
      {
        country,
        region,
        source: "country.is",
      },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      {
        country: "",
        region: "uz",
        source: "fallback",
        error: "geo_fetch_failed",
      },
      { status: 200 },
    );
  }
}