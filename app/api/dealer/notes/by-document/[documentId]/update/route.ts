import { NextRequest, NextResponse } from "next/server";
import { STRAPI_URL } from "@/app/lib/auth/config";
import { getCurrentDealer } from "@/app/lib/get-current-dealer";
import { canDealerCreateKnowledgeNote } from "@/app/lib/dealer/knowledge-access";
import type { KnowledgeFeedItem } from "@/app/lib/dealer/notes";

const STRAPI_TOKEN =
  process.env.STRAPI_DEALER_TOKEN ||
  process.env.STRAPI_API_TOKEN ||
  process.env.STRAPI_TOKEN ||
  "";

type StrapiCreateResponse = {
  data?: {
    id?: number | string;
    documentId?: string;
    publishedAt?: string | null;
    createdAt?: string | null;
    updatedAt?: string | null;
  };
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
        { status: 403 },
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
        { status: 400 },
      );
    }

    if (!content) {
      return NextResponse.json(
        { error: "Добавьте текст заметки" },
        { status: 400 },
      );
    }

    const slug = `${slugifyTitle(title).slice(0, 70)}-${Date.now()}`;
    const baseUrl = String(STRAPI_URL).replace(/\/$/, "");

    const createRes = await fetch(
      `${baseUrl}/api/dealer-knowledge-notes?status=published`,
      {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({
          data: {
            title,
            slug,
            excerpt: excerpt || null,
            content,
            isActive: true,
            dealerLogin: dealer?.login ?? "",
            dealerTitle: dealer?.title ?? "",
            viewsCount: 0,
            likesCount: 0,
          },
        }),
        cache: "no-store",
      },
    );

    const rawText = await createRes.text();

    if (!createRes.ok) {
      return NextResponse.json(
        {
          error: rawText || "Не удалось создать заметку",
        },
        { status: 500 },
      );
    }

    const json = rawText ? (JSON.parse(rawText) as StrapiCreateResponse) : null;
    const item = json?.data;
    const nowIso = new Date().toISOString();

    const post: KnowledgeFeedItem = {
      id: Number(item?.id ?? Date.now()),
      documentId: item?.documentId ?? "",
      title,
      slug,
      excerpt: excerpt || null,
      content,
      kind: "note",
      label: dealer?.title ?? "Заметка дилера",
      tags: ["Заметка"],
      viewsCount: 0,
      likesCount: 0,
      isActive: true,
      isPinned: false,
      sortOrder: 0,
      publishedAt: item?.publishedAt ?? nowIso,
      createdAt: item?.createdAt ?? nowIso,
      updatedAt: item?.updatedAt ?? nowIso,
      coverUrl: null,
      coverAlt: null,
      fileUrl: null,
      fileName: null,
      fileMime: null,
      fileExtensionLabel: null,
      downloadUrl: null,
      sourceType: "dealer_note",
      authorLogin: dealer?.login ?? null,
      authorTitle: dealer?.title ?? null,
    };

    return NextResponse.json({ ok: true, post });
  } catch {
    return NextResponse.json(
      { error: "Ошибка создания заметки" },
      { status: 500 },
    );
  }
}