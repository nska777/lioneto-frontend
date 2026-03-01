type PageProps = {
  params: { slug: string };
};

export default function DealerNewsSlugPage({ params }: PageProps) {
  return (
    <div className="mx-auto max-w-[1100px] px-6 py-12">
      <h1 className="text-[28px] font-semibold tracking-[-0.03em] text-black">
        News: {params.slug}
      </h1>
      <p className="mt-2 text-black/60">Single news item page (slug).</p>
    </div>
  );
}
