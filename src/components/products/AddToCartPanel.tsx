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
    <div className="space-y-6">
      <div>
        <p className="text-xs uppercase tracking-wider text-sky-700">
          {product.category}
        </p>
        <h1 className="mt-1 font-display text-4xl text-slate-900 sm:text-5xl">
          {product.name}
        </h1>
        <div className="mt-4">
          <Price usd={product.priceUsd} />
        </div>
      </div>

      <p className="text-base leading-relaxed text-slate-600">
        {product.description}
      </p>

      <fieldset>
        <legend className="text-sm font-medium text-slate-800">Size</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {product.sizes.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={size === value}
              onClick={() => setSize(value)}
              className={cn(
                "min-w-12 rounded-md border px-3 py-2 text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400",
                size === value
                  ? "border-sky-500 bg-sky-50 text-sky-800"
                  : "border-sky-100 hover:border-sky-300",
              )}
            >
              {value}
            </button>
          ))}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium text-slate-800">
          Color{color ? `: ${color.name}` : ""}
        </legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {product.colors.map((c) => (
            <button
              key={c.id}
              type="button"
              title={c.name}
              aria-label={c.name}
              aria-pressed={colorId === c.id}
              onClick={() => setColorId(c.id)}
              className={cn(
                "h-9 w-9 rounded-full border-2 transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400",
                colorId === c.id ? "border-sky-500 scale-105" : "border-white shadow ring-1 ring-slate-200",
              )}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
      </fieldset>

      <label className="block max-w-[8rem] space-y-2">
        <span className="text-sm font-medium text-slate-800">Quantity</span>
        <input
          type="number"
          min={1}
          max={20}
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, Number(e.target.value) || 1))}
          className="w-full rounded-md border border-sky-100 px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-sky-300"
        />
      </label>

      {error ? (
        <p className="text-sm text-rose-600" role="alert">
          {error}
        </p>
      ) : null}
      {added ? (
        <p className="text-sm text-sky-700" role="status">
          Added to cart.
        </p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          size="lg"
          onClick={onAdd}
          disabled={!product.inStock}
          className="sm:flex-1"
        >
          {product.inStock ? "Add to cart" : "Sold out"}
        </Button>
        <ButtonLink href="/cart" variant="secondary" size="lg" className="sm:flex-1">
          View cart
        </ButtonLink>
      </div>

      <p className="text-xs text-slate-500">
        Availability shown is demo stock for local browsing. Orders are confirmed
        with the store on WhatsApp.
      </p>
    </div>
  );
}
