"use client";

import Link from "next/link";
import { Fragment, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ChevronDown, Printer } from "lucide-react";

import { openSavedOrderPrintWindow } from "../order/[collection]/order-utils";
import type { DealerOrder } from "../order/[collection]/types";
import { formatMoney } from "../order/[collection]/utils";

type DealerCountryCode = "RU" | "UZ" | "KZ" | "TJ";

type DealerOrderItem = {
  id: string;
  kind: "product" | "addon";
  title: string;
  article: string;
  color?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  collectionSlug?: string;
  addonKind?: "required" | "recommended";
};

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

function isOrderItem(value: unknown): value is DealerOrderItem {
  if (!value || typeof value !== "object") return false;

  const item = value as Record<string, unknown>;

  return (
    typeof item.id === "string" &&
    typeof item.title === "string" &&
    typeof item.article === "string" &&
    typeof item.quantity === "number" &&
    typeof item.unitPrice === "number" &&
    typeof item.totalPrice === "number"
  );
}

function parseVisibleItems(value: unknown): DealerOrderItem[] {
  if (!Array.isArray(value)) return [];

  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;

      const raw = item as Record<string, unknown>;

      const normalized: DealerOrderItem = {
        id: asString(raw.id, crypto.randomUUID()),
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

      return isOrderItem(normalized) ? normalized : null;
    })
    .filter(Boolean) as DealerOrderItem[];
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
        : String(item.id ?? crypto.randomUUID()),
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
      <div className="rounded-[24px] border border-black/10 bg-white p-5 shadow-[0_10px_24px_-20px_rgba(0,0,0,0.18)]">
        <Link
          href="/dealer/order"
          className="inline-flex items-center gap-2 rounded-full border border-black/10 px-3 py-1.5 text-[12px] font-medium text-black/60 transition hover:bg-black/[0.03] hover:text-black"
        >
          <ArrowLeft className="h-4 w-4" />
          Назад к заказу
        </Link>

        <h1 className="mt-4 text-[34px] font-semibold leading-none text-black">
          Мои заказы
        </h1>
        <p className="mt-2 text-[14px] text-black/55">
          Здесь отображаются сохраненные заказы и их состав.
        </p>
      </div>

      <div className="rounded-[24px] border border-black/10 bg-white shadow-[0_10px_24px_-20px_rgba(0,0,0,0.18)]">
        {loading ? (
          <div className="p-6 text-[14px] text-black/45">
            Загрузка заказов...
          </div>
        ) : error ? (
          <div className="p-6 text-[14px] text-red-600">{error}</div>
        ) : !hasOrders ? (
          <div className="p-6 text-[14px] text-black/45">Заказов пока нет.</div>
        ) : (
          <div className="overflow-x-auto">
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
                                    <th className="px-4 py-3">Наименование</th>
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
                                        {typeof item.collectionSlug ===
                                          "string" && item.collectionSlug
                                          ? item.collectionSlug
                                          : order.collectionSlug || "-"}
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
        )}
      </div>
    </div>
  );
}
