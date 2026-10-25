/**
 * Conservative in-memory login rate limiter (Phase B3a.1).
 *
 * LIMITATIONS (read before enabling public /admin):
 * - State lives in the current Node process only.
 * - On serverless / multi-instance / edge deployments, each isolate has its
 *   own map — limits do NOT aggregate. An attacker can retry across instances.
 * - Process restarts clear the map.
 * - Suitable for single-instance local/staging demos, not as sole protection
 *   for an internet-exposed admin login.
 * - Do not add a third-party rate-limit service without separate owner approval.
 */

export type RateLimitResult =
  | { allowed: true; remaining: number }
  | {
      allowed: false;
      remaining: number;
      retryAfterSeconds: number;
    };

type Bucket = {
  count: number;
  windowStartMs: number;
};

const DEFAULT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const DEFAULT_MAX_ATTEMPTS = 10;

const buckets = new Map<string, Bucket>();

export type RateLimitOptions = {
  windowMs?: number;
  maxAttempts?: number;
  now?: number;
  /** Injected map for offline tests. */
  store?: Map<string, Bucket>;
};

/**
 * Record one attempt for `key` (e.g. client IP). Returns whether allowed.
 */
export function consumeLoginAttempt(
  key: string,
  options: RateLimitOptions = {},
): RateLimitResult {
  const windowMs = options.windowMs ?? DEFAULT_WINDOW_MS;
  const maxAttempts = options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const now = options.now ?? Date.now();
  const store = options.store ?? buckets;

  const normalized = key.trim() || "unknown";
  let bucket = store.get(normalized);

  if (!bucket || now - bucket.windowStartMs >= windowMs) {
    bucket = { count: 0, windowStartMs: now };
    store.set(normalized, bucket);
  }

  if (bucket.count >= maxAttempts) {
    const retryAfterSeconds = Math.max(
      1,
      Math.ceil((bucket.windowStartMs + windowMs - now) / 1000),
    );
    return { allowed: false, remaining: 0, retryAfterSeconds };
  }

  bucket.count += 1;
  store.set(normalized, bucket);
  return {
    allowed: true,
    remaining: Math.max(0, maxAttempts - bucket.count),
  };
}

/** Clear limiter state (tests / successful login optional reset). */
export function resetLoginAttempts(
  key?: string,
  store: Map<string, Bucket> = buckets,
): void {
  if (key === undefined) {
    store.clear();
    return;
  }
  store.delete(key.trim() || "unknown");
}

/**
 * Best-effort client key for rate limiting. Never log the raw value in
 * responses; safe to use only as a map key.
 */
export function clientKeyFromRequest(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first) return `ip:${first}`;
  }
  const realIp = request.headers.get("x-real-ip")?.trim();
  if (realIp) return `ip:${realIp}`;
  return "ip:unknown";
}

export const LOGIN_RATE_LIMIT = {
  windowMs: DEFAULT_WINDOW_MS,
  maxAttempts: DEFAULT_MAX_ATTEMPTS,
} as const;
