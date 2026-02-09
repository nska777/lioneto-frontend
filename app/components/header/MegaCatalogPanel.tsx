"use client";

import Link from "next/link";

type MegaItem = { label: string; href: string };
export type MegaGroup = { title: string; items: MegaItem[]; moreHref?: string };

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

export default function MegaCatalogPanel({
  groups,
  onPick,
}: {
  groups: MegaGroup[];
  onPick?: () => void;
}) {
  const cols = groups.slice(0, 5);
  const bottom = groups[5];

  return (
    <div
      className={cn(
        "relative",
        "rounded-[18px] bg-white/92 backdrop-blur-xl",
        "shadow-[0_24px_80px_rgba(0,0,0,0.14)]",
        "ring-1 ring-black/10",
      )}
    >
      {/* верхняя золотая линия */}
      <div className="h-[3px] w-full rounded-t-[18px] bg-[#B0843A]/90" />

      <div className="p-6 md:p-8">
        <div className="grid gap-8 md:grid-cols-5">
          {cols.map((g) => (
            <div key={g.title} data-col>
              <h3 className="text-[16px] font-medium tracking-tight text-black">
                {g.title}
              </h3>

              <ul className="mt-3 space-y-2">
                {g.items.map((it) => (
                  <li key={`${g.title}-${it.label}`}>
                    <Link
                      href={it.href}
                      onClick={onPick}
                      className={cn(
                        "inline-flex items-center gap-2 text-[13px] text-black/75",
                        "hover:text-black transition-colors",
                        "cursor-pointer",
                      )}
                    >
                      <span className="h-1 w-1 rounded-full bg-black/15" />
                      <span>{it.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>

              {g.moreHref && (
                <Link
                  href={g.moreHref}
                  onClick={onPick}
                  className={cn(
                    "mt-4 inline-flex items-center gap-2 text-[12px]",
                    "tracking-[0.18em] uppercase text-black/70 hover:text-black",
                    "cursor-pointer",
                  )}
                >
                  <span>Еще</span>
                  <span className="inline-block translate-y-[1px]">⌄</span>
                </Link>
              )}
            </div>
          ))}
        </div>

        {bottom && (
          <div className="mt-8">
            <div className="h-px w-full bg-black/10" />
            <div className="pt-6" data-col>
              <h3 className="text-[16px] font-medium tracking-tight text-black">
                {bottom.title}
              </h3>

              <ul className="mt-3 grid gap-2 md:grid-cols-3">
                {bottom.items.map((it) => (
                  <li key={`${bottom.title}-${it.label}`}>
                    <Link
                      href={it.href}
                      onClick={onPick}
                      className={cn(
                        "inline-flex items-center gap-2 text-[13px] text-black/75",
                        "hover:text-black transition-colors",
                        "cursor-pointer",
                      )}
                    >
                      <span className="h-1 w-1 rounded-full bg-black/15" />
                      <span>{it.label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
