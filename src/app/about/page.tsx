import type { Metadata } from "next";
import Link from "next/link";
import { STORE_NAME } from "@/lib/config";

export const metadata: Metadata = {
  title: "About",
  description: `About ${STORE_NAME} — quiet luxury fashion with WhatsApp ordering.`,
};

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
      <div className="mb-5 h-px w-10 bg-[var(--gold)] opacity-70" />
      <p className="text-[0.65rem] font-medium uppercase tracking-[0.24em] text-[var(--muted)] animate-fade-up">
        About
      </p>
      <h1 className="mt-3 font-display text-4xl font-medium tracking-[0.02em] text-[var(--ink)] sm:text-5xl animate-fade-up-delay">
        {STORE_NAME}
      </h1>
      <div className="mt-8 space-y-5 text-sm font-light leading-relaxed text-[var(--muted)] animate-fade-up-delay-2">
        <p>
          SCF Fashion is a quiet-luxury demo storefront for editorial fashion.
          Browse the hanging rail, choose colors and sizes, and send your bag to
          the store on WhatsApp — no card payments on this site.
        </p>
        <p>
          Prices are shown in USD and IQD using a fixed demo exchange rate.
          Product imagery is illustrative for this phase and does not claim to
          represent verified warehouse photography. Local admin edits stay in
          your browser only.
        </p>
      </div>
      <div className="mt-12 flex flex-wrap gap-6">
        <Link
          href="/products"
          className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-[var(--ink)] underline-offset-4 hover:underline"
        >
          Explore collection
        </Link>
        <Link
          href="/contact"
          className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-[var(--muted)] underline-offset-4 hover:underline hover:text-[var(--ink)]"
        >
          Contact
        </Link>
      </div>
    </div>
  );
}
