import Link from "next/link";
import { CATEGORIES, CURRENCY_NOTE, STORE_NAME } from "@/lib/config";

export function Footer() {
  return (
    <footer className="mt-auto border-t border-sky-100 bg-gradient-to-b from-white to-sky-50">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:px-6 md:grid-cols-3">
        <div>
          <p className="font-display text-2xl text-slate-900">{STORE_NAME}</p>
          <p className="mt-3 max-w-sm text-sm leading-relaxed text-slate-600">
            Modern fashion with a calm sky-blue palette. Browse, bag your looks,
            and send orders on WhatsApp — no card payments on this demo storefront.
          </p>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-900">
            Shop
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li>
              <Link className="hover:text-sky-700" href="/products">
                All products
              </Link>
            </li>
            {CATEGORIES.map((c) => (
              <li key={c.id}>
                <Link
                  className="hover:text-sky-700"
                  href={`/products?category=${c.id}`}
                >
                  {c.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-900">
            Good to know
          </h2>
          <ul className="mt-4 space-y-2 text-sm text-slate-600">
            <li>
              <Link className="hover:text-sky-700" href="/cart">
                Cart
              </Link>
            </li>
            <li>
              <Link className="hover:text-sky-700" href="/checkout">
                Checkout via WhatsApp
              </Link>
            </li>
            <li>
              <Link className="hover:text-sky-700" href="/admin">
                Local admin (demo)
              </Link>
            </li>
          </ul>
          <p className="mt-6 text-xs leading-relaxed text-slate-500">
            {CURRENCY_NOTE}
          </p>
        </div>
      </div>
      <div className="border-t border-sky-100/80 py-4 text-center text-xs text-slate-500">
        © {new Date().getFullYear()} {STORE_NAME}. Local demo storefront — not a
        production payments platform.
      </div>
    </footer>
  );
}
