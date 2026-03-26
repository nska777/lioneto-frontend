import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { APP_SESSION_COOKIE } from "@/app/lib/auth/config";
import { hashPassword } from "@/app/lib/auth/password";
import { signSession } from "@/app/lib/auth/session";
import { createCustomer, findCustomerByPhone } from "@/app/lib/auth/strapi-users";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const firstName = String(body?.firstName || "").trim();
    const lastName = String(body?.lastName || "").trim();
    const countryCode = String(body?.countryCode || "").trim();
    const phone = String(body?.phone || "").trim();
    const password = String(body?.password || "");

    if (!firstName || !lastName || !countryCode || !phone || !password) {
      return NextResponse.json(
        { error: "Заполните все обязательные поля." },
        { status: 400 },
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "Пароль должен быть не короче 6 символов." },
        { status: 400 },
      );
    }

    const existing = await findCustomerByPhone(phone);
    if (existing) {
      return NextResponse.json(
        { error: "Пользователь с таким номером уже существует." },
        { status: 409 },
      );
    }

    const passwordHash = await hashPassword(password);

    const created = await createCustomer({
      firstName,
      lastName,
      countryCode,
      phone,
      passwordHash,
    });

    if (!created) {
      return NextResponse.json(
        { error: "Не удалось создать аккаунт." },
        { status: 500 },
      );
    }

    const sessionUser = {
      id: String(created.documentId || created.id),
      firstName: created.firstName ?? null,
      lastName: created.lastName ?? null,
      phone: created.phone ?? null,
      countryCode: created.countryCode ?? null,
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
    const message =
      error instanceof Error ? error.message : "Ошибка регистрации.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}