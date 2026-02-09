"use client";

import { useEffect } from "react";
import { X } from "lucide-react";
import { useClickOutside } from "@/app/hooks/useClickOutside";

function cn(...s: Array<string | false | null | undefined>) {
  return s.filter(Boolean).join(" ");
}

export default function Modal({
  open,
  onClose,
  title,
  children,
  widthClass = "max-w-[760px]",
}: {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  widthClass?: string;
}) {
  const wrapRef = useClickOutside<HTMLDivElement>(open, onClose);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[6px] cursor-pointer"
        onClick={onClose}
      />
      <div
        ref={wrapRef}
        className={cn(
          "relative w-full rounded-3xl border border-white/20 bg-white shadow-[0_30px_90px_-50px_rgba(0,0,0,0.55)]",
          widthClass,
        )}
      >
        <div className="flex items-center justify-between px-6 py-4">
          <div className="text-[14px] tracking-[0.18em] text-black/55">
            {title ?? ""}
          </div>
          <button
            className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-full text-black/55 hover:bg-black/5 hover:text-black transition"
            onClick={onClose}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="px-6 pb-6">{children}</div>
      </div>
    </div>
  );
}
