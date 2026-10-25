/**
 * Server-only catalog reads via Drizzle (Phase B1.1).
 *
 * Wired into the storefront via `load-storefront-catalog` when USE_SERVER_CATALOG=true.
 * Default path remains seed/localStorage (flag false).
 * Importing this module does not connect; queries run only when list/get are called
 * and USE_SERVER_CATALOG is enabled with a valid DATABASE_URL.
 *
 * Do not import from Client Components.
 * `import "server-only"` enforces a compile-time Client Component boundary.
 */
import "server-only";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import {
  productColors,
  productSizeStock,
  products,
} from "@/db/schema";
import {
  assertServerCatalogReady,
  resolveServerCatalogAccess,
} from "@/lib/catalog/server-catalog-access";
import {
  filterPublishedProducts,
  findProductBySlug,
  formatCatalogSkipDiagnostics,
  mapProductsFromRows,
  type CatalogColorRow,
  type CatalogProductRow,
  type CatalogStockRow,
} from "@/lib/catalog/db-mappers";
import type { Product } from "@/types";

function assertServerOnly(): void {
  if (typeof window !== "undefined") {
    throw new Error(
      "src/lib/catalog/server-catalog.ts is server-only and must not be imported in the browser.",
    );
  }
}

assertServerOnly();

export { isServerCatalogEnabled } from "@/lib/catalog/catalog-flag";
export {
  assertServerCatalogConfigured,
  assertServerCatalogReady,
  resolveServerCatalogAccess,
} from "@/lib/catalog/server-catalog-access";

export type ListServerCatalogOptions = {
  /** When true, include unpublished products (admin). Default false. */
  includeUnpublished?: boolean;
};

function logSkippedRows(
  skipped: ReturnType<typeof mapProductsFromRows>["skipped"],
): void {
  if (skipped.length === 0) return;
  // Secret-safe: product id/slug + reason only — never connection strings.
  console.warn(
    `[server-catalog] Skipped ${skipped.length} invalid product row(s): ${formatCatalogSkipDiagnostics(skipped)}`,
  );
}

async function loadAllMappedProducts(): Promise<Product[]> {
  assertServerOnly();
  assertServerCatalogReady();

  const db = getDb();
  const [productRows, colorRows, stockRows] = await Promise.all([
    db.select().from(products),
    db.select().from(productColors),
    db.select().from(productSizeStock),
  ]);

  const { products: mapped, skipped } = mapProductsFromRows(
    productRows as CatalogProductRow[],
    colorRows as CatalogColorRow[],
    stockRows as CatalogStockRow[],
  );
  logSkippedRows(skipped);
  return mapped;
}

/**
 * List catalog products from Neon.
 * Requires USE_SERVER_CATALOG=true and a valid DATABASE_URL.
 * Storefront callers should use filter default (published only).
 */
export async function listProductsFromDatabase(
  options: ListServerCatalogOptions = {},
): Promise<Product[]> {
  const all = await loadAllMappedProducts();
  if (options.includeUnpublished) return all;
  return filterPublishedProducts(all);
}

/**
 * Fetch one product by slug from Neon.
 * Returns undefined when missing, unpublished (unless includeUnpublished),
 * or when the row fails validation (skipped with a server warning).
 */
export async function getProductBySlugFromDatabase(
  slug: string,
  options: ListServerCatalogOptions = {},
): Promise<Product | undefined> {
  assertServerOnly();
  assertServerCatalogReady();

  const db = getDb();
  const productRows = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);

  if (productRows.length === 0) return undefined;

  const product = productRows[0]!;
  const [colorRows, stockRows] = await Promise.all([
    db
      .select()
      .from(productColors)
      .where(eq(productColors.productId, product.id)),
    db
      .select()
      .from(productSizeStock)
      .where(eq(productSizeStock.productId, product.id)),
  ]);

  const { products: mapped, skipped } = mapProductsFromRows(
    [product as CatalogProductRow],
    colorRows as CatalogColorRow[],
    stockRows as CatalogStockRow[],
  );
  logSkippedRows(skipped);

  return findProductBySlug(mapped, slug, {
    includeUnpublished: options.includeUnpublished,
  });
}

/** Re-export access helper for server callers that already import this module. */
export { resolveServerCatalogAccess as resolveCatalogAccess };
