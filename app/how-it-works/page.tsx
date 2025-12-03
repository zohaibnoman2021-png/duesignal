import Image from "next/image";

export default function HowItWorksPage() {
  return (
    <main className="bg-white">
      {/* HEADER SECTION */}
      <section className="max-w-5xl mx-auto px-4 py-14 text-center">
        <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-4">
          How It Works
        </h1>
        <p className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto">
          Track subscriptions, avoid surprise renewals, and stay in control.
          DueSignal makes subscription management simple, automated, and clear.
        </p>
      </section>

      {/* STEP 1 */}
      <section className="max-w-5xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-10 md:items-center">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">
            1. Add Your Subscriptions
          </h2>
          <p className="text-sm text-slate-600 mb-3">
            Add Netflix, Spotify, iCloud, domains, SaaS tools — anything. Keep
            everything in one simple dashboard instead of scattered notes.
          </p>
          <p className="text-sm text-blue-600 font-medium">
            Takes under 30 seconds.
          </p>
        </div>

        <div className="rounded-2xl bg-[#F5F7FB] border border-slate-200 h-52 md:h-60 flex items-center justify-center">
          <Image
            src="/illustrations/how-add-subscriptions.png"
            alt="Adding subscriptions into DueSignal"
            width={260}
            height={180}
            className="object-contain"
          />
        </div>
      </section>

      {/* STEP 2 */}
      <section className="max-w-5xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-10 md:items-center">
        <div className="order-2 md:order-1">
          <h2 className="text-xl font-semibold text-slate-900 mb-3">
            2. Get Automatic Email Reminders
          </h2>
          <p className="text-sm text-slate-600 mb-3">
            Choose how many days before renewal you want to be reminded.
            Change plans, update cards, or cancel before you get charged.
          </p>
          <p className="text-sm text-blue-600 font-medium">
            Never miss a renewal again.
          </p>
        </div>

        <div className="order-1 md:order-2 rounded-2xl bg-[#F5F7FB] border border-slate-200 h-52 md:h-60 flex items-center justify-center">
          <Image
            src="/illustrations/how-email-reminders.png"
            alt="Automatic email reminders before subscription renewals"
            width={260}
            height={180}
            className="object-contain"
          />
        </div>
      </section>

      {/* STEP 3 */}
      <section className="max-w-5xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-10 md:items-center">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">
            3. Understand Your Spending
          </h2>
          <p className="text-sm text-slate-600 mb-3">
            See your total monthly cost, yearly cost, and where your money goes.
            Make smarter decisions and stop paying for things you don’t use.
          </p>
          <p className="text-sm text-blue-600 font-medium">
            Get clarity in one glance.
          </p>
        </div>

        <div className="rounded-2xl bg-[#F5F7FB] border border-slate-200 h-52 md:h-60 flex items-center justify-center">
          <Image
            src="/illustrations/how-spending.png"
            alt="Subscription spending overview in DueSignal"
            width={260}
            height={180}
            className="object-contain"
          />
        </div>
      </section>

      {/* BOTTOM CTA */}
      <section className="bg-blue-600 text-white mt-10">
        <div className="max-w-4xl mx-auto px-4 py-14 text-center">
          <h2 className="text-xl md:text-2xl font-semibold mb-3">
            Ready to Stay Ahead of Every Renewal?
          </h2>
          <p className="text-sm text-blue-100 mb-6">
            Create your free account and take control of your subscriptions in
            under a minute.
          </p>
          <a
            href="/auth/signup"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-md bg-white text-blue-700 text-sm font-medium hover:bg-blue-50"
          >
            Get Started — It&apos;s Free
          </a>
        </div>
      </section>
    </main>
  );
}
