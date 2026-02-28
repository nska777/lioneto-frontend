// app/api/prices/route.ts
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

const STRAPI =
  process.env.NEXT_PUBLIC_STRAPI_URL || "http://localhost:1337";

type StrapiResponse<T = unknown> = {
  data?: T;
  error?: unknown;
};

export async function GET() {
  try {
    const url = `${STRAPI}/api/price-entries?populate=cardImage`;

    const res = await fetch(url, { cache: "no-store" });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      return NextResponse.json(
        { data: [], error: { status: res.status, text } },
        { status: 200 },
      );
    }

    const json = (await res.json()) as StrapiResponse<unknown[]>;

    const data = Array.isArray(json?.data) ? json.data : [];


    return NextResponse.json({ data }, { status: 200 });
  } catch (e: unknown) {
    const message =
      e instanceof Error ? e.message : String(e);

    return NextResponse.json(
      { data: [], error: { message } },
      { status: 200 },
    );
  }
}