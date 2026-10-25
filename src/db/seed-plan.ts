/**
 * Pure, offline-testable catalog seed planner (Phase A.2).
 *
 * Default: insert-only — never overwrite existing product/color metadata or stock qty.
 * Never emits delete operations (orphan colors / size-stock rows are retained).
 *
 * Atomicity (driver fact — do not fake):
 * - `drizzle-orm/neon-http` rejects interactive `db.transaction()`.
 * - Write batches use `db.batch()`, which Neon HTTP runs as one non-interactive
 *   transaction (`client.transaction(queries)`). That is true write atomicity
 *   for the planned mutations, not interactive multi-step TX.
 * - Snapshot reads happen before the batch (TOCTOU possible under concurrent seeders).
 *
 * Future (NOT implemented — needs explicit owner approval):
 * - Destructive cleanup of obsolete colors / size-stock rows not present in seed.
 * - Switching to `drizzle-orm/neon-serverless` + Pool/WebSocket for interactive TX.
 */

export const FORCE_CATALOG_FLAG = "--force-catalog" as const;
export const FORCE_STOCK_FLAG = "--force-stock" as const;

const ALLOWED_FORCE_FLAGS = new Set<string>([
  FORCE_CATALOG_FLAG,
  FORCE_STOCK_FLAG,
]);

/** Documented driver capabilities — used by offline tests and seed script. */
export const SEED_WRITE_ATOMICITY = {
  driver: "drizzle-orm/neon-http",
  interactiveTransactions: false,
  /** Neon HTTP `db.batch` → serverless `client.transaction(queries)`. */
  batchWriteTransaction: true,
  limitation:
    "Interactive db.transaction() throws on neon-http. Atomic writes require planning then db.batch(). Switching to neon-serverless Pool needs owner approval.",
} as const;

export type SeedFlags = {
  forceCatalog: boolean;
  forceStock: boolean;
};

export type SeedColorInput = {
  id: string;
  name: string;
  hex: string;
  images?: string[] | null;
};

export type SeedProductInput = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  priceUsd: number;
  images: string[];
  views?: { front?: string; back?: string } | null;
  tags: string[];
  sizes: string[];
  stockBySize?: Record<string, number>;
  colors: SeedColorInput[];
  featured?: boolean;
  newArrival?: boolean;
  popular?: boolean;
  published: boolean;
  createdAt: string;
};

export type ExistingCatalogSnapshot = {
  productIds: ReadonlySet<string>;
  /** Color row ids (`${productId}:${colorKey}`). */
  colorIds: ReadonlySet<string>;
  /** Composite keys `${productId}::${size}`. */
  stockKeys: ReadonlySet<string>;
};

export type ProductValues = {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: string;
  priceUsd: string;
  images: string[];
  views: { front?: string; back?: string } | null;
  tags: string[];
  sizes: string[];
  featured: boolean;
  newArrival: boolean;
  popular: boolean;
  published: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type ColorValues = {
  id: string;
  productId: string;
  colorKey: string;
  name: string;
  hex: string;
  images: string[] | null;
  sortOrder: number;
};

export type StockValues = {
  productId: string;
  size: string;
  quantity: number;
};

export type SeedOp =
  | { type: "insert_product"; values: ProductValues }
  | { type: "skip_product"; productId: string }
  | { type: "update_product"; productId: string; values: Omit<ProductValues, "id" | "createdAt"> }
  | { type: "insert_color"; values: ColorValues }
  | { type: "skip_color"; colorId: string }
  | { type: "update_color"; colorId: string; values: Omit<ColorValues, "id" | "productId"> }
  | { type: "insert_stock"; values: StockValues }
  | { type: "skip_stock"; productId: string; size: string }
  | { type: "upsert_stock"; values: StockValues };

export type SeedPlan = {
  flags: SeedFlags;
  ops: SeedOp[];
  /** Always empty — deletes are never planned. Documented for tests. */
  deleteOps: never[];
  summary: {
    productsInserted: number;
    productsSkipped: number;
    productsUpdated: number;
    colorsInserted: number;
    colorsSkipped: number;
    colorsUpdated: number;
    stockInserted: number;
    stockSkipped: number;
    stockUpserted: number;
    orphanColorsRetained: number;
    orphanStockRetained: number;
  };
  notes: string[];
};

export function stockKey(productId: string, size: string): string {
  return `${productId}::${size}`;
}

export function colorRowId(productId: string, colorKey: string): string {
  return `${productId}:${colorKey}`;
}

/**
 * Parse force flags with exact argv token match only.
 * Rejects unknown `--force*` tokens (e.g. `--force`, `--force-catalogs`).
 */
export function parseSeedFlags(argv: string[]): SeedFlags {
  const forceLike = argv.filter(
    (arg) => arg === "--force" || arg.startsWith("--force-") || arg.startsWith("--force="),
  );
  const unknown = forceLike.filter((arg) => !ALLOWED_FORCE_FLAGS.has(arg));
  if (unknown.length > 0) {
    throw new Error(
      `Unknown or malformed force flag(s): ${unknown.join(", ")}. ` +
        `Only exact tokens ${FORCE_CATALOG_FLAG} and ${FORCE_STOCK_FLAG} are allowed.`,
    );
  }
  return {
    forceCatalog: argv.some((arg) => arg === FORCE_CATALOG_FLAG),
    forceStock: argv.some((arg) => arg === FORCE_STOCK_FLAG),
  };
}

export function buildProductValues(
  seed: SeedProductInput,
  updatedAt: Date,
): ProductValues {
  return {
    id: seed.id,
    slug: seed.slug,
    name: seed.name,
    description: seed.description,
    category: seed.category,
    priceUsd: seed.priceUsd.toFixed(2),
    images: seed.images ?? [],
    views: seed.views ?? null,
    tags: seed.tags ?? [],
    sizes: seed.sizes ?? [],
    featured: Boolean(seed.featured),
    newArrival: Boolean(seed.newArrival),
    popular: Boolean(seed.popular),
    published: Boolean(seed.published),
    createdAt: new Date(seed.createdAt),
    updatedAt,
  };
}

export function quantityFromSeed(
  seed: SeedProductInput,
  size: string,
): number {
  const raw = seed.stockBySize?.[size];
  if (typeof raw === "number" && !Number.isNaN(raw)) {
    return Math.max(0, Math.floor(raw));
  }
  return 0;
}

/**
 * Plan seed mutations from a snapshot + seed products.
 * Does not perform I/O. Never plans deletes.
 */
export function planCatalogSeed(
  seeds: readonly SeedProductInput[],
  existing: ExistingCatalogSnapshot,
  flags: SeedFlags,
  now: Date = new Date(),
): SeedPlan {
  const ops: SeedOp[] = [];
  const summary = {
    productsInserted: 0,
    productsSkipped: 0,
    productsUpdated: 0,
    colorsInserted: 0,
    colorsSkipped: 0,
    colorsUpdated: 0,
    stockInserted: 0,
    stockSkipped: 0,
    stockUpserted: 0,
    orphanColorsRetained: 0,
    orphanStockRetained: 0,
  };

  const seedProductIds = new Set(seeds.map((s) => s.id));
  const seedColorIds = new Set<string>();
  const seedStockKeys = new Set<string>();

  for (const seed of seeds) {
    const values = buildProductValues(seed, now);

    if (!existing.productIds.has(seed.id)) {
      ops.push({ type: "insert_product", values });
      summary.productsInserted += 1;
    } else if (flags.forceCatalog) {
      ops.push({
        type: "update_product",
        productId: seed.id,
        values: {
          slug: values.slug,
          name: values.name,
          description: values.description,
          category: values.category,
          priceUsd: values.priceUsd,
          images: values.images,
          views: values.views,
          tags: values.tags,
          sizes: values.sizes,
          featured: values.featured,
          newArrival: values.newArrival,
          popular: values.popular,
          published: values.published,
          updatedAt: values.updatedAt,
        },
      });
      summary.productsUpdated += 1;
    } else {
      ops.push({ type: "skip_product", productId: seed.id });
      summary.productsSkipped += 1;
    }

    let sortOrder = 0;
    for (const color of seed.colors) {
      const id = colorRowId(seed.id, color.id);
      seedColorIds.add(id);
      const colorValues: ColorValues = {
        id,
        productId: seed.id,
        colorKey: color.id,
        name: color.name,
        hex: color.hex,
        images: color.images ?? null,
        sortOrder,
      };

      if (!existing.colorIds.has(id)) {
        ops.push({ type: "insert_color", values: colorValues });
        summary.colorsInserted += 1;
      } else if (flags.forceCatalog) {
        ops.push({
          type: "update_color",
          colorId: id,
          values: {
            colorKey: colorValues.colorKey,
            name: colorValues.name,
            hex: colorValues.hex,
            images: colorValues.images,
            sortOrder: colorValues.sortOrder,
          },
        });
        summary.colorsUpdated += 1;
      } else {
        ops.push({ type: "skip_color", colorId: id });
        summary.colorsSkipped += 1;
      }
      sortOrder += 1;
    }

    for (const size of seed.sizes) {
      const key = stockKey(seed.id, size);
      seedStockKeys.add(key);
      const quantity = quantityFromSeed(seed, size);
      const stockValues: StockValues = {
        productId: seed.id,
        size,
        quantity,
      };

      if (flags.forceStock) {
        ops.push({ type: "upsert_stock", values: stockValues });
        summary.stockUpserted += 1;
        continue;
      }

      if (existing.stockKeys.has(key)) {
        ops.push({ type: "skip_stock", productId: seed.id, size });
        summary.stockSkipped += 1;
      } else {
        ops.push({ type: "insert_stock", values: stockValues });
        summary.stockInserted += 1;
      }
    }
  }

  for (const colorId of existing.colorIds) {
    const productId = colorId.split(":")[0] ?? "";
    if (seedProductIds.has(productId) && !seedColorIds.has(colorId)) {
      summary.orphanColorsRetained += 1;
    }
  }
  for (const key of existing.stockKeys) {
    const productId = key.split("::")[0] ?? "";
    if (seedProductIds.has(productId) && !seedStockKeys.has(key)) {
      summary.orphanStockRetained += 1;
    }
  }

  return {
    flags,
    ops,
    deleteOps: [],
    summary,
    notes: [
      "No delete operations are planned; obsolete colors/stock require a separate approved cleanup.",
      SEED_WRITE_ATOMICITY.limitation,
    ],
  };
}

/** In-memory catalog for offline apply / integrity tests. */
export type InMemoryCatalog = {
  products: Map<string, ProductValues>;
  colors: Map<string, ColorValues>;
  stock: Map<string, StockValues>;
};

export function createInMemoryCatalog(
  products: ProductValues[] = [],
  colors: ColorValues[] = [],
  stock: StockValues[] = [],
): InMemoryCatalog {
  return {
    products: new Map(products.map((p) => [p.id, structuredClone(p)])),
    colors: new Map(colors.map((c) => [c.id, structuredClone(c)])),
    stock: new Map(
      stock.map((s) => [stockKey(s.productId, s.size), structuredClone(s)]),
    ),
  };
}

export function snapshotFromMemory(
  catalog: InMemoryCatalog,
): ExistingCatalogSnapshot {
  return {
    productIds: new Set(catalog.products.keys()),
    colorIds: new Set(catalog.colors.keys()),
    stockKeys: new Set(catalog.stock.keys()),
  };
}

/**
 * Apply a plan to an in-memory catalog.
 * Simulates non-atomic failure when `failAtOpIndex` is set (ops before that index
 * remain applied). Used to document neon-http behavior without a fake TX wrapper
 * when not using batch. Batch atomicity is represented separately in tests.
 */
export function applySeedPlanInMemory(
  catalog: InMemoryCatalog,
  plan: SeedPlan,
  options: { failAtOpIndex?: number } = {},
): void {
  for (let i = 0; i < plan.ops.length; i++) {
    if (options.failAtOpIndex === i) {
      throw new Error(`Simulated seed failure at op index ${i}`);
    }
    const op = plan.ops[i]!;
    switch (op.type) {
      case "insert_product":
        if (catalog.products.has(op.values.id)) {
          throw new Error(`Product already exists: ${op.values.id}`);
        }
        catalog.products.set(op.values.id, structuredClone(op.values));
        break;
      case "skip_product":
        break;
      case "update_product": {
        const prev = catalog.products.get(op.productId);
        if (!prev) throw new Error(`Missing product for update: ${op.productId}`);
        catalog.products.set(op.productId, {
          ...prev,
          ...structuredClone(op.values),
          id: prev.id,
          createdAt: prev.createdAt,
        });
        break;
      }
      case "insert_color":
        if (catalog.colors.has(op.values.id)) {
          throw new Error(`Color already exists: ${op.values.id}`);
        }
        catalog.colors.set(op.values.id, structuredClone(op.values));
        break;
      case "skip_color":
        break;
      case "update_color": {
        const prev = catalog.colors.get(op.colorId);
        if (!prev) throw new Error(`Missing color for update: ${op.colorId}`);
        catalog.colors.set(op.colorId, {
          ...prev,
          ...structuredClone(op.values),
          id: prev.id,
          productId: prev.productId,
        });
        break;
      }
      case "insert_stock": {
        const key = stockKey(op.values.productId, op.values.size);
        if (catalog.stock.has(key)) {
          throw new Error(`Stock already exists: ${key}`);
        }
        catalog.stock.set(key, structuredClone(op.values));
        break;
      }
      case "skip_stock":
        break;
      case "upsert_stock": {
        const key = stockKey(op.values.productId, op.values.size);
        catalog.stock.set(key, structuredClone(op.values));
        break;
      }
      default: {
        const _exhaustive: never = op;
        throw new Error(`Unexpected op: ${JSON.stringify(_exhaustive)}`);
      }
    }
  }
}

/**
 * Represent batch write atomicity offline: either all mutating ops apply, or none.
 * Skip ops are no-ops either way.
 */
export function applySeedPlanAtomicallyInMemory(
  catalog: InMemoryCatalog,
  plan: SeedPlan,
  options: { failBeforeCommit?: boolean } = {},
): void {
  const draft = createInMemoryCatalog(
    [...catalog.products.values()],
    [...catalog.colors.values()],
    [...catalog.stock.values()],
  );
  applySeedPlanInMemory(draft, plan);
  if (options.failBeforeCommit) {
    throw new Error("Simulated batch transaction abort before commit");
  }
  catalog.products = draft.products;
  catalog.colors = draft.colors;
  catalog.stock = draft.stock;
}

export function mutatingOps(plan: SeedPlan): SeedOp[] {
  return plan.ops.filter(
    (op) =>
      op.type === "insert_product" ||
      op.type === "update_product" ||
      op.type === "insert_color" ||
      op.type === "update_color" ||
      op.type === "insert_stock" ||
      op.type === "upsert_stock",
  );
}
