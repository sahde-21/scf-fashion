import { SEED_PRODUCTS } from "@/data/products";
import type { CategoryId, Product, ProductFilters, SortOption } from "@/types";

export type ProductOverrideMap = Record<string, Partial<Product> | null>;

export function mergeProducts(overrides: ProductOverrideMap = {}): Product[] {
  const byId = new Map<string, Product>();

  for (const seed of SEED_PRODUCTS) {
    byId.set(seed.id, { ...seed });
  }

  for (const [id, override] of Object.entries(overrides)) {
    if (override === null) {
      byId.delete(id);
      continue;
    }
    const existing = byId.get(id);
    if (existing) {
      byId.set(id, { ...existing, ...override, id });
    } else if (override.id && override.slug && override.name) {
      byId.set(id, override as Product);
    }
  }

  return Array.from(byId.values()).sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : -1,
  );
}

export function getPublishedProducts(overrides: ProductOverrideMap = {}): Product[] {
  return mergeProducts(overrides).filter((p) => p.published);
}

export function getProductBySlug(
  slug: string,
  overrides: ProductOverrideMap = {},
  includeUnpublished = false,
): Product | undefined {
  return mergeProducts(overrides).find(
    (p) => p.slug === slug && (includeUnpublished || p.published),
  );
}

export function getProductById(
  id: string,
  overrides: ProductOverrideMap = {},
): Product | undefined {
  return mergeProducts(overrides).find((p) => p.id === id);
}

function sortProducts(products: Product[], sort: SortOption): Product[] {
  const list = [...products];
  switch (sort) {
    case "price-asc":
      return list.sort((a, b) => a.priceUsd - b.priceUsd);
    case "price-desc":
      return list.sort((a, b) => b.priceUsd - a.priceUsd);
    case "name-asc":
      return list.sort((a, b) => a.name.localeCompare(b.name));
    case "newest":
      return list.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
    case "featured":
    default:
      return list.sort((a, b) => {
        const af = a.featured || a.popular ? 1 : 0;
        const bf = b.featured || b.popular ? 1 : 0;
        if (af !== bf) return bf - af;
        return a.createdAt < b.createdAt ? 1 : -1;
      });
  }
}

export function filterProducts(
  products: Product[],
  filters: ProductFilters,
): Product[] {
  let result = products.filter((p) => p.published);

  if (filters.category && filters.category !== "all") {
    result = result.filter((p) => p.category === filters.category);
  }

  if (filters.query.trim()) {
    const q = filters.query.trim().toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)) ||
        p.category.includes(q),
    );
  }

  if (filters.sizes.length) {
    result = result.filter((p) =>
      filters.sizes.some((size) => p.sizes.includes(size)),
    );
  }

  if (filters.colors.length) {
    result = result.filter((p) =>
      p.colors.some((c) => filters.colors.includes(c.id)),
    );
  }

  if (typeof filters.minPrice === "number") {
    result = result.filter((p) => p.priceUsd >= filters.minPrice!);
  }

  if (typeof filters.maxPrice === "number") {
    result = result.filter((p) => p.priceUsd <= filters.maxPrice!);
  }

  if (filters.inStockOnly) {
    result = result.filter((p) => p.inStock);
  }

  return sortProducts(result, filters.sort);
}

export function relatedProducts(
  product: Product,
  all: Product[],
  limit = 4,
): Product[] {
  return all
    .filter(
      (p) =>
        p.published &&
        p.id !== product.id &&
        (p.category === product.category ||
          p.tags.some((t) => product.tags.includes(t))),
    )
    .slice(0, limit);
}

export function categoryLabel(id: CategoryId | "all"): string {
  if (id === "all") return "All";
  return id.charAt(0).toUpperCase() + id.slice(1);
}

export function collectFilterOptions(products: Product[]) {
  const sizes = new Set<string>();
  const colors = new Map<string, { id: string; name: string; hex: string }>();
  let min = Number.POSITIVE_INFINITY;
  let max = 0;

  for (const p of products) {
    p.sizes.forEach((s) => sizes.add(s));
    p.colors.forEach((c) => colors.set(c.id, c));
    min = Math.min(min, p.priceUsd);
    max = Math.max(max, p.priceUsd);
  }

  return {
    sizes: Array.from(sizes),
    colors: Array.from(colors.values()),
    minPrice: Number.isFinite(min) ? min : 0,
    maxPrice: max,
  };
}
