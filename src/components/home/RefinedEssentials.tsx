import Image from "next/image";
import Link from "next/link";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";

export function RefinedEssentials() {
  return (
    <section className="border-b border-[var(--line)] bg-[var(--background)]">
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <div className="grid items-end gap-10 lg:grid-cols-[0.95fr_1.05fr] lg:gap-16">
          <Reveal>
            <div>
              <div className="mb-5 h-px w-10 bg-[var(--gold)] opacity-70" />
              <p className="text-[0.65rem] font-medium uppercase tracking-[0.24em] text-[var(--muted)]">
                New season
              </p>
              <h2 className="mt-3 font-display text-4xl font-medium leading-[1.05] tracking-[0.01em] text-[var(--ink)] sm:text-5xl">
                Refined Essentials
              </h2>
              <p className="mt-5 max-w-md text-sm font-light leading-relaxed text-[var(--muted)]">
                Soft structure, calm neutrals, and lasting silhouettes — an
                editorial edit of pieces made for everyday presence.
              </p>
              <div className="mt-9 flex flex-wrap gap-3">
                <ButtonLink href="/products?category=women" size="md">
                  Shop Women
                </ButtonLink>
                <ButtonLink
                  href="/products?category=men"
                  variant="secondary"
                  size="md"
                >
                  Shop Men
                </ButtonLink>
              </div>
              <Link
                href="/#build-your-look"
                className="mt-8 inline-flex items-center gap-2 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-[var(--gold)] transition hover:text-[var(--ink)]"
              >
                Day Edit lookbook
                <span aria-hidden>→</span>
              </Link>
            </div>
          </Reveal>

          <Reveal delayMs={60}>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <Link
                href="/products?category=women"
                className="group relative aspect-[3/4] overflow-hidden bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)]"
              >
                <Image
                  src="/editorial/cat-women.jpg"
                  alt=""
                  fill
                  className="object-cover object-[center_20%] transition duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                  sizes="(max-width: 1024px) 50vw, 28vw"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"
                  aria-hidden
                />
                <span className="absolute bottom-4 left-4 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-white">
                  Women
                </span>
              </Link>
              <Link
                href="/products?category=men"
                className="group relative mt-8 aspect-[3/4] overflow-hidden bg-[var(--surface)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)] sm:mt-12"
              >
                <Image
                  src="/editorial/lookbook-rail.jpg"
                  alt=""
                  fill
                  className="object-cover object-center transition duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.03]"
                  sizes="(max-width: 1024px) 50vw, 28vw"
                />
                <div
                  className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"
                  aria-hidden
                />
                <span className="absolute bottom-4 left-4 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-white">
                  Men
                </span>
              </Link>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
