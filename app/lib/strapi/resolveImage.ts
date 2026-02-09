// app/lib/strapi/resolveImage.ts
export function resolveStrapiImage(url?: string) {
  if (!url) return undefined;

  // уже абсолютный
  if (url.startsWith("http")) return url;

  // ✅ если это public asset фронта (/mock, /hero, /images и т.д.) — не трогаем
  if (url.startsWith("/") && !url.startsWith("/uploads")) return url;

  // ✅ Strapi uploads
  const base =
    process.env.NEXT_PUBLIC_STRAPI_URL ||
    process.env.STRAPI_URL ||
    "http://localhost:1337";

  return `${base}${url}`;
}
