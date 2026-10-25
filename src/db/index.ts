/**
 * Server-only Neon + Drizzle client (Phase A / B1.1).
 * Do not import this module from Client Components.
 * Storefront catalog cutover is Phase B (`USE_SERVER_CATALOG`).
 *
 * `import "server-only"` enforces a compile-time Client Component boundary.
 * Runtime guard remains as defense in depth.
 */
import "server-only";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { requireDatabaseUrl } from "./database-url";
import * as schema from "./schema";

function assertServerOnly(): void {
  if (typeof window !== "undefined") {
    throw new Error(
      "src/db/index.ts is server-only and must not be imported in the browser.",
    );
  }
}

assertServerOnly();

/**
 * Lazy client so importing this module during `next build` does not require
 * DATABASE_URL until a query actually runs.
 */
let _db: ReturnType<typeof drizzle<typeof schema>> | null = null;

export function getDb() {
  assertServerOnly();
  const url = requireDatabaseUrl(
    process.env.DATABASE_URL,
    "getDb()",
  );
  if (!_db) {
    const sql = neon(url);
    _db = drizzle(sql, { schema });
  }
  return _db;
}

export type Db = ReturnType<typeof getDb>;
export * from "./schema";
export { isInvalidDatabaseUrl, requireDatabaseUrl } from "./database-url";
