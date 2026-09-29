"use client";

import type { ReactNode } from "react";
import { MotionConfig } from "motion/react";

/** Skips movement for people who turned on "Reduce Motion". */
export function MotionProvider({ children }: { children: ReactNode }) {
  return <MotionConfig reducedMotion="user">{children}</MotionConfig>;
}
