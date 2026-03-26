"use client";

import { useState } from "react";
import {
  ShoppingBag,
  User,
  MapPin,
  CreditCard,
  Heart,
  Megaphone,
  LogOut,
} from "lucide-react";
import AccountProfile from "./_components/sections/AccountProfile";
import AccountOrders from "./_components/sections/AccountOrders";
type TabKey =
  | "orders"
  | "profile"
  | "address"
  | "payments"
  | "wishlist"
  | "marketing";

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

type AccountUser = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  countryCode?: string | null;
};

export default function AccountShell({ user }: { user: AccountUser }) {
  const [tab, setTab] = useState<TabKey>("orders");
  const [loadingLogout, setLoadingLogout] = useState(false);
  const [liveUser, setLiveUser] = useState<AccountUser>(user);

  const fullName = [liveUser.firstName, liveUser.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  const menu = [
    { key: "orders" as const, label: "История заказов", icon: ShoppingBag },
    { key: "profile" as const, label: "Личные данные", icon: User },
    { key: "address" as const, label: "Адресная книга", icon: MapPin },
    { key: "payments" as const, label: "Способы оплаты", icon: CreditCard },
    { key: "wishlist" as const, label: "Список желаний", icon: Heart },
    {
      key: "marketing" as const,
      label: "Маркетинговые предпочтения",
      icon: Megaphone,
    },
  ];

  async function signOut() {
    try {
      setLoadingLogout(true);
      await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
      });
      location.href = "/";
    } finally {
      setLoadingLogout(false);
    }
  }

  return (
    <main className="bg-white text-black">
      <div className="mx-auto max-w-[1180px] px-4 py-10">
        <div>
          <h1 className="text-[28px] tracking-[-0.02em]">
            Привет{fullName ? `, ${fullName}` : ""}
          </h1>
          <div className="mt-1 text-[13px] text-black/55">
            {liveUser.phone ?? "Телефон не указан"}
          </div>
        </div>

        <div className="mt-6 h-px w-full bg-black/10" />

        <div className="mt-6 grid gap-8 lg:grid-cols-[280px_1fr]">
          <aside className="space-y-2">
            {menu.map((m) => {
              const Icon = m.icon;
              const active = tab === m.key;

              return (
                <button
                  key={m.key}
                  onClick={() => setTab(m.key)}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-2xl px-3 py-3 text-left transition",
                    "hover:bg-black/[0.03] cursor-pointer",
                    active && "bg-black/[0.04]",
                  )}
                >
                  <Icon className="h-4 w-4 text-black/70" />
                  <span className="text-[14px] text-black/80">{m.label}</span>
                </button>
              );
            })}

            <div className="pt-6">
              <button
                onClick={signOut}
                disabled={loadingLogout}
                className="w-full flex items-center gap-3 rounded-2xl px-3 py-3 text-left transition cursor-pointer hover:bg-black/[0.03] disabled:opacity-60"
              >
                <LogOut className="h-4 w-4 text-black/70" />
                <span className="text-[14px] text-black/80">Выход</span>
              </button>
            </div>
          </aside>

          <section className="min-w-0">
            {tab === "orders" && <AccountOrders />}

            {tab === "profile" && (
              <AccountProfile
                user={liveUser}
                onProfileUpdated={(nextUser) => {
                  setLiveUser(nextUser);
                }}
              />
            )}

            {tab === "address" && (
              <div className="rounded-[28px] border border-black/10 bg-white p-5">
                <div className="text-[12px] tracking-[0.22em] uppercase text-black/50">
                  Адресная книга
                </div>
                <div className="mt-2 text-[14px] text-black/70">
                  Здесь позже подключим адреса пользователя.
                </div>
              </div>
            )}

            {tab === "payments" && (
              <div className="rounded-[28px] border border-black/10 bg-white p-5">
                <div className="text-[12px] tracking-[0.22em] uppercase text-black/50">
                  Способы оплаты
                </div>
                <div className="mt-2 text-[14px] text-black/70">
                  Здесь позже подключим сохранённые способы оплаты.
                </div>
              </div>
            )}

            {tab === "wishlist" && (
              <div className="rounded-[28px] border border-black/10 bg-white p-5">
                <div className="text-[12px] tracking-[0.22em] uppercase text-black/50">
                  Список желаний
                </div>
                <div className="mt-2 text-[14px] text-black/70">
                  Здесь позже подключим избранные товары.
                </div>
              </div>
            )}

            {tab === "marketing" && (
              <div className="rounded-[28px] border border-black/10 bg-white p-5">
                <div className="text-[12px] tracking-[0.22em] uppercase text-black/50">
                  Маркетинговые предпочтения
                </div>
                <div className="mt-2 text-[14px] text-black/70">
                  Здесь позже подключим настройки уведомлений.
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
