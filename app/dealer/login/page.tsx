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
    <div className="mx-auto max-w-[560px] px-6 py-14">
      <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-black">
        Кабинет Дилера
      </h1>

      <Link
        href="/cooperation?interest=dealer"
        className="mt-4 inline-flex items-center justify-center rounded-xl border border-[#2E8B57] bg-transparent px-5 py-3 text-[14px] font-medium text-[#2E8B57] transition-colors hover:bg-[#2E8B57] hover:text-white"
      >
        Стать дилером
      </Link>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <div>
          <label className="text-[13px] text-black/60">Email</label>
          <input
            className="mt-1 w-full rounded-xl border border-black/10 px-4 py-3 text-[15px] outline-none transition-colors focus:border-black/25"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
            inputMode="email"
            placeholder="Введите email"
          />
        </div>

        <div>
          <label className="text-[13px] text-black/60">Password</label>

          <div className="relative mt-1">
            <input
              className="w-full rounded-xl border border-black/10 px-4 py-3 pr-12 text-[15px] outline-none transition-colors focus:border-black/25"
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
              className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-black/45 transition-colors hover:text-black"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
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
            className="text-[13px] text-black/60 underline-offset-4 transition-colors hover:text-black hover:underline"
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
            "w-full rounded-xl bg-black px-4 py-3 text-[14px] font-medium text-white transition-opacity",
            "disabled:cursor-not-allowed disabled:opacity-60",
          )}
        >
          {loading ? "Входим..." : "Войти"}
        </button>
      </form>
    </div>
  );
}
