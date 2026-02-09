// app/api/prices/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const STRAPI = process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

export async function GET() {
  try {
    // ✅ В Strapi v4/v5 обычно так:
    // /api/price-entries?populate=cardImage
    const url = `${STRAPI}/api/price-entries?populate=cardImage`;

    const res = await fetch(url, { cache: "no-store" });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json({ data: [], error: { status: res.status, text } }, { status: 200 });
    }

    const json = await res.json();

    // Strapi возвращает { data: [...] }
    const data = Array.isArray(json?.data) ? json.data : [];

    // Отдаём “плоский” массив, как ты уже показывал в примере
    // (у тебя уже было плоско — оставляем совместимо)
    return NextResponse.json({ data }, { status: 200 });
  } catch (e: any) {
    return NextResponse.json({ data: [], error: { message: String(e?.message ?? e) } }, { status: 200 });
  }
}
