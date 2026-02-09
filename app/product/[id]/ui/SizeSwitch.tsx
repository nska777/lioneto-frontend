"use client";

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

type Opt = { id: string; title: string };

export default function SizeSwitch({
  label = "Размер",
  options,
  value,
  onChange,
}: {
  label?: string;
  options: Opt[];
  value: string;
  onChange: (id: string) => void;
}) {
  if (!options.length) return null;

  return (
    <div className="mt-5">
      <div className="text-[12px] tracking-[0.18em] uppercase text-black/45">
        {label}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {options.map((o) => {
          const active = value === o.id;
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onChange(o.id)}
              className={cn(
                "cursor-pointer rounded-full border px-4 py-2 text-[12px] transition",
                active
                  ? "border-black bg-black text-white"
                  : "border-black/10 bg-white text-black/70 hover:text-black",
              )}
            >
              {o.title}
            </button>
          );
        })}
      </div>
    </div>
  );
}
