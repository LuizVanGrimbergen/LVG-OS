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
            className="fixed inset-0 z-80 flex items-center justify-center backdrop-blur-lg"
            style={{
              // Soft blue glow in the middle, fading into the Midnight background.
              background:
                "radial-gradient(circle at 50% 50%, rgba(56, 80, 132, 0.5) 0%, rgba(14, 20, 32, 0.94) 62%)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setOpen(false)}
          >
            <div className="relative size-80" onClick={(e) => e.stopPropagation()}>
              {/* Faint orbit the icons sit on. */}
              <motion.div
                aria-hidden
                className="absolute top-1/2 left-1/2 rounded-full border border-foreground/10"
                style={{
                  width: RING_RADIUS * 2,
                  height: RING_RADIUS * 2,
                  marginLeft: -RING_RADIUS,
                  marginTop: -RING_RADIUS,
                  boxShadow: "0 0 60px rgba(120, 150, 220, 0.12), inset 0 0 40px rgba(120, 150, 220, 0.08)",
                }}
                initial={{ scale: 0.2, opacity: 0, rotate: -90 }}
                animate={{ scale: 1, opacity: 1, rotate: 0 }}
                exit={{ scale: 0.2, opacity: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 24 }}
              />
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
                      initial={{ x: 0, y: 0, scale: 0.3, opacity: 0, rotate: -120 }}
                      animate={{ x, y, scale: 1, opacity: 1, rotate: 0 }}
                      exit={{ x: 0, y: 0, scale: 0.3, opacity: 0, rotate: -60 }}
                      transition={{ delay: i * 0.035, type: "spring", stiffness: 340, damping: 22 }}
                    >
                      <Link
                        href={href}
                        onClick={() => setOpen(false)}
                        aria-label={label}
                        aria-current={active ? "page" : undefined}
                        className="flex flex-col items-center gap-1.5"
                      >
                        <motion.span
                          whileTap={{ scale: 0.88 }}
                          className={cn(
                            "flex size-14 items-center justify-center rounded-full border transition-colors",
                            active
                              ? "border-foreground bg-foreground text-background shadow-[0_0_28px_rgba(238,242,248,0.45)]"
                              : "border-foreground/15 bg-card/90 text-foreground shadow-[0_0_18px_rgba(120,150,220,0.15)] active:bg-muted",
                          )}
                        >
                          <PageIcon className="size-6" />
                        </motion.span>
                        <span
                          className={cn(
                            "absolute top-full mt-1.5 text-[11px] whitespace-nowrap",
                            active ? "text-foreground" : "text-muted-foreground",
                          )}
                        >
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
        <motion.button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? "Close menu" : `Open menu (current page: ${current?.label ?? "unknown"})`}
          aria-expanded={open}
          whileTap={{ scale: 0.9 }}
          animate={{
            rotate: open ? 90 : 0,
            // Glows when the menu is open.
            boxShadow: open
              ? "0 0 0 10px rgba(238, 242, 248, 0.06), 0 0 32px rgba(238, 242, 248, 0.3)"
              : "0 0 0 0px rgba(238, 242, 248, 0), 0 0 12px rgba(120, 150, 220, 0.18)",
          }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="pointer-events-auto flex size-12 items-center justify-center rounded-full border border-foreground/15 bg-card/80 text-foreground backdrop-blur-lg"
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
        </motion.button>
      </div>
    </>
  );
}
