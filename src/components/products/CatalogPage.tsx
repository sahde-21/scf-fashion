"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ProductFiltersPanel } from "@/components/products/ProductFilters";
import { ProductGrid } from "@/components/products/ProductGrid";
import { LoadingBlock } from "@/components/ui/LoadingBlock";
import { useCatalog } from "@/context/CatalogContext";
import {
  collectFilterOptions,
  filterProducts,
} from "@/lib/products";
import { cn } from "@/lib/utils";
import type { CategoryId, ProductFilters, SortOption } from "@/types";

function parseCategory(value: string | null): CategoryId | "all" {
  const allowed: Array<CategoryId | "all"> = [
    "all",
    "men",
    "women",
    "shoes",
    "bags",
    "accessories",
  ];
  if (value && allowed.includes(value as CategoryId | "all")) {
    return value as CategoryId | "all";
  }
  return "all";
}

function parseSort(value: string | null): SortOption {
  const allowed: SortOption[] = [
    "featured",
    "newest",
    "price-asc",
    "price-desc",
    "name-asc",
  ];
  if (value && allowed.includes(value as SortOption)) {
    return value as SortOption;
  }
  return "featured";
}

export function CatalogPage() {
  const searchParams = useSearchParams();
  const { publishedProducts, hydrated } = useCatalog();
  const [filtersOpen, setFiltersOpen] = useState(false);

  const [filters, setFilters] = useState<ProductFilters>({
    category: parseCategory(searchParams.get("category")),
    sizes: [],
    colors: [],
    query: searchParams.get("q") ?? "",
    sort: parseSort(searchParams.get("sort")),
    inStockOnly: false,
  });

  const categoryParam = searchParams.get("category");
  const sortParam = searchParams.get("sort");
  const qParam = searchParams.get("q");

  useEffect(() => {
    setFilters((prev) => ({
      ...prev,
      category: parseCategory(categoryParam),
      sort: parseSort(sortParam),
      query: qParam ?? "",
    }));
  }, [categoryParam, sortParam, qParam]);

  const options = useMemo(
    () => collectFilterOptions(publishedProducts),
    [publishedProducts],
  );

  const results = useMemo(
    () => filterProducts(publishedProducts, filters),
    [publishedProducts, filters],
  );

  if (!hydrated) return <LoadingBlock label="Loading catalog…" />;

  const reset = () =>
    setFilters({
      category: "all",
      sizes: [],
      colors: [],
      query: "",
      sort: "featured",
      inStockOnly: false,
    });

  return (
    <div className="grid gap-10 pb-8 lg:grid-cols-[220px_1fr] lg:gap-12 xl:grid-cols-[240px_1fr] xl:gap-16">
      <div className="lg:hidden">
        <button
          type="button"
          onClick={() => setFiltersOpen((v) => !v)}
          className="flex min-h-12 w-full items-center justify-between border border-[var(--line)] bg-[var(--surface)] px-4 py-3.5 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--ink)]"
          aria-expanded={filtersOpen}
        >
          {filtersOpen ? "Hide filters" : "Show filters"}
          <span className="text-[var(--muted)]">{results.length} items</span>
        </button>
        <div className={cn("mt-5", filtersOpen ? "block" : "hidden")}>
          <ProductFiltersPanel
            filters={filters}
            options={options}
            onChange={setFilters}
            onReset={reset}
          />
        </div>
      </div>

      <div className="hidden lg:block">
        <div className="sticky top-[calc(var(--header-h)+1rem)] max-h-[calc(100vh-var(--header-h)-var(--ticker-h)-2rem)] overflow-y-auto pr-1">
          <ProductFiltersPanel
            filters={filters}
            options={options}
            onChange={setFilters}
            onReset={reset}
          />
        </div>
      </div>

      <div className="min-w-0">
        <p className="mb-8 hidden text-[11px] uppercase tracking-[0.16em] text-[var(--muted)] lg:block">
          Showing {results.length} of {publishedProducts.length}
        </p>
        <ProductGrid products={results} />
      </div>
    </div>
  );
}
