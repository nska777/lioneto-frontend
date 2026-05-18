// app/news/[slug]/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { fetchNews, fetchNewsBySlug } from "../../lib/strapi/news";

export const dynamic = "force-dynamic";

function stripHtml(html: string) {
  return html
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function formatDate(value?: string) {
  if (!value) return "";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("ru-RU", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

function normalizeType(value?: string) {
  const s = String(value || "").toLowerCase();

  if (s.includes("arrival") || s.includes("поступ")) return "Поступление";
  if (s.includes("update") || s.includes("обнов")) return "Обновление";
  if (s.includes("sale") || s.includes("promo") || s.includes("акц")) {
    return "Акция";
  }
  if (s.includes("event") || s.includes("событ")) return "Событие";

  return value || "Новость";
}

export async function generateStaticParams() {
  const items = await fetchNews();

  return items
    .filter((item) => item.slug)
    .map((item) => ({
      slug: String(item.slug),
    }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const item = await fetchNewsBySlug(slug);

  if (!item) {
    return {
      title: "Новость не найдена | Lioneto",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const title = item.title?.trim() || "Новость Lioneto";
  const rawDescription =
    item.excerpt?.trim() ||
    item.description?.trim() ||
    item.subtitle?.trim() ||
    stripHtml(item.content || "");

  const description = rawDescription.slice(0, 170) || "Новость Lioneto";
  const image =
    item.coverImage || item.cover?.url || item.image?.url || "/og-image.jpg";

  return {
    title: `${title} | Lioneto`,
    description,
    alternates: {
      canonical: `/news/${slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://lioneto.com/news/${slug}`,
      siteName: "Lioneto",
      type: "article",
      locale: "ru_RU",
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function NewsDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const item = await fetchNewsBySlug(slug);

  if (!item) {
    notFound();
  }

  const title = item.title?.trim() || "Новость Lioneto";

  const excerpt =
    item.excerpt?.trim() ||
    item.description?.trim() ||
    item.subtitle?.trim() ||
    "";

  const content = item.content || "";
  const image = item.coverImage || item.cover?.url || item.image?.url || "";
  const category = normalizeType(item.type || item.tag);
  const publishedDate = formatDate(item.publishedAt || item.createdAt);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: title,
    description: excerpt || stripHtml(content).slice(0, 170),
    image: image ? [image] : ["https://lioneto.com/og-image.jpg"],
    datePublished: item.publishedAt || item.createdAt || undefined,
    author: {
      "@type": "Organization",
      name: "Lioneto",
    },
    publisher: {
      "@type": "Organization",
      name: "Lioneto",
      logo: {
        "@type": "ImageObject",
        url: "https://lioneto.com/icon.png",
      },
    },
    mainEntityOfPage: `https://lioneto.com/news/${slug}`,
  };

  return (
    <main className="min-h-screen bg-[#f3f3f3] text-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd),
        }}
      />

      <section className="mx-auto w-full max-w-[1060px] px-4 pb-20 pt-6 md:px-6 md:pb-28 md:pt-10">
        <nav className="text-[12px] font-semibold uppercase tracking-[0.18em] text-black/45">
          <Link className="transition hover:text-black/80" href="/">
            Главная
          </Link>
          <span className="px-2">/</span>
          <Link className="transition hover:text-black/80" href="/news">
            Новости
          </Link>
          <span className="px-2">/</span>
          <span className="text-black/80">Новость</span>
        </nav>

        <Link
          href="/news"
          className="mt-8 inline-flex items-center gap-2 rounded-full border border-black/10 bg-white px-5 py-3 text-[12px] font-semibold uppercase tracking-[0.18em] text-black/65 transition hover:border-black/25 hover:text-black"
        >
          <ArrowLeft size={15} />
          Назад к новостям
        </Link>

        <article className="mt-8 overflow-hidden rounded-[32px] border border-black/10 bg-white shadow-sm">
          {image ? (
            <div className="aspect-[16/8] w-full overflow-hidden bg-black/5">
              <img
                src={image}
                alt={title}
                className="h-full w-full object-cover"
              />
            </div>
          ) : null}

          <div className="p-5 md:p-9">
            <div className="flex flex-wrap items-center gap-3">
              <span className="rounded-full bg-black px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-white">
                {category}
              </span>

              {publishedDate ? (
                <span className="rounded-full border border-black/10 px-5 py-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-black/55">
                  {publishedDate}
                </span>
              ) : null}
            </div>

            <h1 className="mt-6 text-balance text-[34px] font-semibold leading-[1.04] tracking-[-0.035em] md:text-[58px]">
              {title}
            </h1>

            {excerpt ? (
              <p className="mt-5 max-w-3xl text-[16px] font-medium leading-8 text-black/65 md:text-[18px]">
                {excerpt}
              </p>
            ) : null}

            {content ? (
              <div
                className="prose prose-neutral mt-10 max-w-none prose-headings:font-semibold prose-p:text-[16px] prose-p:leading-8 prose-p:text-black/70 prose-a:text-black"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : excerpt ? null : (
              <p className="mt-10 text-[16px] leading-8 text-black/70">
                Полный текст новости пока не заполнен.
              </p>
            )}
          </div>
        </article>
      </section>
    </main>
  );
}
