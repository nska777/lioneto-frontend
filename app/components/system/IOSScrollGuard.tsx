"use client";

import { useEffect } from "react";

function isIOSDevice() {
  if (typeof window === "undefined") return false;

  const ua = window.navigator.userAgent || "";
  const platform = window.navigator.platform || "";

  const isiPhoneLike = /iPad|iPhone|iPod/.test(ua);
  const isModernIPad =
    platform === "MacIntel" && window.navigator.maxTouchPoints > 1;

  return isiPhoneLike || isModernIPad;
}

export default function IOSScrollGuard() {
  useEffect(() => {
    if (!isIOSDevice()) return;

    const root = document.documentElement;

    root.classList.add("ios-device");

    let timer: number | null = null;
    let lastScrollY = window.scrollY;

    const keepActive = () => {
      root.classList.add("ios-is-scrolling");

      if (timer !== null) {
        window.clearTimeout(timer);
      }

      timer = window.setTimeout(() => {
        root.classList.remove("ios-is-scrolling");
        timer = null;
      }, 520);
    };

    const onTouchStart = () => {
      keepActive();
    };

    const onTouchMove = () => {
      keepActive();
    };

    const onTouchEnd = () => {
      keepActive();
    };

    const onScroll = () => {
      const currentY = window.scrollY;

      if (currentY !== lastScrollY) {
        lastScrollY = currentY;
        keepActive();
      }
    };

    const onPageShow = () => {
      root.classList.remove("ios-is-scrolling");
    };

    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("touchcancel", onTouchEnd, { passive: true });
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("pageshow", onPageShow);

    return () => {
      if (timer !== null) {
        window.clearTimeout(timer);
      }

      root.classList.remove("ios-device");
      root.classList.remove("ios-is-scrolling");

      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("touchcancel", onTouchEnd);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("pageshow", onPageShow);
    };
  }, []);

  return null;
}
