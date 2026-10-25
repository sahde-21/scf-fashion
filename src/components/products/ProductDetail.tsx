"use client";

import { notFound } from "next/navigation";
import { useEffect, useState } from "react";
import { AddToCartPanel } from "@/components/products/AddToCartPanel";
import { ProductGallery } from "@/components/products/ProductGallery";
import { ProductGrid } from "@/components/products/ProductGrid";
import { LoadingBlock } from "@/components/ui/LoadingBlock";
import { useCatalog } from "@/context/CatalogContext";
import { relatedProducts } from "@/lib/products";

export function ProductDetail({ slug }: { slug: string }) {
  const { publishedProducts, hydrated } = useCatalog();
  const product = hydrated
    ? publishedProducts.find((p) => p.slug === slug)
    : undefined;
  const [colorId, setColorId] = useState("");

  useEffect(() => {
    if (product) {
      setColorId(product.colors[0]?.id ?? "");
    }
  }, [product]);

  if (!hydrated) return <LoadingBlock label="Loading product…" />;

  if (!product) {
    notFound();
  }

  const related = relatedProducts(product, publishedProducts);

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-16">
      <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:gap-20">
        <ProductGallery product={product} colorId={colorId} />
        <AddToCartPanel
          product={product}
          colorId={colorId}
          onColorChange={setColorId}
        />
      </div>
      {related.length ? (
        <section className="mt-20 border-t border-[var(--line)] pt-14 sm:mt-28">
          <div className="mb-10">
            <div className="mb-4 h-px w-10 bg-[var(--gold)] opacity-70" />
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.22em] text-[var(--muted)]">
              Continue browsing
            </p>
            <h2 className="mt-2 font-display text-3xl font-medium tracking-[0.02em] text-[var(--ink)]">
              You may also like
            </h2>
          </div>
          <ProductGrid products={related} />
        </section>
      ) : null}
    </div>
  );
}
