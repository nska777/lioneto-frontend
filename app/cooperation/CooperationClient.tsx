"use client";

import React, {
  useMemo,
  useRef,
  useState,
  useEffect,
  type SyntheticEvent,
} from "react";
import { createPortal } from "react-dom";
import { useSearchParams } from "next/navigation";
import {
  Store,
  Palette,
  Truck,
  Package,
  Globe,
  Trash2,
  ArrowDown,
  Send,
  Download,
  X,
} from "lucide-react";

type ContactMethod = "call" | "max" | "whatsapp" | "telegram";
type Region = "UZ" | "RU" | "KZ";
type PrivacyConsent = "accepted" | "declined" | null;

type Chip = {
  id: string;
  title: string;
  icon: React.ReactNode;
};

function cn(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

const BENEFITS = [
  "РћС„РёС†РёР°Р»СЊРЅРѕ Рё РїСЂРѕР·СЂР°С‡РЅРѕ",
  "РџСЂР°Р№СЃС‹ Рё СѓСЃР»РѕРІРёСЏ",
  "РџРѕРґРґРµСЂР¶РєР° РґРёР»РµСЂРѕРІ",
  "РЎСЂРѕРє РѕС‚РІРµС‚Р° 1вЂ“2 С‡Р°СЃР°",
] as const;

const FORMATS: Chip[] = [
  {
    id: "dealer",
    title: "Р”РёР»РµСЂ / РЎС‚Р°С‚СЊ РґРёР»РµСЂРѕРј",
    icon: <Store className="h-4 w-4" />,
  },
  {
    id: "designer",
    title:
      "РЈСЃР»СѓРіРё РґРёР·Р°Р№РЅРµСЂР° / Р¤РѕС‚РѕРєРѕРЅС‚РµРЅС‚ (3D РјРѕРґРµР»РёСЂРѕРІР°РЅРёРµ)",
    icon: <Palette className="h-4 w-4" />,
  },
  {
    id: "logistics",
    title: "РџР°СЂС‚РЅС‘СЂ РїРѕ Р»РѕРіРёСЃС‚РёРєРµ/РґРѕСЃС‚Р°РІРєРµ",
    icon: <Truck className="h-4 w-4" />,
  },
  {
    id: "supplier",
    title: "РџРѕСЃС‚Р°РІС‰РёРє РјР°С‚РµСЂРёР°Р»РѕРІ/СЃС‹СЂСЊСЏ",
    icon: <Package className="h-4 w-4" />,
  },
  {
    id: "export",
    title: "Р­РєСЃРїРѕСЂС‚ / РѕРїС‚РѕРІС‹Рµ Р·Р°РєСѓРїРєРё",
    icon: <Globe className="h-4 w-4" />,
  },
];

function PrivacyPolicyWindow({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  if (!open || typeof document === "undefined") return null;

  const stopAll = (e: SyntheticEvent) => {
    e.stopPropagation();
  };

  return createPortal(
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/55 px-4 py-6"
      onClick={stopAll}
      onMouseDown={stopAll}
      onPointerDown={stopAll}
      onTouchStart={stopAll}
    >
      <div
        className="relative flex max-h-[90vh] w-full max-w-[920px] flex-col overflow-hidden rounded-[28px] bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        onTouchStart={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-5 border-b border-black/10 px-5 py-5 sm:px-7">
          <div>
            <p className="text-[12px] uppercase tracking-[0.22em] text-black/45">
              LIONETO
            </p>

            <h2 className="mt-2 text-[20px] font-semibold leading-tight text-black sm:text-[24px]">
              РџРѕР»РёС‚РёРєР° РѕР±СЂР°Р±РѕС‚РєРё РїРµСЂСЃРѕРЅР°Р»СЊРЅС‹С…
              РґР°РЅРЅС‹С…
            </h2>

            <p className="mt-2 text-[13px] leading-6 text-black/55">
              РЎРѕРіР»Р°СЃРёРµ РЅР° РѕР±СЂР°Р±РѕС‚РєСѓ РїРµСЂСЃРѕРЅР°Р»СЊРЅС‹С…
              РґР°РЅРЅС‹С… Рё РёСЃРїРѕР»СЊР·РѕРІР°РЅРёРµ С„Р°Р№Р»РѕРІ cookie.
            </p>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onClose();
            }}
            className="shrink-0 cursor-pointer rounded-full p-2 text-black/45 transition hover:bg-black/5 hover:text-black"
            aria-label="Р—Р°РєСЂС‹С‚СЊ"
          >
            <X size={22} />
          </button>
        </div>

        <div
          className="overflow-y-auto px-5 py-6 text-[14px] leading-7 text-black/70 sm:px-7"
          onClick={(e) => e.stopPropagation()}
          onMouseDown={(e) => e.stopPropagation()}
          onPointerDown={(e) => e.stopPropagation()}
          onTouchStart={(e) => e.stopPropagation()}
        >
          <div className="mb-6 rounded-[22px] bg-black/[0.03] px-5 py-4">
            <h3 className="text-[18px] font-semibold leading-tight text-black">
              РџРѕР»РёС‚РёРєР° РѕР±СЂР°Р±РѕС‚РєРё РїРµСЂСЃРѕРЅР°Р»СЊРЅС‹С…
              РґР°РЅРЅС‹С… Рё РёСЃРїРѕР»СЊР·РѕРІР°РЅРёСЏ Cookies
            </h3>

            <p className="mt-2 text-[13px] leading-6 text-black/55">
              РќР°СЃС‚РѕСЏС‰РёР№ РґРѕРєСѓРјРµРЅС‚ РѕРїСЂРµРґРµР»СЏРµС‚
              РїРѕСЂСЏРґРѕРє РѕР±СЂР°Р±РѕС‚РєРё РїРµСЂСЃРѕРЅР°Р»СЊРЅС‹С…
              РґР°РЅРЅС‹С… РџРѕР»СЊР·РѕРІР°С‚РµР»РµР№ СЃР°Р№С‚Р°, Р° С‚Р°РєР¶Рµ
              СѓСЃР»РѕРІРёСЏ РёСЃРїРѕР»СЊР·РѕРІР°РЅРёСЏ С„Р°Р№Р»РѕРІ cookie.
            </p>
          </div>

          <section className="space-y-4">
            <h3 className="text-[17px] font-semibold text-black">
              1. РЎРѕРіР»Р°СЃРёРµ РЅР° РѕР±СЂР°Р±РѕС‚РєСѓ
              РїРµСЂСЃРѕРЅР°Р»СЊРЅС‹С… РґР°РЅРЅС‹С…
            </h3>

            <p>
              РќР°СЃС‚РѕСЏС‰РёРј РџРѕР»СЊР·РѕРІР°С‚РµР»СЊ РґР°РµС‚
              СЃРѕРіР»Р°СЃРёРµ РћРћРћ В«РљРѕРјС„РѕСЂС‚ РїР»СЋСЃВ» РЅР°
              РѕР±СЂР°Р±РѕС‚РєСѓ РІСЃРµС… СѓРєР°Р·Р°РЅРЅС‹С… РёРј
              РїРµСЂСЃРѕРЅР°Р»СЊРЅС‹С… РґР°РЅРЅС‹С…, РІРєР»СЋС‡Р°СЏ, РЅРѕ РЅРµ
              РѕРіСЂР°РЅРёС‡РёРІР°СЏСЃСЊ СЃР»РµРґСѓСЋС‰РёРјРё
              СЃРІРµРґРµРЅРёСЏРјРё:
            </p>

            <ul className="list-disc space-y-2 pl-6">
              <li>С„Р°РјРёР»РёСЏ, РёРјСЏ Рё РѕС‚С‡РµСЃС‚РІРѕ;</li>
              <li>РЅРѕРјРµСЂ С‚РµР»РµС„РѕРЅР°;</li>
              <li>РіСЂР°Р¶РґР°РЅСЃС‚РІРѕ;</li>
              <li>РїРѕР»;</li>
              <li>РІРѕР·СЂР°СЃС‚;</li>
              <li>РґР°С‚Р° Рё РјРµСЃС‚Рѕ СЂРѕР¶РґРµРЅРёСЏ;</li>
              <li>
                СЃРµСЂРёСЏ Рё РЅРѕРјРµСЂ РѕСЃРЅРѕРІРЅРѕРіРѕ РґРѕРєСѓРјРµРЅС‚Р°,
                СѓРґРѕСЃС‚РѕРІРµСЂСЏСЋС‰РµРіРѕ Р»РёС‡РЅРѕСЃС‚СЊ,
                СЃРІРµРґРµРЅРёСЏ Рѕ РґР°С‚Рµ РІС‹РґР°С‡Рё СѓРєР°Р·Р°РЅРЅРѕРіРѕ
                РґРѕРєСѓРјРµРЅС‚Р° Рё РІС‹РґР°РІС€РµРј РµРіРѕ РѕСЂРіР°РЅРµ;
              </li>
              <li>
                Р°РґСЂРµСЃ СЂРµРіРёСЃС‚СЂР°С†РёРё РїРѕ РјРµСЃС‚Сѓ
                Р¶РёС‚РµР»СЊСЃС‚РІР°;
              </li>
              <li>Р°РґСЂРµСЃ С„Р°РєС‚РёС‡РµСЃРєРѕРіРѕ РїСЂРѕР¶РёРІР°РЅРёСЏ;</li>
              <li>
                РёРґРµРЅС‚РёС„РёРєР°С†РёРѕРЅРЅС‹Р№ РЅРѕРјРµСЂ
                РЅР°Р»РѕРіРѕРїР»Р°С‚РµР»СЊС‰РёРєР°;
              </li>
              <li>
                СЃС‚СЂР°С…РѕРІРѕР№ РЅРѕРјРµСЂ РёРЅРґРёРІРёРґСѓР°Р»СЊРЅРѕРіРѕ
                Р»РёС†РµРІРѕРіРѕ СЃС‡РµС‚Р°;
              </li>
              <li>Р°РґСЂРµСЃ СЌР»РµРєС‚СЂРѕРЅРЅРѕР№ РїРѕС‡С‚С‹;</li>
              <li>
                Р°РґСЂРµСЃ РґРѕСЃС‚Р°РІРєРё Рё РјРµСЃС‚РѕРїРѕР»РѕР¶РµРЅРёРµ;
              </li>
              <li>
                РёРЅС„РѕСЂРјР°С†РёСЏ РѕР± РёР·Р±СЂР°РЅРЅС‹С… РєРѕРЅС‚Р°РєС‚Р°С…;
              </li>
              <li>
                Р»СЋР±Р°СЏ РґСЂСѓРіР°СЏ РёРЅС„РѕСЂРјР°С†РёСЏ,
                РїРµСЂРµРґР°РІР°РµРјР°СЏ РїРѕСЃСЂРµРґСЃС‚РІРѕРј cookies
                СЃР°Р№С‚Р°;
              </li>
              <li>
                РёРЅС‹Рµ РґР°РЅРЅС‹Рµ, РїРѕР»СѓС‡РµРЅРЅС‹Рµ РІ
                СЂРµР·СѓР»СЊС‚Р°С‚Рµ РёС… РѕР±СЂР°Р±РѕС‚РєРё Р»СЋР±С‹РјРё
                СЃРїРѕСЃРѕР±Р°РјРё, РІРєР»СЋС‡Р°СЏ
                РІРѕСЃРїСЂРѕРёР·РІРµРґРµРЅРёРµ, СЌР»РµРєС‚СЂРѕРЅРЅРѕРµ
                РєРѕРїРёСЂРѕРІР°РЅРёРµ, РѕР±РµР·Р»РёС‡РёРІР°РЅРёРµ,
                Р±Р»РѕРєРёСЂРѕРІР°РЅРёРµ Рё СѓРЅРёС‡С‚РѕР¶РµРЅРёРµ.
              </li>
            </ul>
          </section>

          <section className="mt-8 space-y-4">
            <h3 className="text-[17px] font-semibold text-black">
              2. Р¦РµР»Рё РѕР±СЂР°Р±РѕС‚РєРё РїРµСЂСЃРѕРЅР°Р»СЊРЅС‹С…
              РґР°РЅРЅС‹С…
            </h3>

            <p>
              РћР±СЂР°Р±РѕС‚РєР° РїРµСЂСЃРѕРЅР°Р»СЊРЅС‹С… РґР°РЅРЅС‹С…
              РјРѕР¶РµС‚ РѕСЃСѓС‰РµСЃС‚РІР»СЏС‚СЊСЃСЏ РћР±С‰РµСЃС‚РІРѕРј, Р°
              С‚Р°РєР¶Рµ С‚СЂРµС‚СЊРёРјРё Р»РёС†Р°РјРё, РґРµР№СЃС‚РІСѓСЋС‰РёРјРё
              РїРѕ РїРѕСЂСѓС‡РµРЅРёСЋ РћР±С‰РµСЃС‚РІР°, РІ СЃР»РµРґСѓСЋС‰РёС…
              С†РµР»СЏС…:
            </p>

            <ul className="list-disc space-y-2 pl-6">
              <li>
                РѕР±РµСЃРїРµС‡РµРЅРёРµ РёРЅС„РѕСЂРјР°С†РёРѕРЅРЅРѕР№
                РїРѕРґРґРµСЂР¶РєРё РџРѕР»СЊР·РѕРІР°С‚РµР»СЏ;
              </li>
              <li>
                РѕРєР°Р·Р°РЅРёРµ СѓСЃР»СѓРі, СЃРІСЏР·Р°РЅРЅС‹С… СЃ
                РґРµСЏС‚РµР»СЊРЅРѕСЃС‚СЊСЋ РћР±С‰РµСЃС‚РІР°;
              </li>
              <li>
                СЃРѕР·РґР°РЅРёРµ Рё СЃРѕРїСЂРѕРІРѕР¶РґРµРЅРёРµ
                РёРЅС„РѕСЂРјР°С†РёРѕРЅРЅС‹С… СЃРёСЃС‚РµРј
                РїРµСЂСЃРѕРЅР°Р»СЊРЅС‹С… РґР°РЅРЅС‹С… РћР±С‰РµСЃС‚РІР°;
              </li>
              <li>
                РЅР°РїСЂР°РІР»РµРЅРёРµ РџРѕР»СЊР·РѕРІР°С‚РµР»СЋ
                СЂРµРєР»Р°РјРЅС‹С… РјР°С‚РµСЂРёР°Р»РѕРІ, РёРЅС„РѕСЂРјР°С†РёРё,
                СѓРІРµРґРѕРјР»РµРЅРёР№ Рё Р·Р°РїСЂРѕСЃРѕРІ, РІ С‚РѕРј С‡РёСЃР»Рµ
                РїРѕСЃСЂРµРґСЃС‚РІРѕРј СЃРµС‚Рё РРЅС‚РµСЂРЅРµС‚ Рё
                С‚РµР»РµС„РѕРЅРЅРѕР№ СЃРІСЏР·Рё;
              </li>
              <li>
                РѕР±РµСЃРїРµС‡РµРЅРёРµ РёРЅС‚РµСЂРµСЃРѕРІ РћР±С‰РµСЃС‚РІР° Рё
                РџРѕР»СЊР·РѕРІР°С‚РµР»СЏ, Р° С‚Р°РєР¶Рµ РІ РёРЅС‹С… С†РµР»СЏС…,
                РїСЂСЏРјРѕ РёР»Рё РєРѕСЃРІРµРЅРЅРѕ СЃРІСЏР·Р°РЅРЅС‹С… СЃ
                РѕР±СЃР»СѓР¶РёРІР°РЅРёРµРј Рё РїСЂРµРґР»РѕР¶РµРЅРёРµРј
                РїСЂРѕРґСѓРєС‚РѕРІ РћР±С‰РµСЃС‚РІР°.
              </li>
            </ul>
          </section>

          <section className="mt-8 space-y-4">
            <h3 className="text-[17px] font-semibold text-black">
              3. РћРїРµСЂР°С‚РѕСЂ РїРµСЂСЃРѕРЅР°Р»СЊРЅС‹С… РґР°РЅРЅС‹С…
            </h3>

            <div className="rounded-[22px] bg-black/[0.03] p-4 text-black/70">
              <p className="font-semibold text-black">
                РћРћРћ В«РљРѕРјС„РѕСЂС‚ РїР»СЋСЃВ»
              </p>
              <p>
                РРќРќ 9721264165 / РљРџРџ 772101001 / РћР“Р Рќ 1267700104352
              </p>
              <p>
                109443, Рі. РњРѕСЃРєРІР°, РІРЅ. С‚РµСЂ. Рі.
                РјСѓРЅРёС†РёРїР°Р»СЊРЅС‹Р№ РѕРєСЂСѓРі РљСѓР·СЊРјРёРЅРєРё,
                РїСЂ-РєС‚ Р’РѕР»РіРѕРіСЂР°РґСЃРєРёР№, Рґ. 135 Рє. 3, РїРѕРјРµС‰.
                7Рњ
              </p>
            </div>

            <p>
              РЈРєР°Р·Р°РЅРЅРѕРµ СЃРѕРіР»Р°СЃРёРµ РїСЂРµРґРѕСЃС‚Р°РІР»СЏРµС‚СЃСЏ
              СЃСЂРѕРєРѕРј РЅР° 5 Р»РµС‚. Р’ СЃР»СѓС‡Р°Рµ РѕС‚Р·С‹РІР°
              СЃРѕРіР»Р°СЃРёСЏ РѕР±СЂР°Р±РѕС‚РєР° РїРµСЂСЃРѕРЅР°Р»СЊРЅС‹С…
              РґР°РЅРЅС‹С… РґРѕР»Р¶РЅР° Р±С‹С‚СЊ РїСЂРµРєСЂР°С‰РµРЅР°
              РћР±С‰РµСЃС‚РІРѕРј Рё/РёР»Рё С‚СЂРµС‚СЊРёРјРё Р»РёС†Р°РјРё, Р°
              РїРµСЂСЃРѕРЅР°Р»СЊРЅС‹Рµ РґР°РЅРЅС‹Рµ РїРѕРґР»РµР¶Р°С‚
              СѓРЅРёС‡С‚РѕР¶РµРЅРёСЋ РІ СѓСЃС‚Р°РЅРѕРІР»РµРЅРЅРѕРј
              РїРѕСЂСЏРґРєРµ.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h3 className="text-[17px] font-semibold text-black">
              4. РџСЂР°РІРёР»Р° РёСЃРїРѕР»СЊР·РѕРІР°РЅРёСЏ
              РїРµСЂСЃРѕРЅР°Р»СЊРЅС‹С… РґР°РЅРЅС‹С…
            </h3>

            <p>
              РЎРѕР±РёСЂР°РµРјС‹Рµ РїРµСЂСЃРѕРЅР°Р»СЊРЅС‹Рµ РґР°РЅРЅС‹Рµ
              РїРѕР·РІРѕР»СЏСЋС‚ РЅР°РїСЂР°РІР»СЏС‚СЊ РџРѕР»СЊР·РѕРІР°С‚РµР»СЏРј
              СѓРІРµРґРѕРјР»РµРЅРёСЏ Рѕ РЅРѕРІС‹С… РїСЂРѕРґСѓРєС‚Р°С…,
              СЃРїРµС†РёР°Р»СЊРЅС‹С… РїСЂРµРґР»РѕР¶РµРЅРёСЏС… Рё
              СЂР°Р·Р»РёС‡РЅС‹С… СЃРѕР±С‹С‚РёСЏС…. РћРЅРё С‚Р°РєР¶Рµ
              РїРѕРјРѕРіР°СЋС‚ РћР±С‰РµСЃС‚РІСѓ СЃРѕРІРµСЂС€РµРЅСЃС‚РІРѕРІР°С‚СЊ
              СѓСЃР»СѓРіРё, РєРѕРЅС‚РµРЅС‚ Рё РєРѕРјРјСѓРЅРёРєР°С†РёРё.
            </p>

            <p>
              Р’ СЃР»СѓС‡Р°Рµ РЅРµР¶РµР»Р°РЅРёСЏ РїРѕР»СѓС‡Р°С‚СЊ
              СЂР°СЃСЃС‹Р»РєСѓ РџРѕР»СЊР·РѕРІР°С‚РµР»СЊ РјРѕР¶РµС‚ РІ Р»СЋР±РѕРµ
              РІСЂРµРјСЏ РѕС‚РєР°Р·Р°С‚СЊСЃСЏ РѕС‚ РЅРµРµ РїСѓС‚РµРј
              РЅР°РїСЂР°РІР»РµРЅРёСЏ РїРёСЃСЊРјРµРЅРЅРѕРіРѕ
              СѓРІРµРґРѕРјР»РµРЅРёСЏ РЅР° СЌР»РµРєС‚СЂРѕРЅРЅС‹Р№ Р°РґСЂРµСЃ{" "}
              <a
                href="mailto:info@lioneto.uz"
                className="cursor-pointer font-medium text-black underline underline-offset-4"
              >
                info@lioneto.uz
              </a>
              .
            </p>

            <p>
              РћР±С‰РµСЃС‚РІРѕ РјРѕР¶РµС‚ РёСЃРїРѕР»СЊР·РѕРІР°С‚СЊ
              РїРµСЂСЃРѕРЅР°Р»СЊРЅС‹Рµ РґР°РЅРЅС‹Рµ РџРѕР»СЊР·РѕРІР°С‚РµР»СЏ
              РґР»СЏ РѕС‚РїСЂР°РІРєРё РІР°Р¶РЅС‹С… СѓРІРµРґРѕРјР»РµРЅРёР№,
              СЃРѕРґРµСЂР¶Р°С‰РёС… РёРЅС„РѕСЂРјР°С†РёСЋ РѕР±
              РёР·РјРµРЅРµРЅРёСЏС… РїРѕР»РѕР¶РµРЅРёР№, СѓСЃР»РѕРІРёР№ Рё
              РїРѕР»РёС‚РёРє, Р° С‚Р°РєР¶Рµ СѓРІРµРґРѕРјР»РµРЅРёР№,
              СЃРІСЏР·Р°РЅРЅС‹С… СЃ СЂР°Р·РјРµС‰РµРЅРЅС‹РјРё Р·Р°РєР°Р·Р°РјРё Рё
              СЃРѕРІРµСЂС€РµРЅРЅС‹РјРё РїРѕРєСѓРїРєР°РјРё.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h3 className="text-[17px] font-semibold text-black">
              5. РЎРѕРіР»Р°СЃРёРµ РЅР° РёСЃРїРѕР»СЊР·РѕРІР°РЅРёРµ Cookies
            </h3>

            <p>
              РЎР°Р№С‚ РёСЃРїРѕР»СЊР·СѓРµС‚ С„Р°Р№Р»С‹ cookies РґР»СЏ
              РєРѕСЂСЂРµРєС‚РЅРѕР№ СЂР°Р±РѕС‚С‹, СЃРѕС…СЂР°РЅРµРЅРёСЏ
              РїРѕР»СЊР·РѕРІР°С‚РµР»СЊСЃРєРёС… РЅР°СЃС‚СЂРѕРµРє,
              РѕС‚РѕР±СЂР°Р¶РµРЅРёСЏ Р°РєС‚СѓР°Р»СЊРЅС‹С… С‚РѕРІР°СЂРѕРІ,
              С†РµРЅ, Р°РєС†РёР№ Рё СѓР»СѓС‡С€РµРЅРёСЏ
              РїРѕР»СЊР·РѕРІР°С‚РµР»СЊСЃРєРѕРіРѕ РѕРїС‹С‚Р°.
            </p>

            <p>
              Cookies вЂ” СЌС‚Рѕ РЅРµР±РѕР»СЊС€РёРµ С„Р°Р№Р»С‹, РєРѕС‚РѕСЂС‹Рµ
              Р±СЂР°СѓР·РµСЂ СЃРѕС…СЂР°РЅСЏРµС‚ РЅР° СѓСЃС‚СЂРѕР№СЃС‚РІРµ
              РџРѕР»СЊР·РѕРІР°С‚РµР»СЏ. РћРЅРё РїРѕР·РІРѕР»СЏСЋС‚ СЃР°Р№С‚Сѓ
              СѓР·РЅР°РІР°С‚СЊ РџРѕР»СЊР·РѕРІР°С‚РµР»СЏ РїСЂРё
              РїРѕРІС‚РѕСЂРЅРѕРј РїРѕСЃРµС‰РµРЅРёРё Рё СѓС‡РёС‚С‹РІР°С‚СЊ
              СЂР°РЅРµРµ РІС‹Р±СЂР°РЅРЅС‹Рµ РЅР°СЃС‚СЂРѕР№РєРё.
            </p>

            <p>
              РџРѕР»СЊР·РѕРІР°С‚РµР»СЊ РјРѕР¶РµС‚ РѕС‚РєР°Р·Р°С‚СЊСЃСЏ РѕС‚
              РїРµСЂСЃРѕРЅР°Р»РёР·Р°С†РёРё, Р·Р°РїСЂРµС‚РёРІ
              СЃРѕС…СЂР°РЅРµРЅРёРµ cookies РІ РЅР°СЃС‚СЂРѕР№РєР°С… СЃРІРѕРµРіРѕ
              Р±СЂР°СѓР·РµСЂР°. Р’ С‚Р°РєРѕРј СЃР»СѓС‡Р°Рµ РѕС‚РґРµР»СЊРЅС‹Рµ
              С„СѓРЅРєС†РёРё СЃР°Р№С‚Р° РјРѕРіСѓС‚ СЂР°Р±РѕС‚Р°С‚СЊ
              РѕРіСЂР°РЅРёС‡РµРЅРЅРѕ.
            </p>
          </section>

          <section className="mt-8 space-y-4">
            <h3 className="text-[17px] font-semibold text-black">
              6. РџРѕР»РёС‚РёРєР° РёСЃРїРѕР»СЊР·РѕРІР°РЅРёСЏ Cookies
            </h3>

            <p>
              РџРѕР»СЊР·РѕРІР°С‚РµР»СЊ СЃР°Р№С‚Р° РїРѕРґС‚РІРµСЂР¶РґР°РµС‚,
              С‡С‚Рѕ СЃРѕРіР»Р°СЃРµРЅ РЅР° РёСЃРїРѕР»СЊР·РѕРІР°РЅРёРµ
              С„Р°Р№Р»РѕРІ cookie Рё РѕР·РЅР°РєРѕРјР»РµРЅ СЃ РЅР°СЃС‚РѕСЏС‰РµР№
              РїРѕР»РёС‚РёРєРѕР№.
            </p>

            <p>
              Р¤Р°Р№Р»С‹ cookie РЅРµ РЅРµСЃСѓС‚ СѓРіСЂРѕР·С‹
              Р±РµР·РѕРїР°СЃРЅРѕСЃС‚Рё РґР°РЅРЅС‹Рј РџРѕР»СЊР·РѕРІР°С‚РµР»СЏ.
              РџРѕРјРёРјРѕ СЃРѕС…СЂР°РЅРµРЅРёСЏ РїРµСЂСЃРѕРЅР°Р»СЊРЅС‹С…
              РЅР°СЃС‚СЂРѕРµРє Рё РїСЂРµРґРїРѕС‡С‚РµРЅРёР№ РѕРЅРё
              РёСЃРїРѕР»СЊР·СѓСЋС‚СЃСЏ РґР»СЏ:
            </p>

            <ul className="list-disc space-y-2 pl-6">
              <li>
                СЃРѕРІРµСЂС€РµРЅСЃС‚РІРѕРІР°РЅРёСЏ РїСЂРѕРґСѓРєС‚РѕРІ Рё
                СѓСЃР»СѓРі;
              </li>
              <li>
                РїСЂРµРґРѕСЃС‚Р°РІР»РµРЅРёСЏ Р±РѕР»РµРµ С‚РѕС‡РЅРѕР№
                РёРЅС„РѕСЂРјР°С†РёРё РїРѕ Р·Р°РїСЂРѕСЃСѓ РїРѕСЃРµС‚РёС‚РµР»СЏ;
              </li>
              <li>
                РєРѕСЂСЂРµРєС‚РЅРѕР№ СЂР°Р±РѕС‚С‹ РєРѕРјРїРѕРЅРµРЅС‚РѕРІ
                СЃР°Р№С‚Р°, РІРµР±-СЃС‚СЂР°РЅРёС† Рё РЅР°РІРёРіР°С†РёРё;
              </li>
              <li>
                РїРѕРґР±РѕСЂР° РїРµСЂСЃРѕРЅР°Р»СЊРЅС‹С… РїСЂРµРґР»РѕР¶РµРЅРёР№;
              </li>
              <li>
                СЃР±РѕСЂР° СЃС‚Р°С‚РёСЃС‚РёС‡РµСЃРєРёС… РґР°РЅРЅС‹С… СЃР°Р№С‚Р°.
              </li>
            </ul>

            <p>
              РЎСЂРѕРє С…СЂР°РЅРµРЅРёСЏ cookie-С„Р°Р№Р»РѕРІ Р·Р°РІРёСЃРёС‚ РѕС‚
              РёС… С‚РёРїР°:
            </p>

            <ul className="list-disc space-y-2 pl-6">
              <li>
                СЃРµР°РЅСЃРѕРІС‹Рµ вЂ” СѓРґР°Р»СЏСЋС‚СЃСЏ РїСЂРё
                Р·Р°РєСЂС‹С‚РёРё Р±СЂР°СѓР·РµСЂР°;
              </li>
              <li>
                РїРѕСЃС‚РѕСЏРЅРЅС‹Рµ вЂ” СЃРѕС…СЂР°РЅСЏСЋС‚СЃСЏ
                РїСЂРѕРґРѕР»Р¶РёС‚РµР»СЊРЅРѕРµ РІСЂРµРјСЏ РґР»СЏ
                РїРѕРІС‚РѕСЂРЅРѕРіРѕ РёСЃРїРѕР»СЊР·РѕРІР°РЅРёСЏ СЃР°Р№С‚Р°;
              </li>
              <li>
                СЃС‚Р°С‚РёСЃС‚РёС‡РµСЃРєРёРµ вЂ” СЃРѕРґРµСЂР¶Р°С‚
                РёРЅС„РѕСЂРјР°С†РёСЋ Рѕ РґРµР№СЃС‚РІРёСЏС… РїРѕСЃРµС‚РёС‚РµР»СЏ
                РЅР° СЃР°Р№С‚Рµ;
              </li>
              <li>
                РѕР±СЏР·Р°С‚РµР»СЊРЅС‹Рµ вЂ” РЅРµРѕР±С…РѕРґРёРјС‹ РґР»СЏ
                РєРѕСЂСЂРµРєС‚РЅРѕР№ СЂР°Р±РѕС‚С‹ СЃР°Р№С‚Р°.
              </li>
            </ul>

            <p>
              РќР°СЃС‚РѕСЏС‰Р°СЏ РїРѕР»РёС‚РёРєР° РїСЂРµРґСѓСЃРјР°С‚СЂРёРІР°РµС‚
              РѕР±СЏР·Р°С‚РµР»СЊСЃС‚РІР° РћР±С‰РµСЃС‚РІР° РїРѕ
              РЅРµСЂР°Р·РіР»Р°С€РµРЅРёСЋ Рё РѕР±РµСЃРїРµС‡РµРЅРёСЋ Р·Р°С‰РёС‚С‹
              РєРѕРЅС„РёРґРµРЅС†РёР°Р»СЊРЅРѕСЃС‚Рё РґР°РЅРЅС‹С…
              РїРѕСЃРµС‚РёС‚РµР»РµР№ СЃР°Р№С‚Р°.
            </p>

            <p>
              РћРћРћ В«РљРѕРјС„РѕСЂС‚ РїР»СЋСЃВ» РѕСЃС‚Р°РІР»СЏРµС‚ Р·Р°
              СЃРѕР±РѕР№ РїСЂР°РІРѕ РІРЅРѕСЃРёС‚СЊ РёР·РјРµРЅРµРЅРёСЏ РІ
              РЅР°СЃС‚РѕСЏС‰СѓСЋ РџРѕР»РёС‚РёРєСѓ РїСѓС‚РµРј
              СЂР°Р·РјРµС‰РµРЅРёСЏ РѕР±РЅРѕРІР»РµРЅРЅРѕР№ СЂРµРґР°РєС†РёРё РЅР°
              СЃР°Р№С‚Рµ{" "}
              <a
                href="https://lioneto.com/"
                target="_blank"
                rel="noreferrer"
                className="cursor-pointer font-medium text-black underline underline-offset-4"
              >
                https://lioneto.com/
              </a>
              .
            </p>
          </section>

          <div className="mt-8 flex flex-col gap-3 border-t border-black/10 pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-[12px] leading-5 text-black/45">
              РџРѕР»РЅР°СЏ РІРµСЂСЃРёСЏ РґРѕРєСѓРјРµРЅС‚Р° РґРѕСЃС‚СѓРїРЅР°
              РґР»СЏ СЃРєР°С‡РёРІР°РЅРёСЏ РІ С„РѕСЂРјР°С‚Рµ Word.
            </p>

            <a
              href="/docs/privacy-policy.docx"
              download="privacy-policy.docx"
              onClick={(e) => e.stopPropagation()}
              onMouseDown={(e) => e.stopPropagation()}
              onPointerDown={(e) => e.stopPropagation()}
              className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-full bg-black px-5 py-3 text-[13px] font-medium text-white transition hover:opacity-90"
            >
              <Download size={16} />
              РЎРєР°С‡Р°С‚СЊ РґРѕРєСѓРјРµРЅС‚
            </a>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}

function ChipCard({
  title,
  icon,
  active,
  onClick,
}: {
  title: string;
  icon: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "group w-full cursor-pointer rounded-3xl border p-4 text-left transition md:p-5",
        "outline-none focus-visible:ring-2 focus-visible:ring-black/10 focus-visible:ring-offset-2 focus-visible:ring-offset-white",
        active
          ? "border-emerald-600 bg-emerald-600 hover:border-emerald-700 hover:bg-emerald-700"
          : "border-black/10 bg-white hover:border-black/18",
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border transition",
            active
              ? "border-white/20 bg-white/10 text-white"
              : "border-black/10 bg-black/[0.02] text-black/70 group-hover:bg-white",
          )}
        >
          <span className={cn(active ? "text-white" : "text-black/70")}>
            {icon}
          </span>
        </div>

        <div className="min-w-0">
          <div
            className={cn(
              "text-[14px] font-medium leading-6",
              active ? "text-white" : "text-black/85",
            )}
          >
            {title}
          </div>
          <div
            className={cn(
              "mt-2 text-[11px] tracking-[0.16em]",
              active ? "text-white/85" : "text-black/45",
            )}
          >
            {active ? "Р”РћР‘РђР’Р›Р•РќРћ вњ“" : "Р”РћР‘РђР’РРўР¬"}
          </div>
        </div>
      </div>
    </button>
  );
}

function SectionTitle({
  eyebrow,
  title,
  desc,
}: {
  eyebrow: string;
  title: string;
  desc?: string;
}) {
  return (
    <div>
      <div className="text-[12px] tracking-[0.18em] text-black/45">
        {eyebrow}
      </div>
      <h2 className="mt-2 text-[18px] font-semibold tracking-[-0.01em] text-black/85 md:text-[26px]">
        {title}
      </h2>
      {desc ? (
        <p className="mt-2 text-[14px] leading-7 text-black/70">{desc}</p>
      ) : null}
    </div>
  );
}

function digitsOnly(s: string) {
  return s.replace(/\D/g, "");
}

function readRegionFromStorage(): Region {
  if (typeof window === "undefined") return "UZ";

  const keys = [
    "lioneto:region",
    "region",
    "LIONETO_REGION",
    "selectedRegion",
    "lioneto_region",
  ];

  for (const k of keys) {
    const v = window.localStorage.getItem(k);
    if (!v) continue;

    const up = v.trim().toUpperCase();

    if (up === "RU" || up === "RUSSIA") return "RU";
    if (up === "KZ" || up === "KAZAKHSTAN" || up === "КАЗАХСТАН") return "KZ";
    if (up === "UZ" || up === "UZBEKISTAN") return "UZ";
  }

  return "UZ";
}

function writeRegionToStorage(r: Region) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem("lioneto:region", r);
}

function formatUzPhone(digitsRaw: string) {
  const d = digitsOnly(digitsRaw).slice(0, 9);
  const p1 = d.slice(0, 2);
  const p2 = d.slice(2, 5);
  const p3 = d.slice(5, 7);
  const p4 = d.slice(7, 9);
  const spaced = [p1, p2, p3, p4].filter(Boolean).join(" ").trim();
  return {
    digits: d,
    display: spaced ? `+998 ${spaced}` : "+998",
    placeholder: "90 123 45 67",
    maxLen: 9,
    prefix: "+998",
    fullE164: `+998${d}`,
  };
}

function formatRuPhone(digitsRaw: string) {
  const d = digitsOnly(digitsRaw).slice(0, 10);
  const p1 = d.slice(0, 3);
  const p2 = d.slice(3, 6);
  const p3 = d.slice(6, 8);
  const p4 = d.slice(8, 10);
  const spaced = [p1, p2, p3, p4].filter(Boolean).join(" ").trim();
  return {
    digits: d,
    display: spaced ? `+7 ${spaced}` : "+7",
    placeholder: "999 123 45 67",
    maxLen: 10,
    prefix: "+7",
    fullE164: `+7${d}`,
  };
}

function convertDigitsForRegion(prev: Region, next: Region, digits: string) {
  const d = digitsOnly(digits);
  if (!d) return "";

  if (prev === next) {
    return next === "UZ" ? d.slice(0, 9) : d.slice(0, 10);
  }

  if (next === "UZ") {
    return d.slice(0, 9);
  }

  return d.slice(0, 10);
}

function RegionSwitch({
  value,
  onChange,
}: {
  value: Region;
  onChange: (r: Region) => void;
}) {
  return (
    <div className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white p-1">
      {(
        [
          { id: "UZ" as const, label: "РЈР·Р±РµРєРёСЃС‚Р°РЅ" },
          { id: "RU" as const, label: "Р РѕСЃСЃРёСЏ" },
          { id: "KZ" as const, label: "РљР°Р·Р°С…СЃС‚Р°РЅ" },
        ] as const
      ).map((x) => (
        <button
          key={x.id}
          type="button"
          onClick={() => onChange(x.id)}
          className={cn(
            "cursor-pointer rounded-full px-4 py-2 text-[12px] font-medium tracking-[0.14em] transition",
            value === x.id
              ? "bg-black text-white"
              : "bg-transparent text-black/60 hover:text-black",
          )}
        >
          {x.label.toUpperCase()}
        </button>
      ))}
    </div>
  );
}

export default function CooperationClient({
  tracks,
  blocks,
}: {
  tracks: unknown[];
  blocks: unknown[];
}) {
  const startRef = useRef<HTMLDivElement | null>(null);
  const searchParams = useSearchParams();

  const [region, setRegion] = useState<Region>("UZ");
  const [formats, setFormats] = useState<string[]>([]);
  const [sending, setSending] = useState(false);

  const [privacyOpen, setPrivacyOpen] = useState(false);
  const [privacyConsent, setPrivacyConsent] = useState<PrivacyConsent>(null);

  const [form, setForm] = useState({
    firstName: "",
    email: "",
    website: "",
    city: "",
    phoneDigits: "",
    method: "call" as ContactMethod,
    comment: "",
  });

  useEffect(() => {
    setRegion(readRegionFromStorage());
  }, []);

  useEffect(() => {
    const onStorage = () => setRegion(readRegionFromStorage());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  useEffect(() => {
    const interest = searchParams.get("interest");

    if (interest === "dealer") {
      setFormats((prev) => (prev.includes("dealer") ? prev : ["dealer"]));
    }
  }, [searchParams]);

  const pickedFormats = useMemo(() => {
    const m = new Map(FORMATS.map((x) => [x.id, x.title]));
    return formats.map((id) => m.get(id)).filter(Boolean) as string[];
  }, [formats]);

  const phoneView =
    region === "UZ"
      ? formatUzPhone(form.phoneDigits)
      : formatRuPhone(form.phoneDigits);

  useEffect(() => {
    setForm((p) => {
      const converted = convertDigitsForRegion(region, region, p.phoneDigits);
      const trimmed = digitsOnly(converted).slice(0, phoneView.maxLen);
      if (trimmed === p.phoneDigits) return p;
      return { ...p, phoneDigits: trimmed };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [region]);

  const hasAcceptedPrivacy = privacyConsent === "accepted";

  const canSend =
    form.firstName.trim().length > 0 &&
    phoneView.digits.length === phoneView.maxLen &&
    hasAcceptedPrivacy;

  const toggle = (arr: string[], id: string) =>
    arr.includes(id) ? arr.filter((x) => x !== id) : [...arr, id];

  const clearAll = () => {
    setFormats([]);
  };

  const onStart = () => {
    startRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const submit = async () => {
    if (!canSend) return;

    const pageUrl =
      typeof window !== "undefined" ? window.location.href : "/cooperation";

    const payload = {
      firstName: form.firstName.trim(),
      lastName: "",
      email: form.email.trim(),
      website: form.website.trim(),
      phone: phoneView.fullE164,
      company: "",
      city: form.city.trim(),
      contactMethod: form.method,
      comment: form.comment.trim(),
      formats: pickedFormats,
      interests: [],
      region,
      pageUrl,
      privacyConsent: "accepted",
    };

    try {
      setSending(true);
      const res = await fetch("/api/partner-request", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const j = await res.json().catch(() => null);
        alert(j?.error || "РћС€РёР±РєР° РѕС‚РїСЂР°РІРєРё");
        return;
      }

      alert("РћС‚РїСЂР°РІР»РµРЅРѕ вњ…");
      setForm({
        firstName: "",
        email: "",
        website: "",
        city: "",
        phoneDigits: "",
        method: "call",
        comment: "",
      });
      setPrivacyConsent(null);
      clearAll();
    } finally {
      setSending(false);
    }
  };

  const onChangeRegion = (next: Region) => {
    setRegion((prev) => {
      setForm((p) => ({
        ...p,
        phoneDigits: convertDigitsForRegion(prev, next, p.phoneDigits),
      }));
      writeRegionToStorage(next);
      return next;
    });
  };

  return (
    <>
      <div className="mx-auto max-w-6xl space-y-10 px-4 py-10 md:space-y-14">
        <section className="relative overflow-hidden rounded-3xl border border-black/10 bg-white p-6 md:p-10">
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 opacity-80"
            style={{
              background:
                "radial-gradient(760px 340px at 10% 0%, rgba(214,190,160,0.18), transparent 60%), radial-gradient(740px 340px at 100% 80%, rgba(0,0,0,0.06), transparent 60%)",
            }}
          />

          <div className="relative">
            <div className="text-[12px] tracking-[0.18em] text-black/45">
              LIONETO вЂў COOPERATION
            </div>
            <h1 className="mt-3 text-balance text-[22px] font-semibold tracking-[-0.02em] md:text-[38px]">
              РЎРѕС‚СЂСѓРґРЅРёС‡РµСЃС‚РІРѕ СЃ Lioneto
            </h1>
            <p className="mt-3 max-w-3xl text-[14px] leading-7 text-black/70 md:text-[16px]">
              Р’С‹Р±РµСЂРёС‚Рµ, С‡С‚Рѕ РІР°Рј РёРЅС‚РµСЂРµСЃРЅРѕ вЂ” РјС‹
              СЃРѕР±РµСЂС‘Рј Р·Р°СЏРІРєСѓ Рё РѕС‚РїСЂР°РІРёРј
              РјРµРЅРµРґР¶РµСЂСѓ.
            </p>

            <div className="mt-5 flex flex-wrap gap-2">
              {BENEFITS.map((b) => (
                <div
                  key={b}
                  className="rounded-full border border-black/10 bg-white/70 px-3 py-1 text-[12px] text-black/70"
                >
                  {b}
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={onStart}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-2 rounded-2xl bg-black px-4 py-3",
                  "text-[12px] font-medium tracking-[0.18em] text-white transition",
                  "hover:opacity-95 active:scale-[0.99]",
                )}
              >
                <ArrowDown className="h-4 w-4" />
                РќРђР§РђРўР¬
              </button>

              <div className="ml-0 md:ml-2">
                <div className="mb-2 text-[11px] tracking-[0.14em] text-black/45">
                  Р Р•Р“РРћРќ Р”Р›РЇ РЎР’РЇР—Р
                </div>
                <RegionSwitch value={region} onChange={onChangeRegion} />
              </div>
            </div>
          </div>
        </section>

        <section ref={startRef} className="grid gap-6 md:grid-cols-12">
          <div className="space-y-10 md:col-span-7">
            <div>
              <SectionTitle
                eyebrow="РЁРђР“ 1"
                title="Р’С‹Р±РµСЂРёС‚Рµ С„РѕСЂРјР°С‚ СЃРѕС‚СЂСѓРґРЅРёС‡РµСЃС‚РІР°"
                desc="РњРѕР¶РЅРѕ РІС‹Р±СЂР°С‚СЊ РЅРµСЃРєРѕР»СЊРєРѕ вЂ” РѕРЅРё Р°РІС‚РѕРјР°С‚РёС‡РµСЃРєРё РїРѕСЏРІСЏС‚СЃСЏ РІ СЃРѕР±СЂР°РЅРЅРѕР№ Р·Р°СЏРІРєРµ."
              />
              <div className="mt-5 grid gap-3 md:grid-cols-2">
                {FORMATS.map((c) => (
                  <ChipCard
                    key={c.id}
                    title={c.title}
                    icon={c.icon}
                    active={formats.includes(c.id)}
                    onClick={() => setFormats((p) => toggle(p, c.id))}
                  />
                ))}
              </div>
            </div>

            <div>
              <SectionTitle
                eyebrow="РљРћРќРўРђРљРўР«"
                title="РљРѕРЅС‚Р°РєС‚С‹"
                desc="РћСЃС‚Р°РІСЊС‚Рµ РєРѕРЅС‚Р°РєС‚С‹ вЂ” РјС‹ СЃРІСЏР¶РµРјСЃСЏ РІ СѓРґРѕР±РЅРѕРј С„РѕСЂРјР°С‚Рµ."
              />

              <div className="mt-5 rounded-3xl border border-black/10 bg-white p-5 md:p-6">
                <div className="grid gap-3">
                  <input
                    value={form.firstName}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, firstName: e.target.value }))
                    }
                    placeholder="РРјСЏ*"
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-[14px] text-black/80 outline-none transition focus:border-black/25"
                  />

                  <div className="grid gap-3 md:grid-cols-2">
                    <input
                      value={form.city}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, city: e.target.value }))
                      }
                      placeholder="Р“РѕСЂРѕРґ"
                      className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-[14px] text-black/80 outline-none transition focus:border-black/25"
                    />

                    <input
                      value={form.email}
                      onChange={(e) =>
                        setForm((p) => ({ ...p, email: e.target.value }))
                      }
                      placeholder="Email (РЅРµРѕР±СЏР·Р°С‚РµР»СЊРЅРѕ)"
                      inputMode="email"
                      className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-[14px] text-black/80 outline-none transition focus:border-black/25"
                    />
                  </div>

                  <input
                    value={form.website}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, website: e.target.value }))
                    }
                    placeholder="Web СЃР°Р№С‚ (РЅРµРѕР±СЏР·Р°С‚РµР»СЊРЅРѕ)"
                    inputMode="url"
                    className="w-full rounded-2xl border border-black/10 bg-white px-4 py-3 text-[14px] text-black/80 outline-none transition focus:border-black/25"
                  />

                  <div className="grid gap-2">
                    <div className="text-[12px] tracking-[0.14em] text-black/45">
                      РўРµР»РµС„РѕРЅ*
                    </div>

                    <div className="flex items-center gap-3 rounded-2xl border border-black/10 bg-white px-4 py-3">
                      <div className="select-none text-[14px] text-black/55">
                        {phoneView.prefix}
                      </div>
                      <input
                        inputMode="numeric"
                        value={phoneView.digits}
                        onChange={(e) => {
                          const next = digitsOnly(e.target.value).slice(
                            0,
                            phoneView.maxLen,
                          );
                          setForm((p) => ({ ...p, phoneDigits: next }));
                        }}
                        placeholder={phoneView.placeholder}
                        className="w-full bg-transparent text-[14px] text-black/80 outline-none"
                      />
                    </div>

                    <div className="text-[12px] text-black/45">
                      {phoneView.digits.length
                        ? `РџСЂРёРјРµСЂ: ${phoneView.display}`
                        : `РџСЂРёРјРµСЂ: ${phoneView.prefix} ${phoneView.placeholder}`}
                    </div>
                  </div>

                  <div className="mt-2">
                    <div className="text-[12px] tracking-[0.14em] text-black/45">
                      РЈРґРѕР±РЅС‹Р№ СЃРїРѕСЃРѕР± СЃРІСЏР·Рё
                    </div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {(
                        [
                          { id: "call", label: "Р—РІРѕРЅРѕРє" },
                          { id: "max", label: "MAX" },
                          { id: "whatsapp", label: "WhatsApp" },
                          { id: "telegram", label: "Telegram" },
                        ] as const
                      ).map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() =>
                            setForm((p) => ({ ...p, method: m.id }))
                          }
                          className={cn(
                            "cursor-pointer rounded-full border px-4 py-2 text-[12px] font-medium tracking-[0.16em] transition",
                            form.method === m.id
                              ? "border-black/15 bg-black text-white"
                              : "border-black/10 bg-white text-black/70 hover:border-black/18 hover:text-black",
                          )}
                        >
                          {m.label.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </div>

                  <textarea
                    value={form.comment}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, comment: e.target.value }))
                    }
                    rows={4}
                    placeholder="Р’РєСЂР°С‚С†Рµ РѕРїРёС€РёС‚Рµ С†РµР»СЊ Р·РІРѕРЅРєР°"
                    className="mt-2 w-full resize-none rounded-2xl border border-black/10 bg-white px-4 py-3 text-[14px] text-black/80 outline-none transition focus:border-black/25"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-5">
            <div className="md:sticky md:top-6">
              <div className="rounded-3xl border border-black/10 bg-white p-6">
                <div className="text-[12px] tracking-[0.18em] text-black/45">
                  РЎРћР‘Р РђРќРќРђРЇ Р—РђРЇР’РљРђ
                </div>

                <div className="mt-4">
                  <div className="text-[12px] tracking-[0.14em] text-black/45">
                    Р РµРіРёРѕРЅ:
                  </div>
                  <div className="mt-2 rounded-2xl border border-black/10 bg-black/[0.02] px-4 py-3 text-[13px] text-black/75">
                    {region === "RU"
                      ? "Р РѕСЃСЃРёСЏ (С‚РµР»РµС„РѕРЅ +7)"
                      : region === "KZ"
                        ? "РљР°Р·Р°С…СЃС‚Р°РЅ (С‚РµР»РµС„РѕРЅ +7)"
                        : "РЈР·Р±РµРєРёСЃС‚Р°РЅ (С‚РµР»РµС„РѕРЅ +998)"}
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-[12px] tracking-[0.14em] text-black/45">
                    Р’С‹ РІС‹Р±СЂР°Р»Рё:
                  </div>
                  {pickedFormats.length ? (
                    <ul className="mt-2 grid gap-2">
                      {pickedFormats.map((x) => (
                        <li
                          key={x}
                          className="rounded-2xl border border-black/10 bg-black/[0.02] px-4 py-3 text-[13px] text-black/75"
                        >
                          {x}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="mt-2 text-[13px] leading-6 text-black/55">
                      Р’С‹Р±РµСЂРёС‚Рµ С„РѕСЂРјР°С‚
                      СЃРѕС‚СЂСѓРґРЅРёС‡РµСЃС‚РІР°.
                    </div>
                  )}
                </div>

                <div className="mt-5 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={clearAll}
                    className="inline-flex cursor-pointer items-center gap-2 rounded-2xl border border-black/10 bg-white px-4 py-3 text-[12px] tracking-[0.16em] text-black/70 transition hover:border-black/18 hover:text-black"
                  >
                    <Trash2 className="h-4 w-4 text-black/45" />
                    РћР§РРЎРўРРўР¬
                  </button>

                  <div className="text-right text-[11px] text-black/45">
                    Р­С‚Рѕ СѓР№РґС‘С‚ РјРµРЅРµРґР¶РµСЂСѓ
                  </div>
                </div>

                <div className="mt-5 rounded-[20px] border border-black/10 bg-black/[0.02] px-4 py-4">
                  <p className="text-[12px] leading-5 text-black/55">
                    РџРµСЂРµРґ РѕС‚РїСЂР°РІРєРѕР№ Р·Р°СЏРІРєРё РІС‹Р±РµСЂРёС‚Рµ
                    СЃРѕРіР»Р°СЃРёРµ РЅР° РѕР±СЂР°Р±РѕС‚РєСѓ
                    РїРµСЂСЃРѕРЅР°Р»СЊРЅС‹С… РґР°РЅРЅС‹С…. РџРѕРґСЂРѕР±РЅС‹Рµ
                    СѓСЃР»РѕРІРёСЏ РґРѕСЃС‚СѓРїРЅС‹ РІ{" "}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setPrivacyOpen(true);
                      }}
                      className="cursor-pointer font-medium text-black underline underline-offset-4 transition hover:text-black/60"
                    >
                      РїРѕР»СЊР·РѕРІР°С‚РµР»СЊСЃРєРѕРј СЃРѕРіР»Р°С€РµРЅРёРё
                    </button>
                    .
                  </p>

                  <div className="mt-3 space-y-2">
                    <label
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-2xl bg-white px-3 py-3 text-[12px] leading-5 text-black/70 ring-1 transition",
                        privacyConsent === "accepted"
                          ? "bg-white ring-black"
                          : "ring-black/10 hover:ring-black/20",
                      )}
                    >
                      <input
                        type="radio"
                        name="privacyConsent"
                        checked={privacyConsent === "accepted"}
                        onChange={() => setPrivacyConsent("accepted")}
                        className="mt-1 h-4 w-4 accent-black"
                      />

                      <span>
                        РЇ РґР°СЋ СЃРѕРіР»Р°СЃРёРµ РЅР° РѕР±СЂР°Р±РѕС‚РєСѓ
                        РїРµСЂСЃРѕРЅР°Р»СЊРЅС‹С… РґР°РЅРЅС‹С… Рё
                        РїСЂРёРЅРёРјР°СЋ СѓСЃР»РѕРІРёСЏ
                        РїРѕР»СЊР·РѕРІР°С‚РµР»СЊСЃРєРѕРіРѕ СЃРѕРіР»Р°С€РµРЅРёСЏ.
                      </span>
                    </label>

                    <label
                      className={cn(
                        "flex cursor-pointer items-start gap-3 rounded-2xl bg-white px-3 py-3 text-[12px] leading-5 text-black/70 ring-1 transition",
                        privacyConsent === "declined"
                          ? "bg-red-50 ring-red-300"
                          : "ring-black/10 hover:ring-black/20",
                      )}
                    >
                      <input
                        type="radio"
                        name="privacyConsent"
                        checked={privacyConsent === "declined"}
                        onChange={() => setPrivacyConsent("declined")}
                        className="mt-1 h-4 w-4 accent-black"
                      />

                      <span>
                        РЇ РѕС‚РєР°Р·С‹РІР°СЋСЃСЊ РѕС‚ РѕР±СЂР°Р±РѕС‚РєРё
                        РїРµСЂСЃРѕРЅР°Р»СЊРЅС‹С… РґР°РЅРЅС‹С… Рё РїРѕРЅРёРјР°СЋ,
                        С‡С‚Рѕ РѕС‚РїСЂР°РІРєР° Р·Р°СЏРІРєРё Р±СѓРґРµС‚
                        РЅРµРґРѕСЃС‚СѓРїРЅР°.
                      </span>
                    </label>
                  </div>

                  {privacyConsent === "declined" && (
                    <p className="mt-3 rounded-2xl bg-red-50 px-3 py-2 text-[12px] leading-5 text-red-700 ring-1 ring-red-100">
                      Р‘РµР· СЃРѕРіР»Р°СЃРёСЏ РЅР° РѕР±СЂР°Р±РѕС‚РєСѓ
                      РїРµСЂСЃРѕРЅР°Р»СЊРЅС‹С… РґР°РЅРЅС‹С… РјС‹ РЅРµ
                      СЃРјРѕР¶РµРј РїСЂРёРЅСЏС‚СЊ Р·Р°СЏРІРєСѓ С‡РµСЂРµР·
                      С„РѕСЂРјСѓ.
                    </p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={submit}
                  disabled={!canSend || sending}
                  className={cn(
                    "mt-5 inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-black px-4 py-3",
                    "text-[12px] font-medium tracking-[0.18em] text-white transition",
                    "hover:opacity-95 active:scale-[0.99]",
                    (!canSend || sending) && "cursor-not-allowed opacity-40",
                  )}
                >
                  <Send className="h-4 w-4" />
                  {sending ? "РћРўРџР РђР’РљРђ..." : "РћРўРџР РђР’РРўР¬"}
                </button>

                <div className="mt-3 text-[11px] leading-5 text-black/45">
                  Р”Р»СЏ РѕС‚РїСЂР°РІРєРё РЅСѓР¶РЅРѕ: <b>РёРјСЏ</b>,{" "}
                  <b>С‚РµР»РµС„РѕРЅ</b> Рё{" "}
                  <b>
                    СЃРѕРіР»Р°СЃРёРµ РЅР° РѕР±СЂР°Р±РѕС‚РєСѓ
                    РїРµСЂСЃРѕРЅР°Р»СЊРЅС‹С… РґР°РЅРЅС‹С…
                  </b>
                  .
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <PrivacyPolicyWindow
        open={privacyOpen}
        onClose={() => setPrivacyOpen(false)}
      />
    </>
  );
}
