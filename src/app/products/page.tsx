import { Suspense } from "react";
import type { Metadata } from "next";
import Image from "next/image";
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
      <div className="mb-10 grid items-end gap-8 border-b border-[var(--line)] pb-8 sm:mb-14 lg:grid-cols-[1fr_0.55fr] lg:gap-12">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-[var(--muted)]">
            Collection
          </p>
          <h1 className="mt-2 font-display text-4xl tracking-[0.02em] text-[var(--ink)] sm:text-5xl">
            Shop
          </h1>
          <p className="mt-3 max-w-lg text-sm leading-relaxed text-[var(--muted)]">
            A curated lookbook with dual USD and IQD pricing. Filter by category,
            size, color, and stock.
          </p>
        </div>
        <div className="relative hidden aspect-[16/10] overflow-hidden bg-[var(--surface)] lg:block">
          <Image
            src="/editorial/cat-women.jpg"
            alt=""
            fill
            className="object-cover object-[center_25%]"
            sizes="320px"
            priority={false}
          />
        </div>
      </div>
      <Suspense fallback={<LoadingBlock label="Loading catalog…" />}>
        <CatalogPage />
      </Suspense>
    </div>
  );
}
