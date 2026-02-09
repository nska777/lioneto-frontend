"use client";

import { ChevronDown } from "lucide-react";
import { useState } from "react";
import { useClickOutside } from "@/app/hooks/useClickOutside";

export default function StoresDropdown({
  label = "Адреса магазинов",
  regionTitle,
  addresses,
  onPickAddress,
}: {
  label?: string;
  regionTitle: string;
  addresses: string[];
  onPickAddress: (address: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useClickOutside<HTMLDivElement>(open, () => setOpen(false));

  return (
    <div ref={wrapRef} className="relative">
      <button
        onClick={() => setOpen((v) => !v)}
        className={[
          "inline-flex cursor-pointer items-center gap-2 rounded-full px-2 py-1",
          "whitespace-nowrap", // ✅ НЕ переносим в 2 строки
          "transition hover:bg-black/5 hover:text-black",
        ].join(" ")}
        type="button"
      >
        <span className="hidden sm:inline whitespace-nowrap">{label}</span>
        <span className="sm:hidden whitespace-nowrap">Адреса</span>

        <ChevronDown
          className={[
            "h-4 w-4 opacity-70 transition",
            open ? "rotate-180" : "",
          ].join(" ")}
        />
      </button>

      {open && (
        <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-[320px] sm:w-[380px] rounded-2xl border border-black/10 bg-white p-2 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.35)]">
          <div className="px-3 py-2 text-[11px] tracking-[0.22em] text-black/40">
            {regionTitle}
          </div>

          <div className="max-h-[280px] overflow-auto px-1 pb-1">
            {addresses.map((a, i) => (
              <button
                key={i}
                onClick={() => {
                  onPickAddress(a);
                  setOpen(false);
                }}
                className="w-full cursor-pointer text-left rounded-xl px-3 py-2 text-[13px] text-black/75 hover:bg-black/5 transition"
                type="button"
              >
                {a}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
