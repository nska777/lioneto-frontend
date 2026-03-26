"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AccountShell from "./AccountShell";

type MeResponse = {
  user: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    phone?: string | null;
    countryCode?: string | null;
  } | null;
};

export default function AccountPage() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<MeResponse["user"]>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) {
          router.replace("/auth?next=/account");
          return;
        }

        const data = (await res.json()) as MeResponse;

        if (!mounted) return;

        if (!data?.user) {
          router.replace("/auth?next=/account");
          return;
        }

        setUser(data.user);
      } catch {
        router.replace("/auth?next=/account");
      } finally {
        if (mounted) setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [router]);

  if (loading) {
    return <div className="p-8">Загрузка…</div>;
  }

  if (!user) return null;

  return <AccountShell user={user} />;
}
