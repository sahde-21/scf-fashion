import type { Metadata } from "next";
import Link from "next/link";
import { STORE_NAME, STORE_POLICY_NOTICE } from "@/lib/config";

export const metadata: Metadata = {
  title: "Returns",
  description: `Returns information for ${STORE_NAME}. Policies are confirmed by the store.`,
};

export default function ReturnsPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
      <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-neutral-400">
        Information
      </p>
      <h1 className="mt-3 font-display text-4xl tracking-[0.06em] text-neutral-900 sm:text-5xl">
        Returns & exchanges
      </h1>
      <div className="mt-8 space-y-5 text-sm leading-relaxed text-neutral-600">
        <p>
          This demo storefront does not process returns online. If you need to
          exchange or return an item, message the store on WhatsApp with your
          order details. Acceptance, timelines, and any restocking rules are
          decided by the store owner — they are not automated here.
        </p>
        <p className="border border-[var(--line)] bg-[var(--surface)] p-4 text-neutral-500">
          Owner decision required: publish a final returns window, condition
          rules, and whether delivery fees are refundable before treating this
          page as a public policy.
        </p>
        <p className="text-neutral-500">{STORE_POLICY_NOTICE}</p>
      </div>
      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/contact"
          className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-900 underline-offset-4 hover:underline"
        >
          Contact the store
        </Link>
        <Link
          href="/products"
          className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-500 underline-offset-4 hover:underline hover:text-neutral-900"
        >
          Continue shopping
        </Link>
      </div>
    </div>
  );
}
