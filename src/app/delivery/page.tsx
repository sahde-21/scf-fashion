import type { Metadata } from "next";
import Link from "next/link";
import { STORE_CONTACT, STORE_NAME, STORE_POLICY_NOTICE } from "@/lib/config";

export const metadata: Metadata = {
  title: "Delivery",
  description: `Delivery information for ${STORE_NAME}. Details confirmed on WhatsApp.`,
};

export default function DeliveryPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
      <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-neutral-400">
        Information
      </p>
      <h1 className="mt-3 font-display text-4xl tracking-[0.06em] text-neutral-900 sm:text-5xl">
        Delivery
      </h1>
      <div className="mt-8 space-y-5 text-sm leading-relaxed text-neutral-600">
        <p>
          Orders are prepared as a WhatsApp message to the store. Delivery
          options, fees, and timing are confirmed directly with{" "}
          {STORE_NAME} after you send your message — this website does not
          calculate shipping or promise a delivery window.
        </p>
        <p>
          At checkout you may optionally share a city/area, written address, a
          map pin link you paste yourself, or share live location inside
          WhatsApp on your phone. We never request browser location permission
          and do not track you.
        </p>
        <p className="border border-[var(--line)] bg-[var(--surface)] p-4 text-neutral-500">
          {STORE_POLICY_NOTICE}
        </p>
        <p>
          Store city (demo): {STORE_CONTACT.city}. Final coverage areas are set
          by the store owner.
        </p>
      </div>
      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/checkout"
          className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-900 underline-offset-4 hover:underline"
        >
          Go to checkout
        </Link>
        <Link
          href="/contact"
          className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-500 underline-offset-4 hover:underline hover:text-neutral-900"
        >
          Contact
        </Link>
      </div>
    </div>
  );
}
