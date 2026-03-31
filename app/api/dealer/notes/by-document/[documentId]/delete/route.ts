import { NextRequest, NextResponse } from "next/server";
import { STRAPI_URL } from "@/app/lib/auth/config";
import { getCurrentDealer } from "@/app/lib/get-current-dealer";

const STRAPI_TOKEN =
  process.env.STRAPI_DEALER_TOKEN ||
  process.env.STRAPI_API_TOKEN ||
  process.env.STRAPI_TOKEN ||
  "";

type StrapiNoteItem = {
  documentId?: string;
  dealerLogin?: string | null;
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

export async function DELETE(
  _req: NextRequest,
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
        { error: "Недостаточно прав для удаления заметки" },
        { status: 403 },
      );
    }

    const deleteRes = await fetch(
      `${baseUrl}/api/dealer-knowledge-notes/${documentId}`,
      {
        method: "DELETE",
        headers: getHeaders(),
        cache: "no-store",
      },
    );

    const rawText = await deleteRes.text();

    if (!deleteRes.ok) {
      return NextResponse.json(
        { error: rawText || "Не удалось удалить заметку" },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE NOTE ROUTE ERROR:", error);

    return NextResponse.json(
      { error: "Ошибка удаления заметки" },
      { status: 500 },
    );
  }
}