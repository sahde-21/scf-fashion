"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/Badge";
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

  return (
    <article className="group animate-fade-up">
      <Link
        href={`/products/${product.slug}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="relative aspect-[3/4] overflow-hidden bg-[var(--surface)]">
          {primary ? (
            <Image
              src={showAlt && secondary ? secondary : primary}
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover transition duration-500 ease-out group-hover:scale-[1.02]"
              key={showAlt ? secondary : primary}
            />
          ) : (
            <div className="flex h-full items-center justify-center text-xs uppercase tracking-wider text-neutral-400">
              No image
            </div>
          )}
          <div className="absolute left-2 top-2 flex flex-col gap-1">
            {product.newArrival ? <Badge>New</Badge> : null}
            {!available ? <Badge tone="rose">Sold out</Badge> : null}
          </div>
        </div>
        <div className="mt-3 space-y-1.5">
          <p className="text-[10px] font-medium uppercase tracking-[0.16em] text-neutral-400">
            {product.category}
          </p>
          <h3 className="text-sm font-medium tracking-wide text-neutral-900 transition group-hover:text-neutral-600 sm:text-[15px]">
            {product.name}
          </h3>
          <Price usd={product.priceUsd} compact />
        </div>
      </Link>
    </article>
  );
}
