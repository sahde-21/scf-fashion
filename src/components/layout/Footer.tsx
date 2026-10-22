import Link from "next/link";
import { CATEGORIES, CURRENCY_NOTE, STORE_NAME } from "@/lib/config";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-neutral-200 bg-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl tracking-[0.04em] text-neutral-900">
            {STORE_NAME}
          </p>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-neutral-500">
            Editorial essentials with calm sky accents. Browse locally, then
            confirm your order on WhatsApp.
          </p>
        </div>

        <div>
          <h2 className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-900">
            Shop
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm text-neutral-500">
            <li>
              <Link className="transition hover:text-neutral-900" href="/products">
                All products
              </Link>
            </li>
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <Link
                  className="transition hover:text-neutral-900"
                  href={`/products?category=${c.id}`}
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-900">
            Help
          </h2>
          <ul className="mt-4 space-y-2.5 text-sm text-neutral-500">
            <li>
              <Link className="transition hover:text-neutral-900" href="/cart">
                Cart
              </Link>
            </li>
            <li>
              <Link className="transition hover:text-neutral-900" href="/checkout">
                WhatsApp checkout
              </Link>
            </li>
            <li>
              <Link className="transition hover:text-neutral-900" href="/admin">
                Local admin
              </Link>
            </li>
          </ul>
          <p className="mt-6 text-xs leading-relaxed text-neutral-400">
            {CURRENCY_NOTE}
          </p>
        </div>
      </div>
      <div className="border-t border-neutral-200 py-4 text-center text-[11px] uppercase tracking-[0.14em] text-neutral-400">
        © {new Date().getFullYear()} {STORE_NAME}
      </div>
    </footer>
  );
}
