import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { STORE_NAME } from "@/lib/config";

/**
 * Campaign hero — clothing-rail editorial.
 * Viewport height subtracts announce + header + ticker so CTAs never sit under chrome.
 */
export function Hero() {
  return (
    <section className="relative isolate overflow-hidden bg-[var(--ink)] text-white">
      <div className="relative h-[calc(100svh-var(--announce-h)-var(--header-h)-var(--ticker-h))] min-h-[32rem] max-h-[52rem]">
        <Image
          src="/editorial/hero.jpg"
          alt="Wooden hangers with garments on a quiet clothing rail"
          fill
          priority
          className="object-cover object-[center_42%] animate-hero-media"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/45 to-black/70"
          aria-hidden
        />
        <div
          className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/25 to-transparent"
          aria-hidden
        />

        <div className="relative mx-auto flex h-full max-w-6xl flex-col justify-center gap-0 px-4 py-6 sm:px-6 sm:py-10">
          <p className="text-[0.62rem] font-medium uppercase tracking-[0.26em] text-[var(--gold)] animate-fade-up">
            Quiet luxury
          </p>
          <p className="mt-2.5 font-display text-[clamp(2.35rem,9vw,5rem)] font-medium leading-[0.94] tracking-[0.01em] text-white animate-fade-up-delay sm:mt-3.5">
            {STORE_NAME}
          </p>
          <h1 className="mt-2.5 max-w-sm text-[0.88rem] font-light leading-snug text-white/92 sm:mt-3.5 sm:max-w-md sm:text-base sm:leading-relaxed animate-fade-up-delay-2">
            An editorial collection of refined essentials — considered
            silhouettes, calm materials, and lasting presence.
          </h1>
          <div className="mt-5 flex flex-col gap-2.5 sm:mt-8 sm:flex-row sm:flex-wrap sm:gap-3.5 animate-fade-up-delay-2">
            <ButtonLink
              href="/products"
              size="lg"
              variant="primary"
              className="min-h-11 w-full justify-center border border-[var(--ink)] bg-[var(--ink)] px-6 py-3 text-[0.65rem] tracking-[0.16em] text-[var(--background)] shadow-[0_8px_24px_rgba(0,0,0,0.45)] hover:bg-[#2a2620] focus-visible:ring-white focus-visible:ring-offset-[var(--ink)] sm:min-h-12 sm:w-auto sm:px-8 sm:text-[0.7rem]"
            >
              Explore Collection
            </ButtonLink>
            <ButtonLink
              href="#hanging-rail"
              variant="ghostLight"
              size="lg"
              className="min-h-11 w-full justify-center border border-white/70 bg-[var(--background)]/12 px-6 py-3 text-[0.65rem] tracking-[0.16em] text-white backdrop-blur-[3px] hover:border-white hover:bg-[var(--background)]/20 focus-visible:ring-white focus-visible:ring-offset-[var(--ink)] sm:min-h-12 sm:w-auto sm:px-8 sm:text-[0.7rem]"
            >
              View the Rail
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
