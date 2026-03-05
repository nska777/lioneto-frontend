"use client";

import React, { useEffect, useMemo, useState } from "react";
import { User, ShoppingCart, Heart, Briefcase } from "lucide-react";
import { useShopState } from "../../context/shop-state";
import Image from "next/image";
import Link from "next/link";

import { supabase } from "@/app/lib/supabase/client";
import { getDict, tF } from "@/i18n";

function IconBtn({
  label,
  href,
  onClick,
  children,
}: {
  label: string;
  href?: string;
  onClick?: () => void;
  children: React.ReactNode;
}) {
  const base =
    "relative inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-black/60 hover:bg-black/5 hover:text-black transition";

  if (href) {
    return (
      <Link aria-label={label} href={href} className={base}>
        {children}
      </Link>
    );
  }

  return (
    <button type="button" aria-label={label} onClick={onClick} className={base}>
      {children}
    </button>
  );
}

type LangKey = "ru" | "uz";

type LangUiConfig = {
  showLanguageToggle?: boolean; // показать/скрыть RU/UZ
  enabledLanguages?: LangKey[]; // какие языки вообще доступны
  labels?: Partial<Record<LangKey, string>>; // можно переименовать RU/UZ
};

function uniqLangs(list: LangKey[]) {
  const s = new Set<LangKey>();
  for (const v of list) s.add(v);
  return Array.from(s);
}

export default function BrandRow({
  region,
  setRegion,
  lang,
  setLang,
  langUi,
}: {
  region: "uz" | "ru";
  setRegion: (v: "uz" | "ru") => void;
  lang: LangKey;
  setLang: (v: LangKey) => void;
  langUi?: LangUiConfig; // 👈 Strapi-config (прокидываем сверху)
}) {
  const { favCount, cartCount } = useShopState();

  const dict = useMemo(() => getDict(lang), [lang]);
  const tt = (key: string, fallback: string) => tF(dict, key, fallback);

  const [accountHref, setAccountHref] = useState("/auth?next=/account");

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setAccountHref(data.session ? "/account" : "/auth?next=/account");
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setAccountHref(session ? "/account" : "/auth?next=/account");
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const GOLD = "#B9893B";

  const langUiResolved = useMemo(() => {
    const show = langUi?.showLanguageToggle !== false;
    const enabled = uniqLangs(
      langUi?.enabledLanguages?.length ? langUi.enabledLanguages : ["ru", "uz"],
    );
    const labels: Record<LangKey, string> = {
      ru: (langUi?.labels?.ru ?? "RU").toString(),
      uz: (langUi?.labels?.uz ?? "UZ").toString(),
    };
    return { show, enabled, labels };
  }, [langUi]);

  const canShowLang = langUiResolved.show && langUiResolved.enabled.length > 0;

  return (
    <div className="py-1.5 md:py-2.5">
      <div className="mx-auto w-full max-w-[1200px] px-4">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between md:gap-0">
          {/* LEFT */}
          <div className="flex items-center justify-between md:w-[360px] md:justify-start md:gap-4">
            <div className="text-[11px] md:text-[12px] tracking-[0.20em] text-black/45 whitespace-nowrap">
              {tt("header.pickRegion", "Выберите регион")}
            </div>

            <div
              className="
                inline-flex
                shrink-0
                rounded-full
                bg-[#f3f3f3]
                p-1
                shadow-[0_4px_12px_rgba(0,0,0,0.08)]
              "
            >
              <button
                type="button"
                onClick={() => setRegion("uz")}
                className={[
                  "h-8 px-4 rounded-full text-[12px] tracking-[0.12em] transition cursor-pointer whitespace-nowrap",
                  region === "uz"
                    ? "bg-black text-white"
                    : "text-black/70 hover:text-black hover:bg-black/5",
                ].join(" ")}
              >
                {tt("header.regionUz", "Узбекистан")}
              </button>

              <button
                type="button"
                onClick={() => setRegion("ru")}
                className={[
                  "h-8 px-4 rounded-full text-[12px] tracking-[0.12em] transition cursor-pointer whitespace-nowrap",
                  region === "ru"
                    ? "bg-black text-white"
                    : "text-black/70 hover:text-black hover:bg-black/5",
                ].join(" ")}
              >
                {tt("header.regionRu", "Россия")}
              </button>
            </div>
          </div>

          {/* CENTER */}
          <div className="text-center md:flex-1">
            <Link
              href="/"
              className="inline-flex items-center justify-center cursor-pointer"
            >
              <Image
                src="/logo-lioneto.png"
                alt="Lioneto"
                width={265}
                height={45}
                priority
                className="transition-transform duration-300 hover:scale-[1.03]"
              />
            </Link>
          </div>

          {/* RIGHT */}
          <div className="flex flex-nowrap items-center justify-end gap-3 md:w-[360px]">
            {/* Дилерам ч
            <Link
              href="/dealer/login"
              className="hidden md:inline-flex items-center gap-1.5 whitespace-nowrap text-[12px] tracking-[0.18em] text-black font-medium transition-colors cursor-pointer"
              onMouseEnter={(e) => {
                e.currentTarget.style.color = GOLD;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "";
              }}
            >
              <Briefcase className="h-4 w-4 opacity-70" />
              ДИЛЕРАМ
            </Link> */}

            <span className="hidden md:inline-block h-4 w-px bg-black/10" />

            {/* LANG TOGGLE (Strapi-driven show/hide) */}
            {canShowLang && (
              <div className="inline-flex min-w-[86px] rounded-full border-none bg-[#f3f3f3] p-1 shadow-sm">
                {langUiResolved.enabled.includes("ru") && (
                  <button
                    type="button"
                    onClick={() => setLang("ru")}
                    className={[
                      "h-8 px-3 rounded-full text-[12px] tracking-[0.14em] transition cursor-pointer whitespace-nowrap",
                      lang === "ru"
                        ? "bg-black text-white"
                        : "text-black/70 hover:text-black hover:bg-black/5",
                    ].join(" ")}
                  >
                    {langUiResolved.labels.ru}
                  </button>
                )}

                {langUiResolved.enabled.includes("uz") && (
                  <button
                    type="button"
                    onClick={() => setLang("uz")}
                    className={[
                      "h-8 px-3 rounded-full text-[12px] tracking-[0.14em] transition cursor-pointer whitespace-nowrap",
                      lang === "uz"
                        ? "bg-black text-white"
                        : "text-black/70 hover:text-black hover:bg-black/5",
                    ].join(" ")}
                  >
                    {langUiResolved.labels.uz}
                  </button>
                )}
              </div>
            )}

            <IconBtn
              label={tt("header.ariaAccount", "Кабинет")}
              href={accountHref}
            >
              <User className="h-5 w-5" />
            </IconBtn>

            <div className="relative">
              <IconBtn
                label={tt("header.ariaFavorites", "Избранное")}
                href="/favorites"
              >
                <Heart className="h-5 w-5" />
              </IconBtn>

              {favCount > 0 && (
                <span className="pointer-events-none absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[11px] text-white shadow">
                  {favCount}
                </span>
              )}
            </div>

            <div className="relative">
              <IconBtn label={tt("header.ariaCart", "Корзина")} href="/cart">
                <ShoppingCart className="h-5 w-5" />
              </IconBtn>

              {cartCount > 0 && (
                <span className="pointer-events-none absolute -right-1 -top-1 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-black px-1 text-[11px] text-white shadow">
                  {cartCount}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
