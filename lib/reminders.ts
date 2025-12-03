// lib/reminders.ts

/**
 * nextDueDate: "YYYY-MM-DD"
 * reminderDaysBefore: number of days before due date for reminder
 * returns: "YYYY-MM-DD"
 */
export function computeNextReminderDate(
  nextDueDate: string,
  reminderDaysBefore: number
): string {
  if (!nextDueDate || reminderDaysBefore == null) {
    return nextDueDate; // fallback if something is missing
  }

  const d = new Date(nextDueDate + "T00:00:00Z"); // treat as UTC midnight
  d.setUTCDate(d.getUTCDate() - reminderDaysBefore);

  return d.toISOString().slice(0, 10); // "YYYY-MM-DD"
}
