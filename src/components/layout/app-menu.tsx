"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { findPage, pages } from "./pages";

const RING_RADIUS = 120;

/**
 * Round button at the bottom of the screen. Shows the current page's icon
 * and opens the navigation: the pages in a ring in the middle of the screen.
 */
export function AppMenu() {
  const pathname = usePathname();
  const current = findPage(pathname);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open]);

  const Icon = open ? X : (current?.icon ?? Menu);

  // No navigation before you're signed in.
  if (pathname.startsWith("/login")) return null;

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.nav
            aria-label="Main"
            className="fixed inset-0 z-80 flex items-center justify-center bg-background/95 backdrop-blur-lg"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={() => setOpen(false)}
          >
            <div className="relative size-80" onClick={(e) => e.stopPropagation()}>
              <ul>
                {pages.map(({ href, label, icon: PageIcon }, i) => {
                  const active = current?.href === href;
                  // Evenly spaced around the center, starting at the top.
                  const angle = -Math.PI / 2 + (i * 2 * Math.PI) / pages.length;
                  const x = Math.cos(angle) * RING_RADIUS;
                  const y = Math.sin(angle) * RING_RADIUS;
                  return (
                    <motion.li
                      key={href}
                      className="absolute top-1/2 left-1/2 -mt-7 -ml-7"
                      initial={{ x: 0, y: 0, scale: 0.3, opacity: 0 }}
                      animate={{ x, y, scale: 1, opacity: 1 }}
                      exit={{ x: 0, y: 0, scale: 0.3, opacity: 0 }}
                      transition={{ delay: i * 0.03, type: "spring", stiffness: 380, damping: 26 }}
                    >
                      <Link
                        href={href}
                        onClick={() => setOpen(false)}
                        aria-label={label}
                        aria-current={active ? "page" : undefined}
                        className="flex flex-col items-center gap-1.5"
                      >
                        <span
                          className={cn(
                            "flex size-14 items-center justify-center rounded-full border transition-colors",
                            active
                              ? "border-foreground bg-foreground text-background"
                              : "border-border bg-card text-foreground active:bg-muted",
                          )}
                        >
                          <PageIcon className="size-6" />
                        </span>
                        <span className="absolute top-full mt-1.5 text-[11px] whitespace-nowrap text-muted-foreground">
                          {label}
                        </span>
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>

      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-90 flex justify-center pb-[calc(env(safe-area-inset-bottom)+1rem)]">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : `Open menu (current page: ${current?.label ?? "unknown"})`}
          aria-expanded={open}
          className="pointer-events-auto flex size-12 items-center justify-center rounded-full border border-border bg-background/80 text-foreground backdrop-blur-lg transition-transform active:scale-95"
        >
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={open ? "close" : (current?.href ?? "menu")}
              initial={{ opacity: 0, scale: 0.6, rotate: -45 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.6 }}
              transition={{ duration: 0.15 }}
            >
              <Icon className="size-5" />
            </motion.span>
          </AnimatePresence>
        </button>
      </div>
    </>
  );
}
