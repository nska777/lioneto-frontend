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

export default function IOSHomeDebugOnly({
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

  if (!mounted) {
    return <>{children}</>;
  }

  if (!isIOS) {
    return <>{children}</>;
  }

  return (
    <main className="min-h-[280vh] bg-white text-black">
      <section className="mx-auto w-full max-w-[1200px] px-4 py-10">
        <div className="rounded-3xl border border-black/10 bg-white p-6">
          <div className="text-[12px] uppercase tracking-[0.18em] text-black/40">
            iOS DEBUG
          </div>

          <h1 className="mt-3 text-[28px] font-semibold tracking-[-0.03em]">
            Тест чистого скролла
          </h1>

          <p className="mt-3 text-[15px] leading-7 text-black/65">
            Сейчас на iPhone отключена вся главная страница. Если дребезг
            остаётся даже здесь — проблема не в блоках главной, а в глобальном
            layout/CSS/Footer/body/Safari. Если здесь плавно — виновник был в
            одном из компонентов главной.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {Array.from({ length: 16 }).map((_, i) => (
            <div
              key={i}
              className="rounded-3xl border border-black/10 bg-white p-6"
            >
              <div className="text-[13px] uppercase tracking-[0.18em] text-black/40">
                BLOCK {i + 1}
              </div>

              <div className="mt-3 h-[120px] rounded-2xl bg-black/[0.03]" />

              <p className="mt-4 text-[14px] leading-7 text-black/60">
                Лёгкий тестовый блок без изображений, GSAP, слайдеров, sticky,
                fixed и тяжёлых анимаций.
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
