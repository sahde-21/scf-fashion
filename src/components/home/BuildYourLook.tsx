"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useState } from "react";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { LoadingBlock } from "@/components/ui/LoadingBlock";
import { Price } from "@/components/ui/Price";
import { Reveal } from "@/components/ui/Reveal";
import { useCatalog } from "@/context/CatalogContext";
import { LOOKS } from "@/data/looks";
import { getPrimaryImage } from "@/lib/product-images";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

export function BuildYourLook() {
  const { publishedProducts, hydrated } = useCatalog();
  const [activeId, setActiveId] = useState(LOOKS[0]?.id ?? "");

  const bySlug = useMemo(() => {
    const map = new Map<string, Product>();
    for (const p of publishedProducts) map.set(p.slug, p);
    return map;
  }, [publishedProducts]);

  const look = LOOKS.find((l) => l.id === activeId) ?? LOOKS[0];
  const resolved = look
    ? look.items
        .map((item) => {
          const product = bySlug.get(item.slug);
          return product ? { ...item, product } : null;
        })
        .filter(
          (
            row,
          ): row is {
            slug: string;
            role: (typeof LOOKS)[0]["items"][0]["role"];
            product: Product;
          } => Boolean(row),
        )
    : [];

  if (!hydrated) return <LoadingBlock label="Loading looks…" />;
  if (!look || !resolved.length) return null;

  return (
    <section
      id="build-your-look"
      className="border-y border-[var(--line)] bg-[var(--background)]"
    >
      <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24">
        <Reveal>
          <div className="border-b border-[var(--line)] pb-8">
            <div className="mb-5 h-px w-10 bg-[var(--gold)] opacity-70" />
            <p className="text-[0.65rem] font-medium uppercase tracking-[0.24em] text-[var(--muted)]">
              Lookbook
            </p>
            <h2 className="mt-3 font-display text-3xl font-medium tracking-[0.02em] text-[var(--ink)] sm:text-4xl">
              Build your look
            </h2>
            <p className="mt-3 max-w-xl text-sm font-light leading-relaxed text-[var(--muted)]">
              Curated outfits from real catalog pieces — open any item to view
              sizes, colors, and availability.
            </p>
          </div>
        </Reveal>

        <div
          className="mt-8 flex gap-2 overflow-x-auto pb-1"
          role="tablist"
          aria-label="Looks"
        >
          {LOOKS.map((option) => (
            <button
              key={option.id}
              type="button"
              role="tab"
              aria-selected={option.id === look.id}
              onClick={() => setActiveId(option.id)}
              className={cn(
                "shrink-0 border px-4 py-2.5 text-[0.65rem] font-medium uppercase tracking-[0.16em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)]",
                option.id === look.id
                  ? "border-[var(--ink)] bg-[var(--ink)] text-[var(--background)]"
                  : "border-[var(--line)] text-[var(--muted)] hover:border-[var(--ink)]/40",
              )}
            >
              {option.title}
            </button>
          ))}
        </div>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
          <Reveal>
            <div className="relative aspect-[4/5] overflow-hidden bg-[var(--surface)] sm:aspect-[3/4]">
              <Image
                key={look.coverImage}
                src={look.coverImage}
                alt=""
                fill
                className="object-cover object-center animate-image-swap"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority={false}
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-6 sm:p-8">
                <p className="font-display text-2xl font-medium tracking-[0.02em] text-white sm:text-3xl">
                  {look.title}
                </p>
                <p className="mt-2 max-w-md text-sm font-light text-white/80">
                  {look.description}
                </p>
              </div>
            </div>
          </Reveal>

          <Reveal delayMs={80}>
            <ul className="space-y-0" role="list">
              {resolved.map(({ product, role }) => {
                const src = getPrimaryImage(product);
                return (
                  <li
                    key={product.id}
                    className="border-b border-[var(--line)] py-5 first:pt-0"
                  >
                    <Link
                      href={`/products/${product.slug}`}
                      className="group flex gap-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)]"
                    >
                      <div className="relative h-28 w-[5.5rem] shrink-0 overflow-hidden bg-[var(--surface)] sm:h-32 sm:w-24">
                        {src ? (
                          <Image
                            src={src}
                            alt=""
                            fill
                            className="object-cover object-center transition duration-700 group-hover:scale-[1.03]"
                            sizes="96px"
                          />
                        ) : (
                          <ImagePlaceholder />
                        )}
                      </div>
                      <div className="min-w-0 flex-1 self-center">
                        <p className="text-[0.6rem] font-medium uppercase tracking-[0.2em] text-[var(--muted)]">
                          {role}
                        </p>
                        <p className="mt-1.5 font-display text-xl font-medium tracking-[0.02em] text-[var(--ink)] transition group-hover:text-[var(--muted)]">
                          {product.name}
                        </p>
                        <div className="mt-2">
                          <Price usd={product.priceUsd} compact />
                        </div>
                        <p className="mt-3 text-[0.65rem] uppercase tracking-[0.14em] text-[var(--gold)] transition group-hover:text-[var(--ink)]">
                          View product
                        </p>
                      </div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
