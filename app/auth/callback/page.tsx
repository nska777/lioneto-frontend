"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/app/lib/supabase/client";

export default function AuthCallbackPage() {
  const router = useRouter();
  const sp = useSearchParams();

  useEffect(() => {
    const next = sp.get("next") || "/account";

    // supabase сам обработает code в URL (detectSessionInUrl: true)
    supabase.auth.getSession().then(({ data }) => {
      if (!data.session) {
        router.replace(`/auth?error=oauth&next=${encodeURIComponent(next)}`);
        return;
      }
      router.replace(next);
    });
  }, [router, sp]);

  return (
    <main className="mx-auto max-w-[900px] px-4 py-16">
      <h1 className="text-2xl font-semibold">Завершаем вход…</h1>
    </main>
  );
}
