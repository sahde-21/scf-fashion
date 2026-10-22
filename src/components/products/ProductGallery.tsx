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
      <div className="flex aspect-[4/5] items-center justify-center bg-sky-50 text-sm text-slate-500">
        No image available
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-[4/5] overflow-hidden bg-sky-50">
        <Image
          src={current}
          alt={`${name} — image ${active + 1}`}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover animate-fade-in"
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
              aria-label={`Show image ${index + 1}`}
              aria-pressed={active === index}
              className={cn(
                "relative h-20 w-16 shrink-0 overflow-hidden border transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400",
                active === index ? "border-sky-500" : "border-transparent opacity-80 hover:opacity-100",
              )}
            >
              <Image src={src} alt="" fill className="object-cover" sizes="64px" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
