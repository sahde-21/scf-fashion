import Image from "next/image";
import Link from "next/link";
import { CATEGORIES } from "@/lib/config";

export function FeaturedCollections() {
  return (
    <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
      <div className="max-w-2xl">
        <h2 className="font-display text-3xl text-slate-900 sm:text-4xl">
          Collections
        </h2>
        <p className="mt-3 text-slate-600">
          Five editable categories — men, women, shoes, bags, and accessories.
        </p>
      </div>
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CATEGORIES.map((category, index) => (
          <Link
            key={category.id}
            href={`/products?category=${category.id}`}
            className={`group relative min-h-56 overflow-hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 ${
              index === 0 ? "sm:col-span-2 lg:col-span-2 lg:min-h-72" : ""
            }`}
          >
            <Image
              src={category.image}
              alt=""
              fill
              className="object-cover transition duration-700 group-hover:scale-105"
              sizes="(max-width: 768px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-900/20 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-5 text-white">
              <h3 className="font-display text-3xl">{category.name}</h3>
              <p className="mt-1 text-sm text-sky-50/90">{category.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
