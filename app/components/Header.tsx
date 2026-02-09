"use client";

import { useEffect, useMemo, useState } from "react";
import { useRegionLang } from "../context/region-lang";
import { getDict, tF } from "@/i18n";

import TopBar from "./header/TopBar";
import BrandRow from "./header/BrandRow";
import CategoryNav from "./header/CategoryNav";
import MobileMenu from "./header/MobileMenu";

import MapModal from "./modals/MapModal";
import CallModal from "./modals/CallModal";

import {
  REGION_DATA,
  megaCategories,
  topLinks as TOPLINKS_FALLBACK,
} from "../lib/headerData";

type RegionKey = "uz" | "ru";

type GlobalFromStrapi = {
  callCtaLabel?: string | null;
  topLinks?: Array<{
    id?: number;
    label?: string | null;
    href?: string | null;
    isExternal?: boolean | null;
    isActive?: boolean | null;
  }> | null;
  phones?: Array<{
    id?: number;
    region?: RegionKey | string | null;
    phone?: string | null;
  }> | null;
  addresses?: Array<{
    id?: number;
    region?: RegionKey | string | null;

    // RU
    city?: string | null;
    addressLine?: string | null;
    workTime?: string | null;

    // UZ
    city_uz?: string | null;
    addressLine_uz?: string | null;
    workTime_uz?: string | null;

    mapUrl?: string | null;
  }> | null;
};

function normalizeRegionKey(x: unknown): RegionKey {
  const v = String(x ?? "")
    .toLowerCase()
    .trim();
  return v === "ru" ? "ru" : "uz";
}

function safeTF(dict: unknown, key: unknown, fallback: string) {
  if (!dict || typeof dict !== "object") return fallback;
  const k = typeof key === "string" ? key : "";
  return tF(dict as any, k, fallback);
}

export default function Header({
  global,
}: {
  global?: GlobalFromStrapi | null;
}) {
  const { region, setRegion, lang, setLang } = useRegionLang();
  const dict = useMemo(() => getDict(lang as any), [lang]);

  const [mapOpen, setMapOpen] = useState(false);
  const [selectedAddress, setSelectedAddress] = useState("");

  const [callOpen, setCallOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // 1) регион
  const regionKey = normalizeRegionKey(region);
  const regionMeta = (REGION_DATA as any)[regionKey] ?? (REGION_DATA as any).uz;

  // 2) префикс и подпись региона — всегда из текущего regionKey
  const phonePrefix = String(REGION_DATA[regionKey].phonePrefix);

  const regionLabel =
    regionKey === "uz"
      ? safeTF(dict, "region.uz", "Узбекистан")
      : safeTF(dict, "region.ru", "Россия");

  // 4) TOP LINKS
  const topLinks = useMemo(() => {
    const normalize = (s: string) =>
      s
        .toLowerCase()
        .replace(/\s+/g, " ")
        .replace(/[«»"']/g, "")
        .trim();

    const KEY_BY_LABEL: Record<string, string> = {
      [normalize("Каталог")]: "header.top.catalog",
      [normalize("О компании")]: "header.top.about",
      [normalize("Новости")]: "header.top.news",
      [normalize("Контакты")]: "header.top.contacts",
      [normalize("Сотрудничество")]: "header.top.cooperation",
      [normalize("Акции")]: "header.top.sale",

      [normalize("CATALOG")]: "header.top.catalog",
      [normalize("ABOUT")]: "header.top.about",
      [normalize("NEWS")]: "header.top.news",
      [normalize("CONTACTS")]: "header.top.contacts",
      [normalize("COOPERATION")]: "header.top.cooperation",
      [normalize("SALE")]: "header.top.sale",
    };

    const fromCmsRaw = (global?.topLinks ?? [])
      .filter(Boolean)
      .filter((x) => x?.isActive !== false)
      .map((x) => ({
        label: (x?.label ?? "").trim(),
        href: (x?.href ?? "").trim(),
        isExternal: Boolean(x?.isExternal),
      }))
      .filter((x) => x.label && x.href);

    if (fromCmsRaw.length) {
      return fromCmsRaw.map((x) => {
        const k = KEY_BY_LABEL[normalize(x.label)];
        return {
          labelKey: k ?? "",
          fallback: x.label,
          href: x.href,
          isExternal: x.isExternal,
        };
      });
    }

    return (TOPLINKS_FALLBACK as any[]).map((x) => ({
      labelKey: String(x?.labelKey ?? ""),
      fallback: String(x?.fallback ?? x?.label ?? x?.title ?? "").trim(),
      href: String(x?.href ?? "").trim(),
      isExternal: Boolean(x?.isExternal),
    }));
  }, [global?.topLinks]);

  // 5) phone
  const phone = useMemo(() => {
    const p = (global?.phones ?? []).find(
      (x) => String(x?.region) === regionKey,
    )?.phone;

    return p && String(p).trim()
      ? String(p).trim()
      : String(regionMeta?.phone ?? "");
  }, [global?.phones, regionKey, regionMeta]);

  // 6) addresses
  const addresses = useMemo(() => {
    const isUzLang = String(lang) === "uz";

    const list = (global?.addresses ?? [])
      .filter((x) => String(x?.region) === regionKey)
      .map((x) => {
        const cityRaw = isUzLang ? x?.city_uz : x?.city;
        const addrRaw = isUzLang ? x?.addressLine_uz : x?.addressLine;
        const workRaw = isUzLang ? x?.workTime_uz : x?.workTime;

        const city = String(cityRaw ?? x?.city ?? "").trim();
        const addr = String(addrRaw ?? x?.addressLine ?? "").trim();
        const work = String(workRaw ?? x?.workTime ?? "").trim();

        const base = [city, addr].filter(Boolean).join(", ");
        return work ? `${base} — ${work}` : base;
      })
      .filter((s) => String(s).trim().length > 0);

    const fallback = Array.isArray(regionMeta?.addresses)
      ? regionMeta.addresses
      : [];

    return list.length ? list : fallback;
  }, [global?.addresses, regionKey, regionMeta, lang]);

  const callCta =
    (global?.callCtaLabel ?? "").trim() ||
    safeTF(dict, "header.ui.callMe", "Заказать звонок");

  return (
    <>
      <header className="w-full bg-white">
        <TopBar
          dict={dict}
          topLinks={topLinks}
          phone={phone}
          regionTitleKey={String(regionMeta?.labelKey ?? "region.uz")}
          regionTitleFallback={String(regionMeta?.fallback ?? "Узбекистан")}
          addresses={addresses}
          callCtaLabel={callCta}
          onPickAddress={(a) => {
            setSelectedAddress(a);
            setMapOpen(true);
          }}
          onOpenCall={() => {
            console.log("OPEN CALL:", {
              region,
              regionKey,
              phonePrefix,
              regionLabel,
            });
            setCallOpen(true);
          }}
          onOpenMobileMenu={() => setMobileOpen(true)}
        />

        <BrandRow
          region={regionKey}
          setRegion={setRegion}
          lang={lang}
          setLang={setLang}
        />

        <CategoryNav categories={megaCategories} dict={dict} />
      </header>

      <MapModal
        open={mapOpen}
        onClose={() => setMapOpen(false)}
        address={selectedAddress}
      />

      <CallModal open={callOpen} onClose={() => setCallOpen(false)} />

      <MobileMenu
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        links={topLinks.map((x) => ({
          label: x.labelKey ? safeTF(dict, x.labelKey, x.fallback) : x.fallback,
          href: x.href,
          isExternal: x.isExternal,
        }))}
      />
    </>
  );
}
