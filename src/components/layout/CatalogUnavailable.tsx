import { EmptyState } from "@/components/ui/EmptyState";

/**
 * Shown when USE_SERVER_CATALOG is on but the catalog cannot be loaded.
 * Does not fall back to seed data (avoids presenting stale inventory as live).
 */
export function CatalogUnavailable({ message }: { message: string }) {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 sm:py-24">
      <EmptyState
        title="Catalog unavailable"
        description={message}
      />
    </div>
  );
}
