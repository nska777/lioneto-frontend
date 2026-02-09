"use client";

import Link from "next/link";
import Image from "next/image";
import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

type Item = {
  id: string;
  title: string;
  image: string;
  href: string;
  badge?: string;
};

export default function CollectionCarousel({
  items,
  categoryLabel,
  collectionLabel,
}: {
  items: Item[];
  categoryLabel: string;
  collectionLabel: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!ref.current) return;
    const w = ref.current.clientWidth;
    ref.current.scrollBy({
      left: dir === "left" ? -w : w,
      behavior: "smooth",
    });
  };

  return (
    <section className="mt-6">
      {/* header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <div className="text-[12px] tracking-[0.18em] uppercase text-black/40">
            {categoryLabel}
          </div>
          <h1 className="mt-1 text-[26px] font-semibold tracking-[-0.02em]">
            {collectionLabel}
          </h1>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => scroll("left")}
            className="h-10 w-10 rounded-full border border-black/10 grid place-items-center hover:bg-black/[0.03] cursor-pointer"
          >
            <ChevronLeft className="h-5 w-5 text-black/60" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="h-10 w-10 rounded-full border border-black/10 grid place-items-center hover:bg-black/[0.03] cursor-pointer"
          >
            <ChevronRight className="h-5 w-5 text-black/60" />
          </button>
        </div>
      </div>

      {/* carousel */}
      <div
        ref={ref}
        className="
          flex gap-4 overflow-x-auto scroll-smooth
          pb-2
          [-ms-overflow-style:none]
          [scrollbar-width:none]
          [&::-webkit-scrollbar]:hidden
        "
      >
        {items.map((p) => (
          <Link
            key={p.id}
            href={p.href}
            className="
              group min-w-[260px] max-w-[260px]
              cursor-pointer
            "
          >
            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl bg-black/[0.03]">
              <Image
                src={p.image}
                alt={p.title}
                fill
                className="object-contain transition duration-500 group-hover:scale-[1.04]"
                sizes="260px"
              />

              {!!p.badge && (
                <div className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-[11px] tracking-[0.14em] uppercase text-black/70">
                  {p.badge}
                </div>
              )}
            </div>

            <div className="mt-3 text-[12px] leading-snug text-black/80 line-clamp-2">
              {p.title}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
