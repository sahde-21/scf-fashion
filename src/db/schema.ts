/**
 * Drizzle schema for Neon Postgres (Phase A).
 * Storefront still reads SEED_PRODUCTS / localStorage until Phase B cutover.
 */
import {
  boolean,
  check,
  integer,
  jsonb,
  numeric,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

/** Catalog product — IDs/slugs match `SEED_PRODUCTS`. */
export const products = pgTable(
  "products",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    description: text("description").notNull(),
    category: text("category").notNull(),
    priceUsd: numeric("price_usd", { precision: 10, scale: 2 }).notNull(),
    images: jsonb("images").$type<string[]>().notNull().default([]),
    views: jsonb("views").$type<{ front?: string; back?: string } | null>(),
    tags: jsonb("tags").$type<string[]>().notNull().default([]),
    sizes: jsonb("sizes").$type<string[]>().notNull().default([]),
    featured: boolean("featured").notNull().default(false),
    newArrival: boolean("new_arrival").notNull().default(false),
    popular: boolean("popular").notNull().default(false),
    published: boolean("published").notNull().default(true),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [uniqueIndex("products_slug_uidx").on(table.slug)],
);

export const productColors = pgTable(
  "product_colors",
  {
    id: text("id").primaryKey(),
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    colorKey: text("color_key").notNull(),
    name: text("name").notNull(),
    hex: text("hex").notNull(),
    images: jsonb("images").$type<string[] | null>(),
    sortOrder: integer("sort_order").notNull().default(0),
  },
  (table) => [
    uniqueIndex("product_colors_product_key_uidx").on(
      table.productId,
      table.colorKey,
    ),
  ],
);

export const productSizeStock = pgTable(
  "product_size_stock",
  {
    productId: text("product_id")
      .notNull()
      .references(() => products.id, { onDelete: "cascade" }),
    size: text("size").notNull(),
    quantity: integer("quantity").notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.productId, table.size] }),
    check("product_size_stock_quantity_nonneg", sql`${table.quantity} >= 0`),
  ],
);

/**
 * Server-backed orders (Phase D will write these).
 * Map pin URLs are intentionally omitted — WhatsApp-only.
 */
export const orders = pgTable("orders", {
  id: text("id").primaryKey(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  customerName: text("customer_name").notNull(),
  customerPhone: text("customer_phone").notNull(),
  city: text("city"),
  address: text("address"),
  deliveryInstructions: text("delivery_instructions"),
  locationMethod: text("location_method").notNull().default("none"),
  notes: text("notes"),
  totalUsd: numeric("total_usd", { precision: 10, scale: 2 }).notNull(),
  /** pending_whatsapp | confirmed | cancelled | fulfilled */
  status: text("status").notNull().default("pending_whatsapp"),
});

export const orderItems = pgTable(
  "order_items",
  {
    id: text("id").primaryKey(),
    orderId: text("order_id")
      .notNull()
      .references(() => orders.id, { onDelete: "cascade" }),
    productId: text("product_id").notNull(),
    productName: text("product_name").notNull(),
    size: text("size").notNull(),
    colorId: text("color_id").notNull(),
    colorName: text("color_name").notNull(),
    quantity: integer("quantity").notNull(),
    unitPriceUsd: numeric("unit_price_usd", {
      precision: 10,
      scale: 2,
    }).notNull(),
  },
  (table) => [
    check("order_items_quantity_positive", sql`${table.quantity} > 0`),
  ],
);

export type ProductRow = typeof products.$inferSelect;
export type NewProductRow = typeof products.$inferInsert;
export type ProductColorRow = typeof productColors.$inferSelect;
export type ProductSizeStockRow = typeof productSizeStock.$inferSelect;
export type OrderRow = typeof orders.$inferSelect;
export type OrderItemRow = typeof orderItems.$inferSelect;
