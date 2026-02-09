"use client";

import { useEffect, useState } from "react";

export function useProductLightbox({
  maxLen,
  activeIdx,
  setActiveIdx,
}: {
  maxLen: number;
  activeIdx: number;
  setActiveIdx: (n: number) => void;
}) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIdx, setLightboxIdx] = useState(0);

  const openLightbox = (idx: number) => {
    setActiveIdx(idx);
    setLightboxIdx(idx);
    setLightboxOpen(true);
  };

  const nextLb = () => setLightboxIdx((v) => (v + 1) % maxLen);
  const prevLb = () => setLightboxIdx((v) => (v - 1 + maxLen) % maxLen);

  useEffect(() => {
    if (lightboxOpen) setLightboxIdx(activeIdx);
  }, [lightboxOpen, activeIdx]);

  useEffect(() => {
    if (!lightboxOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowRight") nextLb();
      if (e.key === "ArrowLeft") prevLb();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxOpen, maxLen]);

  return {
    lightboxOpen,
    setLightboxOpen,
    lightboxIdx,
    setLightboxIdx,
    openLightbox,
    nextLb,
    prevLb,
  };
}
