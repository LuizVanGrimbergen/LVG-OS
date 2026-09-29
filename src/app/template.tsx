"use client";

import type { ReactNode } from "react";
import { motion } from "motion/react";

/** Re-mounts on every navigation, so each page slides in gently. */
export default function Template({ children }: { children: ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 28 }}
    >
      {children}
    </motion.div>
  );
}
