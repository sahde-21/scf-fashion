"use client";

import { useMemo, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";
import { useCart } from "@/context/CartContext";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

export function AddToCartPanel({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [size, setSize] = useState(product.sizes[0] ?? "");
  const [colorId, setColorId] = useState(product.colors[0]?.id ?? "");
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");

  const color = useMemo(
    () => product.colors.find((c) => c.id === colorId),
    [product.colors, colorId],
  );

  const onAdd = () => {
    setError("");
    if (!product.inStock) {
      setError("This piece is currently sold out.");
      return;
    }
    if (!size || !color) {
      setError("Please choose a size and color.");
      return;
    }
    addItem({ product, size, colorId, quantity });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2200);
  };

  return (
    <div className="space-y-7 lg:sticky lg:top-24">
      <div className="space-y-3 border-b border-neutral-200 pb-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-400">
          {product.category}
        </p>
        <h1 className="font-display text-3xl tracking-[0.02em] text-neutral-900 sm:text-4xl">
          {product.name}
        </h1>
        <Price usd={product.priceUsd} />
        <p className="text-sm text-neutral-500">
          {product.inStock ? "In stock" : "Currently unavailable"}
        </p>
      </div>

      <p className="text-sm leading-relaxed text-neutral-600">
        {product.description}
      </p>

      <fieldset>
        <legend className="text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">
          Size
        </legend>
        <div className="mt-3 flex flex-wrap gap-2">
          {product.sizes.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={size === value}
              onClick={() => setSize(value)}
              className={cn(
                "min-w-11 border px-3 py-2 text-xs tracking-wide transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sky)]",
                size === value
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-200 text-neutral-700 hover:border-neutral-400",
              )}
            >
              {value}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">
          Color{color ? ` — ${color.name}` : ""}
        </legend>
        <div className="mt-3 flex flex-wrap gap-3">
          {product.colors.map((c) => (
            <button
              key={c.id}
              type="button"
              title={c.name}
              aria-label={c.name}
              aria-pressed={colorId === c.id}
              onClick={() => setColorId(c.id)}
              className={cn(
                "h-8 w-8 rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sky)]",
                colorId === c.id
                  ? "border-neutral-900 scale-110"
                  : "border-neutral-200 hover:border-neutral-400",
              )}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </fieldset>

      <label className="block max-w-[7rem] space-y-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">
          Quantity
        </span>
        <input
          type="number"
          min={1}
          max={20}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
          className="editorial-input"
        />
      </label>

      {error ? (
        <p className="text-sm text-rose-700" role="alert">
          {error}
        </p>
      ) : null}
      {added ? (
        <p className="text-sm text-[var(--sky)]" role="status">
          Added to cart.
        </p>
      ) : null}

      <div className="flex flex-col gap-3">
        <Button
          type="button"
          size="lg"
          onClick={onAdd}
          disabled={!product.inStock}
          className="w-full"
        >
          {product.inStock ? "Add to cart" : "Sold out"}
        </Button>
        <ButtonLink href="/cart" variant="secondary" size="lg" className="w-full">
          View cart
        </ButtonLink>
      </div>

      <p className="text-xs leading-relaxed text-neutral-400">
        Availability is demo stock for local browsing. Orders are confirmed with
        the store on WhatsApp.
      </p>
    </div>
  );
}
