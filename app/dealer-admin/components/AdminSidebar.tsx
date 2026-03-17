"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV = [
  { href: "/dealer-admin", label: "Обзор" },
  { href: "/dealer-admin/activity", label: "Активность дилеров" },
  { href: "/dealer-admin/dealers", label: "Дилеры" },
];

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

export default function AdminSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[260px] shrink-0 border-r border-black/10 bg-white">
      <div className="border-b border-black/10 px-4 py-5">
        <div className="text-[11px] uppercase tracking-[0.14em] text-black/40">
          Owner Panel
        </div>
        <div className="mt-2 text-[18px] font-semibold tracking-[-0.02em] text-black">
          Dealer Admin
        </div>
      </div>

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
                    "block rounded-[10px] border border-transparent px-3 py-2 text-[12px] font-semibold uppercase tracking-[0.08em]",
                    "transition-colors duration-200",
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
      </nav>
    </aside>
  );
}
