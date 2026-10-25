import { cn } from "@/lib/utils";

export function Badge({
  children,
  tone = "sky",
}: {
  children: React.ReactNode;
  tone?: "sky" | "slate" | "rose";
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 text-[0.6rem] font-medium uppercase tracking-[0.16em]",
        tone === "sky" && "bg-[var(--background)]/92 text-[var(--ink)]",
        tone === "slate" && "bg-[var(--surface-deep)] text-[var(--muted)]",
        tone === "rose" && "bg-[var(--background)]/92 text-rose-800",
      )}
    >
      {children}
    </span>
  );
}
