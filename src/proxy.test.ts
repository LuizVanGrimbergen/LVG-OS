import { beforeEach, describe, expect, it, vi } from "vitest";
import { NextRequest } from "next/server";
import {
  getRedirectUrl,
  unstable_doesMiddlewareMatch,
} from "next/experimental/testing/server";

const getClaims = vi.fn();

vi.mock("@supabase/ssr", () => ({
  createServerClient: () => ({ auth: { getClaims } }),
}));

const { proxy, config } = await import("./proxy");

const BASE = "https://lvg-os.test";

function signedIn() {
  getClaims.mockResolvedValue({ data: { claims: { sub: "user-1" } } });
}

function signedOut() {
  getClaims.mockResolvedValue({ data: null });
}

describe("proxy matcher", () => {
  it.each(["/", "/login", "/auth/callback", "/settings", "/api/push"])(
    "runs on %s",
    (url) => {
      expect(unstable_doesMiddlewareMatch({ config, url })).toBe(true);
    },
  );

  it.each([
    "/_next/static/chunks/main.js",
    "/_next/image?url=%2Fa.png&w=64&q=75",
    "/favicon.ico",
    "/manifest.webmanifest",
    "/serwist/sw.js",
    "/icons/icon-192.png",
    "/api/cron/daily",
    "/images/photo.jpg",
    "/logo.svg",
  ])("skips %s", (url) => {
    expect(unstable_doesMiddlewareMatch({ config, url })).toBe(false);
  });
});

describe("proxy", () => {
  beforeEach(() => {
    getClaims.mockReset();
  });

  it("redirects signed-out visitors to /login", async () => {
    signedOut();
    const res = await proxy(new NextRequest(`${BASE}/settings`));
    expect(getRedirectUrl(res)).toBe(`${BASE}/login`);
  });

  it("lets signed-out visitors reach /login", async () => {
    signedOut();
    const res = await proxy(new NextRequest(`${BASE}/login`));
    expect(getRedirectUrl(res)).toBeNull();
  });

  it("lets signed-out visitors reach the auth callback", async () => {
    signedOut();
    const res = await proxy(new NextRequest(`${BASE}/auth/callback?code=abc`));
    expect(getRedirectUrl(res)).toBeNull();
  });

  it("sends signed-in users away from /login", async () => {
    signedIn();
    const res = await proxy(new NextRequest(`${BASE}/login`));
    expect(getRedirectUrl(res)).toBe(`${BASE}/`);
  });

  it("lets signed-in users through", async () => {
    signedIn();
    const res = await proxy(new NextRequest(`${BASE}/settings`));
    expect(getRedirectUrl(res)).toBeNull();
  });
});
