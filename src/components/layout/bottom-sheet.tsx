"use client";

import { useEffect, type FormEvent, type PointerEvent, type ReactNode } from "react";
import { AnimatePresence, motion, useDragControls } from "motion/react";

type BottomSheetProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
};

/** Pulled down this far (px), or flicked down this fast (px/s), the sheet closes. */
const CLOSE_OFFSET = 100;
const CLOSE_VELOCITY = 500;

/**
 * Form that slides up from the bottom of the screen, over a dimmed backdrop.
 * Swipe it down by the handle or title, tap outside, or press Escape to close.
 */
export function BottomSheet({ open, title, onClose, onSubmit, children }: BottomSheetProps) {
  const drag = useDragControls();

  // Keep the page behind still, and let Escape close the sheet.
  useEffect(() => {
    if (!open) return;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = overflow;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  const startDrag = (e: PointerEvent) => drag.start(e);

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            className="fixed inset-0 z-100 bg-black/60 backdrop-blur-[2px]"
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
            className="fixed inset-x-0 bottom-0 z-110 mx-auto max-h-[90dvh] max-w-md space-y-5 overflow-y-auto overscroll-contain rounded-t-3xl border-t border-border bg-card px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+1.5rem)]"
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 400, damping: 40 }}
            drag="y"
            dragControls={drag}
            dragListener={false}
            dragConstraints={{ top: 0, bottom: 0 }}
            dragElastic={{ top: 0, bottom: 0.7 }}
            onDragEnd={(_, info) => {
              if (info.offset.y > CLOSE_OFFSET || info.velocity.y > CLOSE_VELOCITY) onClose();
            }}
          >
            <div onPointerDown={startDrag} className="-mx-4 cursor-grab touch-none px-4 active:cursor-grabbing">
              <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-muted-foreground/40" aria-hidden />
              <h2 className="text-lg font-semibold">{title}</h2>
            </div>
            {children}
          </motion.form>
        </>
      )}
    </AnimatePresence>
  );
}
