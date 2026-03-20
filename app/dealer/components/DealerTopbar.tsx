"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { ShoppingBag } from "lucide-react";

function titleByPath(pathname: string): string {
  if (pathname === "/dealer") return "Главная";
  if (pathname.startsWith("/dealer/order")) return "Заказать товар";
  if (pathname.startsWith("/dealer/collections")) return "Коллекции";
  if (pathname.startsWith("/dealer/news")) return "Новости и акции";
  if (pathname.startsWith("/dealer/tech-catalogs")) return "Тех. каталоги";
  if (pathname.startsWith("/dealer/instructions")) return "Инструкции";
  if (pathname.startsWith("/dealer/training")) return "Учебные материалы";
  if (pathname.startsWith("/dealer/multimedia")) return "Мультимедиа";
  if (pathname.startsWith("/dealer/faq")) return "FAQ";
  if (pathname.startsWith("/dealer/calendar")) return "Календарь";
  return "Dealer Portal";
}

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

export default function DealerTopbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function onLogout() {
    if (loading) return;
    setLoading(true);
    try {
      await fetch("/api/dealer/auth/logout", { method: "POST" });
    } finally {
      router.replace("/dealer/login");
    }
  }

  return (
    <div className="flex items-center justify-between gap-4 px-4 py-3 md:px-8">
      <div className="min-w-0">
        <div className="truncate text-[15px] font-semibold tracking-[-0.02em] text-black">
          {titleByPath(pathname)}
        </div>
        <div className="text-[12px] tracking-[0.02em] text-black/50">
          /{pathname.replace(/^\/+/, "")}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-3">
        <Link
          href="/dealer/order"
          className={cn(
            "inline-flex items-center gap-2 rounded-[14px] border px-3.5 py-2 text-[13px] font-medium transition-all",
            pathname.startsWith("/dealer/order")
              ? "border-amber-300 bg-amber-50 text-black"
              : "border-amber-200 bg-white text-black/80 hover:border-amber-300 hover:bg-amber-50 hover:text-black",
          )}
        >
          <ShoppingBag className="h-4 w-4" />
          <span>Заказать товар</span>
        </Link>

        <button
          type="button"
          onClick={onLogout}
          className="rounded-[14px] border border-black/10 bg-white px-3 py-2 text-[13px] text-black/70 transition-colors hover:bg-black/[0.05] hover:text-black disabled:opacity-60"
          disabled={loading}
        >
          {loading ? "Выход..." : "Выйти"}
        </button>
      </div>
    </div>
  );
}
