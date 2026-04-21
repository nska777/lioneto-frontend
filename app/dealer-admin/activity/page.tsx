import Link from "next/link";
import { redirect } from "next/navigation";
import AdminBackToDealer from "../components/AdminBackToDealer";
import { getCurrentDealerAdmin } from "../lib/get-current-admin";

type StrapiActivityItem = {
  id: number;
  documentId?: string;
  actionType?: string;
  entityType?: string;
  entityId?: string;
  entityTitle?: string;
  url?: string;
  ip?: string;
  userAgent?: string;
  payload?: Record<string, unknown>;
  createdAt?: string;
  dealer?: {
    id?: number;
    login?: string;
    title?: string;
    email?: string;
  } | null;
};

type StrapiListResponse = {
  data?: Array<
    | StrapiActivityItem
    | {
        id?: number;
        documentId?: string;
        attributes?: Omit<StrapiActivityItem, "id" | "documentId"> & {
          dealer?: {
            data?: {
              id?: number;
              documentId?: string;
              attributes?: {
                login?: string;
                title?: string;
                email?: string;
              };
            } | null;
          };
        };
      }
  >;
};

type SearchParams = Promise<{
  dealer?: string;
  action?: string;
  range?: string;
}>;

type RangeKey = "today" | "7d" | "30d" | "all";

function getStrapiBase() {
  return (
    process.env.STRAPI_URL ||
    process.env.NEXT_PUBLIC_STRAPI_URL ||
    "http://localhost:1337"
  ).replace(/\/$/, "");
}

function getStrapiToken() {
  return (
    process.env.STRAPI_TOKEN ||
    process.env.STRAPI_API_TOKEN ||
    process.env.STRAPI_READONLY_TOKEN ||
    process.env.STRAPI_DEALER_TOKEN ||
    ""
  );
}

function normalizeActivityItem(
  item:
    | StrapiActivityItem
    | {
        id?: number;
        documentId?: string;
        attributes?: Omit<StrapiActivityItem, "id" | "documentId"> & {
          dealer?: {
            data?: {
              id?: number;
              documentId?: string;
              attributes?: {
                login?: string;
                title?: string;
                email?: string;
              };
            } | null;
          };
        };
      },
): StrapiActivityItem | null {
  if (!item || typeof item !== "object") return null;

  if ("attributes" in item && item.attributes) {
    const dealerData = item.attributes.dealer?.data;

    return {
      id: Number(item.id ?? 0),
      documentId: item.documentId,
      actionType: item.attributes.actionType,
      entityType: item.attributes.entityType,
      entityId: item.attributes.entityId,
      entityTitle: item.attributes.entityTitle,
      url: item.attributes.url,
      ip: item.attributes.ip,
      userAgent: item.attributes.userAgent,
      payload: item.attributes.payload,
      createdAt: item.attributes.createdAt,
      dealer: dealerData
        ? {
            id: dealerData.id,
            login: dealerData.attributes?.login,
            title: dealerData.attributes?.title,
            email: dealerData.attributes?.email,
          }
        : null,
    };
  }

  return item as StrapiActivityItem;
}

async function getActivities(): Promise<StrapiActivityItem[]> {
  const token = getStrapiToken();
  const base = getStrapiBase();

  if (!token) {
    console.error("[dealer-admin/activity] Missing Strapi token");
    return [];
  }

  try {
    const qs = new URLSearchParams();
    qs.set("sort[0]", "createdAt:desc");
    qs.set("pagination[pageSize]", "300");

    qs.set("populate[dealer][fields][0]", "login");
    qs.set("populate[dealer][fields][1]", "title");
    qs.set("populate[dealer][fields][2]", "email");

    const url = `${base}/api/dealer-activity-logs?${qs.toString()}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      console.error(
        "[dealer-admin/activity] Strapi fetch failed",
        res.status,
        text,
      );
      return [];
    }

    const json = (await res.json()) as StrapiListResponse;
    const rows = Array.isArray(json.data) ? json.data : [];

    return rows
      .map((item) => normalizeActivityItem(item))
      .filter(Boolean) as StrapiActivityItem[];
  } catch (error) {
    console.error("[dealer-admin/activity] getActivities failed", error);
    return [];
  }
}

function formatDate(value?: string) {
  if (!value) return "—";

  try {
    return new Intl.DateTimeFormat("ru-RU", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Tashkent",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function getDealerLogin(item: StrapiActivityItem) {
  if (item.dealer?.login) return item.dealer.login;
  if (typeof item.payload?.dealerLogin === "string") {
    return item.payload.dealerLogin;
  }
  return "—";
}

function getDealerTitle(item: StrapiActivityItem) {
  if (item.dealer?.title) return item.dealer.title;
  if (typeof item.payload?.dealerTitle === "string") {
    return item.payload.dealerTitle;
  }
  return "—";
}

function getUniqueDealers(items: StrapiActivityItem[]) {
  return Array.from(
    new Set(
      items
        .map((item) => getDealerLogin(item))
        .filter((value) => value && value !== "—"),
    ),
  ).sort((a, b) => a.localeCompare(b, "ru"));
}

function getUniqueActions(items: StrapiActivityItem[]) {
  return Array.from(
    new Set(items.map((item) => item.actionType || "").filter(Boolean)),
  ).sort((a, b) => a.localeCompare(b, "ru"));
}

function normalizeRange(value: string): RangeKey {
  if (value === "today" || value === "7d" || value === "30d") return value;
  return "all";
}

function isInRange(value: string | undefined, range: RangeKey) {
  if (!value) return false;
  if (range === "all") return true;

  const createdAt = new Date(value);
  if (Number.isNaN(createdAt.getTime())) return false;

  const now = new Date();

  if (range === "today") {
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return createdAt >= start;
  }

  const days = range === "7d" ? 7 : 30;
  const start = new Date(now);
  start.setDate(start.getDate() - days);
  return createdAt >= start;
}

function getTodayCount(items: StrapiActivityItem[]) {
  return items.filter((item) => isInRange(item.createdAt, "today")).length;
}

function getLoginCount(items: StrapiActivityItem[]) {
  return items.filter((item) => item.actionType === "login_success").length;
}

function getUniqueActiveDealersCount(items: StrapiActivityItem[]) {
  return new Set(
    items
      .map((item) => getDealerLogin(item))
      .filter((value) => value && value !== "—"),
  ).size;
}

function buildFilterHref(params: {
  dealer?: string;
  action?: string;
  range?: RangeKey;
}) {
  const qs = new URLSearchParams();

  if (params.dealer) qs.set("dealer", params.dealer);
  if (params.action) qs.set("action", params.action);
  if (params.range && params.range !== "all") qs.set("range", params.range);

  const s = qs.toString();
  return s ? `/dealer-admin/activity?${s}` : "/dealer-admin/activity";
}

function SummaryCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string | number;
  hint: string;
}) {
  return (
    <div className="rounded-[18px] border border-black/10 bg-white p-5 shadow-[0_14px_40px_-26px_rgba(0,0,0,0.35)]">
      <div className="text-[11px] uppercase tracking-[0.12em] text-black/40">
        {label}
      </div>
      <div className="mt-3 text-[30px] font-semibold tracking-[-0.03em] text-black">
        {value}
      </div>
      <div className="mt-2 text-[13px] text-black/50">{hint}</div>
    </div>
  );
}

function FilterChip({
  href,
  label,
  active,
}: {
  href: string;
  label: string;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={[
        "inline-flex rounded-full border px-3 py-2 text-[12px] font-medium transition-colors",
        active
          ? "border-[#E4D9B8] bg-[#F3EBD2] text-black"
          : "border-black/10 bg-white text-black/65 hover:text-black",
      ].join(" ")}
    >
      {label}
    </Link>
  );
}

function ActionBadge({ value }: { value: string }) {
  return (
    <span className="inline-flex rounded-full border border-black/10 bg-black/5 px-3 py-1 text-[12px] font-medium text-black">
      {value}
    </span>
  );
}

function getActionLabel(actionType?: string) {
  switch (actionType) {
    case "login_success":
      return "Успешный вход";
    case "password_changed":
      return "Пароль изменен";
    default:
      return actionType || "—";
  }
}

export default async function DealerAdminActivityPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const admin = await getCurrentDealerAdmin();

  if (!admin) {
    redirect("/dealer/dashboard");
  }

  const params = await searchParams;
  const selectedDealer =
    typeof params.dealer === "string" ? params.dealer.trim() : "";
  const selectedAction =
    typeof params.action === "string" ? params.action.trim() : "";
  const selectedRange = normalizeRange(
    typeof params.range === "string" ? params.range.trim() : "all",
  );

  const allItems = await getActivities();

  const dealers = getUniqueDealers(allItems);
  const actions = getUniqueActions(allItems);

  const items = allItems.filter((item) => {
    const dealerLogin = getDealerLogin(item);
    const actionType = item.actionType || "";

    const dealerOk = !selectedDealer || dealerLogin === selectedDealer;
    const actionOk = !selectedAction || actionType === selectedAction;
    const rangeOk = isInRange(item.createdAt, selectedRange);

    return dealerOk && actionOk && rangeOk;
  });

  const totalCount = allItems.length;
  const todayCount = getTodayCount(allItems);
  const loginCount = getLoginCount(allItems);
  const activeDealersCount = getUniqueActiveDealersCount(allItems);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-black/40">
            Owner monitoring
          </div>
          <h1 className="mt-2 text-[34px] font-semibold tracking-[-0.02em] text-black">
            Активность дилеров
          </h1>
          <p className="mt-2 text-[14px] text-black/60">
            Последние действия всех дилеров в портале.
          </p>
        </div>

        <AdminBackToDealer />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Всего записей"
          value={totalCount}
          hint="Все события в журнале"
        />
        <SummaryCard
          label="Активность сегодня"
          value={todayCount}
          hint="События с начала текущего дня"
        />
        <SummaryCard
          label="Успешные входы"
          value={loginCount}
          hint="Количество login_success"
        />
        <SummaryCard
          label="Активные дилеры"
          value={activeDealersCount}
          hint="Уникальные дилеры в журнале"
        />
      </div>

      <div className="rounded-[18px] border border-black/10 bg-white p-5 shadow-[0_14px_40px_-26px_rgba(0,0,0,0.35)]">
        <div className="text-[11px] uppercase tracking-[0.12em] text-black/40">
          Фильтры
        </div>

        <div className="mt-4 space-y-4">
          <div>
            <div className="mb-2 text-[12px] font-medium text-black/55">
              Период
            </div>
            <div className="flex flex-wrap gap-2">
              <FilterChip
                href={buildFilterHref({
                  dealer: selectedDealer || undefined,
                  action: selectedAction || undefined,
                  range: "today",
                })}
                label="Сегодня"
                active={selectedRange === "today"}
              />
              <FilterChip
                href={buildFilterHref({
                  dealer: selectedDealer || undefined,
                  action: selectedAction || undefined,
                  range: "7d",
                })}
                label="7 дней"
                active={selectedRange === "7d"}
              />
              <FilterChip
                href={buildFilterHref({
                  dealer: selectedDealer || undefined,
                  action: selectedAction || undefined,
                  range: "30d",
                })}
                label="30 дней"
                active={selectedRange === "30d"}
              />
              <FilterChip
                href={buildFilterHref({
                  dealer: selectedDealer || undefined,
                  action: selectedAction || undefined,
                  range: "all",
                })}
                label="Все время"
                active={selectedRange === "all"}
              />
            </div>
          </div>

          <div>
            <div className="mb-2 text-[12px] font-medium text-black/55">
              По дилеру
            </div>
            <div className="flex flex-wrap gap-2">
              <FilterChip
                href={buildFilterHref({
                  action: selectedAction || undefined,
                  range: selectedRange,
                })}
                label="Все дилеры"
                active={!selectedDealer}
              />
              {dealers.map((dealer) => (
                <FilterChip
                  key={dealer}
                  href={buildFilterHref({
                    dealer,
                    action: selectedAction || undefined,
                    range: selectedRange,
                  })}
                  label={dealer}
                  active={selectedDealer === dealer}
                />
              ))}
            </div>
          </div>

          <div>
            <div className="mb-2 text-[12px] font-medium text-black/55">
              По действию
            </div>
            <div className="flex flex-wrap gap-2">
              <FilterChip
                href={buildFilterHref({
                  dealer: selectedDealer || undefined,
                  range: selectedRange,
                })}
                label="Все действия"
                active={!selectedAction}
              />
              {actions.map((action) => (
                <FilterChip
                  key={action}
                  href={buildFilterHref({
                    dealer: selectedDealer || undefined,
                    action,
                    range: selectedRange,
                  })}
                  label={getActionLabel(action)}
                  active={selectedAction === action}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-[18px] border border-black/10 bg-white shadow-[0_14px_40px_-26px_rgba(0,0,0,0.35)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-black/10 px-5 py-4 text-[13px] text-black/55">
          <div>Найдено записей: {items.length}</div>

          {(selectedDealer || selectedAction || selectedRange !== "all") && (
            <Link
              href="/dealer-admin/activity"
              className="rounded-full border border-black/10 px-3 py-2 text-[12px] font-medium text-black/65 transition-colors hover:text-black"
            >
              Сбросить фильтры
            </Link>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b border-black/10 text-[11px] uppercase tracking-[0.12em] text-black/40">
                <th className="px-5 py-4">Дата</th>
                <th className="px-5 py-4">Дилер</th>
                <th className="px-5 py-4">Действие</th>
                <th className="px-5 py-4">Объект</th>
                <th className="px-5 py-4">URL</th>
                <th className="px-5 py-4">IP</th>
                <th className="px-5 py-4">User-Agent</th>
              </tr>
            </thead>

            <tbody>
              {items.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-[14px] text-black/45"
                  >
                    По текущим фильтрам записей нет.
                  </td>
                </tr>
              )}

              {items.length > 0 &&
                items.map((item) => {
                  const dealerLogin = getDealerLogin(item);
                  const dealerTitle = getDealerTitle(item);

                  return (
                    <tr
                      key={item.id}
                      className="border-b border-black/5 align-top text-[14px] text-black/80 transition-colors hover:bg-black/[0.02]"
                    >
                      <td className="whitespace-nowrap px-5 py-4">
                        {formatDate(item.createdAt)}
                      </td>

                      <td className="px-5 py-4">
                        {dealerLogin !== "—" ? (
                          <Link
                            href={`/dealer-admin/dealers/${encodeURIComponent(
                              dealerLogin,
                            )}`}
                            className="font-medium text-black underline-offset-4 hover:underline"
                          >
                            {dealerLogin}
                          </Link>
                        ) : (
                          <div className="font-medium text-black">—</div>
                        )}

                        <div className="mt-1 text-[12px] text-black/45">
                          {dealerTitle}
                        </div>

                        {dealerLogin !== "—" ? (
                          <Link
                            href={buildFilterHref({
                              dealer: dealerLogin,
                              range: selectedRange,
                            })}
                            className="mt-2 inline-flex text-[12px] text-black/55 underline-offset-4 hover:text-black hover:underline"
                          >
                            Показать только этого дилера
                          </Link>
                        ) : null}
                      </td>

                      <td className="px-5 py-4">
                        <ActionBadge value={getActionLabel(item.actionType)} />
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-medium text-black">
                          {item.entityTitle || "—"}
                        </div>
                        <div className="mt-1 text-[12px] text-black/45">
                          {item.entityType || "—"} · {item.entityId || "—"}
                        </div>
                      </td>

                      <td className="max-w-[260px] px-5 py-4 text-[13px] text-black/55">
                        <span className="break-all">{item.url || "—"}</span>
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-[13px] text-black/55">
                        {item.ip || "—"}
                      </td>

                      <td className="max-w-[280px] px-5 py-4 text-[12px] leading-5 text-black/45">
                        <span className="break-all">
                          {item.userAgent || "—"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
