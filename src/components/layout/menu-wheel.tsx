"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { cn } from "@/lib/utils";
import { pages } from "./pages";

const RADIUS = 120;
const STEP = 360 / pages.length;
const SPIN_FROM = -300;
const DRAG_THRESHOLD_PX = 6;
const wheelSpring = { type: "spring", stiffness: 110, damping: 16 } as const;

type MenuWheelProps = {
  currentHref?: string;
  onNavigate: () => void;
};

/**
 * The pages on a wheel that spins into place when the menu opens.
 * Drag in a circle to spin it yourself; it clicks into place when you let go.
 * Icons counter-rotate so they always stay upright.
 */
export function MenuWheel({ currentHref, onNavigate }: MenuWheelProps) {
  const reduce = useReducedMotion();
  const rotate = useMotionValue(reduce ? 0 : SPIN_FROM);
  const upright = useTransform(rotate, (r) => -r);
  const wheelRef = useRef<HTMLDivElement>(null);
  const drag = useRef<{ lastAngle: number; x: number; y: number; moved: boolean } | null>(null);
  const suppressClick = useRef(false);

  useEffect(() => {
    if (reduce) return;
    const controls = animate(rotate, 0, wheelSpring);
    return () => controls.stop();
  }, [rotate, reduce]);

  /** Angle of the pointer around the wheel's center, in degrees. */
  const angleOf = (e: React.PointerEvent) => {
    const box = wheelRef.current!.getBoundingClientRect();
    return (Math.atan2(e.clientY - (box.top + box.height / 2), e.clientX - (box.left + box.width / 2)) * 180) / Math.PI;
  };

  const onPointerDown = (e: React.PointerEvent) => {
    drag.current = { lastAngle: angleOf(e), x: e.clientX, y: e.clientY, moved: false };
  };

  const onPointerMove = (e: React.PointerEvent) => {
    const d = drag.current;
    if (!d) return;
    if (!d.moved) {
      if (Math.hypot(e.clientX - d.x, e.clientY - d.y) < DRAG_THRESHOLD_PX) return;
      d.moved = true;
      // Only capture once it's a real drag, so plain taps still reach the links.
      try {
        wheelRef.current?.setPointerCapture(e.pointerId);
      } catch {
        // Pointer already gone (e.g. synthetic events): keep spinning without capture.
      }
    }
    const angle = angleOf(e);
    let delta = angle - d.lastAngle;
    if (delta > 180) delta -= 360;
    if (delta < -180) delta += 360;
    rotate.set(rotate.get() + delta);
    d.lastAngle = angle;
  };

  const onPointerUp = () => {
    if (drag.current?.moved) {
      suppressClick.current = true;
      // Click into the nearest slot.
      animate(rotate, Math.round(rotate.get() / STEP) * STEP, { type: "spring", stiffness: 260, damping: 22 });
    }
    drag.current = null;
  };

  return (
    <div
      ref={wheelRef}
      className="relative size-80 touch-none"
      onClick={(e) => e.stopPropagation()}
      onClickCapture={(e) => {
        // A drag shouldn't also open the page under your finger.
        if (suppressClick.current) {
          e.preventDefault();
          e.stopPropagation();
          suppressClick.current = false;
        }
      }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={onPointerUp}
    >
      <motion.div
        className="absolute inset-0"
        style={{ rotate }}
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.5, opacity: 0 }}
        transition={{ type: "spring", stiffness: 220, damping: 22 }}
      >
        {/* Faint orbit the icons sit on. */}
        <div
          aria-hidden
          className="absolute top-1/2 left-1/2 rounded-full border border-foreground/10"
          style={{
            width: RADIUS * 2,
            height: RADIUS * 2,
            marginLeft: -RADIUS,
            marginTop: -RADIUS,
            boxShadow: "0 0 60px rgba(120, 150, 220, 0.12), inset 0 0 40px rgba(120, 150, 220, 0.08)",
          }}
        />

        <ul>
          {pages.map(({ href, label, icon: PageIcon }, i) => {
            const active = currentHref === href;
            // Evenly spaced around the center, starting at the top.
            const angle = -Math.PI / 2 + (i * 2 * Math.PI) / pages.length;
            const x = Math.cos(angle) * RADIUS;
            const y = Math.sin(angle) * RADIUS;
            return (
              <li
                key={href}
                className="absolute top-1/2 left-1/2 -mt-7 -ml-7"
                style={{ transform: `translate(${x}px, ${y}px)` }}
              >
                <motion.div style={{ rotate: upright }}>
                  <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.08 + i * 0.04, type: "spring", stiffness: 380, damping: 20 }}
                  >
                    <Link
                      href={href}
                      onClick={onNavigate}
                      draggable={false}
                      aria-label={label}
                      aria-current={active ? "page" : undefined}
                      className="relative flex flex-col items-center"
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
                          "absolute top-full mt-1.5 text-[11px] whitespace-nowrap select-none",
                          active ? "text-foreground" : "text-muted-foreground",
                        )}
                      >
                        {label}
                      </span>
                    </Link>
                  </motion.div>
                </motion.div>
              </li>
            );
          })}
        </ul>
      </motion.div>
    </div>
  );
}
