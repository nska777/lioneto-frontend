"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import {
  MapPin,
  Phone,
  Clock,
  Check,
  Instagram,
  Send,
  ChevronDown,
} from "lucide-react";

import {
  UZ_STORES,
  RU_STORES,
  KZ_STORES,
  type Store,
  type RegionKey,
} from "@/app/lib/stores/stores-data";

gsap.registerPlugin(ScrollTrigger);

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

const REGION_LABELS: Record<RegionKey, string> = {
  ru: "РОССИЯ",
  uz: "УЗБЕКИСТАН",
  kz: "КАЗАХСТАН",
};

function RegionSelect({
  value,
  onChange,
}: {
  value: RegionKey;
  onChange: (v: RegionKey) => void;
}) {
  const [open, setOpen] = useState(false);
  const boxRef = useRef<HTMLDivElement | null>(null);

  const items: Array<{ value: RegionKey; label: string }> = [
    { value: "ru", label: "РОССИЯ" },
    { value: "uz", label: "УЗБЕКИСТАН" },
    { value: "kz", label: "КАЗАХСТАН" },
  ];

  useEffect(() => {
    function onDocumentClick(e: MouseEvent) {
      const target = e.target;

      if (!(target instanceof Node)) return;

      if (!boxRef.current?.contains(target)) {
        setOpen(false);
      }
    }

    function onEscape(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setOpen(false);
      }
    }

    document.addEventListener("mousedown", onDocumentClick);
    document.addEventListener("keydown", onEscape);

    return () => {
      document.removeEventListener("mousedown", onDocumentClick);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  return (
    <div
      ref={boxRef}
      className="relative z-40 w-full min-w-[230px] md:w-[250px]"
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          "flex h-11 w-full cursor-pointer items-center justify-between rounded-full border border-black/10 bg-white",
          "px-5 text-[12px] font-semibold tracking-[0.18em] text-black",
          "shadow-[0_10px_28px_rgba(0,0,0,0.04)] outline-none transition",
          open ? "border-black/20" : "hover:border-black/20",
        )}
      >
        <span>{REGION_LABELS[value]}</span>

        <ChevronDown
          className={cn(
            "h-4 w-4 text-black/45 transition duration-300",
            open && "rotate-180 text-black/70",
          )}
        />
      </button>

      <div
        className={cn(
          "absolute left-0 top-[calc(100%+8px)] z-50 w-full overflow-hidden rounded-2xl border border-black/10 bg-white",
          "shadow-[0_18px_45px_rgba(0,0,0,0.12)] transition duration-200 ease-out",
          open
            ? "pointer-events-auto translate-y-0 opacity-100"
            : "pointer-events-none -translate-y-2 opacity-0",
        )}
      >
        <div className="p-1.5">
          {items.map((item) => {
            const active = item.value === value;

            return (
              <button
                key={item.value}
                type="button"
                onClick={() => {
                  onChange(item.value);
                  setOpen(false);
                }}
                className={cn(
                  "flex h-10 w-full cursor-pointer items-center justify-between rounded-xl px-4 text-left",
                  "text-[12px] font-semibold tracking-[0.16em] transition",
                  active
                    ? "bg-black text-white"
                    : "text-black/65 hover:bg-black/[0.04] hover:text-black",
                )}
              >
                <span>{item.label}</span>

                {active ? <Check className="h-4 w-4" /> : null}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function getPhoneLabel(store: Store) {
  const title = store.title;

  if (title.includes("ТЦ Тулпар")) return "ТЦ Тулпар";
  if (title.includes("ТЦ КазМарт")) return "ТЦ КазМарт";
  if (title.includes("Rich House")) return "Rich House";
  if (title.includes("Arca Mebel")) return "Arca Mebel";
  if (title.includes("Arca Premium")) return "Arca Premium";
  if (title.includes("Ecobazar")) return "Ecobazar Atlas";

  return title;
}

function splitStorePhones(store: Store) {
  const raw = store.phone ?? "";

  return raw
    .split("/")
    .map((phone) => phone.trim())
    .filter(Boolean)
    .map((phone, index) => ({
      id: `${store.id}-${index}`,
      store,
      phone,
      label: getPhoneLabel(store),
    }));
}

function phoneToHref(phone: string) {
  const cleaned = phone.replace(/[^\d+]/g, "");

  if (cleaned.startsWith("+")) return `tel:${cleaned}`;

  return `tel:+${cleaned.replace(/^8/, "7")}`;
}

function ContactLinksInline({
  region,
  stores,
}: {
  region: RegionKey;
  stores: Store[];
}) {
  const isUz = region === "uz";

  const phoneItems = stores.flatMap((store) => splitStorePhones(store));

  return (
    <div className="flex min-w-0 flex-col items-center gap-2">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {isUz ? (
          <a
            href="https://www.instagram.com/lioneto.uz?igsh=MWZoaHRzcjUxenF1bw%3D%3D&utm_source=qr"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2",
              "text-[12px] font-medium tracking-[0.14em] text-black/65 transition",
              "hover:border-[#E4405F]/35 hover:text-[#E4405F]",
            )}
          >
            <Instagram className="h-4 w-4 text-[#E4405F]" />
            INSTAGRAM
          </a>
        ) : null}

        <a
          href="https://t.me/lianetouz"
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2",
            "text-[12px] font-medium tracking-[0.14em] text-black/65 transition",
            "hover:border-[#229ED9]/35 hover:text-[#229ED9]",
          )}
        >
          <Send className="h-4 w-4 text-[#229ED9]" />
          TELEGRAM
        </a>
      </div>

      <div className="flex max-w-[760px] flex-wrap items-center justify-center gap-2">
        {phoneItems.map((item) => (
          <a
            key={`top-phone-${item.id}`}
            href={phoneToHref(item.phone)}
            title={`${item.label} — ${item.phone}`}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2",
              "text-[12px] font-medium tracking-[0.06em] text-black/65 transition",
              "hover:border-black/20 hover:text-black",
            )}
          >
            <Phone className="h-4 w-4 shrink-0 text-black/45" />

            <span className="shrink-0 text-black/45">{item.label}</span>

            <span className="shrink-0 text-black/30">—</span>

            <span className="whitespace-nowrap">{item.phone}</span>
          </a>
        ))}
      </div>
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
              <span>{store.phone}</span>
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

function yandexEmbedUrl(query: string) {
  const q = encodeURIComponent(query);
  return `https://yandex.ru/map-widget/v1/?z=15&text=${q}`;
}

export default function ContactsClient() {
  const rootRef = useRef<HTMLDivElement | null>(null);

  const [region, setRegion] = useState<RegionKey>("uz");

  const stores = useMemo(() => {
    if (region === "ru") return RU_STORES;
    if (region === "kz") return KZ_STORES;
    return UZ_STORES;
  }, [region]);

  const [activeId, setActiveId] = useState<string>(stores[0]?.id ?? "");

  const activeStore = useMemo(
    () => stores.find((s) => s.id === activeId) ?? stores[0],
    [stores, activeId],
  );

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
        className="relative z-30 flex flex-col gap-4 md:grid md:grid-cols-[250px_minmax(0,1fr)_auto] md:items-start md:gap-6"
      >
        <div className="min-w-fit pt-1">
          <RegionSelect value={region} onChange={setRegion} />
        </div>

        <div className="min-w-0">
          <ContactLinksInline region={region} stores={stores} />
        </div>

        <div className="pt-3 text-[12px] tracking-[0.18em] text-black/45 md:text-right">
          ВЫБРАНО:{" "}
          <span className="text-black/80">{REGION_LABELS[region]}</span>
        </div>
      </div>

      <div className="relative z-10 mt-6 grid gap-4 md:grid-cols-12 md:gap-6">
        <div data-reveal className="md:col-span-5">
          <div className="rounded-3xl border border-black/10 bg-white p-3">
            <div className="p-2">
              <div className="grid gap-3">
                {stores.map((s, index) => {
                  const featured =
                    region === "uz" &&
                    (index === 0 ||
                      s.title.toLowerCase().includes("rich house"));

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
