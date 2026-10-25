/**
 * Phase B3a.1 offline admin auth tests — no database, no HTTP server.
 * Run: npm run test:admin-b3a1
 */
import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import {
  assertAdminMutationOrigin,
  isAllowedAdminMutationOrigin,
  readRequestOrigin,
} from "@/lib/admin-csrf";
import {
  clientKeyFromRequest,
  consumeLoginAttempt,
  resetLoginAttempts,
} from "@/lib/admin-rate-limit";
import {
  adminAuthConfigured,
  adminAuthMisconfiguredMessage,
  clearSessionCookieOptions,
  createAdminSessionToken,
  sessionCookieOptions,
  verifyAdminPassword,
  verifyAdminSessionToken,
} from "@/lib/admin-session";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../..");

const BASE_ENV = {
  NODE_ENV: "test",
  ADMIN_DEMO_PASSWORD: "correct-horse-battery",
  ADMIN_SESSION_SECRET: "unit-test-session-secret-32b",
} as const;

function envWith(
  overrides: Record<string, string | undefined>,
): Record<string, string | undefined> {
  return { ...BASE_ENV, ...overrides };
}

describe("adminAuthConfigured / fail-closed", () => {
  it("requires both password and session secret", () => {
    assert.equal(adminAuthConfigured(BASE_ENV), true);
    assert.equal(
      adminAuthConfigured(envWith({ ADMIN_DEMO_PASSWORD: "" })),
      false,
    );
    assert.equal(
      adminAuthConfigured(envWith({ ADMIN_SESSION_SECRET: "" })),
      false,
    );
    assert.equal(
      adminAuthConfigured(envWith({ ADMIN_SESSION_SECRET: undefined })),
      false,
    );
  });

  it("production rejects short session secrets", () => {
    assert.equal(
      adminAuthConfigured(
        envWith({
          NODE_ENV: "production",
          ADMIN_SESSION_SECRET: "short",
        }),
      ),
      false,
    );
    assert.equal(
      adminAuthConfigured(
        envWith({
          NODE_ENV: "production",
          ADMIN_SESSION_SECRET: "long-enough-secret!",
        }),
      ),
      true,
    );
  });

  it("misconfiguration messages never include secret values", () => {
    const msg = adminAuthMisconfiguredMessage(
      envWith({ ADMIN_SESSION_SECRET: undefined }),
    );
    assert.ok(msg.includes("ADMIN_SESSION_SECRET"));
    assert.equal(msg.includes(BASE_ENV.ADMIN_DEMO_PASSWORD), false);
    assert.equal(msg.includes("unit-test-session-secret"), false);
  });
});

describe("session tokens", () => {
  it("creates a verifiable token when configured", () => {
    const now = 1_700_000_000_000;
    const token = createAdminSessionToken({ env: BASE_ENV, now });
    assert.ok(token);
    assert.equal(
      verifyAdminSessionToken(token, { env: BASE_ENV, now }),
      true,
    );
  });

  it("returns null when session secret is missing", () => {
    const token = createAdminSessionToken({
      env: envWith({ ADMIN_SESSION_SECRET: undefined }),
    });
    assert.equal(token, null);
  });

  it("rejects expired tokens", () => {
    const now = 1_700_000_000_000;
    const token = createAdminSessionToken({ env: BASE_ENV, now });
    assert.ok(token);
    const later = now + 60 * 60 * 9 * 1000; // past 8h max age
    assert.equal(
      verifyAdminSessionToken(token, { env: BASE_ENV, now: later }),
      false,
    );
  });

  it("rejects tampered payloads and signatures", () => {
    const now = 1_700_000_000_000;
    const token = createAdminSessionToken({ env: BASE_ENV, now });
    assert.ok(token);
    const parts = token.split(".");
    assert.equal(parts.length, 3);
    const tamperedExp = `${parts[0]}.${Number(parts[1]) + 999_999}.${parts[2]}`;
    assert.equal(
      verifyAdminSessionToken(tamperedExp, { env: BASE_ENV, now }),
      false,
    );
    const tamperedSig = `${parts[0]}.${parts[1]}.${"a".repeat(parts[2]!.length)}`;
    assert.equal(
      verifyAdminSessionToken(tamperedSig, { env: BASE_ENV, now }),
      false,
    );
    assert.equal(
      verifyAdminSessionToken("not-a-token", { env: BASE_ENV, now }),
      false,
    );
    assert.equal(
      verifyAdminSessionToken(undefined, { env: BASE_ENV, now }),
      false,
    );
  });

  it("rejects tokens signed with a different secret", () => {
    const now = 1_700_000_000_000;
    const token = createAdminSessionToken({ env: BASE_ENV, now });
    assert.ok(token);
    assert.equal(
      verifyAdminSessionToken(token, {
        env: envWith({ ADMIN_SESSION_SECRET: "different-session-secret!!" }),
        now,
      }),
      false,
    );
  });

  it("does not use the login password as the HMAC secret", () => {
    const now = 1_700_000_000_000;
    const token = createAdminSessionToken({ env: BASE_ENV, now });
    assert.ok(token);
    // Forged token using password as secret must fail against session secret verify.
    const exp = now + 60_000;
    const payload = `ok.${exp}`;
    const forged = `${payload}.${createHmac("sha256", BASE_ENV.ADMIN_DEMO_PASSWORD)
      .update(payload)
      .digest("hex")}`;
    assert.equal(
      verifyAdminSessionToken(forged, { env: BASE_ENV, now }),
      false,
    );
  });
});

describe("password verification", () => {
  it("accepts the correct password and rejects wrong passwords", () => {
    assert.equal(verifyAdminPassword("correct-horse-battery", BASE_ENV), true);
    assert.equal(verifyAdminPassword("wrong-password", BASE_ENV), false);
    assert.equal(verifyAdminPassword("", BASE_ENV), false);
    assert.equal(
      verifyAdminPassword("correct-horse-battery", envWith({ ADMIN_DEMO_PASSWORD: "" })),
      false,
    );
  });
});

describe("cookie attributes", () => {
  it("session and clear cookies share HttpOnly, SameSite, path, and Secure", () => {
    const prod = envWith({ NODE_ENV: "production" });
    const set = sessionCookieOptions("tok", prod);
    const clear = clearSessionCookieOptions(prod);
    assert.equal(set.httpOnly, true);
    assert.equal(clear.httpOnly, true);
    assert.equal(set.sameSite, "lax");
    assert.equal(clear.sameSite, "lax");
    assert.equal(set.path, "/");
    assert.equal(clear.path, "/");
    assert.equal(set.secure, true);
    assert.equal(clear.secure, true);
    assert.equal(clear.maxAge, 0);

    const dev = envWith({ NODE_ENV: "development" });
    assert.equal(sessionCookieOptions("tok", dev).secure, false);
    assert.equal(clearSessionCookieOptions(dev).secure, false);
  });
});

describe("Origin / CSRF helpers", () => {
  it("allows same-origin Origin header", () => {
    const request = new Request("http://localhost:3000/api/admin/login", {
      method: "POST",
      headers: { Origin: "http://localhost:3000" },
    });
    assert.equal(isAllowedAdminMutationOrigin(request), true);
    assert.equal(assertAdminMutationOrigin(request).ok, true);
  });

  it("allows same-origin Referer when Origin is absent", () => {
    const request = new Request("http://localhost:3000/api/admin/logout", {
      method: "POST",
      headers: { Referer: "http://localhost:3000/admin" },
    });
    assert.equal(readRequestOrigin(request), "http://localhost:3000");
    assert.equal(isAllowedAdminMutationOrigin(request), true);
  });

  it("rejects cross-origin and missing origin", () => {
    const cross = new Request("http://localhost:3000/api/admin/login", {
      method: "POST",
      headers: { Origin: "https://evil.example" },
    });
    assert.equal(isAllowedAdminMutationOrigin(cross), false);
    const missing = new Request("http://localhost:3000/api/admin/login", {
      method: "POST",
    });
    assert.equal(isAllowedAdminMutationOrigin(missing), false);
    const result = assertAdminMutationOrigin(cross);
    assert.equal(result.ok, false);
    if (!result.ok) {
      assert.equal(result.status, 403);
      assert.equal(result.error.includes("evil.example"), false);
    }
  });

  it("honors ADMIN_ALLOWED_ORIGINS allowlist", () => {
    const request = new Request("http://localhost:3000/api/admin/login", {
      method: "POST",
      headers: { Origin: "https://preview.example.com" },
    });
    assert.equal(
      isAllowedAdminMutationOrigin(request, {
        ADMIN_ALLOWED_ORIGINS: "https://preview.example.com",
      }),
      true,
    );
  });
});

describe("login rate limit", () => {
  it("blocks after max attempts within the window", () => {
    const store = new Map();
    const key = "ip:203.0.113.10";
    const now = 1_000_000;
    for (let i = 0; i < 10; i++) {
      const r = consumeLoginAttempt(key, {
        store,
        now,
        maxAttempts: 10,
        windowMs: 60_000,
      });
      assert.equal(r.allowed, true);
    }
    const blocked = consumeLoginAttempt(key, {
      store,
      now: now + 1_000,
      maxAttempts: 10,
      windowMs: 60_000,
    });
    assert.equal(blocked.allowed, false);
    if (!blocked.allowed) {
      assert.ok(blocked.retryAfterSeconds >= 1);
    }
    resetLoginAttempts(key, store);
    const afterReset = consumeLoginAttempt(key, {
      store,
      now: now + 2_000,
      maxAttempts: 10,
      windowMs: 60_000,
    });
    assert.equal(afterReset.allowed, true);
  });

  it("derives a stable client key from forwarded headers", () => {
    const request = new Request("http://localhost:3000/api/admin/login", {
      headers: { "x-forwarded-for": "198.51.100.2, 10.0.0.1" },
    });
    assert.equal(clientKeyFromRequest(request), "ip:198.51.100.2");
  });
});

describe("public catalog bootstrap privacy (static)", () => {
  it("load-storefront-catalog requests published products only", () => {
    const src = readFileSync(
      path.join(here, "catalog/load-storefront-catalog.ts"),
      "utf8",
    );
    assert.ok(src.includes("includeUnpublished: false"));
    assert.equal(src.includes("includeUnpublished: true"), false);
  });

  it("env example documents ADMIN_SESSION_SECRET", () => {
    const envExample = readFileSync(
      path.join(repoRoot, ".env.example"),
      "utf8",
    );
    assert.match(envExample, /^ADMIN_SESSION_SECRET=/m);
    assert.ok(envExample.includes("in-memory"));
  });

  it("login and logout routes use Origin checks; logout clears with mirrored attrs", () => {
    const login = readFileSync(
      path.join(repoRoot, "src/app/api/admin/login/route.ts"),
      "utf8",
    );
    const logout = readFileSync(
      path.join(repoRoot, "src/app/api/admin/logout/route.ts"),
      "utf8",
    );
    assert.ok(login.includes("assertAdminMutationOrigin"));
    assert.ok(login.includes("consumeLoginAttempt"));
    assert.ok(logout.includes("assertAdminMutationOrigin"));
    assert.ok(logout.includes("clearSessionCookieOptions"));
  });
});
