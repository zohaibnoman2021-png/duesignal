"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  query,
  where,
  orderBy,
  limit,
} from "firebase/firestore";

type Post = {
  id: string;
  title: string;
  slug: string;
  author?: string;
  category?: string;
  tags?: string[];
  imageUrl?: string;
  imageAlt?: string;
  excerpt?: string;
  createdAtIso?: string; // ISO string for display
};

export default function BlogClient() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchPosts = async () => {
      setLoading(true);
      setError("");

      try {
        const q = query(
          collection(db, "posts"),
          where("published", "==", true),
          orderBy("createdAt", "desc"),
          limit(20)
        );

        const snap = await getDocs(q);
        const list: Post[] = snap.docs.map((docSnap) => {
          const data = docSnap.data() as any;

          let createdAtIso: string | undefined;
          if (data.createdAt?.toDate) {
            createdAtIso = data.createdAt.toDate().toISOString();
          }

          // clean excerpt:
          // 1) prefer explicit data.excerpt if present
          // 2) otherwise derive from contentHtml, removing <script> and <style> blocks and HTML tags
          let excerpt = "";

          if (typeof data.excerpt === "string" && data.excerpt.trim().length > 0) {
            excerpt = data.excerpt.trim();
          } else if (data.contentHtml) {
            // remove any <script>...</script> and <style>...</style> blocks
            const withoutScriptsAndStyles = data.contentHtml
              .replace(/<script[\s\S]*?<\/script>/gi, "")
              .replace(/<style[\s\S]*?<\/style>/gi, "");

            // strip remaining HTML tags, collapse whitespace, limit length
            excerpt = withoutScriptsAndStyles
              .replace(/<[^>]+>/g, " ")
              .replace(/\s+/g, " ")
              .trim()
              .slice(0, 150);

            if (excerpt.length === 150) excerpt += "…";
          }

          return {
            id: docSnap.id,
            title: data.title || "Untitled",
            slug: data.slug || docSnap.id,
            author: data.author || "",
            category: data.category || "",
            tags: Array.isArray(data.tags) ? data.tags : [],
            imageUrl: data.imageUrl || "",
            imageAlt: data.imageAlt || data.title || "",
            excerpt,
            createdAtIso,
          };
        });

        setPosts(list);
      } catch (err: any) {
        console.error("Failed to load blog posts", err);
        setError(
          err?.message || "Failed to load blog posts. Please try again later."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchPosts();
  }, []);

  const formatDate = (iso?: string) => {
    if (!iso) return "";
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "";
    }
  };

  return (
    <main className="bg-white">
      {/* HERO */}
      <section className="max-w-5xl mx-auto px-4 pt-12 pb-6">
        <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-3">
          Blog
        </h1>
        <p className="text-sm md:text-base text-slate-600 max-w-2xl">
          Learn how to stay on top of your subscriptions, save money, and avoid
          surprise renewals.
        </p>
      </section>

      <section className="max-w-5xl mx-auto px-4 pb-14">
        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">
            {error}
          </p>
        )}

        {loading ? (
          <p className="text-sm text-slate-500">Loading posts…</p>
        ) : posts.length === 0 ? (
          <p className="text-sm text-slate-500">
            No blog posts yet. Check back soon.
          </p>
        ) : (
          <div className="grid gap-6 md:grid-cols-2">
            {posts.map((post) => (
              <article
                key={post.id}
                className="rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden flex flex-col"
              >
                {post.imageUrl && (
                  <div className="h-40 w-full overflow-hidden bg-slate-100">
                    <img
                      src={post.imageUrl}
                      alt={post.imageAlt || post.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                <div className="p-4 flex flex-col flex-1">
                  <div className="flex items-center justify-between mb-2">
                    {post.category && (
                      <span className="text-[11px] font-medium uppercase tracking-wide text-blue-600">
                        {post.category}
                      </span>
                    )}
                    {post.createdAtIso && (
                      <span className="text-[11px] text-slate-400">
                        {formatDate(post.createdAtIso)}
                      </span>
                    )}
                  </div>

                  <h2 className="text-base md:text-lg font-semibold text-slate-900 mb-2">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="hover:underline"
                    >
                      {post.title}
                    </Link>
                  </h2>

                  {post.excerpt && (
                    <p className="text-sm text-slate-600 mb-3">
                      {post.excerpt}
                    </p>
                  )}

                  {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {post.tags.slice(0, 4).map((tag) => (
                        <span
                          key={tag}
                          className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mt-auto pt-2">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="text-xs font-medium text-blue-600 hover:underline"
                    >
                      Read article →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
