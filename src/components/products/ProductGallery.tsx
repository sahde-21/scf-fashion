"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import {
  getGalleryImages,
  getProductViews,
  hasFrontBackPair,
} from "@/lib/product-images";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

type ViewMode = "front" | "back" | "gallery";

export function ProductGallery({
  product,
  colorId,
}: {
  product: Product;
  colorId?: string;
}) {
  const gallery = useMemo(
    () => getGalleryImages(product, colorId),
    [product, colorId],
  );
  const views = useMemo(
    () => getProductViews(product, colorId),
    [product, colorId],
  );
  const showFrontBack = hasFrontBackPair(product, colorId);

  const [mode, setMode] = useState<ViewMode>(
    showFrontBack ? "front" : "gallery",
  );
  const [active, setActive] = useState(0);

  useEffect(() => {
    setActive(0);
    setMode(hasFrontBackPair(product, colorId) ? "front" : "gallery");
  }, [product.id, colorId, product]);

  const current = useMemo(() => {
    if (showFrontBack && mode === "front") return views.front ?? gallery[0];
    if (showFrontBack && mode === "back") return views.back ?? gallery[0];
    return gallery[active] ?? gallery[0];
  }, [showFrontBack, mode, views, gallery, active]);

  if (!current) {
    return (
      <div className="flex aspect-[3/4] items-center justify-center bg-[var(--surface)] text-sm text-neutral-500">
        No image available
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative aspect-[3/4] overflow-hidden bg-[var(--surface)]">
        <Image
          src={current}
          alt={`${product.name}${
            showFrontBack && mode !== "gallery"
              ? ` — ${mode} view`
              : gallery.length > 1
                ? ` — view ${active + 1}`
                : ""
          }`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 55vw"
          className="object-cover animate-image-swap"
          key={current}
        />
      </div>

      {showFrontBack ? (
        <div
          className="flex items-center justify-center gap-2"
          role="group"
          aria-label="Product view"
        >
          {(["front", "back"] as const).map((view) => (
            <button
              key={view}
              type="button"
              aria-pressed={mode === view}
              onClick={() => setMode(view)}
              className={cn(
                "min-w-[5.5rem] border px-4 py-2 text-[11px] font-medium uppercase tracking-[0.18em] transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900",
                mode === view
                  ? "border-neutral-900 bg-neutral-900 text-white"
                  : "border-neutral-200 text-neutral-600 hover:border-neutral-400",
              )}
            >
              {view}
            </button>
          ))}
        </div>
      ) : null}

      {gallery.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {gallery.map((src, index) => {
            const isFront = showFrontBack && src === views.front;
            const isBack = showFrontBack && src === views.back;
            const selected =
              showFrontBack && mode !== "gallery"
                ? (mode === "front" && isFront) || (mode === "back" && isBack)
                : active === index;

            return (
              <button
                key={src + index}
                type="button"
                onClick={() => {
                  if (isFront) setMode("front");
                  else if (isBack) setMode("back");
                  else {
                    setMode("gallery");
                    setActive(index);
                  }
                }}
                aria-label={
                  isFront
                    ? "Show front view"
                    : isBack
                      ? "Show back view"
                      : `Show image ${index + 1}`
                }
                aria-pressed={selected}
                className={cn(
                  "relative h-[4.5rem] w-14 shrink-0 overflow-hidden border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 sm:h-24 sm:w-[4.5rem]",
                  selected
                    ? "border-neutral-900"
                    : "border-transparent opacity-70 hover:opacity-100",
                )}
              >
                <Image src={src} alt="" fill className="object-cover" sizes="72px" />
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
