"use client";

import { useAuth } from "@/providers/AuthProvider";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { db } from "@/lib/firebase";
import {
  collection,
  getDocs,
  orderBy,
  query,
  deleteDoc,
  doc,
} from "firebase/firestore";

type Post = {
  id: string;
  title: string;
  slug: string;
  category?: string;
  published?: boolean;
  createdAt?: any;
};

export default function AdminBlogPage() {
  const { user, role, loading } = useAuth();
  const router = useRouter();

  const [posts, setPosts] = useState<Post[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [error, setError] = useState("");

  // delete modal state
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [postToDelete, setPostToDelete] = useState<Post | null>(null);
  const [deleting, setDeleting] = useState(false);

  // protect route
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/auth/login");
      } else if (role !== "admin") {
        router.push("/dashboard");
      }
    }
  }, [user, role, loading, router]);

  // load posts
  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const q = query(
          collection(db, "posts"),
          orderBy("createdAt", "desc")
        );
        const snap = await getDocs(q);

        const items: Post[] = [];
        snap.forEach((docSnap) => {
          const data = docSnap.data() as any;
          items.push({
            id: docSnap.id,
            title: data.title,
            slug: data.slug,
            category: data.category,
            published: data.published,
            createdAt: data.createdAt,
          });
        });

        setPosts(items);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load posts");
      } finally {
        setLoadingPosts(false);
      }
    };

    if (user && role === "admin") {
      fetchPosts();
    }
  }, [user, role]);

  // open modal
  const openDeleteModal = (post: Post) => {
    setPostToDelete(post);
    setShowDeleteModal(true);
  };

  // confirm deletion
  const confirmDelete = async () => {
    if (!postToDelete) return;

    try {
      setDeleting(true);
      await deleteDoc(doc(db, "posts", postToDelete.id));

      // remove from local state
      setPosts((prev) => prev.filter((p) => p.id !== postToDelete.id));
      setShowDeleteModal(false);
      setPostToDelete(null);
    } catch (err) {
      console.error(err);
      alert("Failed to delete post");
    } finally {
      setDeleting(false);
    }
  };

  // cancel modal
  const cancelDelete = () => {
    setShowDeleteModal(false);
    setPostToDelete(null);
  };

  if (loading || !user || role !== "admin") {
    return <div className="p-6">Checking admin access…</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Blog CMS</h1>

        <Link
          href="/admin/blog/new"
          className="px-4 py-2 rounded bg-blue-600 text-white text-sm"
        >
          + New Post
        </Link>
      </div>

      {error && (
        <p className="text-red-500 mb-4 text-sm bg-red-50 border border-red-100 rounded px-3 py-2">
          {error}
        </p>
      )}

      {loadingPosts ? (
        <p>Loading posts…</p>
      ) : posts.length === 0 ? (
        <p>No posts yet. Create your first one!</p>
      ) : (
        <table className="w-full text-sm border border-gray-200 rounded overflow-hidden">
          <thead className="bg-gray-100">
            <tr>
              <th className="text-left p-2 border-b">Title</th>
              <th className="text-left p-2 border-b">Slug</th>
              <th className="text-left p-2 border-b">Category</th>
              <th className="text-left p-2 border-b">Status</th>
              <th className="text-left p-2 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post) => (
              <tr key={post.id} className="border-b">
                <td className="p-2">{post.title}</td>
                <td className="p-2 text-gray-600">{post.slug}</td>
                <td className="p-2 text-gray-600">
                  {post.category || "-"}
                </td>
                <td className="p-2">
                  {post.published ? (
                    <span className="text-green-600">Published</span>
                  ) : (
                    <span className="text-yellow-600">Draft</span>
                  )}
                </td>
                <td className="p-2 space-x-2">
                  <Link
                    href={`/admin/blog/${post.id}`}
                    className="text-blue-600 underline"
                  >
                    View
                  </Link>
                  <Link
                    href={`/admin/blog/${post.id}/edit`}
                    className="text-purple-600 underline"
                  >
                    Edit
                  </Link>
                  <button
                    onClick={() => openDeleteModal(post)}
                    className="text-red-600 underline"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* Delete confirmation modal */}
      {showDeleteModal && postToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-lg">
            <h2 className="text-lg font-semibold text-gray-800 mb-2">
              Delete this post?
            </h2>
            <p className="text-sm text-gray-600 mb-4">
              You&apos;re about to delete:
            </p>
            <p className="text-sm font-medium text-gray-900 mb-6">
              &ldquo;{postToDelete.title}&rdquo;
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={cancelDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm rounded-md border border-gray-300 hover:bg-gray-100 disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="px-4 py-2 text-sm rounded-md bg-red-600 text-white hover:bg-red-700 disabled:opacity-60"
              >
                {deleting ? "Deleting…" : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
