"use client";

import { useEffect, useRef } from "react";

export function useClickOutside<T extends HTMLElement>(
  open: boolean,
  onClose: () => void
) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    if (!open) return;

    const onDown = (e: MouseEvent) => {
      const el = ref.current;
      if (!el) return;
      if (e.target instanceof Node && !el.contains(e.target)) onClose();
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return ref;
}
