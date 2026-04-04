"use client";

import Link from "next/link";
import { Printer, ShoppingCart, Trash2, X } from "lucide-react";

import type { CartEntry } from "./types";
import { getDisplayArticle } from "./order-utils";
import { formatMoney } from "./utils";

type Props = {
  cartItems: CartEntry[];
  totalQty: number;
  subtotal: number;
  country: "RU" | "UZ" | "KZ" | "TJ";
  onRemoveItem: (id: string) => void;
  onClearCart: () => void;
  onPrintBase: () => void;
  onCheckout: () => void;
};

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

type ProductGroup = {
  product: Extract<CartEntry, { kind: "product" }> | null;
  requiredAddons: Extract<CartEntry, { kind: "addon" }>[];
  otherAddons: Extract<CartEntry, { kind: "addon" }>[];
};

function getProductKey(item: CartEntry) {
  if (item.kind === "product") return item.productId;
  return item.parentProductId;
}

function groupCartItems(cartItems: CartEntry[]): ProductGroup[] {
  const map = new Map<string, ProductGroup>();

  cartItems.forEach((item) => {
    const key = getProductKey(item);

    if (!map.has(key)) {
      map.set(key, {
        product: null,
        requiredAddons: [],
        otherAddons: [],
      });
    }

    const group = map.get(key)!;

    if (item.kind === "product") {
      group.product = item;
      return;
    }

    if (item.addonKind === "required") {
      group.requiredAddons.push(item);
    } else {
      group.otherAddons.push(item);
    }
  });

  return Array.from(map.values()).sort((a, b) => {
    if (a.product && !b.product) return -1;
    if (!a.product && b.product) return 1;
    return 0;
  });
}

function getAddonBadge(addon: Extract<CartEntry, { kind: "addon" }>) {
  if (addon.addonKind === "required") {
    return {
      label: "обязательный",
      className: "border border-red-200 bg-red-50 text-red-700",
    };
  }

  if (addon.addonKind === "recommended") {
    return {
      label: "рекомендуемый",
      className: "border border-amber-200 bg-amber-50 text-amber-700",
    };
  }

  return {
    label: "доп. элемент",
    className: "border border-black/10 bg-[#f3f3f1] text-black/60",
  };
}

function MetricCell({
  label,
  value,
  align = "left",
}: {
  label: string;
  value: string | number;
  align?: "left" | "right";
}) {
  return (
    <div className={cn("min-w-0", align === "right" && "text-right")}>
      <div className="text-[10px] uppercase tracking-[0.06em] text-black/35 md:text-[11px]">
        {label}
      </div>
      <div className="mt-1 break-words text-[11px] font-semibold leading-[1.25] text-black md:text-[12px]">
        {value}
      </div>
    </div>
  );
}

function LineRow({
  item,
  country,
  onRemove,
}: {
  item: CartEntry;
  country: "RU" | "UZ" | "KZ" | "TJ";
  onRemove: () => void;
}) {
  const addonBadge = item.kind === "addon" ? getAddonBadge(item) : null;

  return (
    <div className="w-full rounded-[16px] border border-black/8 bg-white px-3 py-3 sm:rounded-[18px]">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {item.kind === "product" ? (
              <span className="inline-flex rounded-full border border-black/10 bg-[#f5f5f3] px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-black/65 sm:px-2.5 sm:text-[10px]">
                основной товар
              </span>
            ) : addonBadge ? (
              <span
                className={cn(
                  "inline-flex rounded-full px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] sm:px-2.5 sm:text-[10px]",
                  addonBadge.className,
                )}
              >
                {addonBadge.label}
              </span>
            ) : null}

            <span className="inline-flex rounded-full border border-black/10 bg-white px-2 py-1 text-[9px] font-semibold uppercase tracking-[0.08em] text-black/40 sm:px-2.5 sm:text-[10px]">
              {item.collectionSlug}
            </span>
          </div>

          <div className="mt-2 break-words text-[13px] font-semibold leading-5 text-black sm:text-[14px]">
            {item.title}
          </div>

          <div className="mt-1 break-words text-[11px] text-black/45 sm:text-[12px]">
            {getDisplayArticle(item.article, item.articleShort, item.color)}
          </div>

          {item.color ? (
            <div className="mt-1 text-[11px] text-black/45 sm:text-[12px]">
              Цвет: <span className="text-black/65">{item.color}</span>
            </div>
          ) : null}

          {item.kind === "addon" && item.parentProductTitle ? (
            <div className="mt-1 text-[11px] text-black/45 sm:text-[12px]">
              Для:{" "}
              <span className="break-words text-black/65">
                {item.parentProductTitle}
              </span>
            </div>
          ) : null}
        </div>

        <button
          type="button"
          onClick={onRemove}
          className="flex h-8 w-8 shrink-0 cursor-pointer items-center justify-center rounded-full border border-black/10 bg-white text-black/45 transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
          aria-label="Удалить"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3 rounded-[14px] bg-[#f6f5f2] px-3 py-2.5">
        <div className="grid grid-cols-[52px_minmax(0,1fr)_minmax(0,1fr)] gap-2 sm:grid-cols-[56px_minmax(0,1fr)_minmax(0,1fr)]">
          <MetricCell label="Кол-во" value={item.quantity} />
          <MetricCell
            label="Цена"
            value={formatMoney(item.unitBasePrice, country)}
          />
          <MetricCell
            label="Сумма"
            value={formatMoney(item.totalBasePrice, country)}
            align="right"
          />
        </div>
      </div>
    </div>
  );
}

export default function OrderSidebar({
  cartItems,
  totalQty,
  subtotal,
  country,
  onRemoveItem,
  onClearCart,
  onPrintBase,
  onCheckout,
}: Props) {
  const groupedItems = groupCartItems(cartItems);
  const hasItems = cartItems.length > 0;

  return (
    <aside className="self-start xl:sticky xl:top-4">
      <div className="flex flex-col overflow-hidden rounded-[20px] border border-black/10 bg-[#fcfcfa] shadow-[0_14px_34px_-24px_rgba(0,0,0,0.22)] sm:rounded-[24px]">
        <div className="border-b border-black/8 px-3 py-4 sm:px-4 md:px-5">
          <div className="flex items-start justify-between gap-3">
            <div className="flex min-w-0 items-center gap-2">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-black text-white">
                <ShoppingCart className="h-5 w-5" />
              </div>

              <div className="min-w-0">
                <div className="text-[17px] font-semibold tracking-[-0.02em] text-black sm:text-[18px]">
                  Корзина
                </div>
                <div className="mt-0.5 text-[12px] text-black/50">
                  {hasItems
                    ? `${cartItems.length} поз. / ${totalQty} ед.`
                    : "Пока пусто"}
                </div>
              </div>
            </div>

            {hasItems ? (
              <button
                type="button"
                onClick={onClearCart}
                className="inline-flex h-9 shrink-0 cursor-pointer items-center justify-center gap-2 rounded-[12px] border border-black/10 bg-white px-3 text-[12px] font-semibold text-black transition hover:border-red-200 hover:bg-red-50 hover:text-red-600"
              >
                <Trash2 className="h-4 w-4" />
                <span className="hidden sm:inline">Очистить</span>
              </button>
            ) : null}
          </div>
        </div>

        <div
          className={cn(
            "px-3 py-4 sm:px-4 md:px-5",
            hasItems &&
              "overflow-y-auto xl:max-h-[calc(100vh-300px)] [scrollbar-width:thin] [scrollbar-color:rgba(0,0,0,0.22)_transparent] [&::-webkit-scrollbar]:w-[6px] [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-black/20",
          )}
        >
          {hasItems ? (
            <div className="space-y-4">
              {groupedItems.map((group, groupIndex) => (
                <div
                  key={`group-${group.product?.id ?? group.requiredAddons[0]?.id ?? group.otherAddons[0]?.id ?? groupIndex}`}
                  className="rounded-[18px] border border-black/8 bg-[#f7f6f3] p-2.5 sm:rounded-[22px] sm:p-3"
                >
                  {group.product ? (
                    <div
                      className={cn(
                        "rounded-[18px] p-[2px] sm:rounded-[20px]",
                        group.requiredAddons.length > 0
                          ? "border border-emerald-400/80 bg-emerald-50/30"
                          : "",
                      )}
                    >
                      <div className="space-y-3 rounded-[16px] sm:rounded-[18px]">
                        <LineRow
                          item={group.product}
                          country={country}
                          onRemove={() => onRemoveItem(group.product!.id)}
                        />

                        {group.requiredAddons.length > 0 ? (
                          <div className="space-y-3 pl-2 sm:pl-3">
                            {group.requiredAddons.map((addon) => (
                              <LineRow
                                key={addon.id}
                                item={addon}
                                country={country}
                                onRemove={() => onRemoveItem(addon.id)}
                              />
                            ))}
                          </div>
                        ) : null}
                      </div>
                    </div>
                  ) : (
                    <div className="rounded-[18px] border border-dashed border-black/12 bg-white px-3 py-3 text-[13px] text-black/45">
                      Основной товар не найден, но в корзине есть связанные
                      элементы.
                    </div>
                  )}

                  {group.otherAddons.length > 0 ? (
                    <div className="mt-3 space-y-3">
                      {group.otherAddons.map((addon) => (
                        <LineRow
                          key={addon.id}
                          item={addon}
                          country={country}
                          onRemove={() => onRemoveItem(addon.id)}
                        />
                      ))}
                    </div>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-[18px] border border-dashed border-black/10 bg-white px-4 py-10 text-center sm:rounded-[20px] sm:px-6 sm:py-12">
              <div className="text-[15px] font-semibold text-black sm:text-[16px]">
                Корзина пока пустая
              </div>
              <div className="mx-auto mt-2 max-w-[260px] text-[12px] leading-5 text-black/50 sm:text-[13px]">
                Добавьте основной товар и соберите комплект из обязательных и
                рекомендованных элементов.
              </div>
            </div>
          )}
        </div>

        <div className="border-t border-black/8 px-3 py-4 sm:px-4 md:px-5">
          <div className="rounded-[18px] bg-[#f5f4f1] p-4 sm:rounded-[20px]">
            <div className="flex items-center justify-between gap-3">
              <span className="text-[13px] text-black/55">Итого</span>
              <span className="break-words text-right text-[18px] font-semibold leading-tight text-black sm:text-[20px] md:text-[22px]">
                {formatMoney(subtotal, country)}
              </span>
            </div>
          </div>

          <div className="mt-4 grid gap-2">
            <button
              type="button"
              onClick={onCheckout}
              disabled={!hasItems}
              className={cn(
                "inline-flex h-11 w-full items-center justify-center rounded-[14px] px-4 text-[14px] font-semibold transition",
                hasItems
                  ? "cursor-pointer border border-black bg-black text-white hover:opacity-95"
                  : "cursor-not-allowed border border-black/10 bg-black/10 text-black/40",
              )}
            >
              Заказать
            </button>

            <button
              type="button"
              onClick={onPrintBase}
              disabled={!hasItems}
              className={cn(
                "inline-flex h-10 w-full items-center justify-center gap-2 rounded-[12px] px-3 text-[12px] font-semibold transition",
                hasItems
                  ? "cursor-pointer border border-black/10 bg-white text-black hover:border-amber-300 hover:bg-amber-50"
                  : "cursor-not-allowed border border-black/10 bg-white text-black/30",
              )}
            >
              <Printer className="h-4 w-4" />
              Печать
            </button>
          </div>

          <div className="mt-4 border-t border-black/8 pt-4">
            <Link
              href="/dealer/orders"
              className="inline-flex h-11 w-full cursor-pointer items-center justify-center rounded-[14px] border border-black/10 bg-white px-4 text-[14px] font-semibold text-black transition hover:border-amber-300 hover:bg-amber-50"
            >
              Мои заказы
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
}
