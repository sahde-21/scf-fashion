"use client";

import Link from "next/link";
import { ProductGrid } from "@/components/products/ProductGrid";
import { LoadingBlock } from "@/components/ui/LoadingBlock";
import { Reveal } from "@/components/ui/Reveal";
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
  if (!products.length) return null;

  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <Reveal>
        <div className="flex flex-col gap-3 border-b border-[var(--line)] pb-6 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <div className="mb-4 h-px w-10 bg-[var(--gold)] opacity-70" />
            <h2 className="font-display text-3xl font-medium tracking-[0.02em] text-[var(--ink)] sm:text-4xl">
              {title}
            </h2>
            <p className="mt-3 text-sm font-light leading-relaxed text-[var(--muted)]">
              {description}
            </p>
          </div>
          <Link
            href={href}
            className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-[var(--muted)] transition hover:text-[var(--ink)]"
          >
            View all
          </Link>
        </div>
      </Reveal>
      <Reveal delayMs={50}>
        <div className="mt-10">
          <ProductGrid products={products} />
        </div>
      </Reveal>
    </section>
  );
}
