"use client";

import { useState, FormEvent } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!name.trim() || !email.trim() || !message.trim()) {
      setError("Please fill in your name, email and message.");
      return;
    }

    setSending(true);
    try {
      await addDoc(collection(db, "contactMessages"), {
        name: name.trim(),
        email: email.trim(),
        subject: subject.trim(),
        message: message.trim(),
        createdAt: serverTimestamp(),
      });

      setSuccess("Thank you! Your message has been sent.");
      setName("");
      setEmail("");
      setSubject("");
      setMessage("");
    } catch (err: any) {
      console.error("Failed to send message", err);
      setError(
        err?.message || "Something went wrong. Please try again later."
      );
    } finally {
      setSending(false);
    }
  };

  return (
    <main className="bg-white">
      <section className="max-w-5xl mx-auto px-4 py-14">
        <div className="grid gap-10 md:grid-cols-2 md:items-start">
          {/* Left: text / contact info */}
          <div>
            <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-4">
              Contact Us
            </h1>
            <p className="text-sm md:text-base text-slate-600 mb-4">
              Have a question, feedback, or feature request?  
              Send us a message and we&apos;ll get back to you as soon as we can.
            </p>

            <div className="text-sm text-slate-700 space-y-2">
              <p>
                <span className="font-medium">Email:</span>{" "}
                <a
                  href="mailto:support@duesignal.com"
                  className="text-blue-600 underline"
                >
                  support@duesignal.com
                </a>
              </p>
              <p className="text-xs text-slate-500">
                (This can be changed later if you assign a content / support
                person with a different email.)
              </p>
            </div>
          </div>

          {/* Right: form */}
          <div className="rounded-2xl border border-slate-200 bg-[#F9FBFF] p-5 md:p-6 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900 mb-3">
              Send us a message
            </h2>

            {error && (
              <p className="mb-3 text-xs text-red-600 bg-red-50 border border-red-100 rounded px-3 py-2">
                {error}
              </p>
            )}
            {success && (
              <p className="mb-3 text-xs text-green-700 bg-green-50 border border-green-100 rounded px-3 py-2">
                {success}
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Subject (optional)
                </label>
                <input
                  type="text"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Question, feedback, bug report, etc."
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Message
                </label>
                <textarea
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white h-32 resize-none"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                disabled={sending}
                className="mt-2 inline-flex items-center justify-center px-4 py-2.5 rounded-md bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 disabled:opacity-60"
              >
                {sending ? "Sending..." : "Send Message"}
              </button>

              <p className="text-[11px] text-slate-500 mt-2">
                We&apos;ll store your message securely and use it only to
                respond to your request.
              </p>
            </form>
          </div>
        </div>
      </section>
    </main>
  );
}
