"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  MapPin,
  Phone,
  Clock,
  Check,
  Instagram,
  Send,
  Building2,
  FileText,
  Hash,
  Landmark,
} from "lucide-react";

import {
  UZ_STORES,
  RU_STORES,
  type Store,
  type RegionKey,
} from "@/app/lib/stores/stores-data";

gsap.registerPlugin(ScrollTrigger);

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

function RegionToggle({
  value,
  onChange,
}: {
  value: RegionKey;
  onChange: (v: RegionKey) => void;
}) {
  return (
    <div className="inline-flex rounded-full border border-black/10 bg-white p-1">
      <button
        type="button"
        onClick={() => onChange("ru")}
        className={cn(
          "h-9 cursor-pointer rounded-full px-5 text-[12px] font-medium tracking-[0.18em] transition",
          value === "ru"
            ? "bg-black text-white"
            : "text-black/70 hover:text-black",
        )}
      >
        РОССИЯ
      </button>

      <button
        type="button"
        onClick={() => onChange("uz")}
        className={cn(
          "h-9 cursor-pointer rounded-full px-5 text-[12px] font-medium tracking-[0.18em] transition",
          value === "uz"
            ? "bg-black text-white"
            : "text-black/70 hover:text-black",
        )}
      >
        УЗБЕКИСТАН
      </button>
    </div>
  );
}

function ContactLinksInline() {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <a
        href="https://www.instagram.com/lioneto.uz?igsh=MWZoaHRzcjUxenF1bw%3D%3D&utm_source=qr"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-[12px] font-medium tracking-[0.14em] text-black/65 transition hover:border-black/20 hover:text-black"
      >
        <Instagram className="h-4 w-4" />
        INSTAGRAM
      </a>

      <a
        href="https://t.me/lianetouz"
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-[12px] font-medium tracking-[0.14em] text-black/65 transition hover:border-black/20 hover:text-black"
      >
        <Send className="h-4 w-4" />
        TELEGRAM
      </a>

      <a
        href="tel:+998909256006"
        className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-[12px] font-medium tracking-[0.14em] text-black/65 transition hover:border-black/20 hover:text-black"
      >
        <Phone className="h-4 w-4" />
        +998 (90) 925-60-06
      </a>
    </div>
  );
}

function StoreRow({
  active,
  featured,
  store,
  onClick,
}: {
  active: boolean;
  featured: boolean;
  store: Store;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative w-full cursor-pointer rounded-3xl border p-5 text-left transition",
        featured
          ? active
            ? "border-[#ccb086] bg-[#f7f1e7] shadow-[0_8px_24px_rgba(0,0,0,0.05)]"
            : "border-[#d8c3a5] bg-[#fbf7f1] hover:border-[#ccb086]"
          : active
            ? "border-black/25 bg-black/[0.02]"
            : "border-black/10 bg-white hover:border-black/20",
      )}
    >
      {featured ? (
        <div className="mb-3 flex items-center justify-between gap-3">
          <span className="inline-flex rounded-full bg-[#d2ae7a] px-3 py-1 text-[10px] font-semibold tracking-[0.18em] text-white">
            ГЛАВНЫЙ САЛОН
          </span>

          <span className="text-[10px] tracking-[0.18em] text-[#9b7a4a]">
            РЕКОМЕНДУЕМ
          </span>
        </div>
      ) : null}

      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border",
            featured
              ? "border-[#d8c3a5] bg-white text-[#8e6d3f]"
              : active
                ? "border-black/20 bg-white"
                : "border-black/10 bg-black/[0.02]",
          )}
        >
          {active ? (
            <Check
              className={cn(
                "h-4 w-4",
                featured ? "text-[#8e6d3f]" : "text-black/70",
              )}
            />
          ) : (
            <MapPin
              className={cn(
                "h-4 w-4",
                featured ? "text-[#8e6d3f]" : "text-black/50",
              )}
            />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div
            className={cn(
              "text-[14px] font-semibold tracking-[-0.01em]",
              featured ? "text-black" : "text-black/90",
            )}
          >
            {store.title}
          </div>

          {store.phone ? (
            <div className="mt-2 flex items-center gap-2 text-[13px] text-black/70">
              <Phone className="h-4 w-4 shrink-0 text-black/40" />
              <span className="truncate">{store.phone}</span>
            </div>
          ) : null}

          <div className="mt-2 flex items-start gap-2 text-[13px] text-black/70">
            <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-black/40" />
            <span className="leading-6">{store.address}</span>
          </div>

          {store.hours ? (
            <div className="mt-2 flex items-center gap-2 text-[13px] text-black/70">
              <Clock className="h-4 w-4 shrink-0 text-black/40" />
              <span>{store.hours}</span>
            </div>
          ) : null}
        </div>
      </div>
    </button>
  );
}

function RussiaCompanyCard({
  active,
  store,
  onClick,
}: {
  active: boolean;
  store: Store;
  onClick: () => void;
}) {
  const legal = store.legalDetails;

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative w-full cursor-pointer rounded-3xl border p-5 text-left transition",
        active
          ? "border-[#ccb086] bg-[#f7f1e7] shadow-[0_8px_24px_rgba(0,0,0,0.05)]"
          : "border-black/10 bg-white hover:border-black/20",
      )}
    >
      <div className="mb-4 flex items-center justify-between gap-3">
        <span className="text-[10px] tracking-[0.18em] text-[#9b7a4a]">
          РОССИЯ
        </span>
      </div>

      <div className="flex items-start gap-3">
        <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl border border-[#d8c3a5] bg-white text-[#8e6d3f]">
          {active ? (
            <Check className="h-4 w-4" />
          ) : (
            <Building2 className="h-4 w-4" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-[15px] font-semibold text-black">
            {store.title}
          </div>

          <div className="mt-4 grid gap-3">
            <div className="rounded-2xl border border-[#d8c3a5] bg-white/80 p-4">
              <div className="mb-2 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-[#9b7a4a]">
                <MapPin className="h-4 w-4 shrink-0" />
                Юридический адрес
              </div>

              <div className="text-[13px] font-semibold leading-6 text-black/75">
                {legal?.legalAddress ?? store.address}
              </div>
            </div>

            <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-[0_8px_24px_rgba(0,0,0,0.04)]">
              <div className="mb-3 flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-black/45">
                <Landmark className="h-4 w-4 shrink-0" />
                Реквизиты
              </div>

              <div className="grid gap-2.5 text-[13px] text-black/75">
                {legal?.ogrn ? (
                  <div className="flex items-center justify-between gap-3 rounded-xl bg-black/[0.035] px-3 py-2">
                    <span className="flex items-center gap-2 font-medium text-black/45">
                      <Hash className="h-4 w-4 shrink-0" />
                      ОГРН
                    </span>
                    <span className="font-semibold text-black">
                      {legal.ogrn}
                    </span>
                  </div>
                ) : null}

                {legal?.inn ? (
                  <div className="flex items-center justify-between gap-3 rounded-xl bg-black/[0.035] px-3 py-2">
                    <span className="flex items-center gap-2 font-medium text-black/45">
                      <FileText className="h-4 w-4 shrink-0" />
                      ИНН
                    </span>
                    <span className="font-semibold text-black">
                      {legal.inn}
                    </span>
                  </div>
                ) : null}

                {legal?.kpp ? (
                  <div className="flex items-center justify-between gap-3 rounded-xl bg-black/[0.035] px-3 py-2">
                    <span className="flex items-center gap-2 font-medium text-black/45">
                      <FileText className="h-4 w-4 shrink-0" />
                      КПП
                    </span>
                    <span className="font-semibold text-black">
                      {legal.kpp}
                    </span>
                  </div>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </button>
  );
}

function yandexEmbedUrl(query: string) {
  const q = encodeURIComponent(query);
  return `https://yandex.ru/map-widget/v1/?z=15&text=${q}`;
}

export default function ContactsClient() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  const [region, setRegion] = useState<RegionKey>("uz");

  const stores = useMemo(
    () => (region === "ru" ? RU_STORES : UZ_STORES),
    [region],
  );

  const [activeId, setActiveId] = useState<string>(stores[0]?.id ?? "");

  const activeStore = useMemo(
    () => stores.find((s) => s.id === activeId) ?? stores[0],
    [stores, activeId],
  );

  const isRu = region === "ru";

  const mapTitle = activeStore?.title ?? "";
  const mapQuery = activeStore?.mapQuery ?? activeStore?.address ?? "";

  useLayoutEffect(() => {
    setActiveId(stores[0]?.id ?? "");
  }, [region, stores]);

  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const blocks = gsap.utils.toArray<HTMLElement>("[data-reveal]");

      blocks.forEach((el) => {
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 18, filter: "blur(10px)" },
          {
            autoAlpha: 1,
            y: 0,
            filter: "blur(0px)",
            duration: 0.8,
            ease: "power3.out",
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              once: true,
            },
          },
        );
      });
    }, rootRef);

    return () => ctx.revert();
  }, [region]);

  return (
    <div ref={rootRef}>
      <div
        data-reveal
        className="flex flex-col gap-4 md:grid md:grid-cols-[auto_1fr_auto] md:items-center md:gap-6"
      >
        <div className="min-w-fit">
          <RegionToggle value={region} onChange={setRegion} />
        </div>

        <div className="min-w-0">
          <ContactLinksInline />
        </div>

        <div className="text-[12px] tracking-[0.18em] text-black/45 md:text-right">
          ВЫБРАНО:{" "}
          <span className="text-black/80">
            {isRu ? "РОССИЯ" : "УЗБЕКИСТАН"}
          </span>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-12 md:gap-6">
        <div data-reveal className="md:col-span-5">
          <div className="rounded-3xl border border-black/10 bg-white p-3">
            <div className="max-h-[520px] overflow-auto p-2">
              <div className="grid gap-3">
                {stores.map((s, index) => {
                  const featured =
                    index === 0 || s.title.toLowerCase().includes("rich house");

                  if (isRu) {
                    return (
                      <RussiaCompanyCard
                        key={s.id}
                        store={s}
                        active={s.id === activeId}
                        onClick={() => setActiveId(s.id)}
                      />
                    );
                  }

                  return (
                    <StoreRow
                      key={s.id}
                      store={s}
                      featured={featured}
                      active={s.id === activeId}
                      onClick={() => setActiveId(s.id)}
                    />
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        <div data-reveal className="md:col-span-7">
          <div className="overflow-hidden rounded-3xl border border-black/10 bg-white">
            <div className="flex items-center justify-between gap-3 border-b border-black/10 px-5 py-4">
              <div className="min-w-0">
                <div className="text-[12px] tracking-[0.18em] text-black/50">
                  КАРТА
                </div>

                <div className="truncate text-[14px] font-semibold text-black/85">
                  {mapTitle}
                </div>
              </div>

              <a
                href={`https://yandex.ru/maps/?text=${encodeURIComponent(
                  mapQuery,
                )}`}
                target="_blank"
                rel="noreferrer"
                className="inline-flex cursor-pointer items-center justify-center rounded-full border border-black/10 bg-white px-4 py-2 text-[12px] font-medium tracking-[0.16em] text-black/70 transition hover:border-black/20 hover:text-black"
              >
                ОТКРЫТЬ →
              </a>
            </div>

            <div className="relative h-[520px] w-full">
              <iframe
                key={`${region}-${activeStore?.id}`}
                title="Yandex Map"
                src={yandexEmbedUrl(mapQuery)}
                className="absolute inset-0 h-full w-full"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
