"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ArrowUpRight } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

type StrapiImage = {
  url: string;
  alternativeText?: string | null;
};

type Props = {
  title?: string;
  paragraphs?: string[]; // тексты слева
  ctaLabel?: string;
  ctaHref?: string; // ссылка на страницу "О компании"
  images?: [StrapiImage, StrapiImage]; // две картинки справа
};

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

export default function AboutCompany({
  title = "О компании",
  paragraphs = [
    "В основе концепции проекта Lioneto лежит идея — предложить потребителю качественный продукт по доступным ценам.",
    "В основу ассортиментного портфеля включены лучшие коллекции фабрик, специализирующихся на производстве премиального текстиля, а также авторские коллекции проекта Lioneto.",
  ],
  ctaLabel = "Подробнее",
  ctaHref = "/about",
  images = [
    { url: "/mock/about-1.jpg", alternativeText: "Interior plant" },
    { url: "/mock/about-2.jpg", alternativeText: "Dining interior" },
  ],
}: Props) {
  const rootRef = useRef<HTMLDivElement | null>(null);

  const img1 = images[0];
  const img2 = images[1];

  const content = useMemo(() => ({ title, paragraphs }), [title, paragraphs]);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const ctx = gsap.context(() => {
      const panel = root.querySelector<HTMLElement>("[data-panel]");
      const left = root.querySelector<HTMLElement>("[data-left]");
      const right = root.querySelector<HTMLElement>("[data-right]");
      const pics = Array.from(root.querySelectorAll<HTMLElement>("[data-pic]"));
      const btn = root.querySelector<HTMLElement>("[data-cta]");

      if (!panel || !left || !right) return;

      // init
      gsap.set(panel, { opacity: 0, y: 22, filter: "blur(10px)" });
      gsap.set(left.children, { opacity: 0, y: 14, filter: "blur(8px)" });
      gsap.set(right, { opacity: 0, y: 18, filter: "blur(10px)" });

      // clip reveal (очень мягко)
      gsap.set(panel, { clipPath: "inset(0 0 16% 0 round 28px)" });

      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: root,
          start: "top 78%",
          once: true,
        },
      });

      tl.to(panel, {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        duration: 0.9,
        ease: "power3.out",
      }).to(
        panel,
        {
          clipPath: "inset(0 0 0% 0 round 28px)",
          duration: 0.9,
          ease: "power3.out",
        },
        0,
      );

      tl.to(
        left.children,
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.6,
          stagger: 0.08,
          ease: "power3.out",
        },
        0.15,
      );

      tl.to(
        right,
        {
          opacity: 1,
          y: 0,
          filter: "blur(0px)",
          duration: 0.8,
          ease: "power3.out",
        },
        0.18,
      );

      tl.fromTo(
        pics,
        { scale: 0.985 },
        { scale: 1, duration: 0.9, ease: "power3.out", stagger: 0.06 },
        0.2,
      );

      // micro hover on button (чуть живее, премиальнее)
      if (btn) {
        const icon = btn.querySelector<HTMLElement>("[data-cta-icon]");

        const onEnter = () => {
          gsap.to(btn, { y: -2, duration: 0.22, ease: "power3.out" });
          if (icon)
            gsap.to(icon, { x: 2, y: -1, duration: 0.22, ease: "power3.out" });
        };
        const onLeave = () => {
          gsap.to(btn, { y: 0, duration: 0.25, ease: "power3.out" });
          if (icon)
            gsap.to(icon, { x: 0, y: 0, duration: 0.25, ease: "power3.out" });
        };

        btn.addEventListener("mouseenter", onEnter);
        btn.addEventListener("mouseleave", onLeave);
        (btn as any).__cleanup = () => {
          btn.removeEventListener("mouseenter", onEnter);
          btn.removeEventListener("mouseleave", onLeave);
        };
      }

      // subtle parallax on images
      pics.forEach((pic) => {
        const onMove = (e: MouseEvent) => {
          const r = pic.getBoundingClientRect();
          const dx = (e.clientX - (r.left + r.width / 2)) / r.width; // -0.5..0.5
          const dy = (e.clientY - (r.top + r.height / 2)) / r.height;
          gsap.to(pic, {
            x: dx * 6,
            y: dy * 6,
            duration: 0.35,
            ease: "power3.out",
          });
        };
        const onLeave = () => {
          gsap.to(pic, { x: 0, y: 0, duration: 0.45, ease: "power3.out" });
        };

        pic.addEventListener("mousemove", onMove);
        pic.addEventListener("mouseleave", onLeave);
        (pic as any).__cleanup = () => {
          pic.removeEventListener("mousemove", onMove);
          pic.removeEventListener("mouseleave", onLeave);
        };
      });
    }, root);

    return () => {
      const root = rootRef.current;
      if (root) {
        const btn = root.querySelector<HTMLElement>("[data-cta]");
        (btn as any)?.__cleanup?.();

        root.querySelectorAll<HTMLElement>("[data-pic]").forEach((p) => {
          (p as any).__cleanup?.();
        });
      }
      ctx.revert();
    };
  }, [content.title, content.paragraphs.join("|")]);

  return (
    <section ref={rootRef} className="relative">
      <div className="mx-auto w-full max-w-[1200px] px-4">
        <div
          data-panel
          className={cn(
            "relative overflow-hidden rounded-[28px]",
            "border border-black/[0.05]",
            "bg-white/[0.78] backdrop-blur-2xl",
            "shadow-[0_24px_100px_rgba(0,0,0,0.07)]",
          )}
        >
          {/* ✅ Ослабленный Apple-градиент (не давит) */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/[0.015] via-transparent to-transparent" />

          {/* ✅ “Фарфоровый” свет */}
          <div className="pointer-events-none absolute -top-32 left-1/2 h-[360px] w-[360px] -translate-x-1/2 rounded-full bg-white/60 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-40 right-10 h-[420px] w-[420px] rounded-full bg-black/[0.02] blur-3xl" />

          <div className="relative p-6 md:p-10">
            <div className="grid items-start gap-8 md:grid-cols-12">
              {/* Left */}
              <div data-left className="md:col-span-6 lg:col-span-6">
                <div className="text-[11px] uppercase tracking-[0.28em] text-black/40">
                  Lioneto
                </div>

                <h2 className="mt-2 text-[26px] leading-[1.06] tracking-[-0.02em] text-black md:text-[34px]">
                  {title}
                </h2>

                <div className="mt-5 space-y-5 text-[15px] leading-relaxed text-black/60">
                  {paragraphs.map((p, idx) => (
                    <p key={idx} className="max-w-[520px]">
                      {p}
                    </p>
                  ))}
                </div>

                <div className="mt-7">
                  <Link
                    href={ctaHref}
                    data-cta
                    className={cn(
                      "group inline-flex items-center justify-center gap-2",
                      "h-11 px-8 rounded-[14px]",

                      // ✅ Нежнее бордер + glass
                      "border border-black/[0.12] bg-white/70 backdrop-blur-md",

                      // ✅ Текст
                      "text-[13px] font-medium tracking-[0.02em] text-black/80",

                      // ✅ Премиальная тень, на hover чуть сильнее
                      "shadow-[0_10px_26px_rgba(0,0,0,0.08)]",
                      "transition-all duration-300 ease-out",

                      // ✅ Hover / Active / Focus
                      "hover:bg-white hover:border-black/[0.16] hover:shadow-[0_14px_34px_rgba(0,0,0,0.10)]",
                      "active:translate-y-[1px] active:shadow-[0_8px_18px_rgba(0,0,0,0.08)]",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/10 focus-visible:ring-offset-2 focus-visible:ring-offset-white/60",

                      "cursor-pointer select-none",
                    )}
                  >
                    {ctaLabel}
                    <ArrowUpRight
                      data-cta-icon
                      className="h-[16px] w-[16px] text-black/55 transition-transform duration-300 ease-out group-hover:translate-x-[2px] group-hover:-translate-y-[1px]"
                    />
                  </Link>
                </div>
              </div>

              {/* Right */}
              <div data-right className="md:col-span-6 lg:col-span-6">
                <div className="grid grid-cols-2 gap-4 md:gap-6">
                  <div
                    data-pic
                    className={cn(
                      "relative overflow-hidden rounded-[18px]",
                      "border border-black/[0.06] bg-/50",
                      "shadow-[0_18px_55px_rgba(0,0,0,0.08)]",
                    )}
                  >
                    <div className="relative aspect-[4/5] w-full">
                      <Image
                        src={img1.url}
                        alt={img1.alternativeText || "About image"}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 48vw, 360px"
                      />
                    </div>
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/[0.12] via-transparent to-transparent" />
                  </div>

                  <div
                    data-pic
                    className={cn(
                      "relative overflow-hidden rounded-[18px]",
                      "border border-black/[0.06] bg-white/50",
                      "shadow-[0_18px_55px_rgba(0,0,0,0.08)]",
                    )}
                  >
                    <div className="relative aspect-[4/5] w-full">
                      <Image
                        src={img2.url}
                        alt={img2.alternativeText || "About image 2"}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 48vw, 360px"
                      />
                    </div>
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/[0.12] via-transparent to-transparent" />
                  </div>
                </div>

                {/* ✅ линия снизу тоже нежнее */}
                <div className="mt-6 hidden md:block h-px w-full bg-black/[0.06]" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
