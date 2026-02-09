"use client";

import Link from "next/link";
import { Phone, Menu } from "lucide-react";
import StoresDropdown from "./StoresDropdown";
import CallButton from "./CallButton";
import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { usePathname } from "next/navigation";
import { tF } from "@/i18n";

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

function isActive(pathname: string, href: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(href + "/");
}

function TopLink({
  href,
  children,
  active,
  external,
}: {
  href: string;
  children: React.ReactNode;
  active: boolean;
  external?: boolean;
}) {
  const rootRef = useRef<HTMLAnchorElement | null>(null);
  const lineRef = useRef<HTMLSpanElement | null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const line = lineRef.current;
    if (!root || !line) return;

    gsap.set(line, {
      scaleX: active ? 1 : 0,
      opacity: active ? 1 : 0,
      transformOrigin: "left center",
    });

    const onEnter = () => {
      gsap.killTweensOf(line);
      gsap.to(line, {
        scaleX: 1,
        opacity: 1,
        duration: 0.35,
        ease: "power3.out",
        transformOrigin: "left center",
      });
    };

    const onLeave = () => {
      if (active) return;
      gsap.killTweensOf(line);
      gsap.to(line, {
        scaleX: 0,
        opacity: 0,
        duration: 0.25,
        ease: "power3.inOut",
        transformOrigin: "right center",
      });
    };

    root.addEventListener("mouseenter", onEnter);
    root.addEventListener("mouseleave", onLeave);

    return () => {
      root.removeEventListener("mouseenter", onEnter);
      root.removeEventListener("mouseleave", onLeave);
    };
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
        ref={rootRef}
        href={href}
        target="_blank"
        rel="noreferrer"
        className={klass}
      >
        {children}
        {underline}
      </a>
    );
  }

  return (
    <Link ref={rootRef} href={href} className={klass}>
      {children}
      {underline}
    </Link>
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
  onPickAddress,
  onOpenCall,
  onOpenMobileMenu,
}: {
  dict: any;
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

  return (
    <div className="border-b border-black/10">
      <div className="mx-auto w-full max-w-[1200px] px-4">
        {/* ✅ фикс: nowrap + min-w-0 для левого блока */}
        <div className="flex h-12 items-center justify-between text-[14px] text-black/80 flex-nowrap">
          {/* left links */}
          <nav className="hidden min-w-0 items-center overflow-hidden md:flex">
            <div className="flex items-center gap-5 lg:gap-7 xl:gap-8">
              {topLinks.map((l) => (
                <TopLink
                  key={l.href}
                  href={l.href}
                  active={!l.isExternal && isActive(pathname, l.href)}
                  external={l.isExternal}
                >
                  {l.labelKey ? tF(dict, l.labelKey, l.fallback) : l.fallback}
                </TopLink>
              ))}
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
              <Phone className="h-4 w-4 opacity-70" />
              <a
                href={`tel:${phone.replace(/\s|\(|\)|-/g, "")}`}
                className="cursor-pointer transition hover:text-black"
              >
                {phone}
              </a>
            </div>

            <CallButton label={callCtaLabel} onClick={onOpenCall} />
          </div>
        </div>
      </div>
    </div>
  );
}
