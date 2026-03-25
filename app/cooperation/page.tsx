// app/cooperation/page.tsx
import type { Metadata } from "next";
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
    console.warn("[cooperation] Strapi fetch failed", res.status, full);
    return null;
  }

  return res.json();
}

export const metadata: Metadata = {
  title: "Сотрудничество — дилеры, дизайнеры и B2B",
  description:
    "Сотрудничество с Lioneto для дилеров, дизайнеров, партнеров и B2B-клиентов. Узнайте об условиях партнерства, поставках и возможностях совместной работы.",
  alternates: {
    canonical: "/cooperation",
  },
  openGraph: {
    title: "Сотрудничество с Lioneto — дилеры, дизайнеры и B2B",
    description:
      "Lioneto развивает сотрудничество с дилерами, дизайнерами, партнерами и B2B-клиентами. Условия работы, поставки и совместные проекты.",
    url: "https://lioneto.com/cooperation",
    siteName: "Lioneto",
    type: "website",
    locale: "ru_RU",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Сотрудничество с Lioneto",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Сотрудничество с Lioneto — дилеры, дизайнеры и B2B",
    description:
      "Условия сотрудничества с Lioneto для дилеров, дизайнеров и B2B-клиентов.",
    images: ["/og-image.jpg"],
  },
};

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
