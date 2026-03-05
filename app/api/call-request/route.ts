import { NextResponse } from "next/server";

function onlyDigits(s: string) {
  return String(s ?? "").replace(/\D/g, "");
}

function normalizeToE164(phoneRaw: string, region?: string) {
  const d = onlyDigits(phoneRaw);

  const isRu = String(region ?? "").toLowerCase().includes("рос")
    || String(region ?? "").toLowerCase().includes("russia")
    || String(region ?? "").toLowerCase().includes("ru");

  const isUz = String(region ?? "").toLowerCase().includes("уз")
    || String(region ?? "").toLowerCase().includes("uzbek")
    || String(region ?? "").toLowerCase().includes("uz");

  // RU: ожидаем +7XXXXXXXXXX или 8XXXXXXXXXX или 10 цифр
  if (isRu) {
    if (d.length === 11 && d.startsWith("7")) return `+${d}`;
    if (d.length === 11 && d.startsWith("8")) return `+7${d.slice(1)}`;
    if (d.length === 10) return `+7${d}`;
    // fallback: возьмём последние 10
    if (d.length > 10) return `+7${d.slice(-10)}`;
    return d ? `+7${d}` : "";
  }

  // UZ: +998XXXXXXXXX или 9 цифр
  if (isUz) {
    if (d.length === 12 && d.startsWith("998")) return `+${d}`;
    if (d.length === 9) return `+998${d}`;
    if (d.length > 9) {
      // если вдруг пришло с кодом внутри
      if (d.startsWith("998")) return `+${d.slice(0, 12)}`;
      return `+998${d.slice(-9)}`;
    }
    return d ? `+998${d}` : "";
  }

  // UNKNOWN: если похоже на E164 без плюса
  if (d.length >= 10 && d.length <= 15) return `+${d}`;
  return phoneRaw?.trim?.() ? String(phoneRaw).trim() : "";
}

function formatRuPrettyFromE164(e164: string) {
  // e164: +7XXXXXXXXXX
  const d = onlyDigits(e164);
  // d: 7 + 10
  const ten = d.length >= 11 && d.startsWith("7") ? d.slice(1, 11) : d.slice(-10);

  const code = ten.slice(0, 3);
  const a = ten.slice(3, 6);
  const b = ten.slice(6, 8);
  const c = ten.slice(8, 10);

  if (code.length < 3) return e164;
  return `+7 (${code}) ${a}${a ? "-" : ""}${b}${b ? "-" : ""}${c}`.replace(/-$/, "");
}

function formatUzPrettyFromE164(e164: string) {
  // e164: +998XXXXXXXXX
  const d = onlyDigits(e164);
  // d: 998 + 9
  const nine = d.startsWith("998") ? d.slice(3, 12) : d.slice(-9);

  const a = nine.slice(0, 2);
  const b = nine.slice(2, 5);
  const c = nine.slice(5, 7);
  const e = nine.slice(7, 9);

  if (a.length < 2) return e164;
  return `+998 ${a} ${b}${c ? " " : ""}${c}${e ? " " : ""}${e}`.trim();
}

function prettyPhone(phoneRaw: string, region?: string) {
  const e164 = normalizeToE164(phoneRaw, region);
  const isRu = String(region ?? "").toLowerCase().includes("рос")
    || String(region ?? "").toLowerCase().includes("russia")
    || String(region ?? "").toLowerCase().includes("ru");

  const isUz = String(region ?? "").toLowerCase().includes("уз")
    || String(region ?? "").toLowerCase().includes("uzbek")
    || String(region ?? "").toLowerCase().includes("uz");

  if (isRu) return formatRuPrettyFromE164(e164);
  if (isUz) return formatUzPrettyFromE164(e164);
  return e164 || phoneRaw;
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { firstName, lastName, phone, region } = body;

    if (!firstName || !phone) {
      return NextResponse.json(
        { ok: false, error: "Invalid data" },
        { status: 400 },
      );
    }

    const token = process.env.TELEGRAM_REQUESTS_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_REQUESTS_CHAT_ID;
    const threadId = process.env.TELEGRAM_REQUESTS_THREAD_ID;

    if (!token || !chatId) {
      return NextResponse.json(
        {
          ok: false,
          error:
            "Missing TELEGRAM_REQUESTS_BOT_TOKEN or TELEGRAM_REQUESTS_CHAT_ID",
        },
        { status: 500 },
      );
    }

    const e164 = normalizeToE164(String(phone), String(region));
    const phonePretty = prettyPhone(String(phone), String(region));
    const callLink = e164 ? `tel:${e164}` : "";

    const text = `
📞 *Заявка на звонок*
—————————————
👤 *Имя:* ${String(firstName).trim()} ${String(lastName ?? "").trim()}
📱 *Телефон:* ${phonePretty}
${callLink ? `📞 *Позвонить:* ${callLink}` : ""}
🌍 *Регион:* ${String(region ?? "").trim()}
🕒 *Время:* ${new Date().toLocaleString("ru-RU")}
    `.trim();

    const url = `https://api.telegram.org/bot${token}/sendMessage`;

    const tgRes = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        message_thread_id: threadId ? Number(threadId) : undefined,
        text,
        parse_mode: "Markdown",
        disable_web_page_preview: true,
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