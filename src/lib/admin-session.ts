/**
 * Admin demo session tokens (Phase B3a.1).
 *
 * - Login password: ADMIN_DEMO_PASSWORD
 * - Token HMAC key: ADMIN_SESSION_SECRET (separate from the password)
 * - Production fails closed when either secret is missing or the session secret
 *   is shorter than the minimum length.
 *
 * Never log or return these secrets.
 */
import { createHash, createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "scf_admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours
/** Minimum ADMIN_SESSION_SECRET length in production. */
const MIN_SESSION_SECRET_LENGTH_PROD = 16;

export type AdminEnv = NodeJS.ProcessEnv | Record<string, string | undefined>;

function isProduction(env: AdminEnv): boolean {
  return (env.NODE_ENV ?? process.env.NODE_ENV) === "production";
}

function getPassword(env: AdminEnv = process.env): string | undefined {
  const value = env.ADMIN_DEMO_PASSWORD?.trim();
  return value || undefined;
}

function getSessionSecret(env: AdminEnv = process.env): string | undefined {
  const value = env.ADMIN_SESSION_SECRET?.trim();
  if (!value) return undefined;
  if (isProduction(env) && value.length < MIN_SESSION_SECRET_LENGTH_PROD) {
    return undefined;
  }
  return value;
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

function digestUtf8(value: string): Buffer {
  return createHash("sha256").update(value, "utf8").digest();
}

export function getAdminCookieName(): string {
  return COOKIE_NAME;
}

export function getAdminSessionMaxAgeSeconds(): number {
  return MAX_AGE_SECONDS;
}

/**
 * True when both login password and session signing secret are usable.
 * Production rejects short session secrets (treated as missing).
 */
export function adminAuthConfigured(env: AdminEnv = process.env): boolean {
  return Boolean(getPassword(env) && getSessionSecret(env));
}

/** @deprecated Prefer adminAuthConfigured — kept for existing callers. */
export function adminPasswordConfigured(env: AdminEnv = process.env): boolean {
  return adminAuthConfigured(env);
}

export function createAdminSessionToken(options?: {
  env?: AdminEnv;
  now?: number;
}): string | null {
  const env = options?.env ?? process.env;
  const secret = getSessionSecret(env);
  if (!getPassword(env) || !secret) return null;
  const now = options?.now ?? Date.now();
  const exp = now + MAX_AGE_SECONDS * 1000;
  const payload = `ok.${exp}`;
  const signature = sign(payload, secret);
  return `${payload}.${signature}`;
}

export function verifyAdminSessionToken(
  token: string | undefined,
  options?: { env?: AdminEnv; now?: number },
): boolean {
  const env = options?.env ?? process.env;
  const secret = getSessionSecret(env);
  if (!secret || !token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [flag, expRaw, signature] = parts;
  if (flag !== "ok") return false;
  const exp = Number(expRaw);
  const now = options?.now ?? Date.now();
  if (!Number.isFinite(exp) || now > exp) return false;
  const payload = `${flag}.${expRaw}`;
  const expected = sign(payload, secret);
  try {
    const a = Buffer.from(signature, "utf8");
    const b = Buffer.from(expected, "utf8");
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

/**
 * Constant-time-ish password check via SHA-256 digests (equal length).
 * Returns false when password is not configured.
 */
export function verifyAdminPassword(
  input: string,
  env: AdminEnv = process.env,
): boolean {
  const password = getPassword(env);
  if (!password) return false;
  try {
    return timingSafeEqual(digestUtf8(input), digestUtf8(password));
  } catch {
    return false;
  }
}

function secureCookieFlag(env: AdminEnv = process.env): boolean {
  return isProduction(env);
}

export function sessionCookieOptions(
  token: string,
  env: AdminEnv = process.env,
) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: secureCookieFlag(env),
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  };
}

/** Clear cookie with the same security attributes as the session cookie. */
export function clearSessionCookieOptions(env: AdminEnv = process.env) {
  return {
    name: COOKIE_NAME,
    value: "",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: secureCookieFlag(env),
    path: "/",
    maxAge: 0,
  };
}

/**
 * Human-safe misconfiguration message (no secret values).
 */
export function adminAuthMisconfiguredMessage(
  env: AdminEnv = process.env,
): string {
  const missingPassword = !getPassword(env);
  const missingSecret = !getSessionSecret(env);
  if (missingPassword && missingSecret) {
    return "Admin authentication is not configured. Set ADMIN_DEMO_PASSWORD and ADMIN_SESSION_SECRET in .env.local, then restart the server.";
  }
  if (missingPassword) {
    return "Admin password is not configured. Set ADMIN_DEMO_PASSWORD in .env.local, then restart the server.";
  }
  if (isProduction(env)) {
    return "Admin session secret is missing or too short. Set ADMIN_SESSION_SECRET (min 16 characters) in the host secret store.";
  }
  return "Admin session secret is not configured. Set ADMIN_SESSION_SECRET in .env.local, then restart the server.";
}
