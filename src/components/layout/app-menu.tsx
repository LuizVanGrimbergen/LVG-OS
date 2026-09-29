"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { MenuWheel } from "./menu-wheel";
import { findPage } from "./pages";

/**
 * Round button at the bottom of the screen. Shows the current page's icon
 * and opens the navigation: a wheel of pages in the middle of the screen.
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
            <MenuWheel currentHref={current?.href} onNavigate={() => setOpen(false)} />
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
