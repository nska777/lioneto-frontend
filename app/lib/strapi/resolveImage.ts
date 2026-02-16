export function resolveStrapiImage(url: string) {
  if (!url) return "";

  // уже абсолютный
  if (url.startsWith("http://") || url.startsWith("https://")) return url;

  const base =
    process.env.NEXT_PUBLIC_STRAPI_URL ||
    process.env.STRAPI_URL ||
    "http://localhost:1337";

  return `${base.replace(/\/$/, "")}${url.startsWith("/") ? "" : "/"}${url}`;
}
