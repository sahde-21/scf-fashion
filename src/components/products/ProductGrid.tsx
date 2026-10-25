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
    <div className="grid grid-cols-2 items-stretch gap-x-4 gap-y-10 sm:gap-x-6 sm:gap-y-12 md:grid-cols-3 lg:grid-cols-4 lg:gap-x-5 lg:gap-y-14">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}
