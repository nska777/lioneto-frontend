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
    title: "ГОСТИНАЯ SALVADOR",
    ctaLabel: "В КАТАЛОГ",
    href: "/catalog?menu=living&collections=salvador&hero=1",
    image: "/hero/01.jpg",
  },
  {
    id: "s2",
    title: "СПАЛЬНЯ AMBER",
    ctaLabel: "В КАТАЛОГ",
    href: "/catalog?menu=bedrooms&collections=amber&hero=1",
    image: "/hero/02.jpg",
  },
  {
    id: "s3",
    title: "СПАЛЬНЯ BUONGIORNO",
    ctaLabel: "В КАТАЛОГ",
    href: "/catalog?menu=bedrooms&collections=buongiorno&hero=1",
    image: "/hero/03.jpg",
  },
  {
    id: "s4",
    title: "ГОСТИНАЯ BUONGIORNO",
    ctaLabel: "В КАТАЛОГ",
    href: "/catalog?menu=living&collections=buongiorno&hero=1",
    image: "/hero/04.jpg",
  },
  {
    id: "s5",
    title: "МОЛОДЁЖНАЯ ELIZABETH",
    ctaLabel: "В КАТАЛОГ",
    href: "/catalog?menu=youth&collections=elizabeth&hero=1",
    image: "/hero/05.jpg",
  },
  {
    id: "s6",
    title: "СПАЛЬНЯ ELIZABETH",
    ctaLabel: "В КАТАЛОГ",
    href: "/catalog?menu=bedrooms&collections=elizabeth&hero=1",
    image: "/hero/06.jpg",
  },
  {
    id: "s7",
    title: "ГОСТИНАЯ PITTI",
    ctaLabel: "В КАТАЛОГ",
    href: "/catalog?menu=living&collections=pitti&hero=1",
    image: "/hero/07.jpg",
  },
  {
    id: "s8",
    title: "ГОСТИНАЯ SCANDY",
    ctaLabel: "В КАТАЛОГ",
    href: "/catalog?menu=living&collections=scandy&hero=1",
    image: "/hero/08.jpg",
  },
  {
    id: "s9",
    title: "МОЛОДЁЖНАЯ SKANDY",
    ctaLabel: "В КАТАЛОГ",
    href: "/catalog?menu=youth&collections=scandi&hero=1",
    image: "/hero/09.jpg",
  },
  {
    id: "s10",
    title: "СПАЛЬНЯ SALVADOR",
    ctaLabel: "В КАТАЛОГ",
    href: "/catalog?menu=bedrooms&collections=salvador&hero=1",
    image: "/hero/010.jpg",
  },
];

const ABOUT_IMAGE_SRC = "/images/1.jpg";

function GoldLioneto({ className = "" }: { className?: string }) {
  return (
    <span
      className={cn(
        "relative inline-block align-baseline font-semibold",
        "bg-clip-text text-transparent",
        "bg-[linear-gradient(90deg,#7a5519_0%,#a47824_45%,#6f4b15_100%)]",
        className,
      )}
    >
      LIONETO
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute -inset-x-1 -inset-y-1",
          "opacity-10",
          "bg-[radial-gradient(160px_38px_at_35%_45%,rgba(255,255,255,0.35),transparent_60%)]",
          "mix-blend-overlay",
        )}
      />
    </span>
  );
}

function PremiumImageBlock({
  src = ABOUT_IMAGE_SRC,
  alt = "Lioneto",
}: {
  src?: string;
  alt?: string;
}) {
  return (
    <div data-reveal-image className="mx-auto max-w-[980px]">
      <Image
        src={src}
        alt={alt}
        width={980}
        height={600}
        className="h-auto w-full"
        priority={false}
      />
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

      if (items.length > 0) {
        gsap.set(items, {
          autoAlpha: 0,
          y: 16,
          filter: "blur(8px)",
        } as unknown as gsap.TweenVars);

        gsap.to(items, {
          autoAlpha: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.9,
          ease: "power3.out",
          stagger: 0.08,
          scrollTrigger: {
            trigger: items[0],
            start: "top 86%",
            once: true,
          },
        } as unknown as gsap.TweenVars);
      }

      const img = root.querySelector<HTMLElement>("[data-reveal-image]");

      if (img) {
        gsap.fromTo(
          img,
          {
            autoAlpha: 0,
            y: 22,
            scale: 0.985,
          } as unknown as gsap.TweenVars,
          {
            autoAlpha: 1,
            y: 0,
            scale: 1,
            duration: 1.0,
            ease: "power3.out",
            scrollTrigger: {
              trigger: img,
              start: "top 86%",
              once: true,
            },
          } as unknown as gsap.TweenVars,
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

      {/* slider */}
      <section className="mt-6">
        <GSAPHeroSlider slides={ABOUT_SLIDES} autoMs={6500} />
      </section>

      {/* content */}
      <section
        className={cn(
          "relative mt-10 overflow-hidden rounded-[20px] bg-white",
          "ring-1 ring-black/[0.06]",
          "shadow-[0_30px_120px_rgba(0,0,0,0.08)]",
        )}
      >
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-56 -top-56 h-[720px] w-[720px] rounded-full bg-black/[0.03]" />
          <div className="absolute -right-56 -bottom-56 h-[720px] w-[720px] rounded-full bg-black/[0.025]" />
          <div className="absolute inset-0 bg-[radial-gradient(1200px_520px_at_50%_-10%,rgba(0,0,0,0.05),transparent_60%)]" />
        </div>

        <div className="relative px-6 py-10 md:px-12 md:py-14">
          <div className="mx-auto max-w-[1040px] text-center">
            <h1
              data-reveal
              className="mx-auto max-w-[1040px] text-center tracking-[-0.018em] text-black"
            >
              <span className="block space-y-2 md:space-y-3">
                <span className="block text-[24px] font-semibold leading-[1.12] md:text-[38px]">
                  Преемственность итальянских традиций:
                </span>

                <span className="block text-[24px] font-semibold leading-[1.12] md:text-[38px]">
                  культовые коллекции
                </span>

                <span className="block text-[30px] font-semibold leading-[1.1] tracking-[0.015em] md:text-[42px]">
                  MANNGROUP и MANINI MOBILI
                </span>

                <span className="block text-[24px] font-semibold leading-[1.12] md:text-[38px]">
                  обретают новую жизнь под новым брендом
                </span>

                <span className="block text-[30px] font-semibold leading-[1.05] md:text-[42px]">
                  <GoldLioneto />.
                </span>
              </span>
            </h1>

            <div
              data-reveal
              className="mx-auto mt-8 h-px w-[180px] bg-black/10"
            />
          </div>

          <div className="mx-auto mt-10 max-w-[980px] space-y-4 text-[18px] leading-8 text-black/65 md:text-[20px]">
            <p data-reveal>
              В 2025 году в мебельной индустрии произошло знаменательное
              событие: производство мебельных фабрик MANNGROUP и MANINIMOBILI
              было перенесено из самого западного региона России — города
              Калининграда — в крупнейший город и столицу Узбекистана — Ташкент.
            </p>

            <p data-reveal>
              Такое стратегическое решение было принято по нескольким причинам:
              выгодное географическое положение города Ташкент, связывающего
              Центральную Азию с Россией, эффективная логистика и возможность
              выхода на новые рынки.
            </p>

            <p data-reveal>
              Сегодня производство и выпуск коллекций, покоривших сердца
              миллионов семей — «SCANDY», «SALVADOR», «AMBER», «BUONGIORNO»,
              «PITTI» — обретают новую жизнь под новым брендом <GoldLioneto />.
            </p>

            <p data-reveal>
              Более того, в LIONETO создаются как новые серийные коллекции для
              дома: уютные спальни и гостиные, респектабельные кабинеты с
              библиотеками, функциональные прихожие, красивая садовая мебель,
              так и предлагаются интерьерные решения любой сложности «под ключ»
              — от загородных особняков до отелей.
            </p>

            <p data-reveal>
              Ориентируясь на тренды и сотрудничая с ведущими российскими и
              зарубежными дизайнерами, мы сохраняем свою индивидуальность,
              грамотно расставляя акценты: всё, что попадает в поле зрения
              нашего клиента и к чему прикасается его рука, — всегда эстетично и
              практично.
            </p>

            <div data-reveal className="pt-2">
              <div className="font-medium text-black/80">
                Сегодня <GoldLioneto /> — это:
              </div>

              <ul className="mt-3 space-y-2">
                {[
                  "полный цикл производства: на наиболее сложных производственных участках, подчеркивающих индивидуальность LIONETO, заняты итальянские специалисты по окрашиванию;",
                  "сочетание традиций и непрерывного совершенствования технологий: работа с массивом дерева осуществляется по секретам итальянских мастеров по деревообработке и на немецком оборудовании;",
                  "слаженная работа коллектива;",
                  "сотрудничество с лидирующими европейскими поставщиками из Германии и Италии: итальянские лакокрасочные покрытия, оригинальная фурнитура;",
                  "экологичность продукции.",
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

          <div className="mx-auto mt-10 max-w-[1120px]">
            <PremiumImageBlock src={ABOUT_IMAGE_SRC} alt="Lioneto" />
          </div>
        </div>
      </section>
    </main>
  );
}
