"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type FormEvent } from "react";
import { CATEGORIES, STORE_NAME } from "@/lib/config";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

const primaryLinks = [
  { href: "/products", label: "Shop", category: null as string | null },
  ...CATEGORIES.map((c) => ({
    href: `/products?category=${c.id}`,
    label: c.name,
    category: c.id as string,
  })),
];

function HeaderInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { itemCount, hydrated } = useCart();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [scrolled, setScrolled] = useState(false);
  const activeCategory = searchParams.get("category");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 4);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setSearchOpen(false);
  }, [pathname, activeCategory]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const onSearch = (e: FormEvent) => {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/products?q=${encodeURIComponent(q)}` : "/products");
    setSearchOpen(false);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 border-b bg-white/95 backdrop-blur-sm transition-colors duration-200",
        scrolled ? "border-neutral-200" : "border-transparent",
      )}
    >
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-3 px-4 sm:h-16 sm:px-6">
        <div className="flex items-center gap-2 lg:hidden">
          <button
            type="button"
            className="inline-flex h-10 w-10 items-center justify-center text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sky)]"
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((v) => !v)}
          >
            <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
            <span aria-hidden className="flex h-4 w-5 flex-col justify-between">
              <span
                className={cn(
                  "block h-px w-full bg-current transition",
                  open && "translate-y-[7.5px] rotate-45",
                )}
              />
              <span
                className={cn(
                  "block h-px w-full bg-current transition",
                  open && "opacity-0",
                )}
              />
              <span
                className={cn(
                  "block h-px w-full bg-current transition",
                  open && "-translate-y-[7.5px] -rotate-45",
                )}
              />
            </span>
          </button>
        </div>

        <Link
          href="/"
          className="font-display text-[1.65rem] leading-none tracking-[0.04em] text-neutral-900 transition hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sky)] sm:text-[1.85rem]"
        >
          {STORE_NAME}
        </Link>

        <nav className="hidden items-center gap-6 lg:flex" aria-label="Primary">
          {primaryLinks.map((item) => {
            const isActive = item.category
              ? pathname.startsWith("/products") && activeCategory === item.category
              : pathname.startsWith("/products") && !activeCategory;
            return (
              <Link
                key={item.href + item.label}
                href={item.href}
                className={cn(
                  "text-[11px] font-medium uppercase tracking-[0.18em] text-neutral-500 transition hover:text-neutral-900",
                  isActive && "text-neutral-900",
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            className="inline-flex h-10 items-center px-2 text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-700 transition hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sky)]"
            aria-expanded={searchOpen}
            aria-controls="header-search"
          >
            Search
          </button>
          <Link
            href="/cart"
            className="relative inline-flex h-10 items-center px-2 text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-700 transition hover:text-neutral-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--sky)]"
            aria-label={hydrated ? `Cart, ${itemCount} items` : "Cart"}
          >
            Cart
            {hydrated && itemCount > 0 ? (
              <span className="ml-1 text-[var(--sky)]">({itemCount})</span>
            ) : null}
          </Link>
        </div>
      </div>

      {searchOpen ? (
        <div
          id="header-search"
          className="border-t border-neutral-200 bg-white animate-fade-in"
        >
          <form
            onSubmit={onSearch}
            className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6"
          >
            <label className="sr-only" htmlFor="nav-search">
              Search products
            </label>
            <input
              id="nav-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search the collection"
              className="editorial-input"
              autoFocus
            />
            <button
              type="submit"
              className="shrink-0 text-[11px] font-medium uppercase tracking-[0.16em] text-neutral-900 hover:text-[var(--sky)]"
            >
              Go
            </button>
          </form>
        </div>
      ) : null}

      <div
        id="mobile-nav"
        className={cn(
          "border-t border-neutral-200 bg-white lg:hidden",
          open ? "block animate-fade-in" : "hidden",
        )}
      >
        <nav
          className="mx-auto flex max-w-6xl flex-col px-4 py-2"
          aria-label="Mobile"
        >
          <Link
            href="/"
            className="border-b border-neutral-100 py-3.5 text-[12px] font-medium uppercase tracking-[0.16em] text-neutral-800"
          >
            Home
          </Link>
          {primaryLinks.map((item) => (
            <Link
              key={item.href + item.label}
              href={item.href}
              className="border-b border-neutral-100 py-3.5 text-[12px] font-medium uppercase tracking-[0.16em] text-neutral-800"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/checkout"
            className="py-3.5 text-[12px] font-medium uppercase tracking-[0.16em] text-neutral-800"
          >
            Checkout
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function Header() {
  return (
    <Suspense
      fallback={
        <header className="sticky top-0 z-50 h-14 border-b border-transparent bg-white sm:h-16" />
      }
    >
      <HeaderInner />
    </Suspense>
  );
}
