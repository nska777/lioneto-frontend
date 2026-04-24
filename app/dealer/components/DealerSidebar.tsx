"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname } from "next/navigation";
import type { Route } from "next";
import { Archive, ShoppingBag } from "lucide-react";

type NavItem = {
  href: Route;
  label: string;
};

type ReservationRecord = {
  id?: string | number;
  documentId?: string;
  orderNumber?: string;
  reservationStatus?: "active" | "expired" | "converted" | "cancelled";
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

function getCollectionSlugFromPath(pathname: string) {
  const match = pathname.match(/^\/dealer\/order\/([^/?#]+)/);
  return match?.[1] ?? "";
}

function countActiveReservationOrders(rows: ReservationRecord[]) {
  const active = rows.filter((item) => item.reservationStatus === "active");
  const groups = new Set<string>();

  active.forEach((item) => {
    const key = String(
      item.orderNumber ?? item.documentId ?? item.id ?? "",
    ).trim();

    if (key) {
      groups.add(key);
    }
  });

  return groups.size;
}

export default function DealerSidebar({
  canAccessAdmin,
}: {
  canAccessAdmin: boolean;
}) {
  const pathname = usePathname();

  const [lastOrderCollectionSlug, setLastOrderCollectionSlug] = useState("");
  const [reservationsCount, setReservationsCount] = useState(0);

  const orderActive =
    pathname === "/dealer/order" || pathname.startsWith("/dealer/order/");

  useEffect(() => {
    const slugFromPath = getCollectionSlugFromPath(pathname);

    if (slugFromPath) {
      setLastOrderCollectionSlug(slugFromPath);

      try {
        window.localStorage.setItem(
          "dealer-current-order-collection",
          slugFromPath,
        );
      } catch {
        // ignore
      }

      return;
    }

    try {
      const saved = window.localStorage.getItem(
        "dealer-current-order-collection",
      );

      if (saved) {
        setLastOrderCollectionSlug(saved);
      }
    } catch {
      // ignore
    }
  }, [pathname]);

  useEffect(() => {
    let cancelled = false;

    async function loadReservationsCount() {
      try {
        const res = await fetch("/api/dealer/reservations", {
          method: "GET",
          credentials: "include",
          cache: "no-store",
        });

        if (!res.ok) return;

        const data = (await res.json()) as {
          reservations?: ReservationRecord[];
        };

        if (cancelled) return;

        setReservationsCount(
          countActiveReservationOrders(data.reservations ?? []),
        );
      } catch {
        // ignore
      }
    }

    loadReservationsCount();

    return () => {
      cancelled = true;
    };
  }, [pathname]);

  const reservationsHref = useMemo(() => {
    const slugFromPath = getCollectionSlugFromPath(pathname);
    const slug = slugFromPath || lastOrderCollectionSlug || "amber";

    return `/dealer/order/${slug}?reservations=1` as Route;
  }, [pathname, lastOrderCollectionSlug]);

  return (
    <aside className="w-[260px] shrink-0 border-r border-black/10 bg-white">
      <div className="px-4 pt-5 pb-3">
        <div className="overflow-hidden px-3 pb-2">
          <div
            className="dealer-portal-black-gold relative inline-block whitespace-nowrap text-[13px] font-medium uppercase tracking-[0.08em] text-black"
            data-text="LIONETO DEALER PORTAL"
          >
            LIONETO DEALER PORTAL
          </div>
        </div>
      </div>

      <nav className="px-4 py-2">
        <div className="mb-3 space-y-2">
          <Link
            href="/dealer/order"
            className={cn(
              "flex w-full items-center justify-start gap-2 rounded-[10px] border px-3 py-2.5 text-left text-[12px] font-semibold uppercase tracking-[0.08em] transition-colors duration-200",
              orderActive
                ? "border-[#9EB8A6] bg-[#CFE3D4] text-[#173221]"
                : "border-[#B7D0BE] bg-[#DDEEE2] text-[#173221] hover:bg-[#D2E7D8] hover:text-[#102A19]",
            )}
          >
            <ShoppingBag className="h-4 w-4 shrink-0" />
            <span className="min-w-0">Заказать товар</span>
          </Link>

          <Link
            href={reservationsHref}
            className={cn(
              "relative flex w-full items-center justify-start gap-2 rounded-[10px] border px-3 py-2.5 pr-10 text-left text-[12px] font-semibold uppercase tracking-[0.08em] transition-colors duration-200",
              "border-red-200 bg-red-50 text-red-700 hover:border-red-300 hover:bg-red-100 hover:text-red-800",
            )}
          >
            <Archive className="h-4 w-4 shrink-0" />
            <span className="min-w-0">Мои брони</span>

            {reservationsCount > 0 ? (
              <span className="absolute right-2 top-1/2 inline-flex h-6 min-w-6 -translate-y-1/2 items-center justify-center rounded-full border border-red-300 bg-white px-1.5 text-[12px] font-bold leading-none text-red-700 shadow-sm">
                {reservationsCount}
              </span>
            ) : null}
          </Link>
        </div>

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
                    "border border-transparent text-black/70 transition-colors duration-200 hover:bg-black/5",
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
