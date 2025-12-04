"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  limit,
  query,
  where,
} from "firebase/firestore";

type Post = {
  title: string;
  slug: string;
  author?: string;
  category?: string;
  tags?: string[];
  imageUrl?: string;
  imageAlt?: string;
  contentHtml?: string;
};

type Props = {
  slug: string;
};

export default function BlogPostClient({ slug }: Props) {
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const q = query(
          collection(db, "posts"),
          where("slug", "==", slug),
          where("published", "==", true),
          limit(1)
        );

        const snap = await getDocs(q);

        if (snap.empty) {
          setPost(null);
        } else {
          const data = snap.docs[0].data() as any;
          setPost({
            title: data.title,
            slug: data.slug,
            author: data.author,
            category: data.category,
            tags: data.tags,
            imageUrl: data.imageUrl,
            imageAlt: data.imageAlt,
            contentHtml: data.contentHtml,
          });
        }
      } catch (err) {
        console.error("Failed to load post", err);
        setPost(null);
      } finally {
        setLoading(false);
      }
    };

    if (slug) {
      fetchPost();
    }
  }, [slug]);

  if (loading) {
    return <div className="p-6">Loading post…</div>;
  }

  if (!post) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <p className="mb-4">Post not found.</p>
        <Link href="/blog" className="text-blue-600 underline">
          Back to blog
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <header className="mb-6">
        <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">
          {post.category || "Subscriptions"}
        </p>
        <h1 className="text-3xl font-semibold mb-2">{post.title}</h1>
        {post.author && (
          <p className="text-sm text-gray-500">By {post.author}</p>
        )}
        {post.tags && post.tags.length > 0 && (
          <p className="text-xs text-gray-400 mt-1">
            Tags: {post.tags.join(", ")}
          </p>
        )}
      </header>

      {post.imageUrl && (
        <div className="mb-6">
          <img
            src={post.imageUrl}
            alt={post.imageAlt || post.title}
            className="w-full rounded"
          />
        </div>
      )}

      {post.contentHtml && (
  <article
    className="article-body max-w-none"
    dangerouslySetInnerHTML={{ __html: post.contentHtml }}
  />
)}


      <div className="mt-8">
        <Link href="/blog" className="text-blue-600 underline">
          ← Back to blog
        </Link>
      </div>
    </div>
  );
}
