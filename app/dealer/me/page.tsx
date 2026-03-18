"use client";

import { useEffect, useRef, useState } from "react";

import DealerProfileCard from "../components/DealerProfileCard";

type DealerMe = {
  dealerId: number | null;
  title: string;
  email: string;
  phone: string;
  city: string;
  address: string;
  region: string;
  managerName: string;
  mustChangePassword: boolean;
};

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
          dealerTitle: dealer.title,
        },
      }),
    });
  }, [dealer]);

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

      <DealerProfileCard dealer={dealer} />
    </div>
  );
}
