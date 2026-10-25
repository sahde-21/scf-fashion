/**
 * Offline Phase A.2 seed integrity tests — no database connection.
 * Run: npm run test:seed-plan
 */
import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applySeedPlanAtomicallyInMemory,
  applySeedPlanInMemory,
  buildProductValues,
  colorRowId,
  createInMemoryCatalog,
  mutatingOps,
  parseSeedFlags,
  planCatalogSeed,
  SEED_WRITE_ATOMICITY,
  snapshotFromMemory,
  stockKey,
  type SeedProductInput,
} from "./seed-plan";

const NOW = new Date("2026-10-24T00:00:00.000Z");

function sampleSeed(overrides: Partial<SeedProductInput> = {}): SeedProductInput {
  return {
    id: "p-linen-blazer",
    slug: "skyline-linen-blazer",
    name: "Skyline Linen Blazer",
    description: "A breathable linen blend blazer.",
    category: "women",
    priceUsd: 128,
    images: [],
    tags: ["blazer"],
    sizes: ["S", "M"],
    stockBySize: { S: 8, M: 10 },
    colors: [
      { id: "ivory", name: "Ivory", hex: "#F5F0E8" },
      { id: "sky", name: "Sky", hex: "#7DD3FC" },
    ],
    featured: true,
    published: true,
    createdAt: "2026-09-01T10:00:00.000Z",
    ...overrides,
  };
}

describe("parseSeedFlags", () => {
  it("defaults to no force flags", () => {
    assert.deepEqual(parseSeedFlags(["node", "seed.ts"]), {
      forceCatalog: false,
      forceStock: false,
    });
  });

  it("accepts only exact --force-catalog and --force-stock", () => {
    assert.deepEqual(
      parseSeedFlags(["node", "seed.ts", "--force-catalog", "--force-stock"]),
      { forceCatalog: true, forceStock: true },
    );
  });

  it("rejects malformed or similarly named force flags", () => {
    for (const bad of [
      "--force",
      "--force=",
      "--force-catalogs",
      "--force-catalogue",
      "--force-catalog=true",
      "--force-stock=1",
      "--force-all",
    ]) {
      assert.throws(
        () => parseSeedFlags(["node", "seed.ts", bad]),
        /Unknown or malformed force flag/,
      );
    }
  });
});

describe("planCatalogSeed — default insert-only", () => {
  it("leaves existing catalog metadata and stock unchanged on rerun", () => {
    const seed = sampleSeed({
      name: "CHANGED NAME SHOULD NOT APPLY",
      priceUsd: 999,
      stockBySize: { S: 1, M: 1 },
      colors: [
        { id: "ivory", name: "CHANGED", hex: "#000000" },
        { id: "sky", name: "CHANGED", hex: "#111111" },
      ],
    });

    const existingProduct = buildProductValues(
      sampleSeed({ name: "Original Name", priceUsd: 128 }),
      NOW,
    );
    const existingColors = seed.colors.map((c, i) => ({
      id: colorRowId(seed.id, c.id),
      productId: seed.id,
      colorKey: c.id,
      name: c.id === "ivory" ? "Ivory" : "Sky",
      hex: c.id === "ivory" ? "#F5F0E8" : "#7DD3FC",
      images: null,
      sortOrder: i,
    }));
    const existingStock = [
      { productId: seed.id, size: "S", quantity: 8 },
      { productId: seed.id, size: "M", quantity: 10 },
    ];

    const catalog = createInMemoryCatalog(
      [existingProduct],
      existingColors,
      existingStock,
    );
    const before = structuredClone({
      product: catalog.products.get(seed.id),
      colors: [...catalog.colors.values()],
      stock: [...catalog.stock.values()],
    });

    const plan = planCatalogSeed(
      [seed],
      snapshotFromMemory(catalog),
      { forceCatalog: false, forceStock: false },
      NOW,
    );

    assert.equal(plan.deleteOps.length, 0);
    assert.equal(plan.summary.productsSkipped, 1);
    assert.equal(plan.summary.colorsSkipped, 2);
    assert.equal(plan.summary.stockSkipped, 2);
    assert.equal(mutatingOps(plan).length, 0);

    applySeedPlanAtomicallyInMemory(catalog, plan);

    assert.deepEqual(catalog.products.get(seed.id), before.product);
    assert.deepEqual([...catalog.colors.values()], before.colors);
    assert.deepEqual([...catalog.stock.values()], before.stock);
  });

  it("does not delete existing colors or size-stock rows missing from seed", () => {
    const seed = sampleSeed({
      colors: [{ id: "ivory", name: "Ivory", hex: "#F5F0E8" }],
      sizes: ["S"],
      stockBySize: { S: 8 },
    });

    const product = buildProductValues(sampleSeed(), NOW);
    const colors = [
      {
        id: colorRowId(seed.id, "ivory"),
        productId: seed.id,
        colorKey: "ivory",
        name: "Ivory",
        hex: "#F5F0E8",
        images: null as string[] | null,
        sortOrder: 0,
      },
      {
        id: colorRowId(seed.id, "legacy"),
        productId: seed.id,
        colorKey: "legacy",
        name: "Legacy",
        hex: "#AAAAAA",
        images: null as string[] | null,
        sortOrder: 1,
      },
    ];
    const stock = [
      { productId: seed.id, size: "S", quantity: 8 },
      { productId: seed.id, size: "XL", quantity: 2 },
    ];

    const catalog = createInMemoryCatalog([product], colors, stock);
    const plan = planCatalogSeed(
      [seed],
      snapshotFromMemory(catalog),
      { forceCatalog: false, forceStock: false },
      NOW,
    );

    assert.equal(plan.deleteOps.length, 0);
    assert.ok(!plan.ops.some((op) => String(op.type).includes("delete")));
    assert.equal(plan.summary.orphanColorsRetained, 1);
    assert.equal(plan.summary.orphanStockRetained, 1);

    applySeedPlanAtomicallyInMemory(catalog, plan);

    assert.ok(catalog.colors.has(colorRowId(seed.id, "legacy")));
    assert.ok(catalog.stock.has(stockKey(seed.id, "XL")));
    assert.equal(catalog.stock.get(stockKey(seed.id, "XL"))?.quantity, 2);
  });

  it("inserts missing products, colors, and stock rows", () => {
    const seed = sampleSeed({ images: [] });
    const catalog = createInMemoryCatalog();
    const plan = planCatalogSeed(
      [seed],
      snapshotFromMemory(catalog),
      { forceCatalog: false, forceStock: false },
      NOW,
    );

    assert.equal(plan.summary.productsInserted, 1);
    assert.equal(plan.summary.colorsInserted, 2);
    assert.equal(plan.summary.stockInserted, 2);
    assert.equal(mutatingOps(plan).length, 5);

    applySeedPlanAtomicallyInMemory(catalog, plan);

    assert.equal(catalog.products.get(seed.id)?.name, seed.name);
    assert.deepEqual(catalog.products.get(seed.id)?.images, []);
    assert.ok(catalog.colors.has(colorRowId(seed.id, "ivory")));
    assert.equal(catalog.stock.get(stockKey(seed.id, "S"))?.quantity, 8);
  });
});

describe("force flags scope", () => {
  it("--force-catalog updates metadata only, not stock quantities", () => {
    const seed = sampleSeed({
      name: "New Name",
      priceUsd: 200,
      stockBySize: { S: 1, M: 1 },
      colors: [
        { id: "ivory", name: "Ivory2", hex: "#FFFFFF" },
        { id: "sky", name: "Sky2", hex: "#0000FF" },
      ],
    });
    const product = buildProductValues(sampleSeed({ name: "Old" }), NOW);
    const colors = seed.colors.map((c, i) => ({
      id: colorRowId(seed.id, c.id),
      productId: seed.id,
      colorKey: c.id,
      name: "OldColor",
      hex: "#111111",
      images: null as string[] | null,
      sortOrder: i,
    }));
    const stock = [
      { productId: seed.id, size: "S", quantity: 8 },
      { productId: seed.id, size: "M", quantity: 10 },
    ];
    const catalog = createInMemoryCatalog([product], colors, stock);

    const plan = planCatalogSeed(
      [seed],
      snapshotFromMemory(catalog),
      { forceCatalog: true, forceStock: false },
      NOW,
    );

    assert.equal(plan.summary.productsUpdated, 1);
    assert.equal(plan.summary.colorsUpdated, 2);
    assert.equal(plan.summary.stockSkipped, 2);
    assert.ok(!plan.ops.some((op) => op.type === "upsert_stock"));

    applySeedPlanAtomicallyInMemory(catalog, plan);

    assert.equal(catalog.products.get(seed.id)?.name, "New Name");
    assert.equal(catalog.products.get(seed.id)?.priceUsd, "200.00");
    assert.equal(catalog.colors.get(colorRowId(seed.id, "ivory"))?.name, "Ivory2");
    assert.equal(catalog.stock.get(stockKey(seed.id, "S"))?.quantity, 8);
    assert.equal(catalog.stock.get(stockKey(seed.id, "M"))?.quantity, 10);
  });

  it("--force-stock updates quantities only, not product/color metadata", () => {
    const seed = sampleSeed({
      name: "Should Stay Old",
      stockBySize: { S: 3, M: 4 },
      colors: [
        { id: "ivory", name: "ShouldStay", hex: "#ABCDEF" },
        { id: "sky", name: "ShouldStay", hex: "#FEDCBA" },
      ],
    });
    const product = buildProductValues(sampleSeed({ name: "Original" }), NOW);
    const colors = [
      {
        id: colorRowId(seed.id, "ivory"),
        productId: seed.id,
        colorKey: "ivory",
        name: "Ivory",
        hex: "#F5F0E8",
        images: null as string[] | null,
        sortOrder: 0,
      },
      {
        id: colorRowId(seed.id, "sky"),
        productId: seed.id,
        colorKey: "sky",
        name: "Sky",
        hex: "#7DD3FC",
        images: null as string[] | null,
        sortOrder: 1,
      },
    ];
    const stock = [
      { productId: seed.id, size: "S", quantity: 8 },
      { productId: seed.id, size: "M", quantity: 10 },
    ];
    const catalog = createInMemoryCatalog([product], colors, stock);

    const plan = planCatalogSeed(
      [seed],
      snapshotFromMemory(catalog),
      { forceCatalog: false, forceStock: true },
      NOW,
    );

    assert.equal(plan.summary.productsSkipped, 1);
    assert.equal(plan.summary.colorsSkipped, 2);
    assert.equal(plan.summary.stockUpserted, 2);

    applySeedPlanAtomicallyInMemory(catalog, plan);

    assert.equal(catalog.products.get(seed.id)?.name, "Original");
    assert.equal(catalog.colors.get(colorRowId(seed.id, "ivory"))?.name, "Ivory");
    assert.equal(catalog.stock.get(stockKey(seed.id, "S"))?.quantity, 3);
    assert.equal(catalog.stock.get(stockKey(seed.id, "M"))?.quantity, 4);
  });
});

describe("failure handling and transaction representation", () => {
  it("documents that interactive transactions are unavailable on neon-http", () => {
    assert.equal(SEED_WRITE_ATOMICITY.interactiveTransactions, false);
    assert.equal(SEED_WRITE_ATOMICITY.batchWriteTransaction, true);
    assert.match(SEED_WRITE_ATOMICITY.limitation, /neon-http/i);
  });

  it("non-atomic apply can leave partial writes (driver limitation without batch)", () => {
    const seed = sampleSeed();
    const catalog = createInMemoryCatalog();
    const plan = planCatalogSeed(
      [seed],
      snapshotFromMemory(catalog),
      { forceCatalog: false, forceStock: false },
      NOW,
    );
    assert.ok(mutatingOps(plan).length >= 2);

    assert.throws(
      () => applySeedPlanInMemory(catalog, plan, { failAtOpIndex: 1 }),
      /Simulated seed failure/,
    );
    // First mutating op (insert_product at index 0) applied; later ops not.
    assert.ok(catalog.products.has(seed.id));
    assert.equal(catalog.colors.size, 0);
  });

  it("atomic batch apply rolls back all mutating ops on abort", () => {
    const seed = sampleSeed();
    const catalog = createInMemoryCatalog();
    const plan = planCatalogSeed(
      [seed],
      snapshotFromMemory(catalog),
      { forceCatalog: false, forceStock: false },
      NOW,
    );

    assert.throws(
      () =>
        applySeedPlanAtomicallyInMemory(catalog, plan, {
          failBeforeCommit: true,
        }),
      /batch transaction abort/,
    );
    assert.equal(catalog.products.size, 0);
    assert.equal(catalog.colors.size, 0);
    assert.equal(catalog.stock.size, 0);
  });

  it("atomic batch apply commits all mutating ops together", () => {
    const seed = sampleSeed();
    const catalog = createInMemoryCatalog();
    const plan = planCatalogSeed(
      [seed],
      snapshotFromMemory(catalog),
      { forceCatalog: false, forceStock: false },
      NOW,
    );

    applySeedPlanAtomicallyInMemory(catalog, plan);
    assert.equal(catalog.products.size, 1);
    assert.equal(catalog.colors.size, 2);
    assert.equal(catalog.stock.size, 2);
  });
});
