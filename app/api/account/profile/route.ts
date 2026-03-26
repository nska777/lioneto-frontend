import { NextResponse } from "next/server";
import { getSessionUser, signSession } from "@/app/lib/auth/session";
import { updateCustomerProfile } from "@/app/lib/auth/strapi-users";
import { cookies } from "next/headers";
import { APP_SESSION_COOKIE } from "@/app/lib/auth/config";

export async function PATCH(req: Request) {
  try {
    const sessionUser = await getSessionUser();

    if (!sessionUser) {
      return NextResponse.json({ error: "Не авторизован." }, { status: 401 });
    }

    const body = await req.json();
    const firstName = String(body?.firstName ?? "").trim();
    const lastName = String(body?.lastName ?? "").trim();

    const updated = await updateCustomerProfile(sessionUser.id, {
      firstName,
      lastName,
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Не удалось обновить профиль." },
        { status: 500 },
      );
    }

    const nextUser = {
      id: String(updated.documentId || updated.id),
      firstName: updated.firstName ?? null,
      lastName: updated.lastName ?? null,
      phone: updated.phone ?? null,
      countryCode: updated.countryCode ?? null,
    };

    const token = signSession(nextUser);
    const cookieStore = await cookies();

    cookieStore.set(APP_SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return NextResponse.json({ ok: true, user: nextUser });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Ошибка обновления профиля.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}