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

  const initial: ProductFilters = {
    category: parseCategory(searchParams.get("category")),
    sizes: [],
    colors: [],
    query: searchParams.get("q") ?? "",
    sort: parseSort(searchParams.get("sort")),
    inStockOnly: false,
  };

  const [filters, setFilters] = useState<ProductFilters>(initial);

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

  return (
    <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
      <ProductFiltersPanel
        filters={filters}
        options={options}
        onChange={setFilters}
        onReset={() =>
          setFilters({
            category: "all",
            sizes: [],
            colors: [],
            query: "",
            sort: "featured",
            inStockOnly: false,
          })
        }
      />
      <div>
        <p className="mb-6 text-sm text-slate-500">
          Showing {results.length} of {publishedProducts.length} pieces
        </p>
        <ProductGrid products={results} />
      </div>
    </div>
  );
}
