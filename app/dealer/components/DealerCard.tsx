// app/dealer/components/DealerCard.tsx
import type { ReactNode } from "react";

export default function DealerCard({
  title,
  subtitle,
  children,
  className,
}: {
  title: string;
  subtitle?: string;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-[20px] border border-black/10 bg-white p-5 shadow-[0_18px_60px_-40px_rgba(0,0,0,0.35)] ${className ?? ""}`}
    >
      <header className="mb-4">
        <h2 className="text-[16px] font-semibold tracking-[-0.02em]">
          {title}
        </h2>
        {subtitle ? (
          <p className="mt-1 text-[13px] leading-relaxed text-black/60">
            {subtitle}
          </p>
        ) : null}
      </header>

      {children}
    </section>
  );
}
