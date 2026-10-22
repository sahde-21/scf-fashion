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
        "inline-flex items-center px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-[0.14em]",
        tone === "sky" && "bg-white/90 text-neutral-800",
        tone === "slate" && "bg-neutral-100 text-neutral-700",
        tone === "rose" && "bg-white/90 text-rose-700",
      )}
    >
      {children}
    </span>
  );
}
