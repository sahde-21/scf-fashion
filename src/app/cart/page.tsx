import type { Metadata } from "next";
import { CartView } from "@/components/cart/CartView";

export const metadata: Metadata = {
  title: "Cart",
  description: "Review your SCF Fashion bag before WhatsApp checkout.",
};

export default function CartPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <h1 className="mb-8 font-display text-4xl text-slate-900 sm:text-5xl">
        Cart
      </h1>
      <CartView />
    </div>
  );
}
