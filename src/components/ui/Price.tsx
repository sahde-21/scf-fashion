import { formatIqd, formatUsd } from "@/lib/currency";
import { cn } from "@/lib/utils";

export function Price({
  usd,
  className,
  compact = false,
}: {
  usd: number;
  className?: string;
  compact?: boolean;
}) {
  return (
    <span
      className={cn(
        "inline-flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5",
        className,
      )}
    >
      <span
        className={cn(
          "font-medium tracking-wide text-[var(--ink)] tabular-nums",
          compact ? "text-[0.9rem]" : "text-base",
        )}
      >
        {formatUsd(usd)}
      </span>
      <span
        className={cn(
          "tracking-wide text-[var(--muted)] tabular-nums",
          compact ? "text-[0.72rem]" : "text-sm",
        )}
      >
        {formatIqd(usd)}
      </span>
    </span>
  );
}
