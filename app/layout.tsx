import "./globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script"; // 👈 add this

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/providers/AuthProvider";

const inter = Inter({ subsets: ["latin"] });

// TODO: replace GOOGLE_SEARCH_CONSOLE_CODE with your real GSC value
export const metadata = {
  title: "DueSignal — Never Miss a Subscription Renewal",
  description: "Track all your subscriptions in one place and get smart email reminders before every renewal.",
  icons: {
    icon: [
      { url: "/favicon-32.png", sizes: "32x32" },
      { url: "/favicon-48.png", sizes: "48x48" },
      { url: "/favicon-64.png", sizes: "64x64" },
    ],
    apple: [
      { url: "/favicon-180.png", sizes: "180x180" },
    ],
  },
  manifest: "/manifest.json",
};


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      {/* Google Analytics (GA4) */}
      <Script
        src="https://www.googletagmanager.com/gtag/js?id=G-V95M3WPMHX"
        strategy="afterInteractive"
      />
      <Script id="ga-gtag" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-V95M3WPMHX');
        `}
      </Script>

      <body className={inter.className + " bg-slate-50 text-gray-900"}>
        <AuthProvider>
          <div className="min-h-screen flex flex-col">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
