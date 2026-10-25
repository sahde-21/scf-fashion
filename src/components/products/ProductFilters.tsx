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
    <aside className={cn("space-y-8", className)}>
      <div className="flex items-center justify-between gap-3 border-b border-[var(--line)] pb-3.5">
        <h2 className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--ink)]">
          Filters
        </h2>
        <button
          type="button"
          onClick={onReset}
          className="min-h-10 px-1 text-[11px] uppercase tracking-[0.14em] text-[var(--muted)] transition hover:text-[var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)]"
        >
          Reset
        </button>
      </div>

      <label className="block space-y-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
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

      <fieldset>
        <legend className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
          Category
        </legend>
        <div className="mt-3 space-y-2.5">
          <CategoryRow
            label="All"
            active={!filters.category || filters.category === "all"}
            onClick={() => onChange({ ...filters, category: "all" })}
          />
          {CATEGORIES.map((c) => (
            <CategoryRow
              key={c.id}
              label={c.name}
              active={filters.category === c.id}
              onClick={() => onChange({ ...filters, category: c.id })}
            />
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
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
        <legend className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
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
                "h-7 w-7 rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)]",
                filters.colors.includes(color.id)
                  ? "scale-110 border-[var(--ink)]"
                  : "border-[var(--line-strong)] hover:border-[var(--ink)]/50",
              )}
              style={{ backgroundColor: color.hex }}
            />
          ))}
        </div>
      </fieldset>

      <label className="block space-y-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
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

      <div className="grid grid-cols-2 gap-4">
        <label className="block space-y-2">
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
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
          <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-[var(--muted)]">
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

      <label className="flex min-h-11 items-center gap-2.5 text-sm text-[var(--muted)]">
        <input
          type="checkbox"
          checked={filters.inStockOnly}
          onChange={(e) =>
            onChange({ ...filters, inStockOnly: e.target.checked })
          }
          className="h-4 w-4 rounded-none border-[var(--line-strong)] text-[var(--ink)] focus:ring-[var(--ink)]"
        />
        In stock only
      </label>
    </aside>
  );
}

function CategoryRow({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-2.5 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)]",
        active ? "text-[var(--ink)]" : "text-[var(--muted)] hover:text-[var(--ink)]",
      )}
    >
      <span
        className={cn(
          "flex h-3.5 w-3.5 shrink-0 items-center justify-center border",
          active
            ? "border-[var(--ink)] bg-[var(--ink)]"
            : "border-[var(--line-strong)]",
        )}
        aria-hidden
      >
        {active ? (
          <span className="block h-1.5 w-1.5 bg-[var(--background)]" />
        ) : null}
      </span>
      {label}
    </button>
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
        "min-h-9 min-w-9 border px-2.5 py-1.5 text-[11px] uppercase tracking-[0.12em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)]",
        active
          ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--background)]"
          : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--ink)]/40",
      )}
    >
      {children}
    </button>
  );
}
