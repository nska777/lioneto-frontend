// app/dealer/layout.tsx
import type { ReactNode } from "react";
import DealerShell from "./components/DealerShell";

export const metadata = {
  title: "Dealer Portal — Lioneto",
  robots: { index: false, follow: false },
};

export default function DealerLayout({ children }: { children: ReactNode }) {
  return <DealerShell>{children}</DealerShell>;
}
