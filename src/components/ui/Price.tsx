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
    <span className={cn("inline-flex flex-col gap-0.5", className)}>
      <span className="font-medium text-slate-900">{formatUsd(usd)}</span>
      <span className={cn("text-slate-500", compact ? "text-xs" : "text-sm")}>
        {formatIqd(usd)}
      </span>
    </span>
  );
}
