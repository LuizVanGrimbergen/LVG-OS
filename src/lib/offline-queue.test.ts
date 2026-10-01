import { describe, expect, it, vi } from "vitest";
import { createOfflineFetch, flushQueue, isQueueable, type QueueStorage, type QueuedRequest } from "./offline-queue";

const REST = "https://x.supabase.co/rest/v1/tasks";

function memoryStorage(initial: QueuedRequest[] = []): QueueStorage & { items: QueuedRequest[] } {
  const store = {
    items: initial,
    read: () => store.items,
    write: (q: QueuedRequest[]) => {
      store.items = q;
    },
  };
  return store;
}

const write = { method: "PATCH", headers: { Authorization: "Bearer old", apikey: "k", Prefer: "return=minimal" }, body: '{"done":true}' };

describe("isQueueable", () => {
  it("queues database writes only", () => {
    expect(isQueueable(REST, "POST")).toBe(true);
    expect(isQueueable(REST, "GET")).toBe(false);
    expect(isQueueable("https://x.supabase.co/storage/v1/object/p", "POST")).toBe(false);
    expect(isQueueable("https://x.supabase.co/auth/v1/token", "POST")).toBe(false);
  });
});

describe("createOfflineFetch", () => {
  it("passes writes through when online", async () => {
    const storage = memoryStorage();
    const base = vi.fn().mockResolvedValue(new Response(null, { status: 204 }));
    const res = await createOfflineFetch({ storage, fetch: base, isOnline: () => true })(REST, write);
    expect(res.status).toBe(204);
    expect(base).toHaveBeenCalledOnce();
    expect(storage.items).toHaveLength(0);
  });

  it("queues writes while offline, without the auth headers", async () => {
    const storage = memoryStorage();
    const base = vi.fn();
    const res = await createOfflineFetch({ storage, fetch: base, isOnline: () => false })(REST, write);
    expect(res.ok).toBe(true);
    expect(base).not.toHaveBeenCalled();
    expect(storage.items).toHaveLength(1);
    expect(storage.items[0]).toMatchObject({ url: REST, method: "PATCH", body: '{"done":true}' });
    expect(storage.items[0].headers).toEqual({ prefer: "return=minimal" });
  });

  it("queues when the network fails", async () => {
    const storage = memoryStorage();
    const base = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));
    const res = await createOfflineFetch({ storage, fetch: base, isOnline: () => true })(REST, write);
    expect(res.status).toBe(204);
    expect(storage.items).toHaveLength(1);
  });

  it("keeps order: queues new writes while older ones wait", async () => {
    const storage = memoryStorage();
    const base = vi.fn();
    const offlineFetch = createOfflineFetch({ storage, fetch: base, isOnline: () => false });
    await offlineFetch(REST, write);
    await createOfflineFetch({ storage, fetch: base, isOnline: () => true })(REST, { ...write, body: "2" });
    expect(base).not.toHaveBeenCalled();
    expect(storage.items.map((r) => r.body)).toEqual(['{"done":true}', "2"]);
  });

  it("never queues reads", async () => {
    const storage = memoryStorage();
    const base = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));
    await expect(createOfflineFetch({ storage, fetch: base, isOnline: () => false })(REST, { method: "GET" })).rejects.toThrow();
    expect(storage.items).toHaveLength(0);
  });
});

describe("flushQueue", () => {
  const queued = (body: string): QueuedRequest => ({
    id: body,
    url: REST,
    method: "POST",
    headers: { "content-type": "application/json" },
    body,
    queuedAt: "2026-10-01T10:00:00Z",
  });
  const authHeaders = async () => ({ Authorization: "Bearer fresh", apikey: "k" });

  it("sends in order with a fresh token", async () => {
    const storage = memoryStorage([queued("a"), queued("b")]);
    const base = vi.fn().mockResolvedValue(new Response(null, { status: 201 }));
    expect(await flushQueue({ storage, fetch: base, authHeaders })).toEqual({ sent: 2, dropped: 0, remaining: 0 });
    expect(base.mock.calls.map((c) => c[1].body)).toEqual(["a", "b"]);
    expect(base.mock.calls[0][1].headers.Authorization).toBe("Bearer fresh");
  });

  it("stops when still offline and keeps the rest", async () => {
    const storage = memoryStorage([queued("a"), queued("b")]);
    const base = vi.fn().mockRejectedValue(new TypeError("Failed to fetch"));
    expect(await flushQueue({ storage, fetch: base, authHeaders })).toEqual({ sent: 0, dropped: 0, remaining: 2 });
  });

  it("drops a change the server rejects and carries on", async () => {
    vi.spyOn(console, "error").mockImplementation(() => {});
    const storage = memoryStorage([queued("a"), queued("b")]);
    const base = vi
      .fn()
      .mockResolvedValueOnce(new Response("bad", { status: 400 }))
      .mockResolvedValueOnce(new Response(null, { status: 201 }));
    expect(await flushQueue({ storage, fetch: base, authHeaders })).toEqual({ sent: 1, dropped: 1, remaining: 0 });
  });

  it("waits on server errors and expired sessions", async () => {
    for (const status of [401, 503]) {
      const storage = memoryStorage([queued("a")]);
      const base = vi.fn().mockResolvedValue(new Response(null, { status }));
      expect((await flushQueue({ storage, fetch: base, authHeaders })).remaining).toBe(1);
    }
  });

  it("does nothing while signed out", async () => {
    const storage = memoryStorage([queued("a")]);
    const base = vi.fn();
    await flushQueue({ storage, fetch: base, authHeaders: async () => null });
    expect(base).not.toHaveBeenCalled();
  });
});
