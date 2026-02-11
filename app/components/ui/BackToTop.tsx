"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ArrowUp } from "lucide-react";

export default function BackToTop({ showAfter = 700 }: { showAfter?: number }) {
  const ref = useRef<HTMLButtonElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    gsap.set(el, { autoAlpha: 0, y: 8, scale: 0.95 });

    const onScroll = () => setVisible(window.scrollY > showAfter);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [showAfter]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (visible) {
      gsap.to(el, {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: 0.3,
        ease: "power3.out",
      });

      gsap.to(el, {
        y: -4,
        duration: 0.9,
        ease: "power1.inOut",
        repeat: -1,
        yoyo: true,
        delay: 2.5,
      });
    } else {
      gsap.killTweensOf(el);
      gsap.to(el, {
        autoAlpha: 0,
        y: 8,
        scale: 0.95,
        duration: 0.25,
        ease: "power2.out",
      });
    }
  }, [visible]);

  return (
    <button
      ref={ref}
      aria-label="Наверх"
      onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
      className="
        fixed z-[2147483647]
        bottom-20 right-4 md:bottom-24 md:right-6
        h-13 w-13
        rounded-full
        border border-black/10
        bg-white
        shadow-[0_6px_20px_rgba(0,0,0,0.12)]
        grid place-items-center
        cursor-pointer
        active:scale-[0.96]
      "
    >
      <ArrowUp className="h-4 w-4 text-black/70" />
    </button>
  );
}
