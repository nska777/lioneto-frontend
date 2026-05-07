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

function DebugPage() {
  return (
    <main className="min-h-[300vh] bg-white text-black">
      <section className="mx-auto w-full max-w-[1200px] px-4 py-10">
        <div className="rounded-3xl border border-black/10 bg-white p-6">
          <div className="text-[12px] uppercase tracking-[0.18em] text-black/40">
            iOS DEBUG
          </div>

          <h1 className="mt-3 text-[28px] font-semibold tracking-[-0.03em]">
            Абсолютно чистый тест скролла
          </h1>

          <p className="mt-3 text-[15px] leading-7 text-black/65">
            На iPhone сейчас не должны монтироваться Hero, BestSellers,
            BestPrice, CollectionsSlider, News, About, Newsletter и SEO-блоки.
            Это чистая страница без GSAP, изображений, fixed-слоёв и слайдеров.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          {Array.from({ length: 18 }).map((_, i) => (
            <div
              key={i}
              className="rounded-3xl border border-black/10 bg-white p-6"
            >
              <div className="text-[13px] uppercase tracking-[0.18em] text-black/40">
                BLOCK {i + 1}
              </div>

              <div className="mt-3 h-[120px] rounded-2xl bg-black/[0.03]" />

              <p className="mt-4 text-[14px] leading-7 text-black/60">
                Лёгкий тестовый блок без изображений, анимаций и JavaScript
                логики.
              </p>
            </div>
          ))}
        </div>
      </section>
    </main>
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

  /*
    ВАЖНО:
    До mounted НЕ возвращаем children.
    Иначе вся главная успевает смонтироваться на iPhone.
  */
  if (!mounted) {
    return <DebugPage />;
  }

  if (isIOS) {
    return <DebugPage />;
  }

  return <>{children}</>;
}
