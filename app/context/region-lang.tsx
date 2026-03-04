"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Region = "uz" | "ru"; // Узбекистан / Россия
type Lang = "ru" | "uz"; // язык интерфейса

type Ctx = {
  region: Region;
  setRegion: (r: Region) => void;
  lang: Lang;
  setLang: (l: Lang) => void;
};

const RegionLangContext = createContext<Ctx | null>(null);

function getCookie(name: string) {
  if (typeof document === "undefined") return null;
  const m = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return m ? decodeURIComponent(m[2]) : null;
}

function setCookie(name: string, value: string, days = 365) {
  if (typeof document === "undefined") return;
  const d = new Date();
  d.setTime(d.getTime() + days * 24 * 60 * 60 * 1000);
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${d.toUTCString()}; path=/`;
}

function isRegion(v: string | null): v is Region {
  return v === "uz" || v === "ru";
}
function isLang(v: string | null): v is Lang {
  return v === "ru" || v === "uz";
}

/**
 * Авто-детект региона по IP (только если нет cookie region).
 * Если определение не получилось — вернём null (оставим дефолт "uz").
 */
async function detectRegionByIp(): Promise<Region | null> {
  try {
    // ipwho.is — простой public geoip. Можно заменить на другой сервис или Cloudflare later.
    const res = await fetch("https://ipwho.is/", { cache: "no-store" });
    if (!res.ok) return null;

    const data: unknown = await res.json();
    if (!data || typeof data !== "object") return null;

    const cc = (data as Record<string, unknown>).country_code;
    if (typeof cc !== "string") return null;

    const code = cc.toUpperCase();
    return code === "RU" ? "ru" : "uz";
  } catch {
    return null;
  }
}

export function RegionLangProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [region, setRegionState] = useState<Region>("uz");
  const [lang, setLangState] = useState<Lang>("ru");

  useEffect(() => {
    const r = getCookie("region");
    const l = getCookie("lang");

    // 1) Всегда восстанавливаем язык из cookie (если есть)
    const nextLang: Lang = isLang(l) ? l : "ru";
    setLangState(nextLang);

    // 2) Если регион уже выбран пользователем (cookie есть) — просто применяем
    if (isRegion(r)) {
      setRegionState(r);
      return;
    }

    // 3) Если cookie region нет — пробуем определить по IP и один раз сохранить
    let cancelled = false;

    (async () => {
      const detected = await detectRegionByIp();
      if (cancelled) return;

      const nextRegion: Region = detected ?? "uz";
      setRegionState(nextRegion);
      setCookie("region", nextRegion);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  // РУЧНОЙ выбор региона — это приоритет, просто ставим cookie
  const setRegion = (r: Region) => {
    setRegionState(r);
    setCookie("region", r);
  };

  const setLang = (l: Lang) => {
    setLangState(l);
    setCookie("lang", l);
  };

  const value = useMemo(
    () => ({ region, setRegion, lang, setLang }),
    [region, lang],
  );

  return (
    <RegionLangContext.Provider value={value}>
      {children}
    </RegionLangContext.Provider>
  );
}

export function useRegionLang() {
  const ctx = useContext(RegionLangContext);
  if (!ctx)
    throw new Error("useRegionLang must be used within RegionLangProvider");
  return ctx;
}
