"use client";

import { FormEvent, useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { db } from "@/lib/firebase";
import {
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";

type SubscriptionDoc = {
  userId: string;
  name: string;
  category?: string;
  billingCycle: string;
  amount: number;
  currency: string;
  nextDueDate?: string;
  nextReminderDate?: string;
  reminderDaysBefore?: number;
  notes?: string;
};

function computeReminderDate(nextDueDate: string, daysBefore: number): string {
  if (!nextDueDate || Number.isNaN(daysBefore)) return "";
  try {
    const d = new Date(nextDueDate + "T00:00:00");
    d.setDate(d.getDate() - daysBefore);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  } catch {
    return "";
  }
}

export default function EditSubscriptionPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("USD");
  const [nextDueDate, setNextDueDate] = useState("");
  const [reminderDaysBefore, setReminderDaysBefore] = useState("3");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [loadingDoc, setLoadingDoc] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  useEffect(() => {
    const load = async () => {
      if (!user || !id) return;

      setLoadingDoc(true);
      setError("");

      try {
        const ref = doc(db, "subscriptions", id);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          setError("Subscription not found.");
          return;
        }

        const data = snap.data() as SubscriptionDoc;

        if (data.userId !== user.uid) {
          setError("You do not have permission to edit this subscription.");
          return;
        }

        setName(data.name || "");
        setCategory(data.category || "");
        setBillingCycle(data.billingCycle || "monthly");
        setAmount(
          typeof data.amount === "number" ? String(data.amount) : ""
        );
        setCurrency(data.currency || "USD");
        setNextDueDate(data.nextDueDate || "");
        setReminderDaysBefore(
          typeof data.reminderDaysBefore === "number"
            ? String(data.reminderDaysBefore)
            : "3"
        );
        setNotes(data.notes || "");
      } catch (err: any) {
        console.error("Failed to load subscription", err);
        setError(
          err?.message || "Failed to load subscription. Please try again."
        );
      } finally {
        setLoadingDoc(false);
      }
    };

    if (!loading && user && id) {
      load();
    }
  }, [user, loading, id]);

  if (loading || !user) {
    return <div className="p-6">Checking authentication…</div>;
  }

  if (loadingDoc) {
    return <div className="p-6">Loading subscription…</div>;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const amountNumber = parseFloat(amount) || 0;
      const reminderNumber = parseInt(reminderDaysBefore || "0", 10);
      const nextReminderDate = computeReminderDate(
        nextDueDate,
        reminderNumber
      );

      const ref = doc(db, "subscriptions", id);

      await updateDoc(ref, {
        name: name.trim(),
        category: category.trim(),
        billingCycle,
        amount: amountNumber,
        currency: currency.trim(),
        nextDueDate,
        reminderDaysBefore: reminderNumber,
        nextReminderDate, // NEW
        notes: notes.trim(),
        updatedAt: serverTimestamp(),
      });

      router.push("/dashboard");
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to update subscription.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6 md:py-8">
      <h1 className="text-2xl md:text-3xl font-semibold mb-2">
        Edit Subscription
      </h1>
      <p className="text-sm text-gray-600 mb-4">
        Update your subscription details, renewal date, and reminder settings.
      </p>

      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-100 rounded p-2 mb-4">
          {error}
        </p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-sm">
        <div>
          <label className="block text-sm font-medium mb-1">
            Subscription Name
          </label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            placeholder="Netflix, Spotify, iCloud..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Category (optional)
          </label>
          <input
            type="text"
            className="w-full border rounded px-3 py-2"
            placeholder="Streaming, Music, Cloud Storage..."
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Billing Cycle
            </label>
            <select
              className="w-full border rounded px-3 py-2"
              value={billingCycle}
              onChange={(e) => setBillingCycle(e.target.value)}
            >
              <option value="monthly">Monthly</option>
              <option value="yearly">Yearly</option>
              <option value="weekly">Weekly</option>
              <option value="custom">Custom</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Amount
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                step="0.01"
                className="w-full border rounded px-3 py-2"
                placeholder="15"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />

              <select
                className="w-32 border rounded px-3 py-2 bg-white"
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
              >
                <option value="USD">USD – US Dollar</option>
                <option value="EUR">EUR – Euro</option>
                <option value="GBP">GBP – British Pound</option>
                <option value="CAD">CAD – Canadian Dollar</option>
                <option value="AUD">AUD – Australian Dollar</option>
                <option value="INR">INR – Indian Rupee</option>
                <option value="PKR">PKR – Pakistani Rupee</option>
                <option value="AED">AED – UAE Dirham</option>
                <option value="SAR">SAR – Saudi Riyal</option>
                <option value="OTHER">Other / Mixed</option>
              </select>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              Example: 15 USD, 1000 PKR, etc.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">
              Next Due Date
            </label>
            <input
              type="date"
              className="w-full border rounded px-3 py-2"
              value={nextDueDate}
              onChange={(e) => setNextDueDate(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Reminder Days Before
            </label>
            <input
              type="number"
              className="w-full border rounded px-3 py-2"
              value={reminderDaysBefore}
              onChange={(e) => setReminderDaysBefore(e.target.value)}
              min={0}
            />
            <p className="text-[11px] text-gray-500 mt-1">
              Example: 3 (3 days before), 7, 10, etc.
            </p>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">
            Notes (optional)
          </label>
          <textarea
            className="w-full border rounded px-3 py-2 h-20"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Plan type, login email, special conditions..."
          />
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={() => router.push("/dashboard")}
            className="px-4 py-2 rounded-md border border-gray-300 text-xs"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-4 py-2 rounded-md bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
