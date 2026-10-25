/**
 * Repeatable catalog seed from `SEED_PRODUCTS` → Neon Postgres.
 *
 * Safety (default):
 * - Does NOT truncate or delete rows (no automatic orphan cleanup).
 * - Insert-only for products and colors: existing catalog metadata is left alone.
 * - Inserts missing stock rows only; never overwrites existing quantities.
 * - Does not touch orders / order_items.
 * - Does not invent images, sizes, colors, or stock (empty arrays stay empty).
 *
 * Opt-in destructive flags (exact argv tokens only):
 * - `--force-catalog` — overwrite product + color metadata from seed.
 * - `--force-stock` — reset stock quantities from seed.
 * Unknown `--force*` tokens are rejected.
 *
 * Atomicity:
 * - neon-http does NOT support interactive `db.transaction()` (throws).
 * - Planned mutating writes run in one `db.batch()` call (Neon HTTP transaction).
 * - Snapshot reads occur before the batch.
 *
 * Future cleanup of obsolete colors/stock: NOT implemented — needs owner approval.
 *
 * Requires a real DATABASE_URL. Aborts without connecting if missing/placeholder.
 *
 * Usage:
 *   npm run db:seed
 *   npm run db:seed -- --force-catalog
 *   npm run db:seed -- --force-stock
 */
import { config as loadEnv } from "dotenv";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { eq, inArray } from "drizzle-orm";
import { SEED_PRODUCTS } from "../src/data/products";
import { requireDatabaseUrl } from "../src/db/database-url";
import {
  mutatingOps,
  parseSeedFlags,
  planCatalogSeed,
  SEED_WRITE_ATOMICITY,
  stockKey,
  type ExistingCatalogSnapshot,
  type SeedOp,
  type SeedProductInput,
} from "../src/db/seed-plan";
import {
  productColors,
  productSizeStock,
  products,
} from "../src/db/schema";

loadEnv({ path: ".env.local" });
loadEnv();

function toSeedInputs(seeds: typeof SEED_PRODUCTS): SeedProductInput[] {
  return seeds.map((seed) => ({
    id: seed.id,
    slug: seed.slug,
    name: seed.name,
    description: seed.description,
    category: seed.category,
    priceUsd: seed.priceUsd,
    images: seed.images ?? [],
    views: seed.views ?? null,
    tags: seed.tags ?? [],
    sizes: seed.sizes ?? [],
    stockBySize: seed.stockBySize,
    colors: seed.colors.map((c) => ({
      id: c.id,
      name: c.name,
      hex: c.hex,
      images: c.images ?? null,
    })),
    featured: seed.featured,
    newArrival: seed.newArrival,
    popular: seed.popular,
    published: seed.published,
    createdAt: seed.createdAt,
  }));
}

async function loadSnapshot(
  db: ReturnType<typeof drizzle>,
  productIds: string[],
): Promise<ExistingCatalogSnapshot> {
  if (productIds.length === 0) {
    return {
      productIds: new Set(),
      colorIds: new Set(),
      stockKeys: new Set(),
    };
  }

  const existingProducts = await db
    .select({ id: products.id })
    .from(products)
    .where(inArray(products.id, productIds));

  const existingColors = await db
    .select({ id: productColors.id })
    .from(productColors)
    .where(inArray(productColors.productId, productIds));

  const existingStock = await db
    .select({
      productId: productSizeStock.productId,
      size: productSizeStock.size,
    })
    .from(productSizeStock)
    .where(inArray(productSizeStock.productId, productIds));

  return {
    productIds: new Set(existingProducts.map((row) => row.id)),
    colorIds: new Set(existingColors.map((row) => row.id)),
    stockKeys: new Set(
      existingStock.map((row) => stockKey(row.productId, row.size)),
    ),
  };
}

function opToBatchItem(db: ReturnType<typeof drizzle>, op: SeedOp) {
  switch (op.type) {
    case "insert_product":
      return db.insert(products).values(op.values);
    case "update_product":
      return db
        .update(products)
        .set(op.values)
        .where(eq(products.id, op.productId));
    case "insert_color":
      return db.insert(productColors).values(op.values);
    case "update_color":
      return db
        .update(productColors)
        .set(op.values)
        .where(eq(productColors.id, op.colorId));
    case "insert_stock":
      return db.insert(productSizeStock).values(op.values);
    case "upsert_stock":
      return db
        .insert(productSizeStock)
        .values(op.values)
        .onConflictDoUpdate({
          target: [productSizeStock.productId, productSizeStock.size],
          set: { quantity: op.values.quantity },
        });
    case "skip_product":
    case "skip_color":
    case "skip_stock":
      return null;
    default: {
      const _exhaustive: never = op;
      throw new Error(`Unexpected seed op: ${JSON.stringify(_exhaustive)}`);
    }
  }
}

async function main() {
  const flags = parseSeedFlags(process.argv);
  const url = requireDatabaseUrl(process.env.DATABASE_URL, "db:seed");
  const sql = neon(url);
  const db = drizzle(sql, {
    schema: { products, productColors, productSizeStock },
  });

  const seeds = toSeedInputs(SEED_PRODUCTS);
  const productIds = seeds.map((s) => s.id);

  console.log(
    `Seeding ${seeds.length} products (forceCatalog=${flags.forceCatalog}, forceStock=${flags.forceStock})…`,
  );
  console.log(
    `Write atomicity: batch=${SEED_WRITE_ATOMICITY.batchWriteTransaction}, interactiveTX=${SEED_WRITE_ATOMICITY.interactiveTransactions}`,
  );

  const snapshot = await loadSnapshot(db, productIds);
  const plan = planCatalogSeed(seeds, snapshot, flags);
  const writes = mutatingOps(plan);

  if (plan.deleteOps.length > 0) {
    throw new Error("Internal error: seed planner emitted delete ops.");
  }

  if (writes.length === 0) {
    console.log(
      JSON.stringify(
        {
          ...flags,
          ...plan.summary,
          mutatingWrites: 0,
          seedProductCount: seeds.length,
          atomicBatch: false,
          note: "Nothing to write; existing catalog/stock unchanged; orders untouched.",
        },
        null,
        2,
      ),
    );
    return;
  }

  const batchItems = writes
    .map((op) => opToBatchItem(db, op))
    .filter((item): item is NonNullable<typeof item> => item !== null);

  if (batchItems.length === 0) {
    throw new Error("Internal error: mutating ops produced no batch items.");
  }

  // Neon HTTP: one non-interactive transaction for all planned writes.
  await db.batch(batchItems as [typeof batchItems[0], ...typeof batchItems]);

  console.log(
    JSON.stringify(
      {
        ...flags,
        ...plan.summary,
        mutatingWrites: writes.length,
        seedProductCount: seeds.length,
        atomicBatch: true,
        deleteOps: plan.deleteOps.length,
        notes: plan.notes,
      },
      null,
      2,
    ),
  );
  console.log(
    "Seed complete. Orders tables were not modified. Orphan colors/stock were not deleted.",
  );
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
