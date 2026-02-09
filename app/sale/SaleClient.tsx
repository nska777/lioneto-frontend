"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight, Sparkles, ArrowRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

type SaleTag = "Распродажа" | "Подборка" | "Спеццена" | "Новая цена";

type SaleItem = {
  id: string;
  title: string;
  excerpt: string;
  period: string;
  tag: SaleTag;
  href: string;
  image: string;
  highlight?: string;
};

const TAGS: Array<"Все" | SaleTag> = [
  "Все",
  "Распродажа",
  "Подборка",
  "Спеццена",
  "Новая цена",
];

const mockSale: SaleItem[] = [
  {
    id: "s1",
    tag: "Распродажа",
    title: "Зимняя распродажа спальни",
    excerpt:
      "Избранные позиции и комплекты. Сдержанные условия, понятная выгода.",
    period: "до 31 января",
    href: "/catalog",
    image: "/images/home/collections/1.jpg",
    highlight: "-20%",
  },
  {
    id: "s2",
    tag: "Спеццена",
    title: "Спеццены на гостиные",
    excerpt:
      "Подборка мебели для гостиной: фокус на материалах, финише и функциональности.",
    period: "до 15 февраля",
    href: "/catalog",
    image: "/images/home/collections/4.jpg",
    highlight: "SALE",
  },
  {
    id: "s3",
    tag: "Подборка",
    title: "Комплекты для прихожей",
    excerpt:
      "Лаконичные решения, чтобы быстро собрать аккуратный входной блок.",
    period: "ограничено",
    href: "/catalog",
    image: "/images/home/collections/7.jpg",
    highlight: "SET",
  },
  {
    id: "s4",
    tag: "Новая цена",
    title: "Новая цена на кабинеты",
    excerpt:
      "Рабочее пространство в премиальном стиле: строгая геометрия и удобство.",
    period: "пока действует",
    href: "/catalog",
    image: "/images/home/collections/10.jpg",
    highlight: "NEW",
  },
];

function Pill({
  active,
  label,
  onClick,
  id,
}: {
  active?: boolean;
  label: string;
  onClick: () => void;
  id: (typeof TAGS)[number];
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-pill
      data-pill-id={id}
      className={cn(
        "relative cursor-pointer select-none rounded-full border px-4 py-2 text-[12px] font-medium tracking-[0.16em] transition",
        "outline-none focus-visible:ring-2 focus-visible:ring-black/10 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        active
          ? "border-black/15 bg-black text-white"
          : "border-black/10 bg-white text-black/70 hover:border-black/18 hover:text-black",
      )}
    >
      <span className="relative z-[2]">{label}</span>

      {/* мягкий глянец */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 rounded-full opacity-0 transition-opacity duration-300",
          active ? "opacity-100" : "opacity-0",
        )}
        style={{
          background:
            "radial-gradient(120px 40px at 30% 20%, rgba(255,255,255,0.35), transparent 60%)",
        }}
      />
    </button>
  );
}

function SaleCard({ item }: { item: SaleItem }) {
  return (
    <Link
      href={item.href}
      data-reveal
      data-sale-card
      aria-label={item.title}
      className={cn(
        "group relative block overflow-hidden rounded-3xl border border-black/10 bg-white",
        "transition hover:border-black/18",
        "cursor-pointer",
        "outline-none focus-visible:ring-2 focus-visible:ring-black/10 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
      )}
    >
      <div className="relative aspect-[16/10] w-full overflow-hidden">
        <Image
          src={item.image}
          alt={item.title}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-[1.05]"
        />

        {/* киношная виньетка + top-glow */}
        <div className="absolute inset-0 bg-[linear-gradient(to_top,rgba(0,0,0,0.56),transparent_62%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(900px_480px_at_50%_-20%,rgba(255,255,255,0.10),transparent_60%)]" />

        {/* диагональная текстура — менее заметная */}
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(135deg, rgba(255,255,255,0.18) 0 1px, transparent 1px 12px)",
          }}
        />

        {/* chips */}
        <div className="absolute left-4 top-4 flex flex-wrap items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center rounded-full px-3 py-1 text-[11px] tracking-[0.14em]",
              "border border-white/35 bg-white/90 text-black/85",
              "shadow-[0_10px_30px_rgba(0,0,0,0.18)]",
              "backdrop-blur",
            )}
          >
            {item.tag.toUpperCase()}
          </span>

          {item.highlight && (
            <span
              className={cn(
                "inline-flex items-center rounded-full px-3 py-1 text-[11px] font-semibold tracking-[0.14em]",
                "border border-white/35 bg-black/80 text-white",
                "shadow-[0_10px_30px_rgba(0,0,0,0.22)]",
                "backdrop-blur",
              )}
            >
              {item.highlight}
            </span>
          )}
        </div>

        {/* title */}
        <div className="absolute bottom-4 left-4 right-4">
          <div className="text-[12px] tracking-[0.16em] text-white/85">
            {item.period.toUpperCase()}
          </div>
          <h3 className="mt-2 text-[16px] font-semibold leading-snug tracking-[-0.01em] text-white md:text-[18px]">
            {item.title}
          </h3>
        </div>

        {/* hover halo */}
        <div
          aria-hidden
          className="pointer-events-none absolute -right-24 -bottom-24 h-72 w-72 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-100"
          style={{
            background:
              "radial-gradient(circle at 30% 30%, rgba(214,190,160,0.30), transparent 62%)",
          }}
        />
      </div>

      <div className="p-6">
        <p className="text-[14px] leading-7 text-black/70">{item.excerpt}</p>

        <div className="mt-5 flex items-center justify-between">
          <span className="inline-flex items-center gap-2 text-[12px] font-medium tracking-[0.18em] text-black/80 transition group-hover:text-black">
            СМОТРЕТЬ <ArrowUpRight className="h-4 w-4" />
          </span>

          <span className="text-[11px] tracking-[0.18em] text-black/40">
            LIONETO
          </span>
        </div>
      </div>

      {/* тонкая нижняя линия */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 bottom-0 h-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(0,0,0,0.16), transparent)",
        }}
      />
    </Link>
  );
}

export default function SaleClient() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const pillsRef = useRef<HTMLDivElement | null>(null);
  const ctaRef = useRef<HTMLDivElement | null>(null);

  const [tag, setTag] = useState<(typeof TAGS)[number]>("Все");

  const items = useMemo(() => {
    if (tag === "Все") return mockSale;
    return mockSale.filter((it) => it.tag === tag);
  }, [tag]);

  useLayoutEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (reduce) return;

      // reveal
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 18, scale: 0.985 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.75,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              once: true,
            },
          },
        );
      });

      // hover lift cards
      gsap.utils.toArray<HTMLElement>("[data-sale-card]").forEach((el) => {
        const onEnter = () =>
          gsap.to(el, { y: -5, duration: 0.35, ease: "power3.out" });
        const onLeave = () =>
          gsap.to(el, { y: 0, duration: 0.45, ease: "power3.out" });

        el.addEventListener("mouseenter", onEnter);
        el.addEventListener("mouseleave", onLeave);

        (el as any).__cleanup = () => {
          el.removeEventListener("mouseenter", onEnter);
          el.removeEventListener("mouseleave", onLeave);
        };
      });

      // active-pill indicator
      const pills = pillsRef.current;
      if (pills) {
        const indicator = pills.querySelector<HTMLElement>(
          "[data-pill-indicator]",
        );
        const setIndicator = () => {
          if (!indicator) return;
          const activeBtn = pills.querySelector<HTMLElement>(
            `[data-pill-id="${tag}"]`,
          );
          if (!activeBtn) return;

          const a = activeBtn.getBoundingClientRect();
          const p = pills.getBoundingClientRect();
          gsap.to(indicator, {
            x: a.left - p.left,
            width: a.width,
            duration: 0.45,
            ease: "power3.out",
          });
        };

        setIndicator();
        const onResize = () => setIndicator();
        window.addEventListener("resize", onResize);

        (pills as any).__cleanup = () => {
          window.removeEventListener("resize", onResize);
        };
      }

      // CTA shimmer
      const cta = ctaRef.current;
      if (cta) {
        const btn = cta.querySelector<HTMLElement>("[data-cta]");
        const sheen = cta.querySelector<HTMLElement>("[data-sheen]");
        if (btn && sheen) {
          const onEnter = () => {
            gsap.fromTo(
              sheen,
              { xPercent: -160, autoAlpha: 0 },
              {
                xPercent: 220,
                autoAlpha: 1,
                duration: 0.9,
                ease: "power3.out",
                onComplete: () => {
                  gsap.set(sheen, { autoAlpha: 0, xPercent: -160 });
                },
              },
            );
          };
          btn.addEventListener("mouseenter", onEnter);
          (btn as any).__cleanup = () =>
            btn.removeEventListener("mouseenter", onEnter);
        }
      }

      ScrollTrigger.refresh();
    }, rootRef);

    return () => {
      if (rootRef.current) {
        rootRef.current
          .querySelectorAll<HTMLElement>("[data-sale-card]")
          .forEach((el) => {
            const fn = (el as any).__cleanup;
            if (typeof fn === "function") fn();
          });
      }
      if (pillsRef.current) {
        const fn = (pillsRef.current as any).__cleanup;
        if (typeof fn === "function") fn();
      }
      if (ctaRef.current) {
        const btn = ctaRef.current.querySelector<HTMLElement>("[data-cta]");
        const fn = btn && (btn as any).__cleanup;
        if (typeof fn === "function") fn();
      }
      ctx.revert();
    };
  }, [items.length, tag]);

  return (
    <div ref={rootRef}>
      {/* header/filter bar */}
      <div
        data-reveal
        className={cn(
          "relative overflow-hidden rounded-3xl border border-black/10 bg-white p-5 md:p-6",
          "flex flex-col gap-4 md:flex-row md:items-center md:justify-between",
        )}
      >
        {/* живой фон */}
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute -left-24 -top-24 h-72 w-72 rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle at 35% 35%, rgba(214,190,160,0.30), transparent 60%)",
            }}
          />
          <div
            className="absolute -right-24 -bottom-24 h-72 w-72 rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, rgba(0,0,0,0.08), transparent 60%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(1000px 520px at 50% -20%, rgba(0,0,0,0.06), transparent 62%)",
            }}
          />
        </div>

        <div className="relative">
          <div
            ref={pillsRef}
            className="relative inline-flex flex-wrap gap-2 rounded-full border border-black/10 bg-white/70 p-2"
          >
            <div
              data-pill-indicator
              aria-hidden
              className="pointer-events-none absolute left-2 top-2 h-[34px] rounded-full"
              style={{
                width: 120,
                background:
                  "linear-gradient(180deg, rgba(0,0,0,0.92), rgba(0,0,0,0.85))",
                boxShadow: "0 10px 30px rgba(0,0,0,0.10)",
              }}
            />
            <div className="relative z-[2] flex flex-wrap gap-2">
              {TAGS.map((t) => (
                <Pill
                  key={t}
                  id={t}
                  active={t === tag}
                  label={t === "Все" ? "ВСЕ" : t.toUpperCase()}
                  onClick={() => setTag(t)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="relative inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-4 py-2 text-[12px] tracking-[0.18em] text-black/60">
          <Sparkles className="h-4 w-4 text-black/45" />
          АКТУАЛЬНЫЕ ПРЕДЛОЖЕНИЯ
        </div>
      </div>

      {/* grid */}
      <div className="mt-6 grid gap-4 md:grid-cols-2 md:gap-6">
        {items.map((it) => (
          <SaleCard key={it.id} item={it} />
        ))}
      </div>

      {/* CTA */}
      <div
        ref={ctaRef}
        data-reveal
        className="mt-10 relative overflow-hidden rounded-3xl border border-black/10 bg-white p-6 md:p-10"
      >
        <div className="pointer-events-none absolute inset-0">
          <div
            className="absolute -left-20 -top-24 h-72 w-72 rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle at 35% 35%, rgba(214,190,160,0.24), transparent 60%)",
            }}
          />
          <div
            className="absolute -right-20 -bottom-24 h-72 w-72 rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, rgba(0,0,0,0.08), transparent 60%)",
            }}
          />
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(1000px 520px at 50% -20%, rgba(0,0,0,0.06), transparent 62%)",
            }}
          />
          <div
            className="absolute inset-x-10 top-8 h-px opacity-70"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(0,0,0,0.12), transparent)",
            }}
          />
        </div>

        <div className="relative grid gap-6 md:grid-cols-12 md:items-center">
          <div className="md:col-span-7">
            <div className="text-[12px] tracking-[0.18em] text-black/50">
              НУЖНА КОНСУЛЬТАЦИЯ?
            </div>
            <div className="mt-2 text-[18px] font-semibold tracking-[-0.02em] md:text-[28px]">
              Подберём коллекцию и комплектацию
            </div>
            <p className="mt-3 text-[14px] leading-7 text-black/70">
              Напишите нам или перейдите в каталог — покажем актуальные
              предложения и соберём решение под ваш интерьер.
            </p>
          </div>

          <div className="md:col-span-5 flex gap-3 md:justify-end">
            <Link
              href="/catalog"
              data-cta
              className={cn(
                "group relative inline-flex cursor-pointer items-center justify-center rounded-full bg-black px-5 py-3",
                "text-[12px] font-medium tracking-[0.18em] text-white transition hover:opacity-95 active:scale-[0.99]",
                "overflow-hidden",
              )}
            >
              <span
                data-sheen
                aria-hidden
                className="pointer-events-none absolute -left-24 top-0 h-full w-24 opacity-0"
                style={{
                  background:
                    "linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)",
                  transform: "skewX(-18deg)",
                }}
              />
              В КАТАЛОГ <ArrowRight className="ml-2 h-4 w-4" />
            </Link>

            <Link
              href="/contacts"
              className="inline-flex cursor-pointer items-center justify-center rounded-full border border-black/15 bg-white px-5 py-3 text-[12px] font-medium tracking-[0.18em] text-black/80 transition hover:border-black/25 hover:text-black"
            >
              КОНТАКТЫ
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
