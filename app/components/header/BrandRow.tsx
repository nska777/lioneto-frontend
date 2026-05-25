"use client";

import React, { useEffect, useMemo, useState } from "react";
import { User, ShoppingCart, Heart, Briefcase } from "lucide-react";
import { useShopState } from "../../context/shop-state";
import Image from "next/image";
import Link from "next/link";

import { supabase } from "@/app/lib/supabase/client";
import { getDict, tF } from "@/i18n";

type RegionKey = "uz" | "ru" | "kz";
type LangKey = "ru" | "uz";

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
    "relative inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-black/60 hover:bg-black/5 hover:text-black transition";

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

type LangUiConfig = {
  showLanguageToggle?: boolean;
  enabledLanguages?: LangKey[];
  labels?: Partial<Record<LangKey, string>>;
};

function uniqLangs(list: LangKey[]) {
  const s = new Set<LangKey>();

  for (const v of list) {
    s.add(v);
  }

  return Array.from(s);
}

function DealerLink() {
  const GOLD = "#B9893B";

  return (
    <Link
      href="/dealer/login"
      className="inline-flex min-w-0 shrink-0 items-center gap-1.5 whitespace-nowrap text-[12px] tracking-[0.18em] text-black font-medium transition-colors cursor-pointer"
      onMouseEnter={(e) => {
        e.currentTarget.style.color = GOLD;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "";
      }}
    >
      <Briefcase className="h-4 w-4 shrink-0 opacity-70" />
      <span>ДИЛЕРАМ</span>
    </Link>
  );
}

export default function BrandRow({
  region,
  setRegion,
  lang,
  setLang,
  langUi,
}: {
  region: RegionKey;
  setRegion: (v: RegionKey) => void;
  lang: LangKey;
  setLang: (v: LangKey) => void;
  langUi?: LangUiConfig;
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

  const regionItems: Array<{
    key: RegionKey;
    label: string;
    title: string;
  }> = [
    {
      key: "uz",
      label: "UZ",
      title: tt("header.regionUz", "Узбекистан"),
    },
    {
      key: "ru",
      label: "RU",
      title: tt("header.regionRu", "Россия"),
    },
    {
      key: "kz",
      label: "KZ",
      title: tt("header.regionKz", "Казахстан"),
    },
  ];

  return (
    <div className="w-full max-w-full overflow-x-clip py-1.5 md:py-2.5">
      <div className="mx-auto w-full max-w-[1200px] overflow-hidden px-4">
        <div className="flex min-w-0 max-w-full flex-col gap-4 overflow-hidden md:flex-row md:items-center md:justify-between md:gap-0 md:overflow-visible">
          {/* LEFT */}
          <div className="flex min-w-0 max-w-full items-center justify-between gap-3 md:w-[360px] md:justify-start md:gap-3">
            <div className="min-w-0 truncate text-[10px] tracking-[0.18em] text-black/45 md:text-[11px]">
              {tt("header.pickRegion", "Выберите регион")}
            </div>

            <div className="inline-flex shrink-0 items-center rounded-full bg-[#f3f3f3] p-0.5 shadow-[0_4px_12px_rgba(0,0,0,0.08)]">
              {regionItems.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  title={item.title}
                  onClick={() => setRegion(item.key)}
                  className={[
                    "h-7 min-w-9 rounded-full px-2.5 text-[11px] font-semibold tracking-[0.08em] transition cursor-pointer whitespace-nowrap",
                    region === item.key
                      ? "bg-black text-white"
                      : "text-black/65 hover:text-black hover:bg-black/5",
                  ].join(" ")}
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>

          {/* CENTER */}
          <div className="min-w-0 text-center md:flex-1">
            <Link
              href="/"
              className="inline-flex max-w-full items-center justify-center cursor-pointer"
            >
              <Image
                src="/logo-lioneto.png"
                alt="Lioneto"
                width={265}
                height={45}
                priority
                className="h-auto max-w-[78vw] transition-transform duration-300 hover:scale-[1.03] md:max-w-[265px]"
              />
            </Link>

            {/* MOBILE DEALER LINK */}
            <div className="mt-4 flex min-w-0 max-w-full items-center justify-between gap-3 overflow-hidden md:hidden">
              <DealerLink />

              <div className="flex shrink-0 items-center gap-1">
                <IconBtn
                  label={tt("header.ariaAccount", "Кабинет")}
                  href={accountHref}
                >
                  <User className="h-5 w-5" />
                </IconBtn>

                <div className="relative shrink-0">
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

                <div className="relative shrink-0">
                  <IconBtn
                    label={tt("header.ariaCart", "Корзина")}
                    href="/cart"
                  >
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

          {/* RIGHT DESKTOP */}
          <div className="hidden md:flex md:w-[360px] flex-nowrap items-center justify-end gap-3">
            <DealerLink />

            <span className="inline-block h-4 w-px bg-black/10" />

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

            <div className="relative shrink-0">
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

            <div className="relative shrink-0">
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
