"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { db } from "@/lib/firebase";
import { UpcomingReminders } from "./components/UpcomingReminders";

import {
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";

type Subscription = {
  id: string;
  name: string;
  category?: string;
  billingCycle: string; // "monthly" | "yearly" | "weekly" | "custom"
  amount: number;
  currency: string;
  nextDueDate?: string; // "YYYY-MM-DD"
  nextReminderDate?: string; // "YYYY-MM-DD"
  reminderDaysBefore?: number;
};

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [subs, setSubs] = useState<Subscription[]>([]);
  const [subsLoading, setSubsLoading] = useState(true);
  const [subsError, setSubsError] = useState("");

  const handleDelete = async (id: string, name: string) => {
    const ok = window.confirm(
      `Are you sure you want to delete the subscription "${name}"?`
    );
    if (!ok) return;

    try {
      await deleteDoc(doc(db, "subscriptions", id));
      setSubs((prev) => prev.filter((s) => s.id !== id));
    } catch (err) {
      console.error("Failed to delete subscription", err);
      alert("Failed to delete subscription. Please try again.");
    }
  };

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  // Load subscriptions from Firestore when user is ready
  useEffect(() => {
    const fetchSubs = async () => {
      if (!user) return;

      setSubsLoading(true);
      setSubsError("");

      try {
        const q = query(
          collection(db, "subscriptions"),
          where("userId", "==", user.uid)
        );
        const snap = await getDocs(q);

        const list: Subscription[] = snap.docs.map((docSnap) => {
          const data = docSnap.data() as any;
          return {
            id: docSnap.id,
            name: data.name || "",
            category: data.category || "",
            billingCycle: data.billingCycle || "monthly",
            amount: typeof data.amount === "number" ? data.amount : 0,
            currency: data.currency || "USD",
            nextDueDate: data.nextDueDate || "",
            nextReminderDate: data.nextReminderDate || "",
            reminderDaysBefore: data.reminderDaysBefore,
          };
        });

        setSubs(list);
      } catch (err: any) {
        console.error("Failed to load subscriptions", err);
        setSubsError(
          err?.message || "Failed to load subscriptions. Please try again."
        );
      } finally {
        setSubsLoading(false);
      }
    };

    if (!loading && user) {
      fetchSubs();
    }
  }, [user, loading]);

  if (loading || !user) {
    return <div className="p-6">Loading your dashboard…</div>;
  }

  // ---------- Helpers ----------

   // Monthly totals grouped by currency
  const monthlyTotalsByCurrency = (() => {
    const totals: Record<string, number> = {};

    if (subs.length === 0) return totals;

    for (const s of subs) {
      const currency = s.currency || "USD";
      const amount = s.amount || 0;
      let monthlyAmount = 0;

      switch (s.billingCycle) {
        case "yearly":
          monthlyAmount = amount / 12;
          break;
        case "weekly":
          monthlyAmount = amount * 4.33; // rough weekly -> monthly
          break;
        case "custom":
          monthlyAmount = amount;
          break;
        default:
          monthlyAmount = amount;
      }

      totals[currency] = (totals[currency] || 0) + monthlyAmount;
    }

    // Round to 2 decimals for each currency
    Object.keys(totals).forEach((cur) => {
      totals[cur] = Math.round(totals[cur] * 100) / 100;
    });

    return totals;
  })();


  const activeSubs = subs.length;

  const upcomingRenewals = (() => {
    const today = new Date();
    const in30 = new Date();
    in30.setDate(today.getDate() + 30);

    return subs
      .filter((s) => {
        if (!s.nextDueDate) return false;
        const d = new Date(s.nextDueDate + "T00:00:00");
        return d >= today && d <= in30;
      })
      .sort((a, b) => {
        const da = new Date(a.nextDueDate! + "T00:00:00").getTime();
        const db = new Date(b.nextDueDate! + "T00:00:00").getTime();
        return da - db;
      });
  })();

  const upcomingCount = upcomingRenewals.length;

  const formatDate = (value?: string) => {
    if (!value) return "-";
    try {
      const d = new Date(value + "T00:00:00");
      return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return value;
    }
  };

  const daysUntil = (value?: string) => {
    if (!value) return "";
    const today = new Date();
    const d = new Date(value + "T00:00:00");
    const diffMs = d.getTime() - today.getTime();
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return "past due";
    if (diffDays === 0) return "today";
    if (diffDays === 1) return "in 1 day";
    return `in ${diffDays} days`;
  };

  // ---------- UI ----------

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
      {/* Top bar: title + buttons */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">Dashboard</h1>
          <p className="text-sm text-gray-600">
            See your subscriptions, upcoming renewals and monthly spending.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href="/dashboard/subscriptions/new"
              className="inline-flex items-center px-3 py-1.5 rounded-md bg-blue-600 text-white text-xs font-medium hover:bg-blue-700"
            >
              + Add Subscription
            </Link>

            <Link
              href="/dashboard/subscriptions"
              className="inline-flex items-center px-3 py-1.5 rounded-md border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              View all subscriptions
            </Link>
          </div>
        </div>
      </div>

      {/* Error message if subscriptions failed */}
      {subsError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded p-2 mb-4">
          {subsError}
        </p>
      )}

      {/* Summary cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl bg-white shadow-sm border border-slate-100 p-4">
          <p className="text-xs text-gray-500 mb-1">Estimated Monthly Spend</p>

          {Object.keys(monthlyTotalsByCurrency).length === 0 ? (
            <p className="text-2xl font-semibold text-gray-900">0.00</p>
          ) : Object.keys(monthlyTotalsByCurrency).length === 1 ? (
            // Single currency: show big number + currency
            (() => {
              const [currency, total] = Object.entries(
                monthlyTotalsByCurrency
              )[0];
              return (
                <p className="text-2xl font-semibold text-gray-900">
                  {total.toFixed(2)} {currency}
                </p>
              );
            })()
          ) : (
            // Multiple currencies
            <>
              <p className="text-2xl font-semibold text-gray-900">
                Mixed currencies
              </p>
              <p className="text-[11px] text-gray-500 mt-1">
                {Object.entries(monthlyTotalsByCurrency)
                  .map(
                    ([currency, total]) =>
                      `${(total as number).toFixed(2)} ${currency}`
                  )
                  .join(" • ")}
              </p>
            </>
          )}

          <p className="text-[11px] text-gray-400 mt-1">
            Approximation based on your active subscriptions, grouped by
            currency.
          </p>
        </div>


        <div className="rounded-xl bg-white shadow-sm border border-slate-100 p-4">
          <p className="text-xs text-gray-500 mb-1">Active Subscriptions</p>
          <p className="text-2xl font-semibold text-gray-900">{activeSubs}</p>
          <p className="text-[11px] text-gray-400 mt-1">
            Streaming, tools, storage &amp; more.
          </p>
        </div>

        <div className="rounded-xl bg-white shadow-sm border border-slate-100 p-4">
          <p className="text-xs text-gray-500 mb-1">Upcoming Renewals</p>
          <p className="text-2xl font-semibold text-gray-900">
            {upcomingCount}
          </p>
          <p className="text-[11px] text-gray-400 mt-1">
            Within the next 30 days.
          </p>
        </div>
      </div>

      {/* Content grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UpcomingReminders />

        {/* Upcoming renewals */}
        <section className="rounded-xl bg-white shadow-sm border border-slate-100 p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-800">
              Upcoming Renewals
            </h2>
            <span className="text-[11px] text-gray-500">
              Next 30 days
              {subsLoading ? " (loading…)" : ""}
            </span>
          </div>

          {subsLoading ? (
            <p className="text-sm text-gray-500">Loading subscriptions…</p>
          ) : upcomingRenewals.length === 0 ? (
            <p className="text-sm text-gray-500">
              No upcoming renewals in the next 30 days. Add a subscription or
              update due dates.
            </p>
          ) : (
            <div className="space-y-3 text-xs">
              {upcomingRenewals.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2"
                >
                  <div>
                    <p className="font-medium text-gray-800">{s.name}</p>
                    <p className="text-[11px] text-gray-500">
                      {daysUntil(s.nextDueDate)} · {s.amount} {s.currency} /{" "}
                      {s.billingCycle}
                    </p>
                    {s.nextReminderDate && (
                      <p className="text-[11px] text-blue-600 mt-0.5">
                        Reminder on {formatDate(s.nextReminderDate)}
                      </p>
                    )}
                  </div>
                  <span className="text-[11px] font-medium text-blue-600">
                    Reminder set
                  </span>
                </div>
              ))}
            </div>
          )}

          <p className="mt-3 text-[11px] text-gray-400">
            We&apos;ll later connect this to automated email reminders based on
            your reminder settings.
          </p>
        </section>

        {/* Subscriptions overview */}
        <section className="rounded-xl bg-white shadow-sm border border-slate-100 p-4 overflow-x-auto">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-800">
              Subscriptions Overview
            </h2>
            <span className="text-[11px] text-gray-500">
              {subsLoading ? "Loading…" : `${subs.length} total`}
            </span>
          </div>

          {subsLoading ? (
            <p className="text-sm text-gray-500">Loading subscriptions…</p>
          ) : subs.length === 0 ? (
            <p className="text-sm text-gray-500">
              You have no subscriptions yet. Click &quot;Add Subscription&quot;
              to create your first one.
            </p>
          ) : (
            <>
              <table className="min-w-full text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-[11px] text-gray-500">
                    <th className="text-left py-2 pr-2">Name</th>
                    <th className="text-left py-2 pr-2 hidden sm:table-cell">
                      Category
                    </th>
                    <th className="text-left py-2 pr-2">Billing</th>
                    <th className="text-left py-2 pr-2">Amount</th>
                    <th className="text-left py-2 pr-2 hidden md:table-cell">
                      Next Renewal</th>
                    <th className="text-right py-2 pl-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {subs.map((s) => (
                    <tr
                      key={s.id}
                      className="border-b border-slate-50 last:border-b-0"
                    >
                      <td className="py-2 pr-2 font-medium text-gray-800">
                        {s.name}
                      </td>
                      <td className="py-2 pr-2 text-gray-500 hidden sm:table-cell">
                        {s.category || "-"}
                      </td>
                      <td className="py-2 pr-2 text-gray-500">
                        {s.billingCycle}
                      </td>
                      <td className="py-2 pr-2 text-gray-800">
                        {s.amount} {s.currency}
                      </td>
                      <td className="py-2 pr-2 text-gray-500 hidden md:table-cell">
                        {formatDate(s.nextDueDate)}
                      </td>
                      <td className="py-2 pl-2 text-right">
                        <div className="flex justify-end gap-2">
                          <Link
                            href={`/dashboard/subscriptions/${s.id}/edit`}
                            className="text-[11px] text-blue-600 hover:underline"
                          >
                            Edit
                          </Link>
                          <button
                            type="button"
                            onClick={() => handleDelete(s.id, s.name)}
                            className="text-[11px] text-red-500 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <p className="mt-3 text-[11px] text-gray-400">
                Edit and delete controls will be added so you can manage each
                subscription from here.
              </p>
            </>
          )}
        </section>
      </div>
    </div>
  );
}
