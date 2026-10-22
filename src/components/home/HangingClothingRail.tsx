"use client";

import Image from "next/image";
import Link from "next/link";
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent as ReactPointerEvent,
} from "react";
import { ButtonLink } from "@/components/ui/Button";
import { LoadingBlock } from "@/components/ui/LoadingBlock";
import { Price } from "@/components/ui/Price";
import { useCatalog } from "@/context/CatalogContext";
import { getPrimaryImage } from "@/lib/product-images";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

function pickRailProducts(products: Product[]): Product[] {
  const apparel = products.filter(
    (p) => p.category === "women" || p.category === "men",
  );
  const featured = apparel.filter((p) => p.featured || p.newArrival || p.popular);
  const pool = featured.length >= 4 ? featured : apparel;
  return pool.slice(0, 7);
}

function HangerIcon({ active }: { active?: boolean }) {
  return (
    <svg
      viewBox="0 0 64 36"
      className={cn(
        "h-5 w-10 transition duration-500 sm:h-6 sm:w-12",
        active ? "text-neutral-900" : "text-neutral-400",
      )}
      aria-hidden
    >
      <path
        d="M32 4c-2.2 0-4 1.6-4 3.6 0 1.2.6 2.2 1.5 2.9L18 18.5c-.8.6-.3 1.9.7 1.9h26.6c1 0 1.5-1.3.7-1.9L34.5 10.5c.9-.7 1.5-1.7 1.5-2.9C36 5.6 34.2 4 32 4z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M12 22.5h40"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function HangingClothingRail() {
  const { publishedProducts, hydrated } = useCatalog();
  const products = useMemo(
    () => pickRailProducts(publishedProducts),
    [publishedProducts],
  );
  const [index, setIndex] = useState(0);
  const labelId = useId();
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    if (index >= products.length) setIndex(0);
  }, [index, products.length]);

  const selected = products[index] ?? null;

  const go = useCallback(
    (next: number) => {
      if (!products.length) return;
      const len = products.length;
      setIndex(((next % len) + len) % len);
    },
    [products.length],
  );

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      go(index - 1);
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      go(index + 1);
    }
  };

  const onPointerDown = (e: ReactPointerEvent) => {
    touchStartX.current = e.clientX;
  };

  const onPointerUp = (e: ReactPointerEvent) => {
    if (touchStartX.current == null) return;
    const delta = e.clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < 40) return;
    go(delta < 0 ? index + 1 : index - 1);
  };

  if (!hydrated) return <LoadingBlock label="Loading the rail…" />;

  if (!products.length) {
    return (
      <section className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6">
        <p className="text-sm text-neutral-500">No garments on the rail yet.</p>
        <div className="mt-6">
          <ButtonLink href="/products">Browse catalog</ButtonLink>
        </div>
      </section>
    );
  }

  return (
    <section
      className="relative overflow-x-clip border-b border-neutral-200 bg-[var(--surface)]"
      aria-labelledby={labelId}
    >
      <div className="mx-auto max-w-6xl px-4 pt-10 sm:px-6 sm:pt-14">
        <p className="text-center text-[11px] font-medium uppercase tracking-[0.22em] text-neutral-400 animate-fade-up">
          On the rail
        </p>
        <h1
          id={labelId}
          className="mt-3 text-center font-display text-4xl tracking-[0.06em] text-neutral-900 sm:text-5xl md:text-6xl animate-fade-up-delay"
        >
          SCF Fashion
        </h1>
        <p className="mx-auto mt-4 max-w-md text-center text-sm leading-relaxed text-neutral-500 animate-fade-up-delay-2">
          Tap a piece on the rail. See availability, colors, and sizes — then
          order on WhatsApp.
        </p>
      </div>

      <div
        className="relative mx-auto mt-8 max-w-6xl px-2 pb-4 sm:mt-10 sm:px-6"
        tabIndex={0}
        role="listbox"
        aria-label="Hanging garments"
        aria-activedescendant={selected ? `rail-item-${selected.id}` : undefined}
        onKeyDown={onKeyDown}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
      >
        {/* Horizontal rail */}
        <div className="relative mx-4 sm:mx-8">
          <div
            className="absolute left-0 right-0 top-[1.35rem] h-px bg-neutral-800 sm:top-[1.55rem]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -left-1 top-[1.15rem] h-2.5 w-2.5 rounded-full bg-neutral-800 sm:top-[1.35rem]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-1 top-[1.15rem] h-2.5 w-2.5 rounded-full bg-neutral-800 sm:top-[1.35rem]"
            aria-hidden
          />

          <div className="flex items-start justify-center gap-1 sm:gap-3 md:gap-5">
            {products.map((product, i) => {
              const active = i === index;
              const src = getPrimaryImage(product) || product.images[0];
              const offset = i - index;
              return (
                <button
                  key={product.id}
                  id={`rail-item-${product.id}`}
                  type="button"
                  role="option"
                  aria-selected={active}
                  aria-label={`${product.name}${active ? ", selected" : ""}`}
                  onClick={() => setIndex(i)}
                  className={cn(
                    "group relative flex w-[18%] min-w-[4.5rem] max-w-[7.5rem] flex-col items-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 sm:min-w-[5.5rem] sm:max-w-[9rem] md:w-[14%]",
                    "transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    active
                      ? "z-10 scale-110 opacity-100"
                      : "scale-95 opacity-55 hover:opacity-85",
                  )}
                  style={{
                    transform: active
                      ? "translateY(0) scale(1.12)"
                      : `translateY(${Math.min(Math.abs(offset) * 4, 12)}px) scale(0.92)`,
                  }}
                >
                  <HangerIcon active={active} />
                  <div
                    className={cn(
                      "relative mt-1 aspect-[3/4] w-full overflow-hidden bg-white shadow-[0_1px_0_rgba(0,0,0,0.04)]",
                      active && "ring-1 ring-neutral-900",
                    )}
                  >
                    {src ? (
                      <Image
                        src={src}
                        alt=""
                        fill
                        sizes="(max-width: 640px) 20vw, 140px"
                        className="object-cover object-top"
                        priority={i < 3}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center px-2 text-center text-[10px] uppercase tracking-wider text-neutral-400">
                        No image
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-6">
          <button
            type="button"
            onClick={() => go(index - 1)}
            className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-500 transition hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
            aria-label="Previous garment"
          >
            Prev
          </button>
          <span className="text-[11px] tabular-nums tracking-[0.16em] text-neutral-400">
            {index + 1} / {products.length}
          </span>
          <button
            type="button"
            onClick={() => go(index + 1)}
            className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-500 transition hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900"
            aria-label="Next garment"
          >
            Next
          </button>
        </div>
      </div>

      {selected ? (
        <div
          key={selected.id}
          className="mx-auto max-w-lg px-4 pb-14 pt-6 text-center animate-fade-up sm:px-6"
        >
          <p className="text-[10px] font-medium uppercase tracking-[0.2em] text-neutral-400">
            {selected.category}
            {!selected.inStock ? " · Sold out" : ""}
          </p>
          <h2 className="mt-2 font-display text-3xl tracking-[0.03em] text-neutral-900 sm:text-4xl">
            {selected.name}
          </h2>
          <div className="mt-3 flex justify-center">
            <Price usd={selected.priceUsd} compact />
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink href={`/products/${selected.slug}`} size="lg">
              See availability
            </ButtonLink>
            <Link
              href="/products"
              className="text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-500 transition hover:text-neutral-900"
            >
              Full catalog
            </Link>
          </div>
        </div>
      ) : null}
    </section>
  );
}
