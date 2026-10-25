/**
 * Pure helpers for Phase B2 storefront catalog bootstrap decisions.
 * No database I/O — safe for offline tests.
 */
import type { Product } from "@/types";

export type StorefrontCatalogBootstrap =
  | { mode: "seed" }
  | { mode: "server"; products: Product[] }
  | { mode: "error"; message: string };

export type CatalogAccessLike =
  | { status: "seed"; useServerCatalog: false }
  | { status: "server_ready"; useServerCatalog: true }
  | {
      status: "misconfigured";
      useServerCatalog: true;
      message: string;
    };

const SECRETISH =
  /postgresql:\/\/|neon\.tech|password|@[\w.-]+:\d+|DATABASE_URL/i;

/**
 * Strip connection strings and similar leaks from error text shown to users.
 */
export function sanitizeCatalogErrorMessage(
  err: unknown,
  fallback =
    "The product catalog could not be loaded. Check server configuration and try again.",
): string {
  const raw =
    err instanceof Error
      ? err.message
      : typeof err === "string"
        ? err
        : fallback;
  if (!raw.trim()) return fallback;
  // Keep known safe configuration messages from access resolution.
  if (raw.includes("USE_SERVER_CATALOG")) return raw;
  if (raw.includes("Server catalog is disabled")) return raw;
  if (SECRETISH.test(raw)) return fallback;
  // Generic DB/driver failures → non-secret fallback.
  if (
    /ECONNREFUSED|ENOTFOUND|timeout|fetch failed|NeonDbError|Drizzle/i.test(
      raw,
    )
  ) {
    return fallback;
  }
  // Cap length; avoid dumping stacks.
  return raw.length > 280 ? fallback : raw;
}

/**
 * Map access resolution to bootstrap without fetching.
 * Returns `"fetch"` when the caller should load products from the database.
 */
export function planStorefrontCatalogBootstrap(
  access: CatalogAccessLike,
): StorefrontCatalogBootstrap | "fetch" {
  if (access.status === "seed") {
    return { mode: "seed" };
  }
  if (access.status === "misconfigured") {
    return { mode: "error", message: access.message };
  }
  return "fetch";
}

export function storefrontBootstrapFromProducts(
  products: Product[],
): StorefrontCatalogBootstrap {
  return { mode: "server", products };
}

export function storefrontBootstrapFromFailure(
  err: unknown,
): StorefrontCatalogBootstrap {
  return {
    mode: "error",
    message: sanitizeCatalogErrorMessage(err),
  };
}
