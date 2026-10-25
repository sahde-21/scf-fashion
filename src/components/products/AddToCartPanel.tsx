"use client";

import Link from "next/link";
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
  const fabricTags = product.tags.filter((t) =>
    ["linen", "silk", "cotton", "wool", "leather", "knit", "oxford"].includes(t),
  );

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
    <div className="space-y-9 lg:sticky lg:top-[calc(var(--header-h)+1.5rem)] lg:pb-[calc(var(--ticker-h)+1rem)]">
      <div className="space-y-3 border-b border-[var(--line)] pb-8">
        <p className="text-[0.65rem] font-medium uppercase tracking-[0.22em] text-[var(--muted)]">
          {product.category}
        </p>
        <h1 className="font-display text-3xl font-medium tracking-[0.02em] text-[var(--ink)] sm:text-4xl">
          {product.name}
        </h1>
        <Price usd={product.priceUsd} />
        <p className="text-sm font-light text-[var(--muted)]">
          {available ? "In stock" : "Currently unavailable"}
          {available && sizeStock !== null ? (
            <span>
              {" "}
              · {sizeStock} left in {size}
            </span>
          ) : null}
        </p>
      </div>

      <p className="text-sm font-light leading-relaxed text-[var(--muted)]">
        {product.description}
      </p>

      {fabricTags.length ? (
        <dl className="grid gap-3 border-y border-[var(--line)] py-5 text-sm">
          <div className="flex justify-between gap-4">
            <dt className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
              Fabric & details
            </dt>
            <dd className="text-right text-[var(--ink)] capitalize">
              {fabricTags.join(" · ")}
            </dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
              Fit notes
            </dt>
            <dd className="text-right font-light text-[var(--muted)]">
              Confirm sizing on WhatsApp if unsure
            </dd>
          </div>
        </dl>
      ) : null}

      <fieldset>
        <legend className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
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
                  "min-h-11 min-w-11 border px-3 py-2.5 text-xs tracking-wide transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)]",
                  size === value
                    ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--background)]"
                    : "border-[var(--line)] text-[var(--ink)] hover:border-[var(--ink)]/50",
                  !sizeOk &&
                    "cursor-not-allowed border-[var(--line)] text-[var(--line-strong)] line-through hover:border-[var(--line)]",
                )}
              >
                {value}
              </button>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
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
                "h-9 w-9 rounded-full border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)]",
                colorId === c.id
                  ? "scale-105 border-[var(--ink)] ring-1 ring-[var(--ink)] ring-offset-2 ring-offset-[var(--background)]"
                  : "border-[var(--line)] hover:border-[var(--ink)]/40",
              )}
              style={{ backgroundColor: c.hex }}
            />
          ))}
        </div>
        {color && !color.images?.length ? (
          <p className="mt-2 text-xs font-light text-[var(--muted)]">
            Color selected for order. A dedicated photo for this colorway is not
            in the catalog yet.
          </p>
        ) : null}
      </fieldset>

      <label className="block max-w-[7rem] space-y-2">
        <span className="text-[0.65rem] font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
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
        <p
          className="border border-[var(--ink)] bg-[var(--ink)] px-4 py-3.5 text-sm font-light text-[var(--background)] animate-fade-up"
          role="status"
        >
          Added to bag —{" "}
          <Link href="/cart" className="underline underline-offset-4">
            view cart
          </Link>{" "}
          or{" "}
          <Link href="/checkout" className="underline underline-offset-4">
            WhatsApp checkout
          </Link>
          .
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
          {available ? (added ? "Added" : "Add to cart") : "Sold out"}
        </Button>
        <ButtonLink href="/cart" variant="secondary" size="lg" className="w-full">
          View cart
        </ButtonLink>
        <ButtonLink href="/checkout" variant="ghost" size="lg" className="w-full">
          WhatsApp checkout
        </ButtonLink>
      </div>

      <div className="space-y-2 border-t border-[var(--line)] pt-5 text-xs leading-relaxed text-neutral-400">
        <p>
          Availability is demo stock stored with the catalog in this browser —
          not a shared warehouse.
        </p>
        <p>
          Delivery fees and timing are confirmed on WhatsApp after you send your
          order. This page does not promise shipping windows.
        </p>
        <p>
          <Link
            href="/delivery"
            className="underline underline-offset-2 hover:text-neutral-700"
          >
            Delivery info
          </Link>
          {" · "}
          <Link
            href="/returns"
            className="underline underline-offset-2 hover:text-neutral-700"
          >
            Returns
          </Link>
        </p>
      </div>
    </div>
  );
}
