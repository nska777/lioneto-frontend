import { NextRequest, NextResponse } from "next/server";
import { STRAPI_URL } from "@/app/lib/auth/config";
import { getCurrentDealer } from "@/app/lib/get-current-dealer";
import type { KnowledgeFeedItem } from "@/app/lib/dealer/notes";

const STRAPI_TOKEN =
  process.env.STRAPI_DEALER_TOKEN ||
  process.env.STRAPI_API_TOKEN ||
  process.env.STRAPI_TOKEN ||
  "";

type StrapiNoteItem = {
  id?: number | string;
  documentId?: string;
  title?: string | null;
  slug?: string | null;
  excerpt?: string | null;
  content?: string | null;
  isActive?: boolean | null;
  dealerLogin?: string | null;
  dealerTitle?: string | null;
  viewsCount?: number | null;
  likesCount?: number | null;
  publishedAt?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
};

type StrapiSingleResponse<T> = {
  data?: T | null;
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

function canManageNote(
  dealerLogin?: string | null,
  dealerRole?: string | null,
  authorLogin?: string | null,
) {
  if (!dealerLogin) return false;
  if (dealerRole === "admin" || dealerRole === "owner") return true;
  return dealerLogin === authorLogin;
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

export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ documentId: string }> },
) {
  try {
    const { documentId } = await context.params;
    const dealer = await getCurrentDealer();

    const baseUrl = String(STRAPI_URL).replace(/\/$/, "");

    const existingRes = await fetch(
      `${baseUrl}/api/dealer-knowledge-notes/${documentId}`,
      {
        method: "GET",
        headers: getHeaders(),
        cache: "no-store",
      },
    );

    if (!existingRes.ok) {
      return NextResponse.json(
        { error: "Заметка не найдена" },
        { status: 404 },
      );
    }

    const existingJson =
      (await existingRes.json()) as StrapiSingleResponse<StrapiNoteItem>;
    const existing = existingJson.data;

    if (
      !existing ||
      !canManageNote(dealer?.login, dealer?.role, existing.dealerLogin)
    ) {
      return NextResponse.json(
        { error: "Недостаточно прав для редактирования заметки" },
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

    const slug =
      existing.slug?.trim() || `${slugifyTitle(title).slice(0, 70)}-${Date.now()}`;

    const updateRes = await fetch(
      `${baseUrl}/api/dealer-knowledge-notes/${documentId}`,
      {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({
          data: {
            title,
            slug,
            excerpt: excerpt || null,
            content,
          },
        }),
        cache: "no-store",
      },
    );

    const rawText = await updateRes.text();

    if (!updateRes.ok) {
      return NextResponse.json(
        { error: rawText || "Не удалось обновить заметку" },
        { status: 500 },
      );
    }

    const nowIso = new Date().toISOString();

    const post: KnowledgeFeedItem = {
      id: Number(existing.id ?? Date.now()),
      documentId,
      title,
      slug,
      excerpt: excerpt || null,
      content,
      kind: "note",
      label: existing.dealerTitle ?? dealer?.title ?? "Заметка дилера",
      tags: ["Заметка"],
      viewsCount: Number(existing.viewsCount ?? 0),
      likesCount: Number(existing.likesCount ?? 0),
      isActive: existing.isActive ?? true,
      isPinned: false,
      sortOrder: 0,
      publishedAt: existing.publishedAt ?? nowIso,
      createdAt: existing.createdAt ?? nowIso,
      updatedAt: nowIso,
      coverUrl: null,
      coverAlt: null,
      fileUrl: null,
      fileName: null,
      fileMime: null,
      fileExtensionLabel: null,
      downloadUrl: null,
      sourceType: "dealer_note",
      authorLogin: existing.dealerLogin ?? dealer?.login ?? null,
      authorTitle: existing.dealerTitle ?? dealer?.title ?? null,
    };

    return NextResponse.json({ ok: true, post });
  } catch {
    return NextResponse.json(
      { error: "Ошибка обновления заметки" },
      { status: 500 },
    );
  }
}