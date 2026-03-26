import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { APP_SESSION_COOKIE } from "@/app/lib/auth/config";
import { verifyPassword } from "@/app/lib/auth/password";
import { signSession } from "@/app/lib/auth/session";
import { findCustomerByPhone } from "@/app/lib/auth/strapi-users";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const phone = String(body?.phone || "").trim();
    const password = String(body?.password || "");

    if (!phone || !password) {
      return NextResponse.json(
        { error: "Телефон и пароль обязательны." },
        { status: 400 },
      );
    }

    const user = await findCustomerByPhone(phone);

    if (!user || !user.passwordHash) {
      return NextResponse.json(
        { error: "Неверный телефон или пароль." },
        { status: 401 },
      );
    }

    if (user.isActive === false) {
      return NextResponse.json(
        { error: "Аккаунт отключен." },
        { status: 403 },
      );
    }

    const ok = await verifyPassword(password, user.passwordHash);

    if (!ok) {
      return NextResponse.json(
        { error: "Неверный телефон или пароль." },
        { status: 401 },
      );
    }

    const sessionUser = {
      id: String(user.documentId || user.id),
      firstName: user.firstName ?? null,
      lastName: user.lastName ?? null,
      phone: user.phone ?? null,
      countryCode: user.countryCode ?? null,
    };

    const token = signSession(sessionUser);
    const cookieStore = await cookies();

    cookieStore.set(APP_SESSION_COOKIE, token, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });

    return NextResponse.json({ ok: true, user: sessionUser });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Ошибка входа.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}