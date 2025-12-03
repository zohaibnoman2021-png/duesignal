import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy | DueSignal",
  description:
    "Read the DueSignal Privacy Policy to learn how we collect, use, and protect your personal information.",
  alternates: {
    canonical: "https://www.duesignal.com/privacy-policy",
  },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-10 text-sm leading-relaxed">
      <h1 className="text-3xl font-semibold mb-4">Privacy Policy</h1>
      <p className="text-xs text-gray-500 mb-6">
        Last updated: {new Date().getFullYear()}
      </p>

      <p className="mb-4">
        DueSignal (&quot;we&quot;, &quot;our&quot;, &quot;us&quot;) provides a
        subscription tracking and reminder service. This Privacy Policy
        explains how we collect, use, and protect your information when you use
        our website and app.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2">Information We Collect</h2>
      <p className="mb-3">
        We may collect information that you provide directly to us, such as:
      </p>
      <ul className="list-disc pl-5 mb-4">
        <li>Your name and email address when you create an account</li>
        <li>
          Subscription details you choose to store (service name, amount,
          billing cycle, renewal date, notes, etc.)
        </li>
        <li>Messages you send via our contact forms or support channels</li>
      </ul>

      <p className="mb-4">
        We may also collect basic usage information automatically, such as IP
        address, browser type, device information, and pages visited. This helps
        us improve the service and maintain security.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2">
        How We Use Your Information
      </h2>
      <p className="mb-4">We use your information to:</p>
      <ul className="list-disc pl-5 mb-4">
        <li>Provide and maintain the DueSignal service</li>
        <li>Send subscription and renewal reminders you configure</li>
        <li>Respond to your questions and support requests</li>
        <li>Improve, test, and monitor the performance of our app</li>
        <li>Protect against fraud, abuse, or security issues</li>
      </ul>

      <h2 className="text-lg font-semibold mt-6 mb-2">
        Email &amp; Reminder Communications
      </h2>
      <p className="mb-4">
        Reminder emails are sent based on the subscriptions and settings you
        configure. You can change or delete subscriptions at any time from your
        dashboard to stop future reminders.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2">Data Sharing</h2>
      <p className="mb-4">
        We do not sell your personal information. We may share limited data with
        trusted third-party providers who help us operate the service (for
        example, email delivery, analytics, or hosting). These providers are
        only allowed to use your information as needed to perform their
        services for us.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2">Data Security</h2>
      <p className="mb-4">
        We use reasonable technical and organizational measures to protect your
        data. However, no method of transmission or storage is 100% secure, and
        we cannot guarantee absolute security.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2">Your Rights</h2>
      <p className="mb-4">
        You can update or delete your account and subscription data from within
        the app. If you would like to request deletion of your account or have
        questions about your data, you can contact us using the details below.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2">Contact Us</h2>
      <p className="mb-4">
        If you have any questions about this Privacy Policy, you can reach us
        at: <span className="font-medium">support@duesignal.com</span>
      </p>
    </div>
  );
}
