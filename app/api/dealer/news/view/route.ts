import { NextRequest, NextResponse } from "next/server";

type StrapiDealerNewsItem = {
  documentId?: string;
  viewsCount?: number;
};

type StrapiListResponse<T> = {
  data?: T[];
};

const STRAPI_URL =
  process.env.STRAPI_URL ||
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  "http://127.0.0.1:1337";

const STRAPI_TOKEN = process.env.STRAPI_API_TOKEN || "";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as { slug?: string } | null;
    const slug = body?.slug?.trim();

    if (!slug) {
      return NextResponse.json({ error: "slug is required" }, { status: 400 });
    }

    if (!STRAPI_TOKEN) {
      return NextResponse.json(
        { error: "STRAPI_API_TOKEN is not configured" },
        { status: 500 },
      );
    }

    const findParams = new URLSearchParams();
    findParams.set("filters[slug][$eq]", slug);
    findParams.set("pagination[pageSize]", "1");
    findParams.set("fields[0]", "viewsCount");
    findParams.set("status", "published");

    const findRes = await fetch(
      `${STRAPI_URL}/api/dealer-newses?${findParams.toString()}`,
      {
        method: "GET",
        headers: {
          Authorization: `Bearer ${STRAPI_TOKEN}`,
        },
        cache: "no-store",
      },
    );

    if (!findRes.ok) {
      const text = await findRes.text().catch(() => "");
      return NextResponse.json(
        { error: `Failed to find news item: ${text || findRes.status}` },
        { status: 500 },
      );
    }

    const findJson =
      (await findRes.json()) as StrapiListResponse<StrapiDealerNewsItem>;

    const item = findJson.data?.[0];

    if (!item?.documentId) {
      return NextResponse.json({ error: "News item not found" }, { status: 404 });
    }

    const nextViews =
      typeof item.viewsCount === "number" ? item.viewsCount + 1 : 1;

    const updateRes = await fetch(
      `${STRAPI_URL}/api/dealer-newses/${item.documentId}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${STRAPI_TOKEN}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          data: {
            viewsCount: nextViews,
          },
        }),
        cache: "no-store",
      },
    );

    if (!updateRes.ok) {
      const text = await updateRes.text().catch(() => "");
      return NextResponse.json(
        { error: `Failed to update viewsCount: ${text || updateRes.status}` },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      slug,
      viewsCount: nextViews,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Failed to update viewsCount",
      },
      { status: 500 },
    );
  }
}