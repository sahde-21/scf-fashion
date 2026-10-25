"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { Price } from "@/components/ui/Price";
import { isProductAvailable } from "@/lib/inventory";
import { getGalleryImages } from "@/lib/product-images";
import type { Product } from "@/types";

export function ProductCard({ product }: { product: Product }) {
  const [hovered, setHovered] = useState(false);
  const gallery = getGalleryImages(product);
  const primary = gallery[0] ?? "";
  const secondary = gallery[1] && gallery[1] !== primary ? gallery[1] : null;
  const showAlt = hovered && secondary;
  const available = isProductAvailable(product);
  const swatches = product.colors.slice(0, 5);

  return (
    <article className="group flex h-full flex-col">
      <Link
        href={`/products/${product.slug}`}
        className="flex h-full flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="relative aspect-[3/4] w-full overflow-hidden bg-[var(--surface)]">
          {primary ? (
            <Image
              src={showAlt && secondary ? secondary : primary}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover object-center transition duration-[850ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-hover:scale-[1.025]"
              key={showAlt ? secondary : primary}
            />
          ) : (
            <ImagePlaceholder />
          )}
          <div className="absolute left-3 top-3 flex flex-col gap-1.5">
            {product.newArrival ? <Badge>New</Badge> : null}
            {!available ? <Badge tone="rose">Sold out</Badge> : null}
          </div>
        </div>
        <div className="mt-4 flex flex-1 flex-col gap-2 px-0.5">
          <h3 className="text-[0.8rem] font-medium leading-snug tracking-[0.04em] text-[var(--ink)] transition group-hover:text-[var(--muted)] sm:text-[0.85rem]">
            {product.name}
          </h3>
          <Price usd={product.priceUsd} compact />
          {swatches.length > 0 ? (
            <ul
              className="mt-auto flex flex-wrap items-center gap-1.5 pt-1"
              aria-label="Available colors"
            >
              {swatches.map((color) => (
                <li key={color.id}>
                  <span
                    className="block h-2.5 w-2.5 rounded-full border border-[var(--line-strong)]"
                    style={{ backgroundColor: color.hex }}
                    title={color.name}
                  >
                    <span className="sr-only">{color.name}</span>
                  </span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </Link>
    </article>
  );
}
