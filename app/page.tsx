"use client";

import Link from "next/link";
import { useAuth } from "@/providers/AuthProvider";

export default function HomePage() {
  const { user, loading } = useAuth();
  const isLoggedIn = !loading && !!user;

  return (
    <main className="bg-[#F5F7FB]">
      {/* HERO */}
      <div className="max-w-6xl mx-auto px-4 pt-10 pb-16 md:pt-16 md:pb-24">
        {/* Top badge */}
        <div className="inline-flex items-center text-[11px] font-medium text-blue-700 bg-blue-50 border border-blue-100 rounded-full px-3 py-1 mb-4">
          Stay ahead of every renewal 🔔
        </div>

        {/* Layout: text + hero illustration block */}
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          {/* Left: text */}
          <section>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-slate-900 leading-tight mb-4">
              Stay Ahead — Never Miss a{" "}
              <span className="text-blue-600">Subscription Renewal</span>
            </h1>

            <p className="text-sm md:text-base text-slate-600 mb-5 max-w-xl">
              DueSignal keeps all your subscriptions in one place, helps you
              track what you&apos;re paying for, and reminds you <b>before</b>{" "}
              every renewal — so you never get surprised by charges.
            </p>

            <p className="text-[11px] text-slate-500 mb-6">
              100% free • No credit card required • Cancel anytime
            </p>

            {/* CTA buttons */}
            <div className="flex flex-col sm:flex-row gap-3 mb-4">
              {loading ? null : isLoggedIn ? (
                // Logged in: just send them to dashboard
                <Link
                  href="/dashboard"
                  className="inline-flex items-center justify-center px-5 py-2.5 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  {/* Logged out: Get Started + Login */}
                  <Link
                    href="/auth/signup"
                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
                  >
                    Get Started for Free
                  </Link>

                  <Link
                    href="/auth/login"
                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-md border border-slate-300 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50"
                  >
                    Login
                  </Link>
                </>
              )}
            </div>

            {/* Small reassurance bullets */}
            <ul className="space-y-1 text-[11px] text-slate-500">
              <li>• Track subscriptions, trials, and recurring payments.</li>
              <li>• Email reminders before every due date.</li>
              <li>• Simple dashboard to understand your monthly spend.</li>
            </ul>
          </section>

          {/* Right: hero preview card (hidden on small screens) */}
          <section className="hidden md:block">
            <div className="relative rounded-2xl bg-white shadow-sm border border-slate-100 p-5">
              <p className="text-xs font-medium text-slate-900 mb-3">
                Upcoming renewals
              </p>
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2">
                  <div>
                    <p className="font-medium text-slate-900">Netflix</p>
                    <p className="text-[11px] text-slate-500">
                      in 3 days • 15 USD / month
                    </p>
                  </div>
                  <span className="text-[11px] font-medium text-blue-600">
                    Reminder set
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2">
                  <div>
                    <p className="font-medium text-slate-900">Spotify</p>
                    <p className="text-[11px] text-slate-500">
                      in 10 days • 10 USD / month
                    </p>
                  </div>
                  <span className="text-[11px] font-medium text-blue-600">
                    Reminder set
                  </span>
                </div>

                <div className="flex items-center justify-between rounded-xl border border-slate-100 px-3 py-2">
                  <div>
                    <p className="font-medium text-slate-900">iCloud</p>
                    <p className="text-[11px] text-slate-500">
                      in 14 days • 3 USD / month
                    </p>
                  </div>
                  <span className="text-[11px] font-medium text-slate-500">
                    Tracked
                  </span>
                </div>
              </div>

              <p className="mt-4 text-[11px] text-slate-400">
                This preview is just for the landing page. Once you sign up,
                your dashboard will show your own subscriptions and reminders.
              </p>
            </div>
          </section>
        </div>
      </div>

      {/* FEATURE CARDS */}
      <section className="bg-white border-t border-slate-200">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-14">
          <div className="text-center max-w-2xl mx-auto mb-8">
            <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-2">
              Everything you need to stay on top of your subscriptions.
            </h2>
            <p className="text-sm text-slate-600">
              DueSignal keeps your recurring payments organized, sends smart
              reminders, and helps you see exactly where your money goes.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Card 1 */}
            <div className="rounded-2xl border border-slate-100 bg-[#F9FBFF] p-5 shadow-sm">
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center mb-3 text-lg">
                💳
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-2">
                Track All Subscriptions
              </h3>
              <p className="text-[13px] text-slate-600">
                Add Netflix, Spotify, domains, SaaS tools, gym memberships and
                more — all in one simple dashboard instead of random notes.
              </p>
            </div>

            {/* Card 2 */}
            <div className="rounded-2xl border border-slate-100 bg-[#F9FBFF] p-5 shadow-sm">
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center mb-3 text-lg">
                🔔
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-2">
                Get Notified Before Due Dates
              </h3>
              <p className="text-[13px] text-slate-600">
                Choose how many days before a renewal you want an email.
                Change plans, cancel or update your card before you get charged.
              </p>
            </div>

            {/* Card 3 */}
            <div className="rounded-2xl border border-slate-100 bg-[#F9FBFF] p-5 shadow-sm">
              <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center mb-3 text-lg">
                📊
              </div>
              <h3 className="text-sm font-semibold text-slate-900 mb-2">
                Understand Your Spending
              </h3>
              <p className="text-[13px] text-slate-600">
                See your total monthly and yearly cost at a glance, broken down
                by subscription type — so you can cut what you don&apos;t use.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* SIMPLE. SECURE. FREE. */}
      <section className="bg-[#F5F7FB] border-t border-slate-200">
        <div className="max-w-3xl mx-auto px-4 py-12 md:py-16 text-center">
          <h2 className="text-xl md:text-2xl font-semibold text-slate-900 mb-3">
            Simple. Secure. And Completely Free.
          </h2>
          <p className="text-sm text-slate-600 mb-6">
            DueSignal was built for everyday users who just want clarity and
            control. No hidden fees, no credit card required — just a clean,
            easy-to-use tool that helps you stay on top of your subscriptions
            effortlessly.
          </p>
          {/* Only show this button when NOT logged in */}
          {!loading && !isLoggedIn && (
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-md bg-blue-600 text-white text-sm font-medium hover:bg-blue-700"
            >
              Create My Free Account
            </Link>
          )}
        </div>
      </section>

      {/* BOTTOM CTA STRIP */}
      <section className="bg-gradient-to-r from-blue-600 to-blue-500 text-white">
        <div className="max-w-6xl mx-auto px-4 py-10 md:py-14 text-center">
          <h2 className="text-xl md:text-2xl font-semibold mb-2">
            Get Peace of Mind — Start Tracking Today
          </h2>
          <p className="text-sm text-blue-100 mb-6 max-w-2xl mx-auto">
            Save time, avoid unnecessary renewals, and make your subscriptions
            work for you. You can get set up in under a minute — it&apos;s
            totally free.
          </p>
          {/* Only show this button when NOT logged in */}
          {!loading && !isLoggedIn && (
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-md bg-white text-blue-700 text-sm font-medium hover:bg-blue-50"
            >
              Start Free — No Credit Card Needed
            </Link>
          )}
        </div>
      </section>
    </main>
  );
}
