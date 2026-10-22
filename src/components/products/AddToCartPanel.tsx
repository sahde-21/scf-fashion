"use client";

import { useEffect, useMemo, useState } from "react";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Price } from "@/components/ui/Price";
import { useCart } from "@/context/CartContext";
import {
  getStockForSize,
  isProductAvailable,
  isSizeAvailable,
  maxOrderQuantity,
} from "@/lib/inventory";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

export function AddToCartPanel({
  product,
  colorId,
  onColorChange,
}: {
  product: Product;
  colorId: string;
  onColorChange: (colorId: string) => void;
}) {
  const { addItem } = useCart();
  const available = isProductAvailable(product);
  const firstAvailableSize =
    product.sizes.find((value) => isSizeAvailable(product, value)) ??
    product.sizes[0] ??
    "";

  const [size, setSize] = useState(firstAvailableSize);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const nextSize =
      product.sizes.find((value) => isSizeAvailable(product, value)) ??
      product.sizes[0] ??
      "";
    setSize(nextSize);
    setQuantity(1);
    setError("");
    setAdded(false);
  }, [product.id, product]);

  const color = useMemo(
    () => product.colors.find((c) => c.id === colorId),
    [product.colors, colorId],
  );

  const sizeStock = getStockForSize(product, size);
  const qtyCap = maxOrderQuantity(product, size);

  useEffect(() => {
    if (qtyCap > 0 && quantity > qtyCap) {
      setQuantity(qtyCap);
    }
  }, [qtyCap, quantity]);

  const onAdd = () => {
    setError("");
    if (!available) {
      setError("This piece is currently sold out.");
      return;
    }
    if (!size || !color) {
      setError("Please choose a size and color.");
      return;
    }
    if (!isSizeAvailable(product, size)) {
      setError(`Size ${size} is out of stock.`);
      return;
    }
    if (quantity > qtyCap) {
      setError(
        sizeStock === null
          ? "Quantity is not available."
          : `Only ${sizeStock} left in size ${size}.`,
      );
      return;
    }
    const result = addItem({ product, size, colorId, quantity });
    if (!result.ok) {
      setError(result.error || "Could not add to cart.");
      return;
    }
    setAdded(true);
    window.setTimeout(() => setAdded(false), 2200);
  };

  return (
    <div className="space-y-7 lg:sticky lg:top-28">
      <div className="space-y-3 border-b border-neutral-200 pb-6">
        <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-400">
          {product.category}
        </p>
        <h1 className="font-display text-3xl tracking-[0.02em] text-neutral-900 sm:text-4xl">
          {product.name}
        </h1>
        <Price usd={product.priceUsd} />
        <p className="text-sm text-neutral-500">
          {available ? "In stock" : "Currently unavailable"}
          {available && sizeStock !== null ? (
            <span className="text-neutral-400">
              {" "}
              · {sizeStock} left in {size}
            </span>
          ) : null}
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
          {product.sizes.map((value) => {
            const sizeOk = isSizeAvailable(product, value);
            const stock = getStockForSize(product, value);
            return (
              <button
                key={value}
                type="button"
                aria-pressed={size === value}
                disabled={!sizeOk}
                title={
                  stock === null
                    ? value
                    : sizeOk
                      ? `${value} — ${stock} available`
                      : `${value} — out of stock`
                }
                onClick={() => setSize(value)}
                className={cn(
                  "min-w-11 border px-3 py-2 text-xs tracking-wide transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900",
                  size === value
                    ? "border-neutral-900 bg-neutral-900 text-white"
                    : "border-neutral-200 text-neutral-700 hover:border-neutral-400",
                  !sizeOk &&
                    "cursor-not-allowed border-neutral-100 text-neutral-300 line-through hover:border-neutral-100",
                )}
              >
                {value}
              </button>
            );
          })}
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
              aria-label={`${c.name}${c.images?.length ? ", photo available" : ""}`}
              aria-pressed={colorId === c.id}
              onClick={() => onColorChange(c.id)}
              className={cn(
                "h-8 w-8 rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900",
                colorId === c.id
                  ? "scale-110 border-neutral-900"
                  : "border-neutral-200 hover:border-neutral-400",
              )}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
        {color && !color.images?.length ? (
          <p className="mt-2 text-xs text-neutral-400">
            Color selected for order. A dedicated photo for this colorway is not
            in the catalog yet.
          </p>
        ) : null}
      </fieldset>

      <label className="block max-w-[7rem] space-y-2">
        <span className="text-[11px] font-medium uppercase tracking-[0.14em] text-neutral-500">
          Quantity
        </span>
        <input
          type="number"
          min={1}
          max={Math.max(1, qtyCap)}
          value={quantity}
          disabled={!available || qtyCap < 1}
          onChange={(e) =>
            setQuantity(
              Math.min(
                Math.max(1, Number(e.target.value) || 1),
                Math.max(1, qtyCap),
              ),
            )
          }
          className="editorial-input"
        />
      </label>

      {error ? (
        <p className="text-sm text-rose-700" role="alert">
          {error}
        </p>
      ) : null}
      {added ? (
        <p className="text-sm text-[var(--accent)]" role="status">
          Added to cart.
        </p>
      ) : null}

      <div className="flex flex-col gap-3">
        <Button
          type="button"
          size="lg"
          onClick={onAdd}
          disabled={!available || qtyCap < 1}
          className="w-full"
        >
          {available ? "Add to cart" : "Sold out"}
        </Button>
        <ButtonLink href="/cart" variant="secondary" size="lg" className="w-full">
          View cart
        </ButtonLink>
      </div>

      <p className="text-xs leading-relaxed text-neutral-400">
        Availability is demo stock stored with the catalog in this browser.
        Orders are confirmed with the store on WhatsApp — this is not a
        production inventory system.
      </p>
    </div>
  );
}
