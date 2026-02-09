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

    const nextRegion: Region = r === "ru" ? "ru" : "uz";
    const nextLang: Lang = l === "uz" ? "uz" : "ru";

    setRegionState(nextRegion);
    setLangState(nextLang);
  }, []);

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
