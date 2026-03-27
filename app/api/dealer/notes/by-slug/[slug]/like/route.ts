import { NextRequest, NextResponse } from "next/server";
import { STRAPI_URL } from "@/app/lib/auth/config";

const STRAPI_TOKEN =
  process.env.STRAPI_DEALER_TOKEN ||
  process.env.STRAPI_API_TOKEN ||
  process.env.STRAPI_TOKEN ||
  "";

type StrapiNoteRaw = {
  documentId?: string;
  likesCount?: number | null;
};

type StrapiListResponse<T> = {
  data?: T[];
};

function getHeaders(): Record<string, string> {
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
  context: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await context.params;
    const baseUrl = String(STRAPI_URL).replace(/\/$/, "");

    const findRes = await fetch(
      `${baseUrl}/api/dealer-knowledge-notes?filters[slug][$eq]=${encodeURIComponent(
        slug
      )}&fields[0]=likesCount&fields[1]=documentId&pagination[pageSize]=1&status=published`,
      {
        method: "GET",
        headers: getHeaders(),
        cache: "no-store",
      }
    );

    if (!findRes.ok) {
      return NextResponse.json(
        { error: "Не удалось найти заметку" },
        { status: 500 }
      );
    }

    const findJson =
      (await findRes.json()) as StrapiListResponse<StrapiNoteRaw>;
    const item = Array.isArray(findJson.data) ? findJson.data[0] : null;

    if (!item?.documentId) {
      return NextResponse.json({ error: "Заметка не найдена" }, { status: 404 });
    }

    const nextLikes = Number(item.likesCount ?? 0) + 1;

    const updateRes = await fetch(
      `${baseUrl}/api/dealer-knowledge-notes/${item.documentId}`,
      {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({
          data: {
            likesCount: nextLikes,
          },
        }),
        cache: "no-store",
      }
    );

    if (!updateRes.ok) {
      return NextResponse.json(
        { error: "Не удалось обновить лайки" },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, likesCount: nextLikes });
  } catch {
    return NextResponse.json(
      { error: "Ошибка обновления лайков" },
      { status: 500 }
    );
  }
}