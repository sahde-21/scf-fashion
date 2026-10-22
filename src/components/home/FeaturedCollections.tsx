import Image from "next/image";
import Link from "next/link";
import { CATEGORIES } from "@/lib/config";

export function FeaturedCollections() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="flex items-end justify-between gap-4 border-b border-neutral-200 pb-4">
        <h2 className="font-display text-3xl tracking-[0.02em] text-neutral-900 sm:text-4xl">
          Collections
        </h2>
        <Link
          href="/products"
          className="text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-500 transition hover:text-neutral-900"
        >
          View all
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-5">
        {CATEGORIES.map((category) => (
          <Link
            key={category.id}
            href={`/products?category=${category.id}`}
            className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
          >
            <div className="relative aspect-[3/4] overflow-hidden bg-[var(--surface)]">
              <Image
                src={category.image}
                alt=""
                fill
                className="object-cover transition duration-700 ease-out group-hover:scale-[1.03]"
                sizes="(max-width: 768px) 50vw, 20vw"
              />
            </div>
            <p className="mt-3 text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-800">
              {category.name}
            </p>
          </Link>
        ))}
      </div>
    </section>
  );
}
