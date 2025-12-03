"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { db } from "@/lib/firebase";
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

export default function SubscriptionsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [subs, setSubs] = useState<Subscription[]>([]);
  const [subsLoading, setSubsLoading] = useState(true);
  const [subsError, setSubsError] = useState("");
  const [search, setSearch] = useState("");

  // redirect if not logged in
  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  // load subscriptions
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

  if (loading || !user) {
    return <div className="p-6">Loading…</div>;
  }

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

  const filteredSubs = subs.filter((s) => {
    if (!search.trim()) return true;
    const term = search.toLowerCase();
    return (
      s.name.toLowerCase().includes(term) ||
      (s.category || "").toLowerCase().includes(term)
    );
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 md:py-8">
      {/* Top bar */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold">
            All Subscriptions
          </h1>
          <p className="text-sm text-gray-600">
            Manage every subscription in one place. Edit, delete, or add new
            ones.
          </p>

          <div className="mt-3 flex flex-wrap gap-2">
            <Link
              href="/dashboard/subscriptions/new"
              className="inline-flex items-center px-3 py-1.5 rounded-md bg-blue-600 text-white text-xs font-medium hover:bg-blue-700"
            >
              + Add Subscription
            </Link>

            <Link
              href="/dashboard"
              className="inline-flex items-center px-3 py-1.5 rounded-md border border-gray-300 text-xs font-medium text-gray-700 hover:bg-gray-50"
            >
              ← Back to dashboard
            </Link>
          </div>
        </div>

        {/* Search box */}
        <div className="w-full md:w-64">
          <label className="block text-xs font-medium text-gray-600 mb-1">
            Search
          </label>
          <input
            type="text"
            className="w-full border rounded px-3 py-1.5 text-sm"
            placeholder="Search by name or category…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {subsError && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded p-2 mb-4">
          {subsError}
        </p>
      )}

      {/* Table */}
      <section className="rounded-xl bg-white shadow-sm border border-slate-100 p-4 overflow-x-auto">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-800">
            Subscriptions ({filteredSubs.length})
          </h2>
          <span className="text-[11px] text-gray-500">
            {subsLoading ? "Loading…" : `${subs.length} total`}
          </span>
        </div>

        {subsLoading ? (
          <p className="text-sm text-gray-500">Loading subscriptions…</p>
        ) : filteredSubs.length === 0 ? (
          <p className="text-sm text-gray-500">
            No subscriptions found. Try changing the search or add a new
            subscription.
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
                    Next Renewal
                  </th>
                  <th className="text-left py-2 pr-2 hidden md:table-cell">
                    Reminder
                  </th>
                  <th className="text-right py-2 pl-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSubs.map((s) => (
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
                    <td className="py-2 pr-2 text-gray-500 hidden md:table-cell">
                      {s.nextReminderDate
                        ? `${formatDate(s.nextReminderDate)}${
                            typeof s.reminderDaysBefore === "number"
                              ? ` (${s.reminderDaysBefore} days before)`
                              : ""
                          }`
                        : "-"}
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
          </>
        )}
      </section>
    </div>
  );
}
