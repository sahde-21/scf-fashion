"use client";

import { notFound } from "next/navigation";
import { AddToCartPanel } from "@/components/products/AddToCartPanel";
import { ProductGallery } from "@/components/products/ProductGallery";
import { ProductGrid } from "@/components/products/ProductGrid";
import { LoadingBlock } from "@/components/ui/LoadingBlock";
import { useCatalog } from "@/context/CatalogContext";
import { relatedProducts } from "@/lib/products";

export function ProductDetail({ slug }: { slug: string }) {
  const { publishedProducts, hydrated } = useCatalog();

  if (!hydrated) return <LoadingBlock label="Loading product…" />;

  const product = publishedProducts.find((p) => p.slug === slug);
  if (!product) {
    notFound();
  }

  const related = relatedProducts(product, publishedProducts);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="grid gap-10 lg:grid-cols-2">
        <ProductGallery images={product.images} name={product.name} />
        <AddToCartPanel product={product} />
      </div>
      {related.length ? (
        <section className="mt-16">
          <h2 className="font-display text-3xl text-slate-900">
            You may also like
          </h2>
          <div className="mt-8">
            <ProductGrid products={related} />
          </div>
        </section>
      ) : null}
    </div>
  );
}
