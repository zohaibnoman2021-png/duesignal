import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "@/lib/firebase"; // ← your existing Firebase import

const BASE_URL = "https://duesignal.com";

export async function GET() {
  // 1. Fetch posts from Firestore
  const postsRef = collection(db, "posts"); // your blog collection
  const q = query(postsRef, orderBy("createdAt", "desc"));

  const snap = await getDocs(q);

  // 2. Build <item> blocks for RSS
  const items = snap.docs
    .map((doc) => {
      const p = doc.data();

      return `
      <item>
        <title>${p.title}</title>
        <link>${BASE_URL}/blog/${p.slug}</link>
        <guid isPermaLink="true">${BASE_URL}/blog/${p.slug}</guid>
        <description>${p.metaDescription || p.excerpt || ""}</description>
      </item>`;
    })
    .join("");

  // 3. Full RSS response
  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0">
  <channel>
    <title>DueSignal Blog</title>
    <link>${BASE_URL}/blog</link>
    <description>Updates from the DueSignal blog.</description>
    ${items}
  </channel>
</rss>`;

  return new Response(rss, {
    headers: {
      "Content-Type": "application/xml",
    },
  });
}
