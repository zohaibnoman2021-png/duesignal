import Image from "next/image";

export default function AboutPage() {
  return (
    <main className="bg-white">
      {/* HERO */}
      <section className="max-w-4xl mx-auto px-4 py-14 text-center">
        <h1 className="text-3xl md:text-4xl font-semibold text-slate-900 mb-4">
          Our Mission at DueSignal
        </h1>
        <p className="text-sm md:text-base text-slate-600 max-w-2xl mx-auto">
          We believe subscription management should be simple. No surprises.
          No hidden renewals. No forgotten charges. DueSignal helps people stay
          organized, avoid unexpected costs, and stay in control of their
          digital life.
        </p>
      </section>

      {/* SECTION 1 */}
      <section className="max-w-5xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-10 md:items-center">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">
            Why We Built DueSignal
          </h2>
          <p className="text-sm text-slate-600 mb-3">
            Subscriptions are everywhere — streaming, cloud storage,
            software tools, mobile apps, and more. Most people lose track,
            forget renewal dates, and get charged for things they didn’t plan for.
          </p>
          <p className="text-sm text-slate-600">
            DueSignal solves this with one clean dashboard and automatic, timely
            reminders.
          </p>
        </div>

        <div className="rounded-2xl bg-[#F5F7FB] border border-slate-200 h-52 md:h-60 flex items-center justify-center">
          <Image
            src="/illustrations/about-mission.png"
            alt="Team working together on subscriptions in DueSignal"
            width={260}
            height={180}
            className="object-contain"
          />
        </div>
      </section>

      {/* SECTION 2 */}
      <section className="max-w-5xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-10 md:items-center">
        <div className="order-2 md:order-1">
          <h2 className="text-xl font-semibold text-slate-900 mb-3">
            Built for Everyday Users
          </h2>
          <p className="text-sm text-slate-600 mb-3">
            Whether you manage personal subscriptions or run a small business,
            DueSignal helps you avoid unwanted charges and stay organized.
          </p>
          <p className="text-sm text-slate-600">
            No technical skills needed. Everything just works out of the box.
          </p>
        </div>

        <div className="order-1 md:order-2 rounded-2xl bg-[#F5F7FB] border border-slate-200 h-52 md:h-60 flex items-center justify-center">
          <Image
            src="/illustrations/about-everyday.png"
            alt="Everyday users managing subscriptions with a simple interface"
            width={260}
            height={180}
            className="object-contain"
          />
        </div>
      </section>

      {/* SECTION 3 */}
      <section className="max-w-5xl mx-auto px-4 py-10 grid md:grid-cols-2 gap-10 md:items-center">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 mb-3">
            Privacy & Transparency First
          </h2>
          <p className="text-sm text-slate-600 mb-3">
            Your data is encrypted, stored securely, and never sold. Your
            subscriptions belong to you — and we keep it that way.
          </p>
          <p className="text-sm text-slate-600">
            Our goal is to help you save money, not make money from your data.
          </p>
        </div>

        <div className="rounded-2xl bg-[#F5F7FB] border border-slate-200 h-52 md:h-60 flex items-center justify-center">
          <Image
            src="/illustrations/about-security.png"
            alt="Secure and private subscription data in DueSignal"
            width={260}
            height={180}
            className="object-contain"
          />
        </div>
      </section>

      {/* CTA */}
      <section className="bg-blue-600 text-white mt-10">
        <div className="max-w-4xl mx-auto px-4 py-14 text-center">
          <h2 className="text-xl md:text-2xl font-semibold mb-3">
            Ready to Take Control of Your Subscriptions?
          </h2>
          <p className="text-sm text-blue-100 mb-6">
            Join thousands of users who stay ahead of renewals with DueSignal.
          </p>
          <a
            href="/auth/signup"
            className="inline-flex items-center justify-center px-5 py-2.5 rounded-md bg-white text-blue-700 text-sm font-medium hover:bg-blue-50"
          >
            Create Your Free Account
          </a>
        </div>
      </section>
    </main>
  );
}
