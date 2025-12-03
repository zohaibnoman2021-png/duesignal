import type { Metadata } from "next";
import BlogClient from "./BlogClient";

export const metadata: Metadata = {
  title: "Blog | DueSignal",
  description:
    "Tips and guides on managing subscriptions, avoiding surprise renewals, and staying in control of your recurring payments.",
  openGraph: {
    title: "Blog | DueSignal",
    description:
      "Tips and guides on managing subscriptions, avoiding surprise renewals, and staying in control of your recurring payments.",
  },
  twitter: {
    card: "summary",
    title: "Blog | DueSignal",
    description:
      "Tips and guides on managing subscriptions, avoiding surprise renewals, and staying in control of your recurring payments.",
  },
};

function BlogJsonLd() {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    url: "https://duesignal.com/blog",
    name: "DueSignal Blog",
    description:
      "Tips and guides on managing subscriptions, avoiding surprise renewals, and staying in control of your recurring payments.",
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default function BlogPage() {
  return (
    <>
      <BlogJsonLd />
      <BlogClient />
    </>
  );
}
