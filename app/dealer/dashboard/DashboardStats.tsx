export default function DashboardStats() {
  const cards = [
    { label: "Collections", value: "—" },
    { label: "News", value: "—" },
    { label: "Files", value: "—" },
    { label: "Trainings", value: "—" },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((c) => (
        <div
          key={c.label}
          className="rounded-2xl border border-black/10 bg-white p-5 shadow-[0_18px_45px_-30px_rgba(0,0,0,0.35)]"
        >
          <div className="text-[12px] tracking-[0.06em] text-black/50">
            {c.label.toUpperCase()}
          </div>
          <div className="mt-2 text-[26px] font-semibold tracking-[-0.03em] text-black">
            {c.value}
          </div>
          <div className="mt-1 text-[12px] text-black/40">placeholder</div>
        </div>
      ))}
    </div>
  );
}
