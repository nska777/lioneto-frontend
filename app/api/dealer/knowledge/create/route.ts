import { NextRequest, NextResponse } from "next/server";
import { STRAPI_URL } from "@/app/lib/auth/config";
import { getCurrentDealer } from "@/app/lib/get-current-dealer";
import { canDealerCreateKnowledgeNote } from "@/app/lib/dealer/knowledge-access";

const STRAPI_TOKEN =
  process.env.STRAPI_DEALER_TOKEN ||
  process.env.STRAPI_API_TOKEN ||
  process.env.STRAPI_TOKEN ||
  "";

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

function slugifyTitle(value: string) {
  const cleaned = value
    .toLowerCase()
    .trim()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9а-яё\s-]/gi, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");

  const latinOnly = cleaned.replace(/[^a-z0-9-]/gi, "").trim();

  return latinOnly || "note";
}

export async function POST(req: NextRequest) {
  try {
    const dealer = await getCurrentDealer();

    if (!canDealerCreateKnowledgeNote(dealer?.login)) {
      return NextResponse.json(
        { error: "Недостаточно прав для создания заметки" },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => null);

    const title = typeof body?.title === "string" ? body.title.trim() : "";
    const excerpt =
      typeof body?.excerpt === "string" ? body.excerpt.trim() : "";
    const content =
      typeof body?.content === "string" ? body.content.trim() : "";

    if (!title) {
      return NextResponse.json(
        { error: "Укажите заголовок заметки" },
        { status: 400 }
      );
    }

    if (!content) {
      return NextResponse.json(
        { error: "Добавьте текст заметки" },
        { status: 400 }
      );
    }

    const baseUrl = String(STRAPI_URL).replace(/\/$/, "");
    const slug = `${slugifyTitle(title).slice(0, 60)}-${Date.now()}`;
    const nowIso = new Date().toISOString();

    const createRes = await fetch(
      `${baseUrl}/api/dealer-knowledge-posts?status=published`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          data: {
            title,
            slug,
            excerpt: excerpt || null,
            content,
            type: "note",
            isActive: true,
            isPinned: false,
            likesCount: 0,
            viewsCount: 0,
            sortOrder: 0,
            label: dealer?.title || dealer?.login || null,
            tagsText: JSON.stringify(["Заметка"]),
          },
        }),
        cache: "no-store",
      }
    );

    if (!createRes.ok) {
      const text = await createRes.text();
      console.error("KNOWLEDGE CREATE ERROR:", text);

      return NextResponse.json(
        { error: "Не удалось создать заметку" },
        { status: 500 }
      );
    }

    const createJson = await createRes.json();
    const item = createJson?.data;

    return NextResponse.json({
      ok: true,
      post: {
        id: Number(item?.id ?? Date.now()),
        documentId:
          typeof item?.documentId === "string" ? item.documentId : null,
        title,
        slug,
        excerpt: excerpt || null,
        content,
        kind: "note",
        label: dealer?.title || dealer?.login || null,
        tags: ["Заметка"],
        viewsCount: 0,
        likesCount: 0,
        isActive: true,
        isPinned: false,
        sortOrder: 0,
        publishedAt:
          typeof item?.publishedAt === "string" ? item.publishedAt : nowIso,
        createdAt:
          typeof item?.createdAt === "string" ? item.createdAt : nowIso,
        updatedAt:
          typeof item?.updatedAt === "string" ? item.updatedAt : nowIso,
        coverUrl: null,
        coverAlt: null,
        fileUrl: null,
        fileName: null,
        fileMime: null,
        fileExtensionLabel: null,
        downloadUrl: null,
      },
    });
  } catch (error) {
    console.error("KNOWLEDGE CREATE ROUTE ERROR:", error);

    return NextResponse.json(
      { error: "Ошибка создания заметки" },
      { status: 500 }
    );
  }
}