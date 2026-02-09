"use client";

import Link from "next/link";
import Image from "next/image";
import { useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { X } from "lucide-react";

import { tF } from "@/i18n";
import {
  MegaCategory,
  MegaKey,
  MegaItem,
  MEGA_PREVIEWS,
} from "@/app/lib/headerData";

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

  // активный item для превью (по href)
  const [activeItemHref, setActiveItemHref] = useState<string | null>(null);

  const navWrapRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLDivElement | null>(null);
  const indicatorRef = useRef<HTMLDivElement | null>(null);
  const menuOuterRef = useRef<HTMLDivElement | null>(null);
  const menuPanelRef = useRef<HTMLDivElement | null>(null);

  // ✅ hover-intent (задержка открытия)
  const hoverTimer = useRef<number | null>(null);

  const activeCat = useMemo(
    () => categories.find((c) => c.key === active) || null,
    [categories, active],
  );

  // сколько колонок слева: делаем умнее (меньше пустоты)
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

  // при смене категории — ставим дефолтный item для превью
  useLayoutEffect(() => {
    if (!activeCat) {
      setActiveItemHref(null);
      return;
    }
    const firstWithPreview =
      activeCat.items.find((it) => !!MEGA_PREVIEWS[it.href]) ??
      activeCat.items[0];
    setActiveItemHref(firstWithPreview?.href ?? null);
  }, [activeCat]);

  const preview = useMemo(() => {
    if (!activeItemHref) return null;
    return MEGA_PREVIEWS[activeItemHref] ?? null;
  }, [activeItemHref]);

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

  //  hover-intent helpers
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
            duration: 0.38,
            ease: "power3.out",
          },
        );
      } else {
        gsap.set(outer, { pointerEvents: "none" });
        gsap.to(panel, {
          autoAlpha: 0,
          y: 8,
          filter: "blur(10px)",
          duration: 0.22,
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

  // ===== helpers to render i18n text =====
  const catLabel = (c: MegaCategory) =>
    tF(dict, String(c.labelKey ?? ""), String(c.fallback ?? ""));

  const itemLabel = (it: MegaItem) =>
    tF(dict, String(it.labelKey ?? ""), String(it.fallback ?? ""));

  const previewTitle = preview
    ? tF(dict, String(preview.titleKey ?? ""), String(preview.fallback ?? ""))
    : "";

  const previewHref = activeItemHref ?? undefined;
  const activeCatTitle = activeCat ? catLabel(activeCat) : "";

  return (
    <div className="border-y border-black/10">
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
                      "py-2 transition cursor-default select-none cursor-pointer",
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

          {/* MOBILE CATEGORIES */}
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
                <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-[0_20px_60px_-45px_rgba(0,0,0,0.45)]">
                  <div className="mb-3 flex items-center justify-between">
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

          {/* DESKTOP MEGA */}
          <div
            ref={menuOuterRef}
            className="absolute left-0 top-[64px] z-50 hidden w-full pointer-events-none md:block"
          >
            <div
              ref={menuPanelRef}
              className={cn(
                "rounded-2xl border border-black/10 bg-white",
                "shadow-[0_35px_110px_-65px_rgba(0,0,0,0.55)]",
                "opacity-0",
              )}
              onMouseEnter={cancelHoverOpen}
            >
              <div className="px-8 pt-7 pb-8">
                <div className="grid grid-cols-12 gap-10">
                  {/* LEFT: списки */}
                  <div className="col-span-7">
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
                            const isItemActive = it.href === activeItemHref;
                            const hasPreview = !!MEGA_PREVIEWS[it.href];
                            const label = itemLabel(it);

                            return (
                              <Link
                                key={it.href}
                                href={it.href}
                                onMouseEnter={() => setActiveItemHref(it.href)}
                                onFocus={() => setActiveItemHref(it.href)}
                                onClick={() => setActive(null)}
                                className={cn(
                                  "block w-full text-left cursor-pointer",
                                  "text-[14px] tracking-[0.06em] transition",
                                  isItemActive
                                    ? "text-black"
                                    : "text-black/70 hover:text-black",
                                  !hasPreview && "opacity-60",
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

                  {/* RIGHT: превью */}
                  <div className="col-span-5">
                    <div className="min-h-[330px]">
                      <div className="relative overflow-hidden rounded-2xl bg-black/5">
                        <div className="relative aspect-[16/10] w-full">
                          {preview?.main ? (
                            <Link
                              href={previewHref ?? "#"}
                              className="group absolute inset-0 block cursor-pointer"
                              onClick={(e) => {
                                if (!previewHref) e.preventDefault();
                                setActive(null);
                              }}
                              aria-label={previewTitle}
                            >
                              <Image
                                key={preview.main}
                                src={preview.main}
                                alt={previewTitle}
                                fill
                                className="object-cover opacity-0 animate-[fade_.22s_ease-out_forwards] transition duration-700 group-hover:scale-[1.02]"
                                priority
                              />

                              {!!previewTitle && (
                                <div className="absolute inset-x-0 bottom-0 p-4">
                                  <div className="inline-flex rounded-xl bg-black/55 px-3 py-2 backdrop-blur-md">
                                    <span className="text-[14px] font-semibold text-white">
                                      {previewTitle}
                                    </span>
                                  </div>
                                </div>
                              )}

                              <div className="pointer-events-none absolute right-3 top-3 rounded-full bg-white/85 px-3 py-1 text-[11px] tracking-[0.14em] uppercase text-black/70 opacity-0 group-hover:opacity-100 transition">
                                Смотреть
                              </div>
                            </Link>
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-sm text-black/40">
                              Наведи на коллекцию
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="mt-4 grid grid-cols-2 gap-4">
                        <MiniCard
                          src={preview?.a}
                          href={previewHref}
                          onGo={() => setActive(null)}
                        />
                        <MiniCard
                          src={preview?.b}
                          href={previewHref}
                          onGo={() => setActive(null)}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <style jsx global>{`
                @keyframes fade {
                  to {
                    opacity: 1;
                  }
                }
              `}</style>
            </div>
          </div>
          {/* /DESKTOP MEGA */}
        </div>
      </div>
    </div>
  );
}

function MiniCard({
  src,
  href,
  onGo,
}: {
  src?: string;
  href?: string;
  onGo?: () => void;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl bg-black/5">
      <div className="relative aspect-[16/10] w-full">
        {src ? (
          <Link
            href={href ?? "#"}
            className="group absolute inset-0 block cursor-pointer"
            onClick={(e) => {
              if (!href) e.preventDefault();
              onGo?.();
            }}
            aria-label="Открыть"
          >
            <Image
              key={src}
              src={src}
              alt=""
              fill
              className="object-cover opacity-0 animate-[fade_.22s_ease-out_forwards] transition duration-700 group-hover:scale-[1.03]"
            />
          </Link>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-black/35">
            —
          </div>
        )}
      </div>
    </div>
  );
}
