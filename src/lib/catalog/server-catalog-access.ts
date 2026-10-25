/**
 * Server-side catalog access resolution (Phase B1.1).
 *
 * Imports database URL validators — do NOT import this module from Client Components.
 * `import "server-only"` enforces a compile-time Client Component boundary.
 * Runtime guard remains as defense in depth.
 */
import "server-only";
import { isInvalidDatabaseUrl } from "@/db/database-url";
import { isServerCatalogEnabled } from "@/lib/catalog/catalog-flag";

function assertServerRuntime(moduleLabel: string): void {
  if (typeof window !== "undefined") {
    throw new Error(
      `${moduleLabel} is server-only and must not be imported in the browser.`,
    );
  }
}

assertServerRuntime("src/lib/catalog/server-catalog-access.ts");

export type ServerCatalogAccess =
  | { status: "seed"; useServerCatalog: false }
  | { status: "server_ready"; useServerCatalog: true }
  | {
      status: "misconfigured";
      useServerCatalog: true;
      reason: "missing_or_invalid_database_url";
      message: string;
    };

/**
 * Resolve catalog source without connecting to a database.
 * When the flag is on, a valid DATABASE_URL must also be present (placeholder rejected).
 * Never includes the connection string in messages.
 */
export function resolveServerCatalogAccess(
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env,
  options: {
    isInvalidDatabaseUrl?: (url: string | undefined | null) => boolean;
  } = {},
): ServerCatalogAccess {
  assertServerRuntime("resolveServerCatalogAccess");
  const useServerCatalog = isServerCatalogEnabled(env);
  if (!useServerCatalog) {
    return { status: "seed", useServerCatalog: false };
  }

  const isInvalid = options.isInvalidDatabaseUrl ?? isInvalidDatabaseUrl;
  const url = env.DATABASE_URL?.trim();
  if (isInvalid(url)) {
    return {
      status: "misconfigured",
      useServerCatalog: true,
      reason: "missing_or_invalid_database_url",
      message:
        "USE_SERVER_CATALOG is enabled but DATABASE_URL is missing, blank, or a Phase A placeholder. Keep USE_SERVER_CATALOG=false until Neon is provisioned, migrated, and seeded.",
    };
  }

  return { status: "server_ready", useServerCatalog: true };
}

/**
 * Throws when server catalog is requested but misconfigured.
 * No-op when the flag is off (seed path).
 */
export function assertServerCatalogConfigured(
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env,
): void {
  const access = resolveServerCatalogAccess(env);
  if (access.status === "misconfigured") {
    throw new Error(access.message);
  }
}

/**
 * Requires status === server_ready (flag on + valid URL).
 * Use before performing Neon catalog queries.
 */
export function assertServerCatalogReady(
  env: NodeJS.ProcessEnv | Record<string, string | undefined> = process.env,
): void {
  const access = resolveServerCatalogAccess(env);
  if (access.status === "misconfigured") {
    throw new Error(access.message);
  }
  if (access.status !== "server_ready") {
    throw new Error(
      "Server catalog is disabled. Set USE_SERVER_CATALOG=true only after Neon migrate/seed (Phase B2+).",
    );
  }
}
