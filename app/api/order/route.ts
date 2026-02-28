import { NextResponse } from "next/server";

function esc(s: string) {
  return String(s).replace(/[<>&]/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;" }[c] as string),
  );
}

function genOrderId() {
  const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `LIO-${Date.now().toString(36).toUpperCase()}-${rnd}`;
}

function toNum(v: unknown) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function toDateOrNow(isoLike: string): Date {
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

    const ms = d.getTime() + 5 * 60 * 60 * 1000;
    const x = new Date(ms);
    const pad = (n: number) => String(n).padStart(2, "0");
    return `${pad(x.getDate())}.${pad(x.getMonth() + 1)}.${x.getFullYear()}, ${pad(
      x.getHours(),
    )}:${pad(x.getMinutes())}:${pad(x.getSeconds())}`;
  }
}

type Customer = {
  phone?: string | null;
  name?: string | null;
  address?: string | null;
  comment?: string | null;
};

type OrderItem = {
  title?: string | null;

  qty?: unknown;
  unit?: unknown;
  sum?: unknown;

  collectionLabel?: string | null;
  collection?: string | null;
  brandLabel?: string | null;
  brand?: string | null;

  variantTitle?: string | null;
  variantId?: string | null;
};

type OrderMeta = {
  mode?: string | null;
  type?: string | null;
};

type OrderPayload = {
  orderId?: unknown;
  createdAt?: unknown;
  region?: unknown;

  mode?: unknown;
  meta?: OrderMeta | null;

  customer?: Customer | null;
  items?: unknown;
  total?: unknown;
};

function isOrderItemsArray(v: unknown): v is OrderItem[] {
  return Array.isArray(v);
}

export async function POST(req: Request) {
  const token = process.env.TELEGRAM_ORDERS_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ORDERS_CHAT_ID;

  if (!token || !chatId) {
    return NextResponse.json(
      {
        ok: false,
        error:
          "Missing TELEGRAM_ORDERS_BOT_TOKEN or TELEGRAM_ORDERS_CHAT_ID (check Production env)",
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

  const payload = (body ?? {}) as OrderPayload;

  const {
    orderId,
    createdAt,
    region,
    mode: modeTop,
    meta,
    customer,
    items,
    total,
  } = payload;

  const mode =
    (typeof modeTop === "string" ? modeTop : null) ??
    meta?.mode ??
    meta?.type ??
    null;

  const oid = String(orderId ?? "").trim() || genOrderId();

  // createdAt из payload (если дали) иначе now
  const cAtIso = String(createdAt ?? "").trim() || new Date().toISOString();
  const cAtDate = toDateOrNow(cAtIso);


  const cAtUz = formatTashkent(cAtDate);
  const cAtUtc = cAtDate.toISOString();

  const customerSafe: Customer = customer ?? {};
  const itemsSafe: OrderItem[] = isOrderItemsArray(items) ? items : [];

  if (!customerSafe?.phone || itemsSafe.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Invalid payload (need customer.phone + items[])" },
      { status: 400 },
    );
  }

  const regionStr = typeof region === "string" ? region : "";
  const currency = regionStr === "uz" ? "сум" : "₽";
  const kind = mode === "oneclick" ? "⚡️ ONE-CLICK" : "🛒 CART";

  const computedTotal = itemsSafe.reduce((acc, it) => {
    const qty = toNum(it?.qty);
    const unit = toNum(it?.unit);
    const sum = toNum(it?.sum) || unit * qty;
    return acc + sum;
  }, 0);

  const totalSafe = toNum(total) || computedTotal;

  const lines = itemsSafe
    .map((it, i) => {
      const collection =
        it.collectionLabel || it.collection || it.brandLabel || it.brand || "";
      const collectionPart = collection ? `${collection} / ` : "";

      const variant =
        it.variantTitle && it.variantId && it.variantId !== "base"
          ? ` (Вариант: ${it.variantTitle})`
          : "";

      const qty = toNum(it?.qty);
      const unit = toNum(it?.unit);
      const sum = toNum(it?.sum) || unit * qty;

      return `${i + 1}) ${collectionPart}${it.title ?? "Товар"}${variant} — ${qty} × ${unit} = ${sum} ${currency}`;
    })
    .join("\n");

  const text =
    `🧾 <b>НОВЫЙ ЗАКАЗ</b>\n` +
    `${esc(kind)}\n` +
    `🆔 <b>${esc(oid)}</b>\n` +
    // ✅ теперь всегда понятно: UZ + UTC
    `🕒 <b>Время (UZ):</b> ${esc(cAtUz)}\n` +
    `🕒 <b>UTC:</b> ${esc(cAtUtc)}\n\n` +
    `📞 <b>Телефон:</b> ${esc(String(customerSafe.phone))}\n` +
    `${customerSafe.name ? `👤 <b>Имя:</b> ${esc(customerSafe.name)}\n` : ""}` +
    `${
      customerSafe.address
        ? `📍 <b>Адрес:</b> ${esc(customerSafe.address)}\n`
        : ""
    }` +
    `${
      customerSafe.comment
        ? `💬 <b>Комментарий:</b> ${esc(customerSafe.comment)}\n`
        : ""
    }` +
    `\n<b>Заказ:</b>\n${esc(lines)}\n\n` +
    `💰 <b>Итого:</b> ${esc(String(totalSafe))} ${currency}`;

  let tgRes: Response;
  try {
    tgRes = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text,
        parse_mode: "HTML",
        disable_web_page_preview: true,
      }),
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      { ok: false, error: "Telegram request failed", details: msg },
      { status: 502 },
    );
  }

  if (!tgRes.ok) {
    const errText = await tgRes.text().catch(() => "");
    return NextResponse.json(
      {
        ok: false,
        error: "Telegram sendMessage failed",
        status: tgRes.status,
        details: errText,
      },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, orderId: oid });
}