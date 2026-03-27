import { NextRequest, NextResponse } from "next/server";
import { STRAPI_URL } from "@/app/lib/auth/config";

const STRAPI_TOKEN =
  process.env.STRAPI_DEALER_TOKEN ||
  process.env.STRAPI_API_TOKEN ||
  process.env.STRAPI_TOKEN ||
  "";

type StrapiKnowledgePostRaw = {
  id: number;
  likesCount?: number | null;
};

type StrapiListResponse<T> = {
  data?: T[];
};

function getHeaders() {
  return STRAPI_TOKEN
    ? {
        Authorization: `Bearer ${STRAPI_TOKEN}`,
        "Content-Type": "application/json",
      }
    : {
        "Content-Type": "application/json",
      };
}

export async function POST(
  _req: NextRequest,
  context: { params: Promise<{ slug: string }> },
) {
  try {
    const { slug } = await context.params;

    const findRes = await fetch(
      `${String(STRAPI_URL).replace(/\/$/, "")}/api/dealer-knowledge-posts?filters[slug][$eq]=${encodeURIComponent(
        slug,
      )}&fields[0]=likesCount&pagination[pageSize]=1&status=published`,
      {
        method: "GET",
        headers: getHeaders(),
        cache: "no-store",
      },
    );

    if (!findRes.ok) {
      return NextResponse.json(
        { error: "Не удалось найти запись" },
        { status: 500 },
      );
    }

    const findJson =
      (await findRes.json()) as StrapiListResponse<StrapiKnowledgePostRaw>;
    const item = Array.isArray(findJson.data) ? findJson.data[0] : null;

    if (!item?.id) {
      return NextResponse.json({ error: "Запись не найдена" }, { status: 404 });
    }

    const nextLikes = (item.likesCount ?? 0) + 1;

    const updateRes = await fetch(
      `${String(STRAPI_URL).replace(/\/$/, "")}/api/dealer-knowledge-posts/${item.id}`,
      {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({
          data: {
            likesCount: nextLikes,
          },
        }),
        cache: "no-store",
      },
    );

    if (!updateRes.ok) {
      return NextResponse.json(
        { error: "Не удалось обновить лайки" },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, likesCount: nextLikes });
  } catch {
    return NextResponse.json(
      { error: "Ошибка обновления лайков" },
      { status: 500 },
    );
  }
}