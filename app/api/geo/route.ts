import { NextRequest, NextResponse } from "next/server";
import { isIP } from "node:net";

type Region = "ru" | "uz";

function normalizeCountry(value: string | null | undefined) {
  return (value || "").trim().toUpperCase();
}

function mapCountryToRegion(country: string): Region {
  return country === "RU" ? "ru" : "uz";
}

function cleanIp(raw: string) {
  let ip = raw.trim();

  if (!ip) return "";

  if (ip.includes(",")) {
    ip = ip.split(",")[0]?.trim() || "";
  }

  if (ip.startsWith("::ffff:")) {
    ip = ip.slice(7);
  }

  if (ip.startsWith("[") && ip.endsWith("]")) {
    ip = ip.slice(1, -1);
  }

  const ipv4WithPort = ip.match(/^(\d{1,3}(?:\.\d{1,3}){3}):\d+$/);
  if (ipv4WithPort) {
    ip = ipv4WithPort[1];
  }

  return ip;
}

function getClientIp(req: NextRequest) {
  const candidates = [
    req.headers.get("x-forwarded-for"),
    req.headers.get("x-real-ip"),
    req.headers.get("cf-connecting-ip"),
  ];

  for (const candidate of candidates) {
    const ip = cleanIp(candidate || "");
    if (ip && isIP(ip)) {
      return ip;
    }
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
          debug: {
            clientIp,
            xForwardedFor: req.headers.get("x-forwarded-for") || "",
            xRealIp: req.headers.get("x-real-ip") || "",
            cfConnectingIp: req.headers.get("cf-connecting-ip") || "",
          },
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
        debug: {
          clientIp,
        },
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
        debug: {
          clientIp,
          xForwardedFor: req.headers.get("x-forwarded-for") || "",
          xRealIp: req.headers.get("x-real-ip") || "",
          cfConnectingIp: req.headers.get("cf-connecting-ip") || "",
        },
      },
      { status: 200 },
    );
  }
}