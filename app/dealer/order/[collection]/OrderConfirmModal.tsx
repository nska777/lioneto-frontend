"use client";

import { X } from "lucide-react";

import type { DealerOrder, DealerOrderVisibleItem } from "./types";
import { formatMoney } from "./utils";

type Props = {
  order: DealerOrder | null;
  onClose: () => void;
  onConfirm: () => void;
};

type ProductItem = DealerOrderVisibleItem & {
  kind: "product";
};

type AddonItem = DealerOrderVisibleItem & {
  kind: "addon";
  parentProductId?: string;
  parentProductTitle?: string;
};

type ModalRow =
  | {
      kind: "product";
      item: ProductItem;
      displayIndex: number;
    }
  | {
      kind: "addon";
      item: AddonItem;
      isFirstChild: boolean;
      isLastChild: boolean;
    };

function isProductItem(item: DealerOrderVisibleItem): item is ProductItem {
  return item.kind === "product";
}

function isAddonItem(item: DealerOrderVisibleItem): item is AddonItem {
  return item.kind === "addon";
}

function getItemTypeLabel(item: DealerOrderVisibleItem) {
  if (item.kind === "product") return "Основной товар";
  if (item.addonKind === "required") return "Обязательный элемент";
  if (item.addonKind === "recommended") return "Рекомендуемый элемент";
  return "Доп. элемент";
}

function groupVisibleItems(items: DealerOrderVisibleItem[]): ModalRow[] {
  const products = items.filter(isProductItem);
  const addons = items.filter(isAddonItem);

  const addonsByParent = new Map<string, AddonItem[]>();

  addons.forEach((addon) => {
    const parentId = addon.parentProductId ?? "";
    const list = addonsByParent.get(parentId) ?? [];
    list.push(addon);
    addonsByParent.set(parentId, list);
  });

  const rows: ModalRow[] = [];
  const usedAddonIds = new Set<string>();
  let displayIndex = 1;

  products.forEach((product) => {
    rows.push({
      kind: "product",
      item: product,
      displayIndex,
    });

    const children = addonsByParent.get(product.id) ?? [];

    children.forEach((addon, index) => {
      rows.push({
        kind: "addon",
        item: addon,
        isFirstChild: index === 0,
        isLastChild: index === children.length - 1,
      });
      usedAddonIds.add(addon.id);
    });

    displayIndex += 1;
  });

  const orphanAddons = addons.filter((addon) => !usedAddonIds.has(addon.id));

  orphanAddons.forEach((addon) => {
    rows.push({
      kind: "addon",
      item: addon,
      isFirstChild: true,
      isLastChild: true,
    });
  });

  return rows;
}

function ProductNameCell({ item }: { item: ProductItem }) {
  return (
    <div className="min-w-0">
      <div className="text-[14px] font-semibold leading-[1.2] text-black">
        {item.title}
      </div>
      <div className="mt-1 text-[12px] leading-[1.2] text-black/45">
        {getItemTypeLabel(item)}
      </div>
    </div>
  );
}

function AddonNameCell({
  item,
  isFirstChild,
  isLastChild,
}: {
  item: AddonItem;
  isFirstChild: boolean;
  isLastChild: boolean;
}) {
  return (
    <div className="relative ml-2 pl-4">
      <div
        className={[
          "absolute left-0 w-px bg-black/15",
          isFirstChild ? "top-[2px]" : "top-[-6px]",
          isLastChild ? "bottom-[14px]" : "bottom-[-6px]",
        ].join(" ")}
      />
      <div className="absolute left-0 top-[12px] h-px w-2 bg-black/15" />

      <div className="min-w-0">
        <div className="text-[13px] font-medium leading-[1.2] text-black">
          {item.title}
        </div>

        <div className="mt-1 text-[11px] leading-[1.2] text-black/45">
          <div>{getItemTypeLabel(item)}</div>
          {item.parentProductTitle ? (
            <div className="mt-[2px]">Для: {item.parentProductTitle}</div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmModal({
  order,
  onClose,
  onConfirm,
}: Props) {
  if (!order) return null;

  const rows = groupVisibleItems(order.visibleItems);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-[1120px] rounded-[28px] bg-white p-6 shadow-[0_30px_80px_-20px_rgba(0,0,0,0.35)]">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-[30px] font-semibold leading-none text-black">
              Подтверждение заказа
            </div>

            <p className="mt-3 text-[14px] leading-6 text-black/60">
              Ниже показана версия заказа без наценки. Дилер видит только ее.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-full border border-black/10 bg-white text-black/60 transition hover:border-black/20 hover:text-black"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 rounded-[18px] border border-black/10 bg-[#fafaf8] p-4">
          <div className="grid gap-3 text-[13px] sm:grid-cols-3">
            <div>
              <div className="text-black/45">Номер заказа</div>
              <div className="mt-1 font-semibold text-black">
                {order.orderNumber}
              </div>
            </div>

            <div>
              <div className="text-black/45">Дата</div>
              <div className="mt-1 font-semibold text-black">
                {new Date(order.createdAt).toLocaleString("ru-RU")}
              </div>
            </div>

            <div>
              <div className="text-black/45">Позиций / единиц</div>
              <div className="mt-1 font-semibold text-black">
                {order.totalQty}
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 max-h-[420px] overflow-auto rounded-[18px] border border-black/10">
          <table className="min-w-full border-collapse">
            <thead className="sticky top-0 z-[1] bg-[#fafaf8]">
              <tr className="text-left text-[11px] uppercase tracking-[0.06em] text-black/45">
                <th className="w-[52px] px-3 py-3 text-center">#</th>
                <th className="w-[110px] px-3 py-3">Коллекция</th>
                <th className="min-w-[280px] px-3 py-3">Наименование</th>
                <th className="w-[130px] px-3 py-3">Артикул</th>
                <th className="w-[120px] px-3 py-3">Цвет</th>
                <th className="w-[130px] px-3 py-3">Габариты</th>
                <th className="w-[80px] px-3 py-3 text-center">Кол-во</th>
                <th className="w-[140px] px-3 py-3 text-right">Цена</th>
                <th className="w-[150px] px-3 py-3 text-right">Сумма</th>
              </tr>
            </thead>

            <tbody>
              {rows.map((row, index) => {
                if (row.kind === "product") {
                  const item = row.item;

                  return (
                    <tr
                      key={`product-${item.id}-${index}`}
                      className="border-t border-black/10 text-[14px]"
                    >
                      <td className="px-3 py-3 text-center text-black">
                        {row.displayIndex}
                      </td>

                      <td className="px-3 py-3 text-black/70">
                        {item.collectionSlug}
                      </td>

                      <td className="px-3 py-3">
                        <ProductNameCell item={item} />
                      </td>

                      <td className="px-3 py-3 text-black/70">
                        {item.article}
                      </td>

                      <td className="px-3 py-3 text-black/70">
                        {item.color ?? "-"}
                      </td>

                      <td className="px-3 py-3 text-black/70">
                        {item.size ?? "-"}
                      </td>

                      <td className="px-3 py-3 text-center text-black">
                        {item.quantity}
                      </td>

                      <td className="px-3 py-3 text-right text-black">
                        {formatMoney(item.unitPrice, order.country)}
                      </td>

                      <td className="px-3 py-3 text-right font-semibold text-black">
                        {formatMoney(item.totalPrice, order.country)}
                      </td>
                    </tr>
                  );
                }

                const item = row.item;

                return (
                  <tr
                    key={`addon-${item.id}-${index}`}
                    className="border-t border-black/10 bg-[#fcfcfb] text-[13px]"
                  >
                    <td className="px-3 py-3 text-center text-black/30"></td>

                    <td className="px-3 py-3 text-black/70">
                      {item.collectionSlug}
                    </td>

                    <td className="px-3 py-3">
                      <AddonNameCell
                        item={item}
                        isFirstChild={row.isFirstChild}
                        isLastChild={row.isLastChild}
                      />
                    </td>

                    <td className="px-3 py-3 text-black/70">{item.article}</td>

                    <td className="px-3 py-3 text-black/70">
                      {item.color ?? "-"}
                    </td>

                    <td className="px-3 py-3 text-black/70">
                      {item.size ?? "-"}
                    </td>

                    <td className="px-3 py-3 text-center text-black">
                      {item.quantity}
                    </td>

                    <td className="px-3 py-3 text-right text-black">
                      {formatMoney(item.unitPrice, order.country)}
                    </td>

                    <td className="px-3 py-3 text-right font-semibold text-black">
                      {formatMoney(item.totalPrice, order.country)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3 rounded-[18px] border border-black/10 bg-[#fafaf8] p-4">
          <span className="text-[14px] text-black/60">Итого без наценки</span>
          <span className="text-[22px] font-semibold leading-none text-black">
            {formatMoney(order.visibleSubtotal, order.country)}
          </span>
        </div>

        <div className="mt-5">
          <button
            type="button"
            onClick={onConfirm}
            className="inline-flex h-12 w-full cursor-pointer items-center justify-center rounded-[14px] border border-black bg-black px-4 text-[14px] font-semibold text-white transition hover:opacity-95"
          >
            Заказать
          </button>
        </div>
      </div>
    </div>
  );
}
