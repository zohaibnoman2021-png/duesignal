import { onSchedule } from "firebase-functions/v2/scheduler";
import { onRequest } from "firebase-functions/v2/https";
import { onInit } from "firebase-functions/v2";
import * as logger from "firebase-functions/logger";

import { initializeApp } from "firebase-admin/app";
import { getFirestore, FieldValue } from "firebase-admin/firestore";

import sgMail from "@sendgrid/mail";
import { defineSecret } from "firebase-functions/params";

// --------- Secret: SendGrid API key ----------
const SENDGRID_API_KEY = defineSecret("SENDGRID_API_KEY");

onInit(() => {
  const key = SENDGRID_API_KEY.value();
  sgMail.setApiKey(key);
  logger.info("SendGrid initialized!");
});

// --------- Types ----------
type BillingCycle = "monthly" | "yearly" | "weekly" | "custom" | string;

type SubscriptionData = {
  id: string;
  name: string;
  amount: number;
  currency: string;
  nextDueDate?: string;        // "YYYY-MM-DD"
  nextReminderDate?: string;   // "YYYY-MM-DD"
  reminderDaysBefore?: number;
  userEmail?: string;
  billingCycle?: BillingCycle;
};

// --------- Firestore init ----------
const app = initializeApp();
const db = getFirestore(app);

// --------- Date helpers ----------
function formatYMD(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, "0");
  const day = String(date.getUTCDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function parseYMD(value: string): Date | null {
  if (!value) return null;
  const [y, m, d] = value.split("-").map((x) => parseInt(x, 10));
  if (!y || !m || !d) return null;
  // Use UTC so we don't get timezone shifts
  return new Date(Date.UTC(y, m - 1, d));
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date.getTime());
  result.setUTCDate(result.getUTCDate() + days);
  return result;
}

function addMonths(date: Date, months: number): Date {
  const result = new Date(date.getTime());
  const d = result.getUTCDate();
  result.setUTCDate(1);
  result.setUTCMonth(result.getUTCMonth() + months);
  const lastDay = new Date(
    Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)
  ).getUTCDate();
  result.setUTCDate(Math.min(d, lastDay));
  return result;
}

function addYears(date: Date, years: number): Date {
  const result = new Date(date.getTime());
  const d = result.getUTCDate();
  result.setUTCDate(1);
  result.setUTCFullYear(result.getUTCFullYear() + years);
  const lastDay = new Date(
    Date.UTC(result.getUTCFullYear(), result.getUTCMonth() + 1, 0)
  ).getUTCDate();
  result.setUTCDate(Math.min(d, lastDay));
  return result;
}

/**
 * Compute the next schedule (nextDueDate / nextReminderDate) based on
 * billingCycle and reminderDaysBefore. Returns null if we shouldn't update.
 */
function computeNextSchedule(
  currentDueDateStr: string | undefined,
  billingCycle: BillingCycle | undefined,
  reminderDaysBefore?: number
):
  | {
      nextDueDate: string;
      nextReminderDate?: string;
    }
  | null {
  if (!currentDueDateStr) return null;
  if (
    billingCycle !== "monthly" &&
    billingCycle !== "yearly" &&
    billingCycle !== "weekly"
  ) {
    // For "custom" or unknown cycles, don't auto-advance
    return null;
  }
  const currentDue = parseYMD(currentDueDateStr);
  if (!currentDue) return null;

  let nextDue: Date;
  switch (billingCycle) {
    case "monthly":
      nextDue = addMonths(currentDue, 1);
      break;
    case "yearly":
      nextDue = addYears(currentDue, 1);
      break;
    case "weekly":
      nextDue = addDays(currentDue, 7);
      break;
    default:
      return null;
  }

  const nextDueStr = formatYMD(nextDue);

  let nextReminderStr: string | undefined;
  if (typeof reminderDaysBefore === "number" && reminderDaysBefore >= 0) {
    const remindDate = addDays(nextDue, -reminderDaysBefore);
    nextReminderStr = formatYMD(remindDate);
  }

  return {
    nextDueDate: nextDueStr,
    nextReminderDate: nextReminderStr,
  };
}

// Helper: today's date in YYYY-MM-DD (UTC)
function todayYMD(): string {
  const now = new Date();
  return formatYMD(
    new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()))
  );
}

// --------- Reminder log helpers (for idempotency) ----------
async function hasReminderAlreadySent(
  subscriptionId: string,
  dateStr: string
): Promise<boolean> {
  const snap = await db
    .collection("reminderLogs")
    .where("subscriptionId", "==", subscriptionId)
    .where("nextReminderDate", "==", dateStr)
    .limit(1)
    .get();

  return !snap.empty;
}

// --------- SendGrid email ----------
async function sendReminderEmail(
  userEmail: string,
  subscription: SubscriptionData
): Promise<void> {
  const subject = `Reminder: ${subscription.name} is due ${subscription.nextDueDate}`;

  const text = `
DueSignal Reminder

Your subscription "${subscription.name}" is due on ${subscription.nextDueDate}.
Amount: ${subscription.amount} ${subscription.currency}
Reminder offset: ${subscription.reminderDaysBefore} day(s) before.

You’re receiving this because you added this subscription in DueSignal.
  `.trim();

  const html = `
    <div style="font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background:#f5f5f7; padding:24px;">
      <div style="max-width:520px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 6px 24px rgba(15, 23, 42, 0.12);">
        <div style="background:#0f172a; color:#f9fafb; padding:16px 20px;">
          <div style="font-size:18px; font-weight:600;">DueSignal</div>
          <div style="font-size:13px; opacity:0.8;">Subscription Reminder</div>
        </div>
        <div style="padding:20px 20px 8px 20px; color:#0f172a;">
          <p style="margin:0 0 12px 0;">Hi,</p>
          <p style="margin:0 0 16px 0;">
            This is a friendly reminder that your subscription
            <strong>${subscription.name}</strong> is coming up.
          </p>

          <table style="width:100%; border-collapse:collapse; margin:8px 0 16px 0; font-size:14px;">
            <tr>
              <td style="padding:6px 0; color:#6b7280;">Next due date</td>
              <td style="padding:6px 0; text-align:right; font-weight:500;">${subscription.nextDueDate}</td>
            </tr>
            <tr>
              <td style="padding:6px 0; color:#6b7280;">Amount</td>
              <td style="padding:6px 0; text-align:right; font-weight:500;">
                ${subscription.amount} ${subscription.currency}
              </td>
            </tr>
            <tr>
              <td style="padding:6px 0; color:#6b7280;">Reminder offset</td>
              <td style="padding:6px 0; text-align:right;">
                ${subscription.reminderDaysBefore} day(s) before
              </td>
            </tr>
          </table>

          <p style="margin:0 0 16px 0; font-size:13px; color:#6b7280;">
            You added this subscription in your DueSignal dashboard.
          </p>
        </div>
        <div style="border-top:1px solid #e5e7eb; padding:12px 20px; background:#f9fafb; color:#9ca3af; font-size:11px;">
          <div>You're receiving this email because you use DueSignal to track your subscriptions.</div>
          <div style="margin-top:4px;">If this wasn't you, you can ignore this email.</div>
        </div>
      </div>
    </div>
  `;

  const msg = {
    to: userEmail,
    from: "noreply@duesignal.com",
    subject,
    text,
    html,
  };

  try {
    await sgMail.send(msg);
    logger.info(
      `✅ Email sent to ${userEmail} for subscription ${subscription.id}`
    );
  } catch (error: any) {
    logger.error("❌ Error sending SendGrid email", {
      errorMessage: error?.message,
      responseBody: error?.response?.body,
    });
  }
}

// --------- Core logic ---------
async function processRemindersForDate(dateStr: string): Promise<void> {
  logger.info(`Processing reminders for date = ${dateStr}`);

  const snap = await db
    .collection("subscriptions")
    .where("nextReminderDate", "==", dateStr)
    .get();

  if (snap.empty) {
    logger.info("No subscriptions with nextReminderDate = " + dateStr);
    return;
  }

  logger.info(`Found ${snap.size} subscription(s) to remind.`);

  const batch = db.batch();
  const emailPromises: Promise<unknown>[] = [];

  // Use for..of so we can await inside
  for (const docSnap of snap.docs) {
    const data = docSnap.data() as any;

    const subscription: SubscriptionData = {
      id: docSnap.id,
      name: data.name,
      amount: data.amount,
      currency: data.currency,
      nextDueDate: data.nextDueDate,
      nextReminderDate: data.nextReminderDate,
      reminderDaysBefore: data.reminderDaysBefore,
      userEmail: data.userEmail,
      billingCycle: data.billingCycle,
    };

    // Idempotency: check if we've already logged a reminder for this sub+date
    const alreadySent = await hasReminderAlreadySent(subscription.id, dateStr);
    if (alreadySent) {
      logger.info(
        `Skipping subscription ${subscription.id} for ${dateStr} because reminder already sent`
      );
      continue;
    }

    // Create reminder log
    const logRef = db.collection("reminderLogs").doc();
    batch.set(logRef, {
      subscriptionId: subscription.id,
      userEmail: subscription.userEmail || null,
      nextDueDate: subscription.nextDueDate || null,
      reminderDaysBefore: subscription.reminderDaysBefore ?? null,
      nextReminderDate: dateStr,
      createdAt: FieldValue.serverTimestamp(),
    });

    logger.info(
      `Queued reminder log for subscription ${subscription.id} -> ${subscription.userEmail}`
    );

    // Send email if we have an email address
    if (subscription.userEmail) {
      emailPromises.push(
        sendReminderEmail(subscription.userEmail, subscription)
      );
    } else {
      logger.warn(
        `No userEmail for subscription ${subscription.id}, skipping email`
      );
    }

    // Auto-advance to next cycle (Option A)
    const schedule = computeNextSchedule(
      subscription.nextDueDate,
      subscription.billingCycle,
      subscription.reminderDaysBefore
    );

    if (schedule) {
      const subRef = db.collection("subscriptions").doc(subscription.id);
      batch.update(subRef, {
        nextDueDate: schedule.nextDueDate,
        nextReminderDate: schedule.nextReminderDate || null,
      });
      logger.info(
        `Updated subscription ${subscription.id} to nextDueDate=${schedule.nextDueDate}, nextReminderDate=${schedule.nextReminderDate}`
      );
    } else {
      logger.info(
        `Subscription ${subscription.id} not auto-advanced (billingCycle=${subscription.billingCycle}, nextDueDate=${subscription.nextDueDate})`
      );
    }
  }

  // Commit all Firestore writes
  await batch.commit();
  logger.info("Reminder logs & schedule updates written for " + dateStr);

  if (emailPromises.length > 0) {
    await Promise.all(emailPromises);
    logger.info(`All reminder emails processed for date ${dateStr}`);
  } else {
    logger.info("No reminder emails to send for " + dateStr);
  }
}

// --------- Triggers ---------

// Daily scheduled function
export const sendDueSubscriptionReminders = onSchedule(
  {
    schedule: "0 6 * * *",
    timeZone: "Asia/Karachi",
    secrets: [SENDGRID_API_KEY],
  },
  async () => {
    const today = todayYMD();
    await processRemindersForDate(today);
  }
);

// Manual HTTP test
//   Example: ?date=2030-01-01
export const testRunReminders = onRequest(
  {
    secrets: [SENDGRID_API_KEY],
  },
  async (req, res) => {
    try {
      const dateParam = (req.query.date as string) || todayYMD();
      logger.info(`Manual testRunReminders called for date = ${dateParam}`);

      await processRemindersForDate(dateParam);

      res.status(200).json({
        ok: true,
        message: `Reminder job executed for date ${dateParam}`,
        date: dateParam,
      });
    } catch (err: any) {
      logger.error("Error in testRunReminders", err);
      res.status(500).json({
        ok: false,
        error: "Error running reminder job",
      });
    }
  }
);
