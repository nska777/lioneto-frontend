// app/warranty/page.tsx
import type { Metadata } from "next";
import WarrantyClient from "./WarrantyClient";

export const metadata: Metadata = {
  title: "Гарантия — LIONETO",
  description:
    "Условия гарантийного обслуживания мебели LIONETO: срок 18 месяцев, случаи, не рассматриваемые как гарантийные, порядок обращения и гарантийный талон.",
  alternates: {
    canonical: "/warranty",
  },
  openGraph: {
    title: "Гарантия — LIONETO",
    description:
      "Условия гарантийного обслуживания мебели LIONETO: срок 18 месяцев, исключения, порядок обращения.",
    url: "/warranty",
    type: "website",
  },
};

export default function Page() {
  return <WarrantyClient />;
}
