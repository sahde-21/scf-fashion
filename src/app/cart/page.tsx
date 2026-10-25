import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your SCF Fashion bag before WhatsApp checkout.",
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-10 border-b border-[var(--line)] pb-7">
        <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-neutral-400">
          Bag
        </p>
        <h1 className="mt-2 font-display text-4xl tracking-[0.04em] text-neutral-900 sm:text-5xl">
          Cart
        </h1>
      </div>
      <CartView />
    </div>
  );
}
