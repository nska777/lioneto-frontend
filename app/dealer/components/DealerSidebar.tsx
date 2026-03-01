"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
};

const NAV: NavItem[] = [
  { href: "/dealer/dashboard", label: "Главная" },
  { href: "/dealer/me", label: "Профиль" },

  { href: "/dealer/news", label: "Новости и акции" },
  { href: "/dealer/price-lists", label: "Прайс-листы" },

  { href: "/dealer/tech-catalogs", label: "Технические каталоги" },
  { href: "/dealer/instructions", label: "Инструкции по сборке" },
  { href: "/dealer/training", label: "Учебные материалы" },
  { href: "/dealer/calendar", label: "Календарь мероприятий" },
  { href: "/dealer/multimedia", label: "Мультимедиа" },
  { href: "/dealer/faq", label: "F.A.Q." },
];

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

export default function DealerSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[260px] shrink-0 border-r border-black/10 bg-white">
      <nav className="px-4 py-4">
        <ul className="space-y-2">
          {NAV.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(item.href + "/");

            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "block rounded-[10px] px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.08em]",
                    "transition-colors duration-200",
                    "border border-transparent",
                    "text-black/70 hover:bg-black/5",

                    isActive && "bg-[#F3EBD2] border-[#E4D9B8] text-black",
                  )}
                >
                  {item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
