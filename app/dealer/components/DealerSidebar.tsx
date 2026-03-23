"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Route } from "next";

type NavItem = {
  href: Route;
  label: string;
};

const NAV = [
  { href: "/dealer/news", label: "Новости и акции" },
  { href: "/dealer/price-lists", label: "Прайс-листы" },
  { href: "/dealer/tech-catalogs", label: "Технические каталоги" },
  { href: "/dealer/instructions", label: "Инструкции по сборке" },
  { href: "/dealer/training", label: "Учебные материалы" },
  { href: "/dealer/calendar", label: "Календарь мероприятий" },
  { href: "/dealer/multimedia", label: "Мультимедиа" },
  { href: "/dealer/faq", label: "F.A.Q." },
] as const satisfies ReadonlyArray<NavItem>;

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

export default function DealerSidebar({
  canAccessAdmin,
}: {
  canAccessAdmin: boolean;
}) {
  const pathname = usePathname();

  return (
    <aside className="w-[260px] shrink-0 border-r border-black/10 bg-white">
      <div className="px-4 pt-5 pb-3">
        <div className="px-3 pb-2 overflow-hidden">
          <div
            className="dealer-portal-black-gold relative inline-block whitespace-nowrap text-[13px] font-medium uppercase tracking-[0.08em] text-black"
            data-text="LIONETO DEALER PORTAL"
          >
            LIONETO DEALER PORTAL
          </div>
        </div>
      </div>

      <nav className="px-4 py-2">
        <ul className="space-y-2">
          {NAV.map((item) => {
            const hrefStr = item.href as string;

            const isActive =
              pathname === hrefStr || pathname.startsWith(hrefStr + "/");

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "block rounded-[10px] px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.08em]",
                    "transition-colors duration-200",
                    "border border-transparent",
                    "text-black/70 hover:bg-black/5",
                    isActive && "border-[#E4D9B8] bg-[#F3EBD2] text-black",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {canAccessAdmin ? (
          <div className="mt-6 border-t border-black/10 pt-4">
            <div className="mb-2 px-3 text-[10px] uppercase tracking-[0.14em] text-black/35">
              Owner panel
            </div>

            <Link
              href="/dealer-admin/activity"
              className={cn(
                "block rounded-[10px] border px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.08em]",
                "transition-colors duration-200",
                pathname.startsWith("/dealer-admin")
                  ? "border-[#DCCFA8] bg-[#F3EBD2] text-black"
                  : "border-black/10 bg-white text-black/70 hover:bg-black/5 hover:text-black",
              )}
            >
              Панель владельца
            </Link>
          </div>
        ) : null}
      </nav>
    </aside>
  );
}
