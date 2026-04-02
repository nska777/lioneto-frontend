import { NextResponse } from "next/server";

function normalizeCountry(v: string | null): string {
  return (v || "").trim().toUpperCase();
}

function resolveCountry(req: Request) {
  const cfCountry = normalizeCountry(req.headers.get("cf-ipcountry"));
  const vercelCountry = normalizeCountry(
    req.headers.get("x-vercel-ip-country")
  );
  const forwardedCountry = normalizeCountry(req.headers.get("x-country-code"));

  const country = cfCountry || vercelCountry || forwardedCountry || "";

  return {
    country,
    cfCountry,
    vercelCountry,
    forwardedCountry,
  };
}

export async function GET(req: Request) {
  const { country, cfCountry, vercelCountry, forwardedCountry } =
    resolveCountry(req);

  const region = country === "RU" ? "ru" : "uz";

  return NextResponse.json(
    {
      country,
      region,
      debug: {
        cfCountry,
        vercelCountry,
        forwardedCountry,
      },
    },
    { status: 200 }
  );
}