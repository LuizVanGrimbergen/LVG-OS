import type { NextRequest } from "next/server";
import webpush from "web-push";
import { MESSAGES, SCHEDULES, TIME_ZONE, type ReminderSlot } from "@/features/reminders/config";
import { createAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

/** Today's date in TIME_ZONE as "YYYY-MM-DD". */
function localDay(): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE }).format(new Date());
}

function slotFor(request: NextRequest): ReminderSlot | null {
  const param = request.nextUrl.searchParams.get("slot");
  if (param === "morning" || param === "evening") return param;
  const schedule = request.headers.get("x-vercel-cron-schedule");
  if (schedule === SCHEDULES.morning) return "morning";
  if (schedule === SCHEDULES.evening) return "evening";
  return null;
}

/**
 * Called by Vercel Cron twice a day. Sends a reminder to every subscribed device,
 * unless that part of today's note is already filled in (so duplicate runs are harmless).
 */
export async function GET(request: NextRequest) {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret || request.headers.get("authorization") !== `Bearer ${cronSecret}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const slot = slotFor(request);
  if (!slot) return new Response("Unknown reminder slot", { status: 400 });

  const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  if (!publicKey || !privateKey) return new Response("VAPID keys are not set", { status: 500 });
  webpush.setVapidDetails("https://lvg-os.vercel.app", publicKey, privateKey);

  const supabase = createAdminClient();
  const day = localDay();
  const [subsRes, notesRes] = await Promise.all([
    supabase.from("push_subscriptions").select("endpoint, user_id, p256dh, auth"),
    supabase.from("daily_notes").select("user_id, intention, reflection").eq("day", day),
  ]);
  if (subsRes.error) return new Response(subsRes.error.message, { status: 500 });

  const notes = new Map((notesRes.data ?? []).map((n) => [n.user_id, n]));
  const payload = JSON.stringify({ ...MESSAGES[slot], url: "/" });
  let sent = 0;
  let skipped = 0;
  let removed = 0;

  for (const sub of subsRes.data ?? []) {
    const note = notes.get(sub.user_id);
    if ((slot === "morning" && note?.intention) || (slot === "evening" && note?.reflection)) {
      skipped++;
      continue;
    }
    try {
      await webpush.sendNotification({ endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } }, payload);
      sent++;
    } catch (error) {
      // The device unsubscribed or the app was removed: forget it.
      const status = (error as { statusCode?: number }).statusCode;
      if (status === 404 || status === 410) {
        await supabase.from("push_subscriptions").delete().eq("endpoint", sub.endpoint);
        removed++;
      } else {
        console.error("Sending reminder failed", error);
      }
    }
  }

  return Response.json({ slot, day, sent, skipped, removed });
}
