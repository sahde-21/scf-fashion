import Image from "next/image";
import Link from "next/link";
import { Reveal } from "@/components/ui/Reveal";
import { CATEGORIES } from "@/lib/config";

export function FeaturedCollections() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
      <Reveal>
        <div className="flex items-end justify-between gap-4 border-b border-[var(--line)] pb-6">
          <div>
            <div className="mb-4 h-px w-10 bg-[var(--gold)] opacity-70" />
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.24em] text-[var(--muted)]">
              Browse
            </p>
            <h2 className="mt-2 font-display text-3xl font-medium tracking-[0.02em] text-[var(--ink)] sm:text-4xl">
              Shop by category
            </h2>
          </div>
          <Link
            href="/products"
            className="text-[0.65rem] font-medium uppercase tracking-[0.18em] text-[var(--muted)] transition hover:text-[var(--ink)]"
          >
            View all
          </Link>
        </div>
      </Reveal>

      <div className="mt-10 grid grid-cols-2 gap-4 sm:gap-5 md:grid-cols-5">
        {CATEGORIES.map((category, i) => (
          <Reveal key={category.id} delayMs={i * 40}>
            <Link
              href={`/products?category=${category.id}`}
              className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
            >
              <div className="relative aspect-square overflow-hidden bg-[var(--surface)]">
                <Image
                  src={category.image}
                  alt=""
                  fill
                  className="object-cover object-center transition duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.04]"
                  sizes="(max-width: 768px) 50vw, 18vw"
                />
              </div>
              <div className="mt-3.5 flex items-center justify-between gap-2 px-0.5">
                <p className="text-[0.7rem] font-medium uppercase tracking-[0.16em] text-[var(--ink)]">
                  {category.name}
                </p>
                <span
                  className="text-[var(--gold)] transition group-hover:translate-x-0.5"
                  aria-hidden
                >
                  →
                </span>
              </div>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
