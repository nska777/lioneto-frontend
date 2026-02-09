"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Check, Sparkles } from "lucide-react";

// ✅ ВАЖНО: поправь путь под твой реальный файл со слайдером
// (это тот GSAPHeroSlider, который ты прислал)
import GSAPHeroSlider from "@/app/components/home/GSAPHeroSlider";

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

const VALUES = [
  "Премиальные материалы",
  "Чёткая геометрия",
  "Стабильная сборка",
  "Продуманный сервис",
  "Интерьерный подход",
];

// ✅ слайды для About (твои фото уже лежат в public/about/)
const ABOUT_SLIDES = [
  {
    id: "s1",
    title: "СПАЛЬНЯ SALVADOR",
    ctaLabel: "В КАТАЛОГ",
    href: "/catalog?collections=salvador",
    image: "/hero/1.jpg",
  },
  {
    id: "s2",
    title: "СПАЛЬНЯ AMBER",
    ctaLabel: "В КАТАЛОГ",
    href: "/catalog?collections=amber",
    image: "/hero/2.jpg",
  },
  {
    id: "s3",
    title: "СПАЛЬНЯ SCANDY",
    ctaLabel: "В КАТАЛОГ",
    href: "/catalog?collections=scandi",
    image: "/hero/3.jpg",
  },
  {
    id: "s4",
    title: "СПАЛЬНЯ BUONGIORNO",
    ctaLabel: "В КАТАЛОГ",
    href: "/catalog?collections=buongiorno",
    image: "/hero/4.jpg",
  },
  {
    id: "s5",
    title: "ГОСТИННАЯ BUONGIORNO",
    ctaLabel: "В КАТАЛОГ",
    href: "/catalog?collections=buongiorno",
    image: "/hero/5.jpg",
  },
  {
    id: "s6",
    title: "МОЛОДЁЖНАЯ ELIZABETH",
    ctaLabel: "В КАТАЛОГ",
    href: "/catalog?collections=elizabeth",
    image: "/hero/6.jpg",
  },
  {
    id: "s7",
    title: "ГОСТИНАЯ SALVADOR",
    ctaLabel: "В КАТАЛОГ",
    href: "/catalog?collections=salvador",
    image: "/hero/8.jpg",
  },
  {
    id: "s8",
    title: "ГОСТИНАЯ PITTI",
    ctaLabel: "В КАТАЛОГ",
    href: "/catalog?collections=pitti",
    image: "/hero/9.jpg",
  },
  {
    id: "s9",
    title: "ГОСТИНАЯ SKANDY",
    ctaLabel: "В КАТАЛОГ",
    href: "/catalog?collections=scandi",
    image: "/hero/10.jpg",
  },
  {
    id: "s10",
    title: "МОЛОДЁЖНАЯ SKANDY",
    ctaLabel: "В КАТАЛОГ",
    href: "/catalog?collections=scandi",
    image: "/hero/11.jpg",
  },
];

function ImgPremium({
  src,
  alt,
  heightClass = "h-[340px] md:h-[420px] lg:h-[480px]",
}: {
  src: string;
  alt: string;
  heightClass?: string;
}) {
  return (
    <div
      data-reveal
      className={cn(
        "relative overflow-hidden rounded-[28px]",
        "shadow-[0_22px_70px_rgba(0,0,0,0.10)]",
        "ring-1 ring-black/[0.05]",
        "transition-transform duration-500 hover:translate-y-[-2px]",
      )}
    >
      <div className={cn("relative w-full", heightClass)}>
        {/* ✅ фон-заполнитель: cover + blur */}
        <Image
          src={src}
          alt=""
          fill
          aria-hidden
          className="object-cover scale-[1.08] blur-[18px] opacity-60"
          sizes="(max-width: 1280px) 100vw, 900px"
          priority={false}
        />
        <div className="absolute inset-0 bg-white/20" />

        {/* ✅ основной слой: cover (без белых краёв) */}
        <Image
          src={src}
          alt={alt}
          fill
          className="object-cover"
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 60vw, 900px"
          priority={false}
        />

        {/* ✅ лёгкая виньетка */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(900px_320px_at_50%_0%,rgba(0,0,0,0.05),transparent_60%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.18),transparent_45%)]" />
        </div>
      </div>
    </div>
  );
}

export default function AboutClient() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    gsap.registerPlugin(ScrollTrigger);

    const root = rootRef.current;
    if (!root) return;

    const prefersReduced = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    )?.matches;

    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      // ===== базовый reveal =====
      const blocks = root.querySelectorAll<HTMLElement>("[data-reveal]");

      blocks.forEach((el) => {
        const kids = el.querySelectorAll<HTMLElement>("[data-reveal-item]");

        if (kids.length) {
          gsap.set(kids, { autoAlpha: 0, y: 18, scale: 0.992 });
          gsap.to(kids, {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 0.9,
            ease: "power3.out",
            stagger: 0.08,
            scrollTrigger: {
              trigger: el,
              start: "top 86%",
              once: true,
            },
          });
        } else {
          gsap.fromTo(
            el,
            { autoAlpha: 0, y: 16, scale: 0.995 },
            {
              autoAlpha: 1,
              y: 0,
              scale: 1,
              duration: 0.85,
              ease: "power3.out",
              scrollTrigger: {
                trigger: el,
                start: "top 88%",
                once: true,
              },
            },
          );
        }
      });

      // ===== chips: появление по одному “вырисовывается” =====
      const chipsWrap = root.querySelector<HTMLElement>("[data-chips-wrap]");
      const chips = root.querySelectorAll<HTMLElement>("[data-chip]");

      if (chips.length) {
        gsap.set(chips, {
          autoAlpha: 0,
          y: 10,
          scale: 0.985,
          filter: "blur(8px)",
        });

        gsap.to(chips, {
          autoAlpha: 1,
          y: 0,
          scale: 1,
          filter: "blur(0px)",
          duration: 0.7,
          ease: "power3.out",
          stagger: 0.12,
          scrollTrigger: {
            trigger: chipsWrap || chips[0],
            start: "top 86%",
            once: true,
          },
        });
      }
    }, root);

    return () => ctx.revert();
  }, []);

  return (
    <main
      ref={rootRef}
      className="mx-auto w-full max-w-[1280px] px-4 pb-16 md:pb-24"
    >
      {/* breadcrumbs */}
      <nav className="pt-6 text-[12px] tracking-[0.18em] text-black/50">
        <Link className="hover:text-black/80" href="/">
          ГЛАВНАЯ
        </Link>
        <span className="px-2">/</span>
        <span className="text-black/80">О КОМПАНИИ</span>
      </nav>

      {/* ✅ СЛАЙДЕР (как на главной) */}
      <section className="mt-6">
        <GSAPHeroSlider slides={ABOUT_SLIDES} autoMs={6500} />
      </section>

      {/* главный белый блок */}
      <section className="relative mt-10 overflow-hidden rounded-[34px] bg-white">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-48 -top-48 h-[620px] w-[620px] rounded-full bg-black/[0.03]" />
          <div className="absolute -right-44 -bottom-44 h-[620px] w-[620px] rounded-full bg-black/[0.025]" />
          <div className="absolute inset-0 bg-[radial-gradient(1200px_420px_at_50%_-10%,rgba(0,0,0,0.04),transparent_60%)]" />
        </div>

        <div className="relative rounded-[34px] ring-1 ring-black/[0.04]">
          {/* intro */}
          <div
            data-reveal
            className="px-6 pb-8 pt-10 md:px-12 md:pb-12 md:pt-14"
          >
            <div className="mx-auto max-w-[980px] text-center">
              <div
                data-reveal-item
                className="text-[12px] tracking-[0.22em] text-black/45"
              >
                LIONETO • PREMIUM FURNITURE
              </div>

              <h1
                data-reveal-item
                className="mt-4 text-balance text-[32px] font-semibold leading-[1.06] tracking-[-0.02em] md:text-[54px]"
              >
                Спокойная премиальность
                <span className="block">в каждой детали</span>
              </h1>

              <p
                data-reveal-item
                className="mx-auto mt-4 max-w-[820px] text-pretty text-[14px] leading-7 text-black/65 md:text-[16px]"
              >
                Lioneto — мебель из массива для гостиных, спален, прихожих и
                современных интерьеров, созданная на стыке дизайна и ремесла. Мы
                делаем то, что выглядит благородно сегодня и остаётся актуальным
                через годы.
              </p>
            </div>
          </div>

          {/* row 1 */}
          <div className="grid gap-10 px-6 pb-10 md:grid-cols-12 md:gap-12 md:px-12 md:pb-12">
            <div data-reveal className="md:col-span-4">
              <h2
                data-reveal-item
                className="text-[22px] font-semibold tracking-[-0.01em] md:text-[26px]"
              >
                Интерьеры, собранные в единую систему
              </h2>

              <p
                data-reveal-item
                className="mt-4 text-[14px] leading-7 text-black/65 md:text-[15px]"
              >
                Коллекции Lioneto проектируются как цельные интерьерные решения:
                мебель легко сочетается по пропорциям, материалам и тону —
                поэтому пространство выглядит “дорого” без лишних акцентов.
              </p>

              <p
                data-reveal-item
                className="mt-4 text-[14px] leading-7 text-black/65 md:text-[15px]"
              >
                Мы выстраиваем не просто линейку изделий, а архитектуру
                интерьера: от крупных форм до деталей, которые отвечают за
                ощущение качества.
              </p>

              <div data-reveal-item className="mt-5 space-y-3">
                {[
                  "Целостная архитектура интерьера",
                  "Продуманная геометрия и зазоры",
                  "Комфорт в ежедневном использовании",
                ].map((t) => (
                  <div key={t} className="flex items-start gap-3">
                    <div className="mt-0.5 grid h-7 w-7 place-items-center rounded-full bg-black/[0.03] ring-1 ring-black/[0.06] text-black/55">
                      <Sparkles className="h-4 w-4" />
                    </div>
                    <div className="text-[13px] leading-6 text-black/65">
                      {t}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="md:col-span-8">
              <ImgPremium src="/about/showroom-01.jpg" alt="Lioneto showroom" />
            </div>
          </div>

          <div className="mx-6 h-px bg-black/10 md:mx-12" />

          {/* row 2 */}
          <div className="grid gap-10 px-6 py-10 md:grid-cols-12 md:gap-12 md:px-12 md:py-12">
            <div className="md:col-span-8">
              <ImgPremium
                src="/about/showroom-02.jpg"
                alt="Lioneto quality and control"
              />
            </div>

            <div data-reveal className="md:col-span-4">
              <h2
                data-reveal-item
                className="text-[22px] font-semibold tracking-[-0.01em] md:text-[26px]"
              >
                Натуральные материалы и контроль на каждом этапе
              </h2>

              <p
                data-reveal-item
                className="mt-4 text-[14px] leading-7 text-black/65 md:text-[15px]"
              >
                В производстве используется массив ценных пород дерева,
                качественная фурнитура и проверенные технологии обработки. Мы
                следим за стабильностью формы, аккуратностью кромок и чистотой
                сборки — именно это создаёт ощущение премиальности.
              </p>

              <p
                data-reveal-item
                className="mt-4 text-[14px] leading-7 text-black/65 md:text-[15px]"
              >
                Каждое изделие проходит внутреннюю проверку перед тем, как стать
                частью вашего интерьера. Мы не делаем “эффект ради эффекта” — мы
                делаем результат, который не разочарует вживую.
              </p>
            </div>
          </div>

          {/* chips */}
          <div data-reveal className="px-6 pb-12 md:px-12">
            <div
              data-reveal-item
              className={cn(
                "rounded-[24px] bg-white",
                "shadow-[0_18px_55px_rgba(0,0,0,0.06)]",
                "ring-1 ring-black/[0.05]",
                "px-4 py-4 md:px-6 md:py-5",
              )}
            >
              <div
                data-chips-wrap
                className="grid gap-2 md:grid-cols-5 md:gap-3"
              >
                {VALUES.map((t) => (
                  <div
                    key={t}
                    data-chip
                    className={cn(
                      "flex items-center gap-3 rounded-2xl bg-white px-4 py-3",
                      "ring-1 ring-black/[0.06] transition",
                      "hover:ring-black/[0.10] hover:shadow-[0_12px_30px_rgba(0,0,0,0.06)]",
                    )}
                  >
                    <div className="grid h-8 w-8 place-items-center rounded-full bg-black/[0.03] text-black/60 ring-1 ring-black/[0.06]">
                      <Check className="h-4 w-4" />
                    </div>
                    <div className="text-[12px] font-medium text-black/70">
                      {t}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div
              data-reveal-item
              className="mt-7 text-center text-[14px] tracking-[-0.01em] text-black/60 md:text-[15px]"
            >
              Lioneto — мебель, которая остаётся актуальной годами.
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
