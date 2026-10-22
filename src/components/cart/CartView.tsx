"use client";

import Image from "next/image";
import { Button, ButtonLink } from "@/components/ui/Button";
import { EmptyState } from "@/components/ui/EmptyState";
import { LoadingBlock } from "@/components/ui/LoadingBlock";
import { Price } from "@/components/ui/Price";
import { useCart } from "@/context/CartContext";

export function CartView() {
  const {
    items,
    hydrated,
    subtotalUsd,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();

  if (!hydrated) return <LoadingBlock label="Loading cart…" />;

  if (!items.length) {
    return (
      <EmptyState
        title="Your cart is empty"
        description="Discover new arrivals and add a few pieces before checkout."
        action={<ButtonLink href="/products">Browse products</ButtonLink>}
      />
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
      <ul className="space-y-0">
        {items.map((item) => (
          <li
            key={item.key}
            className="flex gap-4 border-b border-neutral-200 py-5 animate-fade-up"
          >
            <div className="relative h-32 w-24 shrink-0 overflow-hidden bg-[var(--surface)]">
              <Image
                src={item.image}
                alt=""
                fill
                className="object-cover"
                sizes="96px"
              />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <p className="text-sm font-medium tracking-wide text-neutral-900">
                    {item.name}
                  </p>
                  <p className="mt-1 text-xs uppercase tracking-[0.12em] text-neutral-400">
                    Size {item.size} · {item.colorName}
                  </p>
                </div>
                <Price usd={item.priceUsd * item.quantity} compact />
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-4">
                <label className="flex items-center gap-2 text-xs uppercase tracking-[0.12em] text-neutral-500">
                  Qty
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item.key, Number(e.target.value) || 1)
                    }
                    className="w-14 border-b border-neutral-200 bg-transparent py-1 text-sm outline-none focus:border-[var(--sky)]"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => removeItem(item.key)}
                  className="text-xs uppercase tracking-[0.12em] text-neutral-500 transition hover:text-rose-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
                >
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="h-fit space-y-5 border border-neutral-200 p-5">
        <h2 className="font-display text-2xl text-neutral-900">Summary</h2>
        <div className="flex items-start justify-between gap-3 text-sm">
          <span className="text-neutral-500">Subtotal</span>
          <Price usd={subtotalUsd} compact />
        </div>
        <p className="text-xs leading-relaxed text-neutral-400">
          Shipping and final confirmation happen with the store on WhatsApp. No
          card payment is collected here.
        </p>
        <ButtonLink href="/checkout" className="w-full" size="lg">
          Continue to checkout
        </ButtonLink>
        <Button type="button" variant="ghost" className="w-full" onClick={clearCart}>
          Clear cart
        </Button>
      </aside>
    </div>
  );
}
