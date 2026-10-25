import type { Metadata } from "next";
import Link from "next/link";
import { STORE_NAME } from "@/lib/config";

export const metadata: Metadata = {
  title: "Privacy",
  description: `Privacy information for the ${STORE_NAME} demo storefront.`,
};

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
      <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-neutral-400">
        Information
      </p>
      <h1 className="mt-3 font-display text-4xl tracking-[0.06em] text-neutral-900 sm:text-5xl">
        Privacy
      </h1>
      <div className="mt-8 space-y-5 text-sm leading-relaxed text-neutral-600">
        <p>
          This is a local demo storefront. It does not use paid analytics,
          advertising pixels, or a remote customer database.
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            Cart contents and optional catalog edits are stored in your
            browser&apos;s <code className="text-xs">localStorage</code> only.
          </li>
          <li>
            Checkout drafts saved for the local admin stay in this browser.
            Map pin URLs you paste are included in the WhatsApp message and are
            not kept in those drafts.
          </li>
          <li>
            Opening WhatsApp sends your prepared message through WhatsApp&apos;s
            own apps/services under Meta&apos;s terms — not through this website.
          </li>
          <li>
            We never request browser geolocation permission and do not track your
            device location.
          </li>
        </ul>
        <p className="border border-[var(--line)] bg-[var(--surface)] p-4 text-neutral-500">
          Owner decision required: before a public launch, replace this notice
          with a jurisdiction-appropriate privacy policy covering WhatsApp
          messaging, any hosting provider, and real contact details.
        </p>
      </div>
      <div className="mt-10">
        <Link
          href="/contact"
          className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-900 underline-offset-4 hover:underline"
        >
          Contact
        </Link>
      </div>
    </div>
  );
}
