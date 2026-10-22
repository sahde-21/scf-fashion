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
  className,
}: {
  filters: Filters;
  options: Options;
  onChange: (next: Filters) => void;
  onReset: () => void;
  className?: string;
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
    <aside className={cn("space-y-7", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-neutral-200 pb-3">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-900">
          Filters
        </h2>
        <button
          type="button"
          onClick={onReset}
          className="text-[11px] uppercase tracking-[0.14em] text-neutral-500 transition hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
        >
          Reset
        </button>
      </div>

      <label className="block space-y-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">
          Search
        </span>
        <input
          type="search"
          value={filters.query}
          onChange={(e) => onChange({ ...filters, query: e.target.value })}
          placeholder="Search styles"
          className="editorial-input"
        />
      </label>

      <label className="block space-y-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">
          Sort
        </span>
        <select
          value={filters.sort}
          onChange={(e) =>
            onChange({ ...filters, sort: e.target.value as SortOption })
          }
          className="editorial-input"
        >
          <option value="featured">Featured</option>
          <option value="newest">Newest</option>
          <option value="price-asc">Price: low to high</option>
          <option value="price-desc">Price: high to low</option>
          <option value="name-asc">Name</option>
        </select>
      </label>

      <fieldset>
        <legend className="text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">
          Category
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
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
        <legend className="text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">
          Size
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
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
        <legend className="text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">
          Color
        </legend>
        <div className="mt-3 flex flex-wrap gap-3">
          {options.colors.map((color) => (
            <button
              key={color.id}
              type="button"
              title={color.name}
              aria-label={color.name}
              aria-pressed={filters.colors.includes(color.id)}
              onClick={() => toggleColor(color.id)}
              className={cn(
                "h-7 w-7 rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900",
                filters.colors.includes(color.id)
                  ? "border-neutral-900 scale-110"
                  : "border-neutral-200 hover:border-neutral-400",
              )}
              style={{ backgroundColor: color.hex }}
            />
          ))}
        </div>
      </fieldset>

      <div className="grid grid-cols-2 gap-4">
        <label className="block space-y-2">
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">
            Min USD
          </span>
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
            className="editorial-input"
          />
        </label>
        <label className="block space-y-2">
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">
            Max USD
          </span>
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
            className="editorial-input"
          />
        </label>
      </div>

      <label className="flex items-center gap-2 text-sm text-neutral-600">
        <input
          type="checkbox"
          checked={filters.inStockOnly}
          onChange={(e) =>
            onChange({ ...filters, inStockOnly: e.target.checked })
          }
          className="h-4 w-4 rounded-none border-neutral-300 text-neutral-900 focus:ring-neutral-900"
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
        "border px-2.5 py-1.5 text-[11px] uppercase tracking-[0.12em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900",
        active
          ? "border-neutral-900 bg-neutral-900 text-white"
          : "border-neutral-200 text-neutral-600 hover:border-neutral-400",
      )}
    >
      {children}
    </button>
  );
}
