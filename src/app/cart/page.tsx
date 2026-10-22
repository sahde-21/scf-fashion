import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your SCF Fashion bag before WhatsApp checkout.",
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12">
      <h1 className="mb-8 border-b border-neutral-200 pb-6 font-display text-4xl tracking-[0.02em] text-neutral-900 sm:text-5xl">
        Cart
      </h1>
      <CartView />
    </div>
  );
}
