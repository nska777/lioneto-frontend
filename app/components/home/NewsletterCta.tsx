"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { Send } from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

export default function NewsletterCta({
  backgroundUrl = "/images/home/newsletter-bg.jpg",
  title = "БУДЬТЕ В КУРСЕ",
  subtitle = "Подписывайтесь на наш Telegram — только важные новости и акции",
  telegramUrl = "https://t.me/lianetouz",
}: {
  backgroundUrl?: string;
  title?: string;
  subtitle?: string;
  telegramUrl?: string;
}) {
  const rootRef = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    if (!rootRef.current) return;

    const ctx = gsap.context(() => {
      const el = rootRef.current!.querySelector('[data-nl="wrap"]');
      if (!el) return;

      gsap.set(el, { opacity: 0, y: 16 });

      ScrollTrigger.create({
        trigger: rootRef.current!,
        start: "top 80%",
        once: true,
        onEnter: () => {
          gsap.to(el, {
            opacity: 1,
            y: 0,
            duration: 0.8,
            ease: "power3.out",
          });
        },
      });
    }, rootRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={rootRef} className="mx-auto w-full max-w-[1200px] px-4 py-14">
      <div
        data-nl="wrap"
        className="relative overflow-hidden rounded-2xl border border-black/10"
      >
        {/* background image */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${backgroundUrl})` }}
        />

        {/* overlay — аккуратный, без засвета */}
        <div className="absolute inset-0 bg-black/40" />

        {/* content */}
        <div className="relative px-5 py-10 text-center text-white md:px-10 md:py-14">
          <h3 className="text-[22px] font-semibold tracking-[0.18em] md:text-[28px]">
            {title}
          </h3>

          <p className="mt-2 text-[14px] text-white/85 md:text-[15px]">
            {subtitle}
          </p>

          {/* TELEGRAM BUTTON */}
          <div className="mt-7 flex justify-center">
            <a
              href={telegramUrl}
              target="_blank"
              rel="noopener noreferrer"
              className={cn(
                "group relative inline-flex h-12 items-center gap-3 overflow-hidden rounded-full px-8",
                "border border-white/30 backdrop-blur-md",
                "transition-all duration-300",
                "hover:scale-[1.02] active:scale-[0.99]",
              )}
            >
              {/* radial gradient background */}
              <span
                className={cn(
                  "absolute inset-0",
                  "bg-[radial-gradient(120%_120%_at_30%_0%,#e7c47a_0%,#c9a567_35%,#11aade_100%)]",
                  "opacity-95 transition-opacity duration-300 group-hover:opacity-100",
                )}
              />

              {/* subtle shine */}
              <span className="pointer-events-none absolute -left-10 -top-10 h-40 w-40 rounded-full bg-white/20 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              {/* content */}
              <span className="relative z-10 flex items-center gap-3 text-[13px] font-semibold tracking-[0.18em] text-white">
                ПОДПИСАТЬСЯ В TELEGRAM
                <Send className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
              </span>
            </a>
          </div>

          <div className="mx-auto mt-4 max-w-[720px] text-[12px] text-white/70">
            Без спама. Только поступления, акции и важные обновления Lioneto.
          </div>
        </div>
      </div>
    </section>
  );
}
