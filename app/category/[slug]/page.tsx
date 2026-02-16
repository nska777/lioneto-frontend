import Link from "next/link";
import { megaCategories } from "@/app/lib/headerData";

export default function CategoryPage({ params }: { params: { slug: string } }) {
  const slug = params.slug; // bedrooms | living | youth ...
  const cat =
    megaCategories.find((c) => c.key === slug) ??
    megaCategories.find((c) => c.href === `/category/${slug}`) ??
    null;
  function pickLabel(obj: unknown): string | undefined {
    if (!obj || typeof obj !== "object") return undefined;
    const o = obj as Record<string, unknown>;
    const v = o.label ?? o.title ?? o.name;
    return typeof v === "string" ? v : undefined;
  }
  return (
    <main className="mx-auto w-full max-w-[1200px] px-4 py-10">
      <h1 className="text-2xl font-semibold text-black">
        {pickLabel(cat) ?? `Категория: ${slug}`}
      </h1>

      <p className="mt-2 text-sm text-black/60">В Разработке</p>

      <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(cat?.items ?? []).map((it) => (
          <Link
            key={it.href}
            href={it.href}
            className="rounded-2xl border border-black/10 bg-white p-4 hover:bg-black/[0.02] transition"
          >
            <div className="text-sm font-semibold text-black">
              {pickLabel(it) ?? ""}
            </div>
            <div className="mt-1 text-xs text-black/50">{it.href}</div>
          </Link>
        ))}

        {!cat && (
          <div className="rounded-2xl border border-black/10 bg-white p-4 text-sm text-black/60">
            {/*Нет данных по категории. Проверь slug и headerData.ts*/}
          </div>
        )}
      </div>
    </main>
  );
}
