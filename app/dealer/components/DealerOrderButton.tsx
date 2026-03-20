"use client";

import Link from "next/link";
import { ShoppingBag } from "lucide-react";

const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(" ");

type DealerOrderButtonProps = {
  className?: string;
};

export default function DealerOrderButton({
  className,
}: DealerOrderButtonProps) {
  return (
    <Link
      href="/dealer/order"
      className={cn(
        "inline-flex items-center gap-2 rounded-2xl border border-amber-200",
        "bg-gradient-to-r from-amber-50 to-white px-4 py-2.5 text-sm font-semibold text-neutral-900",
        "shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-300 hover:shadow-md",
        "focus:outline-none focus:ring-2 focus:ring-amber-300/70",
        className,
      )}
    >
      <ShoppingBag className="h-4 w-4" />
      <span>Заказать товар</span>
    </Link>
  );
}
