import Link from "next/link";

const cn = (...s: Array<string | false | null | undefined>) =>
  s.filter(Boolean).join(" ");

export default function SectionShell({
  title,
  subtitle,
  backHref,
  backLabel = "Назад",
  children,
}: {
  title: string;
  subtitle?: string;
  backHref?: string;
  backLabel?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mx-auto w-full max-w-[1180px] px-4 pb-14 pt-8">
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <div className="text-[12px] tracking-[0.18em] text-black/40">
            LIONETO / RAZDELI
          </div>
          <h1 className="mt-2 text-[28px] font-semibold tracking-tight text-black">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-1 text-[14px] text-black/55">{subtitle}</p>
          ) : null}
        </div>

        {backHref ? (
          <Link
            href={backHref}
            className={cn(
              "inline-flex h-10 items-center rounded-full border border-black/10 bg-white px-4 text-[13px]",
              "text-black/70 shadow-sm transition hover:bg-black/[0.03] hover:text-black",
            )}
          >
            {backLabel}
          </Link>
        ) : null}
      </div>

      <div className="rounded-[22px] border border-black/10 bg-[#F6F4F0] p-5 shadow-[0_10px_30px_rgba(0,0,0,0.04)]">
        {children}
      </div>
    </div>
  );
}
