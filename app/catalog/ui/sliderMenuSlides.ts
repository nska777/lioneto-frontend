// app/catalog/ui/sliderMenuSlides.ts
"use client";

const cache = new Map<string, string[]>();

function norm(v: string) {
  return String(v || "").trim().toLowerCase();
}

function buildCandidateUrls(room: string, collection: string, max = 12) {
  const r = norm(room);
  const c = norm(collection);

 
  const exts = ["webp", "jpg"]; 
  const urls: string[] = [];
  for (let i = 1; i <= max; i++) {
    const n = String(i).padStart(2, "0");
    for (const ext of exts) {
      urls.push(`/slidermenu/${r}/${c}/${n}.${ext}`);
    }
  }
  return urls;
}

function probeImage(src: string) {
  return new Promise<string | null>((resolve) => {
    const img = new Image();
    img.decoding = "async";
    img.loading = "eager";

    img.onload = () => resolve(src);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

async function probeWithConcurrency(
  candidates: string[],
  {
    concurrency = 8,
    limitFound = 8,
  }: { concurrency?: number; limitFound?: number } = {},
) {
  const found: string[] = [];
  let i = 0;

  const workers = Array.from({ length: concurrency }, async () => {
    while (i < candidates.length && found.length < limitFound) {
      const src = candidates[i++];
      const ok = await probeImage(src);
      if (ok) found.push(ok);
    }
  });

  await Promise.all(workers);
  return found;
}


export async function getSliderMenuSlidesAsync(
  room: string,
  collection: string,
  max = 12,
) {
  const key = `${norm(room)}:${norm(collection)}:${max}`;

  const cached = cache.get(key);
  if (cached) return cached;

  const candidates = buildCandidateUrls(room, collection, max);

  
  const found = await probeWithConcurrency(candidates, {
    concurrency: 8,
    limitFound: 8,
  });

  cache.set(key, found);
  return found;
}

export function prefetchSliderMenuSlides(
  room: string,
  collection: string,
  max = 12,
) {
  void getSliderMenuSlidesAsync(room, collection, max);
}
