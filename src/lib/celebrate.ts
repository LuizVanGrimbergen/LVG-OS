"use client";

const COLORS = ["#ffffff", "#34d399", "#a3a3a3"];

/** Confetti burst from both sides of the screen. Skipped for reduced motion. */
export async function celebrate() {
  const { default: confetti } = await import("canvas-confetti");
  const base = { particleCount: 70, spread: 70, startVelocity: 45, colors: COLORS, zIndex: 200, disableForReducedMotion: true };
  confetti({ ...base, angle: 60, origin: { x: 0, y: 0.7 } });
  confetti({ ...base, angle: 120, origin: { x: 1, y: 0.7 } });
}

/** Runs `celebrate` only the first time `key` is seen on this device. */
export function celebrateOnce(key: string) {
  const storageKey = `lvg-os:celebrated:${key}`;
  try {
    if (localStorage.getItem(storageKey)) return;
    localStorage.setItem(storageKey, "1");
  } catch {
    // Storage unavailable (private mode): celebrate anyway.
  }
  void celebrate();
}
