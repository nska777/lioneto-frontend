"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase/client";
import { ArrowRight, Phone, LogOut, UserRound } from "lucide-react";
import { useRegionLang } from "@/app/context/region-lang";

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

type Mode = "google" | "phone";

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

export default function AuthClient() {
  const sp = useSearchParams();
  const router = useRouter();
  const next = sp.get("next") || "/account";

  const { region } = useRegionLang() as { region: "uz" | "ru" };

  const [checking, setChecking] = useState(true);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);

  const [mode, setMode] = useState<Mode>("google");
  const [loading, setLoading] = useState(false);

  const [phoneRaw, setPhoneRaw] = useState("");
  const phoneE164 = useMemo(
    () => normalizePhoneToE164(phoneRaw, region),
    [phoneRaw, region],
  );

  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState("");

  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(
    null,
  );

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSessionEmail(data.session?.user?.email ?? null);
      setChecking(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSessionEmail(s?.user?.email ?? null);
    });

    return () => sub.subscription.unsubscribe();
  }, []);

  const signInGoogle = async (selectAccount?: boolean) => {
    try {
      setLoading(true);
      setMsg(null);

      await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${location.origin}/auth/callback?next=${encodeURIComponent(
            next,
          )}`,
          ...(selectAccount
            ? { queryParams: { prompt: "select_account" } }
            : {}),
        },
      });
    } catch (e: any) {
      setMsg({ type: "err", text: e?.message || "Ошибка входа через Google" });
      setLoading(false);
    }
  };

  const sendOtp = async () => {
    try {
      setLoading(true);
      setMsg(null);

      if (!phoneE164 || phoneE164.length < 8) {
        setMsg({ type: "err", text: "Введите корректный номер телефона." });
        setLoading(false);
        return;
      }

      const { error } = await supabase.auth.signInWithOtp({
        phone: phoneE164,
        options: { shouldCreateUser: true },
      });

      if (error) {
        setMsg({ type: "err", text: error.message });
        setLoading(false);
        return;
      }

      setOtpSent(true);
      setMsg({ type: "ok", text: "Код отправлен. Введите OTP из SMS." });
      setLoading(false);
    } catch (e: any) {
      setMsg({ type: "err", text: e?.message || "Ошибка отправки OTP" });
      setLoading(false);
    }
  };

  const verifyOtp = async () => {
    try {
      setLoading(true);
      setMsg(null);

      const token = otp.replace(/\D/g, "");
      if (token.length < 4) {
        setMsg({ type: "err", text: "Введите код из SMS." });
        setLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.verifyOtp({
        phone: phoneE164,
        token,
        type: "sms",
      });

      if (error) {
        setMsg({ type: "err", text: error.message });
        setLoading(false);
        return;
      }

      if (data.session) {
        router.replace(next);
      } else {
        setMsg({ type: "err", text: "Сессия не получена. Повторите." });
      }

      setLoading(false);
    } catch (e: any) {
      setMsg({ type: "err", text: e?.message || "Ошибка подтверждения OTP" });
      setLoading(false);
    }
  };

  const signOut = async () => {
    setLoading(true);
    setMsg(null);
    const { error } = await supabase.auth.signOut();
    if (error) setMsg({ type: "err", text: error.message });
    else setMsg({ type: "ok", text: "Вы вышли из аккаунта." });
    setLoading(false);
  };

  // loader
  if (checking) {
    return (
      <div className="w-full max-w-[520px] rounded-[28px] border border-black/10 bg-white p-5 shadow-[0_16px_60px_rgba(0,0,0,0.08)]">
        <div className="text-center text-[12px] tracking-[0.22em] uppercase text-black/50">
          Проверяем сессию…
        </div>
      </div>
    );
  }

  // signed in: показываем профиль/выход (без заголовка "Вход")
  if (sessionEmail) {
    return (
      <div className="w-full max-w-[520px] rounded-[28px] border border-black/10 bg-white p-5 shadow-[0_16px_60px_rgba(0,0,0,0.08)]">
        <div className="flex flex-col items-center gap-3 text-center">
          <div className="h-12 w-12 rounded-2xl bg-black/[0.04] grid place-items-center">
            <UserRound className="h-6 w-6 text-black/60" />
          </div>

          <div>
            <div className="text-[12px] tracking-[0.22em] uppercase text-black/50">
              Вы вошли как
            </div>
            <div className="mt-1 text-[15px] text-black/80">{sessionEmail}</div>
          </div>

          <div className="mt-2 grid w-full gap-2">
            <button
              onClick={() => router.push(next)}
              className="h-11 rounded-2xl bg-black text-white transition cursor-pointer hover:translate-y-[-1px] active:translate-y-[0px]"
            >
              <span className="text-[12px] tracking-[0.18em] uppercase">
                В кабинет
              </span>
            </button>

            <button
              onClick={async () => {
                await supabase.auth.signOut();
                await signInGoogle(true);
              }}
              disabled={loading}
              className={cn(
                "h-11 rounded-2xl border border-black/10 bg-white text-black/75 hover:text-black transition cursor-pointer",
                "disabled:opacity-60 disabled:cursor-not-allowed",
              )}
            >
              <span className="text-[12px] tracking-[0.18em] uppercase">
                Войти в другой аккаунт Google
              </span>
            </button>

            <button
              onClick={signOut}
              disabled={loading}
              className={cn(
                "h-11 rounded-2xl border border-black/10 bg-white text-black/75 hover:text-black transition cursor-pointer",
                "disabled:opacity-60 disabled:cursor-not-allowed",
              )}
            >
              <span className="inline-flex items-center justify-center gap-2 text-[12px] tracking-[0.18em] uppercase">
                <LogOut className="h-4 w-4" />
                Выйти
              </span>
            </button>
          </div>
        </div>

        {msg && (
          <div
            className={cn(
              "mt-4 rounded-2xl border px-4 py-3 text-[13px] leading-relaxed",
              msg.type === "ok"
                ? "border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-900"
                : "border-rose-500/20 bg-rose-500/[0.06] text-rose-900",
            )}
          >
            {msg.text}
          </div>
        )}
      </div>
    );
  }

  // signed out: card only
  return (
    <div className="w-full max-w-[520px] rounded-[28px] border border-black/10 bg-white p-5 shadow-[0_16px_60px_rgba(0,0,0,0.08)]">
      {/* segmented */}
      <div className="rounded-full border border-black/10 bg-black/[0.03] p-1">
        <div className="grid grid-cols-2 gap-1">
          <button
            onClick={() => {
              setMode("google");
              setMsg(null);
            }}
            className={cn(
              "h-10 rounded-full text-[12px] tracking-[0.22em] uppercase transition cursor-pointer",
              mode === "google"
                ? "bg-black text-white shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
                : "text-black/70 hover:text-black",
            )}
          >
            Google
          </button>
          <button
            onClick={() => {
              setMode("phone");
              setMsg(null);
            }}
            className={cn(
              "h-10 rounded-full text-[12px] tracking-[0.22em] uppercase transition cursor-pointer",
              mode === "phone"
                ? "bg-black text-white shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
                : "text-black/70 hover:text-black",
            )}
          >
            Телефон
          </button>
        </div>
      </div>

      <div className="mt-5">
        {mode === "google" ? (
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-[12px] tracking-[0.22em] uppercase text-black/50">
                Вход
              </div>
              <div className="mt-1 text-[18px] tracking-[-0.01em]">
                Продолжить через Google
              </div>
            </div>

            <button
              onClick={() => signInGoogle(false)}
              disabled={loading}
              className={cn(
                "group w-full h-12 rounded-2xl bg-black text-white transition cursor-pointer",
                "hover:translate-y-[-1px] active:translate-y-[0px]",
                "disabled:opacity-60 disabled:cursor-not-allowed",
              )}
            >
              <span className="inline-flex items-center justify-center gap-2 text-[13px] tracking-[0.16em] uppercase">
                Войти
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </button>

            <button
              onClick={() => signInGoogle(true)}
              disabled={loading}
              className={cn(
                "w-full h-11 rounded-2xl border border-black/10 bg-white text-black/75 hover:text-black transition cursor-pointer",
                "disabled:opacity-60 disabled:cursor-not-allowed",
              )}
            >
              <span className="text-[12px] tracking-[0.18em] uppercase">
                Выбрать аккаунт Google
              </span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-center">
              <div className="text-[12px] tracking-[0.22em] uppercase text-black/50">
                OTP
              </div>
              <div className="mt-1 text-[18px] tracking-[-0.01em]">
                Войти по телефону
              </div>
            </div>

            <label className="text-[12px] tracking-[0.18em] uppercase text-black/60">
              Номер телефона
            </label>

            <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 transition focus-within:border-black/25 focus-within:shadow-[0_10px_30px_rgba(0,0,0,0.07)]">
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-black/50" />
                <input
                  value={phoneRaw}
                  onChange={(e) => setPhoneRaw(e.target.value)}
                  placeholder={
                    region === "uz" ? "+998 90 123 45 67" : "+7 999 123-45-67"
                  }
                  className="w-full bg-transparent outline-none text-[15px] placeholder:text-black/30"
                  inputMode="tel"
                  autoComplete="tel"
                />
              </div>
              <div className="mt-1 text-[12px] text-black/45">
                E.164: <span className="text-black/70">{phoneE164 || "—"}</span>
              </div>
            </div>

            {!otpSent ? (
              <button
                onClick={sendOtp}
                disabled={loading}
                className={cn(
                  "w-full h-12 rounded-2xl bg-black text-white transition cursor-pointer",
                  "hover:translate-y-[-1px] active:translate-y-[0px]",
                  "disabled:opacity-60 disabled:cursor-not-allowed",
                )}
              >
                <span className="text-[13px] tracking-[0.16em] uppercase">
                  Получить код
                </span>
              </button>
            ) : (
              <>
                <label className="text-[12px] tracking-[0.18em] uppercase text-black/60">
                  Код из SMS
                </label>

                <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 transition focus-within:border-black/25 focus-within:shadow-[0_10px_30px_rgba(0,0,0,0.07)]">
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="123456"
                    className="w-full bg-transparent outline-none text-[15px] placeholder:text-black/30 tracking-[0.22em]"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                  />
                </div>

                <button
                  onClick={verifyOtp}
                  disabled={loading}
                  className={cn(
                    "w-full h-12 rounded-2xl bg-black text-white transition cursor-pointer",
                    "hover:translate-y-[-1px] active:translate-y-[0px]",
                    "disabled:opacity-60 disabled:cursor-not-allowed",
                  )}
                >
                  <span className="text-[13px] tracking-[0.16em] uppercase">
                    Подтвердить
                  </span>
                </button>

                <button
                  onClick={() => {
                    setOtpSent(false);
                    setOtp("");
                    setMsg(null);
                  }}
                  className="w-full h-11 rounded-2xl border border-black/10 bg-white text-black/70 hover:text-black transition cursor-pointer"
                >
                  <span className="text-[12px] tracking-[0.18em] uppercase">
                    Изменить номер
                  </span>
                </button>
              </>
            )}
          </div>
        )}

        {msg && (
          <div
            className={cn(
              "mt-4 rounded-2xl border px-4 py-3 text-[13px] leading-relaxed",
              msg.type === "ok"
                ? "border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-900"
                : "border-rose-500/20 bg-rose-500/[0.06] text-rose-900",
            )}
          >
            {msg.text}
          </div>
        )}

        <div className="mt-5 text-center text-[12px] text-black/45">
          Никаких паролей. Сессия хранится в браузере (client-only).
        </div>
      </div>
    </div>
  );
}
