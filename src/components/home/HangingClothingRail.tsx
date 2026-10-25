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
import { ImagePlaceholder } from "@/components/ui/ImagePlaceholder";
import { LoadingBlock } from "@/components/ui/LoadingBlock";
import { Price } from "@/components/ui/Price";
import { Reveal } from "@/components/ui/Reveal";
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
      viewBox="0 0 72 40"
      className={cn(
        "h-6 w-12 transition duration-500 sm:h-7 sm:w-14",
        active ? "text-neutral-900" : "text-neutral-400",
      )}
      aria-hidden
    >
      <path
        d="M36 5c-2.4 0-4.4 1.8-4.4 4 0 1.3.7 2.4 1.7 3.1L20 21.2c-.9.7-.3 2.1.8 2.1h30.4c1.1 0 1.7-1.4.8-2.1L38.7 12.1c1-.7 1.7-1.8 1.7-3.1C40.4 6.8 38.4 5 36 5z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <path
        d="M14 25.5h44"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
      />
      <circle cx="36" cy="9" r="1.6" fill="currentColor" />
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
  const [dragOffset, setDragOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const reduceMotion = useRef(false);
  const labelId = useId();
  const touchStartX = useRef<number | null>(null);

  useEffect(() => {
    reduceMotion.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
  }, []);
  /**
   * After a horizontal swipe, the browser still fires click on the garment
   * under the pointer. Suppress that click so swipe navigation is not undone.
   */
  const suppressGarmentClick = useRef(false);
  const goByRef = useRef<(delta: number) => void>(() => {});

  useEffect(() => {
    if (index >= products.length) setIndex(0);
  }, [index, products.length]);

  const selected = products[index] ?? null;

  const goBy = useCallback(
    (delta: number) => {
      setIndex((current) => {
        const len = products.length;
        if (!len) return 0;
        return ((current + delta) % len + len) % len;
      });
    },
    [products.length],
  );

  goByRef.current = goBy;

  const goTo = useCallback(
    (next: number) => {
      const len = products.length;
      if (!len) {
        setIndex(0);
        return;
      }
      setIndex(((next % len) + len) % len);
    },
    [products.length],
  );

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") {
      e.preventDefault();
      goBy(-1);
    }
    if (e.key === "ArrowRight") {
      e.preventDefault();
      goBy(1);
    }
  };

  const onPointerDown = (e: ReactPointerEvent) => {
    if (e.pointerType === "mouse" && e.button !== 0) return;
    const startX = e.clientX;
    touchStartX.current = startX;
    suppressGarmentClick.current = false;
    setIsDragging(true);
    setDragOffset(0);

    const onMove = (ev: PointerEvent) => {
      if (touchStartX.current == null) return;
      const delta = ev.clientX - startX;
      if (reduceMotion.current) return;
      // Cap visual drag so garments do not fly off-screen
      setDragOffset(Math.max(-72, Math.min(72, delta * 0.45)));
    };

    const finish = (ev: PointerEvent) => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", cancel);
      if (touchStartX.current == null) return;
      const delta = ev.clientX - startX;
      touchStartX.current = null;
      setIsDragging(false);
      setDragOffset(0);
      if (Math.abs(delta) < 40) return;
      suppressGarmentClick.current = true;
      goByRef.current(delta < 0 ? 1 : -1);
    };

    const cancel = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", finish);
      window.removeEventListener("pointercancel", cancel);
      touchStartX.current = null;
      setIsDragging(false);
      setDragOffset(0);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", finish);
    window.addEventListener("pointercancel", cancel);
  };

  const selectGarment = (i: number) => {
    if (suppressGarmentClick.current) {
      suppressGarmentClick.current = false;
      return;
    }
    goTo(i);
  };

  if (!hydrated) return <LoadingBlock label="Loading the rail…" />;

  if (!products.length) {
    return (
      <section
        id="hanging-rail"
        className="mx-auto max-w-6xl px-4 py-20 text-center sm:px-6"
      >
        <p className="text-sm text-neutral-500">No garments on the rail yet.</p>
        <div className="mt-6">
          <ButtonLink href="/products">Browse catalog</ButtonLink>
        </div>
      </section>
    );
  }

  return (
    <section
      id="hanging-rail"
      className="relative overflow-x-clip border-b border-[var(--line)] surface-wash"
      aria-labelledby={labelId}
    >
      <div className="mx-auto max-w-6xl px-4 pt-16 sm:px-6 sm:pt-24">
        <Reveal>
          <div className="mx-auto mb-5 h-px w-10 bg-[var(--gold)] opacity-70" />
          <p className="text-center text-[0.65rem] font-medium uppercase tracking-[0.24em] text-[var(--muted)]">
            Atelier rail
          </p>
          <h2
            id={labelId}
            className="mt-3 text-center font-display text-3xl font-medium tracking-[0.02em] text-[var(--ink)] sm:text-4xl md:text-[2.75rem]"
          >
            On the rail
          </h2>
          <p className="mx-auto mt-4 max-w-md text-center text-sm font-light leading-relaxed text-[var(--muted)]">
            Drag, swipe, or use the arrows. Select a piece to review colors,
            sizes, and availability.
          </p>
        </Reveal>
      </div>

      <div
        className="relative mx-auto mt-10 max-w-6xl px-2 pb-2 sm:mt-14 sm:px-6"
        tabIndex={0}
        role="listbox"
        aria-label="Hanging garments"
        aria-activedescendant={selected ? `rail-item-${selected.id}` : undefined}
        onKeyDown={onKeyDown}
      >
        <div
          className="relative mx-3 touch-pan-y sm:mx-8"
          onPointerDown={onPointerDown}
          onDragStart={(e) => e.preventDefault()}
        >
          {/* Rail bar */}
          <div
            className="absolute left-0 right-0 top-[1.55rem] h-px bg-[var(--ink)]/80 sm:top-[1.75rem]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -left-1 top-[1.35rem] h-2 w-2 rounded-full border border-[var(--ink)] bg-[var(--background)] sm:top-[1.55rem]"
            aria-hidden
          />
          <div
            className="pointer-events-none absolute -right-1 top-[1.35rem] h-2 w-2 rounded-full border border-[var(--ink)] bg-[var(--background)] sm:top-[1.55rem]"
            aria-hidden
          />

          <div
            className={cn(
              "flex items-start justify-center gap-0.5 sm:gap-2 md:gap-4",
              !isDragging &&
                "transition-transform duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
            )}
            style={{ transform: `translateX(${dragOffset}px)` }}
          >
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
                  onClick={() => selectGarment(i)}
                  className={cn(
                    "group relative flex w-[18%] min-w-[4.75rem] max-w-[8rem] flex-col items-center select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 sm:min-w-[5.75rem] sm:max-w-[9.5rem] md:w-[13%]",
                    "transition-[transform,opacity] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]",
                    active
                      ? "z-10 opacity-100"
                      : "opacity-50 hover:opacity-80",
                  )}
                  style={{
                    transform: active
                      ? "translateY(0) scale(1.14)"
                      : `translateY(${Math.min(Math.abs(offset) * 5, 14)}px) scale(0.9)`,
                  }}
                >
                  <div className={cn(active && "animate-rail-sway")}>
                    <HangerIcon active={active} />
                    <div
                      className={cn(
                        "relative mt-0.5 aspect-[3/4] w-full overflow-hidden bg-[var(--background)]",
                        "shadow-[0_18px_36px_-20px_rgba(20,18,16,0.35)]",
                        active && "ring-1 ring-[var(--ink)]",
                      )}
                    >
                      {src ? (
                        <Image
                          src={src}
                          alt=""
                          fill
                          draggable={false}
                          sizes="(max-width: 640px) 22vw, 150px"
                          className="pointer-events-none object-cover object-top"
                          priority={i < 3}
                        />
                      ) : (
                        <ImagePlaceholder label="Soon" />
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        <div className="relative z-20 mt-10 flex items-center justify-center gap-10 pb-4">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goBy(-1);
            }}
            className="min-h-12 min-w-[4.5rem] text-[0.65rem] font-medium uppercase tracking-[0.2em] text-[var(--muted)] transition hover:text-[var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)]"
            aria-label="Previous garment"
          >
            Prev
          </button>
          <span
            className="text-[0.65rem] tabular-nums tracking-[0.18em] text-[var(--muted)]"
            aria-live="polite"
            data-testid="rail-counter"
          >
            {String(index + 1).padStart(2, "0")} /{" "}
            {String(products.length).padStart(2, "0")}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              goBy(1);
            }}
            className="min-h-12 min-w-[4.5rem] text-[0.65rem] font-medium uppercase tracking-[0.2em] text-[var(--muted)] transition hover:text-[var(--ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)]"
            aria-label="Next garment"
          >
            Next
          </button>
        </div>
      </div>

      {selected ? (
        <div
          key={selected.id}
          className="relative z-20 mx-auto max-w-lg px-4 pb-20 pt-10 text-center animate-fade-up sm:px-6"
        >
          <div className="mx-auto mb-6 h-px w-10 bg-[var(--gold)] opacity-70" />
          <p className="text-[0.6rem] font-medium uppercase tracking-[0.22em] text-[var(--muted)]">
            {selected.category}
            {!selected.inStock ? " · Sold out" : ""}
          </p>
          <h3 className="mt-2 font-display text-3xl font-medium tracking-[0.02em] text-[var(--ink)] sm:text-4xl">
            {selected.name}
          </h3>
          <div className="mt-3 flex justify-center">
            <Price usd={selected.priceUsd} compact />
          </div>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <ButtonLink
              href={`/products/${selected.slug}`}
              size="lg"
              className="min-h-12"
            >
              See availability
            </ButtonLink>
            <Link
              href="/products"
              className="px-2 text-[0.65rem] font-medium uppercase tracking-[0.18em] text-[var(--muted)] transition hover:text-[var(--ink)]"
            >
              Full catalog
            </Link>
          </div>
        </div>
      ) : null}
    </section>
  );
}
