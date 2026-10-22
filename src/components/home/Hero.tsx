import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { STORE_NAME } from "@/lib/config";

export function Hero() {
  return (
    <section className="relative isolate min-h-[78vh] overflow-hidden bg-neutral-200 text-white sm:min-h-[86vh]">
      <Image
        src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=2000&q=80"
        alt="Editorial fashion portrait for SCF Fashion"
        fill
        priority
        className="object-cover object-[center_18%] scale-[1.02] animate-fade-in"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/15 to-black/10" />

      <div className="relative mx-auto flex min-h-[78vh] max-w-6xl flex-col justify-end px-4 pb-14 pt-24 sm:min-h-[86vh] sm:px-6 sm:pb-20">
        <p className="font-display text-5xl leading-[0.95] tracking-[0.02em] sm:text-7xl md:text-[5.5rem] animate-fade-up">
          {STORE_NAME}
        </p>
        <h1 className="mt-4 max-w-md text-sm font-normal leading-relaxed text-white/90 sm:text-base animate-fade-up-delay">
          Soft sky tones and polished essentials for the city.
        </h1>
        <div className="mt-8 flex flex-wrap items-center gap-4 animate-fade-up-delay-2">
          <ButtonLink href="/products" size="lg">
            Shop collection
          </ButtonLink>
          <ButtonLink
            href="/products?sort=newest"
            variant="ghost"
            size="lg"
            className="text-white hover:text-white/80"
          >
            New arrivals
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
