/**
 * Server-only storefront catalog bootstrap (Phase B2).
 * Loads Neon products only when USE_SERVER_CATALOG is enabled and configured.
 * Never falls back to seed data when the server catalog path fails.
 */
import "server-only";
import { listProductsFromDatabase } from "@/lib/catalog/server-catalog";
import { resolveServerCatalogAccess } from "@/lib/catalog/server-catalog-access";
import {
  planStorefrontCatalogBootstrap,
  storefrontBootstrapFromFailure,
  storefrontBootstrapFromProducts,
  type StorefrontCatalogBootstrap,
} from "@/lib/catalog/storefront-bootstrap";

/**
 * Resolve the catalog source for the storefront Providers tree.
 * - seed: existing SEED_PRODUCTS + localStorage path
 * - server: Neon products — **published only** (B3a.1 public privacy)
 * - error: flag on but misconfigured or query failed (no seed fallback)
 *
 * Unpublished drafts must not appear in public RSC props or client payloads.
 * Authenticated admin unpublished access is a separate future endpoint.
 */
export async function loadStorefrontCatalogBootstrap(): Promise<StorefrontCatalogBootstrap> {
  const access = resolveServerCatalogAccess();
  const planned = planStorefrontCatalogBootstrap(access);
  if (planned !== "fetch") {
    return planned;
  }

  try {
    const products = await listProductsFromDatabase({
      includeUnpublished: false,
    });
    return storefrontBootstrapFromProducts(products);
  } catch (err) {
    console.warn(
      "[storefront-catalog] Failed to load server catalog:",
      err instanceof Error ? err.message : "unknown error",
    );
    return storefrontBootstrapFromFailure(err);
  }
}
