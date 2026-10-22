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
        "inline-flex flex-wrap items-baseline gap-x-2 gap-y-0.5",
        className,
      )}
    >
      <span
        className={cn(
          "font-medium tracking-wide text-neutral-900",
          compact ? "text-sm" : "text-base",
        )}
      >
        {formatUsd(usd)}
      </span>
      <span
        className={cn(
          "tracking-wide text-neutral-500",
          compact ? "text-xs" : "text-sm",
        )}
      >
        {formatIqd(usd)}
      </span>
    </span>
  );
}
