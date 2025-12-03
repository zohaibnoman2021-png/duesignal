"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/how-it-works", label: "How It Works" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export default function Navbar() {
  const pathname = usePathname();
  const { user, loading } = useAuth();

  return (
    <header className="border-b bg-white">
      <div className="max-w-6xl mx-auto flex items-center justify-between px-4 py-3">
        {/* Logo */}
        <Link href="/" className="font-semibold text-lg tracking-tight">
          <span className="text-blue-600">Due</span>
          <span>Signal</span>
        </Link>

        {/* Main navigation */}
        <nav className="hidden md:flex items-center gap-6 text-sm">
          {navLinks.map((link) => {
            const isActive =
              link.href === "/"
                ? pathname === "/"
                : pathname.startsWith(link.href);

            return (
              <Link
                key={link.href}
                href={link.href}
                className={
                  "hover:text-blue-600" +
                  (isActive ? " text-blue-600 font-medium" : " text-gray-600")
                }
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Right side auth area */}
        <div className="flex items-center gap-3 text-sm">
          {loading ? null : user ? (
            <>
              {/* Logged in: show email + Dashboard + Logout */}
              <span className="text-gray-700 hidden sm:inline">
                {user.email}
              </span>
              <Link
                href="/dashboard"
                className="px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                Dashboard
              </Link>
              <Link
                href="/logout"
                className="px-3 py-1 rounded-md bg-red-600 text-white hover:bg-red-700"
              >
                Logout
              </Link>
            </>
          ) : (
            <>
              {/* Logged out: Login + Get Started */}
              <Link
                href="/auth/login"
                className="px-3 py-1 rounded-md text-gray-700 hover:bg-gray-100"
              >
                Login
              </Link>
              <Link
                href="/auth/signup"
                className="px-3 py-1 rounded-md bg-blue-600 text-white hover:bg-blue-700"
              >
                Get Started
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
