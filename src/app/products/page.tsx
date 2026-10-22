import { Suspense } from "react";
import type { Metadata } from "next";
import { CatalogPage } from "@/components/products/CatalogPage";
import { LoadingBlock } from "@/components/ui/LoadingBlock";

export const metadata: Metadata = {
  title: "Shop",
  description:
    "Browse SCF Fashion by category, size, color, and price. Prices shown in USD and IQD.",
};

export default function ProductsPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <div className="mb-8 border-b border-neutral-200 pb-6 sm:mb-10">
        <h1 className="font-display text-4xl tracking-[0.02em] text-neutral-900 sm:text-5xl">
          Shop
        </h1>
        <p className="mt-3 max-w-xl text-sm text-neutral-500">
          Photography-first browsing with dual USD and IQD pricing.
        </p>
      </div>
      <Suspense fallback={<LoadingBlock label="Loading catalog…" />}>
        <CatalogPage />
      </Suspense>
    </div>
  );
}
