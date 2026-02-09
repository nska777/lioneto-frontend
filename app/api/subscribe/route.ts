// app/api/subscribe/route.ts
import { NextResponse } from "next/server";

const STRAPI_URL =
  process.env.STRAPI_URL || process.env.NEXT_PUBLIC_STRAPI_URL || "";

// ❗ если страпи нет — просто НИЧЕГО НЕ ДЕЛАЕМ
const STRAPI_DISABLED =
  !STRAPI_URL ||
  STRAPI_URL.includes("localhost") ||
  STRAPI_URL.includes("127.0.0.1") ||
  STRAPI_URL.includes("0.0.0.0");

export async function POST(req: Request) {
  if (STRAPI_DISABLED) {
    // ✅ важно: НЕ fetch, НЕ error, просто ок
    return NextResponse.json({ ok: true });
  }

  try {
    const body = await req.json();

    await fetch(`${STRAPI_URL}/api/subscribers`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        data: {
          email: body.email,
        },
      }),
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true });
  }
}
