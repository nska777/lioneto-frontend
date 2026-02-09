"use client";

import { useEffect } from "react";

function isEditableTarget(el: EventTarget | null) {
  if (!(el instanceof HTMLElement)) return false;
  const tag = el.tagName;
  return (
    tag === "INPUT" ||
    tag === "TEXTAREA" ||
    tag === "SELECT" ||
    el.isContentEditable
  );
}

function hasScrollableParent(el: HTMLElement | null) {
  let node: HTMLElement | null = el;
  while (node && node !== document.body) {
    const style = window.getComputedStyle(node);
    const overflowY = style.overflowY;
    const canScroll =
      (overflowY === "auto" || overflowY === "scroll") &&
      node.scrollHeight > node.clientHeight + 2;
    if (canScroll) return true;
    node = node.parentElement;
  }
  return false;
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

// ✅ трекпад обычно: deltaMode=0 + маленькие частые dy
function looksLikeTrackpad(e: WheelEvent) {
  if (e.deltaMode !== 0) return false; // lines/pages -> скорее мышь
  const absY = Math.abs(e.deltaY);
  const absX = Math.abs(e.deltaX);

  // мелкие значения + часто есть deltaX (горизонтальная составляющая) = трекпад почти всегда
  if (absX > 0) return true;
  return absY > 0 && absY < 45;
}

export default function SmoothWheelScroll({
  duration = 140, // 120–160 обычно “премиум” без лагов
  maxStep = 220,
  wheelMultiplier = 1,
}: {
  duration?: number;
  maxStep?: number;
  wheelMultiplier?: number;
}) {
  useEffect(() => {
    const reduce = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    )?.matches;
    if (reduce) return;

    let raf = 0;

    let from = window.scrollY;
    let to = window.scrollY;
    let start = 0;

    const doc = document.scrollingElement || document.documentElement;

    const getMaxScroll = () => {
      const max = doc.scrollHeight - window.innerHeight || 0;
      return Math.max(0, max);
    };

    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const tick = (now: number) => {
      const t = clamp((now - start) / duration, 0, 1);
      const y = from + (to - from) * easeOutCubic(t);
      window.scrollTo(0, y);

      if (t < 1) raf = requestAnimationFrame(tick);
      else {
        raf = 0;
        window.scrollTo(0, to);
      }
    };

    const startTween = () => {
      if (raf) cancelAnimationFrame(raf);
      start = performance.now();
      // ✅ стартуем от текущей позиции — это убирает “подвисание/отставание”
      from = window.scrollY;
      raf = requestAnimationFrame(tick);
    };

    const onWheel = (e: WheelEvent) => {
      // ✅ не мешаем зуму
      if (e.ctrlKey) return;

      const targetEl = e.target as HTMLElement | null;
      if (isEditableTarget(e.target)) return;
      if (targetEl && hasScrollableParent(targetEl)) return;

      // ✅ трекпад НЕ трогаем (он и так плавный)
      if (looksLikeTrackpad(e)) return;

      // нормализация delta
      let dy = e.deltaY;
      if (e.deltaMode === 1) dy *= 16; // lines -> px
      if (e.deltaMode === 2) dy *= window.innerHeight; // pages -> px
      dy *= wheelMultiplier;
      dy = clamp(dy, -maxStep, maxStep);

      // ✅ на границах (верх/низ) — НЕ перехватываем, иначе “залипает”
      const max = getMaxScroll();
      const y = window.scrollY;

      const atTop = y <= 0;
      const atBottom = y >= max - 1;

      if ((atTop && dy < 0) || (atBottom && dy > 0)) {
        return; // пусть браузер делает нативное поведение
      }

      // ✅ перехват ТОЛЬКО мышиного колеса
      e.preventDefault();

      to = clamp(y + dy, 0, max);
      startTween();
    };

    window.addEventListener("wheel", onWheel, { passive: false });

    return () => {
      window.removeEventListener("wheel", onWheel as any);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [duration, maxStep, wheelMultiplier]);

  return null;
}
