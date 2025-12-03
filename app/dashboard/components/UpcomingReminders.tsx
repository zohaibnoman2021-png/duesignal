"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { useAuth } from "@/providers/AuthProvider";

type Subscription = {
  id: string;
  name: string;
  amount: number;
  currency: string;
  nextDueDate?: string;
  nextReminderDate?: string;
  reminderDaysBefore?: number;
};

export function UpcomingReminders() {
  const { user, loading } = useAuth();

  const [subs, setSubs] = useState<Subscription[]>([]);
  const [subsLoading, setSubsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!user) {
        setSubs([]);
        setSubsLoading(false);
        return;
      }

      try {
        setSubsLoading(true);
        setError(null);

        // 🔹 SAME PATTERN AS DASHBOARD: filter by userId
        const q = query(
          collection(db, "subscriptions"),
          where("userId", "==", user.uid)
        );

        const snap = await getDocs(q);

        const items: Subscription[] = snap.docs.map((doc) => {
          const data = doc.data() as any;
          return {
            id: doc.id,
            name: data.name || "",
            amount: typeof data.amount === "number" ? data.amount : 0,
            currency: data.currency || "USD",
            nextDueDate: data.nextDueDate || "",
            nextReminderDate: data.nextReminderDate || "",
            reminderDaysBefore: data.reminderDaysBefore,
          };
        });

        // 🔹 Only keep ones with a reminder, sort by date, take top 5
        const sorted = items
          .filter((s) => s.nextReminderDate)
          .sort((a, b) => {
            const da = new Date(a.nextReminderDate! + "T00:00:00").getTime();
            const db = new Date(b.nextReminderDate! + "T00:00:00").getTime();
            return da - db;
          })
          .slice(0, 5);

        setSubs(sorted);
      } catch (err: any) {
        console.error("Error loading upcoming reminders", err);
        setError("Failed to load reminders.");
      } finally {
        setSubsLoading(false);
      }
    };

    if (!loading) {
      load();
    }
  }, [user, loading]);

  // ---------- UI STATES ----------

  if (subsLoading) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-500">
        Loading upcoming reminders…
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    );
  }

  if (subs.length === 0) {
    return (
      <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-500">
        No upcoming reminders yet. Add a subscription to get started.
      </div>
    );
  }

  // Small helper for nicer dates
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

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-gray-900">
          Upcoming reminders
        </h2>
        <span className="text-xs text-gray-500">
          Next {subs.length} reminder{subs.length > 1 ? "s" : ""}
        </span>
      </div>

      <ul className="space-y-2">
        {subs.map((sub) => (
          <li
            key={sub.id}
            className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-sm"
          >
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">{sub.name}</span>
              <span className="text-xs text-gray-500">
                Due on {formatDate(sub.nextDueDate)}
                {typeof sub.reminderDaysBefore === "number" &&
                  ` · reminder ${sub.reminderDaysBefore} day(s) before`}
              </span>
            </div>
            <div className="text-right text-sm font-semibold text-gray-900">
              {sub.amount}{" "}
              <span className="text-xs font-normal text-gray-500">
                {sub.currency}
              </span>
              {sub.nextReminderDate && (
                <div className="mt-0.5 text-[11px] text-gray-500">
                  Next reminder: {formatDate(sub.nextReminderDate)}
                </div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
