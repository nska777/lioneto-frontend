"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/app/lib/supabase/client";
import AccountShell from "./AccountShell";

export default function AccountPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<{ id: string; email: string | null } | null>(
    null,
  );

  useEffect(() => {
    (async () => {
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        router.replace("/auth?next=/account");
        return;
      }
      setUser({ id: data.user.id, email: data.user.email ?? null });
      setLoading(false);
    })();
  }, [router]);

  if (loading) return <div className="p-8">Загрузка…</div>;
  if (!user) return null;

  return <AccountShell userId={user.id} email={user.email} />;
}
