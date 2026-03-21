import Link from "next/link";
import { BookText } from "lucide-react";

import { getDealerInstructionCollections } from "@/app/lib/dealer/price-lists";

export default async function Page() {
  const collections = await getDealerInstructionCollections();

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

      {collections.length > 0 ? (
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((item) => (
            <Link
              key={item.slug}
              href={`/dealer/instructions/${item.slug}`}
              className={[
                "group relative overflow-hidden",
                "h-[136px] rounded-[22px] border bg-white",
                "px-6 py-5",
                "transition-all duration-300 ease-out",
                "hover:-translate-y-[2px] hover:shadow-[0_18px_50px_rgba(0,0,0,0.05)]",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-black/20",
              ].join(" ")}
              style={{
                borderColor: "rgba(189, 160, 86, 0.26)",
                background:
                  "linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(252,250,245,0.98) 100%)",
              }}
            >
              <span className="absolute left-0 top-0 h-full w-[12px] bg-[#EEE3CA]" />
              <span className="absolute left-[12px] top-[18px] h-[30px] w-[3px] rounded-full bg-[#E3D1A2]" />
              <span className="absolute left-[12px] top-[56px] h-[30px] w-[3px] rounded-full bg-[#E3D1A2]" />
              <span className="absolute left-[12px] top-[94px] h-[22px] w-[3px] rounded-full bg-[#E3D1A2]" />

              <span
                className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  background:
                    "linear-gradient(180deg, rgba(255,255,255,0.20) 0%, rgba(255,248,225,0.18) 100%)",
                }}
              />

              <span
                className={[
                  "pointer-events-none absolute -left-10 -top-14 h-[150px] w-[220px]",
                  "rounded-full blur-2xl opacity-0 transition-all duration-500",
                  "group-hover:translate-x-4 group-hover:translate-y-2 group-hover:opacity-100",
                ].join(" ")}
                style={{
                  background:
                    "radial-gradient(circle at center, rgba(222,198,133,0.28) 0%, rgba(222,198,133,0.10) 42%, rgba(222,198,133,0.00) 76%)",
                }}
              />

              <span
                className={[
                  "pointer-events-none absolute right-[-70px] top-[4px] h-[150px] w-[220px]",
                  "rounded-full blur-3xl opacity-0 transition-all duration-500",
                  "group-hover:-translate-x-4 group-hover:translate-y-1 group-hover:opacity-100",
                ].join(" ")}
                style={{
                  background:
                    "radial-gradient(circle at center, rgba(255,241,198,0.34) 0%, rgba(232,208,148,0.14) 44%, rgba(232,208,148,0.00) 78%)",
                }}
              />

              <span
                className="pointer-events-none absolute inset-[1px] rounded-[21px] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                  boxShadow: "inset 0 1px 0 rgba(255,255,255,0.82)",
                }}
              />

              <div className="relative z-[1] flex h-full items-center gap-4 pl-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px] border border-[#DCC99A] bg-[rgba(255,250,236,0.95)] text-[#8B7440]">
                  <BookText className="h-5 w-5" strokeWidth={1.8} />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="text-[15px] font-extrabold tracking-[0.18em] text-black">
                    {item.title}
                  </div>

                  <div className="mt-3 space-y-2">
                    <div className="h-[2px] w-[68%] rounded-full bg-[#E9DFC7]" />
                    <div className="h-[2px] w-[54%] rounded-full bg-[#EFE6D2]" />
                    <div className="h-[2px] w-[60%] rounded-full bg-[#F3ECDD]" />
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </section>
      ) : (
        <div className="rounded-[18px] border border-black/10 bg-white px-5 py-4 text-sm text-black/55">
          Инструкции пока не добавлены.
        </div>
      )}
    </div>
  );
}
