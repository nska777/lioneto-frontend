// app/dealer/components/DealerShell.tsx
"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import DealerSidebar from "./DealerSidebar";
import DealerTopbar from "./DealerTopbar";

const AUTH_PATHS = [
  "/dealer/login",
  "/dealer/forgot-password",
  "/dealer/reset-password",
];

export default function DealerShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAuthPage = AUTH_PATHS.includes(pathname);

  if (isAuthPage) return <>{children}</>;

  return (
    <div className="min-h-screen">
      <div className="mx-auto flex min-h-screen max-w-[1400px]">
        <aside className="hidden w-[280px] border-r border-black/10 bg-white md:block">
          <DealerSidebar />
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <div className="sticky top-0 z-20 border-b border-black/10 bg-white/90 backdrop-blur">
            <DealerTopbar />
          </div>

          <main className="min-w-0 flex-1 px-4 py-6 md:px-8">{children}</main>
        </div>
      </div>
    </div>
  );
}
