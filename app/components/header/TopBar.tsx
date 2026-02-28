"use client";

import Link from "next/link";
import { Phone, Menu, X } from "lucide-react";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
  useCallback,
} from "react";
import type { ReactNode } from "react";
import gsap from "gsap";
import { usePathname } from "next/navigation";
import { tF } from "@/i18n";

import StoresDropdown from "./StoresDropdown";
import CallButton from "./CallButton";

// ✅ берём ТВОИ данные как есть (если сверху не прокинул — возьмём отсюда)
import { megaCategories as MEGA_FALLBACK } from "@/app/lib/headerData";

type Dict = Record<string, unknown>;

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

/* ------------------------- safe utils (no any) ------------------------- */
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

// -------- dropdown utils (НЕ меняем структуру данных — просто читаем)
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

/* ------------------------------ TopLink ------------------------------ */

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
  const lineRef = useRef<HTMLSpanElement | null>(null);

  useLayoutEffect(() => {
    const line = lineRef.current;
    if (!line) return;

    gsap.set(line, {
      scaleX: active ? 1 : 0,
      opacity: active ? 1 : 0,
      transformOrigin: "left center",
    });
  }, [active]);

  const onEnter = useCallback(() => {
    const line = lineRef.current;
    if (!line) return;
    gsap.killTweensOf(line);
    gsap.to(line, {
      scaleX: 1,
      opacity: 1,
      duration: 0.35,
      ease: "power3.out",
      transformOrigin: "left center",
    });
  }, []);

  const onLeave = useCallback(() => {
    const line = lineRef.current;
    if (!line) return;
    if (active) return;
    gsap.killTweensOf(line);
    gsap.to(line, {
      scaleX: 0,
      opacity: 0,
      duration: 0.25,
      ease: "power3.inOut",
      transformOrigin: "right center",
    });
  }, [active]);

  const klass = cn(
    "relative cursor-pointer select-none transition-colors",
    "text-[13px] tracking-[0.02em] whitespace-nowrap",
    active ? "text-black" : "text-black/70 hover:text-black",
  );

  const underline = (
    <span
      ref={lineRef}
      aria-hidden
      className="pointer-events-none absolute left-0 -bottom-[0.75px] h-[0.75px] w-full rounded-full"
      style={{ background: "rgba(0,0,0,0.65)" }}
    />
  );

  if (external) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noreferrer"
        className={klass}
        onMouseEnter={onEnter}
        onMouseLeave={onLeave}
      >
        {children}
        {underline}
      </a>
    );
  }

  return (
    <Link
      href={href}
      className={klass}
      onMouseEnter={onEnter}
      onMouseLeave={onLeave}
    >
      {children}
      {underline}
    </Link>
  );
}

/* --------------------------- CatalogDropdown -------------------------- */

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

  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const panelRef = useRef<HTMLDivElement | null>(null);

  const active = useMemo(() => isActive(pathname, "/catalog"), [pathname]);

  // ✅ колонки (как на твоём примере)
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

  // ✅ close on outside + esc (листенеры только когда меню открыто)
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

  // ✅ лёгкая анимация без лагов: panel + заголовки + пункты
  useLayoutEffect(() => {
    const panel = panelRef.current;
    if (!panel) return;

    const colHeads = Array.from(
      panel.querySelectorAll<HTMLElement>("[data-mega-head]"),
    );
    const links = Array.from(
      panel.querySelectorAll<HTMLElement>("[data-mega-link]"),
    );

    gsap.killTweensOf(panel);
    gsap.killTweensOf([...colHeads, ...links]);

    if (!open) {
      gsap.set(panel, { opacity: 0, y: -10, pointerEvents: "none" });
      gsap.set(colHeads, { opacity: 0, y: 8 });
      gsap.set(links, { opacity: 0, y: 8 });
      return;
    }

    gsap.set(panel, { pointerEvents: "auto" });

    gsap.fromTo(
      panel,
      { opacity: 0, y: -10 },
      { opacity: 1, y: 0, duration: 0.28, ease: "power3.out" },
    );

    gsap.to(colHeads, {
      opacity: 1,
      y: 0,
      duration: 0.35,
      ease: "power3.out",
      stagger: 0.06,
      delay: 0.04,
    });

    gsap.to(links, {
      opacity: 1,
      y: 0,
      duration: 0.34,
      ease: "power3.out",
      stagger: 0.012,
      delay: 0.08,
    });
  }, [open, cols.length]);

  // ✅ золото (как на скринах)
  const GOLD = "#B9893B";

  return (
    <>
      {/* Триггер: тот же стиль, но по клику */}
      <button
        ref={triggerRef}
        type="button"
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
          "relative cursor-pointer select-none transition-colors",
          "text-[13px] tracking-[0.02em] whitespace-nowrap",
          active || open ? "text-black" : "text-black/70 hover:text-black",
        )}
      >
        {label}
        {/* underline как у остальных */}
        <span
          aria-hidden
          className="pointer-events-none absolute left-0 -bottom-[0.75px] h-[0.75px] w-full rounded-full"
          style={{
            background: "rgba(0,0,0,0.65)",
            opacity: active || open ? 1 : 0,
            transform: active || open ? "scaleX(1)" : "scaleX(0)",
            transformOrigin: "left center",
            transition: "transform .25s ease, opacity .25s ease",
          }}
        />
      </button>

      {/* ✅ ПАНЕЛЬ НА ВСЮ ШИРИНУ + золотая полоса */}
      <div
        ref={panelRef}
        className={cn("fixed inset-x-0 top-[48px] z-[999]", "bg-[#f3f3f3]")}
        style={{ opacity: 0, pointerEvents: "none" }}
      >
        {/* golden top line */}
        <div className="h-[3px] w-full" style={{ backgroundColor: GOLD }} />

        <div className="mx-auto w-full max-w-[1200px] px-4">
          <div className="relative py-10">
            {/* close */}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-0 top-6 grid h-10 w-10 place-items-center rounded-full transition hover:bg-black/[0.04] cursor-pointer"
              aria-label="Close catalog menu"
            >
              <X className="h-5 w-5 text-black/55" />
            </button>

            {/* колонки */}
            <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-5">
              {cols.map((c, idx) => (
                <div key={`${c.title}-${idx}`} className="min-w-0">
                  {/* ✅ выделяем ТОЛЬКО заголовки колонок */}
                  <div
                    data-mega-head
                    className={cn(
                      "text-[16px] font-medium tracking-[0.01em]",
                      "text-black/85 transition-colors",
                      "cursor-default select-none",
                    )}
                    style={{ color: GOLD }}
                  >
                    {c.title || tF(dict, "header.catalog.section", "Категория")}
                  </div>

                  <div className="mt-4 space-y-2">
                    {c.items.map((it) => (
                      <Link
                        data-mega-link
                        key={`${it.href}:${it.title}`}
                        href={it.href}
                        onClick={() => setOpen(false)}
                        className={cn(
                          "block text-[15px] leading-[1.65]",
                          "text-black/85 transition-colors",
                        )}
                        style={{ willChange: "transform, opacity" }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.color = GOLD;
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.color = "";
                        }}
                      >
                        {it.title}
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* bottom line like example */}
          </div>
        </div>
      </div>
    </>
  );
}

/* -------------------------------- TopBar -------------------------------- */

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

  // ✅ optional: если не передаёшь — возьмём fallback из headerData
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
        <div className="flex h-12 items-center justify-between text-[13px] text-black/80 flex-nowrap">
          {/* left links */}
          <nav className="hidden min-w-0 items-center overflow-visible md:flex">
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

          {/* mobile burger */}
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

          {/* right */}
          <div className="flex shrink-0 items-center gap-3 md:gap-5 lg:gap-7">
            <StoresDropdown
              label={storesLabel}
              regionTitle={resolvedRegionTitle}
              addresses={addresses}
              onPickAddress={onPickAddress}
            />

            <div className="hidden items-center gap-2 lg:inline-flex whitespace-nowrap">
              <Phone className="h-4 w-4 opacity-60" />

              {/* ✅ fix: underline was using group-hover but anchor wasn't a group */}
              <a
                href={`tel:${phone.replace(/\s|\(|\)|-/g, "")}`}
                className={cn(
                  "group relative cursor-pointer",
                  "text-[13px] tracking-[0.02em]",
                  "text-black/80 hover:text-black transition-colors",
                )}
              >
                {phone}

                {/* underline как у остальных ссылок */}
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
