"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, LockKeyhole, Phone, Eye, EyeOff } from "lucide-react";

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

type Mode = "login" | "register";

type CountryOption = {
  code: string;
  label: string;
  dialCode: string;
  phoneMaskHint: string;
};

const COUNTRIES: CountryOption[] = [
  {
    code: "RU",
    label: "Россия",
    dialCode: "+7",
    phoneMaskHint: "999 123-45-67",
  },
  {
    code: "UZ",
    label: "Узбекистан",
    dialCode: "+998",
    phoneMaskHint: "90 123 45 67",
  },
  {
    code: "KZ",
    label: "Казахстан",
    dialCode: "+7",
    phoneMaskHint: "777 123 45 67",
  },
  {
    code: "KG",
    label: "Кыргызстан",
    dialCode: "+996",
    phoneMaskHint: "700 123 456",
  },
  {
    code: "TJ",
    label: "Таджикистан",
    dialCode: "+992",
    phoneMaskHint: "93 123 45 67",
  },
  {
    code: "BY",
    label: "Беларусь",
    dialCode: "+375",
    phoneMaskHint: "29 123 45 67",
  },
  {
    code: "AM",
    label: "Армения",
    dialCode: "+374",
    phoneMaskHint: "77 123456",
  },
  {
    code: "AZ",
    label: "Азербайджан",
    dialCode: "+994",
    phoneMaskHint: "50 123 45 67",
  },
  {
    code: "MD",
    label: "Молдова",
    dialCode: "+373",
    phoneMaskHint: "621 12 345",
  },
  {
    code: "TM",
    label: "Туркменистан",
    dialCode: "+993",
    phoneMaskHint: "65 123456",
  },
];

function getCountryByCode(code: string) {
  return COUNTRIES.find((c) => c.code === code) ?? COUNTRIES[0];
}

function normalizePhone(dialCode: string, raw: string) {
  const digits = raw.replace(/\D/g, "");
  const cleanDial = dialCode.replace(/\D/g, "");
  if (!digits) return dialCode;
  return `+${cleanDial}${digits}`;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error instanceof Error) return error.message || fallback;
  if (typeof error === "string") return error;
  return fallback;
}

export default function AuthClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/account";

  const [mode, setMode] = useState<Mode>("login");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [msg, setMsg] = useState<{ type: "ok" | "err"; text: string } | null>(
    null,
  );

  const [countryCode, setCountryCode] = useState("UZ");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");

  const country = useMemo(() => getCountryByCode(countryCode), [countryCode]);
  const phoneE164 = useMemo(
    () => normalizePhone(country.dialCode, phone),
    [country.dialCode, phone],
  );

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countryCode,
          phone: phoneE164,
          password,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setMsg({
          type: "err",
          text: data?.error || "Не удалось выполнить вход.",
        });
        setLoading(false);
        return;
      }

      setMsg({ type: "ok", text: "Вход выполнен." });
      router.replace(next);
      router.refresh();
    } catch (error) {
      setMsg({
        type: "err",
        text: getErrorMessage(error, "Ошибка входа."),
      });
      setLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setMsg(null);
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          countryCode,
          phone: phoneE164,
          password,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        setMsg({
          type: "err",
          text: data?.error || "Не удалось создать аккаунт.",
        });
        setLoading(false);
        return;
      }

      setMsg({ type: "ok", text: "Аккаунт создан. Выполняем вход..." });

      const loginRes = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          countryCode,
          phone: phoneE164,
          password,
        }),
      });

      const loginData = await loginRes.json().catch(() => null);

      if (!loginRes.ok) {
        setMsg({
          type: "err",
          text: loginData?.error || "Аккаунт создан, но вход не выполнен.",
        });
        setLoading(false);
        return;
      }

      router.replace(next);
      router.refresh();
    } catch (error) {
      setMsg({
        type: "err",
        text: getErrorMessage(error, "Ошибка регистрации."),
      });
      setLoading(false);
    }
  }

  return (
    <div className="w-full rounded-[28px] border border-black/10 bg-white p-5 shadow-[0_16px_60px_rgba(0,0,0,0.08)]">
      <div className="rounded-full border border-black/10 bg-black/[0.03] p-1">
        <div className="grid grid-cols-2 gap-1">
          <button
            type="button"
            onClick={() => {
              setMode("login");
              setMsg(null);
            }}
            className={cn(
              "h-10 rounded-full text-[12px] tracking-[0.22em] uppercase transition cursor-pointer",
              mode === "login"
                ? "bg-black text-white shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
                : "text-black/70 hover:text-black",
            )}
          >
            Вход
          </button>

          <button
            type="button"
            onClick={() => {
              setMode("register");
              setMsg(null);
            }}
            className={cn(
              "h-10 rounded-full text-[12px] tracking-[0.22em] uppercase transition cursor-pointer",
              mode === "register"
                ? "bg-black text-white shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
                : "text-black/70 hover:text-black",
            )}
          >
            Регистрация
          </button>
        </div>
      </div>

      <form
        onSubmit={mode === "login" ? handleLogin : handleRegister}
        className="mt-5 space-y-3"
      >
        <div className="text-center">
          <div className="text-[12px] tracking-[0.22em] uppercase text-black/50">
            {mode === "login" ? "Авторизация" : "Новый аккаунт"}
          </div>

          <div className="mt-1 text-[18px] tracking-[-0.01em]">
            {mode === "login"
              ? "Войти по телефону и паролю"
              : "Регистрация по телефону"}
          </div>
        </div>

        {mode === "register" && (
          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-[12px] tracking-[0.18em] uppercase text-black/60">
                Имя
              </label>
              <div className="rounded-2xl border border-black/10 bg-white px-4 py-3">
                <input
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  placeholder="Иван"
                  required
                  className="w-full bg-transparent outline-none text-[15px] placeholder:text-black/30"
                  autoComplete="given-name"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[12px] tracking-[0.18em] uppercase text-black/60">
                Фамилия
              </label>
              <div className="rounded-2xl border border-black/10 bg-white px-4 py-3">
                <input
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  placeholder="Иванов"
                  required
                  className="w-full bg-transparent outline-none text-[15px] placeholder:text-black/30"
                  autoComplete="family-name"
                />
              </div>
            </div>
          </div>
        )}

        <div>
          <label className="mb-2 block text-[12px] tracking-[0.18em] uppercase text-black/60">
            Страна
          </label>

          <div className="rounded-2xl border border-black/10 bg-white px-4 py-3">
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
              required
              className="w-full bg-transparent outline-none text-[15px]"
            >
              {COUNTRIES.map((item) => (
                <option key={item.code} value={item.code}>
                  {item.label} ({item.dialCode})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-[12px] tracking-[0.18em] uppercase text-black/60">
            Телефон
          </label>

          <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 transition focus-within:border-black/25 focus-within:shadow-[0_10px_30px_rgba(0,0,0,0.07)]">
            <div className="flex items-center gap-3">
              <div className="inline-flex items-center gap-2 text-black/60">
                <Phone className="h-4 w-4" />
                <span className="text-[14px]">{country.dialCode}</span>
              </div>

              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder={country.phoneMaskHint}
                required
                className="w-full bg-transparent outline-none text-[15px] placeholder:text-black/30"
                inputMode="tel"
                autoComplete="tel"
              />
            </div>
          </div>
        </div>

        <div>
          <label className="mb-2 block text-[12px] tracking-[0.18em] uppercase text-black/60">
            Пароль
          </label>

          <div className="rounded-2xl border border-black/10 bg-white px-4 py-3 transition focus-within:border-black/25 focus-within:shadow-[0_10px_30px_rgba(0,0,0,0.07)]">
            <div className="flex items-center gap-3">
              <LockKeyhole className="h-4 w-4 text-black/50" />

              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Введите пароль"
                required
                minLength={6}
                className="w-full bg-transparent outline-none text-[15px] placeholder:text-black/30"
                autoComplete={
                  mode === "login" ? "current-password" : "new-password"
                }
              />

              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                className="shrink-0 text-black/45 transition hover:text-black cursor-pointer"
                aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className={cn(
            "group w-full h-12 rounded-2xl bg-black text-white transition cursor-pointer",
            "hover:translate-y-[-1px] active:translate-y-[0px]",
            "disabled:opacity-60 disabled:cursor-not-allowed",
          )}
        >
          <span className="inline-flex items-center justify-center gap-2 text-[13px] tracking-[0.16em] uppercase">
            {mode === "login" ? "Войти" : "Зарегистрироваться"}
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </span>
        </button>

        {msg && (
          <div
            className={cn(
              "rounded-2xl border px-4 py-3 text-[13px] leading-relaxed",
              msg.type === "ok"
                ? "border-emerald-500/20 bg-emerald-500/[0.06] text-emerald-900"
                : "border-rose-500/20 bg-rose-500/[0.06] text-rose-900",
            )}
          >
            {msg.text}
          </div>
        )}
      </form>
    </div>
  );
}
