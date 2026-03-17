"use client";

import { useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";

export default function DealerResetPasswordPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = useMemo(() => searchParams.get("token") || "", [searchParams]);

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!token) {
      setError("Токен восстановления отсутствует");
      return;
    }

    if (password.length < 6) {
      setError("Новый пароль должен содержать минимум 6 символов");
      return;
    }

    if (password !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/dealer/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          token,
          password,
        }),
      });

      const j = (await res.json().catch(() => null)) as {
        error?: string;
        success?: boolean;
      } | null;

      if (!res.ok) {
        throw new Error(j?.error || "Не удалось изменить пароль");
      }

      router.push("/dealer/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Ошибка сброса пароля");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-[560px] px-6 py-14">
      <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-black">
        Новый пароль
      </h1>

      <p className="mt-2 text-[14px] text-black/55">
        Установите новый пароль для входа в дилерский кабинет.
      </p>

      <form onSubmit={onSubmit} className="mt-8 space-y-5">
        <div>
          <label className="text-[13px] text-black/60">Новый пароль</label>
          <div className="relative mt-1">
            <input
              className="w-full rounded-xl border border-black/10 px-4 py-3 pr-12 text-[15px] outline-none focus:border-black/25"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="Введите новый пароль"
            />
            <button
              type="button"
              onClick={() => setShowPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-black/45 hover:text-black"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        <div>
          <label className="text-[13px] text-black/60">Повторите пароль</label>
          <div className="relative mt-1">
            <input
              className="w-full rounded-xl border border-black/10 px-4 py-3 pr-12 text-[15px] outline-none focus:border-black/25"
              type={showConfirmPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              autoComplete="new-password"
              placeholder="Повторите новый пароль"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((v) => !v)}
              className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-black/45 hover:text-black"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </div>
        </div>

        {error ? (
          <div className="rounded-xl border border-red-500/20 bg-red-50 px-4 py-3 text-[13px] text-red-700">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-black px-4 py-3 text-[14px] font-medium text-white disabled:opacity-60"
        >
          {loading ? "Сохраняем..." : "Сохранить новый пароль"}
        </button>
      </form>
    </div>
  );
}
