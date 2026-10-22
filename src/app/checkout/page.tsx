import type { Metadata } from "next";
import { CheckoutView } from "@/components/checkout/CheckoutView";

export const metadata: Metadata = {
  title: "Checkout",
  description:
    "Prepare a WhatsApp order for SCF Fashion. Opening WhatsApp does not send the order until you press Send.",
};

export default function CheckoutPage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
      <div className="mb-8 max-w-2xl">
        <h1 className="font-display text-4xl text-slate-900 sm:text-5xl">
          Checkout
        </h1>
        <p className="mt-3 text-slate-600">
          No card payments. Your order is prepared as a WhatsApp message for the
          store to confirm.
        </p>
      </div>
      <CheckoutView />
    </div>
  );
}
