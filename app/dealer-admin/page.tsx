import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import AdminShell from "./components/AdminShell";
import { getCurrentDealerAdmin } from "./lib/get-current-admin";

export const metadata = {
  title: "Dealer Admin — Lioneto",
  robots: { index: false, follow: false },
};

export default async function DealerAdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  const admin = await getCurrentDealerAdmin();

  if (!admin) {
    redirect("/dealer/dashboard");
  }

  return <AdminShell>{children}</AdminShell>;
}
