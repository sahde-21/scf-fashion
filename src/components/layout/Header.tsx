"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { CATEGORIES, STORE_NAME } from "@/lib/config";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

const nav = [
  { href: "/", label: "Home" },
  { href: "/products", label: "Shop" },
  ...CATEGORIES.map((c) => ({
    href: `/products?category=${c.id}`,
    label: c.name,
  })),
];

export function Header() {
  const pathname = usePathname();
  const { itemCount, hydrated } = useCart();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b transition duration-300",
        scrolled
          ? "border-sky-100/80 bg-white/90 shadow-sm shadow-sky-100/40 backdrop-blur-md"
          : "border-transparent bg-white/70 backdrop-blur-sm",
      )}
    >
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="font-display text-2xl tracking-tight text-slate-900 transition hover:text-sky-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
        >
          {STORE_NAME}
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label="Primary">
          {nav.slice(0, 7).map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith("/products") &&
                  item.href.startsWith("/products");
            return (
              <Link
                key={item.href + item.label}
                href={item.href}
                className={cn(
                  "rounded-md px-3 py-2 text-sm font-medium transition",
                  active
                    ? "bg-sky-50 text-sky-700"
                    : "text-slate-600 hover:bg-sky-50 hover:text-sky-700",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-2">
          <Link
            href="/cart"
            className="relative rounded-md px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-sky-50 hover:text-sky-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            aria-label={
              hydrated ? `Cart, ${itemCount} items` : "Cart"
            }
          >
            Cart
            {hydrated && itemCount > 0 ? (
              <span className="absolute -right-0.5 -top-0.5 inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-sky-500 px-1 text-[11px] font-semibold text-white">
                {itemCount}
              </span>
            ) : null}
          </Link>

          <button
            type="button"
            className="inline-flex items-center justify-center rounded-md p-2 text-slate-700 hover:bg-sky-50 lg:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-400"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <span aria-hidden className="flex h-5 w-5 flex-col justify-center gap-1.5">
              <span
                className={cn(
                  "block h-0.5 w-5 bg-current transition",
                  open && "translate-y-2 rotate-45",
                )}
              />
              <span
                className={cn(
                  "block h-0.5 w-5 bg-current transition",
                  open && "opacity-0",
                )}
              />
              <span
                className={cn(
                  "block h-0.5 w-5 bg-current transition",
                  open && "-translate-y-2 -rotate-45",
                )}
              />
            </span>
          </button>
        </div>
      </div>

      <div
        id="mobile-nav"
        className={cn(
          "border-t border-sky-100 bg-white lg:hidden",
          open ? "block animate-fade-up" : "hidden",
        )}
      >
        <nav className="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-4" aria-label="Mobile">
          {nav.map((item) => (
            <Link
              key={item.href + item.label}
              href={item.href}
              className="rounded-md px-3 py-3 text-base font-medium text-slate-700 hover:bg-sky-50 hover:text-sky-700"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/checkout"
            className="mt-2 rounded-md bg-sky-500 px-3 py-3 text-center text-base font-medium text-white hover:bg-sky-600"
          >
            Checkout
          </Link>
        </nav>
      </div>
    </header>
  );
}
