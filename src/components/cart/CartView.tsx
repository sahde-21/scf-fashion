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
        action={
          <ButtonLink href="/products">Browse products</ButtonLink>
        }
      />
    );
  }

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_320px]">
      <ul className="space-y-4">
        {items.map((item) => (
          <li
            key={item.key}
            className="flex gap-4 border-b border-sky-100 pb-4 animate-fade-up"
          >
            <div className="relative h-28 w-24 shrink-0 overflow-hidden bg-sky-50">
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
                  <p className="font-display text-xl text-slate-900">
                    {item.name}
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Size {item.size} · {item.colorName}
                  </p>
                </div>
                <Price usd={item.priceUsd * item.quantity} compact />
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-3">
                <label className="flex items-center gap-2 text-sm text-slate-700">
                  Qty
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={item.quantity}
                    onChange={(e) =>
                      updateQuantity(item.key, Number(e.target.value) || 1)
                    }
                    className="w-16 rounded-md border border-sky-100 px-2 py-1.5 outline-none focus:ring-2 focus:ring-sky-300"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => removeItem(item.key)}
                  className="text-sm text-rose-600 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
                >
                  Remove
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>

      <aside className="h-fit space-y-4 rounded-2xl border border-sky-100 bg-white p-5">
        <h2 className="font-display text-2xl text-slate-900">Summary</h2>
        <div className="flex items-start justify-between gap-3 text-sm">
          <span className="text-slate-600">Subtotal</span>
          <Price usd={subtotalUsd} compact />
        </div>
        <p className="text-xs text-slate-500">
          Shipping and final confirmation happen with the store on WhatsApp. No
          card payment is collected here.
        </p>
        <ButtonLink href="/checkout" className="w-full" size="lg">
          Continue to checkout
        </ButtonLink>
        <Button
          type="button"
          variant="ghost"
          className="w-full"
          onClick={clearCart}
        >
          Clear cart
        </Button>
      </aside>
    </div>
  );
}
