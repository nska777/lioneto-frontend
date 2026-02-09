"use client";

import Link from "next/link";
import Image from "next/image";
import { Heart, ArrowRight, Trash2 } from "lucide-react";

import { useShopState } from "../../../context/shop-state";
import { useRegionLang } from "../../../context/region-lang";
import { CATALOG_BY_ID } from "../../../lib/mock/catalog-products";

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

export default function WishlistSection({ userId }: { userId: string }) {
  void userId;

  const { favorites, toggleFav } = useShopState();
  const { region } = useRegionLang();

  const fmtPrice = (rub: number, uzs: number) =>
    region === "uz"
      ? `${uzs.toLocaleString("ru-RU")} сум`
      : `${rub.toLocaleString("ru-RU")} руб.`;

  const items = favorites.map((id) => {
    const p = CATALOG_BY_ID.get(id);
    return { id, p };
  });

  return (
    <div className="rounded-[28px] border border-black/10 bg-white p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-[12px] tracking-[0.22em] uppercase text-black/50">
            Список желаний
          </div>
          <div className="mt-2 text-[14px] text-black/60">
            Пока без базы данных: избранное хранится в браузере.
          </div>
        </div>

        <Link
          href="/favorites"
          className={cn(
            "inline-flex items-center gap-2 rounded-2xl border border-black/10 px-4 py-2",
            "text-[12px] tracking-[0.18em] uppercase text-black/70 hover:text-black hover:bg-black/[0.03] transition cursor-pointer",
          )}
        >
          Открыть страницу
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>

      {items.length === 0 ? (
        <div className="mt-4 text-[14px] text-black/60">
          В избранном пока пусто.
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {items.map(({ id, p }) => (
            <div
              key={id}
              className="flex items-center justify-between gap-4 rounded-2xl border border-black/10 px-4 py-3"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* left thumb */}
                {p?.image ? (
                  <div className="relative h-12 w-12 overflow-hidden rounded-2xl bg-black/[0.05]">
                    <Image
                      src={p.image}
                      alt={p.title}
                      fill
                      sizes="48px"
                      className="object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-12 w-12 rounded-2xl bg-black/[0.05] grid place-items-center">
                    <Heart className="h-4 w-4 text-rose-600 fill-current" />
                  </div>
                )}

                <div className="min-w-0">
                  <div className="text-[12px] tracking-[0.22em] uppercase text-black/45">
                    Товар
                  </div>

                  <div className="truncate text-[14px] text-black/85">
                    {p?.title ?? `Товар #${id}`}
                  </div>

                  {p ? (
                    <div className="mt-1 text-[12px] text-black/55">
                      {fmtPrice(p.price_rub ?? 0, p.price_uzs ?? 0)}
                    </div>
                  ) : (
                    <div className="mt-1 text-[12px] text-black/45">
                      Нет данных в моках
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => toggleFav(id)}
                className="h-9 w-9 rounded-xl border border-black/10 grid place-items-center text-black/60 hover:text-black hover:bg-black/[0.04] transition cursor-pointer"
                title="Убрать из избранного"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
