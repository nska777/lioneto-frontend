"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

type ProductLike = {
  id?: string;
  image?: string;
  gallery?: string[];
};

type UseProductGalleryOpts = {
  variantGallery?: string[] | null;
  cacheKey?: string;
};

function normalize(arr: Array<string | null | undefined>) {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of arr) {
    if (!s || typeof s !== "string") continue;
    const v = s.trim();
    if (!v || seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
}

function preloadOk(src: string) {
  return new Promise<boolean>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(true);
    img.onerror = () => resolve(false);
    img.src = src;
  });
}

// ✅ небольшой in-memory кэш, чтобы не дёргать картинки повторно
const galleryCache = new Map<string, string[]>();

export function useProductGallery(
  product?: ProductLike | null,
  opts?: UseProductGalleryOpts
) {
  const [activeIdx, setActiveIdx] = useState(0);

  // 1) Источник правды:
  // variantGallery (если есть) -> product.gallery -> product.image (1 шт) -> []
  const rawGallery = useMemo(() => {
    const base =
      opts?.variantGallery?.length
        ? opts.variantGallery
        : product?.gallery?.length
        ? product.gallery
        : product?.image
        ? [product.image]
        : [];

    return normalize(base);
  }, [opts?.variantGallery, product?.gallery, product?.image]);

  // 2) cacheKey (важно: можно включать selectedVariantKey снаружи)
  const cacheKey = useMemo(() => {
    if (opts?.cacheKey) return opts.cacheKey;
    if (product?.id) return `p:${product.id}`;
    if (rawGallery[0]) return `g:${rawGallery[0]}`;
    return "";
  }, [opts?.cacheKey, product?.id, rawGallery]);

  // 3) Состояние gallery: не показываем "сырую" пачку, ждём валидацию
  const [gallery, setGallery] = useState<string[]>(() => {
    const cached = cacheKey ? galleryCache.get(cacheKey) : undefined;
    if (cached?.length) return cached;

    if (product?.image) return [product.image];
    return [];
  });

  const runIdRef = useRef(0);

  useEffect(() => {
    let cancelled = false;
    const myRun = ++runIdRef.current;

    // ✅ если есть кэш — мгновенно
    if (cacheKey) {
      const cached = galleryCache.get(cacheKey);
      if (cached?.length) {
        setGallery(cached);
        setActiveIdx(0);
        return;
      }
    }

    (async () => {
      if (!rawGallery.length) {
        const next = product?.image ? [product.image] : [];
        if (!cancelled && runIdRef.current === myRun) {
          setGallery(next);
          if (cacheKey) galleryCache.set(cacheKey, next);
          setActiveIdx(0);
        }
        return;
      }

      const checks = await Promise.all(rawGallery.map(preloadOk));
      const filtered = rawGallery.filter((_, i) => checks[i]);

      if (cancelled) return;
      if (runIdRef.current !== myRun) return;

      const next =
        filtered.length > 0
          ? filtered
          : product?.image
          ? [product.image]
          : [];

      setGallery(next);
      if (cacheKey) galleryCache.set(cacheKey, next);
      setActiveIdx(0);
    })();

    return () => {
      cancelled = true;
    };
  }, [rawGallery, product?.image, cacheKey]);

  const maxLen = gallery.length;

  // clamp activeIdx
  useEffect(() => {
    if (maxLen <= 0) {
      if (activeIdx !== 0) setActiveIdx(0);
      return;
    }
    if (activeIdx > maxLen - 1) setActiveIdx(maxLen - 1);
    if (activeIdx < 0) setActiveIdx(0);
  }, [maxLen, activeIdx]);

  const onPrev = useCallback(() => {
    if (maxLen <= 1) return;
    setActiveIdx((i) => (i - 1 + maxLen) % maxLen);
  }, [maxLen]);

  const onNext = useCallback(() => {
    if (maxLen <= 1) return;
    setActiveIdx((i) => (i + 1) % maxLen);
  }, [maxLen]);

  return {
    gallery,
    activeIdx,
    setActiveIdx,
    onPrev,
    onNext,
    maxLen,
  };
}
