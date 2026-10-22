export function LoadingBlock({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      className="flex min-h-[40vh] flex-col items-center justify-center gap-3"
      role="status"
      aria-live="polite"
    >
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-sky-200 border-t-sky-500" />
      <p className="text-sm text-slate-600">{label}</p>
    </div>
  );
}
