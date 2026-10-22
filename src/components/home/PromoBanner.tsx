import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";

export function PromoBanner() {
  return (
    <section className="border-y border-neutral-200 bg-[var(--surface)]">
      <div className="mx-auto grid max-w-6xl md:grid-cols-2">
        <div className="relative min-h-[280px] md:min-h-[360px]">
          <Image
            src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=1600&q=80"
            alt="Bright fashion boutique interior"
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <div className="flex flex-col justify-center px-4 py-12 sm:px-10 sm:py-16">
          <p className="text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--sky)]">
            WhatsApp ordering
          </p>
          <h2 className="mt-3 font-display text-3xl tracking-[0.02em] text-neutral-900 sm:text-4xl">
            Send your bag in a few taps
          </h2>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-neutral-500">
            Prepare a clear order message with sizes, colors, and dual-currency
            totals. Opening WhatsApp does not deliver the order until you press
            Send.
          </p>
          <div className="mt-8">
            <ButtonLink href="/checkout" size="lg">
              Start checkout
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
