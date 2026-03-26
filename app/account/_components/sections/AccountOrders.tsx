"use client";

import { useEffect, useMemo, useState } from "react";
import { ChevronDown, ShoppingBag } from "lucide-react";

type AccountOrderItem = {
  title?: string | null;
  qty?: number | string | null;
  sum?: number | string | null;
  unit?: number | string | null;
  collectionLabel?: string | null;
  variantTitle?: string | null;
};

type AccountOrder = {
  id: string;
  orderNumber: string;
  orderStatus: string;
  totalAmount: number;
  currency: string;
  createdAt?: string | null;
  items?: AccountOrderItem[];
};

const STATUS_LABELS: Record<string, string> = {
  new: "Новый",
  processing: "В обработке",
  confirmed: "Подтвержден",
  shipped: "Отгружен",
  delivered: "Доставлен",
  cancelled: "Отменен",
};

function formatPrice(value: number, currency: string) {
  try {
    return new Intl.NumberFormat("ru-RU", {
      style: "currency",
      currency: currency || "UZS",
      maximumFractionDigits: 0,
    }).format(value || 0);
  } catch {
    return `${value || 0} ${currency || ""}`.trim();
  }
}

function formatDate(value?: string | null) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

function toNum(v: unknown) {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

export default function AccountOrders() {
  const [loading, setLoading] = useState(true);
  const [orders, setOrders] = useState<AccountOrder[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [openMap, setOpenMap] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/account/orders", {
          cache: "no-store",
        });

        const json = await res.json();

        if (!res.ok) {
          throw new Error(json?.error || "Failed to load orders");
        }

        if (!alive) return;

        const nextOrders = Array.isArray(json?.orders) ? json.orders : [];
        setOrders(nextOrders);

        const nextOpenMap: Record<string, boolean> = {};
        nextOrders.forEach((order: AccountOrder, index: number) => {
          nextOpenMap[order.id] = index === 0;
        });
        setOpenMap(nextOpenMap);
      } catch (err) {
        if (!alive) return;
        setError(err instanceof Error ? err.message : "Unknown error");
        setOrders([]);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  const hasOrders = useMemo(() => orders.length > 0, [orders]);

  function toggleOrder(orderId: string) {
    setOpenMap((prev) => ({
      ...prev,
      [orderId]: !prev[orderId],
    }));
  }

  return (
    <div className="rounded-[28px] border border-black/10 bg-white p-5">
      <div className="flex items-start gap-3">
        <div className="grid h-10 w-10 place-items-center rounded-2xl bg-black/[0.04]">
          <ShoppingBag className="h-5 w-5 text-black/60" />
        </div>

        <div>
          <div className="text-[12px] tracking-[0.22em] uppercase text-black/50">
            История заказов
          </div>
          <div className="mt-1 text-[14px] text-black/70">
            Здесь будут отображаться ваши покупки и статусы заказа.
          </div>
        </div>
      </div>

      <div className="mt-5">
        {loading ? (
          <div className="rounded-2xl border border-black/10 bg-black/[0.02] px-4 py-4 text-[14px] text-black/60">
            Загрузка заказов...
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-500/15 bg-red-500/[0.05] px-4 py-4 text-[14px] text-red-700">
            Не удалось загрузить заказы: {error}
          </div>
        ) : !hasOrders ? (
          <div className="rounded-2xl border border-black/10 bg-black/[0.02] px-4 py-4 text-[14px] text-black/70">
            У вас пока нет заказов.
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((order) => {
              const isOpen = !!openMap[order.id];
              const items = Array.isArray(order.items) ? order.items : [];

              return (
                <div
                  key={order.id}
                  className="overflow-hidden rounded-2xl border border-black/10"
                >
                  <button
                    type="button"
                    onClick={() => toggleOrder(order.id)}
                    className="flex w-full items-start justify-between gap-4 px-4 py-4 text-left transition hover:bg-black/[0.02]"
                  >
                    <div className="min-w-0">
                      <div className="text-[15px] font-medium text-black">
                        Заказ {order.orderNumber || order.id}
                      </div>
                      <div className="mt-1 text-[13px] text-black/50">
                        {formatDate(order.createdAt)}
                      </div>
                      <div className="mt-2 text-[13px] text-black/55">
                        Позиций: {items.length}
                      </div>
                    </div>

                    <div className="flex shrink-0 items-start gap-3">
                      <div className="text-right">
                        <div className="text-[14px] font-medium text-black">
                          {formatPrice(order.totalAmount, order.currency)}
                        </div>
                        <div className="mt-1 text-[13px] text-black/60">
                          {STATUS_LABELS[order.orderStatus] ||
                            order.orderStatus}
                        </div>
                        <div className="mt-2 text-[13px] text-black/55">
                          {isOpen ? "Скрыть" : "Открыть"}
                        </div>
                      </div>

                      <div
                        className={`mt-[2px] transition-transform duration-200 ${
                          isOpen ? "rotate-180" : ""
                        }`}
                      >
                        <ChevronDown className="h-5 w-5 text-black/45" />
                      </div>
                    </div>
                  </button>

                  {isOpen ? (
                    <div className="border-t border-black/10 px-4 pb-4 pt-3">
                      <div className="space-y-2">
                        {items.map((item, index) => {
                          const title =
                            String(item?.title ?? "").trim() || "Товар";
                          const collection = String(
                            item?.collectionLabel ?? "",
                          ).trim();
                          const variant = String(
                            item?.variantTitle ?? "",
                          ).trim();
                          const qty = toNum(item?.qty);
                          const sum = toNum(item?.sum || item?.unit);

                          return (
                            <div
                              key={`${order.id}-${index}`}
                              className="rounded-xl bg-black/[0.03] px-3 py-3"
                            >
                              <div className="text-[14px] font-medium text-black">
                                {collection
                                  ? `${collection} / ${title}`
                                  : title}
                              </div>

                              {variant ? (
                                <div className="mt-1 text-[13px] text-black/55">
                                  {variant}
                                </div>
                              ) : null}

                              <div className="mt-1 text-[13px] text-black/60">
                                Кол-во: {qty}
                                {sum > 0
                                  ? ` • ${formatPrice(sum, order.currency)}`
                                  : ""}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
