import type { ReactNode } from "react";

export function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center border border-dashed border-neutral-200 bg-[var(--surface)] px-6 py-20 text-center animate-fade-up">
      <h2 className="font-display text-3xl font-normal text-neutral-900">
        {title}
      </h2>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-neutral-500">
        {description}
      </p>
      {action ? <div className="mt-8">{action}</div> : null}
    </div>
  );
}
