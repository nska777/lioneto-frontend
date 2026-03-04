import { NextResponse } from "next/server";

function normalizeCountry(v: string | null): string {
  return (v || "").trim().toUpperCase();
}

export async function GET(req: Request) {
  const country = normalizeCountry(req.headers.get("cf-ipcountry"));

  // Cloudflare иногда может дать "T1" (Tor) или пусто — в этом случае считаем НЕ RU.
  const region = country === "RU" ? "ru" : "uz";

  return NextResponse.json({ country, region }, { status: 200 });
}