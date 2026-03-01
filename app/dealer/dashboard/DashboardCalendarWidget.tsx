export default function DashboardCalendarWidget() {
  const items = [
    { title: "Training: Product basics", meta: "Thu • 16:00" },
    { title: "New catalog release", meta: "Mon • 11:00" },
    { title: "Dealer Q&A", meta: "Fri • 18:30" },
  ];

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-[0_18px_45px_-30px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between">
        <div className="text-[15px] font-semibold tracking-[-0.02em] text-black">
          Calendar
        </div>
        <div className="text-[12px] text-black/40">placeholder</div>
      </div>

      <div className="mt-4 space-y-3">
        {items.map((it) => (
          <div
            key={it.title}
            className="rounded-xl border border-black/10 px-4 py-3"
          >
            <div className="text-[13px] font-medium text-black">{it.title}</div>
            <div className="mt-1 text-[12px] text-black/50">{it.meta}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
