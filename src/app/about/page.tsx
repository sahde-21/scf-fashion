import type { Metadata } from "next";
import Link from "next/link";
import { STORE_NAME } from "@/lib/config";

export const metadata: Metadata = {
  title: "About",
  description: `About ${STORE_NAME} — premium streetwear with WhatsApp ordering.`,
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
      <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-neutral-400 animate-fade-up">
        About
      </p>
      <h1 className="mt-3 font-display text-4xl tracking-[0.04em] text-neutral-900 sm:text-5xl animate-fade-up-delay">
        {STORE_NAME}
      </h1>
      <div className="mt-8 space-y-5 text-sm leading-relaxed text-neutral-600 animate-fade-up-delay-2">
        <p>
          SCF Fashion is a local demo storefront for bold, minimal streetwear.
          Browse the hanging rail, choose colors and sizes, and send your bag
          to the store on WhatsApp — no card payments on this site.
        </p>
        <p>
          Prices are shown in USD and IQD using a fixed demo exchange rate.
          Product edits in the local admin stay in your browser only and are
          not a production inventory system.
        </p>
      </div>
      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/products"
          className="text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-900 underline-offset-4 hover:underline"
        >
          Shop the collection
        </Link>
        <Link
          href="/contact"
          className="text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-500 underline-offset-4 hover:underline hover:text-neutral-900"
        >
          Contact
        </Link>
      </div>
    </div>
  );
}
