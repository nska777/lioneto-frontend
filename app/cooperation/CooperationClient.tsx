"use client";

import React, { useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  Building2,
  BriefcaseBusiness,
  Handshake,
  Palette,
  Send,
  Check,
  Sparkles,
  Clock,
  ShieldCheck,
  Truck,
  ArrowRight,
} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

type Track = "designer" | "dealer" | "developer" | "b2b";

type TrackCard = {
  id: Track;
  label: string;
  title: string;
  desc: string;
  bullets: string[];
  icon: React.ReactNode;
};

const TRACKS: TrackCard[] = [
  {
    id: "designer",
    label: "ДЛЯ ДИЗАЙНЕРОВ",
    title: "Партнёрская программа",
    desc: "Комплектация проектов, быстрые расчёты, аккуратная коммуникация и поддержка.",
    bullets: [
      "Персональный менеджер",
      "Подбор решений под интерьер",
      "КП и спецификация за 1–2 дня",
      "Приоритетная логистика",
    ],
    icon: <Palette className="h-5 w-5 text-black/70" />,
  },
  {
    id: "dealer",
    label: "ДЛЯ ДИЛЕРОВ",
    title: "Дистрибуция и поставки",
    desc: "Регулярные поставки, стандарты экспозиции, материалы для продаж и обучение.",
    bullets: [
      "Оптовые условия и матрица",
      "Рекомендации по экспозиции",
      "Маркетинг-материалы",
      "Обучение команды",
    ],
    icon: <Handshake className="h-5 w-5 text-black/70" />,
  },
  {
    id: "developer",
    label: "ДЛЯ ЗАСТРОЙЩИКОВ",
    title: "Комплектация объектов",
    desc: "Квартиры, апарт-отели, шоурумы: типовые пакеты и индивидуальная доработка.",
    bullets: [
      "Смета и спецификация",
      "План-график поставок",
      "Единый стиль по объекту",
      "Сервис и гарантия",
    ],
    icon: <Building2 className="h-5 w-5 text-black/70" />,
  },
  {
    id: "b2b",
    label: "B2B / HORECA",
    title: "Корпоративные заказы",
    desc: "Отели, рестораны, офисы: устойчивые материалы и понятные условия сотрудничества.",
    bullets: [
      "Оптовые условия",
      "Материалы под нагрузку",
      "Сопровождение проекта",
      "Контроль качества",
    ],
    icon: <BriefcaseBusiness className="h-5 w-5 text-black/70" />,
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
  id: Track;
}) {
  return (
    <button
      type="button"
      data-pill
      data-pill-id={id}
      onClick={onClick}
      className={cn(
        "relative cursor-pointer select-none rounded-full border px-4 py-2 text-[12px] font-medium tracking-[0.16em] transition",
        "outline-none focus-visible:ring-2 focus-visible:ring-black/10 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        active
          ? "border-black/15 bg-black text-white"
          : "border-black/10 bg-white text-black/70 hover:border-black/18 hover:text-black",
      )}
    >
      <span className="relative z-[2]">{label}</span>

      {/* мягкий премиум-глянец */}
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

function StatCard({
  title,
  desc,
  icon,
}: {
  title: string;
  desc: string;
  icon: React.ReactNode;
}) {
  return (
    <div
      data-reveal
      data-card
      className={cn(
        "rounded-3xl border border-black/10 bg-white p-6",
        "transition hover:border-black/18",
        "relative overflow-hidden",
      )}
    >
      {/* акцент-пятно */}
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 -top-16 h-44 w-44 rounded-full opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(214,190,160,0.35), transparent 60%)",
        }}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[12px] tracking-[0.18em] text-black/45">
            {title.toUpperCase()}
          </div>
          <div className="mt-2 text-[14px] leading-6 text-black/70">{desc}</div>
        </div>
        <div className="h-11 w-11 rounded-2xl border border-black/10 bg-black/[0.03] flex items-center justify-center">
          {icon}
        </div>
      </div>
    </div>
  );
}

function TrackCardUI({
  t,
  active,
  onClick,
}: {
  t: TrackCard;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-reveal
      data-track-card
      data-active={active ? "1" : "0"}
      className={cn(
        "group cursor-pointer text-left rounded-3xl border p-6 transition relative overflow-hidden",
        "outline-none focus-visible:ring-2 focus-visible:ring-black/10 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        active
          ? "border-black/20 bg-black/[0.02]"
          : "border-black/10 bg-white hover:border-black/18",
      )}
    >
      {/* премиум glow + легкая текстура */}
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300",
          active ? "opacity-100" : "group-hover:opacity-100",
        )}
        style={{
          background:
            "radial-gradient(600px 220px at 20% 10%, rgba(214,190,160,0.22), transparent 60%), radial-gradient(520px 220px at 90% 60%, rgba(0,0,0,0.06), transparent 60%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(0,0,0,0.08), transparent 60%)",
        }}
      />

      <div className="relative flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-[12px] tracking-[0.18em] text-black/45">
            {t.label}
          </div>
          <div className="mt-2 text-[16px] font-semibold tracking-[-0.01em] text-black/85 md:text-[18px]">
            {t.title}
          </div>
          <p className="mt-2 text-[14px] leading-7 text-black/70">{t.desc}</p>
        </div>

        <div
          data-track-icon
          className={cn(
            "h-11 w-11 rounded-2xl border flex items-center justify-center shrink-0 transition",
            active
              ? "border-black/18 bg-white"
              : "border-black/10 bg-black/[0.02] group-hover:bg-white",
          )}
        >
          {t.icon}
        </div>
      </div>

      {/* bullets — только у активного */}
      {active && (
        <div data-detail className="relative mt-5 grid gap-2">
          {t.bullets.map((b) => (
            <div
              key={b}
              className={cn(
                "rounded-2xl border border-black/10 bg-white px-4 py-3 text-[13px] text-black/70 flex items-start gap-2",
                "transition hover:border-black/18",
              )}
            >
              <Check className="mt-0.5 h-4 w-4 text-black/50" />
              <span className="leading-6">{b}</span>
            </div>
          ))}
        </div>
      )}

      {/* тонкая нижняя линия */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-6 bottom-0 h-px opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background:
            "linear-gradient(90deg, transparent, rgba(0,0,0,0.14), transparent)",
        }}
      />
    </button>
  );
}

function StepCard({
  n,
  title,
  desc,
}: {
  n: string;
  title: string;
  desc: string;
}) {
  return (
    <div
      data-reveal
      data-step
      className={cn(
        "rounded-3xl border border-black/10 bg-white p-6",
        "transition hover:border-black/18",
        "relative overflow-hidden",
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -left-10 -bottom-10 h-44 w-44 rounded-full opacity-70 blur-3xl"
        style={{
          background:
            "radial-gradient(circle at 30% 30%, rgba(214,190,160,0.22), transparent 60%)",
        }}
      />
      <div className="relative flex items-start justify-between gap-4">
        <div
          data-step-badge
          className="rounded-2xl border border-black/10 bg-black/[0.03] px-3 py-2 text-[12px] font-medium text-black/70"
        >
          {n}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-semibold tracking-[-0.01em] text-black/85">
            {title}
          </div>
          <p className="mt-2 text-[14px] leading-7 text-black/70">{desc}</p>
        </div>
      </div>
    </div>
  );
}

export default function CooperationClient() {
  const rootRef = useRef<HTMLDivElement | null>(null);
  const pillsRef = useRef<HTMLDivElement | null>(null);

  const heroOrbsRef = useRef<HTMLDivElement | null>(null);
  const heroOrbARef = useRef<HTMLDivElement | null>(null);
  const heroOrbBRef = useRef<HTMLDivElement | null>(null);

  const [active, setActive] = useState<Track>("designer");

  const activeTrack = useMemo(
    () => TRACKS.find((t) => t.id === active) ?? TRACKS[0],
    [active],
  );

  useLayoutEffect(() => {
    const reduce =
      typeof window !== "undefined" &&
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (reduce) return;

      // 1) reveal blocks: аккуратно (без жесткого blur)
      gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((el) => {
        const isHero = el.dataset.hero === "1";

        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 18, scale: 0.985 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: isHero ? 0.9 : 0.75,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              once: true,
            },
          },
        );
      });

      // 2) hover lift for cards
      gsap.utils
        .toArray<HTMLElement>("[data-card], [data-step]")
        .forEach((el) => {
          const onEnter = () =>
            gsap.to(el, { y: -4, duration: 0.35, ease: "power3.out" });
          const onLeave = () =>
            gsap.to(el, { y: 0, duration: 0.45, ease: "power3.out" });

          el.addEventListener("mouseenter", onEnter);
          el.addEventListener("mouseleave", onLeave);

          // cleanup
          (el as any).__cleanup = () => {
            el.removeEventListener("mouseenter", onEnter);
            el.removeEventListener("mouseleave", onLeave);
          };
        });

      // 3) Track cards: легкая “подпружинка” иконки
      gsap.utils.toArray<HTMLElement>("[data-track-card]").forEach((card) => {
        const icon = card.querySelector<HTMLElement>("[data-track-icon]");
        if (!icon) return;

        const onEnter = () =>
          gsap.to(icon, {
            rotate: 4,
            y: -2,
            duration: 0.35,
            ease: "power3.out",
          });
        const onLeave = () =>
          gsap.to(icon, {
            rotate: 0,
            y: 0,
            duration: 0.45,
            ease: "power3.out",
          });

        card.addEventListener("mouseenter", onEnter);
        card.addEventListener("mouseleave", onLeave);

        (card as any).__cleanup = () => {
          card.removeEventListener("mouseenter", onEnter);
          card.removeEventListener("mouseleave", onLeave);
        };
      });

      // 4) Steps: badge “впечатывается”
      gsap.utils.toArray<HTMLElement>("[data-step-badge]").forEach((badge) => {
        gsap.fromTo(
          badge,
          { scale: 0.92, autoAlpha: 0 },
          {
            scale: 1,
            autoAlpha: 1,
            duration: 0.55,
            ease: "power3.out",
            scrollTrigger: {
              trigger: badge,
              start: "top 92%",
              once: true,
            },
          },
        );
      });

      // 5) Hero: мягкое “дыхание” орбов + параллакс мышью
      if (heroOrbARef.current && heroOrbBRef.current) {
        gsap.to(heroOrbARef.current, {
          x: 18,
          y: -10,
          duration: 6.5,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
        gsap.to(heroOrbBRef.current, {
          x: -14,
          y: 12,
          duration: 7.5,
          ease: "sine.inOut",
          yoyo: true,
          repeat: -1,
        });
      }

      const heroOrbs = heroOrbsRef.current;
      if (heroOrbs) {
        const onMove = (e: MouseEvent) => {
          const rect = heroOrbs.getBoundingClientRect();
          const nx = (e.clientX - (rect.left + rect.width / 2)) / rect.width;
          const ny = (e.clientY - (rect.top + rect.height / 2)) / rect.height;

          gsap.to(heroOrbARef.current, {
            x: nx * 14,
            y: ny * 10,
            duration: 0.6,
            ease: "power3.out",
          });
          gsap.to(heroOrbBRef.current, {
            x: -nx * 12,
            y: -ny * 9,
            duration: 0.6,
            ease: "power3.out",
          });
        };
        heroOrbs.addEventListener("mousemove", onMove);
        (heroOrbs as any).__cleanup = () =>
          heroOrbs.removeEventListener("mousemove", onMove);
      }

      // 6) Active-pill underline (индикатор)
      const pills = pillsRef.current;
      if (pills) {
        const indicator = pills.querySelector<HTMLElement>(
          "[data-pill-indicator]",
        );
        const setIndicator = () => {
          if (!indicator) return;
          const activeBtn = pills.querySelector<HTMLElement>(
            `[data-pill-id="${active}"]`,
          );
          if (!activeBtn) return;

          const a = activeBtn.getBoundingClientRect();
          const p = pills.getBoundingClientRect();
          const x = a.left - p.left;
          const w = a.width;

          gsap.to(indicator, {
            x,
            width: w,
            duration: 0.45,
            ease: "power3.out",
          });
        };

        // initial + on resize
        setIndicator();
        const onResize = () => setIndicator();
        window.addEventListener("resize", onResize);

        (pills as any).__cleanup = () =>
          window.removeEventListener("resize", onResize);
      }

      // 7) detail animation when active changes (bullets)
      gsap.fromTo(
        "[data-detail]",
        { autoAlpha: 0, y: 10, scale: 0.99 },
        {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          duration: 0.55,
          ease: "power3.out",
        },
      );
    }, rootRef);

    return () => {
      // custom cleanup listeners
      if (rootRef.current) {
        rootRef.current
          .querySelectorAll<HTMLElement>(
            "[data-card], [data-step], [data-track-card]",
          )
          .forEach((el) => {
            const fn = (el as any).__cleanup;
            if (typeof fn === "function") fn();
          });
      }
      if (heroOrbsRef.current) {
        const fn = (heroOrbsRef.current as any).__cleanup;
        if (typeof fn === "function") fn();
      }
      if (pillsRef.current) {
        const fn = (pillsRef.current as any).__cleanup;
        if (typeof fn === "function") fn();
      }

      ctx.revert();
    };
  }, [active]);

  return (
    <div ref={rootRef} className="space-y-10 md:space-y-14">
      {/* HERO / offer */}
      <section
        data-reveal
        data-hero="1"
        ref={heroOrbsRef}
        className="relative overflow-hidden rounded-3xl border border-black/10 bg-white p-6 md:p-10"
      >
        {/* фон: живее + аккуратнее */}
        <div className="pointer-events-none absolute inset-0">
          <div
            ref={heroOrbARef}
            className="absolute -left-24 -top-24 h-80 w-80 rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle at 35% 35%, rgba(214,190,160,0.35), transparent 60%)",
            }}
          />
          <div
            ref={heroOrbBRef}
            className="absolute -right-24 -bottom-24 h-80 w-80 rounded-full blur-3xl"
            style={{
              background:
                "radial-gradient(circle at 30% 30%, rgba(0,0,0,0.09), transparent 60%)",
            }}
          />

          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(1000px 520px at 50% -20%, rgba(0,0,0,0.07), transparent 62%)",
            }}
          />

          {/* тонкая “нить” сверху */}
          <div
            className="absolute inset-x-10 top-8 h-px opacity-70"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(0,0,0,0.12), transparent)",
            }}
          />
        </div>

        <div className="relative grid gap-8 md:grid-cols-12 md:items-center">
          <div className="md:col-span-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[11px] tracking-[0.22em] text-black/70">
              <Sparkles className="h-3.5 w-3.5 text-black/45" />
              LIONETO • PARTNERSHIP
            </div>

            <h2 className="mt-4 text-balance text-[20px] font-semibold tracking-[-0.02em] md:text-[34px]">
              Партнёрство, которое ощущается спокойно и выгодно
            </h2>

            <p className="mt-3 max-w-3xl text-[14px] leading-7 text-black/70 md:text-[16px]">
              Мы берём на себя расчёты, спецификации и сопровождение — чтобы вы
              сосредоточились на проекте и клиенте. Всё прозрачно, быстро и без
              лишней суеты.
            </p>

            <div className="mt-5">
              <div
                ref={pillsRef}
                className="relative inline-flex flex-wrap gap-2 rounded-full border border-black/10 bg-white/70 p-2"
              >
                {/* индикатор активной вкладки */}
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
                  <Pill
                    id="designer"
                    active={active === "designer"}
                    label="ДИЗАЙНЕРАМ"
                    onClick={() => setActive("designer")}
                  />
                  <Pill
                    id="dealer"
                    active={active === "dealer"}
                    label="ДИЛЕРАМ"
                    onClick={() => setActive("dealer")}
                  />
                  <Pill
                    id="developer"
                    active={active === "developer"}
                    label="ЗАСТРОЙЩИКАМ"
                    onClick={() => setActive("developer")}
                  />
                  <Pill
                    id="b2b"
                    active={active === "b2b"}
                    label="B2B / HORECA"
                    onClick={() => setActive("b2b")}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-4">
            <div className="rounded-3xl border border-black/10 bg-white p-6 relative overflow-hidden">
              <div
                aria-hidden
                className="pointer-events-none absolute -right-20 -top-20 h-56 w-56 rounded-full blur-3xl"
                style={{
                  background:
                    "radial-gradient(circle at 30% 30%, rgba(214,190,160,0.22), transparent 60%)",
                }}
              />

              <div className="relative">
                <div className="text-[12px] tracking-[0.18em] text-black/45">
                  ОТВЕТ И КП
                </div>
                <div className="mt-2 text-[18px] font-semibold text-black/85">
                  1–2 рабочих дня
                </div>
                <p className="mt-2 text-[13px] leading-6 text-black/65">
                  Консультация, спецификация и первичное коммерческое
                  предложение по вашему запросу.
                </p>

                <div className="mt-4 grid gap-2">
                  <div className="rounded-2xl border border-black/10 bg-black/[0.02] px-4 py-3 text-[13px] text-black/70 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-black/45" />
                    Быстрая коммуникация
                  </div>
                  <div className="rounded-2xl border border-black/10 bg-black/[0.02] px-4 py-3 text-[13px] text-black/70 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 text-black/45" />
                    Контроль качества
                  </div>
                  <div className="rounded-2xl border border-black/10 bg-black/[0.02] px-4 py-3 text-[13px] text-black/70 flex items-center gap-2">
                    <Truck className="h-4 w-4 text-black/45" />
                    Логистика и сопровождение
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-2 text-[12px] tracking-[0.16em] text-black/55">
                  <span className="h-1.5 w-1.5 rounded-full bg-black/25" />
                  <span>Понятные условия</span>
                  <span className="h-1.5 w-1.5 rounded-full bg-black/25" />
                  <span>Без перегруза</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tracks — карточки направлений */}
      <section>
        <div data-reveal className="flex items-end justify-between gap-6">
          <div>
            <div className="text-[12px] tracking-[0.18em] text-black/45">
              ФОРМАТЫ СОТРУДНИЧЕСТВА
            </div>
            <h3 className="mt-2 text-[18px] font-semibold tracking-[-0.01em] md:text-[26px]">
              Выберите направление — увидите выгоды
            </h3>
            <p className="mt-2 max-w-3xl text-[14px] leading-7 text-black/70">
              Мы показываем только главное — условия, поддержка, скорость и
              качество.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 md:gap-6">
          {TRACKS.map((t) => (
            <TrackCardUI
              key={t.id}
              t={t}
              active={t.id === active}
              onClick={() => setActive(t.id)}
            />
          ))}
        </div>
      </section>

      {/* Benefits — что получает партнер */}
      <section>
        <div data-reveal className="flex items-end justify-between gap-6">
          <div>
            <div className="text-[12px] tracking-[0.18em] text-black/45">
              ЧТО ВЫ ПОЛУЧАЕТЕ
            </div>
            <h3 className="mt-2 text-[18px] font-semibold tracking-[-0.01em] md:text-[26px]">
              Понятные выгоды и аккуратный процесс
            </h3>
            <p className="mt-2 max-w-3xl text-[14px] leading-7 text-black/70">
              Быстро, прозрачно и предсказуемо — без лишних шагов.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3 md:gap-6">
          <StatCard
            title="Скорость"
            desc="Ответ и первичное КП за 1–2 дня. Без лишних согласований."
            icon={<Clock className="h-5 w-5 text-black/60" />}
          />
          <StatCard
            title="Качество"
            desc="Материалы, сборка и упаковка проходят контроль перед отгрузкой."
            icon={<ShieldCheck className="h-5 w-5 text-black/60" />}
          />
          <StatCard
            title="Логистика"
            desc="Сопровождение поставки и понятные сроки. Бережная доставка."
            icon={<Truck className="h-5 w-5 text-black/60" />}
          />
        </div>
      </section>

      {/* Steps — процесс */}
      <section>
        <div data-reveal className="flex items-end justify-between gap-6">
          <div>
            <div className="text-[12px] tracking-[0.18em] text-black/45">
              КАК МЫ РАБОТАЕМ
            </div>
            <h3 className="mt-2 text-[18px] font-semibold tracking-[-0.01em] md:text-[26px]">
              4 шага до результата
            </h3>
            <p className="mt-2 max-w-3xl text-[14px] leading-7 text-black/70">
              У вас — проект. У нас — спецификация, расчёт и сопровождение.
            </p>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 md:gap-6">
          <StepCard
            n="01"
            title="Заявка"
            desc="Вы описываете задачу: объект, сроки, пожелания, контакт для связи."
          />
          <StepCard
            n="02"
            title="Подбор и расчёт"
            desc="Формируем решения под стиль и бюджет, готовим спецификацию и КП."
          />
          <StepCard
            n="03"
            title="Согласование"
            desc="Уточняем детали, фиксируем условия и сроки. Никаких сюрпризов."
          />
          <StepCard
            n="04"
            title="Поставка и поддержка"
            desc="Контроль качества, упаковка, доставка. Мы остаёмся на связи после отгрузки."
          />
        </div>
      </section>

      {/* Form — премиальный CTA */}
      <section
        data-reveal
        className="rounded-3xl border border-black/10 bg-white p-6 md:p-10 relative overflow-hidden"
      >
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 opacity-80"
          style={{
            background:
              "radial-gradient(760px 340px at 10% 0%, rgba(214,190,160,0.18), transparent 60%), radial-gradient(740px 340px at 100% 80%, rgba(0,0,0,0.06), transparent 60%)",
          }}
        />
        <div className="relative grid gap-8 md:grid-cols-12 md:items-start">
          <div className="md:col-span-6">
            <div className="text-[12px] tracking-[0.18em] text-black/45">
              ЗАЯВКА НА СОТРУДНИЧЕСТВО
            </div>
            <h3 className="mt-3 text-[18px] font-semibold tracking-[-0.01em] md:text-[26px]">
              Расскажите о задаче — мы предложим решение
            </h3>
            <p className="mt-3 text-[14px] leading-7 text-black/70">
              Выбранный формат:{" "}
              <span className="font-medium text-black/80">
                {activeTrack.title}
              </span>
              .
            </p>

            <div className="mt-6 rounded-3xl border border-black/10 bg-black/[0.02] p-5 text-[13px] leading-6 text-black/65">
              <div className="font-medium text-black/80">Включено:</div>
              <div className="mt-2 grid gap-2">
                <div className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-black/50" />
                  <span>Консультация и подбор решений</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-black/50" />
                  <span>Спецификация и коммерческое предложение</span>
                </div>
                <div className="flex items-start gap-2">
                  <Check className="mt-0.5 h-4 w-4 text-black/50" />
                  <span>Сопровождение поставки и поддержка</span>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 text-[12px] tracking-[0.16em] text-black/55">
                <ArrowRight className="h-4 w-4 text-black/40" />
                <span>Ответим и соберём КП за 1–2 дня</span>
              </div>
            </div>
          </div>

          <div className="md:col-span-6">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                alert("Заявка отправлена (пока мок). Далее подключим API.");
              }}
              className="grid gap-3"
            >
              <input
                required
                placeholder="Имя"
                className={cn(
                  "w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-[14px] text-black/80 outline-none transition",
                  "focus:border-black/25 focus:shadow-[0_0_0_4px_rgba(214,190,160,0.18)]",
                )}
              />
              <input
                required
                placeholder="Компания / студия"
                className={cn(
                  "w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-[14px] text-black/80 outline-none transition",
                  "focus:border-black/25 focus:shadow-[0_0_0_4px_rgba(214,190,160,0.18)]",
                )}
              />
              <input
                required
                placeholder="Телефон"
                className={cn(
                  "w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-[14px] text-black/80 outline-none transition",
                  "focus:border-black/25 focus:shadow-[0_0_0_4px_rgba(214,190,160,0.18)]",
                )}
              />
              <input
                required
                type="email"
                placeholder="Email"
                className={cn(
                  "w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-[14px] text-black/80 outline-none transition",
                  "focus:border-black/25 focus:shadow-[0_0_0_4px_rgba(214,190,160,0.18)]",
                )}
              />
              <textarea
                rows={4}
                placeholder="Коротко опишите задачу (объект, сроки, бюджет, пожелания)"
                className={cn(
                  "w-full resize-none rounded-2xl border border-black/10 bg-white px-4 py-3 text-[14px] text-black/80 outline-none transition",
                  "focus:border-black/25 focus:shadow-[0_0_0_4px_rgba(214,190,160,0.18)]",
                )}
              />

              <input type="hidden" value={active} name="track" />

              <button
                type="submit"
                data-cta
                className={cn(
                  "mt-2 relative inline-flex cursor-pointer items-center justify-center gap-2 rounded-2xl bg-black px-4 py-3",
                  "text-[12px] font-medium tracking-[0.18em] text-white transition",
                  "hover:opacity-95 active:scale-[0.99]",
                  "overflow-hidden",
                )}
              >
                {/* shimmer */}
                <span
                  aria-hidden
                  className="pointer-events-none absolute -left-24 top-0 h-full w-24 opacity-0"
                  style={{
                    background:
                      "linear-gradient(90deg, transparent, rgba(255,255,255,0.22), transparent)",
                    transform: "skewX(-18deg)",
                  }}
                />
                <Send className="h-4 w-4" />
                ОТПРАВИТЬ
              </button>

              <div className="text-[11px] leading-5 text-black/45">
                Нажимая «Отправить», вы соглашаетесь на обработку данных.
              </div>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}
