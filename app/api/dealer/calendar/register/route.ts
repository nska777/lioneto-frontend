import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";
import nodemailer from "nodemailer";

import { getDealerCalendarEventById } from "@/app/lib/dealer/calendar";

type DealerRole = "dealer" | "admin" | "owner";

type DealerSessionPayload = {
  role?: DealerRole;
  dealerId?: number;
  dealerDocumentId?: string;
  title?: string;
  slug?: string;
  email?: string;
  phone?: string;
  city?: string;
  region?: string;
  login?: string;
};

type RegisterBody = {
  eventId?: string;
  employees?: string[];
  comment?: string;
};

const STRAPI_URL =
  process.env.STRAPI_URL ||
  process.env.NEXT_PUBLIC_STRAPI_URL ||
  "http://localhost:1337";

const STRAPI_TOKEN =
  process.env.STRAPI_DEALER_TOKEN ||
  process.env.STRAPI_API_TOKEN ||
  "";

const DEALER_JWT_SECRET = process.env.DEALER_JWT_SECRET || "";

const CALENDAR_REQUEST_TO_EMAIL =
  process.env.CALENDAR_REQUEST_TO_EMAIL ||
  process.env.DEALER_REQUEST_TO_EMAIL ||
  process.env.SMTP_TO_EMAIL ||
  "";

const COOKIE_CANDIDATES = [
  "dealer_token",
  "dealer_auth",
  "dealer_session",
  "dealer_jwt",
];

function getJwtSecret(): Uint8Array {
  if (!DEALER_JWT_SECRET) {
    throw new Error("DEALER_JWT_SECRET is required");
  }

  return new TextEncoder().encode(DEALER_JWT_SECRET);
}

async function getDealerFromCookies(): Promise<DealerSessionPayload | null> {
  const cookieStore = await cookies();

  for (const cookieName of COOKIE_CANDIDATES) {
    const token = cookieStore.get(cookieName)?.value;

    if (!token) continue;

    try {
      const verified = await jwtVerify(token, getJwtSecret());
      const payload = verified.payload as DealerSessionPayload;

      if (payload?.role) {
        return payload;
      }
    } catch {
      // ignore
    }
  }

  return null;
}

function normalizeEmployees(value: unknown): string[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => (typeof item === "string" ? item.trim() : ""))
    .filter(Boolean);
}

function formatDateLabel(dateISO?: string, time?: string): string {
  if (!dateISO) return "Дата не указана";

  const date = new Date(`${dateISO}T00:00:00`);
  const formatted = new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);

  return time ? `${formatted} в ${time}` : formatted;
}

async function createCalendarRequestInStrapi(params: {
  dealer: DealerSessionPayload;
  eventTitle: string;
  eventDate: string;
  eventSlug: string;
  employees: string[];
  comment: string;
}) {
  if (!STRAPI_TOKEN) {
    throw new Error("STRAPI token is missing");
  }

  const { dealer, eventTitle, eventDate, eventSlug, employees, comment } = params;

  const payload = {
    data: {
      calendarEventTitle: eventTitle,
      calendarEventDate: eventDate,
      dealerTitle: dealer.title || dealer.slug || "Дилер",
      dealerEmail: dealer.email || "",
      dealerPhone: dealer.phone || "",
      dealerRef: dealer.dealerDocumentId || "",
      employees: employees.join("\n"),
      comment,
      requestStatus: "new",
      calendarEventSlug: eventSlug,
      dealerAccountLogin: dealer.login || "",
    },
  };

  const response = await fetch(`${STRAPI_URL}/api/dealer-calendar-requests`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${STRAPI_TOKEN}`,
    },
    body: JSON.stringify(payload),
    cache: "no-store",
  });

  const text = await response.text();

  if (!response.ok) {
    throw new Error(`Failed to create request in Strapi: ${response.status} ${text}`);
  }

  try {
    return JSON.parse(text) as unknown;
  } catch {
    return text;
  }
}

async function sendCalendarRequestEmail(params: {
  dealer: DealerSessionPayload;
  eventTitle: string;
  eventDateLabel: string;
  employees: string[];
  comment: string;
}) {
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const from =
    process.env.SMTP_FROM ||
    process.env.SMTP_USER ||
    "no-reply@lioneto.local";

  if (!host || !user || !pass || !CALENDAR_REQUEST_TO_EMAIL) {
    return {
      sent: false,
      reason: "SMTP is not configured",
    };
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: {
      user,
      pass,
    },
  });

  const { dealer, eventTitle, eventDateLabel, employees, comment } = params;

  const employeeLines = employees.map((name, index) => `${index + 1}. ${name}`).join("\n");

  const subject = `Новая заявка на обучение — ${dealer.title || "Дилер"}`;

  const text = [
    "Новая заявка из дилерского календаря",
    "",
    `Дилер: ${dealer.title || "Не указан"}`,
    `Email: ${dealer.email || "Не указан"}`,
    `Телефон: ${dealer.phone || "Не указан"}`,
    `Логин: ${dealer.login || "Не указан"}`,
    `Город: ${dealer.city || "Не указан"}`,
    `Регион: ${dealer.region || "Не указан"}`,
    "",
    `Событие: ${eventTitle}`,
    `Дата: ${eventDateLabel}`,
    "",
    "Сотрудники:",
    employeeLines || "Не указаны",
    "",
    "Комментарий:",
    comment || "—",
  ].join("\n");

  await transporter.sendMail({
    from,
    to: CALENDAR_REQUEST_TO_EMAIL,
    replyTo: dealer.email || undefined,
    subject,
    text,
  });

  return {
    sent: true,
  };
}

export async function POST(request: NextRequest) {
  try {
    const dealer = await getDealerFromCookies();

    if (!dealer) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized dealer" },
        { status: 401 }
      );
    }

    const body = (await request.json()) as RegisterBody;
    const eventId = typeof body.eventId === "string" ? body.eventId.trim() : "";
    const employees = normalizeEmployees(body.employees);
    const comment =
      typeof body.comment === "string" ? body.comment.trim() : "";

    if (!eventId) {
      return NextResponse.json(
        { ok: false, error: "eventId is required" },
        { status: 400 }
      );
    }

    if (employees.length === 0) {
      return NextResponse.json(
        { ok: false, error: "Укажите хотя бы одного сотрудника" },
        { status: 400 }
      );
    }

    const event = await getDealerCalendarEventById(eventId);

    if (!event || !event.isActive) {
      return NextResponse.json(
        { ok: false, error: "Событие не найдено" },
        { status: 404 }
      );
    }

    if (
      !["training", "webinar"].includes(event.type) ||
      !event.isRegistrationOpen
    ) {
      return NextResponse.json(
        { ok: false, error: "Подача заявок для этого события закрыта" },
        { status: 400 }
      );
    }

    await createCalendarRequestInStrapi({
      dealer,
      eventTitle: event.title,
      eventDate: event.dateISO,
      eventSlug: event.slug,
      employees,
      comment,
    });

    const emailResult = await sendCalendarRequestEmail({
      dealer,
      eventTitle: event.title,
      eventDateLabel: formatDateLabel(event.dateISO, event.time),
      employees,
      comment,
    });

    return NextResponse.json({
      ok: true,
      message: "Заявка отправлена",
      emailSent: emailResult.sent,
      emailReason: emailResult.sent ? null : emailResult.reason,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      {
        ok: false,
        error: "Failed to register for calendar event",
        details: message,
      },
      { status: 500 }
    );
  }
}