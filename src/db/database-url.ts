/**
 * Shared DATABASE_URL validation for the server client, seed script, and Drizzle Kit.
 * Never log or return the raw connection string — errors must stay secret-safe.
 */

const PLACEHOLDER_MARKERS = [
  "phase_a_placeholder",
  "127.0.0.1:5432/phase_a_placeholder",
  "localhost:5432/phase_a_placeholder",
] as const;

/** True when the value is missing, blank, or a known Phase A / fake URL. */
export function isInvalidDatabaseUrl(url: string | undefined | null): boolean {
  const trimmed = url?.trim() ?? "";
  if (!trimmed) return true;
  const lower = trimmed.toLowerCase();
  return PLACEHOLDER_MARKERS.some((marker) => lower.includes(marker));
}

/**
 * Returns a trimmed connection string or throws a secret-safe error.
 * Does not connect and does not include the URL in the message.
 */
export function requireDatabaseUrl(
  url: string | undefined | null,
  context: string,
): string {
  const trimmed = url?.trim() ?? "";
  if (!trimmed) {
    throw new Error(
      `${context}: DATABASE_URL is missing or blank. Copy .env.example to .env.local, set a real Neon URL after the owner provisions it, then retry. Aborting without connecting.`,
    );
  }
  if (isInvalidDatabaseUrl(trimmed)) {
    throw new Error(
      `${context}: DATABASE_URL looks like a Phase A placeholder or fake local URL. Refusing to connect. Set a real Neon connection string in .env.local (never commit secrets).`,
    );
  }
  return trimmed;
}

/** Prefer unpooled URL for migrations when present; otherwise pooled DATABASE_URL. */
export function resolveDatabaseUrlFromEnv(): string | undefined {
  const unpooled = process.env.DATABASE_URL_UNPOOLED?.trim();
  const pooled = process.env.DATABASE_URL?.trim();
  return unpooled || pooled || undefined;
}
