"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

export default function DealerLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch("/api/dealer/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, rememberMe }),
      });

      const j = (await res.json().catch(() => null)) as {
        error?: string;
        success?: boolean;
      } | null;

      if (!res.ok) {
        throw new Error(j?.error || "Неверный email или пароль");
      }

      router.push("/dealer/news");
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Не удалось выполнить вход",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto w-full max-w-[620px] px-5 py-10 sm:px-6 sm:py-14">
      <div className="min-w-0">
        <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-black">
          Кабинет дилера
        </h1>

        <p className="mt-2 text-[14px] font-medium leading-6 text-black/70">
          Вход для авторизованных дилеров.
        </p>

        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-2 text-[14px] leading-6 text-black/60">
          <span>
            Если у вас еще нет доступа, оставьте заявку на сотрудничество.
          </span>

          <Link
            href="/cooperation?interest=dealer"
            className="inline-flex h-8 items-center justify-center rounded-[6px] border border-[#2E8B57] bg-white px-3 text-[12px] font-medium text-[#2E8B57] transition-colors hover:bg-[#2E8B57] hover:text-white"
          >
            Стать дилером
          </Link>
        </div>
      </div>

      <form
        onSubmit={onSubmit}
        className="mt-8 rounded-[24px] border border-black/10 bg-white p-5 shadow-[0_18px_50px_-30px_rgba(0,0,0,0.18)] sm:p-6"
      >
        <div className="mb-6">
          <h2 className="text-[22px] font-semibold tracking-[-0.02em] text-black">
            Вход
          </h2>
          <p className="mt-1 text-[14px] text-black/55">
            Введите ваш email и пароль для входа в кабинет.
          </p>
        </div>

        <div className="space-y-5">
          <div>
            <label className="text-[13px] font-medium text-black/65">
              Email
            </label>
            <input
              className="mt-2 w-full rounded-xl border border-black/10 bg-[#F8FAFC] px-4 py-3.5 text-[15px] outline-none transition-colors placeholder:text-black/30 focus:border-black/20 focus:bg-white"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="username"
              inputMode="email"
              placeholder="Введите email"
            />
          </div>

          <div>
            <label className="text-[13px] font-medium text-black/65">
              Пароль
            </label>

            <div className="relative mt-2">
              <input
                className="w-full rounded-xl border border-black/10 bg-[#F8FAFC] px-4 py-3.5 pr-12 text-[15px] outline-none transition-colors placeholder:text-black/30 focus:border-black/20 focus:bg-white"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                placeholder="Введите пароль"
              />

              <button
                type="button"
                aria-label={showPassword ? "Скрыть пароль" : "Показать пароль"}
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-black/35 transition-colors hover:text-black/70"
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5" />
                ) : (
                  <Eye className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-1">
            <label className="inline-flex cursor-pointer items-center gap-2 text-[13px] text-black/65">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-black/20"
              />
              <span>Запомнить меня</span>
            </label>

            <Link
              href="/dealer/forgot-password"
              className="text-[13px] text-black/55 transition-colors hover:text-black"
            >
              Забыли пароль?
            </Link>
          </div>

          {error ? (
            <div className="rounded-xl border border-red-500/20 bg-red-50 px-4 py-3 text-[13px] text-red-700">
              {error}
            </div>
          ) : null}

          <button
            type="submit"
            disabled={loading}
            className={cn(
              "w-full rounded-xl bg-black px-4 py-3.5 text-[15px] font-medium text-white transition-all",
              "hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60",
            )}
          >
            {loading ? "Входим..." : "Войти"}
          </button>
        </div>
      </form>
    </div>
  );
}
