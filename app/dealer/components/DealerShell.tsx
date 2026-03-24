"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import DealerSidebar from "./DealerSidebar";
import DealerTopbar from "./DealerTopbar";

const AUTH_PATHS = [
  "/dealer/login",
  "/dealer/forgot-password",
  "/dealer/reset-password",
];

type DealerNavItem = {
  label: string;
  href: string;
};

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function DealerShell({
  children,
  canAccessAdmin,
}: {
  children: ReactNode;
  canAccessAdmin: boolean;
}) {
  const pathname = usePathname();
  const isAuthPage = AUTH_PATHS.includes(pathname);

  if (isAuthPage) return <>{children}</>;

  const navItems: DealerNavItem[] = [
    { label: "Новости и акции", href: "/dealer/news" },
    { label: "Прайс-листы", href: "/dealer/price-lists" },
    { label: "Технические каталоги", href: "/dealer/tech-catalogs" },
    { label: "Инструкции по сборке", href: "/dealer/instructions" },
    { label: "Учебные материалы", href: "/dealer/training" },
    { label: "Календарь мероприятий", href: "/dealer/calendar" },
    { label: "Мультимедиа", href: "/dealer/multimedia" },
    { label: "F.A.Q.", href: "/dealer/faq" },
  ];

  if (canAccessAdmin) {
    navItems.push({
      label: "Панель владельца",
      href: "/dealer-admin/activity",
    });
  }

  const isActive = (href: string) => {
    if (href === "/dealer/news") {
      return pathname === "/dealer" || pathname.startsWith("/dealer/news");
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  };

  return (
    <div className="min-h-screen bg-[#f7f7f5]">
      <div className="mx-auto flex min-h-screen max-w-[1400px]">
        <aside className="hidden w-[280px] border-r border-black/10 bg-white md:block">
          <DealerSidebar canAccessAdmin={canAccessAdmin} />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="sticky top-0 z-20 border-b border-black/10 bg-white/90 backdrop-blur">
            <DealerTopbar />

            <div className="border-t border-black/5 md:hidden">
              <div className="overflow-x-auto px-4 py-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
                <div className="flex min-w-max gap-2">
                  {navItems.map((item) => {
                    const active = isActive(item.href);

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "whitespace-nowrap rounded-full border px-4 py-2 text-[13px] font-medium transition",
                          active
                            ? "border-[#d9c79e] bg-[#e7dcc0] text-black"
                            : "border-black/10 bg-white text-black/70 hover:border-black/15 hover:bg-black/[0.03] hover:text-black",
                        )}
                      >
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          <main className="min-w-0 flex-1 px-4 py-6 md:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
