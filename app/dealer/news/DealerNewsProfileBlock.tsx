"use client";

import { useEffect, useState } from "react";
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

export default function DealerNewsProfileBlock() {
  const [dealer, setDealer] = useState<DealerMe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

    void loadMe();

    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="rounded-[18px] border border-black/10 bg-white p-6 text-[14px] text-black/60">
        Загружаем данные дилера...
      </div>
    );
  }

  if (error || !dealer) {
    return (
      <div className="rounded-[18px] border border-red-200 bg-red-50 p-6 text-[14px] text-red-600">
        {error || "Не удалось загрузить профиль дилера."}
      </div>
    );
  }

  return <DealerProfileCard dealer={dealer} />;
}
