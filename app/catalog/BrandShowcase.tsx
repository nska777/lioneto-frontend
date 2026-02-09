"use client";

import Link from "next/link";
import Image from "next/image";

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

type Brand = {
  title: string;
  slug: string;
  image: string;
};

const BRANDS: Brand[] = [
  { title: "АМБЕР", slug: "amber", image: "/demo/brands/amber.jpg" },
  { title: "СКАНДИ", slug: "scandi", image: "/demo/brands/scandi.jpg" },
  { title: "ЭЛИЗАБЕТ", slug: "elizabeth", image: "/demo/brands/elizabeth.jpg" },
  { title: "САЛЬВАДОР", slug: "salvador", image: "/demo/brands/salvador.jpg" },
  { title: "ПИТТИ", slug: "pitti", image: "/demo/brands/pitti.jpg" },
  { title: "БОНЖОРНО", slug: "bonjorno", image: "/demo/brands/bonjorno.jpg" },
];

const ROOMS = [
  { title: "Спальни", slug: "bedrooms" },
  { title: "Гостиные", slug: "living" },
  { title: "Молодежные", slug: "youth" },
  { title: "Прихожие", slug: "hallway" },
  { title: "Столы и стулья", slug: "tables" },
];

export default function BrandShowcase() {
  return (
    <section className="mx-auto w-full max-w-[1200px] px-4 pb-10">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="text-[18px] font-medium tracking-[-0.02em]">
          Коллекции моделей
        </h2>
        <Link
          href="/catalog"
          className="text-[12px] tracking-[0.18em] uppercase text-black/60 hover:text-black"
        >
          Смотреть все
        </Link>
      </div>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {BRANDS.map((b) => (
          <div
            key={b.slug}
            className="group relative overflow-hidden rounded-2xl border border-black/10 bg-white shadow-[0_10px_30px_rgba(0,0,0,0.06)]"
          >
            {/* модель */}
            <Link
              href={`/catalog?model=${b.slug}&brand=${b.slug}`}
              className="block"
            >
              <div className="relative aspect-[16/10]">
                <Image
                  src={b.image}
                  alt={b.title}
                  fill
                  className="object-cover transition duration-700 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-black/10 to-transparent" />
                <div className="absolute left-4 bottom-4">
                  <div className="text-white text-[14px] tracking-[0.22em] uppercase">
                    {b.title}
                  </div>

                  {/* разделы */}
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {ROOMS.map((c) => (
                      <Link
                        key={c.slug}
                        href={`/catalog?room=${c.slug}&model=${b.slug}&category=${c.slug}&brand=${b.slug}`}
                        className={cn(
                          "rounded-full border border-white/25 bg-white/10",
                          "px-2.5 py-1 text-[11px] text-white/90 backdrop-blur",
                          "hover:bg-white/15",
                        )}
                      >
                        {c.title}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </section>
  );
}
