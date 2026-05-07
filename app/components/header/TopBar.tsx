"use client";

import Link from "next/link";
import { Phone, Menu, X, ChevronDown } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { tF } from "@/i18n";

import StoresDropdown from "./StoresDropdown";
import CallButton from "./CallButton";

import { megaCategories as MEGA_FALLBACK } from "@/app/lib/headerData";

type Dict = Record<string, unknown>;

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function isString(v: unknown): v is string {
  return typeof v === "string";
}

function normalizeStr(v: unknown) {
  return String(v ?? "").trim();
}

function getFirstString(obj: unknown, keys: readonly string[]): string {
  if (!isRecord(obj)) return "";

  for (const k of keys) {
    const v = obj[k];
    if (isString(v)) return v;
  }

  return "";
}

function getFirstArray(obj: unknown, keys: readonly string[]): unknown[] {
  if (!isRecord(obj)) return [];

  for (const k of keys) {
    const v = obj[k];
    if (Array.isArray(v)) return v;
  }

  return [];
}

function MegaTitle(cat: unknown) {
  return getFirstString(cat, ["title", "label", "name", "fallback", "slug"]);
}

function MegaItems(cat: unknown): unknown[] {
  return getFirstArray(cat, [
    "items",
    "children",
    "links",
    "list",
    "collections",
  ]);
}

function ItemTitle(it: unknown) {
  return getFirstString(it, [
    "title",
    "label",
    "name",
    "fallback",
    "slug",
    "value",
  ]);
}

function ItemHref(it: unknown) {
  return getFirstString(it, ["href", "url", "to", "link", "path", "valueHref"]);
}

function TopLink({
  href,
  children,
  active,
  external,
}: {
  href: string;
  children: ReactNode;
  active: boolean;
  external?: boolean;
}) {
  const klass = cn(
    "group relative cursor-pointer select-none transition-colors",
    "text-[13px] tracking-[0.02em] whitespace-nowrap",
    active ? "text-black" : "text-black/70 hover:text-black",
  );

  const underline = (
    <span
      aria-hidden
      className={cn(
        "pointer-events-none absolute left-0 -bottom-[0.75px] h-[0.75px] w-full rounded-full bg-black/65",
        "origin-left transition-transform duration-300 ease-out",
        active
          ? "scale-x-100 opacity-100"
          : "scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100",
      )}
    />
  );

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={klass}>
        {children}
        {underline}
      </a>
    );
  }

  return (
    <Link href={href} className={klass}>
      {children}
      {underline}
    </Link>
  );
}

type MegaCol = {
  title: string;
  items: Array<{ title: string; href: string }>;
};

function CatalogDropdown({
  dict,
  label,
  categories,
}: {
  dict: Dict;
  label: string;
  categories: unknown[];
}) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const closeTimerRef = useRef<number | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const active = useMemo(() => isActive(pathname, "/catalog"), [pathname]);

  const cols: MegaCol[] = useMemo(() => {
    const arr = Array.isArray(categories) ? categories : [];

    return arr
      .filter(Boolean)
      .slice(0, 6)
      .map((c) => {
        const title = normalizeStr(MegaTitle(c));
        const items = MegaItems(c)
          .map((it) => ({
            title: normalizeStr(ItemTitle(it)),
            href: normalizeStr(ItemHref(it)),
          }))
          .filter((x) => x.title && x.href);

        return { title, items };
      })
      .filter((c) => c.title || c.items.length);
  }, [categories]);

  const clearCloseTimer = () => {
    if (closeTimerRef.current !== null) {
      window.clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
  };

  const openMenu = () => {
    clearCloseTimer();
    setOpen(true);
  };

  const closeMenu = () => {
    clearCloseTimer();
    closeTimerRef.current = window.setTimeout(() => {
      setOpen(false);
    }, 160);
  };

  useEffect(() => {
    if (!open) return;

    const onDocMouseDown = (e: MouseEvent) => {
      const t = e.target;
      if (!(t instanceof Node)) return;

      if (triggerRef.current?.contains(t)) return;
      if (panelRef.current?.contains(t)) return;

      setOpen(false);
    };

    const onDocKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    document.addEventListener("mousedown", onDocMouseDown);
    document.addEventListener("keydown", onDocKeyDown);

    return () => {
      document.removeEventListener("mousedown", onDocMouseDown);
      document.removeEventListener("keydown", onDocKeyDown);
    };
  }, [open]);

  useEffect(() => {
    return () => {
      clearCloseTimer();
    };
  }, []);

  const GOLD = "#B9893B";

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onMouseEnter={openMenu}
        onMouseLeave={closeMenu}
        onFocus={openMenu}
        onClick={() => setOpen((v) => !v)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((v) => !v);
          }
        }}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          "group relative inline-flex items-center gap-1 cursor-pointer select-none transition-colors",
          "text-[13px] tracking-[0.02em] whitespace-nowrap",
          active || open ? "text-black" : "text-black/70 hover:text-black",
        )}
      >
        <span>{label}</span>
        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 transition-transform duration-200",
            open ? "rotate-180" : "rotate-0",
          )}
        />
        <span
          aria-hidden
          className={cn(
            "pointer-events-none absolute left-0 -bottom-[0.75px] h-[0.75px] w-full rounded-full bg-black/65",
            "origin-left transition-transform duration-300 ease-out",
            active || open
              ? "scale-x-100 opacity-100"
              : "scale-x-0 opacity-0 group-hover:scale-x-100 group-hover:opacity-100",
          )}
        />
      </button>

      <div
        ref={panelRef}
        onMouseEnter={openMenu}
        onMouseLeave={closeMenu}
        className={cn(
          "fixed inset-x-0 top-[48px] z-[999] bg-[#f3f3f3]",
          open
            ? "pointer-events-auto opacity-100"
            : "pointer-events-none opacity-0",
          "transition-opacity duration-200",
        )}
      >
        <div className="h-[3px] w-full" style={{ backgroundColor: GOLD }} />

        <div className="mx-auto w-full max-w-[1200px] px-4">
          <div className="relative py-10">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-0 top-6 grid h-10 w-10 place-items-center rounded-full transition hover:bg-black/[0.04] cursor-pointer"
              aria-label="Close catalog menu"
            >
              <X className="h-5 w-5 text-black/55" />
            </button>

            <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
              {cols.map((c, idx) => (
                <div key={`${c.title}-${idx}`} className="min-w-0">
                  <div
                    className={cn(
                      "text-[16px] font-medium tracking-[0.01em]",
                      "text-black/85 cursor-default select-none",
                    )}
                    style={{ color: GOLD }}
                  >
                    {c.title || tF(dict, "header.catalog.section", "Категория")}
                  </div>

                  <div className="mt-4 space-y-2">
                    {c.items.map((it) => (
                      <Link
                        key={`${it.href}:${it.title}`}
                        href={it.href}
                        onClick={() => setOpen(false)}
                        className="block text-[15px] leading-[1.65] text-black/85 transition-colors hover:text-[#B9893B]"
                      >
                        {it.title}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default function TopBar({
  dict,
  topLinks,
  phone,
  regionTitle,
  regionTitleKey,
  regionTitleFallback,
  addresses,
  callCtaLabel = "Заказать звонок",
  catalogCategories,
  onPickAddress,
  onOpenCall,
  onOpenMobileMenu,
}: {
  dict: Dict;
  topLinks: readonly {
    labelKey?: string;
    fallback: string;
    href: string;
    isExternal?: boolean;
  }[];
  phone: string;
  regionTitle?: string;
  regionTitleKey?: string;
  regionTitleFallback?: string;
  addresses: string[];
  callCtaLabel?: string;
  catalogCategories?: unknown[];
  onPickAddress: (address: string) => void;
  onOpenCall: () => void;
  onOpenMobileMenu: () => void;
}) {
  const pathname = usePathname();

  const resolvedRegionTitle =
    regionTitle ??
    tF(
      dict,
      String(regionTitleKey ?? "region.uz"),
      String(regionTitleFallback ?? "Узбекистан"),
    ).toUpperCase();

  const storesLabel = tF(dict, "header.stores", "Адреса магазинов");

  const catsForMenu: unknown[] =
    Array.isArray(catalogCategories) && catalogCategories.length
      ? catalogCategories
      : (MEGA_FALLBACK as unknown[]);

  return (
    <div className="border-black/10">
      <div className="mx-auto w-full max-w-[1200px] px-4">
        <div className="flex h-12 items-center justify-between text-[13px] text-black/80">
          <nav className="hidden min-w-0 flex-1 items-center overflow-visible md:flex">
            <div className="flex items-center gap-5 lg:gap-7 xl:gap-8 overflow-visible">
              {topLinks.map((l) => {
                const hrefNorm = String(l.href || "").trim();
                const isCatalog =
                  !l.isExternal &&
                  (hrefNorm === "/catalog" ||
                    hrefNorm === "/catalog/" ||
                    hrefNorm.startsWith("/catalog?"));

                if (isCatalog) {
                  return (
                    <CatalogDropdown
                      key={l.href}
                      dict={dict}
                      label={
                        l.labelKey
                          ? tF(dict, l.labelKey, l.fallback)
                          : l.fallback
                      }
                      categories={catsForMenu}
                    />
                  );
                }

                return (
                  <TopLink
                    key={l.href}
                    href={l.href}
                    active={!l.isExternal && isActive(pathname, l.href)}
                    external={l.isExternal}
                  >
                    {l.labelKey ? tF(dict, l.labelKey, l.fallback) : l.fallback}
                  </TopLink>
                );
              })}
            </div>
          </nav>

          <div className="flex items-center gap-2 md:hidden">
            <button
              className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full transition hover:bg-black/5"
              onClick={onOpenMobileMenu}
              aria-label="Menu"
              type="button"
            >
              <Menu className="h-5 w-5 text-black/70" />
            </button>
          </div>

          <div className="flex min-w-0 items-center gap-3 md:gap-4 lg:gap-5">
            <StoresDropdown
              label={storesLabel}
              regionTitle={resolvedRegionTitle}
              addresses={addresses}
              onPickAddress={onPickAddress}
            />

            <div className="hidden items-center gap-2 xl:inline-flex whitespace-nowrap">
              <Phone className="h-4 w-4 opacity-60" />
              <a
                href={`tel:${phone.replace(/\s|\(|\)|-/g, "")}`}
                className={cn(
                  "group relative cursor-pointer",
                  "text-[13px] tracking-[0.02em]",
                  "text-black/80 hover:text-black transition-colors",
                )}
              >
                {phone}
                <span
                  className={cn(
                    "pointer-events-none absolute left-0 -bottom-[0.75px]",
                    "h-[0.75px] w-full bg-black/60 origin-left",
                    "scale-x-0 transition-transform duration-300 ease-out",
                    "group-hover:scale-x-100",
                  )}
                />
              </a>
            </div>

            <CallButton label={callCtaLabel} onClick={onOpenCall} />
          </div>
        </div>
      </div>
    </div>
  );
}
