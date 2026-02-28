// app/collection/[key]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  CATALOG_MOCK,
  COLLECTION_PRODUCTS,
} from "@/app/lib/mock/catalog-products";

function xfnv1a(str: string) {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  return function () {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffleDeterministic<T>(items: T[], seedKey: string) {
  const rand = mulberry32(xfnv1a(seedKey));
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

type CatalogItemLite = {
  id: string;
  title: string;
  image: string;
  brand?: string;
  category?: string;
  collectionKey?: string;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function isString(v: unknown): v is string {
  return typeof v === "string";
}

function toCatalogItemLite(v: unknown): CatalogItemLite | null {
  if (!isRecord(v)) return null;

  const id = v["id"];
  const title = v["title"];
  const image = v["image"];

  if (!isString(id) || !isString(title) || !isString(image)) return null;

  const brand = v["brand"];
  const category = v["category"];
  const collectionKey = v["collectionKey"];

  return {
    id,
    title,
    image,
    brand: isString(brand) ? brand : undefined,
    category: isString(category) ? category : undefined,
    collectionKey: isString(collectionKey) ? collectionKey : undefined,
  };
}

export default async function CollectionPage({
  params,
}: {
  params: { key: string };
}) {
  const { key } = params;

  const collection = COLLECTION_PRODUCTS.find((c) => c.id === key);
  if (!collection) return notFound();

  // Берём только валидные элементы (без any)
  const modulesAll = CATALOG_MOCK.map(toCatalogItemLite)
    .filter((p): p is CatalogItemLite => p !== null)
    .filter((p) => p.collectionKey === key);

  const shuffled = shuffleDeterministic(modulesAll, key);

  const SHOW_COUNT = 12;
  const modules = shuffled.slice(0, SHOW_COUNT);

  return (
    <div className="mx-auto w-full max-w-[1200px] px-4 pb-20 pt-6">
      <div className="mb-6">
        <div className="text-[12px] tracking-[0.22em] uppercase text-black/50">
          Коллекция
        </div>
        <h1 className="mt-2 text-[30px] font-semibold leading-[1.05] text-black">
          Модули коллекции
        </h1>
        <div className="mt-2 text-[14px] text-black/60">{collection.title}</div>
      </div>

      <div className="rounded-3xl bg-black/[0.02] p-5 ring-1 ring-black/5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-[12px] tracking-[0.22em] uppercase text-black/50">
              Товары коллекции
            </div>
            <div className="mt-1 text-[16px] font-semibold text-black">
              Выберите модуль
            </div>
            <div className="mt-1 text-[13px] text-black/55">
              Найдено модулей: {modulesAll.length}
            </div>
          </div>

          <Link
            href="/catalog"
            className="text-[12px] tracking-[0.18em] uppercase text-black/60 hover:text-black"
          >
            В каталог
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {modules.map((p) => (
            <Link
              key={p.id}
              href={`/product/${p.id}`}
              className="group block overflow-hidden rounded-3xl bg-white ring-1 ring-black/5 transition hover:ring-black/10"
            >
              <div className="relative aspect-[4/3] bg-black/[0.03]">
                <img
                  src={p.image}
                  alt={p.title}
                  className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                />
              </div>

              <div className="p-4">
                <div className="text-[11px] tracking-[0.22em] uppercase text-black/40">
                  Модуль
                </div>
                <div className="mt-1 line-clamp-2 text-[15px] font-semibold text-black">
                  {p.title}
                </div>

                <div className="mt-2 text-[13px] text-black/60">
                  {(p.brand ?? "") +
                    (p.brand && p.category ? " · " : "") +
                    (p.category ?? "")}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
