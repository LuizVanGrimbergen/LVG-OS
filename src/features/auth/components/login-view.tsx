"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

const field =
  "h-12 w-full rounded-xl border border-input bg-transparent px-4 text-base outline-none focus:border-ring";

type Step = "password" | "email" | "code";

/**
 * Sign in with email and password (saved by the phone's password manager),
 * or with a one-time code sent by email as a fallback.
 */
export function LoginView() {
  const [step, setStep] = useState<Step>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const linkFailed = useSearchParams().get("error") === "link";
  const [error, setError] = useState(linkFailed ? "That sign-in link didn't work. Try again." : "");

  const goTo = (next: Step) => {
    setStep(next);
    setError("");
  };

  // Full reload so every page loads your data fresh.
  const done = () => window.location.replace("/");

  const signInWithPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) return setError("Enter your email and password.");
    setBusy(true);
    setError("");
    const { error } = await createClient().auth.signInWithPassword({ email: email.trim(), password });
    if (error) {
      setBusy(false);
      return setError(error.message);
    }
    done();
  };

  const sendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return setError("Enter your email.");
    setBusy(true);
    setError("");
    // Never create an account from here; accounts are made in Supabase.
    const { error } = await createClient().auth.signInWithOtp({
      email: email.trim(),
      options: { shouldCreateUser: false },
    });
    setBusy(false);
    if (error) {
      return setError(
        error.status === 429 ? "Too many emails sent. Wait a bit, or use a code you already received." : error.message,
      );
    }
    goTo("code");
  };

  const verifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) return setError("Enter the code from the email.");
    setBusy(true);
    setError("");
    const { error } = await createClient().auth.verifyOtp({ email: email.trim(), token: code.trim(), type: "email" });
    if (error) {
      setBusy(false);
      return setError(error.message);
    }
    done();
  };

  const emailInput = (
    <input
      type="email"
      autoComplete="username"
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
  );

  const errorText = error && <p className="text-sm text-destructive">{error}</p>;
  const linkButton = (label: string, onClick: () => void) => (
    <button type="button" onClick={onClick} className="w-full py-2 text-sm text-muted-foreground">
      {label}
    </button>
  );

  return (
    <div className="flex min-h-dvh flex-col justify-center pb-24">
      <h1 className="text-3xl font-semibold tracking-tight">LVG OS</h1>

      {step === "password" && (
        <form onSubmit={signInWithPassword} className="mt-8 space-y-4">
          {emailInput}
          <input
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              setError("");
            }}
            placeholder="Password"
            aria-label="Password"
            className={field}
          />
          {errorText}
          <Button type="submit" size="lg" disabled={busy} className="h-12 w-full rounded-xl text-base">
            {busy ? "Signing in…" : "Sign in"}
          </Button>
          {linkButton("Sign in with an email code instead", () => goTo("email"))}
        </form>
      )}

      {step === "email" && (
        <form onSubmit={sendCode} className="mt-8 space-y-4">
          <p className="text-sm text-muted-foreground">Get a sign-in code by email.</p>
          {emailInput}
          {errorText}
          <Button type="submit" size="lg" disabled={busy} className="h-12 w-full rounded-xl text-base">
            {busy ? "Sending…" : "Send code"}
          </Button>
          {linkButton("I already have a code", () => {
            if (!email.trim()) return setError("Enter your email first.");
            goTo("code");
          })}
          {linkButton("Back to password", () => goTo("password"))}
        </form>
      )}

      {step === "code" && (
        <form onSubmit={verifyCode} className="mt-8 space-y-4">
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
          {errorText}
          <Button type="submit" size="lg" disabled={busy} className="h-12 w-full rounded-xl text-base">
            {busy ? "Signing in…" : "Sign in"}
          </Button>
          {linkButton("Back", () => {
            setCode("");
            goTo("email");
          })}
        </form>
      )}
    </div>
  );
}
