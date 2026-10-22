import type { Product } from "@/types";

/**
 * Demo inventory helpers. Quantities live on the product object
 * (seed data or browser localStorage overrides) — not a server database.
 */

export function hasStockBySize(product: Product): boolean {
  return Boolean(product.stockBySize && Object.keys(product.stockBySize).length);
}

/** Units available for a size. `null` means legacy boolean `inStock` only. */
export function getStockForSize(
  product: Product,
  size: string,
): number | null {
  if (!hasStockBySize(product)) return null;
  const raw = product.stockBySize?.[size];
  if (typeof raw !== "number" || Number.isNaN(raw)) return 0;
  return Math.max(0, Math.floor(raw));
}

export function isSizeAvailable(product: Product, size: string): boolean {
  const stock = getStockForSize(product, size);
  if (stock === null) return product.inStock;
  return stock > 0;
}

/** True when the product can be sold in at least one size. */
export function isProductAvailable(product: Product): boolean {
  if (!product.published) return false;
  if (hasStockBySize(product)) {
    return product.sizes.some((size) => isSizeAvailable(product, size));
  }
  return product.inStock;
}

export function maxOrderQuantity(
  product: Product,
  size: string,
  cap = 20,
): number {
  const stock = getStockForSize(product, size);
  if (stock === null) return product.inStock ? cap : 0;
  return Math.min(cap, stock);
}

/**
 * Keep `inStock` aligned with per-size quantities when they are present.
 * Seed products without `stockBySize` keep their explicit boolean.
 */
export function withDerivedAvailability(product: Product): Product {
  if (!hasStockBySize(product)) return product;
  const inStock = product.sizes.some((size) => {
    const qty = product.stockBySize?.[size];
    return typeof qty === "number" && qty > 0;
  });
  return { ...product, inStock };
}

/** Build a stock map for editor defaults; missing sizes start at 0. */
export function stockMapForSizes(
  sizes: string[],
  existing?: Record<string, number>,
): Record<string, number> {
  const next: Record<string, number> = {};
  for (const size of sizes) {
    const value = existing?.[size];
    next[size] =
      typeof value === "number" && !Number.isNaN(value)
        ? Math.max(0, Math.floor(value))
        : 0;
  }
  return next;
}
