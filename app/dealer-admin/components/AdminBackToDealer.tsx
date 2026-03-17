"use client";

import Link from "next/link";

export default function AdminBackToDealer() {
  return (
    <div className="mb-4">
      <Link
        href="/dealer/dashboard"
        className="inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-[12px] font-medium text-black/65 transition-colors hover:text-black"
      >
        <span aria-hidden="true">←</span>
        <span>Вернуться в дилерский кабинет</span>
      </Link>
    </div>
  );
}
