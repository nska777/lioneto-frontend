"use client";

import { useEffect, useState, type ReactNode } from "react";

function isIOSDevice() {
  if (typeof window === "undefined") return false;

  const ua = window.navigator.userAgent || "";
  const platform = window.navigator.platform || "";

  return (
    /iPad|iPhone|iPod/.test(ua) ||
    (platform === "MacIntel" && window.navigator.maxTouchPoints > 1)
  );
}

export default function IOSHeavySectionGate({
  children,
}: {
  children: ReactNode;
}) {
  const [mounted, setMounted] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    setIsIOS(isIOSDevice());
    setMounted(true);
  }, []);

  /*
    Диагностика:
    - до hydration показываем children, чтобы не было SSR/CSR рассинхрона;
    - после hydration на iPhone скрываем тяжёлые секции;
    - desktop и Android не трогаем.
  */
  if (!mounted) {
    return <>{children}</>;
  }

  if (isIOS) {
    return null;
  }

  return <>{children}</>;
}
