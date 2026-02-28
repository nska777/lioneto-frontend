"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/app/lib/supabase/client";
import { UserRound, Mail, Phone, Pencil, Save } from "lucide-react";

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

type ProfileRow = {
  full_name: string | null;
  phone_e164: string | null;
  phone_verified: boolean;
};

type CheckoutProfileLS = {
  name: string;
  phone: string;
  address: string;
  email: string;
  updatedAt: number;
};

const LS_CHECKOUT_PROFILE = "lioneto:checkout:profile:v1";

function safeReadCheckoutProfile(): Partial<CheckoutProfileLS> {
  try {
    const raw = localStorage.getItem(LS_CHECKOUT_PROFILE);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as unknown;

    if (!parsed || typeof parsed !== "object") return {};
    const obj = parsed as Record<string, unknown>;

    return {
      name: typeof obj.name === "string" ? obj.name : undefined,
      phone: typeof obj.phone === "string" ? obj.phone : undefined,
      address: typeof obj.address === "string" ? obj.address : undefined,
      email: typeof obj.email === "string" ? obj.email : undefined,
      updatedAt: typeof obj.updatedAt === "number" ? obj.updatedAt : undefined,
    };
  } catch {
    return {};
  }
}

function writeCheckoutProfile(next: CheckoutProfileLS) {
  try {
    localStorage.setItem(LS_CHECKOUT_PROFILE, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export default function AccountProfile({
  userId,
  email,
  profile,
  onProfile,
  onEditPhone,
}: {
  userId: string;
  email: string | null;
  profile: ProfileRow | null;
  onProfile: (p: ProfileRow) => void;
  onEditPhone: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [name, setName] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    if (!profile) return;

    const prev = safeReadCheckoutProfile();

    const next: CheckoutProfileLS = {
      name: profile.full_name ?? prev.name ?? "",
      phone: profile.phone_e164 ?? prev.phone ?? "",
      address: prev.address ?? "",
      email: email ?? prev.email ?? "",
      updatedAt: Date.now(),
    };

    writeCheckoutProfile(next);
  }, [profile, email]);

  function startEdit() {
    setName(profile?.full_name ?? "");
    setMsg(null);
    setEditing(true);
  }

  async function save() {
    setMsg(null);
    setSaving(true);

    const { data, error } = await supabase
      .from("profiles")
      .update({ full_name: name.trim() || null })
      .eq("user_id", userId)
      .select("full_name, phone_e164, phone_verified")
      .single();

    if (error) {
      setMsg({ ok: false, text: error.message });
      setSaving(false);
      return;
    }

    const d = data as unknown as {
      full_name: string | null;
      phone_e164: string | null;
      phone_verified: boolean;
    };

    const row: ProfileRow = {
      full_name: d?.full_name ?? null,
      phone_e164: d?.phone_e164 ?? null,
      phone_verified: !!d?.phone_verified,
    };

    onProfile(row);

    const prev = safeReadCheckoutProfile();
    const next: CheckoutProfileLS = {
      name: row.full_name ?? prev.name ?? "",
      phone: row.phone_e164 ?? prev.phone ?? "",
      address: prev.address ?? "",
      email: email ?? prev.email ?? "",
      updatedAt: Date.now(),
    };
    writeCheckoutProfile(next);

    setMsg({ ok: true, text: "Сохранено." });
    setSaving(false);
    setEditing(false);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-black/10 bg-white p-5 shadow-[0_16px_60px_rgba(0,0,0,0.06)]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-black/[0.04]">
              <UserRound className="h-5 w-5 text-black/60" />
            </div>

            <div>
              <div className="text-[12px] tracking-[0.22em] uppercase text-black/50">
                О вас
              </div>

              {!editing ? (
                <div className="mt-1 text-[15px] text-black/80">
                  {profile?.full_name || "—"}
                </div>
              ) : (
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ваше имя"
                  className="mt-1 w-full max-w-[320px] rounded-2xl border border-black/10 px-4 py-2 outline-none"
                />
              )}
            </div>
          </div>

          {!editing ? (
            <button
              onClick={startEdit}
              className="h-10 rounded-2xl border border-black/10 bg-white px-4 text-black/75 transition hover:bg-black/[0.03] hover:text-black cursor-pointer"
            >
              <span className="inline-flex items-center gap-2 text-[12px] tracking-[0.18em] uppercase">
                <Pencil className="h-4 w-4" />
                Редактировать
              </span>
            </button>
          ) : (
            <button
              onClick={save}
              disabled={saving}
              className={cn(
                "h-10 rounded-2xl bg-black px-4 text-white transition cursor-pointer",
                "hover:translate-y-[-1px] active:translate-y-[0px]",
                "disabled:cursor-not-allowed disabled:opacity-60",
              )}
            >
              <span className="inline-flex items-center gap-2 text-[12px] tracking-[0.18em] uppercase">
                <Save className="h-4 w-4" />
                Сохранить
              </span>
            </button>
          )}
        </div>

        <div className="mt-4 grid gap-2">
          <div className="flex items-center gap-2 text-[14px] text-black/75">
            <Mail className="h-4 w-4 text-black/50" />
            <span>{email ?? "—"}</span>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-2xl border border-black/10 px-4 py-3">
            <div className="flex items-center gap-2 text-[14px] text-black/75">
              <Phone className="h-4 w-4 text-black/50" />
              <span>{profile?.phone_e164 ?? "—"}</span>

              {profile?.phone_e164 && (
                <span className="ml-2 text-[12px] text-black/45">
                  {profile?.phone_verified ? "подтверждён" : "не подтверждён"}
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={onEditPhone}
              className="h-9 rounded-2xl border border-black/10 bg-white px-3 text-black/70 transition hover:bg-black/[0.03] hover:text-black cursor-pointer"
            >
              <span className="text-[11px] tracking-[0.18em] uppercase">
                Изменить
              </span>
            </button>
          </div>
        </div>

        {msg && (
          <div
            className={cn(
              "mt-4 rounded-2xl border px-4 py-3 text-[13px]",
              msg.ok
                ? "border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-900"
                : "border-rose-500/20 bg-rose-500/[0.06] text-rose-900",
            )}
          >
            {msg.text}
          </div>
        )}
      </div>

      <div className="rounded-[28px] border border-black/10 bg-white p-5">
        <div className="text-[12px] tracking-[0.22em] uppercase text-black/50">
          Адресная книга
        </div>
        <div className="mt-2 text-[14px] text-black/70">
          Управляйте адресами доставки в разделе «Адресная книга».
        </div>
      </div>
    </div>
  );
}
