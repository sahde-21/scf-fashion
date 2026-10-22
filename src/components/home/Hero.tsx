import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";
import { STORE_NAME } from "@/lib/config";

export function Hero() {
  return (
    <section className="relative isolate min-h-[88vh] overflow-hidden bg-slate-900 text-white">
      <Image
        src="https://images.unsplash.com/photo-1469334031218-e382a71b716b?auto=format&fit=crop&w=2000&q=80"
        alt="Editorial fashion portrait for SCF Fashion"
        fill
        priority
        className="object-cover object-[center_20%] opacity-80"
        sizes="100vw"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-sky-950/35 to-white/10" />

      <div className="relative mx-auto flex min-h-[88vh] max-w-6xl flex-col justify-end px-4 pb-16 pt-28 sm:px-6 sm:pb-20">
        <p className="font-display text-5xl leading-none tracking-tight sm:text-7xl md:text-8xl animate-fade-up">
          {STORE_NAME}
        </p>
        <h1 className="mt-5 max-w-xl text-lg font-light text-sky-50/95 sm:text-2xl animate-fade-up-delay">
          Soft sky tones, polished essentials, and looks made for the city.
        </h1>
        <div className="mt-8 flex flex-wrap gap-3 animate-fade-up-delay-2">
          <ButtonLink href="/products" size="lg">
            Shop the collection
          </ButtonLink>
          <ButtonLink
            href="/products?sort=newest"
            variant="secondary"
            size="lg"
            className="border-white/40 bg-white/10 text-white hover:bg-white/20"
          >
            New arrivals
          </ButtonLink>
        </div>
      </div>
    </section>
  );
}
