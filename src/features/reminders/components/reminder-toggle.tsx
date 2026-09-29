"use client";

import { useEffect, useState } from "react";
import { BellRing } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/lib/utils";

type Status = "loading" | "unsupported" | "install-first" | "denied" | "off" | "on";

const MESSAGES: Partial<Record<Status, string>> = {
  unsupported: "This browser can't show notifications.",
  "install-first": "Add LVG OS to your Home Screen first, then open it from there.",
  denied: "Notifications are blocked. Allow them in Settings → Notifications → LVG OS.",
};

function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padded = (base64 + "=".repeat((4 - (base64.length % 4)) % 4)).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(padded);
  const bytes = new Uint8Array(new ArrayBuffer(raw.length));
  for (let i = 0; i < raw.length; i++) bytes[i] = raw.charCodeAt(i);
  return bytes;
}

async function currentSubscription() {
  const registration = await navigator.serviceWorker.getRegistration();
  return registration?.pushManager.getSubscription() ?? null;
}

/** Morning and evening reminders as phone notifications. */
export function ReminderToggle() {
  const [status, setStatus] = useState<Status>("loading");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let next: Status;
      if (!("serviceWorker" in navigator) || !("PushManager" in window) || !("Notification" in window)) {
        // iPhone only allows notifications for apps added to the Home Screen.
        next = /iPhone|iPad/.test(navigator.userAgent) ? "install-first" : "unsupported";
      } else if (Notification.permission === "denied") {
        next = "denied";
      } else {
        next = (await currentSubscription()) ? "on" : "off";
      }
      if (!cancelled) setStatus(next);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const enable = async () => {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    if (!publicKey) return console.error("NEXT_PUBLIC_VAPID_PUBLIC_KEY is not set");

    const permission = await Notification.requestPermission();
    if (permission !== "granted") return setStatus(permission === "denied" ? "denied" : "off");

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(publicKey),
    });
    const { endpoint, keys } = subscription.toJSON();
    const { error } = await createClient()
      .from("push_subscriptions")
      .upsert({ endpoint, p256dh: keys?.p256dh, auth: keys?.auth }, { onConflict: "endpoint" });
    if (error) {
      console.error("Saving subscription failed", error);
      await subscription.unsubscribe();
      return setStatus("off");
    }
    setStatus("on");
  };

  const disable = async () => {
    const subscription = await currentSubscription();
    if (subscription) {
      await createClient().from("push_subscriptions").delete().eq("endpoint", subscription.endpoint);
      await subscription.unsubscribe();
    }
    setStatus("off");
  };

  const toggle = async () => {
    setBusy(true);
    try {
      await (status === "on" ? disable() : enable());
    } finally {
      setBusy(false);
    }
  };

  const canToggle = status === "on" || status === "off";
  const on = status === "on";

  return (
    <section className="rounded-2xl bg-card px-4 py-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <BellRing className="size-5 text-muted-foreground" />
          <div>
            <p className="text-[15px]">Reminders</p>
            <p className="text-xs text-muted-foreground">Morning intention and evening check-in</p>
          </div>
        </div>
        {canToggle && (
          <button
            type="button"
            role="switch"
            aria-checked={on}
            aria-label="Reminders"
            disabled={busy}
            onClick={toggle}
            className={cn(
              "relative h-7 w-12 shrink-0 rounded-full transition-colors disabled:opacity-50",
              on ? "bg-emerald-500" : "bg-muted",
            )}
          >
            <span
              className={cn(
                "absolute top-1 left-1 size-5 rounded-full bg-white transition-transform",
                on && "translate-x-5",
              )}
            />
          </button>
        )}
      </div>
      {MESSAGES[status] && <p className="mt-3 text-xs text-muted-foreground">{MESSAGES[status]}</p>}
    </section>
  );
}
