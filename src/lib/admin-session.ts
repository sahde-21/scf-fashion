import { createHmac, timingSafeEqual } from "crypto";

const COOKIE_NAME = "scf_admin_session";
const MAX_AGE_SECONDS = 60 * 60 * 8; // 8 hours

function getPassword(): string | undefined {
  const value = process.env.ADMIN_DEMO_PASSWORD?.trim();
  return value || undefined;
}

function sign(payload: string, secret: string): string {
  return createHmac("sha256", secret).update(payload).digest("hex");
}

export function getAdminCookieName(): string {
  return COOKIE_NAME;
}

export function createAdminSessionToken(): string | null {
  const password = getPassword();
  if (!password) return null;
  const exp = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = `ok.${exp}`;
  const signature = sign(payload, password);
  return `${payload}.${signature}`;
}

export function verifyAdminSessionToken(token: string | undefined): boolean {
  const password = getPassword();
  if (!password || !token) return false;
  const parts = token.split(".");
  if (parts.length !== 3) return false;
  const [flag, expRaw, signature] = parts;
  if (flag !== "ok") return false;
  const exp = Number(expRaw);
  if (!Number.isFinite(exp) || Date.now() > exp) return false;
  const payload = `${flag}.${expRaw}`;
  const expected = sign(payload, password);
  try {
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return false;
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function adminPasswordConfigured(): boolean {
  return Boolean(getPassword());
}

export function verifyAdminPassword(input: string): boolean {
  const password = getPassword();
  if (!password) return false;
  const a = Buffer.from(input);
  const b = Buffer.from(password);
  if (a.length !== b.length) return false;
  try {
    return timingSafeEqual(a, b);
  } catch {
    return false;
  }
}

export function sessionCookieOptions(token: string) {
  return {
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  };
}
