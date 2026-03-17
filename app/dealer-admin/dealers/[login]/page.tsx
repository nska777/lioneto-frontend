import Link from "next/link";
import { redirect } from "next/navigation";
import AdminBackToDealer from "../../components/AdminBackToDealer";
import { getCurrentDealerAdmin } from "../../lib/get-current-admin";

type StrapiDealer = {
  id: number;
  documentId?: string;
  title?: string;
  slug?: string;
  passwordHash?: string;
  login?: string;
  email?: string;
  phone?: string;
  city?: string;
  region?: string;
  isActive?: boolean;
  mustChangePassword?: boolean;
  roleLabel?: string;
  managerName?: string;
  notes?: string;
};

type StrapiDealerListResponse = {
  data?: StrapiDealer[];
};

type StrapiActivityItem = {
  id: number;
  createdAt?: string;
  actionType?: string;
  entityType?: string;
  entityId?: string;
  entityTitle?: string;
  url?: string;
  ip?: string;
  userAgent?: string;
  payload?: Record<string, unknown>;
  dealer?: {
    id?: number;
    login?: string;
    title?: string;
    email?: string;
  };
};

type StrapiActivityListResponse = {
  data?: StrapiActivityItem[];
};

function getStrapiBase() {
  return (
    process.env.STRAPI_URL ||
    process.env.NEXT_PUBLIC_STRAPI_URL ||
    "http://localhost:1337"
  ).replace(/\/$/, "");
}

function getOwnerAdminLogins() {
  const raw = process.env.DEALER_ADMIN_LOGINS || "";
  return raw
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

async function getDealers(): Promise<StrapiDealer[]> {
  const token = process.env.STRAPI_TOKEN;
  const base = getStrapiBase();

  if (!token) return [];

  const res = await fetch(
    `${base}/api/dealers?sort[0]=title:asc&pagination[pageSize]=200`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  if (!res.ok) return [];

  const json = (await res.json()) as StrapiDealerListResponse;
  return Array.isArray(json.data) ? json.data : [];
}

async function getActivities(): Promise<StrapiActivityItem[]> {
  const token = process.env.STRAPI_TOKEN;
  const base = getStrapiBase();

  if (!token) return [];

  const res = await fetch(
    `${base}/api/dealer-activity-logs?populate[dealer]=*&sort[0]=createdAt:desc&pagination[pageSize]=500`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    },
  );

  if (!res.ok) return [];

  const json = (await res.json()) as StrapiActivityListResponse;
  return Array.isArray(json.data) ? json.data : [];
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

function getRegionLabel(region?: string) {
  switch (region) {
    case "russia":
      return "Россия";
    case "uzbekistan":
      return "Узбекистан";
    case "kazakhstan":
      return "Казахстан";
    case "tajikistan":
      return "Таджикистан";
    default:
      return region || "—";
  }
}

function getDealerLoginFromActivity(item: StrapiActivityItem) {
  if (item.dealer?.login) return item.dealer.login;
  if (typeof item.payload?.dealerLogin === "string") {
    return item.payload.dealerLogin;
  }
  return "";
}

function getLastLogin(
  activities: StrapiActivityItem[],
  login: string,
): StrapiActivityItem | null {
  return (
    activities.find(
      (item) =>
        getDealerLoginFromActivity(item) === login &&
        item.actionType === "login_success",
    ) || null
  );
}

function getLastActivity(
  activities: StrapiActivityItem[],
  login: string,
): StrapiActivityItem | null {
  return (
    activities.find((item) => getDealerLoginFromActivity(item) === login) ||
    null
  );
}

function getActivityCount(activities: StrapiActivityItem[], login: string) {
  return activities.filter((item) => getDealerLoginFromActivity(item) === login)
    .length;
}

function StatusBadge({
  active,
  onLabel,
  offLabel,
}: {
  active: boolean;
  onLabel: string;
  offLabel: string;
}) {
  return (
    <span
      className={[
        "inline-flex rounded-full border px-3 py-1 text-[12px] font-medium",
        active
          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
          : "border-black/10 bg-black/5 text-black/55",
      ].join(" ")}
    >
      {active ? onLabel : offLabel}
    </span>
  );
}

function OwnerBadge() {
  return (
    <span className="inline-flex rounded-full border border-[#E4D9B8] bg-[#F8F1DD] px-3 py-1 text-[12px] font-medium text-black">
      Owner admin
    </span>
  );
}

export default async function DealerAdminDealersPage() {
  const admin = await getCurrentDealerAdmin();

  if (!admin) {
    redirect("/dealer/dashboard");
  }

  const [dealers, activities] = await Promise.all([
    getDealers(),
    getActivities(),
  ]);

  const ownerAdminLogins = new Set(getOwnerAdminLogins());

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[11px] uppercase tracking-[0.14em] text-black/40">
            Owner monitoring
          </div>
          <h1 className="mt-2 text-[34px] font-semibold tracking-[-0.02em] text-black">
            Дилеры
          </h1>
          <p className="mt-2 text-[14px] text-black/60">
            Список всех дилеров, их статус и последняя активность.
          </p>
        </div>

        <AdminBackToDealer />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-[18px] border border-black/10 bg-white p-5 shadow-[0_14px_40px_-26px_rgba(0,0,0,0.35)]">
          <div className="text-[11px] uppercase tracking-[0.12em] text-black/40">
            Всего дилеров
          </div>
          <div className="mt-3 text-[30px] font-semibold tracking-[-0.03em] text-black">
            {dealers.length}
          </div>
          <div className="mt-2 text-[13px] text-black/50">
            Все аккаунты из коллекции Dealer
          </div>
        </div>

        <div className="rounded-[18px] border border-black/10 bg-white p-5 shadow-[0_14px_40px_-26px_rgba(0,0,0,0.35)]">
          <div className="text-[11px] uppercase tracking-[0.12em] text-black/40">
            Активные аккаунты
          </div>
          <div className="mt-3 text-[30px] font-semibold tracking-[-0.03em] text-black">
            {dealers.filter((d) => Boolean(d.isActive)).length}
          </div>
          <div className="mt-2 text-[13px] text-black/50">
            Дилеры с включенным доступом
          </div>
        </div>

        <div className="rounded-[18px] border border-black/10 bg-white p-5 shadow-[0_14px_40px_-26px_rgba(0,0,0,0.35)]">
          <div className="text-[11px] uppercase tracking-[0.12em] text-black/40">
            Смена пароля
          </div>
          <div className="mt-3 text-[30px] font-semibold tracking-[-0.03em] text-black">
            {dealers.filter((d) => Boolean(d.mustChangePassword)).length}
          </div>
          <div className="mt-2 text-[13px] text-black/50">
            Аккаунты с обязательной сменой пароля
          </div>
        </div>

        <div className="rounded-[18px] border border-black/10 bg-white p-5 shadow-[0_14px_40px_-26px_rgba(0,0,0,0.35)]">
          <div className="text-[11px] uppercase tracking-[0.12em] text-black/40">
            Всего действий
          </div>
          <div className="mt-3 text-[30px] font-semibold tracking-[-0.03em] text-black">
            {activities.length}
          </div>
          <div className="mt-2 text-[13px] text-black/50">
            Записи в журнале активности
          </div>
        </div>
      </div>

      <div className="rounded-[18px] border border-black/10 bg-white shadow-[0_14px_40px_-26px_rgba(0,0,0,0.35)]">
        <div className="border-b border-black/10 px-5 py-4 text-[13px] text-black/55">
          Всего записей: {dealers.length}
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-left">
            <thead>
              <tr className="border-b border-black/10 text-[11px] uppercase tracking-[0.12em] text-black/40">
                <th className="px-5 py-4">Дилер</th>
                <th className="px-5 py-4">Контакты</th>
                <th className="px-5 py-4">Регион</th>
                <th className="px-5 py-4">Статус</th>
                <th className="px-5 py-4">Последний вход</th>
                <th className="px-5 py-4">Последнее действие</th>
                <th className="px-5 py-4">Событий</th>
              </tr>
            </thead>

            <tbody>
              {dealers.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="px-5 py-10 text-center text-[14px] text-black/45"
                  >
                    Дилеров пока нет.
                  </td>
                </tr>
              ) : (
                dealers.map((dealer) => {
                  const login = dealer.login || "";
                  const lastLogin = login
                    ? getLastLogin(activities, login)
                    : null;
                  const lastActivity = login
                    ? getLastActivity(activities, login)
                    : null;
                  const activityCount = login
                    ? getActivityCount(activities, login)
                    : 0;
                  const isOwnerAdmin = login
                    ? ownerAdminLogins.has(login)
                    : false;

                  return (
                    <tr
                      key={dealer.id}
                      className="border-b border-black/5 align-top text-[14px] text-black/80 transition-colors hover:bg-black/[0.02]"
                    >
                      <td className="px-5 py-4">
                        <Link
                          href={`/dealer-admin/dealers/${encodeURIComponent(
                            login || String(dealer.id),
                          )}`}
                          className="font-medium text-black underline-offset-4 hover:underline"
                        >
                          {dealer.login || "—"}
                        </Link>

                        <div className="mt-1 text-[12px] text-black/45">
                          {dealer.title || "—"}
                        </div>

                        <div className="mt-2 flex flex-wrap gap-2">
                          <span className="text-[12px] text-black/40">
                            ID: {dealer.id}
                          </span>
                          {isOwnerAdmin ? <OwnerBadge /> : null}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div>{dealer.email || "—"}</div>
                        <div className="mt-1 text-[13px] text-black/55">
                          {dealer.phone || "—"}
                        </div>
                        <div className="mt-1 text-[13px] text-black/45">
                          {dealer.managerName || "—"}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div>{getRegionLabel(dealer.region)}</div>
                        <div className="mt-1 text-[13px] text-black/55">
                          {dealer.city || "—"}
                        </div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex flex-wrap gap-2">
                          <StatusBadge
                            active={Boolean(dealer.isActive)}
                            onLabel="Активен"
                            offLabel="Отключен"
                          />
                          <StatusBadge
                            active={Boolean(dealer.mustChangePassword)}
                            onLabel="Смена пароля"
                            offLabel="Пароль ок"
                          />
                        </div>
                      </td>

                      <td className="px-5 py-4 text-[13px] text-black/60">
                        {lastLogin
                          ? formatDate(lastLogin.createdAt)
                          : "Нет входов"}
                      </td>

                      <td className="px-5 py-4">
                        {lastActivity ? (
                          <>
                            <div className="font-medium text-black">
                              {lastActivity.actionType || "—"}
                            </div>
                            <div className="mt-1 text-[12px] text-black/45">
                              {lastActivity.entityTitle || "—"}
                            </div>
                            <div className="mt-1 text-[12px] text-black/40">
                              {formatDate(lastActivity.createdAt)}
                            </div>
                          </>
                        ) : (
                          <span className="text-[13px] text-black/45">
                            Нет активности
                          </span>
                        )}
                      </td>

                      <td className="px-5 py-4">
                        {login ? (
                          <Link
                            href={`/dealer-admin/activity?dealer=${encodeURIComponent(
                              login,
                            )}`}
                            className="inline-flex rounded-full border border-black/10 bg-black/5 px-3 py-1 text-[12px] font-medium text-black transition-colors hover:bg-black/10"
                          >
                            {activityCount}
                          </Link>
                        ) : (
                          <div className="inline-flex rounded-full border border-black/10 bg-black/5 px-3 py-1 text-[12px] font-medium text-black">
                            {activityCount}
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
