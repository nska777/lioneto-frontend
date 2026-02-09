"use client";

import { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

export default function CallButton({
  onClick,
  children,
  label = "Заказать звонок",
}: {
  onClick: () => void;
  children?: React.ReactNode;
  // ✅ из Strapi будем передавать сюда
  label?: string;
}) {
  const rootRef = useRef<HTMLButtonElement | null>(null);

  const shimmerRef = useRef<HTMLSpanElement | null>(null);
  const waveARef = useRef<HTMLSpanElement | null>(null);
  const waveBRef = useRef<HTMLSpanElement | null>(null);

  // ✅ новый слой: hover-подсветка фона (меняет “цвет кнопки”)
  const hoverBgRef = useRef<HTMLSpanElement | null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    const shimmer = shimmerRef.current;
    const waveA = waveARef.current;
    const waveB = waveBRef.current;
    const hoverBg = hoverBgRef.current;

    if (!root || !shimmer || !waveA || !waveB || !hoverBg) return;

    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;
    if (prefersReduced) return;

    const ctx = gsap.context(() => {
      // стартовые состояния
      gsap.set(shimmer, { xPercent: -140, autoAlpha: 0 });
      gsap.set(hoverBg, { autoAlpha: 0 });

      // “тихие” внутренние волны как раньше
      gsap.to(waveA, {
        xPercent: -18,
        duration: 3.6,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      gsap.to(waveB, {
        xPercent: 14,
        duration: 4.2,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      const onEnter = () => {
        // 1) плавно меняем фон (слой hoverBg включаем)
        gsap.killTweensOf(hoverBg);
        gsap.to(hoverBg, {
          autoAlpha: 1,
          duration: 0.25,
          ease: "power2.out",
        });

        // 2) пробегающий градиент (shimmer sweep)
        gsap.killTweensOf(shimmer);
        gsap.set(shimmer, { xPercent: -140, autoAlpha: 1 });
        gsap.to(shimmer, {
          xPercent: 140,
          duration: 0.85,
          ease: "power3.out",
          onComplete: () => {
            gsap.set(shimmer, { autoAlpha: 0 });
          },
        });
      };

      const onLeave = () => {
        // возвращаем фон назад
        gsap.killTweensOf(hoverBg);
        gsap.to(hoverBg, {
          autoAlpha: 0,
          duration: 0.25,
          ease: "power2.inOut",
        });
      };

      root.addEventListener("mouseenter", onEnter);
      root.addEventListener("mouseleave", onLeave);

      return () => {
        root.removeEventListener("mouseenter", onEnter);
        root.removeEventListener("mouseleave", onLeave);
      };
    }, rootRef);

    return () => ctx.revert();
  }, []);

  // ✅ текст кнопки: children > label > fallback
  const text = children ?? label;

  return (
    <button
      ref={rootRef}
      onClick={onClick}
      className="
        relative isolate overflow-hidden cursor-pointer
        rounded-full px-5 py-[8px]
        text-[13px] tracking-[0.16em]
        shadow-[0_14px_35px_-26px_rgba(0,0,0,0.35)]
        transition
        hover:shadow-[0_18px_45px_-30px_rgba(0,0,0,0.38)]
        active:scale-[0.98]
      "
      style={{
        // базовый фон (нейтральный белый)
        background:
          "radial-gradient(120% 140% at 20% 0%, rgba(255,255,255,0.95), rgba(255,255,255,0) 58%), linear-gradient(180deg, #ffffff 0%, #f5f5f5 100%)",
      }}
    >
      {/* ✅ Hover фон: при наведении “цвет кнопки” меняется мягко */}
      <span
        ref={hoverBgRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full opacity-0"
        style={{
          // чуть более тёплый/контрастный оттенок + легкий “сияющий” центр
          background:
            "radial-gradient(120% 140% at 20% 0%, rgba(255,248,220,0.55), rgba(255,255,255,0) 55%), linear-gradient(180deg, #f6e6b8 0%, #e8c97a 45%, #d9b45f 100%)",
          mixBlendMode: "multiply",
        }}
      />

      {/* ТОНКАЯ ПРЕМИАЛЬНАЯ ОБВОДКА */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full"
        style={{
          padding: "0.5px",
          borderRadius: "9999px",
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.18), rgba(0,0,0,0.06))",
          WebkitMask:
            "linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)",
          WebkitMaskComposite: "xor",
          maskComposite: "exclude",
        }}
      />

      {/* ВНУТРЕННИЕ ВОЛНЫ */}
      <span
        ref={waveARef}
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(60% 80% at 30% 40%, rgba(0,0,0,0.06), transparent 70%)",
          mixBlendMode: "multiply",
        }}
      />
      <span
        ref={waveBRef}
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(70% 90% at 70% 60%, rgba(0,0,0,0.05), transparent 72%)",
          mixBlendMode: "multiply",
        }}
      />

      {/* ✅ Пробегающий градиент (sweep) */}
      <span
        ref={shimmerRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 rounded-full opacity-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.06) 30%, rgba(255,255,255,0.75) 50%, rgba(0,0,0,0.06) 70%, rgba(0,0,0,0) 100%)",
          mixBlendMode: "soft-light",
        }}
      />

      {/* ТЕКСТ */}
      <span
        className="relative z-10 bg-clip-text text-transparent"
        style={{
          backgroundImage:
            "linear-gradient(90deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.62) 45%, rgba(0,0,0,0.78) 100%)",
        }}
      >
        {text}
      </span>
    </button>
  );
}
