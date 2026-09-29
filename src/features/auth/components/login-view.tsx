"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const field =
  "h-12 w-full rounded-xl border border-input bg-transparent px-4 text-base outline-none focus:border-ring";

/** Sign in with a one-time code sent by email (a code instead of a link, so it works inside the installed app). */
export function LoginView() {
  const [step, setStep] = useState<"email" | "code">("email");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const linkFailed = useSearchParams().get("error") === "link";
  const [error, setError] = useState(linkFailed ? "That sign-in link didn't work. Request a new code." : "");

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return setError("Enter your email.");
    setBusy(true);
    setError("");
    const { error } = await createClient().auth.signInWithOtp({ email: email.trim() });
    setBusy(false);
    if (error) return setError(error.message);
    setStep("code");
  };

  const verify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return setError("Enter the code from the email.");
    setBusy(true);
    setError("");
    const { error } = await createClient().auth.verifyOtp({ email: email.trim(), token: code.trim(), type: "email" });
    if (error) {
      setBusy(false);
      return setError(error.message);
    }
    // Full reload so every page loads your data fresh.
    window.location.replace("/");
  };

  return (
    <div className="flex min-h-dvh flex-col justify-center pb-24">
      <h1 className="text-3xl font-semibold tracking-tight">LVG OS</h1>

      {step === "email" ? (
        <form onSubmit={sendCode} className="mt-8 space-y-4">
          <p className="text-sm text-muted-foreground">Sign in with a code sent to your email.</p>
          <input
            type="email"
            autoComplete="email"
            inputMode="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setError("");
            }}
            placeholder="you@example.com"
            aria-label="Email"
            className={field}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" size="lg" disabled={busy} className="h-12 w-full rounded-xl text-base">
            {busy ? "Sending…" : "Send code"}
          </Button>
        </form>
      ) : (
        <form onSubmit={verify} className="mt-8 space-y-4">
          <p className="text-sm text-muted-foreground">Enter the code we sent to {email}.</p>
          <input
            autoFocus
            autoComplete="one-time-code"
            inputMode="numeric"
            maxLength={10}
            value={code}
            onChange={(e) => {
              setCode(e.target.value.replace(/\D/g, ""));
              setError("");
            }}
            placeholder="123456"
            aria-label="Code"
            className={`${field} tracking-[0.3em] tabular-nums`}
          />
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" size="lg" disabled={busy} className="h-12 w-full rounded-xl text-base">
            {busy ? "Signing in…" : "Sign in"}
          </Button>
          <button
            type="button"
            onClick={() => {
              setStep("email");
              setCode("");
              setError("");
            }}
            className="w-full py-2 text-sm text-muted-foreground"
          >
            Use a different email
          </button>
        </form>
      )}
    </div>
  );
}
