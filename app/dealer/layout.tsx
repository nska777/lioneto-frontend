import type { ReactNode } from "react";
import DealerShell from "./components/DealerShell";
import { getCurrentDealerAdmin } from "../dealer-admin/lib/get-current-admin";

export const metadata = {
  title: "Dealer Portal — Lioneto",
  robots: { index: false, follow: false },
};

export default async function DealerLayout({
  children,
}: {
  children: ReactNode;
}) {
  const admin = await getCurrentDealerAdmin();

  return <DealerShell canAccessAdmin={Boolean(admin)}>{children}</DealerShell>;
}
