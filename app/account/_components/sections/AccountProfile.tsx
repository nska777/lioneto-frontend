"use client";

import { useEffect, useState } from "react";
import { UserRound, Phone, Pencil, Save } from "lucide-react";

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

type AccountUser = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  phone?: string | null;
  countryCode?: string | null;
};

type CheckoutProfileLS = {
  name: string;
  phone: string;
  address: string;
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
  user,
  onProfileUpdated,
}: {
  user: AccountUser;
  onProfileUpdated?: (user: AccountUser) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [firstName, setFirstName] = useState(user.firstName ?? "");
  const [lastName, setLastName] = useState(user.lastName ?? "");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    const prev = safeReadCheckoutProfile();

    const fullName = [user.firstName, user.lastName]
      .filter(Boolean)
      .join(" ")
      .trim();

    const next: CheckoutProfileLS = {
      name: fullName || prev.name || "",
      phone: user.phone ?? prev.phone ?? "",
      address: prev.address ?? "",
      updatedAt: Date.now(),
    };

    writeCheckoutProfile(next);
  }, [user.firstName, user.lastName, user.phone]);

  function startEdit() {
    setFirstName(user.firstName ?? "");
    setLastName(user.lastName ?? "");
    setMsg(null);
    setEditing(true);
  }

  async function save() {
    setMsg(null);
    setSaving(true);

    try {
      const res = await fetch("/api/account/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setMsg({
          ok: false,
          text: data?.error || "Не удалось сохранить профиль.",
        });
        setSaving(false);
        return;
      }

      const updatedUser: AccountUser = {
        id: user.id,
        firstName: data?.user?.firstName ?? firstName.trim() ?? null,
        lastName: data?.user?.lastName ?? lastName.trim() ?? null,
        phone: data?.user?.phone ?? user.phone ?? null,
        countryCode: data?.user?.countryCode ?? user.countryCode ?? null,
      };

      const fullName = [updatedUser.firstName, updatedUser.lastName]
        .filter(Boolean)
        .join(" ")
        .trim();

      const prev = safeReadCheckoutProfile();
      writeCheckoutProfile({
        name: fullName || prev.name || "",
        phone: updatedUser.phone ?? prev.phone ?? "",
        address: prev.address ?? "",
        updatedAt: Date.now(),
      });

      onProfileUpdated?.(updatedUser);

      setMsg({ ok: true, text: "Сохранено." });
      setEditing(false);
    } catch {
      setMsg({ ok: false, text: "Ошибка сохранения профиля." });
    } finally {
      setSaving(false);
    }
  }

  const fullName = [user.firstName, user.lastName]
    .filter(Boolean)
    .join(" ")
    .trim();

  return (
    <div className="space-y-6">
      <div className="rounded-[28px] border border-black/10 bg-white p-5 shadow-[0_16px_60px_rgba(0,0,0,0.06)]">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-2xl bg-black/[0.04]">
              <UserRound className="h-5 w-5 text-black/60" />
            </div>

            <div className="min-w-0">
              <div className="text-[12px] tracking-[0.22em] uppercase text-black/50">
                О вас
              </div>

              {!editing ? (
                <div className="mt-1 text-[15px] text-black/80">
                  {fullName || "—"}
                </div>
              ) : (
                <div className="mt-2 grid gap-2 sm:grid-cols-2">
                  <input
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="Имя"
                    className="w-full rounded-2xl border border-black/10 px-4 py-2 outline-none"
                  />
                  <input
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Фамилия"
                    className="w-full rounded-2xl border border-black/10 px-4 py-2 outline-none"
                  />
                </div>
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
          <div className="flex items-center justify-between gap-3 rounded-2xl border border-black/10 px-4 py-3">
            <div className="flex items-center gap-2 text-[14px] text-black/75">
              <Phone className="h-4 w-4 text-black/50" />
              <span>{user.phone ?? "—"}</span>
            </div>

            <div className="text-[11px] uppercase tracking-[0.18em] text-black/45">
              {user.countryCode ?? "—"}
            </div>
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
