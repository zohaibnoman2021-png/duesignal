"use client";

import { useAuth } from "@/providers/AuthProvider";
import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import Link from "next/link";

type Post = {
  title: string;
  slug: string;
  author?: string;
  category?: string;
  tags?: string[];
  imageUrl?: string;
  imageAlt?: string;
  contentHtml?: string;
  published?: boolean;
};

export default function AdminPostViewPage() {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [post, setPost] = useState<Post | null>(null);
  const [loadingPost, setLoadingPost] = useState(true);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/auth/login");
        return;
      }
      if (role !== "admin") {
        router.push("/dashboard");
        return;
      }
    }
  }, [user, role, loading, router]);

  useEffect(() => {
    const fetchPost = async () => {
      if (!id) return;

      try {
        const ref = doc(db, "posts", id);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setPost(snap.data() as Post);
        } else {
          setPost(null);
        }
      } finally {
        setLoadingPost(false);
      }
    };

    if (user && role === "admin") {
      fetchPost();
    }
  }, [id, user, role]);

  if (loading || !user || role !== "admin") {
    return <div className="p-6">Checking admin access…</div>;
  }

  if (loadingPost) {
    return <div className="p-6">Loading post…</div>;
  }

  if (!post) {
    return (
      <div className="p-6">
        <p>Post not found.</p>
        <Link href="/admin/blog" className="text-blue-600 underline">
          Back to Blog CMS
        </Link>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h1 className="text-3xl font-semibold mb-1">{post.title}</h1>
          <p className="text-sm text-gray-500">
            Slug: {post.slug} {post.published ? "(Published)" : "(Draft)"}
          </p>
        </div>
        <Link
          href="/admin/blog"
          className="px-4 py-2 rounded bg-gray-200 text-sm"
        >
          Back to Blog CMS
        </Link>
      </div>

      {post.imageUrl && (
        <div className="mb-4">
          <img
            src={post.imageUrl}
            alt={post.imageAlt || ""}
            className="w-full rounded"
          />
        </div>
      )}

      {post.contentHtml && (
        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />
      )}
    </div>
  );
}
