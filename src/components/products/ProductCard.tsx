"use client";

import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { Price } from "@/components/ui/Price";
import type { Product } from "@/types";

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="group animate-fade-up">
      <Link
        href={`/products/${product.slug}`}
        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2"
      >
        <div className="relative aspect-[4/5] overflow-hidden bg-sky-50">
          <Image
            src={product.images[0] ?? ""}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition duration-500 ease-out group-hover:scale-[1.04]"
          />
          <div className="absolute left-3 top-3 flex flex-wrap gap-1">
            {product.newArrival ? <Badge>New</Badge> : null}
            {!product.inStock ? <Badge tone="rose">Sold out</Badge> : null}
          </div>
        </div>
        <div className="mt-3 space-y-1">
          <p className="text-xs uppercase tracking-wider text-sky-700">
            {product.category}
          </p>
          <h3 className="font-display text-xl text-slate-900 transition group-hover:text-sky-700">
            {product.name}
          </h3>
          <Price usd={product.priceUsd} compact />
        </div>
      </Link>
    </article>
  );
}
