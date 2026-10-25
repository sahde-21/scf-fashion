"use client";

import Image from "next/image";
import Link from "next/link";
import { ProductGrid } from "@/components/products/ProductGrid";
import { LoadingBlock } from "@/components/ui/LoadingBlock";
import { Reveal } from "@/components/ui/Reveal";
import { useCatalog } from "@/context/CatalogContext";

/**
 * Apparel-first editorial lookbook. Demo imagery is illustrative —
 * not a claim of verified studio stock packs.
 */
export function EditorialLookbook() {
  const { publishedProducts, hydrated } = useCatalog();

  if (!hydrated) return <LoadingBlock label="Loading lookbook…" />;

  const apparel = publishedProducts.filter(
    (p) => p.category === "women" || p.category === "men",
  );
  const rest = publishedProducts.filter(
    (p) => p.category !== "women" && p.category !== "men",
  );
  const ordered = [...apparel, ...rest];

  return (
    <section className="bg-[var(--surface)]">
      <div className="relative isolate overflow-hidden border-y border-[var(--line)]">
        <div className="absolute inset-0">
          <Image
            src="/editorial/lookbook-rail.jpg"
            alt=""
            fill
            className="object-cover object-[center_30%]"
            sizes="100vw"
            priority={false}
          />
          <div
            className="absolute inset-0 bg-gradient-to-r from-black/72 via-black/45 to-black/25"
            aria-hidden
          />
        </div>
        <Reveal>
          <div className="relative mx-auto max-w-6xl px-4 py-20 sm:px-6 sm:py-28">
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.28em] text-[var(--gold)]">
              Full edit
            </p>
            <h2 className="mt-4 max-w-lg font-display text-4xl font-medium tracking-[0.02em] text-white sm:text-5xl">
              The collection
            </h2>
            <p className="mt-4 max-w-md text-sm font-light leading-relaxed text-white/75">
              Apparel first, then shoes and accessories — an editorial pass
              through every published SCF piece.
            </p>
            <Link
              href="/products"
              className="mt-10 inline-flex border-b border-white/40 pb-1 text-[0.65rem] font-medium uppercase tracking-[0.2em] text-white transition hover:border-white"
            >
              Open shop · {publishedProducts.length}
            </Link>
          </div>
        </Reveal>
      </div>

      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <Reveal>
          <ProductGrid products={ordered} />
        </Reveal>
      </div>
    </section>
  );
}
