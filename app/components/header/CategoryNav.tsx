"use client";

import Link from "next/link";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { X } from "lucide-react";

import { tF } from "@/i18n";
import { MegaCategory, MegaKey, MegaItem } from "@/app/lib/headerData";

function cn(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

function chunkColumns(items: MegaItem[], cols: number) {
  const perCol = Math.ceil(items.length / cols);
  return Array.from({ length: cols }, (_, i) =>
    items.slice(i * perCol, (i + 1) * perCol),
  ).filter((c) => c.length);
}

export default function CategoryNav({
  categories,
  dict,
}: {
  categories: MegaCategory[];
  dict: any; // словарь i18n (ru/uz)
}) {
  const [active, setActive] = useState<MegaKey | null>(null);
  const open = active !== null;

  const navWrapRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLDivElement | null>(null);
  const indicatorRef = useRef<HTMLDivElement | null>(null);
  const menuOuterRef = useRef<HTMLDivElement | null>(null);
  const menuPanelRef = useRef<HTMLDivElement | null>(null);

  // hover-intent
  const hoverTimer = useRef<number | null>(null);

  const activeCat = useMemo(
    () => categories.find((c) => c.key === active) || null,
    [categories, active],
  );

  const colsCount = useMemo(() => {
    const n = activeCat?.items?.length ?? 0;
    if (n <= 6) return 3;
    if (n <= 10) return 4;
    return 5;
  }, [activeCat]);

  const columns = useMemo(
    () => chunkColumns(activeCat?.items ?? [], colsCount),
    [activeCat, colsCount],
  );

  const moveIndicatorTo = (el: HTMLElement | null, immediate = false) => {
    const ind = indicatorRef.current;
    const nav = navRef.current;
    if (!ind || !nav) return;

    if (!el) {
      gsap.to(ind, {
        autoAlpha: 0,
        duration: immediate ? 0 : 0.2,
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
      duration: immediate ? 0 : 0.35,
      ease: "power3.out",
    });
  };

  const cancelHoverOpen = () => {
    if (hoverTimer.current) window.clearTimeout(hoverTimer.current);
    hoverTimer.current = null;
  };

  const openWithDelay = (key: MegaKey, el: HTMLElement) => {
    cancelHoverOpen();
    hoverTimer.current = window.setTimeout(() => {
      setActive(key);
      moveIndicatorTo(el, false);
    }, 240);
  };

  useLayoutEffect(() => {
    const panel = menuPanelRef.current;
    const outer = menuOuterRef.current;
    if (!panel || !outer) return;

    const ctx = gsap.context(() => {
      if (open) {
        gsap.set(outer, { pointerEvents: "auto" });
        gsap.fromTo(
          panel,
          { autoAlpha: 0, y: 10, filter: "blur(10px)" },
          {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.28,
            ease: "power3.out",
          },
        );
      } else {
        gsap.set(outer, { pointerEvents: "none" });
        gsap.to(panel, {
          autoAlpha: 0,
          y: 8,
          filter: "blur(10px)",
          duration: 0.2,
          ease: "power2.out",
        });
      }
    }, navWrapRef);

    return () => ctx.revert();
  }, [open, active]);

  const onNavLeave = () => {
    cancelHoverOpen();
    setActive(null);
    moveIndicatorTo(null);
  };

  useLayoutEffect(() => {
    if (!open) cancelHoverOpen();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const catLabel = (c: MegaCategory) =>
    tF(dict, String(c.labelKey ?? ""), String(c.fallback ?? ""));

  const itemLabel = (it: MegaItem) =>
    tF(dict, String(it.labelKey ?? ""), String(it.fallback ?? ""));

  const activeCatTitle = activeCat ? catLabel(activeCat) : "";

  return (
    <div className="w-full bg-[#f3f3f3]  border-black/10">
      <div className="mx-auto w-full max-w-[1200px] px-4">
        <div ref={navWrapRef} className="relative" onMouseLeave={onNavLeave}>
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
                    onMouseEnter={(e) => openWithDelay(c.key, e.currentTarget)}
                    onMouseLeave={cancelHoverOpen}
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
            <div className="flex h-14 items-center gap-6 overflow-x-auto whitespace-nowrap text-[13px] tracking-[0.16em] text-black/70">
              {categories.map((c) => {
                const label = catLabel(c);
                return (
                  <button
                    key={c.key}
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
                  <div className="pl-2 mb-3 flex items-center justify-between">
                    <div className="text-[12px] tracking-[0.18em] text-black/50">
                      {activeCatTitle}
                    </div>
                    <button
                      className="inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-full hover:bg-black/5 transition"
                      onClick={() => setActive(null)}
                      aria-label="Close"
                    >
                      <X className="h-4 w-4 text-black/60" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    {activeCat.items.map((it) => (
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

          {/* DESKTOP MEGA (ТОЛЬКО СПИСКИ, БЕЗ ПРАВОГО БЛОКА) */}
          <div
            ref={menuOuterRef}
            className="absolute left-0 top-[64px] z-50 hidden w-full pointer-events-none md:block"
          >
            <div
              ref={menuPanelRef}
              className={cn(
                "bg-[#f3f3f3]",
                "border-0 ring-0 outline-none",
                "shadow-[0_40px_120px_-30px_rgba(0,0,0,0.32),0_12px_30px_10px_rgba(0,0,0,0.15)]",
                "opacity-0",
              )}
              style={{
                outline: "none",
                boxShadow: "0 22px 60px -28px rgba(0,0,0,0.28)",
                border: "none",
              }}
              onMouseEnter={cancelHoverOpen}
            >
              <div className="px-8 pt-7 pb-8">
                <div className="grid grid-cols-12 gap-10">
                  {/* LEFT: списки на всю ширину */}
                  <div className="col-span-12">
                    <div
                      className={cn(
                        colsCount === 3 && "grid grid-cols-3 gap-x-12 gap-y-2",
                        colsCount === 4 && "grid grid-cols-4 gap-x-10 gap-y-2",
                        colsCount === 5 && "grid grid-cols-5 gap-x-8 gap-y-2",
                      )}
                    >
                      {columns.map((col, idx) => (
                        <div key={idx} className="space-y-3">
                          {col.map((it) => {
                            const label = itemLabel(it);

                            return (
                              <Link
                                key={it.href}
                                href={it.href}
                                onClick={() => setActive(null)}
                                className={cn(
                                  "block w-full text-left cursor-pointer",
                                  "text-[14px] tracking-[0.06em]",
                                  "text-black/70 transition-colors duration-200",
                                  "hover:text-[#B9893B]",
                                )}
                              >
                                {label}
                              </Link>
                            );
                          })}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* /DESKTOP MEGA */}
        </div>
      </div>
    </div>
  );
}
