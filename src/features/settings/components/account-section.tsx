"use client";

import { useEffect, useState } from "react";
import { CircleUserRound, LogOut } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function AccountSection() {
  const [email, setEmail] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await createClient().auth.getUser();
      if (!cancelled) setEmail(data.user?.email ?? null);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const signOut = async () => {
    await createClient().auth.signOut();
    window.location.replace("/login");
  };

  return (
    <section className="rounded-2xl bg-card px-4 py-4">
      <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
        <CircleUserRound className="size-3.5" />
        Signed in as
      </p>
      <p className="mt-1 truncate text-[15px]">{email ?? " "}</p>
      <button
        type="button"
        onClick={signOut}
        className="mt-4 flex items-center gap-2 text-sm text-destructive"
      >
        <LogOut className="size-4" />
        Sign out
      </button>
    </section>
  );
}
