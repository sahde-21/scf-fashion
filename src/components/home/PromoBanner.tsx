import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function PromoBanner() {
  return (
    <section className="border-y border-[var(--line)] bg-[var(--background)]">
      <div className="mx-auto grid max-w-6xl md:grid-cols-2">
        <div className="relative min-h-[280px] md:min-h-[400px]">
          <Image
            src="/editorial/promo.jpg"
            alt=""
            fill
            className="object-cover object-center"
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </div>
        <Reveal>
          <div className="flex h-full flex-col justify-center bg-[var(--surface)] px-6 py-14 sm:px-12 sm:py-20">
            <div className="mb-5 h-px w-10 bg-[var(--gold)] opacity-70" />
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.24em] text-[var(--muted)]">
              Private ordering
            </p>
            <h2 className="mt-3 font-display text-3xl font-medium tracking-[0.02em] text-[var(--ink)] sm:text-4xl">
              WhatsApp checkout
            </h2>
            <p className="mt-4 max-w-md text-sm font-light leading-relaxed text-[var(--muted)]">
              Prepare a clear order with sizes, colors, location, and dual
              USD/IQD totals. Opening WhatsApp does not place the order until
              you press Send.
            </p>
            <div className="mt-10">
              <ButtonLink href="/checkout" size="lg">
                Start checkout
              </ButtonLink>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
