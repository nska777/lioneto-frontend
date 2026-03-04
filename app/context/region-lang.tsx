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
  return v === "ru" || v === "uz";
}
function isLang(v: string | null): v is Lang {
  return v === "ru" || v === "uz";
}

async function detectRegionFromCloudflare(): Promise<Region | null> {
  try {
    const res = await fetch("/api/geo", { cache: "no-store" });
    if (!res.ok) return null;

    const data: unknown = await res.json();
    if (!data || typeof data !== "object") return null;

    const region = (data as Record<string, unknown>).region;
    return region === "ru" || region === "uz" ? region : null;
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
    const manual = getCookie("region_manual");

    // Язык
    setLangState(isLang(l) ? l : "ru");

    // Если юзер выбирал руками — закрепляем его выбор
    if (manual === "1") {
      setRegionState(isRegion(r) ? r : "uz");
      return;
    }

    // Если регион уже есть в cookie — применяем и не дергаем авто
    if (isRegion(r)) {
      setRegionState(r);
      return;
    }

    // Иначе: авто-определение по Cloudflare (RU => ru, иначе uz)
    let cancelled = false;
    (async () => {
      const detected = await detectRegionFromCloudflare();
      if (cancelled) return;

      const next: Region = detected ?? "uz";
      setRegionState(next);
      setCookie("region", next);
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const setRegion = (r: Region) => {
    setRegionState(r);
    setCookie("region", r);
    setCookie("region_manual", "1"); // ручной выбор — приоритет
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
