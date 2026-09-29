"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";

const pages = [
  { href: "/", label: "Today" },
  { href: "/goals", label: "Goals" },
  { href: "/travel", label: "Travel" },
  { href: "/about", label: "About me" },
] as const;

export function AppMenu() {
  const pathname = usePathname();
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

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open menu"
        aria-expanded={open}
        className="flex size-10 items-center justify-center rounded-full text-foreground transition-colors active:bg-muted"
      >
        <Menu className="size-6" />
      </button>

      <AnimatePresence>
        {open && (
          <motion.nav
            aria-label="Main"
            className="fixed inset-0 z-80 bg-background"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="mx-auto max-w-md px-4 pt-[env(safe-area-inset-top)]">
              <div className="flex items-center justify-between pt-6">
                <span className="text-sm text-muted-foreground">LVG OS</span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  className="flex size-10 items-center justify-center rounded-full text-foreground transition-colors active:bg-muted"
                >
                  <X className="size-6" />
                </button>
              </div>

              <ul className="mt-12">
                {pages.map(({ href, label }, i) => {
                  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
                  return (
                    <motion.li
                      key={href}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.05 + i * 0.05, type: "spring", stiffness: 400, damping: 35 }}
                    >
                      <Link
                        href={href}
                        onClick={() => setOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={cn(
                          "block py-3 text-4xl font-semibold tracking-tight transition-colors",
                          active ? "text-foreground" : "text-muted-foreground active:text-foreground",
                        )}
                      >
                        {label}
                      </Link>
                    </motion.li>
                  );
                })}
              </ul>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}
