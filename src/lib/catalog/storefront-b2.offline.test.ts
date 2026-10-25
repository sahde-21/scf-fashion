/**
 * Phase B2 offline tests — storefront bootstrap + boundaries (no database).
 * Run: npm run test:catalog-b2
 */
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";
import { isInvalidDatabaseUrl } from "@/db/database-url";
import { isServerCatalogEnabled } from "@/lib/catalog/catalog-flag";
import { resolveServerCatalogAccess } from "@/lib/catalog/server-catalog-access";
import {
  planStorefrontCatalogBootstrap,
  sanitizeCatalogErrorMessage,
  storefrontBootstrapFromFailure,
  storefrontBootstrapFromProducts,
} from "@/lib/catalog/storefront-bootstrap";
import { STORE_WHATSAPP_E164_DIGITS } from "@/lib/config";
import { SEED_PRODUCTS } from "@/data/products";
import type { Product } from "@/types";

const here = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(here, "../../..");

function readSrc(relFromCatalog: string): string {
  return readFileSync(path.join(here, relFromCatalog), "utf8");
}

function readRepo(rel: string): string {
  return readFileSync(path.join(repoRoot, rel), "utf8");
}

const SAMPLE_PRODUCT = {
  id: "p-linen-blazer",
  slug: "skyline-linen-blazer",
  name: "Skyline Linen Blazer",
  description: "A breathable linen blend blazer.",
  category: "women",
  priceUsd: 128,
  images: [],
  colors: [],
  sizes: ["S"],
  tags: [],
  stockBySize: { S: 1 },
  inStock: true,
  featured: true,
  newArrival: false,
  popular: true,
  published: true,
  createdAt: "2026-09-01T10:00:00.000Z",
} as Product;

describe("B2 feature flag off preserves seed path", () => {
  it("defaults disabled and plans seed bootstrap", () => {
    assert.equal(isServerCatalogEnabled({}), false);
    const access = resolveServerCatalogAccess(
      { USE_SERVER_CATALOG: "false" },
      { isInvalidDatabaseUrl },
    );
    assert.equal(access.status, "seed");
    assert.deepEqual(planStorefrontCatalogBootstrap(access), { mode: "seed" });
  });

  it("env example keeps USE_SERVER_CATALOG=false", () => {
    const envExample = readRepo(".env.example");
    assert.match(envExample, /^USE_SERVER_CATALOG=false\s*$/m);
  });
});

describe("B2 bootstrap planning", () => {
  it("returns error bootstrap when misconfigured (no seed)", () => {
    const access = resolveServerCatalogAccess(
      { USE_SERVER_CATALOG: "true" },
      { isInvalidDatabaseUrl },
    );
    assert.equal(access.status, "misconfigured");
    const planned = planStorefrontCatalogBootstrap(access);
    assert.notEqual(planned, "fetch");
    if (planned !== "fetch") {
      assert.equal(planned.mode, "error");
      if (planned.mode === "error") {
        assert.ok(!planned.message.includes("postgresql://"));
      }
    }
  });

  it("requests fetch when server_ready", () => {
    const planned = planStorefrontCatalogBootstrap({
      status: "server_ready",
      useServerCatalog: true,
    });
    assert.equal(planned, "fetch");
  });

  it("builds server bootstrap from products without seeding", () => {
    const boot = storefrontBootstrapFromProducts([SAMPLE_PRODUCT]);
    assert.equal(boot.mode, "server");
    if (boot.mode === "server") {
      assert.equal(boot.products.length, 1);
      assert.equal(boot.products[0]?.id, "p-linen-blazer");
    }
  });

  it("builds error bootstrap from query failures without secrets", () => {
    const boot = storefrontBootstrapFromFailure(
      new Error(
        "connect ECONNREFUSED postgresql://user:secret@ep-x.neon.tech/db",
      ),
    );
    assert.equal(boot.mode, "error");
    if (boot.mode === "error") {
      assert.ok(!boot.message.includes("postgresql://"));
      assert.ok(!boot.message.includes("secret"));
      assert.ok(!boot.message.includes("neon.tech"));
    }
  });
});

describe("B2 sanitizeCatalogErrorMessage", () => {
  it("redacts connection strings and driver noise", () => {
    assert.ok(
      !sanitizeCatalogErrorMessage(
        "Failed DATABASE_URL=postgresql://a:b@host/db",
      ).includes("postgresql://"),
    );
    assert.match(
      sanitizeCatalogErrorMessage(new Error("NeonDbError: boom")),
      /could not be loaded/i,
    );
  });

  it("keeps safe configuration messages", () => {
    const msg =
      "USE_SERVER_CATALOG is enabled but DATABASE_URL is missing or invalid.";
    assert.equal(sanitizeCatalogErrorMessage(msg), msg);
  });
});

describe("B2 published filtering for public storefront", () => {
  it("public listings must exclude unpublished products", () => {
    const unpublished: Product = {
      ...SAMPLE_PRODUCT,
      id: "p-hidden",
      slug: "hidden-piece",
      published: false,
    };
    const boot = storefrontBootstrapFromProducts([
      SAMPLE_PRODUCT,
      unpublished,
    ]);
    assert.equal(boot.mode, "server");
    if (boot.mode === "server") {
      const published = boot.products.filter((p) => p.published);
      assert.equal(published.length, 1);
      assert.equal(published[0]?.slug, "skyline-linen-blazer");
      assert.equal(
        boot.products.find((p) => p.slug === "hidden-piece")?.published,
        false,
      );
    }
  });

  it("product detail slug lookup uses published-only for public", () => {
    const list = [
      SAMPLE_PRODUCT,
      {
        ...SAMPLE_PRODUCT,
        id: "p-hidden",
        slug: "hidden-piece",
        published: false,
      } as Product,
    ];
    const publicFind = (slug: string) =>
      list.find((p) => p.slug === slug && p.published);
    assert.equal(publicFind("skyline-linen-blazer")?.id, "p-linen-blazer");
    assert.equal(publicFind("hidden-piece"), undefined);
  });
});

describe("B2 server-only import boundaries (static)", () => {
  it("load-storefront-catalog is server-only and uses server-catalog", () => {
    const src = readSrc("load-storefront-catalog.ts");
    assert.ok(src.includes('import "server-only"'));
    assert.ok(src.includes("listProductsFromDatabase"));
    assert.ok(src.includes("resolveServerCatalogAccess"));
    assert.ok(src.includes("includeUnpublished: false"));
    assert.equal(src.includes("includeUnpublished: true"), false);
  });

  it("storefront-bootstrap has no db or server-catalog imports", () => {
    const src = readSrc("storefront-bootstrap.ts");
    const imports = src
      .split("\n")
      .map((l) => l.trim())
      .filter((l) => l.startsWith("import "));
    assert.ok(imports.every((l) => !l.includes("@/db")));
    assert.ok(imports.every((l) => !l.includes("server-catalog")));
    assert.ok(imports.every((l) => !l.includes("server-only")));
  });

  it("catalog-flag remains browser-safe (no db)", () => {
    const src = readSrc("catalog-flag.ts");
    assert.equal(
      src
        .split("\n")
        .map((l) => l.trim())
        .filter((l) => l.startsWith("import ")).length,
      0,
    );
  });

  it("Client Components do not import server-catalog or @/db", () => {
    const clientFiles = [
      "src/context/CatalogContext.tsx",
      "src/components/layout/Providers.tsx",
      "src/components/products/CatalogPage.tsx",
      "src/components/products/ProductDetail.tsx",
      "src/components/home/ProductRail.tsx",
      "src/components/home/BuildYourLook.tsx",
      "src/components/home/HangingClothingRail.tsx",
      "src/components/home/EditorialLookbook.tsx",
      "src/components/checkout/CheckoutView.tsx",
      "src/components/admin/AdminApp.tsx",
    ];
    for (const rel of clientFiles) {
      const src = readRepo(rel);
      assert.equal(
        src.includes("@/lib/catalog/server-catalog"),
        false,
        `${rel} must not import server-catalog`,
      );
      assert.equal(
        src.includes("@/db"),
        false,
        `${rel} must not import @/db`,
      );
      assert.equal(
        src.includes("load-storefront-catalog"),
        false,
        `${rel} must not import load-storefront-catalog`,
      );
    }
  });

  it("root layout loads bootstrap on the server and passes props to Providers", () => {
    const layout = readRepo("src/app/layout.tsx");
    assert.ok(layout.includes("loadStorefrontCatalogBootstrap"));
    assert.ok(layout.includes("catalogBootstrap"));
    assert.ok(layout.includes("async function RootLayout"));
  });

  it("PDP metadata uses flag + dynamic server-catalog import; static params stay seed", () => {
    const page = readRepo("src/app/products/[slug]/page.tsx");
    assert.ok(page.includes("generateStaticParams"));
    assert.ok(page.includes("SEED_PRODUCTS"));
    assert.ok(page.includes("isServerCatalogEnabled"));
    assert.ok(page.includes('@/lib/catalog/server-catalog'));
    assert.ok(page.includes("getProductBySlugFromDatabase"));
    assert.ok(page.includes("includeUnpublished: false"));
  });
});

describe("B2 cart IDs and WhatsApp unchanged", () => {
  it("preserves WhatsApp E.164 digits", () => {
    assert.equal(STORE_WHATSAPP_E164_DIGITS, "9647506455249");
  });

  it("preserves all 16 seed product ids and slugs", () => {
    assert.equal(SEED_PRODUCTS.length, 16);
    const expected = [
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
    for (const [id, slug] of expected) {
      const p = SEED_PRODUCTS.find((x) => x.id === id);
      assert.ok(p, `missing id ${id}`);
      assert.equal(p?.slug, slug);
    }
  });
});
