import type { Metadata } from "next";
import Link from "next/link";
import {
  STORE_CONTACT,
  STORE_NAME,
  STORE_WHATSAPP_E164_DIGITS,
  STORE_WHATSAPP_LOCAL,
} from "@/lib/config";

export const metadata: Metadata = {
  title: "Contact",
  description: `Contact ${STORE_NAME} on WhatsApp for orders and questions.`,
};

export default function ContactPage() {
  const waHref = `https://wa.me/${STORE_WHATSAPP_E164_DIGITS}`;

  return (
    <div className="mx-auto max-w-2xl px-4 py-16 sm:px-6 sm:py-24">
      <p className="text-[11px] font-medium uppercase tracking-[0.24em] text-neutral-400 animate-fade-up">
        Contact
      </p>
      <h1 className="mt-3 font-display text-4xl tracking-[0.06em] text-neutral-900 sm:text-5xl animate-fade-up-delay">
        Get in touch
      </h1>
      <p className="mt-6 text-sm leading-relaxed text-neutral-600 animate-fade-up-delay-2">
        Orders are confirmed on WhatsApp. Opening the chat does not send your
        order until you press Send.
      </p>

      <dl className="mt-10 space-y-6 border-t border-[var(--line)] pt-8 text-sm animate-fade-up-delay-2">
        <div>
          <dt className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-400">
            WhatsApp
          </dt>
          <dd className="mt-2">
            <a
              href={waHref}
              target="_blank"
              rel="noreferrer"
              className="text-neutral-900 underline-offset-4 hover:underline"
            >
              {STORE_WHATSAPP_LOCAL}
            </a>
          </dd>
        </div>
        <div>
          <dt className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-400">
            Email
          </dt>
          <dd className="mt-2 text-neutral-700">{STORE_CONTACT.email}</dd>
        </div>
        <div>
          <dt className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-400">
            Location
          </dt>
          <dd className="mt-2 text-neutral-700">{STORE_CONTACT.city}</dd>
        </div>
      </dl>

      <div className="mt-10 flex flex-wrap gap-4">
        <Link
          href="/checkout"
          className="inline-flex items-center justify-center border border-neutral-900 bg-neutral-900 px-7 py-3.5 text-[11px] font-medium uppercase tracking-[0.18em] text-white transition hover:bg-neutral-800"
        >
          Start checkout
        </Link>
        <Link
          href="/about"
          className="inline-flex items-center justify-center px-2 py-3.5 text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-500 transition hover:text-neutral-900"
        >
          About {STORE_NAME}
        </Link>
      </div>
    </div>
  );
}
