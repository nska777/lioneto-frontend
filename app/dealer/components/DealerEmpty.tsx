// app/dealer/components/DealerEmpty.tsx
export default function DealerEmpty({
  title,
  hint,
}: {
  title: string;
  hint?: string;
}) {
  return (
    <div className="rounded-[20px] border border-dashed border-black/15 bg-white p-6">
      <div className="text-[14px] font-semibold tracking-[-0.02em]">
        {title}
      </div>
      {hint ? (
        <div className="mt-1 text-[13px] leading-relaxed text-black/60">
          {hint}
        </div>
      ) : null}
    </div>
  );
}
