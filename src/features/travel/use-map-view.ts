"use client";

import { useSyncExternalStore } from "react";

export type MapView = "globe" | "map";

const KEY = "lvg-os:travel-view";
const EVENT = "lvg-os:travel-view-change";

function read(): MapView {
  try {
    return localStorage.getItem(KEY) === "map" ? "map" : "globe";
  } catch {
    return "globe";
  }
}

function subscribe(onChange: () => void) {
  window.addEventListener(EVENT, onChange);
  return () => window.removeEventListener(EVENT, onChange);
}

/** Globe or flat map in Travel, remembered on this device (globe by default). */
export function useMapView(): [MapView, (view: MapView) => void] {
  const view = useSyncExternalStore(subscribe, read, () => "globe" as const);
  const setView = (next: MapView) => {
    try {
      localStorage.setItem(KEY, next);
    } catch {
      // Storage unavailable: the choice just isn't remembered.
    }
    window.dispatchEvent(new Event(EVENT));
  };
  return [view, setView];
}
