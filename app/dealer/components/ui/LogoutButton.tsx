"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

export default function LogoutButton({
  className,
  label = "Выйти",
}: {
  className?: string;
  label?: string;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onLogout() {
    if (loading) return;
    setLoading(true);

    try {
      await fetch("/dealer/api/dealer/auth/logout", {
        method: "POST",
        headers: { "content-type": "application/json" },
      });
    } finally {
      router.replace("/dealer/login");
      router.refresh();
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      onClick={onLogout}
      disabled={loading}
      className={cn(
        "inline-flex h-10 items-center justify-center rounded-[14px] px-4 text-[13px] font-semibold tracking-[0.02em] transition",
        "bg-black text-white hover:bg-black/90 disabled:opacity-60 disabled:cursor-not-allowed",
        className,
      )}
    >
      {loading ? "Выходим…" : label}
    </button>
  );
}
