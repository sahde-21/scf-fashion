export function LoadingBlock({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      className="flex min-h-[40vh] flex-col items-center justify-center gap-3"
      role="status"
      aria-live="polite"
    >
      <div className="h-8 w-8 animate-spin rounded-full border border-neutral-200 border-t-neutral-900" />
      <p className="text-[11px] uppercase tracking-[0.16em] text-neutral-500">
        {label}
      </p>
    </div>
  );
}
