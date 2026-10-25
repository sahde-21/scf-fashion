"use client";

import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState, type FormEvent } from "react";
import { CATEGORIES, STORE_NAME } from "@/lib/config";
import { cn } from "@/lib/utils";
import { useCart } from "@/context/CartContext";

const shopLinks = [
  { href: "/products", label: "Shop", category: null as string | null },
  ...CATEGORIES.map((c) => ({
    href: `/products?category=${c.id}`,
    label: c.name,
    category: c.id as string,
  })),
];

function BagIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.35"
      className={className}
      aria-hidden
    >
      <path d="M6.5 9h11l-.7 10.2a1.5 1.5 0 0 1-1.5 1.4H8.7a1.5 1.5 0 0 1-1.5-1.4L6.5 9Z" />
      <path d="M9 9V7.2A3 3 0 0 1 12 4.2 3 3 0 0 1 15 7.2V9" />
    </svg>
  );
}

function SearchIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.35"
      className={className}
      aria-hidden
    >
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16.2 16.2 3.3 3.3" />
    </svg>
  );
}

function HeaderInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { itemCount, hydrated } = useCart();
  const [open, setOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");
  const activeCategory = searchParams.get("category");

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
    <header className="sticky top-0 z-50 w-full border-b border-[var(--line)] bg-[var(--background)]/95 text-[var(--ink)] backdrop-blur-md">
      <div className="relative mx-auto flex h-[var(--header-h)] max-w-6xl items-center gap-3 px-4 sm:px-6">
        <button
          type="button"
          className="inline-flex h-11 w-11 shrink-0 items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)] lg:hidden"
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

        <Link
          href="/"
          className="font-display text-[1.45rem] font-medium leading-none tracking-[0.04em] transition hover:opacity-75 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)] sm:text-[1.7rem]"
        >
          {STORE_NAME}
        </Link>

        <nav
          className="absolute left-1/2 top-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:block"
          aria-label="Shop"
        >
          <ul className="flex items-center gap-6 xl:gap-8">
            {shopLinks.map((item) => {
              const isActive = item.category
                ? pathname.startsWith("/products") &&
                  activeCategory === item.category
                : pathname.startsWith("/products") && !activeCategory;
              return (
                <li key={item.href + item.label}>
                  <Link
                    href={item.href}
                    className={cn(
                      "text-[0.65rem] font-medium uppercase tracking-[0.2em] transition",
                      isActive
                        ? "text-[var(--ink)]"
                        : "text-[var(--muted)] hover:text-[var(--ink)]",
                    )}
                  >
                    {item.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-2">
          <button
            type="button"
            onClick={() => setSearchOpen((v) => !v)}
            className="inline-flex h-11 w-11 items-center justify-center text-[var(--ink)] transition hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)]"
            aria-expanded={searchOpen}
            aria-controls="header-search"
            aria-label="Search"
          >
            <SearchIcon className="h-[1.15rem] w-[1.15rem]" />
          </button>
          <Link
            href="/cart"
            className="relative inline-flex h-11 items-center gap-1.5 px-2 text-[var(--ink)] transition hover:opacity-70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)]"
            aria-label={hydrated ? `Bag, ${itemCount} items` : "Bag"}
          >
            <BagIcon className="h-[1.15rem] w-[1.15rem]" />
            {hydrated ? (
              <span className="min-w-[1.1rem] text-center text-[0.65rem] font-medium tabular-nums tracking-wide">
                {itemCount}
              </span>
            ) : null}
          </Link>
        </div>
      </div>

      {searchOpen ? (
        <div
          id="header-search"
          className="border-t border-[var(--line)] bg-[var(--background)] animate-fade-in"
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
              className="shrink-0 text-[11px] font-medium uppercase tracking-[0.18em] text-[var(--ink)] hover:opacity-70"
            >
              Go
            </button>
          </form>
        </div>
      ) : null}

      <div
        id="mobile-nav"
        className={cn(
          "border-t border-[var(--line)] bg-[var(--background)] lg:hidden",
          open ? "block animate-fade-in" : "hidden",
        )}
      >
        <nav
          className="mx-auto flex max-w-6xl flex-col px-4 py-2"
          aria-label="Mobile"
        >
          <Link
            href="/"
            className="border-b border-[var(--line)] py-3.5 text-[12px] font-medium uppercase tracking-[0.16em]"
          >
            Home
          </Link>
          <Link
            href="/about"
            className="border-b border-[var(--line)] py-3.5 text-[12px] font-medium uppercase tracking-[0.16em]"
          >
            About
          </Link>
          <Link
            href="/contact"
            className="border-b border-[var(--line)] py-3.5 text-[12px] font-medium uppercase tracking-[0.16em]"
          >
            Contact
          </Link>
          {shopLinks.map((item) => (
            <Link
              key={item.href + item.label}
              href={item.href}
              className="border-b border-[var(--line)] py-3.5 text-[12px] font-medium uppercase tracking-[0.16em]"
            >
              {item.label}
            </Link>
          ))}
          <Link
            href="/checkout"
            className="py-3.5 text-[12px] font-medium uppercase tracking-[0.16em]"
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
        <header className="sticky top-0 z-50 h-[var(--header-h)] border-b border-[var(--line)] bg-[var(--background)]" />
      }
    >
      <HeaderInner />
    </Suspense>
  );
}
