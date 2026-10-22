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
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-medium",
        tone === "sky" && "bg-sky-100 text-sky-800",
        tone === "slate" && "bg-slate-100 text-slate-700",
        tone === "rose" && "bg-rose-100 text-rose-700",
      )}
    >
      {children}
    </span>
  );
}
