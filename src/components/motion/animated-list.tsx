"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";

/** A list whose items glide in when added and slide out when removed. */
export function AnimatedList({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <ul className={className}>
      <AnimatePresence initial={false}>{children}</AnimatePresence>
    </ul>
  );
}

/** Give it a stable `key` so the list can animate it in and out. */
export function AnimatedListItem({ children }: { children: ReactNode }) {
  return (
    <motion.li
      layout
      initial={{ opacity: 0, height: 0, x: -12 }}
      animate={{ opacity: 1, height: "auto", x: 0 }}
      exit={{ opacity: 0, height: 0, x: 24 }}
      transition={{ type: "spring", stiffness: 380, damping: 32, opacity: { duration: 0.2 } }}
      className="overflow-hidden"
    >
      {children}
    </motion.li>
  );
}
