"use client";

import { useRef } from "react";
import { haptic } from "@/lib/haptics";

const HOLD_MS = 500;
const MOVE_TOLERANCE_PX = 10;

/**
 * Tap runs `onTap`, holding for half a second runs `onLongPress` instead.
 * Moving the finger (scrolling) cancels both.
 */
export function useLongPress(onLongPress: () => void, onTap: () => void) {
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  const fired = useRef(false);

  const clear = () => {
    if (timer.current) clearTimeout(timer.current);
    timer.current = null;
  };

  return {
    onPointerDown: (e: React.PointerEvent) => {
      fired.current = false;
      start.current = { x: e.clientX, y: e.clientY };
      clear();
      timer.current = setTimeout(() => {
        fired.current = true;
        haptic("hold");
        onLongPress();
      }, HOLD_MS);
    },
    onPointerMove: (e: React.PointerEvent) => {
      if (!start.current) return;
      const moved = Math.hypot(e.clientX - start.current.x, e.clientY - start.current.y);
      if (moved > MOVE_TOLERANCE_PX) {
        clear();
        start.current = null;
      }
    },
    onPointerUp: clear,
    onPointerLeave: clear,
    onPointerCancel: clear,
    onClick: () => {
      // Skip the click that follows a long press.
      if (fired.current) {
        fired.current = false;
        return;
      }
      haptic();
      onTap();
    },
    onContextMenu: (e: React.MouseEvent) => {
      // Right-click on desktop behaves like a long press.
      e.preventDefault();
      clear();
      onLongPress();
    },
  };
}
