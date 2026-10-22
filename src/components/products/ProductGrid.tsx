import { ProductCard } from "@/components/products/ProductCard";
import { EmptyState } from "@/components/ui/EmptyState";
import { ButtonLink } from "@/components/ui/Button";
import type { Product } from "@/types";

export function ProductGrid({ products }: { products: Product[] }) {
  if (!products.length) {
    return (
      <EmptyState
        title="No pieces match"
        description="Try clearing filters or searching a different style."
        action={
          <ButtonLink href="/products" variant="secondary">
            View all products
          </ButtonLink>
        }
      />
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
