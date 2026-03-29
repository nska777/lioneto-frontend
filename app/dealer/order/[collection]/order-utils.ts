import type { DealerCountryCode, DealerProduct } from "../data";
import { formatMoney } from "./utils";
import type {
  CartEntry,
  DealerOrder,
  DealerOrderInternalItem,
  DealerOrderVisibleItem,
} from "./types";

const ORDER_SEQUENCE_START = 1000;
const ORDER_DRAFT_NUMBER_STORAGE_KEY = "dealer-order-draft-number";
const ORDER_SEQUENCE_STORAGE_KEY_PREFIX = "dealer-order-sequence";

type PrintRow =
  | {
      kind: "product";
      item: Extract<CartEntry, { kind: "product" }>;
      displayIndex: string;
      hasChildren: boolean;
      isLastInGroup: boolean;
    }
  | {
      kind: "addon";
      item: Extract<CartEntry, { kind: "addon" }>;
      displayIndex: "";
      isFirstChild: boolean;
      isLastChild: boolean;
      isLastInGroup: boolean;
    };

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

function sanitizeLoginForOrder(login?: string | null) {
  const safe = String(login ?? "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/[^a-zA-Z0-9_-]/g, "")
    .toUpperCase();

  return safe || "DEALER";
}

function getDealerSequenceStorageKey(login?: string | null) {
  return `${ORDER_SEQUENCE_STORAGE_KEY_PREFIX}:${sanitizeLoginForOrder(login)}`;
}

function getDraftNumberStorageKey(login?: string | null) {
  return `${ORDER_DRAFT_NUMBER_STORAGE_KEY}:${sanitizeLoginForOrder(login)}`;
}

function getStoredDraftOrderNumber(login?: string | null) {
  if (typeof window === "undefined") return null;

  try {
    return sessionStorage.getItem(getDraftNumberStorageKey(login));
  } catch {
    return null;
  }
}

function setStoredDraftOrderNumber(
  login: string | null | undefined,
  value: string,
) {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.setItem(getDraftNumberStorageKey(login), value);
  } catch {}
}

export function resetDraftOrderNumber(dealerLogin?: string | null) {
  if (typeof window === "undefined") return;

  try {
    sessionStorage.removeItem(getDraftNumberStorageKey(dealerLogin));
  } catch {}
}

export function generateOrderNumber(dealerLogin?: string | null) {
  const loginPart = sanitizeLoginForOrder(dealerLogin);

  if (typeof window === "undefined") {
    return `DLR-${loginPart}-${ORDER_SEQUENCE_START + 1}`;
  }

  const cachedDraftNumber = getStoredDraftOrderNumber(dealerLogin);
  if (cachedDraftNumber) {
    return cachedDraftNumber;
  }

  try {
    const sequenceKey = getDealerSequenceStorageKey(dealerLogin);
    const raw = localStorage.getItem(sequenceKey);
    const parsed = Number(raw);

    const nextNumber =
      Number.isFinite(parsed) && parsed >= ORDER_SEQUENCE_START
        ? parsed + 1
        : ORDER_SEQUENCE_START + 1;

    localStorage.setItem(sequenceKey, String(nextNumber));

    const orderNumber = `DLR-${loginPart}-${nextNumber}`;
    setStoredDraftOrderNumber(dealerLogin, orderNumber);

    return orderNumber;
  } catch {
    const fallback = `DLR-${loginPart}-${ORDER_SEQUENCE_START + 1}`;
    setStoredDraftOrderNumber(dealerLogin, fallback);
    return fallback;
  }
}

export function getPrintFileTitle(orderNumber: string) {
  return `order_${orderNumber}`;
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
    parentProductId: item.kind === "addon" ? item.parentProductId : undefined,
    parentProductTitle:
      item.kind === "addon" ? item.parentProductTitle : undefined,
    collectionSlug: item.collectionSlug,
    title: item.title,
    article: item.article,
    color: item.color,
    size: item.size,
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
    parentProductId: item.kind === "addon" ? item.parentProductId : undefined,
    parentProductTitle:
      item.kind === "addon" ? item.parentProductTitle : undefined,
    collectionSlug: item.collectionSlug,
    title: item.title,
    article: item.article,
    color: item.color,
    size: item.size,
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
  const printWindow = window.open("", "_blank", "width=1400,height=900");

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
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }

      html, body {
        margin: 0;
        padding: 0;
        background: #ffffff;
        color: #111111;
        font-family: Arial, Helvetica, sans-serif;
      }

      body {
        padding: 0;
      }

      .document {
        width: 281mm;
        min-height: 190mm;
        margin: 0 auto;
        background: #ffffff;
      }

      .doc-header {
        display: grid;
        grid-template-columns: 1fr 1.25fr;
        gap: 18px;
        align-items: start;
        margin-bottom: 12px;
        page-break-inside: avoid;
        break-inside: avoid;
      }

      .brand-block {
        max-width: 320px;
        padding-top: 2px;
      }

      .brand-name {
        font-size: 24px;
        font-weight: 700;
        letter-spacing: 0.06em;
        text-transform: uppercase;
        line-height: 1;
      }

      .brand-subtitle {
        margin-top: 6px;
        font-size: 11px;
        color: #666666;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .doc-right {
        padding-top: 0;
      }

      .doc-label {
        margin: 0 0 2px;
        font-size: 11px;
        color: #7b7b7b;
        letter-spacing: 0.08em;
        text-transform: uppercase;
      }

      .doc-title {
        margin: 0;
        font-size: 26px;
        font-weight: 700;
        line-height: 1.08;
        word-break: break-word;
      }

      .doc-subtitle {
        margin-top: 6px;
        font-size: 11px;
        color: #666666;
        line-height: 1.35;
      }

      .meta-grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 8px 10px;
        margin: 0 0 12px;
        page-break-inside: avoid;
        break-inside: avoid;
      }

      .meta-card {
        border: 1px solid #d9d9d9;
        border-radius: 10px;
        padding: 9px 12px;
        min-height: 48px;
        background: #ffffff;
        overflow: hidden;
      }

      .meta-label {
        font-size: 9px;
        color: #7a7a7a;
        text-transform: uppercase;
        letter-spacing: 0.08em;
        margin-bottom: 4px;
      }

      .meta-value {
        font-size: 11px;
        font-weight: 700;
        color: #111111;
        line-height: 1.25;
        word-break: break-word;
      }

      .table-wrap {
        width: 100%;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        table-layout: fixed;
      }

      col.col-index {
        width: 34px;
      }

      col.col-collection {
        width: 92px;
      }

      col.col-name {
        width: auto;
      }

      col.col-article {
        width: 114px;
      }

      col.col-color {
        width: 88px;
      }

      col.col-size {
        width: 96px;
      }

      col.col-qty {
        width: 64px;
      }

      col.col-price {
        width: 120px;
      }

      col.col-total {
        width: 122px;
      }

      col.col-markup {
        width: 78px;
      }

      thead {
        display: table-header-group;
      }

      tr {
        page-break-inside: avoid;
        break-inside: avoid;
      }

      thead th {
        background: #f5f5f5;
        font-size: 10px;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 0.03em;
        line-height: 1.1;
      }

      th, td {
        border: 1px solid #dddddd;
        padding: 6px 8px;
        text-align: left;
        vertical-align: top;
        font-size: 10px;
        line-height: 1.22;
      }

      td,
      th {
        overflow-wrap: anywhere;
        word-break: break-word;
      }

      td.num,
      th.num {
        text-align: right;
        white-space: nowrap;
        overflow-wrap: normal;
        word-break: normal;
      }

      td.center,
      th.center {
        text-align: center;
      }

      td.index-child {
        width: 34px;
        min-width: 34px;
        padding: 0;
        border-right: 0;
        background: #ffffff;
      }

      td.collection-child {
        border-left: 0;
      }

      tr.child-row td {
        background: #fcfcfc;
      }

      tr.group-gap td {
        border-bottom: 1px solid #dddddd;
      }

      .name-cell {
        display: flex;
        flex-direction: column;
        gap: 2px;
        min-width: 0;
      }

      .name-main {
        font-size: 10px;
        font-weight: 500;
        line-height: 1.18;
        overflow-wrap: anywhere;
        word-break: break-word;
      }

      .name-sub {
        font-size: 9px;
        color: #777777;
        line-height: 1.14;
      }

      .tree-block {
        position: relative;
        margin-left: 8px;
        padding-left: 12px;
      }

      .tree-block::before {
        content: "";
        position: absolute;
        left: 0;
        top: -6px;
        bottom: -6px;
        width: 1px;
        background: #cfcfcf;
      }

      .tree-block.first::before {
        top: -1px;
      }

      .tree-block.last::before {
        bottom: 6px;
      }

      .tree-block::after {
        content: "";
        position: absolute;
        left: 0;
        top: 9px;
        width: 8px;
        height: 1px;
        background: #cfcfcf;
      }

      .summary {
        margin-top: 10px;
        margin-left: auto;
        width: 360px;
        max-width: 100%;
        border: 1px solid #dcdcdc;
        border-radius: 12px;
        overflow: hidden;
        background: #ffffff;
        page-break-inside: avoid;
        break-inside: avoid;
      }

      .summary-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 10px;
        padding: 10px 14px;
        border-top: 1px solid #dcdcdc;
        font-size: 11px;
        line-height: 1.2;
        background: #ffffff;
      }

      .summary-row:first-child {
        border-top: 0;
      }

      .summary-row strong {
        font-size: 12px;
      }

      .summary-row.total {
        background: #faf7ef;
        font-size: 12px;
        font-weight: 700;
      }

      .summary-row.total strong {
        font-size: 16px;
      }

      .summary-row.accent strong {
        color: #c85b2d;
      }

      .footnote {
        margin-top: 10px;
        font-size: 10px;
        line-height: 1.35;
        color: #666666;
        page-break-inside: avoid;
        break-inside: avoid;
      }

      @page {
        size: A4 landscape;
        margin: 8mm;
      }

      @media print {
        html,
        body {
          margin: 0;
          padding: 0;
          width: auto;
          height: auto;
          background: #ffffff;
        }

        body {
          padding: 0;
        }

        .document {
          width: 281mm;
          min-height: 190mm;
          margin: 0 auto;
        }
      }
    </style>
  `;
}

function getClientColGroup() {
  return `
    <colgroup>
      <col class="col-index" />
      <col class="col-collection" />
      <col class="col-name" />
      <col class="col-article" />
      <col class="col-color" />
      <col class="col-size" />
      <col class="col-qty" />
      <col class="col-price" />
      <col class="col-total" />
    </colgroup>
  `;
}

function getInternalColGroup() {
  return `
    <colgroup>
      <col class="col-index" />
      <col class="col-collection" />
      <col class="col-name" />
      <col class="col-article" />
      <col class="col-color" />
      <col class="col-size" />
      <col class="col-qty" />
      <col class="col-price" />
      <col class="col-markup" />
      <col class="col-price" />
      <col class="col-total" />
    </colgroup>
  `;
}

function getItemTypeLabel(item: CartEntry): string {
  if (item.kind === "product") return "Основной товар";

  if (item.addonKind === "required") return "Обязательный элемент";
  if (item.addonKind === "recommended") return "Рекомендуемый элемент";

  return "Доп. элемент";
}

function groupPrintItems(items: CartEntry[]): PrintRow[] {
  const products = items.filter(
    (item): item is Extract<CartEntry, { kind: "product" }> =>
      item.kind === "product",
  );

  const addons = items.filter(
    (item): item is Extract<CartEntry, { kind: "addon" }> =>
      item.kind === "addon",
  );

  const addonsByParent = new Map<
    string,
    Extract<CartEntry, { kind: "addon" }>[]
  >();

  addons.forEach((addon) => {
    const list = addonsByParent.get(addon.parentProductId) ?? [];
    list.push(addon);
    addonsByParent.set(addon.parentProductId, list);
  });

  const rows: PrintRow[] = [];
  const usedAddonIds = new Set<string>();
  let productIndex = 1;

  products.forEach((product) => {
    const children = addonsByParent.get(product.productId) ?? [];

    rows.push({
      kind: "product",
      item: product,
      displayIndex: String(productIndex),
      hasChildren: children.length > 0,
      isLastInGroup: children.length === 0,
    });

    children.forEach((addon, index) => {
      rows.push({
        kind: "addon",
        item: addon,
        displayIndex: "",
        isFirstChild: index === 0,
        isLastChild: index === children.length - 1,
        isLastInGroup: index === children.length - 1,
      });
      usedAddonIds.add(addon.id);
    });

    productIndex += 1;
  });

  const orphanAddons = addons.filter((addon) => !usedAddonIds.has(addon.id));

  orphanAddons.forEach((addon, index) => {
    rows.push({
      kind: "addon",
      item: addon,
      displayIndex: "",
      isFirstChild: true,
      isLastChild: true,
      isLastInGroup: index === orphanAddons.length - 1,
    });
  });

  return rows;
}

function renderProductNameCell(item: Extract<CartEntry, { kind: "product" }>) {
  return `
    <div class="name-cell">
      <div class="name-main">${escapeHtml(item.title)}</div>
      <div class="name-sub">${escapeHtml(getItemTypeLabel(item))}</div>
    </div>
  `;
}

function renderAddonNameCell(
  item: Extract<CartEntry, { kind: "addon" }>,
  isFirstChild: boolean,
  isLastChild: boolean,
) {
  return `
    <div class="tree-block ${isFirstChild ? "first" : ""} ${isLastChild ? "last" : ""}">
      <div class="name-cell">
        <div class="name-main">${escapeHtml(item.title)}</div>
        <div class="name-sub">
          ${escapeHtml(getItemTypeLabel(item))}
          ${
            item.parentProductTitle
              ? `<br />Для: ${escapeHtml(item.parentProductTitle)}`
              : ""
          }
        </div>
      </div>
    </div>
  `;
}

function buildClientRows(items: CartEntry[], country: DealerCountryCode) {
  const rows = groupPrintItems(items);

  return rows
    .map((row) => {
      if (row.kind === "product") {
        const { item, displayIndex, isLastInGroup } = row;

        return `
          <tr class="${isLastInGroup ? "group-gap" : ""}">
            <td class="center">${displayIndex}</td>
            <td>${escapeHtml(item.collectionSlug)}</td>
            <td>${renderProductNameCell(item)}</td>
            <td>${escapeHtml(item.article)}</td>
            <td>${escapeHtml(item.color ?? "-")}</td>
            <td>${escapeHtml(item.size ?? "-")}</td>
            <td class="center">${item.quantity}</td>
            <td class="num">${formatMoney(item.unitBasePrice, country)}</td>
            <td class="num">${formatMoney(item.totalBasePrice, country)}</td>
          </tr>
        `;
      }

      const { item, isFirstChild, isLastChild, isLastInGroup } = row;

      return `
        <tr class="child-row ${isLastInGroup ? "group-gap" : ""}">
          <td class="index-child"></td>
          <td class="collection-child">${escapeHtml(item.collectionSlug)}</td>
          <td>${renderAddonNameCell(item, isFirstChild, isLastChild)}</td>
          <td>${escapeHtml(item.article)}</td>
          <td>${escapeHtml(item.color ?? "-")}</td>
          <td>${escapeHtml(item.size ?? "-")}</td>
          <td class="center">${item.quantity}</td>
          <td class="num">${formatMoney(item.unitBasePrice, country)}</td>
          <td class="num">${formatMoney(item.totalBasePrice, country)}</td>
        </tr>
      `;
    })
    .join("");
}

function buildInternalRows(items: CartEntry[], country: DealerCountryCode) {
  const rows = groupPrintItems(items);

  return rows
    .map((row) => {
      if (row.kind === "product") {
        const { item, displayIndex, isLastInGroup } = row;

        return `
          <tr class="${isLastInGroup ? "group-gap" : ""}">
            <td class="center">${displayIndex}</td>
            <td>${escapeHtml(item.collectionSlug)}</td>
            <td>${renderProductNameCell(item)}</td>
            <td>${escapeHtml(item.article)}</td>
            <td>${escapeHtml(item.color ?? "-")}</td>
            <td>${escapeHtml(item.size ?? "-")}</td>
            <td class="center">${item.quantity}</td>
            <td class="num">${formatMoney(item.unitBasePrice, country)}</td>
            <td class="center">${item.markupPercent}%</td>
            <td class="num">${formatMoney(item.unitFinalPrice, country)}</td>
            <td class="num">${formatMoney(item.totalFinalPrice, country)}</td>
          </tr>
        `;
      }

      const { item, isFirstChild, isLastChild, isLastInGroup } = row;

      return `
        <tr class="child-row ${isLastInGroup ? "group-gap" : ""}">
          <td class="index-child"></td>
          <td class="collection-child">${escapeHtml(item.collectionSlug)}</td>
          <td>${renderAddonNameCell(item, isFirstChild, isLastChild)}</td>
          <td>${escapeHtml(item.article)}</td>
          <td>${escapeHtml(item.color ?? "-")}</td>
          <td>${escapeHtml(item.size ?? "-")}</td>
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
  orderNumber: string;
  fileTitle: string;
  collectionTitle: string;
  collectionSlugs: string[];
  createdAt: string | Date;
  totalQty: number;
  subtotal: number;
  items: CartEntry[];
  country: DealerCountryCode;
}) {
  const {
    orderNumber,
    fileTitle,
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
        <title>${escapeHtml(fileTitle)}</title>
        ${getBasePrintStyles()}
      </head>
      <body>
        <div class="document">
          <div class="doc-header">
            <div class="brand-block">
              <div class="brand-name">LIONETO</div>
              <div class="brand-subtitle">Dealer Portal</div>
            </div>

            <div class="doc-right">
              <div class="doc-label">Номер заказа</div>
              <h1 class="doc-title">${escapeHtml(orderNumber)}</h1>
              <div class="doc-subtitle">
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
              <div class="meta-value">${escapeHtml(
                formatCollections(collectionSlugs),
              )}</div>
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

          <div class="table-wrap">
            <table>
              ${getClientColGroup()}
              <thead>
                <tr>
                  <th class="center">#</th>
                  <th>Коллекция</th>
                  <th>Наименование</th>
                  <th>Артикул</th>
                  <th>Цвет</th>
                  <th>Габариты</th>
                  <th class="center">Кол-во</th>
                  <th class="num">Цена</th>
                  <th class="num">Сумма</th>
                </tr>
              </thead>

              <tbody>
                ${buildClientRows(items, country)}
              </tbody>
            </table>
          </div>

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
          document.title = ${JSON.stringify(fileTitle)};
          window.onload = function () {
            window.print();
          };
        </script>
      </body>
    </html>
  `;
}

function buildInternalPrintHtml(params: {
  orderNumber: string;
  fileTitle: string;
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
    orderNumber,
    fileTitle,
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
        <title>${escapeHtml(fileTitle)}</title>
        ${getBasePrintStyles()}
      </head>
      <body>
        <div class="document">
          <div class="doc-header">
            <div class="brand-block">
              <div class="brand-name">LIONETO</div>
              <div class="brand-subtitle">Dealer Portal</div>
            </div>

            <div class="doc-right">
              <div class="doc-label">Номер заказа</div>
              <h1 class="doc-title">${escapeHtml(orderNumber)}</h1>
              <div class="doc-subtitle">
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
              <div class="meta-value">${escapeHtml(
                formatCollections(collectionSlugs),
              )}</div>
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

          <div class="table-wrap">
            <table>
              ${getInternalColGroup()}
              <thead>
                <tr>
                  <th class="center">#</th>
                  <th>Коллекция</th>
                  <th>Наименование</th>
                  <th>Артикул</th>
                  <th>Цвет</th>
                  <th>Габариты</th>
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
          </div>

          <div class="summary">
            <div class="summary-row">
              <span>Без наценки</span>
              <strong>${formatMoney(subtotal, country)}</strong>
            </div>

            <div class="summary-row">
              <span>После наценок по позициям</span>
              <strong>${formatMoney(totalWithItemMarkup, country)}</strong>
            </div>

            <div class="summary-row accent">
              <span>Общая наценка ${globalMarkupPercent}%</span>
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
          document.title = ${JSON.stringify(fileTitle)};
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
  orderNumber: string,
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
  const fileTitle = getPrintFileTitle(orderNumber);

  const html = withMarkup
    ? buildInternalPrintHtml({
        orderNumber,
        fileTitle,
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
        orderNumber,
        fileTitle,
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
            size: item.size,
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
          parentProductId: item.parentProductId ?? "",
          addonId: item.id,
          addonKind: item.addonKind,
          parentProductTitle: item.parentProductTitle,
          collectionSlug: item.collectionSlug,
          title: item.title,
          article: item.article,
          color: item.color,
          size: item.size,
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
            size: item.size,
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
          parentProductId: item.parentProductId ?? "",
          addonId: item.id,
          addonKind: item.addonKind,
          parentProductTitle: item.parentProductTitle,
          collectionSlug: item.collectionSlug,
          title: item.title,
          article: item.article,
          color: item.color,
          size: item.size,
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

  const fileTitle = getPrintFileTitle(order.orderNumber);

  const html = withMarkup
    ? buildInternalPrintHtml({
        orderNumber: order.orderNumber,
        fileTitle,
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
        orderNumber: order.orderNumber,
        fileTitle,
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