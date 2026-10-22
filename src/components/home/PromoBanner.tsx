import Image from "next/image";
import { ButtonLink } from "@/components/ui/Button";

export function PromoBanner() {
  return (
    <section className="relative isolate overflow-hidden">
      <div className="relative min-h-[420px]">
        <Image
          src="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?auto=format&fit=crop&w=2000&q=80"
          alt="Bright fashion boutique interior"
          fill
          className="object-cover"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-sky-950/55" />
        <div className="relative mx-auto flex min-h-[420px] max-w-6xl flex-col justify-center px-4 py-16 text-white sm:px-6">
          <h2 className="max-w-lg font-display text-4xl sm:text-5xl animate-fade-up">
            Order on WhatsApp in a few taps
          </h2>
          <p className="mt-4 max-w-md text-sky-50/95 animate-fade-up-delay">
            Build your bag, share your details, and send a ready-made order
            message. Opening WhatsApp does not deliver the order until you press
            Send.
          </p>
          <div className="mt-8 animate-fade-up-delay-2">
            <ButtonLink href="/checkout" size="lg">
              Start checkout
            </ButtonLink>
          </div>
        </div>
      </div>
    </section>
  );
}
