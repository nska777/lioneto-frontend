import type { DealerCountryCode, DealerProduct } from "../data";
import { formatMoney } from "./utils";
import type {
  CartEntry,
  DealerOrder,
  DealerOrderInternalItem,
  DealerOrderVisibleItem,
} from "./types";

export function getDefaultDraft() {
  return {
    quantity: 1,
    markupPercent: 0,
    isMarkupDirty: false,
  } as const;
}

export function getDefaultAddonDraft() {
  return {
    quantity: 1,
    markupPercent: 0,
    isInCart: false,
  } as const;
}

export function getAddonCartId(parentProductId: string, addonId: string) {
  return `${parentProductId}::addon::${addonId}`;
}

export function generateOrderId() {
  return `order_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function generateOrderNumber() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const hh = String(now.getHours()).padStart(2, "0");
  const mm = String(now.getMinutes()).padStart(2, "0");
  const ss = String(now.getSeconds()).padStart(2, "0");

  return `DLR-${y}${m}${d}-${hh}${mm}${ss}`;
}

export function getProductColor(product: DealerProduct): string | undefined {
  const withOptionalColor = product as DealerProduct & {
    color?: string;
    colors?: string[];
  };

  if (typeof withOptionalColor.color === "string" && withOptionalColor.color) {
    return withOptionalColor.color;
  }

  if (
    Array.isArray(withOptionalColor.colors) &&
    typeof withOptionalColor.colors[0] === "string"
  ) {
    return withOptionalColor.colors[0];
  }

  return undefined;
}

export function buildVisibleItems(
  cartItems: CartEntry[],
): DealerOrderVisibleItem[] {
  return cartItems.map((item) => ({
    id: item.id,
    kind: item.kind,
    addonKind: item.kind === "addon" ? item.addonKind : undefined,
    collectionSlug: item.collectionSlug,
    title: item.title,
    article: item.article,
    color: item.color,
    quantity: item.quantity,
    unitPrice: item.unitBasePrice,
    totalPrice: item.totalBasePrice,
  }));
}

export function buildInternalItems(
  cartItems: CartEntry[],
): DealerOrderInternalItem[] {
  return cartItems.map((item) => ({
    id: item.id,
    kind: item.kind,
    addonKind: item.kind === "addon" ? item.addonKind : undefined,
    collectionSlug: item.collectionSlug,
    title: item.title,
    article: item.article,
    color: item.color,
    quantity: item.quantity,
    markupPercent: item.markupPercent,
    unitBasePrice: item.unitBasePrice,
    unitFinalPrice: item.unitFinalPrice,
    totalBasePrice: item.totalBasePrice,
    totalFinalPrice: item.totalFinalPrice,
  }));
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function formatDate(value: string | Date) {
  const date = typeof value === "string" ? new Date(value) : value;
  return date.toLocaleString("ru-RU");
}

function formatCollections(slugs: string[]) {
  if (slugs.length === 0) return "-";
  return slugs.join(", ");
}

function openPrintWindow(html: string) {
  const printWindow = window.open("", "_blank", "width=1200,height=900");

  if (!printWindow) {
    alert("Разреши всплывающие окна для печати");
    return;
  }

  printWindow.document.open();
  printWindow.document.write(html);
  printWindow.document.close();
}

function getBasePrintStyles() {
  return `
    <style>
      * {
        box-sizing: border-box;
      }

      html, body {
        margin: 0;
        padding: 0;
        background: #ffffff;
        color: #111111;
        font-family: Arial, Helvetica, sans-serif;
      }

      body {
        padding: 28px;
      }

      .document {
        max-width: 1180px;
        margin: 0 auto;
      }

      .doc-header {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 24px;
        margin-bottom: 28px;
      }

      .brand-block {
        max-width: 320px;
      }

      .brand-name {
        font-size: 28px;
        font-weight: 700;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        line-height: 1;
      }

      .brand-subtitle {
        margin-top: 8px;
        font-size: 12px;
        color: #666666;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .doc-title {
        margin: 0;
        font-size: 30px;
        font-weight: 700;
        line-height: 1.1;
      }

      .doc-subtitle {
        margin-top: 8px;
        font-size: 14px;
        color: #555555;
        line-height: 1.6;
      }

      .meta-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(220px, 1fr));
        gap: 12px;
        margin-top: 24px;
        margin-bottom: 22px;
      }

      .meta-card {
        border: 1px solid #dcdcdc;
        border-radius: 14px;
        padding: 14px 16px;
      }

      .meta-label {
        font-size: 11px;
        color: #777777;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin-bottom: 6px;
      }

      .meta-value {
        font-size: 15px;
        font-weight: 600;
        color: #111111;
      }

      table {
        width: 100%;
        border-collapse: collapse;
      }

      thead th {
        background: #f5f5f5;
        font-size: 12px;
        text-transform: uppercase;
        letter-spacing: 0.04em;
      }

      th, td {
        border: 1px solid #dcdcdc;
        padding: 12px 12px;
        text-align: left;
        vertical-align: top;
        font-size: 14px;
      }

      td.num, th.num {
        text-align: right;
        white-space: nowrap;
      }

      td.center, th.center {
        text-align: center;
      }

      .summary {
        margin-top: 22px;
        margin-left: auto;
        width: min(460px, 100%);
        border: 1px solid #dcdcdc;
        border-radius: 16px;
        overflow: hidden;
      }

      .summary-row {
        display: flex;
        justify-content: space-between;
        gap: 16px;
        padding: 14px 16px;
        border-top: 1px solid #dcdcdc;
        font-size: 15px;
      }

      .summary-row:first-child {
        border-top: 0;
      }

      .summary-row strong {
        font-size: 16px;
      }

      .summary-row.total {
        background: #faf7ef;
        font-size: 18px;
        font-weight: 700;
      }

      .summary-row.total strong {
        font-size: 24px;
      }

      .summary-row.accent strong {
        color: #c85b2d;
      }

      .footnote {
        margin-top: 28px;
        font-size: 12px;
        line-height: 1.7;
        color: #666666;
      }

      @page {
        size: auto;
        margin: 16mm;
      }

      @media print {
        body {
          padding: 0;
        }

        .document {
          max-width: none;
        }
      }
    </style>
  `;
}

function getItemTypeLabel(item: CartEntry): string {
  if (item.kind === "product") return "Основной товар";

  if (item.addonKind === "required") return "Обязательный элемент";
  if (item.addonKind === "recommended") return "Рекомендуемый элемент";

  return "Доп. элемент";
}

function buildClientRows(items: CartEntry[], country: DealerCountryCode) {
  return items
    .map((item, index) => {
      return `
        <tr>
          <td class="center">${index + 1}</td>
          <td>${escapeHtml(item.collectionSlug)}</td>
          <td>
            ${escapeHtml(item.title)}
            <div style="margin-top:4px;font-size:12px;color:#777;">
              ${escapeHtml(getItemTypeLabel(item))}
            </div>
          </td>
          <td>${escapeHtml(item.article)}</td>
          <td>${escapeHtml(item.color ?? "-")}</td>
          <td class="center">${item.quantity}</td>
          <td class="num">${formatMoney(item.unitBasePrice, country)}</td>
          <td class="num">${formatMoney(item.totalBasePrice, country)}</td>
        </tr>
      `;
    })
    .join("");
}

function buildInternalRows(items: CartEntry[], country: DealerCountryCode) {
  return items
    .map((item, index) => {
      return `
        <tr>
          <td class="center">${index + 1}</td>
          <td>${escapeHtml(item.collectionSlug)}</td>
          <td>
            ${escapeHtml(item.title)}
            <div style="margin-top:4px;font-size:12px;color:#777;">
              ${escapeHtml(getItemTypeLabel(item))}
            </div>
          </td>
          <td>${escapeHtml(item.article)}</td>
          <td>${escapeHtml(item.color ?? "-")}</td>
          <td class="center">${item.quantity}</td>
          <td class="num">${formatMoney(item.unitBasePrice, country)}</td>
          <td class="center">${item.markupPercent}%</td>
          <td class="num">${formatMoney(item.unitFinalPrice, country)}</td>
          <td class="num">${formatMoney(item.totalFinalPrice, country)}</td>
        </tr>
      `;
    })
    .join("");
}

function buildClientPrintHtml(params: {
  title: string;
  orderNumber?: string;
  collectionTitle: string;
  collectionSlugs: string[];
  createdAt: string | Date;
  totalQty: number;
  subtotal: number;
  items: CartEntry[];
  country: DealerCountryCode;
}) {
  const {
    title,
    orderNumber,
    collectionTitle,
    collectionSlugs,
    createdAt,
    totalQty,
    subtotal,
    items,
    country,
  } = params;

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(title)}</title>
        ${getBasePrintStyles()}
      </head>
      <body>
        <div class="document">
          <div class="doc-header">
            <div class="brand-block">
              <div class="brand-name">LIONETO</div>
              <div class="brand-subtitle">Dealer Portal</div>
            </div>

            <div>
              <h1 class="doc-title">${escapeHtml(title)}</h1>
              <div class="doc-subtitle">
                ${
                  orderNumber
                    ? `Номер заказа: <strong>${escapeHtml(orderNumber)}</strong><br />`
                    : ""
                }
                Документ сформирован: ${escapeHtml(formatDate(createdAt))}
              </div>
            </div>
          </div>

          <div class="meta-grid">
            <div class="meta-card">
              <div class="meta-label">Коллекция</div>
              <div class="meta-value">${escapeHtml(collectionTitle)}</div>
            </div>

            <div class="meta-card">
              <div class="meta-label">Коллекции в заказе</div>
              <div class="meta-value">${escapeHtml(formatCollections(collectionSlugs))}</div>
            </div>

            <div class="meta-card">
              <div class="meta-label">Позиций / единиц</div>
              <div class="meta-value">${totalQty}</div>
            </div>

            <div class="meta-card">
              <div class="meta-label">Итоговая сумма</div>
              <div class="meta-value">${formatMoney(subtotal, country)}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th class="center">#</th>
                <th>Коллекция</th>
                <th>Наименование</th>
                <th>Артикул</th>
                <th>Цвет</th>
                <th class="center">Кол-во</th>
                <th class="num">Цена</th>
                <th class="num">Сумма</th>
              </tr>
            </thead>

            <tbody>
              ${buildClientRows(items, country)}
            </tbody>
          </table>

          <div class="summary">
            <div class="summary-row">
              <span>Всего единиц</span>
              <strong>${totalQty}</strong>
            </div>

            <div class="summary-row total">
              <span>Итого</span>
              <strong>${formatMoney(subtotal, country)}</strong>
            </div>
          </div>
        </div>

        <script>
          window.onload = function () {
            window.print();
          };
        </script>
      </body>
    </html>
  `;
}

function buildInternalPrintHtml(params: {
  title: string;
  orderNumber?: string;
  collectionTitle: string;
  collectionSlugs: string[];
  createdAt: string | Date;
  totalQty: number;
  subtotal: number;
  totalWithItemMarkup: number;
  globalMarkupPercent: number;
  globalMarkupAmount: number;
  total: number;
  items: CartEntry[];
  country: DealerCountryCode;
}) {
  const {
    title,
    orderNumber,
    collectionTitle,
    collectionSlugs,
    createdAt,
    totalQty,
    subtotal,
    totalWithItemMarkup,
    globalMarkupPercent,
    globalMarkupAmount,
    total,
    items,
    country,
  } = params;

  const hasItemMarkup = items.some((item) => item.markupPercent > 0);

  return `
    <html>
      <head>
        <meta charset="utf-8" />
        <title>${escapeHtml(title)}</title>
        ${getBasePrintStyles()}
      </head>
      <body>
        <div class="document">
          <div class="doc-header">
            <div class="brand-block">
              <div class="brand-name">LIONETO</div>
              <div class="brand-subtitle">Dealer Portal</div>
            </div>

            <div>
              <h1 class="doc-title">${escapeHtml(title)}</h1>
              <div class="doc-subtitle">
                ${
                  orderNumber
                    ? `Номер заказа: <strong>${escapeHtml(orderNumber)}</strong><br />`
                    : ""
                }
                Документ сформирован: ${escapeHtml(formatDate(createdAt))}
              </div>
            </div>
          </div>

          <div class="meta-grid">
            <div class="meta-card">
              <div class="meta-label">Коллекция</div>
              <div class="meta-value">${escapeHtml(collectionTitle)}</div>
            </div>

            <div class="meta-card">
              <div class="meta-label">Коллекции в заказе</div>
              <div class="meta-value">${escapeHtml(formatCollections(collectionSlugs))}</div>
            </div>

            <div class="meta-card">
              <div class="meta-label">Позиций / единиц</div>
              <div class="meta-value">${totalQty}</div>
            </div>

            <div class="meta-card">
              <div class="meta-label">Итог внутренний</div>
              <div class="meta-value">${formatMoney(total, country)}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th class="center">#</th>
                <th>Коллекция</th>
                <th>Наименование</th>
                <th>Артикул</th>
                <th>Цвет</th>
                <th class="center">Кол-во</th>
                <th class="num">Цена без наценки</th>
                <th class="center">Наценка</th>
                <th class="num">Цена с наценкой</th>
                <th class="num">Сумма</th>
              </tr>
            </thead>

            <tbody>
              ${buildInternalRows(items, country)}
            </tbody>
          </table>

          <div class="summary">
            <div class="summary-row">
              <span>Без наценки</span>
              <strong>${formatMoney(subtotal, country)}</strong>
            </div>

            <div class="summary-row">
              <span>Итого после наценок по позициям</span>
              <strong>${formatMoney(totalWithItemMarkup, country)}</strong>
            </div>

            <div class="summary-row accent">
              <span>Общая наценка на заказ ${globalMarkupPercent}%</span>
              <strong>${formatMoney(globalMarkupAmount, country)}</strong>
            </div>

            <div class="summary-row total">
              <span>Итог внутренний</span>
              <strong>${formatMoney(total, country)}</strong>
            </div>
          </div>

          <div class="footnote">
            ${
              hasItemMarkup
                ? "В документе отражены индивидуальные наценки по строкам и общая наценка на весь заказ."
                : "В документе применяется только общая наценка на весь заказ."
            }
          </div>
        </div>

        <script>
          window.onload = function () {
            window.print();
          };
        </script>
      </body>
    </html>
  `;
}

export function openCartPrintWindow(
  items: CartEntry[],
  country: DealerCountryCode,
  collectionTitle: string,
  totalQty: number,
  subtotal: number,
  totalWithMarkup: number,
  globalMarkupPercent: number,
  globalMarkupAmount: number,
  total: number,
  withMarkup: boolean,
) {
  const collectionSlugs = Array.from(
    new Set(items.map((item) => item.collectionSlug)),
  );

  const html = withMarkup
    ? buildInternalPrintHtml({
        title: "Внутренний расчет заказа",
        collectionTitle,
        collectionSlugs,
        createdAt: new Date(),
        totalQty,
        subtotal,
        totalWithItemMarkup: totalWithMarkup,
        globalMarkupPercent,
        globalMarkupAmount,
        total,
        items,
        country,
      })
    : buildClientPrintHtml({
        title: "Счет на оплату",
        collectionTitle,
        collectionSlugs,
        createdAt: new Date(),
        totalQty,
        subtotal,
        items,
        country,
      });

  openPrintWindow(html);
}

export function openSavedOrderPrintWindow(
  order: DealerOrder,
  withMarkup = false,
) {
  const safeCollectionSlugs = Array.isArray(order.collectionSlugs)
    ? order.collectionSlugs
    : typeof order.collectionSlug === "string" && order.collectionSlug
      ? [order.collectionSlug]
      : [];

  const cartItems: CartEntry[] = withMarkup
    ? order.internalItems.map((item) => {
        if (item.kind === "product") {
          return {
            kind: "product",
            id: item.id,
            productId: item.id,
            collectionSlug: item.collectionSlug,
            title: item.title,
            article: item.article,
            color: item.color,
            quantity: item.quantity,
            markupPercent: item.markupPercent,
            unitBasePrice: item.unitBasePrice,
            unitFinalPrice: item.unitFinalPrice,
            totalBasePrice: item.totalBasePrice,
            totalFinalPrice: item.totalFinalPrice,
          };
        }

        return {
          kind: "addon",
          id: item.id,
          parentProductId: "",
          addonId: item.id,
          addonKind: item.addonKind,
          collectionSlug: item.collectionSlug,
          title: item.title,
          article: item.article,
          color: item.color,
          quantity: item.quantity,
          markupPercent: item.markupPercent,
          unitBasePrice: item.unitBasePrice,
          unitFinalPrice: item.unitFinalPrice,
          totalBasePrice: item.totalBasePrice,
          totalFinalPrice: item.totalFinalPrice,
        };
      })
    : order.visibleItems.map((item) => {
        if (item.kind === "product") {
          return {
            kind: "product",
            id: item.id,
            productId: item.id,
            collectionSlug: item.collectionSlug,
            title: item.title,
            article: item.article,
            color: item.color,
            quantity: item.quantity,
            markupPercent: 0,
            unitBasePrice: item.unitPrice,
            unitFinalPrice: item.unitPrice,
            totalBasePrice: item.totalPrice,
            totalFinalPrice: item.totalPrice,
          };
        }

        return {
          kind: "addon",
          id: item.id,
          parentProductId: "",
          addonId: item.id,
          addonKind: item.addonKind,
          collectionSlug: item.collectionSlug,
          title: item.title,
          article: item.article,
          color: item.color,
          quantity: item.quantity,
          markupPercent: 0,
          unitBasePrice: item.unitPrice,
          unitFinalPrice: item.unitPrice,
          totalBasePrice: item.totalPrice,
          totalFinalPrice: item.totalPrice,
        };
      });

  const collectionTitle =
    safeCollectionSlugs.length === 1
      ? safeCollectionSlugs[0].toUpperCase()
      : "Смешанный заказ";

  const html = withMarkup
    ? buildInternalPrintHtml({
        title: "Внутренний расчет заказа",
        orderNumber: order.orderNumber,
        collectionTitle,
        collectionSlugs: safeCollectionSlugs,
        createdAt: order.createdAt,
        totalQty: order.totalQty,
        subtotal: order.internalSubtotal,
        totalWithItemMarkup: order.internalTotalWithItemMarkup,
        globalMarkupPercent: order.globalMarkupPercent,
        globalMarkupAmount: order.globalMarkupAmount,
        total: order.internalTotal,
        items: cartItems,
        country: order.country,
      })
    : buildClientPrintHtml({
        title: "Счет на оплату",
        orderNumber: order.orderNumber,
        collectionTitle,
        collectionSlugs: safeCollectionSlugs,
        createdAt: order.createdAt,
        totalQty: order.totalQty,
        subtotal: order.visibleSubtotal,
        items: cartItems,
        country: order.country,
      });

  openPrintWindow(html);
}