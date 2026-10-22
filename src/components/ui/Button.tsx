import Link from "next/link";
import { cn } from "@/lib/utils";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

const variantClass: Record<Variant, string> = {
  primary: "bg-neutral-900 text-white hover:bg-neutral-800",
  secondary:
    "bg-transparent text-neutral-900 border border-neutral-900 hover:bg-neutral-900 hover:text-white",
  ghost: "bg-transparent text-neutral-700 hover:text-neutral-900",
  danger: "bg-rose-700 text-white hover:bg-rose-800",
};

const sizeClass: Record<Size, string> = {
  sm: "px-3 py-1.5 text-xs tracking-[0.12em] uppercase",
  md: "px-5 py-2.5 text-xs tracking-[0.14em] uppercase",
  lg: "px-7 py-3.5 text-xs tracking-[0.16em] uppercase",
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
        "inline-flex items-center justify-center gap-2 rounded-none font-medium transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-45 active:scale-[0.98]",
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
    "inline-flex items-center justify-center gap-2 rounded-none font-medium transition duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-900 focus-visible:ring-offset-2 active:scale-[0.98]",
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
