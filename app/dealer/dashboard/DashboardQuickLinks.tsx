import Link from "next/link";

export default function DashboardQuickLinks() {
  const links = [
    { href: "/dealer/collections", label: "Collections" },
    { href: "/dealer/news", label: "News & Promotions" },
    { href: "/dealer/tech-catalogs", label: "Technical Catalogs" },
    { href: "/dealer/instructions", label: "Assembly Instructions" },
    { href: "/dealer/training", label: "Training Materials" },
    { href: "/dealer/multimedia", label: "Multimedia" },
  ];

  return (
    <div className="rounded-2xl border border-black/10 bg-white p-6 shadow-[0_18px_45px_-30px_rgba(0,0,0,0.35)]">
      <div className="text-[15px] font-semibold tracking-[-0.02em] text-black">
        Quick links
      </div>
      <div className="mt-4 grid gap-2">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="group flex items-center justify-between rounded-xl border border-black/10 bg-white px-4 py-3 text-[13px] text-black/70 transition hover:border-black/20 hover:text-black"
          >
            <span>{l.label}</span>
            <span className="text-black/30 transition group-hover:text-black/60">
              →
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
