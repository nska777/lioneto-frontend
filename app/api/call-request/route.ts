import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, phone, region } = body;

    if (!firstName || !phone) {
      return NextResponse.json(
        { ok: false, error: "Invalid data" },
        { status: 400 }
      );
    }

    const token = process.env.TELEGRAM_REQUESTS_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_REQUESTS_CHAT_ID;


    if (!token || !chatId) {
      return NextResponse.json(
        {
          ok: false,
          error: "Missing TELEGRAM_REQUESTS_BOT_TOKEN or TELEGRAM_REQUESTS_CHAT_ID",
        },
        { status: 500 }
      );
    }

    const text = `
📞 *Заявка на звонок*
—————————————
👤 *Имя:* ${firstName} ${lastName ?? ""}
📱 *Телефон:* ${phone}
🌍 *Регион:* ${region}
🕒 *Время:* ${new Date().toLocaleString("ru-RU")}
    `.trim();

    // ✅ ВАЖНО: токен НЕ вставляем как текст в ${...}
    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    const tgRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId, // ✅ Requests
        text,
        parse_mode: "Markdown",
      }),
    });

    if (!tgRes.ok) {
      const err = await tgRes.text().catch(() => "");
      console.error("Telegram error:", err);
      return NextResponse.json({ ok: false, error: err }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
