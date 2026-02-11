"use client";

import { ChevronDown } from "lucide-react";
import { useLayoutEffect, useMemo, useRef, useState } from "react";

import { useClickOutside } from "@/app/hooks/useClickOutside";

type StoreAddressObj = {
  label: string;
  mapUrl?: string;
};

type AddressItem = string | StoreAddressObj;

export default function StoresDropdown({
  label = "Адреса магазинов",
  regionTitle,
  addresses,
  onPickAddress,
}: {
  label?: string;
  regionTitle: string;
  addresses: AddressItem[];
  onPickAddress: (address: string) => void;
}) {
  const [open, setOpen] = useState(false);

  const wrapRef = useClickOutside<HTMLDivElement>(open, () => setOpen(false));

  const btnRef = useRef<HTMLButtonElement | null>(null);

  const [pos, setPos] = useState<{
    top: number;
    left: number;
    width: number;
  } | null>(null);

  // нормализуем адреса
  const normalized = useMemo(() => {
    return (addresses ?? []).map((a) => {
      if (typeof a === "string") {
        return {
          label: a,
          url: "https://yandex.uz/maps/?text=" + encodeURIComponent(a),
        };
      }

      return {
        label: a.label,
        url:
          a.mapUrl ||
          "https://yandex.uz/maps/?text=" + encodeURIComponent(a.label),
      };
    });
  }, [addresses]);

  // вычисляем позицию dropdown
  const updatePos = () => {
    const el = btnRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();

    setPos({
      top: rect.bottom + 8,
      left: rect.left,
      width: rect.width,
    });
  };

  useLayoutEffect(() => {
    if (!open) return;

    updatePos();

    const onScroll = () => updatePos();
    const onResize = () => updatePos();

    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);

    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
    };
  }, [open]);

  return (
    <div ref={wrapRef} className="relative">
      {/* BUTTON */}
      <button
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        className="inline-flex cursor-pointer items-center gap-2 rounded-full px-2 py-1 whitespace-nowrap transition hover:bg-black/5 hover:text-black"
        type="button"
      >
        <span className="hidden sm:inline">{label}</span>

        <span className="sm:hidden">Адреса</span>

        <ChevronDown
          className={`h-4 w-4 opacity-70 transition ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {/* DROPDOWN */}
      {open && pos && (
        <div
          className="fixed z-[9999] rounded-2xl border border-black/10 bg-white p-2 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.35)] w-[min(380px,calc(100vw-24px))]"
          style={{
            top: pos.top,

            // центрируем под кнопкой, но не даём выйти за экран
            left: Math.min(Math.max(12, pos.left), window.innerWidth - 392),
          }}
        >
          {/* REGION TITLE */}
          <div className="px-3 py-2 text-[11px] tracking-[0.22em] text-black/40">
            {regionTitle}
          </div>

          {/* ADDRESSES */}
          <div className="max-h-[240px] overflow-auto px-1 pb-1">
            {normalized.length ? (
              normalized.map((item, i) => (
                <button
                  key={i}
                  onClick={() => {
                    onPickAddress(item.label);

                    setOpen(false);

                    window.open(item.url, "_blank", "noopener,noreferrer");
                  }}
                  className="w-full cursor-pointer text-left rounded-xl px-3 py-2 text-[13px] text-black/75 hover:bg-black/5 transition"
                  type="button"
                >
                  {item.label}
                </button>
              ))
            ) : (
              <div className="px-3 py-3 text-[13px] text-black/40">
                Нет адресов
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
