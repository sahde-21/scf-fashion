import type { Metadata } from "next";
import { SEED_PRODUCTS } from "@/data/products";
import { ProductDetail } from "@/components/products/ProductDetail";
import { isServerCatalogEnabled } from "@/lib/catalog/catalog-flag";
import { STORE_NAME } from "@/lib/config";

type Props = { params: Promise<{ slug: string }> };

/**
 * Build-time params stay seed-based so `next build` does not require Neon.
 * Runtime routing still resolves any published slug from CatalogContext.
 */
export async function generateStaticParams() {
  return SEED_PRODUCTS.map((product) => ({ slug: product.slug }));
}

async function resolveMetadataProduct(slug: string) {
  if (!isServerCatalogEnabled()) {
    return SEED_PRODUCTS.find((p) => p.slug === slug && p.published);
  }

  // Dynamic import keeps server-catalog out of the default seed/build path graph
  // when the flag is off; when on, fail closed (no seed metadata for unpublished).
  try {
    const { getProductBySlugFromDatabase } = await import(
      "@/lib/catalog/server-catalog"
    );
    return await getProductBySlugFromDatabase(slug, {
      includeUnpublished: false,
    });
  } catch {
    // Misconfigured flag or query failure: do not invent seed metadata as Neon.
    return undefined;
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const product = await resolveMetadataProduct(slug);
  if (!product) {
    return { title: "Product not found" };
  }
  return {
    title: product.name,
    description: product.description,
    openGraph: {
      title: `${product.name} · ${STORE_NAME}`,
      description: product.description,
      images: product.images[0] ? [{ url: product.images[0] }] : undefined,
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  return <ProductDetail slug={slug} />;
}
