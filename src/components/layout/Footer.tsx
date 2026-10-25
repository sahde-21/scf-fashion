import Link from "next/link";
import { CATEGORIES, CURRENCY_NOTE, STORE_NAME } from "@/lib/config";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[var(--line)] bg-[var(--surface)]">
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-4 md:py-20">
        <div className="md:col-span-1">
          <p className="font-display text-2xl font-medium tracking-[0.02em] text-[var(--ink)]">
            {STORE_NAME}
          </p>
          <p className="mt-4 max-w-sm text-sm font-light leading-relaxed text-[var(--muted)]">
            Quiet luxury fashion with an editorial hanging-rail browse. Confirm
            orders on WhatsApp — this demo does not process card payments.
          </p>
        </div>

        <div>
          <h2 className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-[var(--ink)]">
            Shop
          </h2>
          <ul className="mt-5 space-y-2.5 text-sm font-light text-[var(--muted)]">
            <li>
              <Link className="transition hover:text-[var(--ink)]" href="/products">
                All products
              </Link>
            </li>
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <Link
                  className="transition hover:text-[var(--ink)]"
                  href={`/products?category=${c.id}`}
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-[var(--ink)]">
            Help
          </h2>
          <ul className="mt-5 space-y-2.5 text-sm font-light text-[var(--muted)]">
            <li>
              <Link className="transition hover:text-[var(--ink)]" href="/about">
                About
              </Link>
            </li>
            <li>
              <Link className="transition hover:text-[var(--ink)]" href="/contact">
                Contact
              </Link>
            </li>
            <li>
              <Link className="transition hover:text-[var(--ink)]" href="/cart">
                Cart
              </Link>
            </li>
            <li>
              <Link className="transition hover:text-[var(--ink)]" href="/checkout">
                WhatsApp checkout
              </Link>
            </li>
            <li>
              <Link className="transition hover:text-[var(--ink)]" href="/admin">
                Local admin
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h2 className="text-[0.65rem] font-medium uppercase tracking-[0.2em] text-[var(--ink)]">
            Policies
          </h2>
          <ul className="mt-5 space-y-2.5 text-sm font-light text-[var(--muted)]">
            <li>
              <Link className="transition hover:text-[var(--ink)]" href="/delivery">
                Delivery
              </Link>
            </li>
            <li>
              <Link className="transition hover:text-[var(--ink)]" href="/returns">
                Returns
              </Link>
            </li>
            <li>
              <Link className="transition hover:text-[var(--ink)]" href="/privacy">
                Privacy
              </Link>
            </li>
          </ul>
          <p className="mt-6 text-xs font-light leading-relaxed text-[var(--muted)]">
            {CURRENCY_NOTE}
          </p>
        </div>
      </div>
      <div className="border-t border-[var(--line)] py-4 text-center text-[0.6rem] uppercase tracking-[0.18em] text-[var(--muted)]">
        © {new Date().getFullYear()} {STORE_NAME}
      </div>
    </footer>
  );
}
