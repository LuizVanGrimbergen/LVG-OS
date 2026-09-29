"use client";

import type { FormEvent, ReactNode } from "react";
import { AnimatePresence, motion } from "motion/react";

type BottomSheetProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
};

/** Form that slides up from the bottom of the screen, over a dimmed backdrop. */
export function BottomSheet({ open, title, onClose, onSubmit, children }: BottomSheetProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-60 bg-black/60"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.form
            onSubmit={onSubmit}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="fixed inset-x-0 bottom-0 z-70 mx-auto max-w-md space-y-5 rounded-t-3xl border-t border-border bg-card px-4 pt-6 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
          >
            <h2 className="text-lg font-semibold">{title}</h2>
            {children}
          </motion.form>
        </>
      )}
    </AnimatePresence>
  );
}
