/**
 * Offline saving for Supabase writes.
 *
 * Writes to the database API (POST/PATCH/DELETE on /rest/v1/) that can't reach the network are kept
 * on this device and answered with "204 No Content", so the screen keeps the change. They're sent
 * again, in order, once the connection is back. Reads and file uploads are never queued.
 */

export type QueuedRequest = {
  id: string;
  url: string;
  method: string;
  /** Headers without auth; a fresh token is added when the request is sent again. */
  headers: Record<string, string>;
  body: string | null;
  queuedAt: string;
};

export type QueueStorage = {
  read: () => QueuedRequest[];
  write: (queue: QueuedRequest[]) => void;
};

const STORAGE_KEY = "lvg-os:offline-queue";
const AUTH_HEADERS = new Set(["authorization", "apikey"]);

export const localQueueStorage: QueueStorage = {
  read: () => {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as QueuedRequest[];
    } catch {
      return [];
    }
  },
  write: (queue) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
    } catch {
      // Storage unavailable (private mode or full): the change only lives on screen.
    }
  },
};

const listeners = new Set<() => void>();

/** Called whenever the queue changes, e.g. to show how many changes are waiting. */
export function onQueueChange(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

const notify = () => listeners.forEach((l) => l());

export function isQueueable(url: string, method: string): boolean {
  return !["GET", "HEAD"].includes(method.toUpperCase()) && new URL(url).pathname.startsWith("/rest/v1/");
}

/** A Headers-like value as a plain object, without the auth headers. */
function withoutAuth(headers: HeadersInit | undefined): Record<string, string> {
  const out: Record<string, string> = {};
  new Headers(headers).forEach((value, key) => {
    if (!AUTH_HEADERS.has(key)) out[key] = value;
  });
  return out;
}

export function enqueue(storage: QueueStorage, url: string, init: RequestInit): void {
  const request: QueuedRequest = {
    id: crypto.randomUUID(),
    url,
    method: (init.method ?? "GET").toUpperCase(),
    headers: withoutAuth(init.headers),
    body: typeof init.body === "string" ? init.body : null,
    queuedAt: new Date().toISOString(),
  };
  storage.write([...storage.read(), request]);
  notify();
}

const queuedResponse = () => new Response(null, { status: 204, statusText: "Queued offline" });

type OfflineFetchOptions = {
  storage?: QueueStorage;
  fetch?: typeof fetch;
  isOnline?: () => boolean;
};

/** A `fetch` for the Supabase client that queues database writes while offline. */
export function createOfflineFetch({
  storage = localQueueStorage,
  fetch: baseFetch = (...args) => fetch(...args),
  isOnline = () => typeof navigator === "undefined" || navigator.onLine,
}: OfflineFetchOptions = {}): typeof fetch {
  return async (input, init = {}) => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : null;
    // Writes made while older ones are still waiting go to the back of the line, to keep their order.
    if (!url || !isQueueable(url, init.method ?? "GET") || (init.body != null && typeof init.body !== "string")) {
      return baseFetch(input, init);
    }
    if (!isOnline() || storage.read().length > 0) {
      enqueue(storage, url, init);
      return queuedResponse();
    }
    try {
      return await baseFetch(input, init);
    } catch (error) {
      // Aborted on purpose: not a connection problem.
      if (error instanceof DOMException && error.name === "AbortError") throw error;
      enqueue(storage, url, init);
      return queuedResponse();
    }
  };
}

export type FlushResult = { sent: number; dropped: number; remaining: number };

/**
 * Sends waiting writes in order. Stops at the first one that can't get through yet
 * (no connection, signed out, server trouble); drops ones the server rejects for good.
 */
export async function flushQueue({
  storage = localQueueStorage,
  fetch: baseFetch = (...args) => fetch(...args),
  authHeaders,
}: {
  storage?: QueueStorage;
  fetch?: typeof fetch;
  authHeaders: () => Promise<Record<string, string> | null>;
}): Promise<FlushResult> {
  let sent = 0;
  let dropped = 0;
  const auth = await authHeaders();
  if (!auth) return { sent, dropped, remaining: storage.read().length };

  for (;;) {
    const [next] = storage.read();
    if (!next) break;

    let res: Response;
    try {
      res = await baseFetch(next.url, { method: next.method, headers: { ...next.headers, ...auth }, body: next.body });
    } catch {
      break; // Still offline.
    }
    if (res.status === 401 || res.status === 408 || res.status === 429 || res.status >= 500) break;
    if (res.ok) sent++;
    else {
      dropped++;
      console.error("Dropped an offline change the server rejected", res.status, await res.text().catch(() => ""));
    }
    storage.write(storage.read().filter((r) => r.id !== next.id));
    notify();
  }
  return { sent, dropped, remaining: storage.read().length };
}

export const queueLength = (storage: QueueStorage = localQueueStorage) => storage.read().length;
