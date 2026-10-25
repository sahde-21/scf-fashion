import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant =
  | "primary"
  | "secondary"
  | "ghost"
  | "ghostLight"
  | "danger"
  | "inverse";
type Size = "sm" | "md" | "lg";

const variantClass: Record<Variant, string> = {
  primary:
    "bg-[var(--ink)] text-[var(--background)] hover:bg-[#2a2620] focus-visible:ring-[var(--ink)]",
  secondary:
    "bg-transparent text-[var(--ink)] border border-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--background)] focus-visible:ring-[var(--ink)]",
  ghost:
    "bg-transparent text-[var(--muted)] hover:text-[var(--ink)] focus-visible:ring-[var(--ink)]",
  ghostLight:
    "bg-transparent text-white hover:text-white focus-visible:ring-white focus-visible:ring-offset-[var(--ink)]",
  danger: "bg-rose-800 text-white hover:bg-rose-900",
  inverse:
    "bg-[var(--background)] text-[var(--ink)] hover:bg-white focus-visible:ring-white focus-visible:ring-offset-[var(--ink)]",
};

const sizeClass: Record<Size, string> = {
  sm: "px-3.5 py-1.5 text-[0.65rem] tracking-[0.16em] uppercase",
  md: "px-6 py-2.5 text-[0.68rem] tracking-[0.18em] uppercase",
  lg: "px-8 py-3.5 text-[0.7rem] tracking-[0.2em] uppercase",
};

type Common = {
  children: ReactNode;
  className?: string;
  variant?: Variant;
  size?: Size;
};

type ButtonProps = Common &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type LinkButtonProps = Common & {
  href: string;
  external?: boolean;
};

export function Button({
  children,
  className,
  variant = "primary",
  size = "md",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-none font-medium transition duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:cursor-not-allowed disabled:opacity-45",
        variantClass[variant],
        sizeClass[size],
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function ButtonLink({
  children,
  className,
  variant = "primary",
  size = "md",
  href,
  external,
}: LinkButtonProps) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-none font-medium transition duration-300 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ink)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)]",
    variantClass[variant],
    sizeClass[size],
    className,
  );

  if (external) {
    return (
      <a href={href} className={classes} target="_blank" rel="noreferrer">
        {children}
      </a>
    );
  }

  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
