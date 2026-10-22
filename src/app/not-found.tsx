import { ButtonLink } from "@/components/ui/Button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-20 text-center">
      <p className="text-[11px] uppercase tracking-[0.18em] text-neutral-400">
        404
      </p>
      <h1 className="mt-3 font-display text-4xl tracking-[0.02em] text-neutral-900">
        Page not found
      </h1>
      <p className="mt-3 text-sm text-neutral-500">
        That link may be outdated, or the product is unpublished in this browser.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <ButtonLink href="/">Back home</ButtonLink>
        <ButtonLink href="/products" variant="secondary">
          Browse shop
        </ButtonLink>
      </div>
    </div>
  );
}
