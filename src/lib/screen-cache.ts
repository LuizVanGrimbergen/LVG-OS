"use client";

import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";

/**
 * Data screens loaded before, kept in memory while the app is open.
 * Going back to a screen shows it straight away while it refreshes in the background.
 * Signing out reloads the page, which clears it.
 */
const cache = new Map<string, unknown>();

/**
 * Like useState, but starts from what this screen showed last time (if anything)
 * and remembers every change. `cached` tells whether there was something to show.
 */
export function useCachedState<T>(key: string, initial: T): [T, Dispatch<SetStateAction<T>>, boolean] {
  const [cached] = useState(() => cache.has(key));
  const [value, setValue] = useState<T>(() => (cache.has(key) ? (cache.get(key) as T) : initial));
  const [dirty, setDirty] = useState(cached);

  const set: Dispatch<SetStateAction<T>> = useCallback((next) => {
    setDirty(true);
    setValue(next);
  }, []);

  // Only remember values that came from loading or changes, not the empty starting value.
  useEffect(() => {
    if (dirty) cache.set(key, value);
  }, [key, value, dirty]);

  return [value, set, cached];
}

export function clearScreenCache() {
  cache.clear();
}
