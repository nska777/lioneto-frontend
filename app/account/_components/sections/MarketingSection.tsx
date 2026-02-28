"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase/client";

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

type Prefs = {
  sms?: boolean;
  whatsapp?: boolean;
  email?: boolean;
};

function readMarketing(value: unknown): Prefs {
  // Strapi/Supabase jsonb может прийти как object | null
  if (!value || typeof value !== "object") {
    return { sms: false, whatsapp: false, email: true };
  }

  const obj = value as Record<string, unknown>;

  const sms = typeof obj.sms === "boolean" ? obj.sms : false;
  const whatsapp = typeof obj.whatsapp === "boolean" ? obj.whatsapp : false;

  // по твоей логике: если email не задан — true
  const email =
    obj.email === undefined
      ? true
      : typeof obj.email === "boolean"
        ? obj.email
        : !!obj.email;

  return { sms, whatsapp, email };
}

export default function MarketingSection({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(true);
  const [prefs, setPrefs] = useState<Prefs>({
    sms: false,
    whatsapp: false,
    email: true,
  });
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("marketing")
        .eq("user_id", userId)
        .maybeSingle();

      if (cancelled) return;

      const next = readMarketing(
        (data as unknown as { marketing?: unknown } | null)?.marketing,
      );

      setPrefs({
        sms: !!next.sms,
        whatsapp: !!next.whatsapp,
        email: next.email === undefined ? true : !!next.email,
      });

      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  async function save() {
    setMsg(null);

    const { error } = await supabase
      .from("profiles")
      .update({ marketing: prefs })
      .eq("user_id", userId);

    if (error) setMsg(error.message);
    else setMsg("Сохранено.");
  }

  if (loading) {
    return (
      <div className="rounded-[28px] border border-black/10 bg-white p-5">
        <div className="text-[14px] text-black/60">Загрузка…</div>
      </div>
    );
  }

  const OPTIONS: Array<[keyof Prefs, string]> = [
    ["sms", "SMS-уведомления"],
    ["whatsapp", "WhatsApp"],
    ["email", "Email-рассылка"],
  ];

  return (
    <div className="rounded-[28px] border border-black/10 bg-white p-5">
      <div className="text-[12px] tracking-[0.22em] uppercase text-black/50">
        Маркетинговые предпочтения
      </div>

      <div className="mt-4 space-y-3">
        {OPTIONS.map(([k, label]) => (
          <label
            key={k}
            className="flex items-center justify-between rounded-2xl border border-black/10 px-4 py-3 cursor-pointer hover:bg-black/[0.02] transition"
          >
            <span className="text-[14px] text-black/75">{label}</span>
            <input
              type="checkbox"
              checked={!!prefs[k]}
              onChange={(e) =>
                setPrefs((p) => ({ ...p, [k]: e.target.checked }))
              }
              className="h-4 w-4"
            />
          </label>
        ))}

        <button
          onClick={save}
          className="mt-2 h-11 w-full rounded-2xl bg-black text-white transition cursor-pointer hover:translate-y-[-1px] active:translate-y-[0px]"
        >
          <span className="text-[12px] tracking-[0.18em] uppercase">
            Сохранить
          </span>
        </button>

        {msg && (
          <div
            className={cn(
              "rounded-2xl border px-4 py-3 text-[13px]",
              msg === "Сохранено."
                ? "border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-900"
                : "border-rose-500/20 bg-rose-500/[0.06] text-rose-900",
            )}
          >
            {msg}
          </div>
        )}
      </div>
    </div>
  );
}
