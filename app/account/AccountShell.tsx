"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/app/lib/supabase/client";
import PhoneGate from "./PhoneGate";

import AccountProfile from "./_components/sections/AccountProfile";
import OrdersSection from "./_components/sections/OrdersSection";
import AddressSection from "./_components/sections/AddressSection";
import PaymentsSection from "./_components/sections/PaymentsSection";
import WishlistSection from "./_components/sections/WishlistSection";
import MarketingSection from "./_components/sections/MarketingSection";

import {
  ShoppingBag,
  User,
  MapPin,
  CreditCard,
  Heart,
  Megaphone,
  LogOut,
} from "lucide-react";

type TabKey =
  | "orders"
  | "profile"
  | "address"
  | "payments"
  | "wishlist"
  | "marketing";

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

export type ProfileRow = {
  full_name: string | null;
  phone_e164: string | null;
  phone_verified: boolean;
};

export default function AccountShell({
  userId,
  email,
}: {
  userId: string;
  email: string | null;
}) {
  const [tab, setTab] = useState<TabKey>("orders");

  const [profile, setProfile] = useState<ProfileRow | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // ✅ режим редактирования телефона (открывает PhoneGate даже если телефон уже есть)
  const [editingPhone, setEditingPhone] = useState(false);

  // ✅ телефон обязателен
  const phoneRequired = useMemo(
    () => !profile?.phone_e164,
    [profile?.phone_e164],
  );

  // ✅ загрузка профиля и автосоздание строки profiles при первом заходе
  useEffect(() => {
    let alive = true;

    (async () => {
      setProfileLoading(true);

      const { data, error } = await supabase
        .from("profiles")
        .select("full_name, phone_e164, phone_verified")
        .eq("user_id", userId)
        .maybeSingle();

      // если профиля нет — создаём
      if (!data && !error) {
        const ins = await supabase
          .from("profiles")
          .insert({ user_id: userId })
          .select("full_name, phone_e164, phone_verified")
          .single();

        if (!alive) return;
        setProfile((ins.data as any) ?? null);
        setProfileLoading(false);
        return;
      }

      if (!alive) return;
      setProfile((data as any) ?? null);
      setProfileLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [userId]);

  // ✅ если телефона нет — автоматически показываем "Личные данные"
  useEffect(() => {
    if (phoneRequired) setTab("profile");
  }, [phoneRequired]);

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

  const isLocked = (k: TabKey) => phoneRequired && k !== "profile";

  async function signOut() {
    await supabase.auth.signOut();
    location.href = "/";
  }

  return (
    <main className="bg-white text-black">
      <div className="mx-auto max-w-[1180px] px-4 py-10">
        {/* header */}
        <div>
          <h1 className="text-[28px] tracking-[-0.02em]">
            Привет{profile?.full_name ? `, ${profile.full_name}` : ""}
          </h1>
          <div className="mt-1 text-[13px] text-black/55">{email ?? "—"}</div>
        </div>

        <div className="mt-6 h-px w-full bg-black/10" />

        <div className="mt-6 grid gap-8 lg:grid-cols-[280px_1fr]">
          {/* left menu */}
          <aside className="space-y-2">
            {menu.map((m) => {
              const Icon = m.icon;
              const active = tab === m.key;
              const locked = isLocked(m.key);

              return (
                <button
                  key={m.key}
                  onClick={() => !locked && setTab(m.key)}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-2xl px-3 py-3 text-left transition",
                    "hover:bg-black/[0.03] cursor-pointer",
                    active && "bg-black/[0.04]",
                    locked &&
                      "opacity-45 cursor-not-allowed hover:bg-transparent",
                  )}
                >
                  <Icon className="h-4 w-4 text-black/70" />
                  <span className="text-[14px] text-black/80">{m.label}</span>

                  {locked && (
                    <span className="ml-auto text-[11px] tracking-[0.18em] uppercase text-black/50">
                      phone
                    </span>
                  )}
                </button>
              );
            })}

            <div className="pt-6">
              <button
                onClick={signOut}
                className="w-full flex items-center gap-3 rounded-2xl px-3 py-3 text-left transition cursor-pointer hover:bg-black/[0.03]"
              >
                <LogOut className="h-4 w-4 text-black/70" />
                <span className="text-[14px] text-black/80">Выход</span>
              </button>
            </div>
          </aside>

          {/* right content */}
          <section className="min-w-0">
            {profileLoading ? (
              <div className="rounded-[28px] border border-black/10 bg-white p-5">
                <div className="text-[12px] tracking-[0.22em] uppercase text-black/50">
                  Загружаем профиль…
                </div>
              </div>
            ) : (
              <>
                {/* PhoneGate показываем, если телефона нет ИЛИ если пользователь нажал "Изменить телефон" */}
                {(phoneRequired || editingPhone) && (
                  <PhoneGate
                    userId={userId}
                    initialPhone={profile?.phone_e164 ?? ""}
                    onClose={() => setEditingPhone(false)}
                    onSaved={(p) => {
                      setProfile(p);
                      setEditingPhone(false);
                      if (p.phone_e164) setTab("profile");
                    }}
                  />
                )}

                {/* Блокируем остальные вкладки, пока phoneRequired */}
                <div
                  className={cn(
                    phoneRequired &&
                      tab !== "profile" &&
                      "opacity-50 pointer-events-none",
                  )}
                >
                  {tab === "orders" && <OrdersSection userId={userId} />}

                  {tab === "profile" && (
                    <AccountProfile
                      userId={userId}
                      email={email}
                      profile={profile}
                      onProfile={(p: ProfileRow) => setProfile(p)}
                      onEditPhone={() => setEditingPhone(true)}
                    />
                  )}

                  {tab === "address" && <AddressSection userId={userId} />}

                  {tab === "payments" && <PaymentsSection />}

                  {tab === "wishlist" && <WishlistSection userId={userId} />}

                  {tab === "marketing" && <MarketingSection userId={userId} />}
                </div>
              </>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
