// app/warranty/page.tsx
import type { Metadata } from "next";
import WarrantyClient from "./WarrantyClient";

export const metadata: Metadata = {
  title: "Гарантия — LIONETO",
  description:
    "Гарантийные обязательства LIONETO: срок 18 месяцев, исключения, гарантийный талон и порядок обращения.",
  alternates: { canonical: "/warranty" },
};

export default function Page() {
  return <WarrantyClient />;
}
