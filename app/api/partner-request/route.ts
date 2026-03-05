import { NextResponse } from "next/server";

function esc(s: string) {
  return s.replace(/[<>&]/g, (c) => {
    if (c === "<") return "&lt;";
    if (c === ">") return "&gt;";
    return "&amp;";
  });
}

type Body = {
  name?: unknown;
  phone?: unknown;
  company?: unknown;
  city?: unknown;
  contactMethod?: unknown;
  comment?: unknown;
  formats?: unknown;
  interests?: unknown;
};

function isString(x: unknown): x is string {
  return typeof x === "string";
}

function asString(x: unknown): string {
  return isString(x) ? x : "";
}

function asStringArray(x: unknown): string[] {
  if (!Array.isArray(x)) return [];
  return x.filter(isString);
}

function contactLabel(x: string) {
  if (x === "telegram") return "Telegram";
  if (x === "call") return "Звонок";
  if (x === "whatsapp") return "WhatsApp";
  return x || "—";
}

export async function POST(req: Request) {
  try {
    const token = process.env.TELEGRAM_PARTNERS_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_PARTNERS_CHAT_ID;

    if (!token || !chatId) {
      return NextResponse.json(
        { error: "Telegram env is missing (TELEGRAM_PARTNERS_BOT_TOKEN / CHAT_ID)" },
        { status: 500 },
      );
    }

    const body = (await req.json()) as Body;

    const name = asString(body.name).trim();
    const phone = asString(body.phone).trim();
    const company = asString(body.company).trim();
    const city = asString(body.city).trim();
    const method = asString(body.contactMethod).trim();
    const comment = asString(body.comment).trim();

    const formats = asStringArray(body.formats);
    const interests = asStringArray(body.interests);

    if (!name || !phone) {
      return NextResponse.json(
        { error: "Name and phone are required" },
        { status: 400 },
      );
    }

    const lines: string[] = [];

    lines.push(`🤝 <b>Новая заявка на сотрудничество (Lioneto)</b>`);
    lines.push(`Имя: ${esc(name)}`);
    lines.push(`Телефон: ${esc(phone)}`);
    if (company) lines.push(`Компания: ${esc(company)}`);
    if (city) lines.push(`Город: ${esc(city)}`);
    lines.push(`Связь: ${esc(contactLabel(method))}`);
    lines.push(``);

    lines.push(`<b>Формат сотрудничества:</b>`);
    if (formats.length) {
      for (const f of formats) lines.push(`• ${esc(f)}`);
    } else {
      lines.push(`• —`);
    }

    lines.push(``);
    lines.push(`<b>Что интересует:</b>`);
    if (interests.length) {
      for (const it of interests) lines.push(`• ${esc(it)}`);
    } else {
      lines.push(`• —`);
    }

    if (comment) {
      lines.push(``);
      lines.push(`Комментарий: ${esc(comment)}`);
    }

    const text = lines.join("\n");

    const tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });

    if (!tgRes.ok) {
      const details = await tgRes.text().catch(() => "");
      return NextResponse.json(
        { error: "Telegram send failed", details },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}