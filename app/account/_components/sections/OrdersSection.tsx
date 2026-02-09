"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase/client";
import { ShoppingBag } from "lucide-react";

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

// пока нет таблицы orders — делаем аккуратный fallback
type OrderRow = {
  id: string;
  status: string | null;
  total: number | null;
  created_at: string;
};

export default function OrdersSection({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<OrderRow[]>([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      setErr(null);
      setLoading(true);

      // ⚠️ Если таблицы orders ещё нет — запрос вернёт ошибку.
      const { data, error } = await supabase
        .from("orders")
        .select("id,status,total,created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (!alive) return;

      if (error) {
        // Таблицы нет или RLS не настроен — покажем текст, не ломая страницу
        setErr(error.message);
        setRows([]);
        setLoading(false);
        return;
      }

      setRows((data as any) ?? []);
      setLoading(false);
    })();

    return () => {
      alive = false;
    };
  }, [userId]);

  return (
    <div className="rounded-[28px] border border-black/10 bg-white p-5 shadow-[0_16px_60px_rgba(0,0,0,0.06)]">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="h-10 w-10 rounded-2xl bg-black/[0.04] grid place-items-center">
            <ShoppingBag className="h-5 w-5 text-black/60" />
          </div>
          <div>
            <div className="text-[12px] tracking-[0.22em] uppercase text-black/50">
              История заказов
            </div>
            <div className="mt-1 text-[14px] text-black/70">
              Здесь будут отображаться ваши покупки и статусы доставки.
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5">
        {loading ? (
          <div className="text-[14px] text-black/60">Загрузка…</div>
        ) : err ? (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.08] px-4 py-3 text-[13px] text-amber-900">
            <div className="font-medium">Пока нет таблицы заказов.</div>
            <div className="mt-1 text-black/70">
              Ошибка Supabase: <span className="font-mono">{err}</span>
            </div>
            <div className="mt-2 text-black/70">
              Следующий шаг: создаём таблицу{" "}
              <span className="font-mono">orders</span> и RLS.
            </div>
          </div>
        ) : rows.length === 0 ? (
          <div className="rounded-2xl border border-black/10 bg-black/[0.02] px-4 py-4 text-[14px] text-black/70">
            У вас пока нет заказов.
          </div>
        ) : (
          <div className="grid gap-2">
            {rows.map((o) => (
              <div
                key={o.id}
                className="rounded-2xl border border-black/10 px-4 py-3 hover:bg-black/[0.02] transition"
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="text-[13px] text-black/80">
                    Заказ <span className="font-mono">{o.id.slice(0, 8)}</span>
                  </div>
                  <div className="text-[12px] text-black/50">
                    {new Date(o.created_at).toLocaleString()}
                  </div>
                </div>
                <div className="mt-1 text-[13px] text-black/70">
                  Статус:{" "}
                  <span className="text-black/80">{o.status ?? "—"}</span> •
                  Сумма: <span className="text-black/80">{o.total ?? "—"}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
