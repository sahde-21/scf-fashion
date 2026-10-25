/**
 * Browser-safe catalog feature flag helpers (Phase B1.1).
 *
 * IMPORTANT: This module must NOT import any database modules.
 * Client Components may read a boolean passed from the server, or call
 * `isServerCatalogEnabled` with an explicit env snapshot — never with secrets.
 * Prefer passing `useServerCatalog` from RSC/API in B2.
 *
 * Full access resolution (connection-string checks) lives in
 * `server-catalog-access.ts` (server-only).
 */

function parseBoolFlag(raw: string | undefined | null): boolean {
  if (raw == null) return false;
  const v = raw.trim().toLowerCase();
  if (!v) return false;
  return v === "1" || v === "true" || v === "yes" || v === "on";
}

/**
 * Whether USE_SERVER_CATALOG is enabled.
 * Unset / blank / "false" → false (safe default).
 */
export function isServerCatalogEnabled(
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env,
): boolean {
  return parseBoolFlag(env.USE_SERVER_CATALOG);
}
