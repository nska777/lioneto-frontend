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

function toNum(v: any) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
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

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ ok: false, error: "Bad JSON" }, { status: 400 });
  }

  const {
    orderId,
    createdAt,
    region,
    mode: modeTop,
    meta,
    customer,
    items,
    total,
  } = body || {};

  // ✅ совместимость: если mode не передали, берём из meta.mode
  const mode = modeTop ?? meta?.mode ?? meta?.type ?? null;

  // ✅ НЕ валим заказ, если orderId/createdAt не пришли (как сейчас в CheckoutClient)
  const oid = String(orderId ?? "").trim() || genOrderId();
  const cAt = String(createdAt ?? "").trim() || new Date().toISOString();

  if (!customer?.phone || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Invalid payload (need customer.phone + items[])" },
      { status: 400 },
    );
  }

  const currency = region === "uz" ? "сум" : "₽";
  const kind = mode === "oneclick" ? "⚡️ ONE-CLICK" : "🛒 CART";

  const computedTotal = items.reduce(
    (acc: number, it: any) => acc + toNum(it?.sum ?? toNum(it?.unit) * toNum(it?.qty)),
    0,
  );
  const totalSafe = toNum(total) || computedTotal;

  const lines = items
    .map((it: any, i: number) => {
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
    `🕒 ${esc(cAt)}\n\n` +
    `📞 <b>Телефон:</b> ${esc(customer.phone)}\n` +
    `${customer.name ? `👤 <b>Имя:</b> ${esc(customer.name)}\n` : ""}` +
    `${customer.address ? `📍 <b>Адрес:</b> ${esc(customer.address)}\n` : ""}` +
    `${customer.comment ? `💬 <b>Комментарий:</b> ${esc(customer.comment)}\n` : ""}` +
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
  } catch (e: any) {
    return NextResponse.json(
      { ok: false, error: "Telegram request failed", details: String(e?.message ?? e) },
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
