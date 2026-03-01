"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function DealerLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("dealer@test.com");
  const [password, setPassword] = useState("123456");
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
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const j = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(j?.error || `Login failed (${res.status})`);
      }

      router.push("/dealer/me");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-[520px] px-6 py-14">
      <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-black">
        Dealer Login
      </h1>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="text-[13px] text-black/60">Email</label>
          <input
            className="mt-1 w-full rounded-xl border border-black/10 px-4 py-3 text-[15px] outline-none focus:border-black/25"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            autoComplete="username"
          />
        </div>

        <div>
          <label className="text-[13px] text-black/60">Password</label>
          <input
            className="mt-1 w-full rounded-xl border border-black/10 px-4 py-3 text-[15px] outline-none focus:border-black/25"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
        </div>

        {error ? (
          <div className="rounded-xl border border-red-500/25 bg-red-50 px-4 py-3 text-[13px] text-red-700">
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-xl bg-black px-4 py-3 text-[14px] font-medium text-white disabled:opacity-60"
        >
          {loading ? "Signing in..." : "Sign in"}
        </button>
      </form>
    </div>
  );
}
