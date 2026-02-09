"use client";

import { useMemo, useState } from "react";
import { supabase } from "@/app/lib/supabase/client";
import { Phone, X } from "lucide-react";
import { useRegionLang } from "@/app/context/region-lang";

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

function normalizePhoneToE164(raw: string, region: "uz" | "ru") {
  const digits = raw.replace(/\D/g, "");
  if (!digits) return "";
  if (digits.startsWith("998")) return `+${digits}`;
  if (digits.startsWith("7")) return `+${digits}`;

  if (region === "ru") {
    if (digits.startsWith("8")) return `+7${digits.slice(1)}`;
    if (digits.length === 10) return `+7${digits}`;
    return `+7${digits}`;
  }

  if (digits.length === 9) return `+998${digits}`;
  return `+998${digits}`;
}

export default function PhoneGate({
  userId,
  initialPhone = "",
  onClose,
  onSaved,
}: {
  userId: string;
  initialPhone?: string;
  onClose?: () => void;
  onSaved: (p: {
    full_name: string | null;
    phone_e164: string | null;
    phone_verified: boolean;
  }) => void;
}) {
  const { region } = useRegionLang() as { region: "uz" | "ru" };

  // ✅ если пришёл initialPhone — показываем его в поле (в сыром виде)
  const [raw, setRaw] = useState(initialPhone);
  const phone = useMemo(() => normalizePhoneToE164(raw, region), [raw, region]);

  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function save() {
    setMsg(null);

    if (!phone || phone.length < 8) {
      setMsg("Введите корректный номер телефона.");
      return;
    }

    setSaving(true);

    const { data, error } = await supabase
      .from("profiles")
      .update({ phone_e164: phone })
      .eq("user_id", userId)
      .select("full_name, phone_e164, phone_verified")
      .single();

    if (error) {
      setMsg(error.message);
      setSaving(false);
      return;
    }

    onSaved(data as any);
    setSaving(false);
  }

  return (
    <div className="mb-6 rounded-[28px] border border-black/10 bg-black/[0.02] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[12px] tracking-[0.22em] uppercase text-black/50">
            {initialPhone ? "Редактирование" : "Обязательный шаг"}
          </div>
          <div className="mt-1 text-[18px] tracking-[-0.01em]">
            Укажите номер телефона
          </div>
          <p className="mt-2 text-[13px] text-black/60">
            {initialPhone
              ? "Вы можете обновить номер телефона в профиле."
              : "Пока телефон не заполнен, остальные разделы недоступны."}
          </p>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="h-10 w-10 rounded-2xl border border-black/10 bg-white text-black/70 hover:text-black hover:bg-black/[0.03] transition cursor-pointer grid place-items-center"
            aria-label="Закрыть"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-[1fr_auto] items-end">
        <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 transition focus-within:border-black/25 focus-within:shadow-[0_10px_30px_rgba(0,0,0,0.07)]">
          <div className="flex items-center gap-2">
            <Phone className="h-4 w-4 text-black/50" />
            <input
              value={raw}
              onChange={(e) => setRaw(e.target.value)}
              placeholder={
                region === "uz" ? "+998 90 123 45 67" : "+7 999 123-45-67"
              }
              className="w-full bg-transparent outline-none text-[15px] placeholder:text-black/30"
              inputMode="tel"
              autoComplete="tel"
            />
          </div>
          <div className="mt-1 text-[12px] text-black/45">
            E.164: <span className="text-black/70">{phone || "—"}</span>
          </div>
        </div>

        <button
          onClick={save}
          disabled={saving}
          className={cn(
            "h-12 px-5 rounded-2xl bg-black text-white transition cursor-pointer",
            "hover:translate-y-[-1px] active:translate-y-[0px]",
            "disabled:opacity-60 disabled:cursor-not-allowed",
          )}
        >
          <span className="text-[12px] tracking-[0.18em] uppercase">
            Сохранить
          </span>
        </button>
      </div>

      {msg && (
        <div className="mt-3 rounded-2xl border border-rose-500/20 bg-rose-500/[0.06] px-4 py-3 text-[13px] text-rose-900">
          {msg}
        </div>
      )}
    </div>
  );
}
