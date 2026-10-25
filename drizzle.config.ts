import { config as loadEnv } from "dotenv";
import { defineConfig } from "drizzle-kit";
import {
  isInvalidDatabaseUrl,
  requireDatabaseUrl,
  resolveDatabaseUrlFromEnv,
} from "./src/db/database-url";

// Load local secrets for CLI only — never commit .env.local
loadEnv({ path: ".env.local" });
loadEnv();

/**
 * Drizzle Kit config for Neon Postgres.
 * - `db:generate` does not connect; credentials are omitted when no valid URL is set.
 * - `db:migrate` / `db:studio` (and push) require a real DATABASE_URL and fail
 *   before any connection attempt when unset or still a Phase A placeholder.
 * Never falls back to a fake localhost URL.
 */
const argv = process.argv.join(" ").toLowerCase();
const requiresLiveDatabase =
  /\b(migrate|studio|push)\b/.test(argv) ||
  argv.includes("drizzle-kit migrate") ||
  argv.includes("drizzle-kit studio") ||
  argv.includes("drizzle-kit push");

const resolved = resolveDatabaseUrlFromEnv();

if (requiresLiveDatabase) {
  requireDatabaseUrl(
    resolved,
    "drizzle.config (migrate/studio/push)",
  );
} else if (resolved && isInvalidDatabaseUrl(resolved)) {
  // Generate must not silently treat a placeholder as a real target either.
  requireDatabaseUrl(
    resolved,
    "drizzle.config",
  );
}

const config = defineConfig({
  dialect: "postgresql",
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  strict: true,
  verbose: true,
  ...(resolved && !isInvalidDatabaseUrl(resolved)
    ? { dbCredentials: { url: resolved } }
    : {}),
});

export default config;
