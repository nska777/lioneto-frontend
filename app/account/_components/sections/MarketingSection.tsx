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

export default function MarketingSection({ userId }: { userId: string }) {
  const [loading, setLoading] = useState(true);
  const [prefs, setPrefs] = useState<Prefs>({
    sms: false,
    whatsapp: false,
    email: true,
  });
  const [msg, setMsg] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("profiles")
        .select("marketing")
        .eq("user_id", userId)
        .maybeSingle();

      const m = (data?.marketing as any) || {};
      setPrefs({
        sms: !!m.sms,
        whatsapp: !!m.whatsapp,
        email: m.email === undefined ? true : !!m.email,
      });
      setLoading(false);
    })();
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

  return (
    <div className="rounded-[28px] border border-black/10 bg-white p-5">
      <div className="text-[12px] tracking-[0.22em] uppercase text-black/50">
        Маркетинговые предпочтения
      </div>

      <div className="mt-4 space-y-3">
        {[
          ["sms", "SMS-уведомления"],
          ["whatsapp", "WhatsApp"],
          ["email", "Email-рассылка"],
        ].map(([k, label]) => (
          <label
            key={k}
            className="flex items-center justify-between rounded-2xl border border-black/10 px-4 py-3 cursor-pointer hover:bg-black/[0.02] transition"
          >
            <span className="text-[14px] text-black/75">{label}</span>
            <input
              type="checkbox"
              checked={!!(prefs as any)[k]}
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
          <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.06] px-4 py-3 text-[13px] text-emerald-900">
            {msg}
          </div>
        )}
      </div>
    </div>
  );
}
