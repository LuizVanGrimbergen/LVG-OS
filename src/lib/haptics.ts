/** A short buzz on phones that support it (Android). Silently does nothing elsewhere. */
export function haptic(kind: "tap" | "hold" = "tap") {
  try {
    navigator.vibrate?.(kind === "tap" ? 8 : 18);
  } catch {
    // Not allowed here (e.g. no user gesture yet).
  }
}
