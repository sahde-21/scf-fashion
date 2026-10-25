/**
 * Pure Drizzle-row → Product mappers (Phase B1.1).
 * No database I/O. Validates ids/slugs/prices/JSONB; isolates bad rows in batch maps.
 */
import { withDerivedAvailability } from "@/lib/inventory";
import type { CategoryId, Product, ProductColor, ProductViews } from "@/types";

const CATEGORY_IDS = new Set<CategoryId>([
  "men",
  "women",
  "shoes",
  "bags",
  "accessories",
]);

/** Plain product row shape (matches `products` select / seed inserts). */
export type CatalogProductRow = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  priceUsd: string | number;
  images: unknown;
  views: unknown;
  tags: unknown;
  sizes: unknown;
  featured: boolean;
  newArrival: boolean;
  popular: boolean;
  published: boolean;
  createdAt: Date | string;
};

export type CatalogColorRow = {
  id: string;
  productId: string;
  colorKey: string;
  name: string;
  hex: string;
  images: unknown;
  sortOrder: number;
};

export type CatalogStockRow = {
  productId: string;
  size: string;
  quantity: number;
};

export type CatalogMapSkip = {
  productId?: string;
  slug?: string;
  reason: string;
};

export type MapProductsResult = {
  products: Product[];
  skipped: CatalogMapSkip[];
};

export function requireNonEmptyId(raw: unknown, field: string): string {
  if (typeof raw !== "string") {
    throw new Error(`Invalid ${field}: must be a non-empty string`);
  }
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error(`Invalid ${field}: empty or whitespace-only`);
  }
  return trimmed;
}

export function parseCategoryId(raw: string): CategoryId {
  if (!CATEGORY_IDS.has(raw as CategoryId)) {
    throw new Error(`Invalid product category: ${raw}`);
  }
  return raw as CategoryId;
}

/**
 * Rejects empty, whitespace, non-numeric, non-finite, and negative prices.
 */
export function parsePriceUsd(raw: string | number): number {
  if (typeof raw === "number") {
    if (!Number.isFinite(raw)) {
      throw new Error("Invalid price_usd: not finite");
    }
    if (raw < 0) {
      throw new Error("Invalid price_usd: negative");
    }
    return raw;
  }
  if (typeof raw !== "string") {
    throw new Error("Invalid price_usd: must be a string or number");
  }
  const trimmed = raw.trim();
  if (!trimmed) {
    throw new Error("Invalid price_usd: empty");
  }
  // Disallow bare whitespace-normalized empties already handled; reject pure junk.
  if (!/^-?\d+(\.\d+)?$/.test(trimmed)) {
    throw new Error("Invalid price_usd: not a decimal number");
  }
  const n = Number(trimmed);
  if (!Number.isFinite(n)) {
    throw new Error(`Invalid price_usd: ${trimmed}`);
  }
  if (n < 0) {
    throw new Error("Invalid price_usd: negative");
  }
  return n;
}

export function toIsoCreatedAt(raw: Date | string): string {
  if (raw instanceof Date) {
    if (Number.isNaN(raw.getTime())) {
      throw new Error("Invalid created_at date");
    }
    return raw.toISOString();
  }
  if (typeof raw !== "string" || !raw.trim()) {
    throw new Error("Invalid created_at: empty or not a string");
  }
  const d = new Date(raw);
  if (Number.isNaN(d.getTime())) {
    throw new Error(`Invalid created_at: ${raw}`);
  }
  return d.toISOString();
}

/**
 * null/undefined → []. Otherwise must be an array of strings (empty allowed).
 */
export function parseStringArrayField(
  value: unknown,
  field: string,
): string[] {
  if (value == null) return [];
  if (!Array.isArray(value)) {
    throw new Error(`Invalid ${field}: expected a JSON array of strings`);
  }
  const out: string[] = [];
  for (let i = 0; i < value.length; i++) {
    const item = value[i];
    if (typeof item !== "string") {
      throw new Error(`Invalid ${field}[${i}]: expected string`);
    }
    out.push(item);
  }
  return out;
}

export function parseViewsField(value: unknown): ProductViews | undefined {
  if (value == null) return undefined;
  if (typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Invalid views: expected object or null");
  }
  const record = value as Record<string, unknown>;
  const views: ProductViews = {};
  if ("front" in record && record.front != null) {
    if (typeof record.front !== "string") {
      throw new Error("Invalid views.front: expected string");
    }
    if (record.front) views.front = record.front;
  }
  if ("back" in record && record.back != null) {
    if (typeof record.back !== "string") {
      throw new Error("Invalid views.back: expected string");
    }
    if (record.back) views.back = record.back;
  }
  if (!views.front && !views.back) return undefined;
  return views;
}

export function mapColorRow(row: CatalogColorRow): ProductColor {
  const colorKey = requireNonEmptyId(row.colorKey, "color_key");
  const name = requireNonEmptyId(row.name, "color.name");
  const hex = requireNonEmptyId(row.hex, "color.hex");
  const color: ProductColor = {
    id: colorKey,
    name,
    hex,
  };
  if (row.images != null) {
    color.images = parseStringArrayField(row.images, "color.images");
  }
  return color;
}

export function buildStockBySize(
  sizes: string[],
  stockRows: readonly CatalogStockRow[],
): Record<string, number> {
  const bySize = new Map<string, number>();
  for (const row of stockRows) {
    if (typeof row.size !== "string" || !row.size.trim()) {
      throw new Error("Invalid stock size: empty or not a string");
    }
    const qty =
      typeof row.quantity === "number" && Number.isFinite(row.quantity)
        ? Math.max(0, Math.floor(row.quantity))
        : 0;
    bySize.set(row.size, qty);
  }
  const stockBySize: Record<string, number> = {};
  for (const size of sizes) {
    stockBySize[size] = bySize.get(size) ?? 0;
  }
  // Retain orphan stock sizes not listed on the product (no delete in B1).
  for (const [size, qty] of bySize) {
    if (!(size in stockBySize)) {
      stockBySize[size] = qty;
    }
  }
  return stockBySize;
}

/**
 * Map one product + its color/stock rows into the storefront `Product` type.
 * Throws on invalid data (caller may isolate in batch maps).
 */
export function mapProductFromRows(
  product: CatalogProductRow,
  colors: readonly CatalogColorRow[],
  stock: readonly CatalogStockRow[],
): Product {
  const id = requireNonEmptyId(product.id, "id");
  const slug = requireNonEmptyId(product.slug, "slug");
  const sizes = parseStringArrayField(product.sizes, "sizes");
  const images = parseStringArrayField(product.images, "images");
  const tags = parseStringArrayField(product.tags, "tags");

  const sortedColors = [...colors]
    .filter((c) => c.productId === product.id || c.productId === id)
    .sort(
      (a, b) =>
        (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0) ||
        String(a.colorKey).localeCompare(String(b.colorKey)),
    )
    .map(mapColorRow);

  const stockForProduct = stock.filter(
    (s) => s.productId === product.id || s.productId === id,
  );
  const stockBySize = buildStockBySize(sizes, stockForProduct);
  const views = parseViewsField(product.views);

  const mapped: Product = {
    id,
    slug,
    name: requireNonEmptyId(product.name, "name"),
    description:
      typeof product.description === "string" ? product.description : "",
    category: parseCategoryId(String(product.category)),
    priceUsd: parsePriceUsd(product.priceUsd as string | number),
    images,
    sizes,
    stockBySize,
    colors: sortedColors,
    tags,
    featured: Boolean(product.featured),
    newArrival: Boolean(product.newArrival),
    popular: Boolean(product.popular),
    published: Boolean(product.published),
    inStock: false,
    createdAt: toIsoCreatedAt(product.createdAt),
  };

  if (views) {
    mapped.views = views;
  }

  return withDerivedAvailability(mapped);
}

function skipReason(err: unknown): string {
  return err instanceof Error ? err.message : "Unknown mapping error";
}

/**
 * Map many products; invalid rows are skipped (not thrown) so one bad row
 * cannot blank the whole catalog. Diagnostics are secret-safe (no URLs).
 */
export function mapProductsFromRows(
  productRows: readonly CatalogProductRow[],
  colorRows: readonly CatalogColorRow[],
  stockRows: readonly CatalogStockRow[],
): MapProductsResult {
  const colorsByProduct = new Map<string, CatalogColorRow[]>();
  for (const color of colorRows) {
    const list = colorsByProduct.get(color.productId) ?? [];
    list.push(color);
    colorsByProduct.set(color.productId, list);
  }
  const stockByProduct = new Map<string, CatalogStockRow[]>();
  for (const row of stockRows) {
    const list = stockByProduct.get(row.productId) ?? [];
    list.push(row);
    stockByProduct.set(row.productId, list);
  }

  const products: Product[] = [];
  const skipped: CatalogMapSkip[] = [];

  for (const product of productRows) {
    try {
      const mapped = mapProductFromRows(
        product,
        colorsByProduct.get(product.id) ?? [],
        stockByProduct.get(product.id) ?? [],
      );
      products.push(mapped);
    } catch (err) {
      skipped.push({
        productId:
          typeof product.id === "string" && product.id.trim()
            ? product.id.trim()
            : undefined,
        slug:
          typeof product.slug === "string" && product.slug.trim()
            ? product.slug.trim()
            : undefined,
        reason: skipReason(err),
      });
    }
  }

  products.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
  return { products, skipped };
}

/** Storefront default: published products only. */
export function filterPublishedProducts(products: readonly Product[]): Product[] {
  return products.filter((p) => p.published);
}

export function findProductBySlug(
  products: readonly Product[],
  slug: string,
  options: { includeUnpublished?: boolean } = {},
): Product | undefined {
  return products.find(
    (p) =>
      p.slug === slug && (options.includeUnpublished || p.published),
  );
}

/** Secret-safe server diagnostic for skipped catalog rows. */
export function formatCatalogSkipDiagnostics(skipped: CatalogMapSkip[]): string {
  if (skipped.length === 0) return "";
  return skipped
    .map((s) => {
      const who = s.productId || s.slug || "(unknown)";
      return `${who}: ${s.reason}`;
    })
    .join("; ");
}
