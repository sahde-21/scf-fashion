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
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14">
        <ProductGallery product={product} colorId={colorId} />
        <AddToCartPanel
          product={product}
          colorId={colorId}
          onColorChange={setColorId}
        />
      </div>
      {related.length ? (
        <section className="mt-16 border-t border-neutral-200 pt-12 sm:mt-20">
          <div className="mb-8 flex items-end justify-between gap-4">
            <h2 className="font-display text-3xl tracking-[0.02em] text-neutral-900">
              You may also like
            </h2>
          </div>
          <ProductGrid products={related} />
        </section>
      ) : null}
    </div>
  );
}
