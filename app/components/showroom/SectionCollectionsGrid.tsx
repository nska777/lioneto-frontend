import Link from "next/link";
import Image from "next/image";

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

export default function SectionCollectionsGrid({
  section,
  collections,
  meta,
}: {
  section: string;
  collections: Array<{ key: string; label: string }>;
  meta?: {
    getPreview?: (collectionKey: string) => string | null;
  };
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {collections.map((c) => {
        const href = `/sections/${section}/${c.key}`;
        const preview = meta?.getPreview?.(c.key) ?? null;

        return (
          <Link
            key={c.key}
            href={href}
            className={cn(
              "group relative overflow-hidden rounded-[18px] border border-black/10 bg-white p-4",
              "shadow-[0_8px_22px_rgba(0,0,0,0.05)] transition",
              "hover:-translate-y-[1px] hover:shadow-[0_14px_36px_rgba(0,0,0,0.08)]",
            )}
          >
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[12px] tracking-[0.18em] text-black/40">
                  КОЛЛЕКЦИЯ
                </div>
                <div className="mt-1 text-[18px] font-semibold text-black">
                  {c.label}
                </div>
                <div className="mt-1 text-[13px] text-black/55">
                  Открыть просмотр
                </div>
              </div>

              <span className="inline-flex h-9 items-center rounded-full border border-black/10 bg-white px-3 text-[12px] text-black/60 transition group-hover:bg-black group-hover:text-white">
                Смотреть
              </span>
            </div>

            {preview ? (
              <div className="mt-4 overflow-hidden rounded-[14px] border border-black/10 bg-[#F6F4F0]">
                <div className="relative aspect-[16/9] w-full">
                  <Image
                    src={preview}
                    alt={c.label}
                    fill
                    className="object-cover transition duration-500 group-hover:scale-[1.02]"
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    priority={false}
                  />
                </div>
              </div>
            ) : (
              <div className="mt-4 rounded-[14px] border border-black/10 bg-[#F6F4F0] p-4 text-[12px] text-black/50">
                Превью появится, когда добавишь фото в public/sections/...
              </div>
            )}

            <div className="pointer-events-none absolute inset-0 opacity-0 transition group-hover:opacity-100">
              <div className="absolute -left-20 -top-20 h-48 w-48 rounded-full bg-black/[0.03]" />
              <div className="absolute -bottom-20 -right-20 h-56 w-56 rounded-full bg-black/[0.03]" />
            </div>
          </Link>
        );
      })}
    </div>
  );
}
