"use client";

import { useEffect, useRef, useState } from "react";

import DashboardNewsFeed, { type DashboardNewsItem } from "./DashboardNewsFeed";
import DealerProfileCard from "../components/DealerProfileCard";
import DashboardActivityLogger from "./DashboardActivityLogger";

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
  const [news, setNews] = useState<DashboardNewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingNews, setLoadingNews] = useState(true);
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

    async function loadNews() {
      try {
        setLoadingNews(true);

        const res = await fetch("/api/dealer/news", {
          method: "GET",
          cache: "no-store",
        });

        if (!res.ok) {
          const j = (await res.json().catch(() => null)) as {
            error?: string;
          } | null;
          throw new Error(j?.error || `Request failed (${res.status})`);
        }

        const j = (await res.json()) as {
          items?: DashboardNewsItem[];
        };

        if (!isMounted) return;
        setNews(j.items ?? []);
      } catch {
        if (!isMounted) return;
        setNews([]);
      } finally {
        if (!isMounted) return;
        setLoadingNews(false);
      }
    }

    void loadMe();
    void loadNews();

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
        actionType: "view_dashboard",
        entityType: "page",
        entityId: "/dealer/dashboard",
        entityTitle: "Dealer Dashboard",
        url: window.location.pathname,
        payload: {
          dealerTitle: dealer.title,
        },
      }),
    });
  }, [dealer]);

  return (
    <div className="space-y-6">
      <DashboardActivityLogger />

      <div>
        <h1 className="text-[34px] leading-[1.06] font-semibold tracking-[-0.02em]">
          Главная
        </h1>
        <p className="mt-2 text-[14px] text-black/60">
          Карточка компании и последние новости дилерского кабинета.
        </p>
      </div>

      {loading ? (
        <div className="rounded-[18px] border border-black/10 bg-white p-6 text-[14px] text-black/60">
          Загружаем данные дилера...
        </div>
      ) : error || !dealer ? (
        <div className="rounded-[18px] border border-red-200 bg-red-50 p-6 text-[14px] text-red-600">
          {error || "Не удалось загрузить данные дилера."}
        </div>
      ) : (
        <DealerProfileCard dealer={dealer} />
      )}

      <DashboardNewsFeed news={loadingNews ? [] : news} />
    </div>
  );
}
