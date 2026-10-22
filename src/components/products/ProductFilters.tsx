"use client";

import { CATEGORIES } from "@/lib/config";
import { cn } from "@/lib/utils";
import type { ProductFilters as Filters, SortOption } from "@/types";

type Options = {
  sizes: string[];
  colors: { id: string; name: string; hex: string }[];
  minPrice: number;
  maxPrice: number;
};

export function ProductFiltersPanel({
  filters,
  options,
  onChange,
  onReset,
}: {
  filters: Filters;
  options: Options;
  onChange: (next: Filters) => void;
  onReset: () => void;
}) {
  const toggleSize = (size: string) => {
    const sizes = filters.sizes.includes(size)
      ? filters.sizes.filter((s) => s !== size)
      : [...filters.sizes, size];
    onChange({ ...filters, sizes });
  };

  const toggleColor = (colorId: string) => {
    const colors = filters.colors.includes(colorId)
      ? filters.colors.filter((c) => c !== colorId)
      : [...filters.colors, colorId];
    onChange({ ...filters, colors });
  };

  return (
    <aside className="space-y-6 rounded-2xl border border-sky-100 bg-white/80 p-4 sm:p-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="font-display text-xl text-slate-900">Filters</h2>
        <button
          type="button"
          onClick={onReset}
          className="text-sm text-sky-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
        >
          Reset
        </button>
      </div>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-800">Search</span>
        <input
          type="search"
          value={filters.query}
          onChange={(e) => onChange({ ...filters, query: e.target.value })}
          placeholder="Search styles…"
          className="w-full rounded-md border border-sky-100 bg-white px-3 py-2 text-sm outline-none ring-sky-300 transition focus:ring-2"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-sm font-medium text-slate-800">Sort</span>
        <select
          value={filters.sort}
          onChange={(e) =>
            onChange({ ...filters, sort: e.target.value as SortOption })
          }
          className="w-full rounded-md border border-sky-100 bg-white px-3 py-2 text-sm outline-none ring-sky-300 transition focus:ring-2"
        >
          <option value="featured">Featured</option>
          <option value="newest">Newest</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="name-asc">Name</option>
        </select>
      </label>

      <fieldset>
        <legend className="text-sm font-medium text-slate-800">Category</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          <FilterChip
            active={!filters.category || filters.category === "all"}
            onClick={() => onChange({ ...filters, category: "all" })}
          >
            All
          </FilterChip>
          {CATEGORIES.map((c) => (
            <FilterChip
              key={c.id}
              active={filters.category === c.id}
              onClick={() => onChange({ ...filters, category: c.id })}
            >
              {c.name}
            </FilterChip>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium text-slate-800">Size</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {options.sizes.map((size) => (
            <FilterChip
              key={size}
              active={filters.sizes.includes(size)}
              onClick={() => toggleSize(size)}
            >
              {size}
            </FilterChip>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium text-slate-800">Color</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {options.colors.map((color) => (
            <button
              key={color.id}
              type="button"
              title={color.name}
              aria-pressed={filters.colors.includes(color.id)}
              onClick={() => toggleColor(color.id)}
              className={cn(
                "inline-flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400",
                filters.colors.includes(color.id)
                  ? "border-sky-400 bg-sky-50 text-sky-800"
                  : "border-sky-100 bg-white text-slate-700 hover:border-sky-300",
              )}
            >
              <span
                className="h-3.5 w-3.5 rounded-full border border-slate-200"
                style={{ backgroundColor: color.hex }}
                aria-hidden
              />
              {color.name}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-2 gap-3">
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-800">Min USD</span>
          <input
            type="number"
            min={0}
            value={filters.minPrice ?? ""}
            onChange={(e) =>
              onChange({
                ...filters,
                minPrice: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="w-full rounded-md border border-sky-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-300"
          />
        </label>
        <label className="block space-y-2">
          <span className="text-sm font-medium text-slate-800">Max USD</span>
          <input
            type="number"
            min={0}
            value={filters.maxPrice ?? ""}
            onChange={(e) =>
              onChange({
                ...filters,
                maxPrice: e.target.value ? Number(e.target.value) : undefined,
              })
            }
            className="w-full rounded-md border border-sky-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-300"
          />
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input
          type="checkbox"
          checked={filters.inStockOnly}
          onChange={(e) =>
            onChange({ ...filters, inStockOnly: e.target.checked })
          }
          className="h-4 w-4 rounded border-sky-300 text-sky-600 focus:ring-sky-400"
        />
        In stock only
      </label>
    </aside>
  );
}

function FilterChip({
  children,
  active,
  onClick,
}: {
  children: React.ReactNode;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "rounded-md border px-2.5 py-1.5 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400",
        active
          ? "border-sky-400 bg-sky-50 text-sky-800"
          : "border-sky-100 bg-white text-slate-700 hover:border-sky-300",
      )}
    >
      {children}
    </button>
  );
}
