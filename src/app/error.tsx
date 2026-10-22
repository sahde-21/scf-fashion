"use client";

import { Button } from "@/components/ui/Button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto flex min-h-[60vh] max-w-xl flex-col items-center justify-center px-4 py-20 text-center">
      <h1 className="font-display text-4xl text-slate-900">Something went wrong</h1>
      <p className="mt-3 text-slate-600">
        {error.message || "An unexpected error occurred while rendering this page."}
      </p>
      <Button type="button" className="mt-8" onClick={reset}>
        Try again
      </Button>
    </div>
  );
}
