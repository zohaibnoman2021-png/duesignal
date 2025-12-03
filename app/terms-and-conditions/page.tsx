import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions | DueSignal",
  description:
    "Read the Terms & Conditions for using DueSignal, including your responsibilities, acceptable use, and limitations of liability.",
  alternates: {
    canonical: "https://www.duesignal.com/terms-and-conditions",
  },
};

export default function TermsAndConditionsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8 md:py-10 text-sm leading-relaxed">
      <h1 className="text-3xl font-semibold mb-4">Terms &amp; Conditions</h1>
      <p className="text-xs text-gray-500 mb-6">
        Last updated: {new Date().getFullYear()}
      </p>

      <p className="mb-4">
        These Terms &amp; Conditions (&quot;Terms&quot;) govern your access to
        and use of the DueSignal website and app (&quot;Service&quot;). By
        creating an account or using the Service, you agree to be bound by
        these Terms.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2">Use of the Service</h2>
      <p className="mb-4">
        You agree to use DueSignal only for lawful purposes and in accordance
        with these Terms. You are responsible for the accuracy of the
        subscription information you enter and for maintaining the security of
        your account login details.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2">No Financial Advice</h2>
      <p className="mb-4">
        DueSignal is a subscription tracking and reminder tool. It does not
        provide financial, tax, or legal advice. You are responsible for making
        your own decisions about subscriptions, payments, and cancellations.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2">
        Emails and Notifications
      </h2>
      <p className="mb-4">
        The Service may send you emails or notifications based on the reminder
        settings you configure. While we aim for reminders to be reliable, we
        cannot guarantee delivery or timing, and you remain responsible for
        managing your own subscriptions and payments.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2">
        Third-Party Services
      </h2>
      <p className="mb-4">
        DueSignal may integrate with or link to third-party services
        (for example, email providers or analytics). We are not responsible for
        the content, policies, or practices of third-party sites or services.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2">
        Limitation of Liability
      </h2>
      <p className="mb-4">
        To the maximum extent permitted by law, DueSignal and its owners will
        not be liable for any indirect, incidental, consequential, or special
        damages, including missed payments, unwanted renewals, or losses arising
        from your use of or inability to use the Service.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2">Termination</h2>
      <p className="mb-4">
        We may suspend or terminate your access to the Service if we believe you
        are violating these Terms or using the Service in a harmful or abusive
        way. You may stop using the Service at any time by deleting your
        account.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2">Changes to These Terms</h2>
      <p className="mb-4">
        We may update these Terms from time to time. If changes are material, we
        will take reasonable steps to notify you (for example, via email or a
        notice in the app). Your continued use of the Service after changes
        become effective means you accept the updated Terms.
      </p>

      <h2 className="text-lg font-semibold mt-6 mb-2">Contact Us</h2>
      <p className="mb-4">
        If you have any questions about these Terms, you can contact us at:{" "}
        <span className="font-medium">support@duesignal.com</span>
      </p>
    </div>
  );
}
