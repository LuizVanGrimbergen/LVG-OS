"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { CloudOff, RefreshCw } from "lucide-react";
import { flushQueue, onQueueChange, queueLength } from "@/lib/offline-queue";
import { createClient } from "@/lib/supabase/client";

const RETRY_MS = 30_000;

async function authHeaders(): Promise<Record<string, string> | null> {
  const { data } = await createClient().auth.getSession();
  if (!data.session) return null;
  return {
    apikey: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    Authorization: `Bearer ${data.session.access_token}`,
  };
}

/** Sends changes made offline once the connection is back, and shows how many are waiting. */
export function OfflineSync() {
  const [waiting, setWaiting] = useState(0);
  const [online, setOnline] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const busy = useRef(false);

  useEffect(() => {
    const sync = async () => {
      if (busy.current || !navigator.onLine || queueLength() === 0) return;
      busy.current = true;
      setSyncing(true);
      try {
        await flushQueue({ authHeaders });
      } finally {
        busy.current = false;
        setSyncing(false);
      }
    };
    const update = () => {
      setWaiting(queueLength());
      setOnline(navigator.onLine);
    };
    const onChange = () => {
      update();
      void sync();
    };

    update();
    void sync();
    const unsubscribe = onQueueChange(onChange);
    window.addEventListener("online", onChange);
    window.addEventListener("offline", update);
    document.addEventListener("visibilitychange", onChange);
    const timer = window.setInterval(() => void sync(), RETRY_MS);
    return () => {
      unsubscribe();
      window.removeEventListener("online", onChange);
      window.removeEventListener("offline", update);
      document.removeEventListener("visibilitychange", onChange);
      window.clearInterval(timer);
    };
  }, []);

  const show = !online || waiting > 0;
  const changes = `${waiting} ${waiting === 1 ? "change" : "changes"}`;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          role="status"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          className="pointer-events-none fixed inset-x-0 top-[calc(env(safe-area-inset-top)+0.75rem)] z-90 flex justify-center"
        >
          <p className="flex items-center gap-1.5 rounded-full border border-border bg-card/95 px-3 py-1.5 text-xs text-muted-foreground shadow-lg backdrop-blur">
            {online ? <RefreshCw className={syncing ? "size-3.5 animate-spin" : "size-3.5"} /> : <CloudOff className="size-3.5" />}
            {!online
              ? waiting > 0
                ? `Offline · ${changes} will sync`
                : "Offline · changes will sync later"
              : `Syncing ${changes}…`}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
