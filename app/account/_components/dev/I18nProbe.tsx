"use client";

import React from "react";
import { useRegionLang } from "@/app/context/region-lang";
import { getDict, t as tByKey } from "@/i18n";

export default function I18nProbe() {
  const { lang, region } = useRegionLang();
  const dict = getDict(lang);

  return (
    <div className="fixed bottom-3 left-3 z-[9999] rounded-xl border border-black/10 bg-white/90 px-3 py-2 text-[12px] text-black shadow-sm backdrop-blur">
      <div className="font-medium">i18n probe</div>
      <div className="opacity-70">
        lang: {lang} · region: {region}
      </div>

      <div className="mt-2 space-y-1">
        <div>
          <span className="opacity-60">header.catalog:</span>{" "}
          <b>{tByKey(dict, "header.top.catalog")}</b>
        </div>
        <div>
          <span className="opacity-60">auth.login:</span>{" "}
          <b>{tByKey(dict, "common.inDev")}</b>
        </div>
        <div>
          <span className="opacity-60">common.chooseRegion:</span>{" "}
          <b>{tByKey(dict, "header.pickRegion")}</b>
        </div>
      </div>
    </div>
  );
}
