import { cn } from "@/lib/utils";

/** Clean, honest empty state when a verified product photo is missing. */
export function ImagePlaceholder({
  label = "Photo coming soon",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex h-full w-full flex-col items-center justify-center gap-3 bg-[var(--surface)] px-4 text-center",
        className,
      )}
      role="img"
      aria-label={label}
    >
      <span
        className="block h-px w-10 bg-[var(--gold)] opacity-55"
        aria-hidden
      />
      <span className="max-w-[9rem] text-[0.58rem] font-medium uppercase leading-relaxed tracking-[0.18em] text-[var(--muted)]">
        {label}
      </span>
      <span
        className="block h-px w-10 bg-[var(--gold)] opacity-55"
        aria-hidden
      />
    </div>
  );
}
