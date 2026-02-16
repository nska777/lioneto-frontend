"use client";

import React, { useLayoutEffect, useRef } from "react";
import gsap from "gsap";

const GOLD = "#B9893B";
const GOLD_HOVER = "#8F6A2B";

export default function CallButton({
  onClick,
  children,
  label = "Заказать звонок",
}: {
  onClick: () => void;
  children?: React.ReactNode;
  label?: string;
}) {
  const rootRef = useRef<HTMLButtonElement | null>(null);

  useLayoutEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const prefersReduced =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    // старт
    root.style.color = GOLD;

    const onEnter = () => {
      if (prefersReduced) {
        root.style.color = GOLD_HOVER;
        root.style.textDecoration = "underline";
        return;
      }

      gsap.killTweensOf(root);
      gsap.to(root, {
        color: GOLD_HOVER,
        duration: 0.18,
        ease: "power2.out",
      });

      root.style.textDecoration = "underline";
    };

    const onLeave = () => {
      if (prefersReduced) {
        root.style.color = GOLD;
        root.style.textDecoration = "none";
        return;
      }

      gsap.killTweensOf(root);
      gsap.to(root, {
        color: GOLD,
        duration: 0.18,
        ease: "power2.out",
      });

      root.style.textDecoration = "none";
    };

    root.addEventListener("mouseenter", onEnter);
    root.addEventListener("mouseleave", onLeave);

    return () => {
      root.removeEventListener("mouseenter", onEnter);
      root.removeEventListener("mouseleave", onLeave);
      gsap.killTweensOf(root);
    };
  }, []);

  const text = children ?? label;

  return (
    <button
      ref={rootRef}
      type="button"
      onClick={onClick}
      className="
        bg-transparent p-0 m-0
        cursor-pointer select-none
        text-[16px] tracking-[0.02em] whitespace-nowrap
        transition
        underline-offset-[3px]
      "
      style={{ color: GOLD }}
    >
      {text}
    </button>
  );
}
