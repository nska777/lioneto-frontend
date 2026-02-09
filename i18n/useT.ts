"use client";

import { useMemo } from "react";
import { useRegionLang } from "../app/context/region-lang";
import { getDict, t } from "./index";

export function useT() {
  const { lang } = useRegionLang();
  const dict = useMemo(() => getDict(lang as any), [lang]);

  return {
    lang,
    t: (key: string) => t(dict, key),
  };
}
