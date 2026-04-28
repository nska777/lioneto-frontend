import { NextResponse } from "next/server";

function esc(s: string) {
  return s.replace(/[<>&"]/g, (c) => {
    if (c === "<") return "&lt;";
    if (c === ">") return "&gt;";
    if (c === "&") return "&amp;";
    return "&quot;";
  });
}

type Body = {
  name?: unknown;

  firstName?: unknown;
  lastName?: unknown;
  email?: unknown;

  phone?: unknown;
  company?: unknown;
  city?: unknown;
  contactMethod?: unknown;
  comment?: unknown;
  formats?: unknown;
  interests?: unknown;

  region?: unknown;
  pageUrl?: unknown;
};

function isString(x: unknown): x is string {
  return typeof x === "string";
}

function asString(x: unknown): string {
  return isString(x) ? x : "";
}

function asStringArray(x: unknown): string[] {
  if (!Array.isArray(x)) return [];
  return x.filter(isString).map((v) => v.trim()).filter(Boolean);
}

function contactLabel(x: string) {
  if (x === "telegram") return "Telegram";
  if (x === "call") return "Звонок";
  if (x === "whatsapp") return "WhatsApp";
  if (x === "max") return "MAX";
  return x || "—";
}

function digitsOnly(s: string) {
  return s.replace(/\D+/g, "");
}

function isValidEmail(raw: string) {
  const v = raw.trim();
  if (!v) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
}

type Region = "RU" | "UZ" | "UNKNOWN";

function detectRegion(regionRaw: string, phoneRaw: string): Region {
  const r = regionRaw.trim().toUpperCase();

  if (r === "RU" || r === "RUS" || r === "RUSSIA") return "RU";
  if (r === "UZ" || r === "UZB" || r === "UZBEKISTAN") return "UZ";

  const d = digitsOnly(phoneRaw);

  if (d.startsWith("998")) return "UZ";
  if (d.startsWith("7")) return "RU";
  if (d.startsWith("8") && d.length === 11) return "RU";
  if (d.length === 9) return "UZ";
  if (d.length === 10) return "RU";

  return "UNKNOWN";
}

function normalizePhone(region: Region, phoneRaw: string) {
  const d = digitsOnly(phoneRaw);

  if (region === "UZ") {
    if (d.startsWith("998") && d.length >= 12) {
      return `+${d.slice(0, 12)}`;
    }

    if (d.length >= 9) {
      return `+998${d.slice(0, 9)}`;
    }
  }

  if (region === "RU") {
    if (d.startsWith("7") && d.length >= 11) {
      return `+${d.slice(0, 11)}`;
    }

    if (d.startsWith("8") && d.length >= 11) {
      return `+7${d.slice(1, 11)}`;
    }

    if (d.length >= 10) {
      return `+7${d.slice(0, 10)}`;
    }
  }

  if (!d) return "";
  if (d.startsWith("998") && d.length >= 12) return `+${d.slice(0, 12)}`;
  if (d.startsWith("7") && d.length >= 11) return `+${d.slice(0, 11)}`;
  if (d.startsWith("8") && d.length >= 11) return `+7${d.slice(1, 11)}`;

  return `+${d}`;
}

function formatPhonePretty(region: Region, normalized: string) {
  const d = digitsOnly(normalized);

  if (region === "UZ") {
    const core = d.startsWith("998") ? d.slice(3) : d;

    if (core.length < 9) return normalized;

    const a = core.slice(0, 2);
    const b = core.slice(2, 5);
    const c = core.slice(5, 7);
    const e = core.slice(7, 9);

    return `+998 ${a} ${b} ${c} ${e}`;
  }

  if (region === "RU") {
    const core = d.startsWith("7") ? d.slice(1) : d;

    if (core.length < 10) return normalized;

    const a = core.slice(0, 3);
    const b = core.slice(3, 6);
    const c = core.slice(6, 8);
    const e = core.slice(8, 10);

    return `+7 (${a}) ${b}-${c}-${e}`;
  }

  return normalized;
}

function nowByRegion(region: Region) {
  const tz = region === "RU" ? "Europe/Moscow" : "Asia/Tashkent";
  const label = region === "RU" ? "MSK" : "UZT";

  const text = new Intl.DateTimeFormat("ru-RU", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(new Date());

  return { tz, label, text };
}

export async function POST(req: Request) {
  let body: Body;

  try {
    body = (await req.json()) as Body;
  } catch (error) {
    console.error("PARTNER_REQUEST_JSON_ERROR:", error);

    return NextResponse.json(
      {
        error: "Invalid JSON body",
      },
      { status: 400 },
    );
  }

  try {
    const token = (
      process.env.TELEGRAM_COOP_BOT_TOKEN ||
      process.env.TELEGRAM_PARTNERS_BOT_TOKEN ||
      ""
    ).trim();

    const chatId = (
      process.env.TELEGRAM_COOP_CHAT_ID ||
      process.env.TELEGRAM_PARTNERS_CHAT_ID ||
      ""
    ).trim();

    const threadIdRaw = (
      process.env.TELEGRAM_COOP_THREAD_ID ||
      process.env.TELEGRAM_PARTNERS_THREAD_ID ||
      ""
    ).trim();

    if (!token || !chatId) {
      return NextResponse.json(
        {
          error:
            "Telegram env is missing: TELEGRAM_COOP_BOT_TOKEN / TELEGRAM_COOP_CHAT_ID",
        },
        { status: 500 },
      );
    }

    const firstName = asString(body.firstName).trim();
    const lastName = asString(body.lastName).trim();
    const legacyName = asString(body.name).trim();

    const fullName =
      [firstName, lastName].filter(Boolean).join(" ").trim() || legacyName;

    const emailRaw = asString(body.email).trim();
    const email = isValidEmail(emailRaw) ? emailRaw : "";

    const phoneRaw = asString(body.phone).trim();
    const company = asString(body.company).trim();
    const city = asString(body.city).trim();
    const method = asString(body.contactMethod).trim();
    const comment = asString(body.comment).trim();

    const regionRaw = asString(body.region).trim();
    const pageUrl = asString(body.pageUrl).trim();

    const formats = asStringArray(body.formats);
    const interests = asStringArray(body.interests);

    if (!fullName || !phoneRaw) {
      return NextResponse.json(
        {
          error: "Name and phone are required",
        },
        { status: 400 },
      );
    }

    const region = detectRegion(regionRaw, phoneRaw);
    const phoneNormalized = normalizePhone(region, phoneRaw);
    const phonePretty = formatPhonePretty(region, phoneNormalized);
    const telHref = phoneNormalized ? `tel:${phoneNormalized}` : "";

    const time = nowByRegion(region === "RU" ? "RU" : "UZ");

    const lines: string[] = [];

    lines.push(`🤝 <b>Новая заявка на сотрудничество (Lioneto)</b>`);
    lines.push(`—————————————`);
    lines.push(`👤 <b>Имя:</b> ${esc(fullName)}`);

    if (email) {
      lines.push(`✉️ <b>Email:</b> ${esc(email)}`);
    }

    lines.push(`📱 <b>Телефон:</b> ${esc(phonePretty || phoneRaw)}`);

    if (telHref) {
      lines.push(
        `📞 <b>Позвонить:</b> <a href="${esc(telHref)}">${esc(telHref)}</a>`,
      );
    }

    if (company) {
      lines.push(`🏢 <b>Компания:</b> ${esc(company)}`);
    }

    if (city) {
      lines.push(`🏙 <b>Город:</b> ${esc(city)}`);
    }

    lines.push(`💬 <b>Связь:</b> ${esc(contactLabel(method))}`);
    lines.push(`🌍 <b>Регион:</b> ${esc(regionRaw || region)}`);
    lines.push(`🕒 <b>Время (${esc(time.label)}):</b> ${esc(time.text)}`);

    if (pageUrl) {
      lines.push(`🔗 <b>Страница:</b> ${esc(pageUrl)}`);
    }

    lines.push(``);
    lines.push(`<b>Формат сотрудничества:</b>`);

    if (formats.length) {
      for (const f of formats) {
        lines.push(`• ${esc(f)}`);
      }
    } else {
      lines.push(`• —`);
    }

    lines.push(``);
    lines.push(`<b>Что интересует:</b>`);

    if (interests.length) {
      for (const it of interests) {
        lines.push(`• ${esc(it)}`);
      }
    } else {
      lines.push(`• —`);
    }

    if (comment) {
      lines.push(``);
      lines.push(`💬 <b>Комментарий:</b> ${esc(comment)}`);
    }

    const text = lines.join("\n");

    const telegramPayload: Record<string, unknown> = {
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    };

    const threadIdNum = threadIdRaw ? Number(threadIdRaw) : NaN;

    if (Number.isFinite(threadIdNum) && threadIdNum > 0) {
      telegramPayload.message_thread_id = threadIdNum;
    }

    let tgRes: Response;

    try {
      tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify(telegramPayload),
      });
    } catch (error) {
      console.error("TELEGRAM_FETCH_ERROR:", error);

      return NextResponse.json(
        {
          error: "Telegram request failed",
        },
        { status: 500 },
      );
    }

    if (!tgRes.ok) {
      const details = await tgRes.text().catch(() => "");

      console.error("TELEGRAM_SEND_FAILED:", {
        status: tgRes.status,
        details,
      });

      return NextResponse.json(
        {
          error: "Telegram send failed",
          status: tgRes.status,
          details,
        },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
    });
  } catch (error) {
    console.error("PARTNER_REQUEST_UNEXPECTED_ERROR:", error);

    return NextResponse.json(
      {
        error: "Unexpected server error",
      },
      { status: 500 },
    );
  }
}