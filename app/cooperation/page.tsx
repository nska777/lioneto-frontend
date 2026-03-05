// app/cooperation/page.tsx
import CooperationClient from "./CooperationClient";

type StrapiItem<T> = { id: number; attributes?: T } & T;

function pick<T>(item: StrapiItem<T>): T & { id: number } {
  const attrs = (item as unknown as { attributes?: T }).attributes ?? item;
  const id = (item as unknown as { id: number }).id;
  return { id, ...(attrs as T) };
}

async function fetchStrapi<T>(url: string): Promise<T | null> {
  const base =
    process.env.NEXT_PUBLIC_STRAPI_URL ||
    process.env.STRAPI_URL ||
    "http://localhost:1337";

  const full = `${base}${url}`;

  const res = await fetch(full, { cache: "no-store" });

  if (!res.ok) {
    // Не роняем страницу (404/403/500), просто показываем пусто + лог в серверную консоль
    console.error("[cooperation] Strapi fetch failed", res.status, full);
    return null;
  }

  return res.json();
}

export default async function CooperationPage() {
  const tracksJson = await fetchStrapi<{ data: Array<StrapiItem<unknown>> }>(
    "/api/partner-tracks?pagination[pageSize]=100&sort=order:asc",
  );

  const blocksJson = await fetchStrapi<{ data: Array<StrapiItem<unknown>> }>(
    "/api/partner-blocks?pagination[pageSize]=1000&sort=order:asc",
  );

  const tracks = (tracksJson?.data ?? []).map((x) => pick(x));
  const blocks = (blocksJson?.data ?? []).map((x) => pick(x));

  return <CooperationClient tracks={tracks} blocks={blocks} />;
}
