"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ChevronDown, Printer } from "lucide-react";

import { openSavedOrderPrintWindow } from "../order/[collection]/order-utils";
import type { DealerOrder } from "../order/[collection]/types";
import { formatMoney } from "../order/[collection]/utils";

type DealerCountryCode = "RU" | "UZ" | "KZ" | "TJ";
type DealerOrderVisibleItem = DealerOrder["visibleItems"][number];

type StrapiDealerOrder = {
  id?: number | string;
  documentId?: string;
  orderNumber?: string;
  orderStatus?: string;
  dealerTitle?: string;
  dealerEmail?: string;
  countryCode?: string;
  currency?: string;
  collectionTitles?: string;
  totalQty?: number;
  subtotal?: number;
  totalWithMarkup?: number;
  globalMarkupPercent?: number;
  globalMarkupAmount?: number;
  total?: number;
  submittedAt?: string;
  createdAt?: string;
  items?: unknown;
  notes?: string;
  isArchived?: boolean;
};

type DealerOrdersApiResponse = {
  items?: StrapiDealerOrder[];
  error?: string;
};

function normalizeCountry(value?: string | null): DealerCountryCode {
  const v = (value ?? "").trim().toUpperCase();
  if (v === "RU" || v === "UZ" || v === "KZ" || v === "TJ") return v;
  return "UZ";
}

function asNumber(value: unknown, fallback = 0): number {
  if (typeof value === "number" && Number.isFinite(value)) return value;

  if (typeof value === "string") {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }

  return fallback;
}

function asString(value: unknown, fallback = ""): string {
  return typeof value === "string" ? value : fallback;
}

function isVisibleItem(value: unknown): value is DealerOrderVisibleItem {
  if (!value || typeof value !== "object") return false;

  const item = value as Record<string, unknown>;

  return (
    typeof item.id === "string" &&
    (item.kind === "product" || item.kind === "addon") &&
    typeof item.title === "string" &&
    typeof item.article === "string" &&
    typeof item.quantity === "number" &&
    typeof item.unitPrice === "number" &&
    typeof item.totalPrice === "number" &&
    typeof item.collectionSlug === "string"
  );
}

function parseVisibleItems(value: unknown): DealerOrderVisibleItem[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item, index) => {
      if (!item || typeof item !== "object") return null;

      const raw = item as Record<string, unknown>;

      const normalized: DealerOrderVisibleItem = {
        id: asString(raw.id, `item-${index}`),
        kind:
          raw.kind === "addon" || raw.kind === "product" ? raw.kind : "product",
        title: asString(raw.title, "Без названия"),
        article: asString(raw.article, "-"),
        color:
          typeof raw.color === "string" && raw.color.trim()
            ? raw.color
            : undefined,
        quantity: asNumber(raw.quantity, 0),
        unitPrice: asNumber(raw.unitPrice, asNumber(raw.unitBasePrice, 0)),
        totalPrice: asNumber(raw.totalPrice, asNumber(raw.totalBasePrice, 0)),
        collectionSlug: asString(raw.collectionSlug, ""),
        addonKind:
          raw.addonKind === "required" || raw.addonKind === "recommended"
            ? raw.addonKind
            : undefined,
      };

      return isVisibleItem(normalized) ? normalized : null;
    })
    .filter(Boolean) as DealerOrderVisibleItem[];
}

function mapStrapiOrderToDealerOrder(item: StrapiDealerOrder): DealerOrder {
  const visibleItems = parseVisibleItems(item.items);
  const country = normalizeCountry(item.countryCode || item.currency);

  const collectionSlugsFromText =
    typeof item.collectionTitles === "string" && item.collectionTitles.trim()
      ? item.collectionTitles
          .split(",")
          .map((part) => part.trim())
          .filter(Boolean)
      : [];

  return {
    id:
      typeof item.documentId === "string" && item.documentId
        ? item.documentId
        : String(item.id ?? `order-${Date.now()}`),
    orderNumber: asString(item.orderNumber, "—"),
    createdAt: asString(
      item.submittedAt || item.createdAt,
      new Date().toISOString(),
    ),
    country,
    collectionSlug: collectionSlugsFromText[0] ?? "",
    collectionSlugs: collectionSlugsFromText,
    totalQty: asNumber(item.totalQty, visibleItems.length),
    visibleSubtotal: asNumber(item.subtotal, 0),
    visibleItems,
    internalSubtotal: asNumber(item.subtotal, 0),
    internalTotalWithItemMarkup: asNumber(
      item.totalWithMarkup,
      asNumber(item.subtotal, 0),
    ),
    globalMarkupPercent: asNumber(item.globalMarkupPercent, 0),
    globalMarkupAmount: asNumber(item.globalMarkupAmount, 0),
    internalTotal: asNumber(item.total, asNumber(item.subtotal, 0)),
    internalItems: [],
  };
}

function getOrderCollections(order: DealerOrder) {
  if (
    Array.isArray(order.collectionSlugs) &&
    order.collectionSlugs.length > 0
  ) {
    return order.collectionSlugs.join(", ");
  }

  if (typeof order.collectionSlug === "string" && order.collectionSlug) {
    return order.collectionSlug;
  }

  return "-";
}

export default function DealerOrdersPage() {
  const [orders, setOrders] = useState<DealerOrder[]>([]);
  const [openedOrderId, setOpenedOrderId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function loadBackendOrders() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/dealer/orders", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        const data = (await res
          .json()
          .catch(() => null)) as DealerOrdersApiResponse | null;

        if (!res.ok) {
          throw new Error(data?.error || "Не удалось загрузить заказы");
        }

        if (cancelled) return;

        const items = Array.isArray(data?.items) ? data.items : [];
        setOrders(items.map(mapStrapiOrderToDealerOrder));
      } catch (err) {
        if (cancelled) return;

        const message =
          err instanceof Error ? err.message : "Не удалось загрузить заказы";

        setError(message);
        setOrders([]);
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadBackendOrders();

    return () => {
      cancelled = true;
    };
  }, []);

  const hasOrders = useMemo(() => orders.length > 0, [orders]);

  return (
    <div className="mx-auto flex w-full max-w-[1460px] flex-col gap-4">
      <div className="rounded-[20px] border border-black/10 bg-white p-4 shadow-[0_10px_24px_-20px_rgba(0,0,0,0.18)] sm:rounded-[24px] sm:p-5">
        <Link
          href="/dealer/order"
          className="inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-1.5 text-[12px] font-medium text-black/60 transition hover:bg-black/[0.03] hover:text-black"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад к заказу
        </Link>

        <h1 className="mt-4 text-[28px] font-semibold leading-none text-black sm:text-[34px]">
          Мои заказы
        </h1>
        <p className="mt-2 text-[14px] text-black/55">
          Здесь отображаются сохраненные заказы и их состав.
        </p>
      </div>

      <div className="rounded-[20px] border border-black/10 bg-white shadow-[0_10px_24px_-20px_rgba(0,0,0,0.18)] sm:rounded-[24px]">
        {loading ? (
          <div className="p-4 text-[14px] text-black/45 sm:p-6">
            Загрузка заказов...
          </div>
        ) : error ? (
          <div className="p-4 text-[14px] text-red-600 sm:p-6">{error}</div>
        ) : !hasOrders ? (
          <div className="p-4 text-[14px] text-black/45 sm:p-6">
            Заказов пока нет.
          </div>
        ) : (
          <>
            {/* Mobile */}
            <div className="space-y-3 p-3 md:hidden">
              {orders.map((order) => {
                const isOpen = openedOrderId === order.id;

                return (
                  <div
                    key={order.id}
                    className="overflow-hidden rounded-[18px] border border-black/10 bg-[#fcfcfa]"
                  >
                    <div className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-[11px] uppercase tracking-[0.08em] text-black/40">
                            Номер заказа
                          </div>
                          <div className="mt-1 text-[15px] font-semibold text-black">
                            {order.orderNumber}
                          </div>
                        </div>

                        <div className="text-right">
                          <div className="text-[11px] uppercase tracking-[0.08em] text-black/40">
                            Дата
                          </div>
                          <div className="mt-1 text-[12px] text-black/65">
                            {new Date(order.createdAt).toLocaleString("ru-RU")}
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-1 gap-3 rounded-[14px] bg-white p-3">
                        <div>
                          <div className="text-[11px] uppercase tracking-[0.06em] text-black/40">
                            Коллекции
                          </div>
                          <div className="mt-1 text-[13px] text-black/70">
                            {getOrderCollections(order)}
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3">
                          <div>
                            <div className="text-[11px] uppercase tracking-[0.06em] text-black/40">
                              Позиций
                            </div>
                            <div className="mt-1 text-[14px] font-medium text-black">
                              {order.totalQty}
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-[11px] uppercase tracking-[0.06em] text-black/40">
                              Итог без наценки
                            </div>
                            <div className="mt-1 text-[16px] font-semibold text-black">
                              {formatMoney(
                                order.visibleSubtotal,
                                order.country,
                              )}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-4 flex flex-col gap-2 sm:flex-row">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenedOrderId(isOpen ? null : order.id)
                          }
                          className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-[12px] border border-black/10 bg-white px-3 text-[13px] font-medium text-black transition hover:border-black/20"
                        >
                          <ChevronDown
                            className={`h-4 w-4 transition ${isOpen ? "rotate-180" : ""}`}
                          />
                          {isOpen ? "Скрыть состав" : "Открыть состав"}
                        </button>

                        <button
                          type="button"
                          onClick={() => openSavedOrderPrintWindow(order)}
                          className="inline-flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-[12px] border border-black/10 bg-white px-3 text-[13px] font-medium text-black transition hover:border-black/20"
                        >
                          <Printer className="h-4 w-4" />
                          Печать
                        </button>
                      </div>
                    </div>

                    {isOpen ? (
                      <div className="border-t border-black/10 bg-white p-3">
                        <div className="space-y-3">
                          {order.visibleItems.map((item) => (
                            <div
                              key={item.id}
                              className="rounded-[14px] border border-black/10 bg-[#fcfcfa] p-3"
                            >
                              <div className="text-[14px] font-semibold text-black">
                                {item.title}
                              </div>

                              <div className="mt-2 grid grid-cols-2 gap-x-3 gap-y-2 text-[12px]">
                                <div>
                                  <div className="text-black/40">Коллекция</div>
                                  <div className="mt-0.5 text-black/70">
                                    {item.collectionSlug ||
                                      order.collectionSlug ||
                                      "-"}
                                  </div>
                                </div>

                                <div>
                                  <div className="text-black/40">Артикул</div>
                                  <div className="mt-0.5 text-black/70">
                                    {item.article}
                                  </div>
                                </div>

                                <div>
                                  <div className="text-black/40">Цвет</div>
                                  <div className="mt-0.5 text-black/70">
                                    {item.color ?? "-"}
                                  </div>
                                </div>

                                <div>
                                  <div className="text-black/40">Кол-во</div>
                                  <div className="mt-0.5 text-black">
                                    {item.quantity}
                                  </div>
                                </div>

                                <div>
                                  <div className="text-black/40">Цена</div>
                                  <div className="mt-0.5 text-black">
                                    {formatMoney(item.unitPrice, order.country)}
                                  </div>
                                </div>

                                <div>
                                  <div className="text-black/40">Сумма</div>
                                  <div className="mt-0.5 font-semibold text-black">
                                    {formatMoney(
                                      item.totalPrice,
                                      order.country,
                                    )}
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 flex justify-end">
                          <div className="rounded-[14px] border border-black/10 bg-[#fcfcfa] px-4 py-3 text-right">
                            <div className="text-[11px] uppercase tracking-[0.06em] text-black/45">
                              Итог без наценки
                            </div>
                            <div className="mt-1 text-[18px] font-semibold text-black">
                              {formatMoney(
                                order.visibleSubtotal,
                                order.country,
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : null}
                  </div>
                );
              })}
            </div>

            {/* Desktop */}
            <div className="hidden overflow-x-auto md:block">
              <table className="min-w-full border-collapse">
                <thead className="bg-[#fafaf8]">
                  <tr className="text-left text-[12px] uppercase tracking-[0.06em] text-black/45">
                    <th className="px-4 py-4">Дата</th>
                    <th className="px-4 py-4">Номер заказа</th>
                    <th className="px-4 py-4">Коллекции</th>
                    <th className="px-4 py-4">Позиций</th>
                    <th className="px-4 py-4">Итого без наценки</th>
                    <th className="px-4 py-4">Действия</th>
                  </tr>
                </thead>

                <tbody>
                  {orders.map((order) => {
                    const isOpen = openedOrderId === order.id;

                    return (
                      <Fragment key={order.id}>
                        <tr className="border-t border-black/10 text-[14px]">
                          <td className="px-4 py-4 text-black/65">
                            {new Date(order.createdAt).toLocaleString("ru-RU")}
                          </td>
                          <td className="px-4 py-4 font-semibold text-black">
                            {order.orderNumber}
                          </td>
                          <td className="px-4 py-4 text-black/65">
                            {getOrderCollections(order)}
                          </td>
                          <td className="px-4 py-4 text-black">
                            {order.totalQty}
                          </td>
                          <td className="px-4 py-4 font-semibold text-black">
                            {formatMoney(order.visibleSubtotal, order.country)}
                          </td>
                          <td className="px-4 py-4">
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  setOpenedOrderId(isOpen ? null : order.id)
                                }
                                className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-[12px] border border-black/10 bg-white px-3 text-[13px] font-medium text-black transition hover:border-black/20"
                              >
                                <ChevronDown className="h-4 w-4" />
                                {isOpen ? "Скрыть" : "Открыть"}
                              </button>

                              <button
                                type="button"
                                onClick={() => openSavedOrderPrintWindow(order)}
                                className="inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-[12px] border border-black/10 bg-white px-3 text-[13px] font-medium text-black transition hover:border-black/20"
                              >
                                <Printer className="h-4 w-4" />
                                Печать
                              </button>
                            </div>
                          </td>
                        </tr>

                        {isOpen ? (
                          <tr className="border-t border-black/10 bg-[#fcfcfa]">
                            <td colSpan={6} className="px-4 py-4">
                              <div className="overflow-x-auto rounded-[18px] border border-black/10 bg-white">
                                <table className="min-w-full border-collapse">
                                  <thead className="bg-[#fafaf8]">
                                    <tr className="text-left text-[12px] uppercase tracking-[0.06em] text-black/45">
                                      <th className="px-4 py-3">Коллекция</th>
                                      <th className="px-4 py-3">
                                        Наименование
                                      </th>
                                      <th className="px-4 py-3">Артикул</th>
                                      <th className="px-4 py-3">Цвет</th>
                                      <th className="px-4 py-3">Кол-во</th>
                                      <th className="px-4 py-3">Цена</th>
                                      <th className="px-4 py-3">Сумма</th>
                                    </tr>
                                  </thead>

                                  <tbody>
                                    {order.visibleItems.map((item) => (
                                      <tr
                                        key={item.id}
                                        className="border-t border-black/10 text-[14px]"
                                      >
                                        <td className="px-4 py-3 text-black/60">
                                          {item.collectionSlug ||
                                            order.collectionSlug ||
                                            "-"}
                                        </td>
                                        <td className="px-4 py-3 font-medium text-black">
                                          {item.title}
                                        </td>
                                        <td className="px-4 py-3 text-black/60">
                                          {item.article}
                                        </td>
                                        <td className="px-4 py-3 text-black/60">
                                          {item.color ?? "-"}
                                        </td>
                                        <td className="px-4 py-3 text-black">
                                          {item.quantity}
                                        </td>
                                        <td className="px-4 py-3 text-black">
                                          {formatMoney(
                                            item.unitPrice,
                                            order.country,
                                          )}
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-black">
                                          {formatMoney(
                                            item.totalPrice,
                                            order.country,
                                          )}
                                        </td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>

                              <div className="mt-4 flex items-center justify-end">
                                <div className="rounded-[16px] border border-black/10 bg-white px-4 py-3 text-right">
                                  <div className="text-[12px] uppercase tracking-[0.06em] text-black/45">
                                    Итог без наценки
                                  </div>
                                  <div className="mt-1 text-[20px] font-semibold text-black">
                                    {formatMoney(
                                      order.visibleSubtotal,
                                      order.country,
                                    )}
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        ) : null}
                      </Fragment>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
