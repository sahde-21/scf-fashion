CREATE TABLE "order_items" (
	"id" text PRIMARY KEY NOT NULL,
	"order_id" text NOT NULL,
	"product_id" text NOT NULL,
	"product_name" text NOT NULL,
	"size" text NOT NULL,
	"color_id" text NOT NULL,
	"color_name" text NOT NULL,
	"quantity" integer NOT NULL,
	"unit_price_usd" numeric(10, 2) NOT NULL,
	CONSTRAINT "order_items_quantity_positive" CHECK ("order_items"."quantity" > 0)
);
--> statement-breakpoint
CREATE TABLE "orders" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"customer_name" text NOT NULL,
	"customer_phone" text NOT NULL,
	"city" text,
	"address" text,
	"delivery_instructions" text,
	"location_method" text DEFAULT 'none' NOT NULL,
	"notes" text,
	"total_usd" numeric(10, 2) NOT NULL,
	"status" text DEFAULT 'pending_whatsapp' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_colors" (
	"id" text PRIMARY KEY NOT NULL,
	"product_id" text NOT NULL,
	"color_key" text NOT NULL,
	"name" text NOT NULL,
	"hex" text NOT NULL,
	"images" jsonb,
	"sort_order" integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE "product_size_stock" (
	"product_id" text NOT NULL,
	"size" text NOT NULL,
	"quantity" integer NOT NULL,
	CONSTRAINT "product_size_stock_product_id_size_pk" PRIMARY KEY("product_id","size"),
	CONSTRAINT "product_size_stock_quantity_nonneg" CHECK ("product_size_stock"."quantity" >= 0)
);
--> statement-breakpoint
CREATE TABLE "products" (
	"id" text PRIMARY KEY NOT NULL,
	"slug" text NOT NULL,
	"name" text NOT NULL,
	"description" text NOT NULL,
	"category" text NOT NULL,
	"price_usd" numeric(10, 2) NOT NULL,
	"images" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"views" jsonb,
	"tags" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"sizes" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"featured" boolean DEFAULT false NOT NULL,
	"new_arrival" boolean DEFAULT false NOT NULL,
	"popular" boolean DEFAULT false NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "order_items" ADD CONSTRAINT "order_items_order_id_orders_id_fk" FOREIGN KEY ("order_id") REFERENCES "public"."orders"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_colors" ADD CONSTRAINT "product_colors_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "product_size_stock" ADD CONSTRAINT "product_size_stock_product_id_products_id_fk" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "product_colors_product_key_uidx" ON "product_colors" USING btree ("product_id","color_key");--> statement-breakpoint
CREATE UNIQUE INDEX "products_slug_uidx" ON "products" USING btree ("slug");