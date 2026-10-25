/**
 * @deprecated Prefer `@/lib/catalog/catalog-flag` from shared/browser-safe code,
 * and `@/lib/catalog/server-catalog-access` from server-only code.
 *
 * This barrel kept for B1 compatibility. It only re-exports the browser-safe flag.
 * Database URL resolution is NOT re-exported here (avoids accidental client → @/db edges).
 */
export { isServerCatalogEnabled } from "@/lib/catalog/catalog-flag";
