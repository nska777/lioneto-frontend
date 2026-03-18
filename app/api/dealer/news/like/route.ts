import { NextRequest, NextResponse } from "next/server";

type StrapiDealerNewsItem = {
  id: number;
  documentId?: string;
  slug?: string;
  likesCount?: number | null;
  publishedAt?: string | null;
};

type StrapiListResponse<T> = {
  data?: T[];
};

const STRAPI_URL =
  process.env.STRAPI_URL ||
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  "http://localhost:1337";

const STRAPI_API_TOKEN = process.env.STRAPI_API_TOKEN;

export async function POST(req: NextRequest) {
  try {
    if (!STRAPI_API_TOKEN) {
      return NextResponse.json(
        {
          error: "STRAPI_API_TOKEN is required",
          debug: {
            step: "missing-token",
            strapiUrl: STRAPI_URL,
          },
        },
        { status: 500 }
      );
    }

    const body = (await req.json()) as { slug?: string };
    const slug = typeof body.slug === "string" ? body.slug.trim() : "";

    if (!slug) {
      return NextResponse.json(
        {
          error: "slug is required",
          debug: {
            step: "invalid-body",
            body,
          },
        },
        { status: 400 }
      );
    }

    const findUrl =
      `${STRAPI_URL}/api/dealer-newses` +
      `?filters[slug][$eq]=${encodeURIComponent(slug)}` +
      `&pagination[pageSize]=1` +
      `&fields[0]=slug` +
      `&fields[1]=likesCount` +
      `&fields[2]=publishedAt` +
      `&status=published`;

    const findRes = await fetch(findUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${STRAPI_API_TOKEN}`,
      },
      cache: "no-store",
    });

    const findText = await findRes.text();

    if (!findRes.ok) {
      return NextResponse.json(
        {
          error: "Failed to find dealer news",
          debug: {
            step: "find-failed",
            strapiUrl: STRAPI_URL,
            slug,
            findUrl,
            findStatus: findRes.status,
            findOk: findRes.ok,
            findText,
          },
        },
        { status: 500 }
      );
    }

    let findJson: StrapiListResponse<StrapiDealerNewsItem> | null = null;

    try {
      findJson = JSON.parse(findText) as StrapiListResponse<StrapiDealerNewsItem>;
    } catch {
      return NextResponse.json(
        {
          error: "Invalid Strapi JSON while finding dealer news",
          debug: {
            step: "find-json-parse-failed",
            slug,
            findText,
          },
        },
        { status: 500 }
      );
    }

    const item = Array.isArray(findJson?.data) ? findJson.data[0] : undefined;

    if (!item?.documentId) {
      return NextResponse.json(
        {
          error: "Dealer news not found",
          debug: {
            step: "news-not-found",
            slug,
            findJson,
          },
        },
        { status: 404 }
      );
    }

    const nextLikesCount = Math.max(0, Number(item.likesCount ?? 0) + 1);

    const updateUrl = `${STRAPI_URL}/api/dealer-newses/${item.documentId}`;

    const updateRes = await fetch(updateUrl, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${STRAPI_API_TOKEN}`,
      },
      body: JSON.stringify({
        data: {
          likesCount: nextLikesCount,
        },
      }),
      cache: "no-store",
    });

    const updateText = await updateRes.text();

    if (!updateRes.ok) {
      return NextResponse.json(
        {
          error: "Failed to update likesCount",
          debug: {
            step: "update-failed",
            strapiUrl: STRAPI_URL,
            slug,
            nextLikesCount,
            updateUrl,
            updateStatus: updateRes.status,
            updateOk: updateRes.ok,
            updateText,
          },
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      slug,
      likesCount: nextLikesCount,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Unexpected error",
        debug: {
          step: "unexpected-error",
          message: error instanceof Error ? error.message : "Unknown error",
        },
      },
      { status: 500 }
    );
  }
}