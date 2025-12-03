import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t bg-white mt-8">
      <div className="max-w-6xl mx-auto px-4 py-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3 text-xs text-gray-500">
        <p>© {new Date().getFullYear()} DueSignal. All rights reserved.</p>

        <div className="flex gap-4">
         <Link href="/privacy-policy" className="...">
  Privacy Policy
</Link>
<Link href="/terms-and-conditions" className="...">
  Terms &amp; Conditions
</Link>

        </div>
      </div>
    </footer>
  );
}
