import Link from "next/link";

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

function labelByVariant(v: "white" | "cappuccino") {
  return v === "white" ? "В белом цвете" : "В цвете капучино";
}

export default function CollectionVariantsGrid({
  section,
  collection,
  variants,
}: {
  section: string;
  collection: string;
  variants: Array<"white" | "cappuccino">;
}) {
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {variants.map((v) => {
        const href = `/sections/${section}/${collection}/${v}`;
        return (
          <Link
            key={v}
            href={href}
            className={cn(
              "group rounded-[18px] border border-black/10 bg-white p-4",
              "shadow-[0_8px_22px_rgba(0,0,0,0.05)] transition",
              "hover:-translate-y-[1px] hover:shadow-[0_14px_36px_rgba(0,0,0,0.08)]",
            )}
          >
            <div className="text-[12px] tracking-[0.18em] text-black/40">
              ВАРИАНТ
            </div>
            <div className="mt-1 text-[18px] font-semibold text-black">
              {labelByVariant(v)}
            </div>
            <div className="mt-1 text-[13px] text-black/55">
              Открыть галерею
            </div>

            <div className="mt-4 inline-flex h-9 items-center rounded-full border border-black/10 bg-white px-3 text-[12px] text-black/60 transition group-hover:bg-black group-hover:text-white">
              Смотреть
            </div>
          </Link>
        );
      })}
    </div>
  );
}
