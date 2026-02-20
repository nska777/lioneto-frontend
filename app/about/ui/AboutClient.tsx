"use client";

import Link from "next/link";
import Image from "next/image";
import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

import GSAPHeroSlider from "@/app/components/home/GSAPHeroSlider";

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

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

const ABOUT_IMAGE_SRC = "";

function GoldLioneto({ className = "" }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-block align-baseline",
        "bg-clip-text text-transparent",
        "bg-[linear-gradient(90deg,#b88a2a_0%,#f2d58a_35%,#b88a2a_70%,#f4e7b6_100%)]",
        className,
      )}
    >
      LIONETO
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute -inset-x-2 -inset-y-1",
          "opacity-40",
          "bg-[radial-gradient(220px_60px_at_20%_40%,rgba(255,255,255,0.75),transparent_60%)]",
          "mix-blend-overlay",
        )}
      />
    </span>
  );
}

function PremiumImageBlock({
  src,
  alt = "Lioneto",
}: {
  src?: string;
  alt?: string;
}) {
  return (
    <div
      data-reveal-image
      className={cn(
        "relative overflow-hidden",
        "rounded-[18px]",
        "bg-white",
        "ring-1 ring-black/[0.08]",
        "shadow-[0_28px_110px_rgba(0,0,0,0.10)]",
      )}
    >
      <div className="relative aspect-[16/9] w-full bg-[#f4f4f4]">
        {src ? (
          <>
            {/* подложка */}
            <Image
              src={src}
              alt=""
              fill
              aria-hidden
              className="object-cover scale-[1.06] blur-[16px] opacity-55"
              sizes="(max-width: 1280px) 100vw, 1280px"
              priority={false}
            />
            <div className="absolute inset-0 bg-white/25" />
            {/* основной слой */}
            <Image
              src={src}
              alt={alt}
              fill
              className="object-cover"
              sizes="(max-width: 1280px) 100vw, 1280px"
              priority={false}
            />
            {/* лёгкая виньетка */}
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 bg-[radial-gradient(900px_340px_at_50%_0%,rgba(0,0,0,0.06),transparent_60%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.16),transparent_55%)]" />
            </div>
          </>
        ) : (
          <div className="grid h-full w-full place-items-center">
            <div className="rounded-[16px] px-6 py-4 text-[20px] font-medium text-black/45 ring-1 ring-black/10">
              картинка
            </div>
          </div>
        )}
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
      const items = root.querySelectorAll<HTMLElement>("[data-reveal]");
      gsap.set(items, { autoAlpha: 0, y: 16, filter: "blur(8px)" as any });

      gsap.to(items, {
        autoAlpha: 1,
        y: 0,
        filter: "blur(0px)" as any,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.08,
        scrollTrigger: { trigger: items[0], start: "top 86%", once: true },
      });

      const img = root.querySelector<HTMLElement>("[data-reveal-image]");
      if (img) {
        gsap.fromTo(
          img,
          { autoAlpha: 0, y: 22, scale: 0.985 },
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 1.0,
            ease: "power3.out",
            scrollTrigger: { trigger: img, start: "top 86%", once: true },
          },
        );
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

      {/* */}
      <section className="mt-6">
        <GSAPHeroSlider slides={ABOUT_SLIDES} autoMs={6500} />
      </section>

      {/* */}
      <section
        className={cn(
          "relative mt-10 overflow-hidden rounded-[20px] bg-white",
          "ring-1 ring-black/[0.06]",
          "shadow-[0_30px_120px_rgba(0,0,0,0.08)]",
        )}
      >
        {/* */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-56 -top-56 h-[720px] w-[720px] rounded-full bg-black/[0.03]" />
          <div className="absolute -right-56 -bottom-56 h-[720px] w-[720px] rounded-full bg-black/[0.025]" />
          <div className="absolute inset-0 bg-[radial-gradient(1200px_520px_at_50%_-10%,rgba(0,0,0,0.05),transparent_60%)]" />
        </div>

        <div className="relative px-6 py-10 md:px-12 md:py-14">
          {/*  */}
          <div className="mx-auto max-w-[980px] text-center">
            <div
              data-reveal
              className="text-[12px] tracking-[0.22em] text-black/45"
            ></div>

            <h1
              data-reveal
              className="mt-4 text-balance text-[26px] leading-[1.08] tracking-[-0.02em] md:text-[46px]"
            >
              <span className="font-medium text-black">
                ТРИ ЗВЕЗДЫ, СТАВШИЕ НОВЫМ СОЗВЕЗДИЕМ —
              </span>{" "}
              <span
                className={cn(
                  "font-semibold",
                  "bg-clip-text text-transparent",
                  "bg-[linear-gradient(90deg,#b88a2a_0%,#f2d58a_35%,#b88a2a_70%,#f4e7b6_100%)]",
                )}
              >
                LIONETO
              </span>
              .
            </h1>

            <div
              data-reveal
              className="mx-auto mt-6 h-px w-[220px] bg-black/10"
            />
          </div>

          {/* text */}
          <div className="mx-auto mt-10 max-w-[980px] space-y-4 text-[14px] leading-7 text-black/65 md:text-[15px]">
            <p data-reveal>
              В 2025 году в мебельной индустрии произошло знаменательное
              событие: три компании с богатой историей и общими ценностями —
              MANNGROUP, MANINIMOBILI (Калининград) и RICH HOUSE (Ташкент) —
              объединили свои усилия, опыт и технологии с целью создания единого
              бренда LIONETO — пространства, где встречаются традиции,
              современные технологии и безграничная любовь к своему делу.
            </p>

            <p data-reveal>
              Это не просто слияние активов, это встреча единомышленников,
              которые верят, что вместе могут создать нечто большее.
            </p>

            <p data-reveal>
              Если ранее каждая компания специализировалась в производстве
              определенного направления в мебели, сегодня в LIONETO создаются
              как серийные коллекции для дома (уютные спальни и гостиные,
              респектабельные кабинеты с библиотеками, функциональные прихожие,
              красивая садовая мебель), так и предлагаются интерьерные решения
              любой сложности «под ключ» (от загородных особняков до отелей).
            </p>

            <p data-reveal>
              Ориентируясь на тренды и сотрудничая с ведущими российскими и
              зарубежными дизайнерами, мы сохраняем свою индивидуальность,
              грамотно расставляя акценты: все, что попадает в поле зрения
              нашего клиента, и к чему прикасается его рука – всегда эстетично и
              практично.
            </p>

            <div data-reveal className="pt-2">
              <div className="font-medium text-black/80">
                Сегодня LIONETO — это:
              </div>
              <ul className="mt-3 space-y-2">
                {[
                  "полный цикл производства (на наиболее сложных производственных участках, подчеркивающих индивидуальность LIONETO, заняты итальянские специалисты по деревообработке и окрашиванию);",
                  "слаженная работа коллектива;",
                  "сотрудничество с лидирующими российскими и европейскими поставщиками из Германии и Италии (итальянские лакокрасочные покрытия, оригинальная фурнитура);",
                  "сочетание традиций и непрерывного совершенствования технологий (работа с массивом дерева осуществляется по секретам итальянских мастеров и на немецком оборудовании);",
                  "экологичность продукции (молодежные решения для спален и гостиных).",
                ].map((t) => (
                  <li key={t} className="flex gap-3">
                    <span className="mt-[10px] h-[5px] w-[5px] shrink-0 rounded-full bg-black/35" />
                    <span>{t}</span>
                  </li>
                ))}
              </ul>
            </div>

            <p data-reveal className="pt-1">
              География LIONETO охватывает крупнейшие города России,
              Узбекистана, Таджикистана, Казахстана и Кыргызстана, а коллекции
              мебели представлены в лучших мебельных центрах.
            </p>

            <p data-reveal className="font-medium text-black/80">
              Мы уверены: наша мебель принесет в Ваш дом красоту, уют и
              наслаждение на долгие годы.
            </p>
          </div>

          {/* image */}
          <div className="mx-auto mt-10 max-w-[1120px]">
            <PremiumImageBlock src={ABOUT_IMAGE_SRC} alt="Lioneto" />
          </div>
        </div>
      </section>
    </main>
  );
}
