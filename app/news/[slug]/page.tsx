import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { fetchNews, fetchNewsBySlug } from "../../lib/strapi/news";

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
    stripHtml(item.content || "");
  const description = rawDescription.slice(0, 170) || "Новость Lioneto";
  const image = item.coverImage || item.image?.url || "/og-image.jpg";

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
  const image = item.coverImage || item.image?.url || "";
  const category = item.type || "Новость";
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
    <main className="bg-[#f3f3f3] text-black">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(articleJsonLd),
        }}
      />

      <div className="mx-auto w-full max-w-[960px] px-4 py-6 md:px-6 md:py-10">
        <nav className="text-[12px] tracking-[0.18em] text-black/50">
          <Link className="hover:text-black/80" href="/">
            ГЛАВНАЯ
          </Link>
          <span className="px-2">/</span>
          <Link className="hover:text-black/80" href="/news">
            НОВОСТИ
          </Link>
          <span className="px-2">/</span>
          <span className="text-black/80">{title.toUpperCase()}</span>
        </nav>

        <article className="mt-6 overflow-hidden rounded-[28px] border border-black/10 bg-white">
          {image ? (
            <div className="aspect-[16/8] w-full overflow-hidden bg-black/5">
              <img
                src={image}
                alt={title}
                className="h-full w-full object-cover"
              />
            </div>
          ) : null}

          <div className="p-5 md:p-8">
            <div className="flex flex-wrap items-center gap-3 text-[12px] tracking-[0.18em] text-black/45">
              <span>{String(category).toUpperCase()}</span>
              {publishedDate ? <span>• {publishedDate}</span> : null}
            </div>

            <h1 className="mt-4 text-balance text-[30px] font-semibold leading-[1.05] tracking-[-0.03em] md:text-[48px]">
              {title}
            </h1>

            {excerpt ? (
              <p className="mt-4 max-w-3xl text-[16px] leading-8 text-black/70">
                {excerpt}
              </p>
            ) : null}

            {content ? (
              <div
                className="prose prose-neutral mt-8 max-w-none prose-headings:font-semibold prose-p:text-[16px] prose-p:leading-8"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            ) : excerpt ? null : (
              <p className="mt-8 text-[16px] leading-8 text-black/70">
                Полный текст новости пока не заполнен.
              </p>
            )}

            <div className="mt-10">
              <Link
                href="/news"
                className="inline-flex items-center gap-2 rounded-full border border-black/10 px-5 py-3 text-[13px] tracking-[0.16em] text-black/70 transition hover:border-black/25 hover:text-black"
              >
                Назад к новостям
              </Link>
            </div>
          </div>
        </article>
      </div>
    </main>
  );
}
