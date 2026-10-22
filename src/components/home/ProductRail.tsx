"use client";

import { ProductGrid } from "@/components/products/ProductGrid";
import { ButtonLink } from "@/components/ui/Button";
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
    <section className="mx-auto max-w-6xl px-4 py-14 sm:px-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-xl">
          <h2 className="font-display text-3xl text-slate-900 sm:text-4xl">
            {title}
          </h2>
          <p className="mt-3 text-slate-600">{description}</p>
        </div>
        <ButtonLink href={href} variant="secondary">
          View all
        </ButtonLink>
      </div>
      <div className="mt-8">
        <ProductGrid products={products} />
      </div>
    </section>
  );
}
