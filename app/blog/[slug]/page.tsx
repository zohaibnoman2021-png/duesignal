import type { Metadata } from "next";
import BlogPostClient from "../BlogPostClient";

// For metadata
type MetaParams = { slug?: string };
type MetaProps = { params: MetaParams } | { params: Promise<MetaParams> };

// Helper: turn "hello-world" into "Hello World"
function slugToNiceTitle(rawSlug: string): string {
  if (!rawSlug) return "Blog";
  return rawSlug
    .split("-")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

// SEO metadata based on the slug
export async function generateMetadata(props: MetaProps): Promise<Metadata> {
  const params =
    props.params instanceof Promise ? await props.params : props.params;

  const rawSlug = params?.slug ?? "";

  // Fallback if something is weird
  if (!rawSlug) {
    return {
      title: "Blog | DueSignal",
      description:
        "Articles and guides from DueSignal about managing subscriptions and avoiding surprise renewals.",
    };
  }

  const niceTitle = slugToNiceTitle(rawSlug);
  const description = `Read "${niceTitle}" on DueSignal — tips and guides on managing subscriptions and avoiding surprise renewals.`;
  const canonicalUrl = `https://www.duesignal.com/blog/${rawSlug}`;

  return {
    title: `${niceTitle} | DueSignal`,
    description,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: `${niceTitle} | DueSignal`,
      description,
      url: canonicalUrl,
      type: "article",
    },
  };
}

// JSON-LD for individual blog post (uses slug + derived title)
function PostJsonLd({ slug }: { slug: string }) {
  if (!slug) return null;

  const url = `https://duesignal.com/blog/${slug}`;
  const headline = slugToNiceTitle(slug);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline,
    description:
      `Read "${headline}" on DueSignal — tips and guides on managing subscriptions and avoiding surprise renewals.`,
    url,
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": url,
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

// For the page component itself
type PageParams = { slug?: string };
type PageProps = { params: PageParams } | { params: Promise<PageParams> };

// Make the page async so we can await params if needed
export default async function BlogPostPage(props: PageProps) {
  const params =
    props.params instanceof Promise ? await props.params : props.params;

  const slug = params.slug ?? "";

  return (
    <>
      <PostJsonLd slug={slug} />
      {/* BlogPostClient can keep doing whatever it already did (probably fetching by slug) */}
      <BlogPostClient slug={slug} />
    </>
  );
}
