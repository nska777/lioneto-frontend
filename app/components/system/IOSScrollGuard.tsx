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

    const start = () => {
      root.classList.add("ios-is-scrolling");

      if (timer !== null) {
        window.clearTimeout(timer);
      }

      timer = window.setTimeout(() => {
        root.classList.remove("ios-is-scrolling");
        timer = null;
      }, 180);
    };

    const stop = () => {
      if (timer !== null) {
        window.clearTimeout(timer);
      }

      timer = window.setTimeout(() => {
        root.classList.remove("ios-is-scrolling");
        timer = null;
      }, 220);
    };

    window.addEventListener("touchstart", start, { passive: true });
    window.addEventListener("touchmove", start, { passive: true });
    window.addEventListener("touchend", stop, { passive: true });
    window.addEventListener("touchcancel", stop, { passive: true });

    return () => {
      if (timer !== null) {
        window.clearTimeout(timer);
      }

      root.classList.remove("ios-device");
      root.classList.remove("ios-is-scrolling");

      window.removeEventListener("touchstart", start);
      window.removeEventListener("touchmove", start);
      window.removeEventListener("touchend", stop);
      window.removeEventListener("touchcancel", stop);
    };
  }, []);

  return null;
}
