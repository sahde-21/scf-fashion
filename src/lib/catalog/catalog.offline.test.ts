/**
 * Phase B1 / B1.1 offline tests — no database connection.
 * Run: npm run test:catalog-b1
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { isInvalidDatabaseUrl } from "@/db/database-url";
import { isServerCatalogEnabled } from "@/lib/catalog/catalog-flag";
import {
  filterPublishedProducts,
  findProductBySlug,
  mapProductFromRows,
  mapProductsFromRows,
  parseCategoryId,
  parsePriceUsd,
  parseStringArrayField,
  requireNonEmptyId,
  type CatalogColorRow,
  type CatalogProductRow,
  type CatalogStockRow,
} from "@/lib/catalog/db-mappers";
import {
  assertServerCatalogConfigured,
  assertServerCatalogReady,
  resolveServerCatalogAccess,
} from "@/lib/catalog/server-catalog-access";

const BASE_PRODUCT: CatalogProductRow = {
  id: "p-linen-blazer",
  slug: "skyline-linen-blazer",
  name: "Skyline Linen Blazer",
  description: "A breathable linen blend blazer.",
  category: "women",
  priceUsd: "128.00",
  images: [],
  views: null,
  tags: ["blazer", "linen"],
  sizes: ["S", "M"],
  featured: true,
  newArrival: false,
  popular: true,
  published: true,
  createdAt: new Date("2026-09-01T10:00:00.000Z"),
};

const COLORS: CatalogColorRow[] = [
  {
    id: "p-linen-blazer:ivory",
    productId: "p-linen-blazer",
    colorKey: "ivory",
    name: "Ivory",
    hex: "#F5F0E8",
    images: null,
    sortOrder: 0,
  },
  {
    id: "p-linen-blazer:sky",
    productId: "p-linen-blazer",
    colorKey: "sky",
    name: "Sky",
    hex: "#7DD3FC",
    images: [],
    sortOrder: 1,
  },
];

const STOCK: CatalogStockRow[] = [
  { productId: "p-linen-blazer", size: "S", quantity: 8 },
  { productId: "p-linen-blazer", size: "M", quantity: 10 },
];

describe("feature flag separation", () => {
  it("defaults USE_SERVER_CATALOG to disabled", () => {
    assert.equal(isServerCatalogEnabled({}), false);
    assert.equal(isServerCatalogEnabled({ USE_SERVER_CATALOG: undefined }), false);
    assert.equal(isServerCatalogEnabled({ USE_SERVER_CATALOG: "" }), false);
    assert.equal(isServerCatalogEnabled({ USE_SERVER_CATALOG: "false" }), false);
    assert.equal(isServerCatalogEnabled({ USE_SERVER_CATALOG: "0" }), false);
  });

  it("enables only for explicit truthy values", () => {
    assert.equal(isServerCatalogEnabled({ USE_SERVER_CATALOG: "true" }), true);
    assert.equal(isServerCatalogEnabled({ USE_SERVER_CATALOG: "1" }), true);
  });

  it("catalog-flag.ts has no @/db imports (browser-safe)", () => {
    const here = path.dirname(fileURLToPath(import.meta.url));
    const src = readFileSync(path.join(here, "catalog-flag.ts"), "utf8");
    const importLines = src
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("import "));
    assert.equal(importLines.length, 0);
    assert.equal(src.includes("process.env.DATABASE_URL"), false);
  });

  it("flags.ts barrel does not re-export database-url resolution", () => {
    const here = path.dirname(fileURLToPath(import.meta.url));
    const src = readFileSync(path.join(here, "flags.ts"), "utf8");
    assert.equal(src.includes("database-url"), false);
    assert.equal(src.includes("resolveServerCatalogAccess"), false);
    assert.ok(src.includes("catalog-flag"));
  });

  it("resolves seed path when flag is off", () => {
    const access = resolveServerCatalogAccess(
      { USE_SERVER_CATALOG: "false" },
      { isInvalidDatabaseUrl },
    );
    assert.equal(access.status, "seed");
  });

  it("reports misconfigured when flag is on but DATABASE_URL missing", () => {
    const access = resolveServerCatalogAccess(
      { USE_SERVER_CATALOG: "true" },
      { isInvalidDatabaseUrl },
    );
    assert.equal(access.status, "misconfigured");
    if (access.status === "misconfigured") {
      assert.ok(!access.message.includes("postgresql://"));
    }
  });

  it("reports misconfigured for Phase A placeholder URL", () => {
    const access = resolveServerCatalogAccess(
      {
        USE_SERVER_CATALOG: "true",
        DATABASE_URL:
          "postgresql://phase_a_placeholder:x@127.0.0.1:5432/phase_a_placeholder",
      },
      { isInvalidDatabaseUrl },
    );
    assert.equal(access.status, "misconfigured");
  });

  it("assertServerCatalogReady throws when flag is off", () => {
    assert.throws(
      () => assertServerCatalogReady({ USE_SERVER_CATALOG: "false" }),
      /Server catalog is disabled/,
    );
  });

  it("assertServerCatalogConfigured throws only when misconfigured", () => {
    assert.doesNotThrow(() =>
      assertServerCatalogConfigured({ USE_SERVER_CATALOG: "false" }),
    );
    assert.throws(
      () => assertServerCatalogConfigured({ USE_SERVER_CATALOG: "true" }),
      /USE_SERVER_CATALOG is enabled/,
    );
  });
});

describe("db mappers — happy path", () => {
  it("maps rows to Product and preserves empty images", () => {
    const product = mapProductFromRows(BASE_PRODUCT, COLORS, STOCK);
    assert.equal(product.id, "p-linen-blazer");
    assert.equal(product.slug, "skyline-linen-blazer");
    assert.deepEqual(product.images, []);
    assert.equal(product.priceUsd, 128);
    assert.equal(product.colors[0]?.id, "ivory");
    assert.deepEqual(product.stockBySize, { S: 8, M: 10 });
    assert.equal(product.inStock, true);
  });

  it("derives inStock false when all size quantities are zero", () => {
    const product = mapProductFromRows(BASE_PRODUCT, COLORS, [
      { productId: "p-linen-blazer", size: "S", quantity: 0 },
      { productId: "p-linen-blazer", size: "M", quantity: 0 },
    ]);
    assert.equal(product.inStock, false);
  });

  it("filters published products for storefront", () => {
    const unpublished: CatalogProductRow = {
      ...BASE_PRODUCT,
      id: "p-hidden",
      slug: "hidden-piece",
      published: false,
      createdAt: new Date("2026-09-02T10:00:00.000Z"),
    };
    const { products: all } = mapProductsFromRows(
      [BASE_PRODUCT, unpublished],
      COLORS,
      STOCK,
    );
    const published = filterPublishedProducts(all);
    assert.equal(published.length, 1);
    assert.equal(
      findProductBySlug(all, "hidden-piece", { includeUnpublished: true })?.id,
      "p-hidden",
    );
  });

  it("preserves known seed ids/slugs used by the storefront", () => {
    const seedIds = [
      ["p-linen-blazer", "skyline-linen-blazer"],
      ["p-silk-midi", "coastal-silk-midi"],
      ["p-cotton-tee", "everyday-cotton-tee"],
      ["p-oxford-shirt", "harbor-oxford-shirt"],
      ["p-wool-overcoat", "midnight-wool-overcoat"],
      ["p-relaxed-chino", "soft-relaxed-chino"],
      ["p-city-sneaker", "cloud-city-sneaker"],
      ["p-leather-heel", "atelier-leather-heel"],
      ["p-loafers", "gallery-leather-loafer"],
      ["p-structured-tote", "atelier-structured-tote"],
      ["p-crossbody", "horizon-crossbody"],
      ["p-mini-clutch", "evening-mini-clutch"],
      ["p-gold-hoops", "quiet-gold-hoops"],
      ["p-silk-scarf", "breeze-silk-scarf"],
      ["p-leather-belt", "studio-leather-belt"],
      ["p-cap", "soft-cotton-cap"],
    ] as const;

    assert.equal(seedIds.length, 16);

    for (const [id, slug] of seedIds) {
      const product = mapProductFromRows(
        {
          ...BASE_PRODUCT,
          id,
          slug,
          images: [],
          createdAt: "2026-09-01T10:00:00.000Z",
        },
        [],
        [{ productId: id, size: "One size", quantity: 1 }],
      );
      assert.equal(product.id, id);
      assert.equal(product.slug, slug);
      assert.deepEqual(product.images, []);
    }
  });
});

describe("db mappers — validation", () => {
  it("rejects empty and whitespace ids/slugs", () => {
    assert.throws(() => requireNonEmptyId("", "id"), /empty/);
    assert.throws(() => requireNonEmptyId("   ", "slug"), /whitespace/);
    assert.throws(
      () =>
        mapProductFromRows(
          { ...BASE_PRODUCT, id: "  " },
          COLORS,
          STOCK,
        ),
      /id/,
    );
    assert.throws(
      () =>
        mapProductFromRows(
          { ...BASE_PRODUCT, slug: "" },
          COLORS,
          STOCK,
        ),
      /slug/,
    );
  });

  it("rejects negative, empty, and non-numeric prices", () => {
    assert.throws(() => parsePriceUsd(-1), /negative/);
    assert.throws(() => parsePriceUsd(""), /empty/);
    assert.throws(() => parsePriceUsd("   "), /empty/);
    assert.throws(() => parsePriceUsd("abc"), /decimal/);
    assert.throws(() => parsePriceUsd(Number.NaN), /finite/);
    assert.throws(
      () =>
        mapProductFromRows(
          { ...BASE_PRODUCT, priceUsd: "-5.00" },
          COLORS,
          STOCK,
        ),
      /negative/,
    );
  });

  it("rejects malformed images, sizes, and colors", () => {
    assert.throws(
      () => parseStringArrayField({ not: "array" }, "images"),
      /JSON array/,
    );
    assert.throws(
      () => parseStringArrayField([1, 2] as unknown as string[], "sizes"),
      /expected string/,
    );
    assert.throws(
      () =>
        mapProductFromRows(
          { ...BASE_PRODUCT, images: { url: "/x.jpg" } },
          COLORS,
          STOCK,
        ),
      /images/,
    );
    assert.throws(
      () =>
        mapProductFromRows(
          { ...BASE_PRODUCT, sizes: "S,M" },
          COLORS,
          STOCK,
        ),
      /sizes/,
    );
    assert.throws(
      () =>
        mapProductFromRows(BASE_PRODUCT, [
          {
            ...COLORS[0]!,
            colorKey: "  ",
          },
        ], STOCK),
      /color_key/,
    );
    assert.throws(() => parseCategoryId("not-a-category"), /category/);
  });

  it("isolates one invalid product so valid products still map", () => {
    const bad: CatalogProductRow = {
      ...BASE_PRODUCT,
      id: "p-bad",
      slug: "bad-product",
      priceUsd: "-99",
    };
    const { products, skipped } = mapProductsFromRows(
      [BASE_PRODUCT, bad],
      COLORS,
      STOCK,
    );
    assert.equal(products.length, 1);
    assert.equal(products[0]?.id, "p-linen-blazer");
    assert.equal(skipped.length, 1);
    assert.equal(skipped[0]?.productId, "p-bad");
    assert.match(skipped[0]?.reason ?? "", /negative/);
    assert.ok(!(skipped[0]?.reason ?? "").includes("postgresql://"));
  });

  it("accepts zero price as valid non-negative", () => {
    const product = mapProductFromRows(
      { ...BASE_PRODUCT, priceUsd: "0.00" },
      COLORS,
      STOCK,
    );
    assert.equal(product.priceUsd, 0);
  });
});

describe("server-only module boundaries (static)", () => {
  it("server-catalog.ts documents no client import and uses server-only", () => {
    const here = path.dirname(fileURLToPath(import.meta.url));
    const src = readFileSync(path.join(here, "server-catalog.ts"), "utf8");
    assert.ok(src.includes('import "server-only"'));
    assert.ok(src.includes("assertServerOnly"));
    assert.ok(src.includes("Do not import from Client Components"));
    assert.ok(src.includes("getDb"));
    assert.ok(src.includes("server-catalog-access"));
  });

  it("server-catalog-access imports server-only + database-url; catalog-flag does not", () => {
    const here = path.dirname(fileURLToPath(import.meta.url));
    const access = readFileSync(
      path.join(here, "server-catalog-access.ts"),
      "utf8",
    );
    const flag = readFileSync(path.join(here, "catalog-flag.ts"), "utf8");
    const accessImports = access
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("import "));
    const flagImports = flag
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.startsWith("import "));
    assert.ok(accessImports.some((line) => line.includes('"server-only"')));
    assert.ok(
      accessImports.some((line) => line.includes("@/db/database-url")),
    );
    assert.equal(flagImports.length, 0);
    assert.equal(
      flagImports.some((line) => line.includes("server-only")),
      false,
    );
  });
});
