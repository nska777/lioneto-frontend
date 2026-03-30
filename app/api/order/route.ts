import { NextResponse } from "next/server";
import { getSessionUser } from "@/app/lib/auth/session";
import { STRAPI_API_TOKEN, STRAPI_URL } from "@/app/lib/auth/config";

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

function digitsOnly(s: string): string {
  return s.replace(/\D+/g, "");
}

function normalizePhone(
  raw: string,
  regionRaw: string,
): { pretty: string; tel: string; digits: string } {
  const region = regionRaw.trim().toUpperCase();
  const d = digitsOnly(raw);

  if (region === "UZ") {
    let dd = d;
    if (dd.startsWith("998")) dd = dd.slice(3);
    if (dd.length > 9) dd = dd.slice(dd.length - 9);

    const a = dd.slice(0, 2);
    const b = dd.slice(2, 5);
    const c = dd.slice(5, 7);
    const e = dd.slice(7, 9);

    const pretty =
      dd.length === 9 ? `+998 ${a} ${b} ${c} ${e}` : raw.trim() || raw;
    const tel = dd.length === 9 ? `+998${dd}` : `+${d}`;
    return { pretty, tel, digits: d };
  }

  let dd = d;
  if (dd.startsWith("8") && dd.length === 11) dd = "7" + dd.slice(1);
  if (dd.startsWith("7") && dd.length === 11) dd = dd.slice(1);
  if (dd.length > 10) dd = dd.slice(dd.length - 10);

  const a = dd.slice(0, 3);
  const b = dd.slice(3, 6);
  const c = dd.slice(6, 8);
  const e = dd.slice(8, 10);

  const pretty =
    dd.length === 10 ? `+7 (${a}) ${b}-${c}-${e}` : raw.trim() || raw;
  const tel = dd.length === 10 ? `+7${dd}` : `+${d}`;
  return { pretty, tel, digits: d };
}

function asIntFromEnv(v: string | undefined): number | null {
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

function regionToCurrency(regionRaw: string): "UZS" | "RUB" {
  const r = regionRaw.trim().toUpperCase();
  return r === "UZ" ? "UZS" : "RUB";
}

function regionToCurrencyLabel(regionRaw: string): "сум" | "₽" {
  const r = regionRaw.trim().toUpperCase();
  return r === "UZ" ? "сум" : "₽";
}

function formatMoney(n: number): string {
  const x = Math.round(n);
  return new Intl.NumberFormat("ru-RU", { maximumFractionDigits: 0 }).format(x);
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

function getAuthHeaders(): Record<string, string> {
  if (!STRAPI_API_TOKEN) return {};
  return {
    Authorization: `Bearer ${STRAPI_API_TOKEN}`,
  };
}

function toStrapiUrl(path: string) {
  return `${String(STRAPI_URL).replace(/\/$/, "")}${path}`;
}

type Customer = {
  phone?: string | null;
  name?: string | null;
  address?: string | null;
  comment?: string | null;
};

type OrderItem = {
  title?: string | null;
  productId?: string | null;
  qty?: unknown;
  unit?: unknown;
  sum?: unknown;
  collectionLabel?: string | null;
  collection?: string | null;
  brandLabel?: string | null;
  brand?: string | null;
  variantTitle?: string | null;
  variantId?: string | null;
  imageUrl?: string | null;
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

async function saveOrderToStrapi(args: {
  orderId: string;
  createdAtIso: string;
  regionUpper: string;
  currency: "UZS" | "RUB";
  customerSafe: Customer;
  itemsSafe: OrderItem[];
  totalSafe: number;
}) {
  const sessionUser = await getSessionUser().catch(() => null);
  const customerDocumentId = sessionUser?.id || null;

  const body = {
    data: {
      orderNumber: args.orderId,
      orderStatus: "new",
      ...(customerDocumentId ? { customer: customerDocumentId } : {}),
      items: args.itemsSafe.map((it) => ({
        productId: String(it.productId ?? "").trim() || null,
        title: String(it.title ?? "").trim() || "Товар",
        collectionLabel: String(
          it.collectionLabel ?? it.collection ?? it.brandLabel ?? it.brand ?? "",
        ).trim(),
        variantId: String(it.variantId ?? "").trim() || "base",
        variantTitle: String(it.variantTitle ?? "").trim() || null,
        imageUrl: String(it.imageUrl ?? "").trim() || null,
        qty: toNum(it.qty),
        unit: toNum(it.unit),
        sum: toNum(it.sum) || toNum(it.unit) * toNum(it.qty),
      })),
      totalAmount: args.totalSafe,
      currency: args.currency,
      region: args.regionUpper,
      comment: String(args.customerSafe.comment ?? "").trim(),
      deliveryType: "customer_checkout",
      deliveryAddress: String(args.customerSafe.address ?? "").trim(),
      paymentType: "not_selected",
      phone: String(args.customerSafe.phone ?? "").trim(),
      fullName: String(args.customerSafe.name ?? "").trim(),
      submittedAt: args.createdAtIso,
    },
  };

  const res = await fetch(toStrapiUrl("/api/customer-orders"), {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...getAuthHeaders(),
    },
    body: JSON.stringify(body),
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return {
      ok: false as const,
      reason: "strapi-create-failed",
      status: res.status,
      details: text,
    };
  }

  const json = await res.json().catch(() => null);
  return { ok: true as const, data: json };
}

export async function POST(req: Request) {
  const token = process.env.TELEGRAM_ORDERS_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ORDERS_CHAT_ID;
  const threadId = asIntFromEnv(process.env.TELEGRAM_ORDERS_THREAD_ID);

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

  const { orderId, createdAt, region, mode: modeTop, meta, customer, items, total } =
    payload;

  const mode =
    (typeof modeTop === "string" ? modeTop : null) ??
    meta?.mode ??
    meta?.type ??
    null;

  const oid = String(orderId ?? "").trim() || genOrderId();

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
  const regionUpper = regionStr.trim().toUpperCase() || "RU";
  const currency = regionToCurrency(regionStr);
  const currencyLabel = regionToCurrencyLabel(regionStr);

  const kind =
    mode === "oneclick"
      ? "⚡️ <b>ONE-CLICK</b>"
      : "🛒 <b>КОРЗИНА</b>";

  const phoneNorm = normalizePhone(String(customerSafe.phone), regionUpper);

  const computedTotal = itemsSafe.reduce((acc, it) => {
    const qty = toNum(it?.qty);
    const unit = toNum(it?.unit);
    const sum = toNum(it?.sum) || unit * qty;
    return acc + sum;
  }, 0);

  const totalSafe = toNum(total) || computedTotal;

  const strapiSave = await saveOrderToStrapi({
    orderId: oid,
    createdAtIso: cAtUtc,
    regionUpper,
    currency,
    customerSafe,
    itemsSafe,
    totalSafe,
  });

  if (!strapiSave.ok) {
    return NextResponse.json(
      {
        ok: false,
        error: "Failed to save order in Strapi",
        details: strapiSave,
      },
      { status: 500 },
    );
  }

  const itemsLines = itemsSafe
    .map((it, i) => {
      const collection =
        it.collectionLabel || it.collection || it.brandLabel || it.brand || "";

      const pid = String(it.productId ?? "").trim();
      const idPart = pid ? `\n   ID: ${pid}` : "";

      const vTitle = String(it.variantTitle ?? "").trim();
      const vId = String(it.variantId ?? "").trim();
      const variant =
        vTitle && vId && vId !== "base"
          ? `\n   Вариант: ${vTitle} (${vId})`
          : vTitle
            ? `\n   Вариант: ${vTitle}`
            : "";

      const qty = toNum(it?.qty);
      const unit = toNum(it?.unit);
      const sum = toNum(it?.sum) || unit * qty;

      const title = it.title ?? "Товар";
      const header = collection ? `${collection} / ${title}` : `${title}`;

      return `${i + 1}. ${header}${variant}${idPart}\n   ${qty} × ${formatMoney(unit)} = ${formatMoney(sum)} ${currencyLabel}`;
    })
    .join("\n\n");

  const text =
    `🧾 <b>НОВЫЙ ЗАКАЗ</b>\n` +
    `—————————————\n` +
    `${kind}\n` +
    `🆔 <b>${esc(oid)}</b>\n` +
    `🕒 <b>Время (UZ):</b> ${esc(cAtUz)}\n` +
    `🕒 <b>UTC:</b> ${esc(cAtUtc)}\n` +
    `🌍 <b>Регион:</b> ${esc(regionUpper)}\n\n` +
    `📞 <b>Телефон:</b> <a href="tel:${esc(phoneNorm.tel)}">${esc(phoneNorm.pretty)}</a>\n` +
    `${customerSafe.name ? `👤 <b>Имя:</b> ${esc(customerSafe.name)}\n` : ""}` +
    `${customerSafe.address ? `📍 <b>Адрес:</b> ${esc(customerSafe.address)}\n` : ""}` +
    `${customerSafe.comment ? `💬 <b>Комментарий:</b> ${esc(customerSafe.comment)}\n` : ""}` +
    `\n<b>Состав заказа:</b>\n<pre>${esc(itemsLines)}</pre>\n` +
    `💰 <b>Итого:</b> ${esc(formatMoney(totalSafe))} ${currencyLabel}`;

  let tgRes: Response;
  try {
    const bodyObj: Record<string, unknown> = {
      chat_id: chatId,
      text,
      parse_mode: "HTML",
      disable_web_page_preview: true,
    };

    if (threadId) bodyObj.message_thread_id = threadId;

    tgRes = await tgCall(token, "sendMessage", bodyObj);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json(
      {
        ok: false,
        error: "Telegram request failed",
        details: msg,
      },
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

  const media = itemsSafe
    .map((it) => {
      const img = resolveAbsUrl(String(it.imageUrl ?? "").trim());
      if (!img) return null;

      const collection =
        it.collectionLabel || it.collection || it.brandLabel || it.brand || "";
      const title = String(it.title ?? "Товар").trim();
      const vTitle = String(it.variantTitle ?? "").trim();
      const vId = String(it.variantId ?? "").trim();

      const qty = toNum(it?.qty);
      const unit = toNum(it?.unit);
      const sum = toNum(it?.sum) || unit * qty;

      const header = collection ? `${collection} / ${title}` : title;
      const variant =
        vTitle && vId && vId !== "base"
          ? `\nВариант: ${vTitle}`
          : vTitle
            ? `\nВариант: ${vTitle}`
            : "";

      const caption =
        `🪑 <b>${esc(header)}</b>` +
        `${variant ? `\n${esc(variant)}` : ""}` +
        `\n${esc(String(qty))} × ${esc(formatMoney(unit))} = ${esc(formatMoney(sum))} ${esc(currencyLabel)}`;

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
    try {
      const bodyObj: Record<string, unknown> = {
        chat_id: chatId,
        media,
      };
      if (threadId) bodyObj.message_thread_id = threadId;
      await tgCall(token, "sendMediaGroup", bodyObj);
    } catch {}
  }

  return NextResponse.json({ ok: true, orderId: oid });
}