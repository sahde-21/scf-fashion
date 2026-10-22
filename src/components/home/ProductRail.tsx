"use client";

import Link from "next/link";
import { ProductGrid } from "@/components/products/ProductGrid";
import { LoadingBlock } from "@/components/ui/LoadingBlock";
import { useCatalog } from "@/context/CatalogContext";
import type { Product } from "@/types";

type RailKind = "new" | "popular";

function pickProducts(kind: RailKind, products: Product[]): Product[] {
  if (kind === "new") return products.filter((p) => p.newArrival);
  return products.filter((p) => p.popular || p.featured);
}

export function ProductRail({
  title,
  description,
  href,
  kind,
}: {
  title: string;
  description: string;
  href: string;
  kind: RailKind;
}) {
  const { publishedProducts, hydrated } = useCatalog();

  if (!hydrated) return <LoadingBlock label="Loading pieces…" />;

  const products = pickProducts(kind, publishedProducts).slice(0, 8);

  return (
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-16">
      <div className="flex flex-col gap-3 border-b border-neutral-200 pb-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <h2 className="font-display text-3xl tracking-[0.02em] text-neutral-900 sm:text-4xl">
            {title}
          </h2>
          <p className="mt-2 text-sm text-neutral-500">{description}</p>
        </div>
        <Link
          href={href}
          className="text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-500 transition hover:text-neutral-900"
        >
          View all
        </Link>
      </div>
      <div className="mt-8">
        <ProductGrid products={products} />
      </div>
    </section>
  );
}
