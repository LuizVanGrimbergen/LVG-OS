/** Reminders are sent for this time zone's calendar day. */
export const TIME_ZONE = "Europe/Brussels";

/** Vercel cron schedules (UTC). Hobby plan fires somewhere within the hour. */
export const SCHEDULES = {
  morning: "0 6 * * *", // 08:00–09:00 in summer, 07:00–08:00 in winter
} as const;

export type ReminderSlot = keyof typeof SCHEDULES;

export const MESSAGES: Record<ReminderSlot, { title: string; body: string }> = {
  morning: { title: "Good morning", body: "What do you want to do today?" },
};
