import { NextResponse } from "next/server";

function esc(s: string) {
  return String(s).replace(/[<>&]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c] as string),
  );
}

function toNum(v: unknown) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function formatMoney(n: number) {
  return new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 0,
  }).format(Math.round(n));
}

function toDateOrNow(isoLike: string) {
  const d = new Date(isoLike);
  return Number.isNaN(d.getTime()) ? new Date() : d;
}

function formatTashkent(d: Date): string {
  try {
    return new Intl.DateTimeFormat("ru-RU", {
      timeZone: "Asia/Tashkent",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(d);
  } catch {
    return d.toISOString();
  }
}

function resolveAbsUrl(urlLike: string): string {
  const raw = String(urlLike ?? "").trim();
  if (!raw) return "";

  if (raw.startsWith("http://") || raw.startsWith("https://")) return raw;

  const base =
    process.env.NEXT_PUBLIC_STRAPI_URL ||
    process.env.STRAPI_URL ||
    process.env.PUBLIC_URL ||
    "https://lioneto-cms.ru";

  if (raw.startsWith("/")) return `${String(base).replace(/\/+$/, "")}${raw}`;
  return raw;
}

function asIntFromEnv(v: string | undefined): number | null {
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

async function tgCall(
  token: string,
  method: string,
  bodyObj: Record<string, unknown>,
): Promise<Response> {
  return fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(bodyObj),
  });
}

type Lead = {
  name?: string | null;
  phone?: string | null;
};

type Item = {
  productId?: string | null;
  variantId?: string | null;
  variantTitle?: string | null;
  title?: string | null;
  imageUrl?: string | null;
  href?: string | null;
  qty?: unknown;
  unit?: unknown;
  sum?: unknown;
};

type Payload = {
  lead?: Lead | null;
  items?: unknown;
  total?: unknown;
  signature?: unknown;
  pathname?: unknown;
  region?: unknown;
  createdAt?: unknown;
  reason?: unknown;
};

function isItemsArray(v: unknown): v is Item[] {
  return Array.isArray(v);
}

export async function POST(req: Request) {
  const token =
    process.env.TELEGRAM_ABANDONED_BOT_TOKEN ||
    process.env.TELEGRAM_ORDERS_BOT_TOKEN;

  const chatId =
    process.env.TELEGRAM_ABANDONED_CHAT_ID ||
    process.env.TELEGRAM_ORDERS_CHAT_ID;

  const threadId =
  asIntFromEnv(process.env.TELEGRAM_ABANDONED_THREAD_ID) ??
  asIntFromEnv(process.env.TELEGRAM_ORDERS_THREAD_ID);

  if (!token || !chatId) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Missing TELEGRAM_ABANDONED_* or TELEGRAM_ORDERS_* env variables",
      },
      { status: 500 },
    );
  }

  let body: unknown;
  try {
    body = (await req.json()) as unknown;
  } catch {
    return NextResponse.json({ ok: false, error: "Bad JSON" }, { status: 400 });
  }

  const payload = (body ?? {}) as Payload;
  const lead = payload.lead ?? null;
  const items = isItemsArray(payload.items) ? payload.items : [];
  const total = toNum(payload.total);
  const region = String(payload.region ?? "").trim().toUpperCase() || "RU";
  const pathname = String(payload.pathname ?? "").trim() || "—";
  const createdAt = toDateOrNow(String(payload.createdAt ?? ""));
  const reason = String(payload.reason ?? "").trim() || "unknown";

  if (!lead?.phone || items.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Invalid payload" },
      { status: 400 },
    );
  }

  const currency = region === "UZ" ? "сум" : "₽";

  const itemsLines = items
    .map((it, i) => {
      const title = String(it.title ?? "Товар").trim() || "Товар";
      const qty = toNum(it.qty);
      const unit = toNum(it.unit);
      const sum = toNum(it.sum) || unit * qty;
      const pid = String(it.productId ?? "").trim();
      const vTitle = String(it.variantTitle ?? "").trim();
      const vId = String(it.variantId ?? "").trim();

      return (
        `${i + 1}. ${title}` +
        `${vTitle ? `\n   Вариант: ${vTitle}${vId && vId !== "base" ? ` (${vId})` : ""}` : ""}` +
        `${pid ? `\n   ID: ${pid}` : ""}` +
        `\n   ${qty} × ${formatMoney(unit)} = ${formatMoney(sum)} ${currency}`
      );
    })
    .join("\n\n");

  const text =
    `🛒 <b>БРОШЕННАЯ КОРЗИНА</b>\n` +
    `—————————————\n` +
    `👤 <b>Имя:</b> ${esc(String(lead.name ?? "—"))}\n` +
    `📞 <b>Телефон:</b> ${esc(String(lead.phone ?? "—"))}\n` +
    `🌍 <b>Регион:</b> ${esc(region)}\n` +
    `🕒 <b>Время:</b> ${esc(formatTashkent(createdAt))}\n` +
    `📍 <b>Страница:</b> ${esc(pathname)}\n` +
    `⚙️ <b>Причина:</b> ${esc(reason)}\n\n` +
    `<b>Состав корзины:</b>\n<pre>${esc(itemsLines)}</pre>\n` +
    `💰 <b>Итого:</b> ${esc(formatMoney(total))} ${currency}`;

  try {
    const bodyObj: Record<string, unknown> = {
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    };

    if (threadId) bodyObj.message_thread_id = threadId;

    const res = await tgCall(token, "sendMessage", bodyObj);

    if (!res.ok) {
      const errText = await res.text().catch(() => "");
      return NextResponse.json(
        {
          ok: false,
          error: "Telegram sendMessage failed",
          details: errText,
        },
        { status: 502 },
      );
    }

    const media = items
      .map((it) => {
        const img = resolveAbsUrl(String(it.imageUrl ?? "").trim());
        if (!img) return null;

        const title = String(it.title ?? "Товар").trim() || "Товар";
        const vTitle = String(it.variantTitle ?? "").trim();
        const qty = toNum(it.qty);
        const unit = toNum(it.unit);
        const sum = toNum(it.sum) || unit * qty;

        const caption =
          `🪑 <b>${esc(title)}</b>` +
          `${vTitle ? `\n${esc(vTitle)}` : ""}` +
          `\n${esc(String(qty))} × ${esc(formatMoney(unit))} = ${esc(formatMoney(sum))} ${esc(currency)}`;

        return {
          type: "photo",
          media: img,
          caption,
          parse_mode: "HTML",
        };
      })
      .filter(Boolean)
      .slice(0, 10) as Array<Record<string, unknown>>;

    if (media.length) {
      const bodyMedia: Record<string, unknown> = {
        chat_id: chatId,
        media,
      };
      if (threadId) bodyMedia.message_thread_id = threadId;
      await tgCall(token, "sendMediaGroup", bodyMedia).catch(() => null);
    }

    return NextResponse.json({ ok: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { ok: false, error: "Telegram request failed", details: msg },
      { status: 502 },
    );
  }
}