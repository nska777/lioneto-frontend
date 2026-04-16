"use client";

import { useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MapPin, Phone, Clock, Check } from "lucide-react";

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
          "h-9 px-5 rounded-full text-[12px] font-medium tracking-[0.18em] transition cursor-pointer",
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
          "h-9 px-5 rounded-full text-[12px] font-medium tracking-[0.18em] transition cursor-pointer",
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

function StoreRow({
  active,
  store,
  onClick,
}: {
  active: boolean;
  store: Store;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full cursor-pointer rounded-3xl border p-5 text-left transition",
        active
          ? "border-black/25 bg-black/[0.02]"
          : "border-black/10 bg-white hover:border-black/20",
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "mt-0.5 flex h-9 w-9 items-center justify-center rounded-2xl border",
            active
              ? "border-black/20 bg-white"
              : "border-black/10 bg-black/[0.02]",
          )}
        >
          {active ? (
            <Check className="h-4 w-4 text-black/70" />
          ) : (
            <MapPin className="h-4 w-4 text-black/50" />
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="text-[14px] font-semibold tracking-[-0.01em] text-black/90">
            {store.title}
          </div>

          {store.phone && (
            <div className="mt-2 flex items-center gap-2 text-[13px] text-black/70">
              <Phone className="h-4 w-4 text-black/40" />
              <span className="truncate">{store.phone}</span>
            </div>
          )}

          <div className="mt-2 flex items-start gap-2 text-[13px] text-black/70">
            <MapPin className="mt-0.5 h-4 w-4 text-black/40" />
            <span className="leading-6">{store.address}</span>
          </div>

          {store.hours && (
            <div className="mt-2 flex items-center gap-2 text-[13px] text-black/70">
              <Clock className="h-4 w-4 text-black/40" />
              <span>{store.hours}</span>
            </div>
          )}
        </div>
      </div>
    </button>
  );
}

function yandexEmbedUrl(query: string) {
  const q = encodeURIComponent(query);
  return `https://yandex.ru/map-widget/v1/?ll=&z=11&text=${q}`;
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
  const mapTitle = isRu ? "Москва" : (activeStore?.title ?? "");
  const mapQuery = isRu ? "Москва" : (activeStore?.mapQuery ?? "");

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
        className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
      >
        <RegionToggle value={region} onChange={setRegion} />

        <div className="text-[12px] tracking-[0.18em] text-black/45">
          ВЫБРАНО:{" "}
          <span className="text-black/80">
            {isRu ? "РОССИЯ" : "УЗБЕКИСТАН"}
          </span>
        </div>
      </div>

      <div
        className={cn(
          "mt-6 grid gap-4 md:gap-6",
          isRu ? "grid-cols-1" : "md:grid-cols-12",
        )}
      >
        {!isRu && (
          <div data-reveal className="md:col-span-5">
            <div className="rounded-3xl border border-black/10 bg-white p-3">
              <div className="max-h-[520px] overflow-auto p-2">
                <div className="grid gap-3">
                  {stores.map((s) => (
                    <StoreRow
                      key={s.id}
                      store={s}
                      active={s.id === activeId}
                      onClick={() => setActiveId(s.id)}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        <div data-reveal className={isRu ? "" : "md:col-span-7"}>
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
