import Link from "next/link";

export default function DashboardRecentNews() {
  const news = [
    { slug: "opening", title: "New showroom opening", date: "2026-03-01" },
    { slug: "price-update", title: "Price list update", date: "2026-03-01" },
    {
      slug: "amber-materials",
      title: "AMBER materials uploaded",
      date: "2026-03-01",
    },
  ];

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-[0_18px_45px_-30px_rgba(0,0,0,0.35)]">
      <div className="flex items-center justify-between">
        <div className="text-[15px] font-semibold tracking-[-0.02em] text-black">
          Recent news
        </div>
        <Link
          href="/dealer/news"
          className="text-[12px] text-black/50 hover:text-black"
        >
          View all →
        </Link>
      </div>

      <div className="mt-4 space-y-2">
        {news.map((n) => (
          <Link
            key={n.slug}
            href={`/dealer/news/${n.slug}`}
            className="block rounded-xl border border-black/10 px-4 py-3 transition hover:border-black/20"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="text-[13px] font-medium text-black">
                {n.title}
              </div>
              <div className="text-[12px] text-black/40">{n.date}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
