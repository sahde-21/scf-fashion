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
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 max-w-2xl">
        <h1 className="font-display text-4xl text-slate-900 sm:text-5xl">
          Shop
        </h1>
        <p className="mt-3 text-slate-600">
          Search, sort, and filter the full catalog. Every price is labelled in
          both USD and IQD using a fixed demo rate.
        </p>
      </div>
      <Suspense fallback={<LoadingBlock label="Loading catalog…" />}>
        <CatalogPage />
      </Suspense>
    </div>
  );
}
