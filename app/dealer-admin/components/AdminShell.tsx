"use client";

import type { ReactNode } from "react";
import AdminSidebar from "./AdminSidebar";

export default function AdminShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#faf8f2]">
      <div className="mx-auto flex min-h-screen max-w-[1480px]">
        <aside className="hidden md:block">
          <AdminSidebar />
        </aside>

        <main className="min-w-0 flex-1 px-4 py-6 md:px-8">{children}</main>
      </div>
    </div>
  );
}
