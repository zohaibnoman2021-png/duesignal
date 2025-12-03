"use client";

import { useAuth } from "@/providers/AuthProvider";
import {
  useEffect,
  useState,
  FormEvent,
  ChangeEvent,
} from "react";
import { useRouter, useParams } from "next/navigation";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import Link from "next/link";

const CLOUDINARY_CLOUD_NAME = "dorwbynwt";
const CLOUDINARY_UPLOAD_PRESET = "duesignal_unsigned";

export default function EditPostPage() {
  const { user, role, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [contentHtml, setContentHtml] = useState("");
  const [published, setPublished] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [loadingPost, setLoadingPost] = useState(true);

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

  // load existing post
  useEffect(() => {
    const fetchPost = async () => {
      try {
        const ref = doc(db, "posts", id);
        const snap = await getDoc(ref);
        if (!snap.exists()) {
          setError("Post not found");
          return;
        }

        const data = snap.data() as any;
        setTitle(data.title || "");
        setSlug(data.slug || "");
        setAuthor(data.author || "");
        setCategory(data.category || "");
        setTags((data.tags || []).join(", "));
        setImageUrl(data.imageUrl || "");
        setImageAlt(data.imageAlt || "");
        setContentHtml(data.contentHtml || "");
        setPublished(data.published ?? true);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Failed to load post");
      } finally {
        setLoadingPost(false);
      }
    };

    if (user && role === "admin" && id) {
      fetchPost();
    }
  }, [user, role, id]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const finalSlug =
        slug.trim() ||
        title
          .toLowerCase()
          .trim()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/^-+|-+$/g, "");

      const tagsArray = tags
        .split(",")
        .map((t) => t.trim())
        .filter((t) => t.length > 0);

      const ref = doc(db, "posts", id);

      await updateDoc(ref, {
        title: title.trim(),
        slug: finalSlug,
        author: author.trim() || user?.email,
        category: category.trim(),
        tags: tagsArray,
        imageUrl: imageUrl.trim(),
        imageAlt: imageAlt.trim(),
        contentHtml: contentHtml.trim(),
        published,
        updatedAt: serverTimestamp(),
      });

      router.push("/admin/blog");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to update post");
    }

    setSaving(false);
  };

  const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

      const res = await fetch(
        `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: "POST",
          body: formData,
        }
      );

      const data = await res.json();

      if (!res.ok) {
        const msg =
          (data as any)?.error?.message || "Cloudinary upload failed";
        setError(msg);
      } else if (data.secure_url) {
        setImageUrl(data.secure_url);
      } else {
        setError("No secure_url returned from Cloudinary");
      }
    } catch (err) {
      console.error("Cloudinary upload failed", err);
      setError("Cloudinary upload request failed");
    }

    setUploadingImage(false);
  };

  if (loading || !user || role !== "admin") {
    return <div className="p-6">Checking admin access…</div>;
  }

  if (loadingPost) {
    return <div className="p-6">Loading post…</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-semibold">Edit Blog Post</h1>
        <Link
          href="/admin/blog"
          className="px-4 py-2 rounded bg-gray-200 text-sm"
        >
          Back to Blog CMS
        </Link>
      </div>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* same form fields as NewPostPage */}
        <div>
          <label className="block text-sm font-medium mb-1">Title</label>
          <input
            type="text"
            className="w-full border rounded p-2"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Slug (optional – auto from title if empty)
          </label>
          <input
            type="text"
            className="w-full border rounded p-2"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="how-to-manage-subscriptions"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Author</label>
            <input
              type="text"
              className="w-full border rounded p-2"
              value={author}
              onChange={(e) => setAuthor(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <input
              type="text"
              className="w-full border rounded p-2"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Subscriptions, Finance, etc."
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Tags (comma separated)
          </label>
          <input
            type="text"
            className="w-full border rounded p-2"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="subscriptions, netflix, budgeting"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Image Upload (Cloudinary)
            </label>
            <input
              type="file"
              accept="image/*"
              className="w-full"
              onChange={handleImageUpload}
            />
            <p className="text-xs text-gray-500 mt-1">
              Choose an image to upload. After upload, the URL will be filled
              below.
            </p>

            <input
              type="text"
              className="w-full border rounded p-2 mt-2"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              placeholder="Image URL (auto-filled after upload)"
            />

            {uploadingImage && (
              <p className="text-xs text-blue-600 mt-1">Uploading image...</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Image Alt</label>
            <input
              type="text"
              className="w-full border rounded p-2"
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
              placeholder="Short description of the image"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Content HTML (paste full HTML)
          </label>
          <textarea
            className="w-full border rounded p-2 h-56 font-mono text-sm"
            value={contentHtml}
            onChange={(e) => setContentHtml(e.target.value)}
            placeholder="<p>This is my blog post...</p>"
          />
          <p className="text-xs text-gray-500 mt-1">
            You can paste HTML from your editor here. We will render it on the
            blog page.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="published"
            type="checkbox"
            checked={published}
            onChange={(e) => setPublished(e.target.checked)}
          />
          <label htmlFor="published" className="text-sm">
            Published (visible on public blog)
          </label>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="px-6 py-2 rounded bg-blue-600 text-white text-sm"
        >
          {saving ? "Saving..." : "Update Post"}
        </button>
      </form>
    </div>
  );
}
