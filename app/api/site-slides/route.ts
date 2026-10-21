import { NextRequest, NextResponse } from "next/server";

const STRAPI_URL = (
  process.env.STRAPI_URL ||
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  "https://lioneto-cms.ru"
).replace(/\/$/, "");

export async function GET(request: NextRequest) {
  try {
    const placement =
      request.nextUrl.searchParams.get("placement")?.trim() || "home";

    const params = new URLSearchParams();

    params.set("filters[placement][$eq]", placement);
    params.set("filters[isActive][$eq]", "true");
    params.set("populate", "image");
    params.set("sort", "sortOrder:asc");
    params.set("pagination[pageSize]", "100");

    const url = `${STRAPI_URL}/api/site-slides?${params.toString()}`;

    const response = await fetch(url, {
      cache: "no-store",
    });

    if (!response.ok) {
      const body = await response.text().catch(() => "");

      return NextResponse.json(
        {
          data: [],
          error: `Strapi returned ${response.status}`,
          details: body,
        },
        { status: 200 },
      );
    }

    const json = await response.json();

    return NextResponse.json(json);
  } catch (error) {
    console.error("[site-slides]", error);

    return NextResponse.json(
      {
        data: [],
        error: "Failed to load site slides",
      },
      { status: 200 },
    );
  }
}
