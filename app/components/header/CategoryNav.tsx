"use client";

import Link from "next/link";
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import gsap from "gsap";

import { tF } from "@/i18n";
import { MegaCategory, MegaKey, MegaItem } from "@/app/lib/headerData";

function cn(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

type Dict = Record<string, unknown>;

function safeStr(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v : fallback;
}

function safeItems(items: MegaItem[] | undefined | null): MegaItem[] {
  return Array.isArray(items) ? items : [];
}

export default function CategoryNav({
  categories,
  dict,
}: {
  categories: MegaCategory[];
  dict: Dict;
}) {
  const [active, setActive] = useState<MegaKey | null>(null);
  const [mounted, setMounted] = useState(false);
  const [menuTop, setMenuTop] = useState(0);

  const open = active !== null;

  const navWrapRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLDivElement | null>(null);
  const indicatorRef = useRef<HTMLDivElement | null>(null);
  const menuPanelRef = useRef<HTMLDivElement | null>(null);

  const hoverTimer = useRef<number | null>(null);
  const closeTimer = useRef<number | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const activeCat = useMemo(
    () => categories.find((c) => c.key === active) || null,
    [categories, active],
  );

  const activeItems = safeItems(activeCat?.items ?? undefined);

  const updateMenuTop = () => {
    const nav = navRef.current;
    if (!nav) return;

    const rect = nav.getBoundingClientRect();
    const nextTop = Math.round(rect.bottom);

    setMenuTop((prev) => (prev === nextTop ? prev : nextTop));
  };

  useEffect(() => {
    updateMenuTop();

    window.addEventListener("resize", updateMenuTop);

    return () => {
      window.removeEventListener("resize", updateMenuTop);
    };
  }, []);

  const moveIndicatorTo = (el: HTMLElement | null, immediate = false) => {
    const ind = indicatorRef.current;
    const nav = navRef.current;

    if (!ind || !nav) return;

    if (!el) {
      gsap.to(ind, {
        autoAlpha: 0,
        duration: immediate ? 0 : 0.18,
        ease: "power2.out",
      });

      return;
    }

    const r = el.getBoundingClientRect();
    const n = nav.getBoundingClientRect();
    const x = r.left - n.left;
    const w = r.width;

    gsap.to(ind, {
      x,
      width: w,
      autoAlpha: 1,
      duration: immediate ? 0 : 0.3,
      ease: "power3.out",
    });
  };

  const cancelHoverOpen = () => {
    if (hoverTimer.current !== null) {
      window.clearTimeout(hoverTimer.current);
    }

    hoverTimer.current = null;
  };

  const cancelClose = () => {
    if (closeTimer.current !== null) {
      window.clearTimeout(closeTimer.current);
    }

    closeTimer.current = null;
  };

  const openWithDelay = (key: MegaKey, el: HTMLElement) => {
    cancelHoverOpen();
    cancelClose();
    updateMenuTop();

    hoverTimer.current = window.setTimeout(() => {
      updateMenuTop();
      setActive(key);
      moveIndicatorTo(el, false);
    }, 90);
  };

  const closeWithDelay = () => {
    cancelHoverOpen();
    cancelClose();

    closeTimer.current = window.setTimeout(() => {
      setActive(null);
      moveIndicatorTo(null);
    }, 220);
  };

  const closeNow = () => {
    cancelHoverOpen();
    cancelClose();
    setActive(null);
    moveIndicatorTo(null);
  };

  useLayoutEffect(() => {
    const panel = menuPanelRef.current;
    if (!panel) return;

    if (open) {
      gsap.fromTo(
        panel,
        { autoAlpha: 0, y: 6 },
        {
          autoAlpha: 1,
          y: 0,
          duration: 0.18,
          ease: "power2.out",
        },
      );
    } else {
      gsap.to(panel, {
        autoAlpha: 0,
        y: 5,
        duration: 0.14,
        ease: "power2.out",
      });
    }
  }, [open, active]);

  useEffect(() => {
    return () => {
      cancelHoverOpen();
      cancelClose();
    };
  }, []);

  const catLabel = (c: MegaCategory) =>
    tF(dict, safeStr(c.labelKey, ""), safeStr(c.fallback, ""));

  const itemLabel = (it: MegaItem) =>
    tF(dict, safeStr(it.labelKey, ""), safeStr(it.fallback, ""));

  const desktopMenu =
    mounted && open && activeCat
      ? createPortal(
          <div
            className="fixed left-0 right-0 z-[99999] hidden md:block"
            style={{ top: menuTop }}
            onMouseEnter={cancelClose}
            onMouseLeave={closeWithDelay}
          >
            <div className="mx-auto w-full max-w-[1200px] px-4">
              <div
                ref={menuPanelRef}
                className={cn(
                  "w-full bg-[#f3f3f3]",
                  "border-0 ring-0 outline-none",
                  "shadow-[0_22px_60px_-28px_rgba(0,0,0,0.28)]",
                )}
                style={{
                  outline: "none",
                  border: "none",
                }}
              >
                <div className="px-6 py-5">
                  <div className="grid max-w-[520px] grid-cols-2 gap-x-20 gap-y-3">
                    {activeItems.map((it) => {
                      const label = itemLabel(it);

                      return (
                        <Link
                          key={it.href}
                          href={it.href}
                          onClick={closeNow}
                          className={cn(
                            "block min-w-0 text-left cursor-pointer",
                            "text-[14px] tracking-[0.08em] uppercase",
                            "text-black/75 transition-colors duration-200",
                            "hover:text-[#B9893B]",
                          )}
                        >
                          <span className="block truncate">{label}</span>
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <div className="w-full bg-[#f3f3f3] border-black/10">
        <div className="mx-auto w-full max-w-[1200px] px-4">
          <div ref={navWrapRef} className="relative">
            {/* DESKTOP */}
            <div ref={navRef} className="relative hidden md:block">
              <div className="flex h-16 items-center justify-between text-[15px] tracking-[0.12em] text-black/70">
                {categories.map((c) => {
                  const isActive = c.key === active;
                  const label = catLabel(c);

                  return (
                    <button
                      key={c.key}
                      type="button"
                      onMouseEnter={(e) =>
                        openWithDelay(c.key, e.currentTarget)
                      }
                      onMouseLeave={closeWithDelay}
                      onFocus={(e) => openWithDelay(c.key, e.currentTarget)}
                      className={cn(
                        "py-2 transition select-none cursor-pointer",
                        isActive ? "text-black" : "hover:text-black",
                      )}
                      aria-label={label}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              <div
                ref={indicatorRef}
                className="pointer-events-none absolute bottom-[10px] left-0 h-[1.5px] w-[40px] rounded-full bg-black/70 opacity-0"
              />
            </div>

            {/* MOBILE */}
            <div className="md:hidden">
              <div className="flex h-14 items-center gap-6 overflow-x-auto whitespace-nowrap text-[13px] tracking-[0.16em] text-black/70 no-scrollbar">
                {categories.map((c) => {
                  const label = catLabel(c);

                  return (
                    <button
                      key={c.key}
                      type="button"
                      onClick={() =>
                        setActive((prev) => (prev === c.key ? null : c.key))
                      }
                      className={cn(
                        "cursor-pointer py-2 transition",
                        active === c.key ? "text-black" : "hover:text-black",
                      )}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>

              {open && activeCat && (
                <div className="pb-4">
                  <div className="rounded-none bg-[#f3f3f3] shadow-[0_12px_40px_rgba(0,0,0,0.08)]">
                    <div className="grid grid-cols-2 gap-2 px-2 py-3">
                      {activeItems.map((it) => (
                        <Link
                          key={it.href}
                          href={it.href}
                          onClick={() => setActive(null)}
                          className="cursor-pointer rounded-xl px-3 py-2 text-[13px] text-black/75 hover:bg-black/5 transition"
                        >
                          {itemLabel(it)}
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {desktopMenu}
    </>
  );
}
