"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function ProductGallery({
  images,
  name,
}: {
  images: string[];
  name: string;
}) {
  const [active, setActive] = useState(0);
  const current = images[active] ?? images[0];

  if (!current) {
    return (
      <div className="flex aspect-[3/4] items-center justify-center bg-[var(--surface)] text-sm text-neutral-500">
        No image available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-[3/4] overflow-hidden bg-[var(--surface)]">
        <Image
          src={current}
          alt={`${name} — view ${active + 1}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 55vw"
          className="object-cover animate-image-swap"
          key={current}
        />
      </div>
      {images.length > 1 ? (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((src, index) => (
            <button
              key={src + index}
              type="button"
              onClick={() => setActive(index)}
              aria-label={`Show ${index === 0 ? "front" : index === 1 ? "alternate" : `image ${index + 1}`} view`}
              aria-pressed={active === index}
              className={cn(
                "relative h-[4.5rem] w-14 shrink-0 overflow-hidden border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sky)] sm:h-24 sm:w-[4.5rem]",
                active === index
                  ? "border-neutral-900"
                  : "border-transparent opacity-70 hover:opacity-100",
              )}
            >
              <Image src={src} alt="" fill className="object-cover" sizes="72px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
