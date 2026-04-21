// app/cooperation/page.tsx
import type { Metadata } from "next";
import CooperationClient from "./CooperationClient";

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
  return <CooperationClient tracks={[]} blocks={[]} />;
}
