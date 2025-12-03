"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";

export default function AdminBlogPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  if (loading) {
    return <div className="p-6">Checking authentication…</div>;
  }

  if (!user) {
    router.push("/auth/login");
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl md:text-3xl font-semibold mb-2">
        Blog Admin
      </h1>
      <p className="text-sm text-gray-600 mb-6">
        Manage your blog posts here. You can create new posts and edit existing ones.
      </p>

      <div className="flex gap-3 mb-6">
        <button
          onClick={() => router.push("/admin/blog/new")}
          className="px-4 py-2 rounded-md bg-blue-600 text-white text-xs font-medium hover:bg-blue-700"
        >
          + New Post
        </button>
      </div>

      <p className="text-sm text-gray-500">
        (We will later show a list of posts here from Firestore.)
      </p>
    </div>
  );
}
