"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type DealerRole = "dealer" | "admin" | "owner";

type DealerMe = {
  dealerId: number | null;
  login: string;
  title: string;
  email: string;
  phone: string;
  city: string;
  region: string;
  role: DealerRole | "";
  managerName: string;
  mustChangePassword: boolean;
};

function getRegionLabel(region: string) {
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

function getRoleLabel(role: string) {
  switch (role) {
    case "dealer":
      return "Дилер";
    case "admin":
      return "Администратор";
    case "owner":
      return "Владелец";
    default:
      return "—";
  }
}

export default function Page() {
  const [dealer, setDealer] = useState<DealerMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loggedViewRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    async function loadMe() {
      try {
        setLoading(true);
        setError(null);

        const res = await fetch("/api/dealer/auth/me", {
          method: "GET",
          cache: "no-store",
        });

        if (!res.ok) {
          const j = (await res.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(j?.error || `Request failed (${res.status})`);
        }

        const j = (await res.json()) as { dealer?: DealerMe };

        if (!isMounted) return;

        setDealer(j.dealer ?? null);
      } catch (err) {
        if (!isMounted) return;
        setError(err instanceof Error ? err.message : "Failed to load dealer");
      } finally {
        if (!isMounted) return;
        setLoading(false);
      }
    }

    loadMe();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!dealer || loggedViewRef.current) return;

    loggedViewRef.current = true;

    void fetch("/api/dealer/activity", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store",
      body: JSON.stringify({
        actionType: "view_profile",
        entityType: "page",
        entityId: "/dealer/me",
        entityTitle: "Dealer Profile",
        url: window.location.pathname,
        payload: {
          dealerLogin: dealer.login,
        },
      }),
    });
  }, [dealer]);

  const regionLabel = useMemo(() => {
    return getRegionLabel(dealer?.region ?? "");
  }, [dealer?.region]);

  const roleLabel = useMemo(() => {
    return getRoleLabel(dealer?.role ?? "");
  }, [dealer?.role]);

  if (loading) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-[34px] leading-[1.06] font-semibold tracking-[-0.02em]">
            Загрузка...
          </h1>
          <p className="mt-2 text-[14px] text-black/60">
            Получаем данные дилера.
          </p>
        </div>
      </div>
    );
  }

  if (error || !dealer) {
    return (
      <div className="space-y-5">
        <div>
          <h1 className="text-[34px] leading-[1.06] font-semibold tracking-[-0.02em]">
            Ошибка
          </h1>
          <p className="mt-2 text-[14px] text-red-600">
            {error || "Не удалось загрузить профиль дилера."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-[34px] leading-[1.06] font-semibold tracking-[-0.02em]">
          Добро пожаловать 👋
        </h1>
        <p className="mt-2 text-[14px] text-black/60">
          Вы авторизованы в дилерском портале Lioneto.
        </p>
      </div>

      <div className="rounded-[18px] border border-black/10 bg-white shadow-[0_14px_40px_-26px_rgba(0,0,0,0.35)]">
        <div className="grid gap-4 p-6 sm:grid-cols-2">
          <div>
            <div className="text-[11px] uppercase tracking-[0.12em] text-black/40">
              Компания
            </div>
            <div className="mt-1 text-[15px] font-semibold text-black">
              {dealer.title || "—"}
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-[0.12em] text-black/40">
              Login
            </div>
            <div className="mt-1 text-[15px] font-semibold text-black">
              {dealer.login || "—"}
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-[0.12em] text-black/40">
              Email
            </div>
            <div className="mt-1 text-[15px] font-semibold text-black">
              {dealer.email || "—"}
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-[0.12em] text-black/40">
              Телефон
            </div>
            <div className="mt-1 text-[15px] font-semibold text-black">
              {dealer.phone || "—"}
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-[0.12em] text-black/40">
              Город
            </div>
            <div className="mt-1 text-[15px] font-semibold text-black">
              {dealer.city || "—"}
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-[0.12em] text-black/40">
              Регион
            </div>
            <div className="mt-1 text-[15px] font-semibold text-black">
              {regionLabel}
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-[0.12em] text-black/40">
              Роль
            </div>
            <div className="mt-1 text-[15px] font-semibold text-black">
              {roleLabel}
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-[0.12em] text-black/40">
              Менеджер
            </div>
            <div className="mt-1 text-[15px] font-semibold text-black">
              {dealer.managerName || "—"}
            </div>
          </div>
        </div>

        {dealer.mustChangePassword ? (
          <div className="border-t border-black/10 px-6 py-4">
            <div className="rounded-xl border border-amber-300/40 bg-amber-50 px-4 py-3 text-[13px] text-amber-800">
              Для этого аккаунта включена обязательная смена пароля.
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}
