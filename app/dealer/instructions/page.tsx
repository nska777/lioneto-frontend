// app/dealer/instructions/page.tsx
type CollectionItem = {
  id: string;
  title: string;
  href: string; // ведёт на страницу модулей
};

const COLLECTIONS: CollectionItem[] = [
  { id: "amber", title: "AMBER", href: "/dealer/instructions/amber" },
  { id: "scandy", title: "SCANDY", href: "/dealer/instructions/scandy" },
  {
    id: "elizabeth",
    title: "ELIZABETH",
    href: "/dealer/instructions/elizabeth",
  },
  { id: "salvador", title: "SALVADOR", href: "/dealer/instructions/salvador" },
  { id: "pitti", title: "PITTI", href: "/dealer/instructions/pitti" },
  {
    id: "buongiorno",
    title: "BUONGIORNO",
    href: "/dealer/instructions/buongiorno",
  },
];

export default function Page() {
  return (
    <div className="space-y-6">
      <header>
        <div className="text-sm text-black/45">Dealer Portal</div>
        <h1 className="mt-1 text-[22px] font-semibold tracking-[-0.02em] text-black">
          Инструкции по сборке
        </h1>
        <p className="mt-1 text-sm text-black/55">
          Выберите коллекцию — откроется список модулей с поиском и файлами.
        </p>
      </header>

      <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {COLLECTIONS.map((it) => (
          <a
            key={it.id}
            href={it.href}
            className={[
              "group relative overflow-hidden",
              "h-[130px] rounded-[18px] border bg-white",
              "px-6",
              "flex items-center justify-center",
              "transition-transform duration-200 hover:-translate-y-[1px]",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20",
            ].join(" ")}
            style={{ borderColor: "rgba(189, 160, 86, 0.26)" }}
          >
            <span
              className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
              style={{
                background:
                  "radial-gradient(120% 120% at 22% 0%, rgba(232, 208, 148, 0.28) 0%, rgba(232, 208, 148, 0) 55%)",
              }}
            />
            <span className="text-[14px] font-extrabold tracking-[0.18em] text-black">
              {it.title}
            </span>
          </a>
        ))}
      </section>
    </div>
  );
}
